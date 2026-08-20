// lib/sendSWT.js
import tronWeb from './tronweb.js';

const SWT_CONTRACT = process.env.SWT_CONTRACT;

export async function sendSWT(toAddress, amountSWT) {
  const contract = await tronWeb.contract().at(SWT_CONTRACT);

  const amount = BigInt(Math.round(parseFloat(amountSWT) * 1e6)); // 6 decimals

  const tx = await contract.transfer(toAddress, amount).send({
    feeLimit: 100_000_000,
  });

  console.log('SWT sent tx:', tx);
  return tx;
}

