import { buildTx, signTx } from './transaction';
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, coins } from "@cosmjs/stargate";

// Mock dependencies
jest.mock('@cosmjs/proto-signing', () => ({
  DirectSecp256k1HdWallet: {
    fromMnemonic: jest.fn(),
  },
}));

jest.mock('@cosmjs/stargate', () => ({
  SigningStargateClient: {
    connectWithSigner: jest.fn(),
  },
  coins: jest.fn((amount, denom) => [{ amount: amount.toString(), denom }]),
}));

describe('buildTx', () => {
  it('should build a transaction object correctly', () => {
    const senderAddress = 'cosmos1sender';
    const recipientAddress = 'cosmos1recipient';
    const amount = '100';
    const denom = 'uatom';
    const gasLimit = 200000;
    const memo = 'Test memo';

    const expectedTx = {
      msgs: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: senderAddress,
            toAddress: recipientAddress,
            amount: coins(Number(amount), denom),
          },
        },
      ],
      fee: {
        amount: coins(5000, denom),
        gas: gasLimit.toString(),
      },
      memo,
    };

    const tx = buildTx(senderAddress, recipientAddress, amount, denom, gasLimit, memo);

    expect(tx).toEqual(expectedTx);
  });

  it('should build a transaction object with default memo', () => {
    const senderAddress = 'cosmos1sender';
    const recipientAddress = 'cosmos1recipient';
    const amount = '100';
    const denom = 'uatom';
    const gasLimit = 200000;

    const expectedTx = {
      msgs: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: senderAddress,
            toAddress: recipientAddress,
            amount: coins(Number(amount), denom),
          },
        },
      ],
      fee: {
        amount: coins(5000, denom),
        gas: gasLimit.toString(),
      },
      memo: '',
    };

    const tx = buildTx(senderAddress, recipientAddress, amount, denom, gasLimit);

    expect(tx).toEqual(expectedTx);
  });
});

describe('signTx', () => {
  const rpcEndpoint = 'https://rpc.cosmos.network';
  const mnemonic = 'test mnemonic phrase';

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign a transaction successfully', async () => {
    const tx = {
      msgs: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: 'cosmos1sender',
            toAddress: 'cosmos1recipient',
            amount: coins(100, 'uatom'),
          },
        },
      ],
      fee: {
        amount: coins(5000, 'uatom'),
        gas: '200000',
      },
      memo: 'Test memo',
    };

    const walletMock = {
      getAccounts: jest.fn().mockResolvedValue([{ address: 'cosmos1sender' }]),
    };

    // Client mock with disconnect
    const clientMock = {
      sign: jest.fn().mockResolvedValue({
        txResponse: {
          code: 0,
          txhash: 'sampleTxHash',
          rawLog: 'sample log',
        },
      }),
      disconnect: jest.fn(),
    };

    (DirectSecp256k1HdWallet.fromMnemonic as jest.Mock).mockResolvedValue(walletMock);
    (SigningStargateClient.connectWithSigner as jest.Mock).mockResolvedValue(clientMock);

    const signedTx = await signTx(mnemonic, tx, rpcEndpoint);

    expect(signedTx).toEqual({
      txResponse: {
        code: 0,
        txhash: 'sampleTxHash',
        rawLog: 'sample log',
      },
    });
    expect(DirectSecp256k1HdWallet.fromMnemonic).toHaveBeenCalledWith(
      mnemonic, { hdPaths: [expect.anything()], prefix: "cosmos" }
    );
    expect(SigningStargateClient.connectWithSigner).toHaveBeenCalledWith(rpcEndpoint, walletMock);
    expect(clientMock.sign).toHaveBeenCalledWith('cosmos1sender', tx.msgs, tx.fee, tx.memo);
    expect(clientMock.disconnect).toHaveBeenCalled();
  });

  it('should throw an error if signing fails', async () => {
    const tx = {
      msgs: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: 'cosmos1sender',
            toAddress: 'cosmos1recipient',
            amount: coins(100, 'uatom'),
          },
        },
      ],
      fee: {
        amount: coins(5000, 'uatom'),
        gas: '200000',
      },
      memo: 'Test memo',
    };

    const walletMock = {
      getAccounts: jest.fn().mockResolvedValue([{ address: 'cosmos1sender' }]),
    };

    // Client mock with disconnect
    const clientMock = {
      sign: jest.fn().mockRejectedValue(new Error('Sign Error')),
      disconnect: jest.fn(),
    };

    (DirectSecp256k1HdWallet.fromMnemonic as jest.Mock).mockResolvedValue(walletMock);
    (SigningStargateClient.connectWithSigner as jest.Mock).mockResolvedValue(clientMock);

    await expect(signTx(mnemonic, tx, rpcEndpoint)).rejects.toThrow('Sign Error');
    expect(clientMock.disconnect).toHaveBeenCalled();
  });
});
