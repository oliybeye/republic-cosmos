import { signTx } from "./transaction";
import { coins } from "@cosmjs/stargate";

describe("signTx", () => {
  const rpcEndpoint = "https://cosmos-rpc.publicnode.com:443";

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it(`attempt to sign a tx for undeployed address`, async () => {
    const tx = {
      msgs: [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: "cosmos1sender",
            toAddress: "cosmos1recipient",
            amount: coins(100, "uatom"),
          },
        },
      ],
      fee: {
        amount: coins(5000, "uatom"),
        gas: "200000",
      },
      memo: "Test memo",
    };

    const mnemonic =
      "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region";

    const expectedError = `Account 'cosmos12sc4g8gf3v4szq88m5t6s65drtcgxt6nh8xd3c' does not exist on chain. Send some tokens there before trying to query sequence.`;
    // expect(await signTx(mnemonic, tx, rpcEndpoint)).rejects.toThrow(expectedError);
    await expect(signTx(mnemonic, tx, rpcEndpoint)).rejects.toThrow(expectedError);
  });
});
