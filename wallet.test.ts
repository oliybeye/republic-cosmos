import { generateCosmosAccountFromSeed } from "./wallet";

describe("wallet", () => {
  it("should generate a valid cosmos account from a mnemonic", async () => {
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
