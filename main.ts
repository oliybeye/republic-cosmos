import { Bip39, Random } from "@cosmjs/crypto";
import { generateCosmosAccountFromSeed } from "./wallet";
import { buildTx, signTx } from "./transaction";

/**
 * Generates a new wallet (and mnemonic) and prints the account details.
 */
async function generateWallet(): Promise<void> {
  // Generate a new mnemonic
  const mnemonic = Bip39.encode(Random.getBytes(32)).toString();
  const account = await generateCosmosAccountFromSeed(mnemonic);
  console.log("Generated Account:", account);
}

/**
 * Builds and signs a transaction using the provided mnemonic and recipient address.
 * The sender's address is derived from the mnemonic.
 *
 * @param mnemonic - The mnemonic used for signing.
 * @param recipientAddress - The recipient address for the transaction.
 */
async function signTransaction(mnemonic: string, recipientAddress: string): Promise<void> {
  const account = await generateCosmosAccountFromSeed(mnemonic);
  const senderAddress = account.address;

  const amount = "1000";
  const denom = "uatom";
  const gasLimit = 200000;
  const memo = "Test Transaction";

  // Build tx to be signed
  const tx = buildTx(senderAddress, recipientAddress, amount, denom, gasLimit, memo);

  const rpcEndpoint = "https://cosmos-rpc.publicnode.com:443";

  try {
    const signedTx = await signTx(mnemonic, tx, rpcEndpoint);
    console.log("Signed Transaction:", signedTx);
  } catch (error) {
    console.error("Error signing transaction:", error);
  }
}

/**
 * Main function to process command-line arguments and execute commands.
 *
 * Expected usage:
 *   node <script> generate
 *   node <script> signTx <mnemonic> <recipientAddress>
 *
 * @param args - Command-line arguments (excluding node and script path).
 */
async function main(args: string[]): Promise<void> {
  const cmd = args[0];
  switch (cmd) {
    case "generate":
      await generateWallet();
      break;
    case "signTx":
      if (args.length < 3) {
        console.error("Usage: signTx <mnemonic> <recipientAddress>");
        process.exit(1);
      }
      const mnemonic = args[1];
      const recipientAddress = args[2];
      await signTransaction(mnemonic, recipientAddress);
      break;
    default:
      console.error("Unknown command. Use 'generate' or 'signTx'.");
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error("Error in main:", error);
});
