import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Bip39, EnglishMnemonic, Slip10, Slip10Curve, stringToPath } from "@cosmjs/crypto";
import { Buffer } from "buffer";

/** 
 * The default Cosmos HD derivation path for the first account.
 */
const COSMOS_HD_PATH = stringToPath("m/44'/118'/0'/0/0");

/**
 * Generates a Cosmos account from a given mnemonic seed phrase.
 *
 * @param mnemonic - A valid BIP39 mnemonic phrase.
 * @returns An object containing the original mnemonic, the Cosmos address, and the private key in hexadecimal format.
 * @throws Will throw an error if the mnemonic is invalid or if private key generation fails.
 */
export async function generateCosmosAccountFromSeed(mnemonic: string) {
  if (!mnemonic || typeof mnemonic !== "string" || mnemonic.trim() === "") {
    throw new Error("Invalid mnemonic provided.");
  }

  try {
    // Convert mnemonic to seed using the English wordlist.
    const englishMnemonic = new EnglishMnemonic(mnemonic);
    const seed = await Bip39.mnemonicToSeed(englishMnemonic);

    // Derive the master key using the Cosmos HD path.
    const masterKey = Slip10.derivePath(Slip10Curve.Secp256k1, seed, COSMOS_HD_PATH);
    const privateKey = masterKey.privkey;
    if (!privateKey) {
      throw new Error("Failed to generate private key.");
    }

    // Create a wallet from the derived private key.
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, "cosmos");
    const [account] = await wallet.getAccounts();

    return {
      mnemonic,
      address: account.address,
      privateKey: Buffer.from(privateKey).toString("hex"),
    };
  } catch (error: any) {
    throw new Error(`Error generating Cosmos account: ${error.message}`);
  }
}
