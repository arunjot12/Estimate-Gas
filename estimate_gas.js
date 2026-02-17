const { ethers } = require("ethers");

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Alice Address (Sender)
    const sender = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const target = sender; // Self-transfer for baseline

    console.log(`🔌 Connecting to ${RPC_URL}`);
    console.log(`👤 Sender: ${sender}`);

    try {
        const network = await provider.getNetwork();
        console.log(`🔗 Chain ID: ${network.chainId}`);

        const balance = await provider.getBalance(sender);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} REEF`);

        // Create transaction object for estimation
        // IMPORTANT: Do NOT set gasPrice/maxFeePerGas for estimation on this node
        // as it seems to trigger validation errors. Let the node default.
        const transaction = {
            from: sender,
            to: target,
            value: 1, // 1 wei to trigger transfer logic
            data: "0x", // Empty data for transfer, or "0xdeadbeef" for intrinsic test
        };

        console.log("\n� Estimating Gas...");
        const estimatedGas = await provider.estimateGas(transaction);

        console.log(`✅ Gas Estimate: ${estimatedGas.toString()}`);

        // Analysis
        const TARGET_GAS = 21000n; // Standard EVM Transfer
        const currentGas = estimatedGas;

        // If current is huge (e.g. 1.3 Billion), and we want 21,000.
        // Ratio = Current / Target
        const ratio = currentGas / TARGET_GAS;

        console.log("\n🧮 Tuning Analysis:");
        console.log(`   Current Estimate: ${currentGas}`);
        console.log(`   Target Estimate : ${TARGET_GAS}`);
        console.log(`   Approximate Factor: ${ratio}`);

        console.log(`\n💡 To fix this, you need to adjust 'GasToWeight' or 'GasLimit' constants in the runtime.`);
        console.log(`   If your 'GasToWeight' is currently 1 (1 Gas = 1 Weight), check if 'WEIGHT_PER_SECOND' is calibrated correctly.`);
        console.log(`   Usually, 1 Gas should be significantly LESS than 1 Weight if Weight is picoseconds.`);
        console.log(`   However, if you see 1.3 Billion Gas, it means the NODE thinks the operation is very expensive.`);

    } catch (error) {
        console.error("❌ Estimation Failed:");
        if (error.info && error.info.error) {
            console.log("   RPC Error:", error.info.error);
        } else {
            console.log("   Error:", error.message);
        }
    }
}

main();
