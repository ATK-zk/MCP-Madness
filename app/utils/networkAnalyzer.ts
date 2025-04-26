// app/utils/networkAnalyzer.ts
import axios from "axios";

const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";

export async function analyzeNetwork() {
  try {
    // เรียก block number
    const blockResp = await axios.post(MONAD_RPC_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: []
    });

    const blockNumberHex: string = blockResp.data.result;
    const blockNumber = parseInt(blockNumberHex, 16); // แปลงจาก hex เป็น int

    // เรียก gas price
    const gasResp = await axios.post(MONAD_RPC_URL, {
      jsonrpc: "2.0",
      id: 2,
      method: "eth_gasPrice",
      params: []
    });

    const gasPriceHex: string = gasResp.data.result;
    const gasPrice = BigInt(gasPriceHex).toString(); // เป็น string ของ wei

    return {
      blockNumber,
      gasPrice
    };
  } catch (error) {
    console.error("Error fetching from Monad RPC", error);
    throw new Error("Failed to fetch network data");
  }
}

