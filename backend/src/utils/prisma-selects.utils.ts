import { Prisma } from '@prisma';

const userSelectBasic = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

const userSelectFull = {
  ...userSelectBasic,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export { userSelectFull, userSelectBasic };
