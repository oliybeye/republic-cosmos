import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, coins, StdFee } from "@cosmjs/stargate";
import { stringToPath } from "@cosmjs/crypto";

export interface Tx {
  msgs: any[];
  fee: StdFee;
  memo: string;
}

/**
 * Constructs a transaction object.
 *
 * @param senderAddress - The sender's address.
 * @param recipientAddress - The recipient's address.
 * @param amount - The amount to send as a string.
 * @param denom - The denomination of the token.
 * @param gasLimit - The gas limit for the transaction.
 * @param memo - Optional memo for the transaction.
 * @param gasPrice - Gas price per unit (default is 0.025).
 * @returns A transaction object.
 */
export function buildTx(
  senderAddress: string,
  recipientAddress: string,
  amount: string,
  denom: string,
  gasLimit: number,
  memo: string = "",
  gasPrice: number = 0.025
): Tx {
  // Validate the amount.
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid amount provided.");
  }

  // Validate the gas limit.
  if (gasLimit <= 0) {
    throw new Error("Gas limit must be a positive number.");
  }

  const sendAmount = coins(numericAmount, denom);

  // Dynamically calculate fee using the provided gasPrice.
  const feeCoinAmount = Math.ceil(gasLimit * gasPrice);
  const feeAmount = coins(feeCoinAmount, denom);

  const tx: Tx = {
    msgs: [
      {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: senderAddress,
          toAddress: recipientAddress,
          amount: sendAmount,
        },
      },
    ],
    fee: {
      amount: feeAmount,
      gas: gasLimit.toString(),
    },
    memo,
  };

  return tx;
}

/**
 * Signs a transaction using the provided mnemonic and RPC endpoint.
 *
 * @param mnemonic - The mnemonic phrase to generate the wallet.
 * @param tx - The transaction object to be signed.
 * @param rpcEndpoint - The RPC endpoint URL.
 * @returns The signed transaction.
 */
export async function signTx(
  mnemonic: string,
  tx: Tx,
  rpcEndpoint: string
) {
  let client;
  try {
    // Generate wallet from mnemonic.
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
      prefix: "cosmos",
    });
    const [account] = await wallet.getAccounts();

    // Create Stargate client.
    client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    // Sign the transaction.
    const signedTx = await client.sign(account.address, tx.msgs, tx.fee, tx.memo);
    return signedTx;
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
