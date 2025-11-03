require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const addr = process.env.MONITOR_ADDR;
  if (!addr) throw new Error('Set MONITOR_ADDR to the deployed CTFMonitor address');

  const mon = await ethers.getContractAt('CTFMonitor', addr);
  const [loss,,allDrained] = await mon.currentLossWei();
  console.log('Current observed loss (wei):', loss.toString(), 'drainedAll:', allDrained);

  console.log('Calling checkAndReveal...');
  const tx = await mon.checkAndReveal();
  const receipt = await tx.wait();
  for (const log of receipt.logs) {
    try {
      const parsed = mon.interface.parseLog(log);
      if (parsed && parsed.name === 'CTF_FLAG') {
        console.log('FLAG EVENT:', parsed.args.flag);
      }
    } catch {}
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
