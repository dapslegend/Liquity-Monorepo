require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const { addresses } = require('../config/liquity.mainnet.addresses.json');

  // Target main pools with ETH balances
  const targetKeys = (process.env.MONITOR_TARGETS || 'activePool,stabilityPool,defaultPool,collSurplusPool,gasPool')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const targets = targetKeys.map((k) => addresses[k]).filter(Boolean);
  if (!targets.length) throw new Error('No targets resolved from config');

  const minLossEth = process.env.MIN_LOSS_ETH || '10';
  const minLossWei = ethers.utils.parseEther(minLossEth);
  const minGainEth = process.env.MIN_GAIN_ETH || '1';
  const minGainWei = ethers.utils.parseEther(minGainEth);
  const drainAll = (process.env.DRAIN_ALL || 'true').toLowerCase() === 'true';

  const flag = process.env.CTF_FLAG || 'LQTY{example-flag-change-me}';

  const Monitor = await ethers.getContractFactory('CTFMonitor');
  const monitor = await Monitor.deploy(targets, minLossWei.toString(), minGainWei.toString(), drainAll, flag);
  await monitor.deployed();

  console.log('CTFMonitor deployed at', monitor.address);
  console.log('Targets:', targets);
  console.log('minLossEth:', minLossEth, 'minGainEth:', minGainEth, 'drainAll:', drainAll);
  console.log('flagHash:', await monitor.flagHash());

  // Auto-enroll the first signer as participant if AUTO_ENROLL=true
  if ((process.env.AUTO_ENROLL || 'true').toLowerCase() === 'true') {
    const [me] = await ethers.getSigners();
    const tx = await monitor.connect(me).enroll();
    await tx.wait();
    console.log('Enrolled participant', me.address);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
