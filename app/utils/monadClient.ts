// app/utils/monadClient.ts
import Web3 from "web3";

const rpcUrl = process.env.MONAD_RPC_URL;
if (!rpcUrl) throw new Error("MONAD_RPC_URL not set in .env.local");

export const web3 = new Web3(rpcUrl);
