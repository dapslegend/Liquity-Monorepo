const hre = require('hardhat');
const { ethers } = hre;

const TARGETS = [
  'activePool',
  'stabilityPool',
  'defaultPool',
  'collSurplusPool',
  'gasPool'
];

async function setBalance(addr, ether) {
  const value = ethers.utils.hexlify(ethers.utils.parseEther(ether));
  await ethers.provider.send('hardhat_setBalance', [addr, value]);
}

async function main() {
  const ether = process.env.POOL_ETH || '1000';
  const { addresses } = require('../config/liquity.mainnet.addresses.json');

  for (const key of TARGETS) {
    const addr = addresses[key];
    if (!addr) continue;
    await setBalance(addr, ether);
    const bal = await ethers.provider.getBalance(addr);
    console.log(`${key} ${addr} -> ${ethers.utils.formatEther(bal)} ETH`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
