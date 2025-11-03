// Starts an Anvil instance for local mainnet forking.
// You can also run anvil yourself; this helper just shells out with sane defaults.
const { spawn } = require('child_process');

const forkUrl = process.env.ANVIL_FORK_URL || process.env.ALCHEMY_API_KEY && `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
if (!forkUrl) {
  console.error('Set ANVIL_FORK_URL or ALCHEMY_API_KEY to start forked Anvil.');
  process.exit(1);
}

const args = ['--fork-url', forkUrl, '--silent'];
console.log('Starting anvil with', args.join(' '));
const p = spawn('anvil', args, { stdio: 'inherit' });

p.on('exit', (code) => process.exit(code || 0));
