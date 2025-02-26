# Cosmos Wallet and Transaction CLI Utility

This project generates Cosmos accounts, builds, and signs transactions using Cosmos SDK libraries. It utilizes `@cosmjs/proto-signing`, `@cosmjs/crypto`, and `@cosmjs/stargate` to interact with Cosmos-based blockchains.

## Features

- **Wallet Generation:**  
  Generate a new Cosmos wallet from a randomly generated mnemonic.

- **Transaction Building:**  
  Construct transaction payloads to send tokens from one address to another.

- **Transaction Signing:**  
  Sign transactions using a provided mnemonic, with the sender's address automatically derived from the mnemonic.

- **CLI Interface:**  
  Use simple terminal commands to generate wallets and sign transactions.

## Prerequisites

- **Node.js:** Version 14 or later (LTS recommended)
- **pnpm:** Comes with Node.js (or you can use Yarn, Npm)

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/oliybeye/republic-cosmos.git
   cd republic-cosmos/
   ```

2. **Install Dependencies:**

    ```bash
    pnpm install
    ```

3. **Generate a new wallet**
    ```bash
    pnpm start generate
    ```

4. **Sign a Transaction**

    Note: The transaction signing will fail if the sender is not deployed or does not exist on the chain. I attempted to verify this on the testnet but was unsuccessful in obtaining testnet funds.

    ```bash
    pnpm start signTx "<your-mnemonic>" <recipientAddress>
    ```

5. **Test**
    ```bash
    pnpm test
    ```