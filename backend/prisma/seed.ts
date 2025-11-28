import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Operation, OPERATION_TYPE } from '@prisma';
import { hashSync } from 'bcrypt';

import CONFIG from '@/apps/config';
import prisma from '@/apps/prisma';
import { calculateOperation } from '@/modules/operation/operation.service';

interface SeedData {
  users: Array<{ name: string; email: string }>;
  discussions: Array<{ title: string; startingValue: number; createdByIndex: number }>;
  operations: Array<{
    discussionIndex: number;
    parentOperationIndex: number | null;
    operationType: keyof typeof OPERATION_TYPE;
    value: number;
    totals: number;
    createdByIndex: number;
  }>;
}

/**
 * Seed script to populate database with demo data
 * - Reads data from seed-data.json
 * - Creates demo users with secure passwords from env
 * - Creates discussions and operations from JSON data
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  // Load seed data from JSON
  const seedDataPath = join(__dirname, 'seed-data.json');
  const seedData: SeedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));

  console.log('✅ Loaded seed data from JSON\n');

  // Hash the seed password from config
  const hashedPassword = hashSync(CONFIG.SEED_USER_PASSWORD, 10);

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.operation.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // Create demo users
  console.log('👥 Creating demo users...');
  const users = await Promise.all(
    seedData.users.map((userData) =>
      prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      })
    )
  );
  console.log('✅ Created', users.length, 'users\n');

  // Create discussions
  console.log('💬 Creating discussions...');
  const discussions = await Promise.all(
    seedData.discussions.map((discussionData) =>
      prisma.discussion.create({
        data: {
          title: discussionData.title,
          startingValue: discussionData.startingValue,
          createdBy: users[discussionData.createdByIndex].id,
        },
      })
    )
  );
  console.log('✅ Created', discussions.length, 'discussions\n');

  // Create operations
  console.log('🔢 Creating operations...');
  const operations: Operation[] = [];

  for (const operationData of seedData.operations) {
    // Calculate beforeValue from parent or starting value
    let beforeValue: number;
    if (operationData.parentOperationIndex === null) {
      // Root operation: beforeValue is the discussion's starting value
      beforeValue = discussions[operationData.discussionIndex].startingValue;
    } else {
      // Child operation: beforeValue is parent's afterValue
      beforeValue = operations[operationData.parentOperationIndex].afterValue;
    }

    // Calculate afterValue based on operation type
    // Calculate afterValue using shared service logic
    const afterValue = calculateOperation(
      beforeValue,
      operationData.operationType as OPERATION_TYPE,
      operationData.value
    );

    const operation = await prisma.operation.create({
      data: {
        discussionId: discussions[operationData.discussionIndex].id,
        parentId:
          operationData.parentOperationIndex === null
            ? null
            : operations[operationData.parentOperationIndex].id,
        title: `${operationData.operationType} ${operationData.value}`,
        operationType: OPERATION_TYPE[operationData.operationType],
        value: operationData.value,
        beforeValue,
        afterValue,
        createdBy: users[operationData.createdByIndex].id,
      },
    });
    operations.push(operation);
  }

  console.log('✅ Created', operations.length, 'operations\n');

  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   - Users:', users.length);
  console.log('   - Discussions:', discussions.length);
  console.log('   - Operations:', operations.length);
  console.log(`\n🔐 Demo user credentials:`);
  console.log(`   Email: alice@demo.com (or any demo user)`);
  console.log('   Password:', CONFIG.SEED_USER_PASSWORD);
}

main().catch((error) => {
  console.error('❌ Seed failed:');
  console.error(error);
  process.exit(1);
});
