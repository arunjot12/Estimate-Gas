const { ethers } = require("ethers");

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Replace with a successful MetaMask transaction hash
    const TX_HASH = "PASTE_METAMASK_TX_HASH_HERE";

    console.log(`🔍 Inspecting Transaction: ${TX_HASH}`);

    try {
        const tx = await provider.getTransaction(TX_HASH);
        const receipt = await provider.getTransactionReceipt(TX_HASH);

        console.log("\n📄 Transaction Details:");
        console.log(JSON.stringify(tx, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));

        console.log("\n📋 Receipt:");
        console.log(JSON.stringify(receipt, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));

    } catch (error) {
        console.error("❌ Failed:", error.message);
    }
}

main();
