// lib/tronweb.js
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_NODE,
  privateKey: process.env.TRON_PRIVATE_KEY,
});

export default tronWeb;

