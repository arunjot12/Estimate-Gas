const { ethers } = require("ethers");

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    console.log("🔍 Checking Network Parameters...\n");

    try {
        const block = await provider.getBlock("latest");
        console.log(`📦 Latest Block: ${block.number}`);
        console.log(`⛽ Block Gas Limit: ${block.gasLimit.toString()}`);
        console.log(`⛽ Block Gas Used: ${block.gasUsed.toString()}`);

        const feeData = await provider.getFeeData();
        console.log(`\n💰 Fee Data:`);
        console.log(`   Gas Price: ${feeData.gasPrice ? feeData.gasPrice.toString() : 'null'}`);
        console.log(`   Max Fee Per Gas: ${feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : 'null'}`);
        console.log(`   Max Priority Fee: ${feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : 'null'}`);

        // Try to estimate gas for a simple transfer
        const alice = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
        const recipient = "0x1234567890123456789012345678901234567890";

        console.log(`\n📊 Estimating Gas for Transfer...`);
        const gasEstimate = await provider.estimateGas({
            from: alice,
            to: recipient,
            value: ethers.parseEther("0.1")
        });
        console.log(`   Estimated Gas: ${gasEstimate.toString()}`);

        // Check if estimate exceeds block limit
        if (gasEstimate > block.gasLimit) {
            console.log(`\n⚠️  WARNING: Gas estimate (${gasEstimate}) EXCEEDS block gas limit (${block.gasLimit})!`);
            console.log(`   This transaction CANNOT be mined in a single block!`);
        } else {
            console.log(`\n✅ Gas estimate is within block limit`);
        }

    } catch (error) {
        console.error("❌ Failed:", error.message);
    }
}

main();
