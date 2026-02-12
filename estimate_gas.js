const { ethers } = require("ethers");

async function main() {
    // Configuration
    const RPC_URL = "http://127.0.0.1:8545"; // Default Reef/Frontier RPC port, could be 9933
    const CURRENT_RATIO = 9000;
    const TARGET_GAS = 50000;

    // -------------------------------------------------------------------------------- //
    // 📝 PASTE YOUR FAILING TRANSACTION DATA HERE                                      //
    // -------------------------------------------------------------------------------- //
    const transaction = {
        // to: "0x...", 
        // data: "0x...",
        // value: ethers.parseEther("0"), 

        // Example: a simple transfer to self (replace with your actual failing call)
        // We will default to sending to SELF (Alice) to ensure a valid base case.
        to: "0x6f6e071e053358055e8dfa856037c0f4ff00c315",
        value: 0,

        // ⚠️ DEBUG: Standard gas limit for a simple transfer
        gasLimit: 1_000_000,

        // ⚠️ IMPORTANT: Set a valid sender address with sufficient funds
        from: ethers.getAddress("0x6f6e071e053358055e8dfa856037c0f4ff00c315"), // Default Alice EVM address for local dev (lowercased)

        // Force Legacy Transaction
        type: 0
    };
    // -------------------------------------------------------------------------------- //

    console.log(`🔌 Connecting to ${RPC_URL}...`);
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log(`🔗 Connected to chain ID: ${network.chainId}`);

        // Fetch Gas Price for legacy tx
        const feeData = await provider.getFeeData();
        // Ensure min gas price of 1 gwei to avoid spam filters
        const minGasPrice = ethers.parseUnits("1", "gwei");
        transaction.gasPrice = feeData.gasPrice > minGasPrice ? feeData.gasPrice : minGasPrice;

        console.log(`⛽ Gas Price: ${ethers.formatUnits(transaction.gasPrice, "gwei")} gwei`);

        // 0. Check Block Gas Limit
        const block = await provider.getBlock("latest");
        if (block) {
            console.log(`🧱 Latest Block Gas Limit: ${block.gasLimit}`);
            if (BigInt(transaction.gasLimit) > block.gasLimit) {
                console.warn(`⚠️ WARNING: Your gasLimit (${transaction.gasLimit}) exceeds the block gas limit (${block.gasLimit}). This might cause immediate failure.`);
            }
        }
        // 1. Check Balance
        if (transaction.from) {
            const balance = await provider.getBalance(transaction.from);
            console.log(`💰 Balance of ${transaction.from}: ${ethers.formatEther(balance)} REEF`);
            if (balance === 0n) {
                console.warn("⚠️ WARNING: Sender has 0 balance. Gas estimation may fail.");
            }
        }

        // 2. Try eth_call (Simulation) first to catch reverts with reason
        console.log("🔍 Simulating transaction (eth_call)...");
        try {
            const result = await provider.call(transaction);
            console.log("✅ Simulation successful:", result);
        } catch (callError) {
            console.error("❌ Simulation Reverted:", callError.reason || callError.message);
            if (callError.data) {
                console.error("   Revert Data:", callError.data);
            }
            // If simulation fails, estimation will likely fail too, but we proceed anyway debugging
        }

        // 3. Estimate Gas
        console.log("🚀 Sending eth_estimateGas with high gas limit...");
        const gasEstimate = await provider.estimateGas(transaction);

        console.log(`\n✅ Gas Estimate Successful: ${gasEstimate.toString()}`);

        // Calculate new Ratio
        // NewRatio = OldRatio * (EstimatedGas / 50000)
        const estimateNumber = Number(gasEstimate);
        const newRatio = Math.round(CURRENT_RATIO * (estimateNumber / TARGET_GAS));

        console.log("\n📊 Analysis & Recommendation:");
        console.log(`   - Current Ratio: ${CURRENT_RATIO}`);
        console.log(`   - Target Gas:    ${TARGET_GAS}`);
        console.log(`   - Est. Actual:   ${estimateNumber}`);
        console.log(`\n💡 SUGGESTED CHANGE:`);
        console.log(`   Update 'RATIO' in 'runtime/common/src/lib.rs':`);
        console.log(`   --------------------------------------------`);
        console.log(`   pub const RATIO: u64 = ${newRatio};`);
        console.log(`   --------------------------------------------`);

    } catch (error) {
        console.error("\n❌ Gas Estimation Failed:");

        if (error.info && error.info.error) {
            console.error("   RPC Error Code:", error.info.error.code);
            console.error("   RPC Error Message:", error.info.error.message);
            if (error.info.error.data) {
                console.error("   RPC Error Data:", error.info.error.data);
            }
        } else {
            console.error("   Error:", error.message);
        }

        console.log("\n💡 Troubleshooting:");
        console.log("   - Check if the 'from' address has funds (REEF).");
        console.log("   - Ensure the transaction logic doesn't revert (e.g., check requires in contract).");
        console.log("   - Verify allow/block list configuration on the node.");
        console.log("   - 'Invalid call' often means the transaction failed execution check (e.g. fees, signature, or revert).");
    }
}

main();
