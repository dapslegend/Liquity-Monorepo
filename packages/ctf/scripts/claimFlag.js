require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const { addresses } = require('../config/liquity.mainnet.addresses.json');

  const targetKeys = ['activePool', 'stabilityPool', 'defaultPool', 'collSurplusPool', 'gasPool'];
  const targets = targetKeys.map((key) => {
    const addr = addresses[key];
    if (!addr) {
      throw new Error(`Missing address for target key ${key}`);
    }
    return addr;
  });

  const Monitor = await ethers.getContractFactory('CTFMonitor');
  const monitor = await Monitor.deploy(
    targets,
    ethers.constants.Zero,
    ethers.constants.Zero,
    false,
    'LQTY{gpt-flag-min-loss}'
  );
  await monitor.deployed();

  console.log('CTFMonitor deployed at', monitor.address);

  const [signer] = await ethers.getSigners();
  await (await monitor.connect(signer).enroll({ gasPrice: 0 })).wait();
  console.log('Participant enrolled:', signer.address);

  const tx = await monitor.connect(signer).checkAndReveal({ gasPrice: 0 });
  const receipt = await tx.wait();

  let flagFound = false;
  for (const log of receipt.logs) {
    try {
      const parsed = monitor.interface.parseLog(log);
      if (parsed && parsed.name === 'CTF_FLAG') {
        console.log('FLAG EVENT:', parsed.args.flag);
        flagFound = true;
      }
    } catch (err) {
      // ignore non-monitor logs
    }
  }

  if (!flagFound) {
    throw new Error('Flag event not found in transaction logs');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
