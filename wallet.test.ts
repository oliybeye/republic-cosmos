import { generateCosmosAccountFromSeed } from "./wallet";
import { Bip39, Random, Slip10 } from "@cosmjs/crypto";

describe("wallet", () => {
  it("should generate a valid cosmos account from a mnemonic", async () => {
    const mnemonic = Bip39.encode(Random.getBytes(32)).toString();
    const account = await generateCosmosAccountFromSeed(mnemonic);
    const result = await generateCosmosAccountFromSeed(mnemonic);

    expect(result).toHaveProperty("mnemonic", mnemonic);
    expect(result).toHaveProperty("address", account.address);
    expect(result).toHaveProperty("privateKey");
  });

  it("should throw an error if invalid length of mneomic phrase is passed", async () => {
    const mnemonic = "test mnemonic phrase for cosmos account";
    await expect(generateCosmosAccountFromSeed(mnemonic)).rejects.toThrow(
      "Invalid word count in mnemonic (allowed: 12,15,18,21,24 got: 6)"
    );
  });

  it("should throw an error if private key is not generated", async () => {
    // valid mnemonic
    const mnemonic =
      "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region";

    jest
      .spyOn(Slip10, "derivePath")
      .mockReturnValueOnce({
        privkey: null,
        chainCode: Buffer.from("mockChainCode"),
      });

    // Call the function with a valid mnemonic
    await expect(generateCosmosAccountFromSeed(mnemonic)).rejects.toThrow(
      "Failed to generate private key"
    );
  });

  it("should recover wallet from a mnemonic", async () => {
    const expected = {
      mnemonic:
        "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region",
      address: "cosmos12sc4g8gf3v4szq88m5t6s65drtcgxt6nh8xd3c",
      privateKey:
        "bf98e2f91391811bc0785ae28e57a777e9d7960edfe647d0697a71b808a2e371",
    };
    const result = await generateCosmosAccountFromSeed(expected.mnemonic);

    expect(result).toEqual(expected);
  });
});
