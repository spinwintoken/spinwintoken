import tronWeb from './tronweb.js';

export async function sendSWT(toAddress, amountSWT) {
  const contractAddress = process.env.SWT_CONTRACT;

  const contract = await tronWeb.contract().at(contractAddress);

  const decimals = 6; // adjust if your token uses different decimals
  const rawAmount = tronWeb.toBigNumber(amountSWT).times(10 ** decimals);

  const tx = await contract.transfer(toAddress, rawAmount).send({
    feeLimit: 100_000_000,
  });

  return tx; // transaction ID
}
