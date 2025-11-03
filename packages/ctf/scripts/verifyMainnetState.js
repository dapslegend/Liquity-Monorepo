require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function codeSize(addr) {
  const code = await ethers.provider.getCode(addr);
  return (code.length - 2) / 2; // bytes
}

async function main() {
  const { addresses } = require('../config/liquity.mainnet.addresses.json');
  const report = {};

  for (const [name, addr] of Object.entries(addresses)) {
    const [sz, eth] = await Promise.all([
      codeSize(addr),
      ethers.provider.getBalance(addr)
    ]);
    report[name] = {
      address: addr,
      codeBytes: sz,
      ethWei: eth.toString()
    };
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
