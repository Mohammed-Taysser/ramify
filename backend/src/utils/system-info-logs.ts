import os from 'node:os';

import chalk from 'chalk';

import pkg from '../../package.json';

import CONFIG from '@/apps/config';

function logServerInfo(startTime: number) {
  const duration = Date.now() - startTime;
  const localIp = getLocalIp();
  const startedAt = new Date().toLocaleTimeString();

  const localUrl = `http://localhost:${CONFIG.PORT}/`;
  const networkUrl = `http://${localIp}:${CONFIG.PORT}/`;
  const docsUrl = `http://localhost:${CONFIG.PORT}/docs`;
  const healthUrl = `http://localhost:${CONFIG.PORT}/health`;

  const header = `${pkg.name.toUpperCase()} v${pkg.version} ready in ${duration} ms`;

  console.log('\n' + chalk.green.bold(header) + '\n');

  console.log(chalk.gray('🕒 Started at:'), chalk.white(startedAt));
  console.log(chalk.gray('🧩 Node:      '), chalk.white(process.version));
  console.log(
    chalk.gray('🖥️  Platform:  '),
    chalk.white(`${os.type()} ${os.arch()} (${os.platform()})`)
  );
  console.log(`🔧 ${chalk.gray('ENV:')}        ${chalk.white(CONFIG.NODE_ENV.toUpperCase())}`);
  console.log();

  console.log(chalk.green('➜') + '  Local:   ' + chalk.cyan(localUrl));
  console.log(chalk.yellow('➜') + '  Network: ' + chalk.white(networkUrl));
  console.log(chalk.gray('➜') + '  Docs:    ' + chalk.magenta(docsUrl));
  console.log(chalk.gray('➜') + '  Health:  ' + chalk.blue(healthUrl));
  console.log('\n' + chalk.gray('💡 Tip:'), chalk.white('Press Ctrl+C to stop the server.') + '\n');
}

function getLocalIp(): string {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export { logServerInfo };
