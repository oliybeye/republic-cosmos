import { SigningStargateClient } from "@cosmjs/stargate";
import { buildTx, signTx } from "./transaction";

// Helper method
function txRawToJson(signedTx) {
  return {
    bodyBytes: Buffer.from(signedTx.bodyBytes).toString("hex"),
    authInfoBytes: Buffer.from(signedTx.authInfoBytes).toString("hex"),
    signatures: signedTx.signatures.map((sig) =>
      Buffer.from(sig).toString("hex")
    ),
  };
}

const RPC_ENDPOINT = "https://cosmos-rpc.publicnode.com:443";
const MNEMONIC =
  "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region"; // Use a funded test wallet
describe("build and sign Tx", () => {
  const senderAddress = "cosmos12sc4g8gf3v4szq88m5t6s65drtcgxt6nh8xd3c";
  const recipient = "cosmos1xv3jy4xpkkd6m8n4pyv5t5snpq7g6z62l79rww";
  const amount = "3213123";
  const denom = "uatom";
  const gasLimit = 212;
  const memo = "hi";
  const gasPrice = 0.05;
  describe("buildTx", () => {
    it("should build a determined transaction", () => {
      const tx = buildTx(
        senderAddress,
        recipient,
        amount,
        denom,
        gasLimit,
        memo,
        gasPrice
      );

      expect(tx).toBeDefined();
      expect(tx.msgs.length).toBe(1);
      expect(tx.msgs[0].typeUrl).toBe("/cosmos.bank.v1beta1.MsgSend");
      expect(tx.msgs[0].value.fromAddress).toBe(senderAddress);
      expect(tx.msgs[0].value.toAddress).toBe(recipient);
      expect(tx.msgs[0].value.amount[0].denom).toBe(denom);
      expect(tx.msgs[0].value.amount[0].amount).toBe(amount);
      expect(tx.fee.amount[0].denom).toBe(denom);
      expect(tx.fee.amount[0].amount).toBe(
        Math.ceil(gasLimit * gasPrice).toString()
      );
      expect(tx.fee.gas).toBe(gasLimit.toString());
      expect(tx.memo).toBe(memo);
    });

    it("should throw an error for invalid amount", () => {
      expect(() =>
        buildTx(
          senderAddress,
          recipient,
          "-1000",
          denom,
          gasLimit,
          memo,
          gasPrice
        )
      ).toThrow("Invalid amount provided.");
    });

    it("should throw an error for zero or negative gas limit", () => {
      expect(() =>
        buildTx(senderAddress, recipient, amount, denom, -1, memo, gasPrice)
      ).toThrow("Gas limit must be a positive number.");
    });
  });

  describe("SignTx", () => {
    const unsignedTx = buildTx(
      senderAddress,
      recipient,
      amount,
      denom,
      gasLimit,
      memo,
      gasPrice
    );

    const expectedSignedTx = {
      bodyBytes: "0a90010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e6412700a2d636f736d6f73313273633467386766337634737a7138386d35743673363564727463677874366e683878643363122d636f736d6f73317876336a793478706b6b64366d386e34707976357435736e70713767367a36326c37397277771a100a057561746f6d12073332313331323312026869",
      authInfoBytes: "0a4e0a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2102a55d138f9daecc4328db3c5290ed1c9b96da59347837475c6347713d767c6f2912040a02080112100a0b0a057561746f6d1202313110d401",
      signatures: [
        "a52476dc796d085bd834de5b2ec27aebbe0eccc15eee77d7693efd58cb080dbb01d6b47ce6b97ffc189f19d852fe2098f25fc3c0f01e509a6ecbf0e4d544dad4",
      ],
    };

    beforeAll(() => {
      jest
        .spyOn(SigningStargateClient.prototype, "getSequence")
        .mockResolvedValue({ accountNumber: 1, sequence: 0 });
      jest
        .spyOn(SigningStargateClient.prototype, "getChainId")
        .mockResolvedValue("cosmos-test-chain");
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should build and sign a transaction", async () => {
      const signedTx = await signTx(MNEMONIC, unsignedTx, RPC_ENDPOINT);

      // Check that the transaction is built
      expect(signedTx).toBeDefined();
      expect(signedTx.authInfoBytes).toBeDefined();
      expect(signedTx.bodyBytes).toBeDefined();
      expect(signedTx.signatures.length).toBeGreaterThan(0);

      // Convert the TxRaw object to a JSON-friendly format
      const jsonTx = txRawToJson(signedTx);

      // Compare with the expected JSON representation
      expect(jsonTx).toEqual(expectedSignedTx);
    });
  });
});
