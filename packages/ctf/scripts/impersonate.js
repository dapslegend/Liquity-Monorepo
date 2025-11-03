require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const acct = process.env.IMPERSONATE;
  if (!acct) throw new Error('Set IMPERSONATE=0x...');
  const target = process.env.TARGET; // optional: fund this address
  const fundWei = process.env.FUND_WEI || '0';

  await ethers.provider.send('hardhat_impersonateAccount', [acct]);
  const signer = await ethers.provider.getSigner(acct);
  console.log('Impersonating', acct);

  if (target && fundWei !== '0') {
    const tx = await signer.sendTransaction({ to: target, value: ethers.BigNumber.from(fundWei) });
    await tx.wait();
    console.log(`Funded ${target} with ${fundWei} wei from ${acct}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
