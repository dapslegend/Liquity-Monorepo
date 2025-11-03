require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const target = process.env.TARGET;
  if (!target) throw new Error('TARGET is required');
  const data = process.env.DATA || '0x';
  const valueEth = process.env.VALUE_ETH || '0';
  const from = process.env.FROM; // optional fixed from address

  let signer;
  if (from) {
    await ethers.provider.send('hardhat_impersonateAccount', [from]);
    signer = await ethers.provider.getSigner(from);
  } else {
    [signer] = await ethers.getSigners();
  }

  const tx = await signer.sendTransaction({ to: target, data, value: ethers.utils.parseEther(valueEth) });
  const receipt = await tx.wait();
  console.log('sent tx', tx.hash, 'status', receipt.status);
}

main().catch((e) => { console.error(e); process.exit(1); });
