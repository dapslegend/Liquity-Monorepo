require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const addr = process.env.MONITOR_ADDR;
  if (!addr) throw new Error('Set MONITOR_ADDR to the deployed CTFMonitor address');
  const mon = await ethers.getContractAt('CTFMonitor', addr);
  const [me] = await ethers.getSigners();
  const tx = await mon.connect(me).enroll();
  const rcpt = await tx.wait();
  console.log('Enrolled as participant', me.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
