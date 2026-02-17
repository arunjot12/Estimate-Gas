const { ethers } = require("ethers");

async function main() {
    // Configuration
    const RPC_URL = "http://127.0.0.1:8545";
    const MNEMONIC = "bottom drive obey lake curtain smoke basket hold race lonely fit walk"; // Alice
    const RECIPIENT = "0x1234567890123456789012345678901234567890"; // Valid Ethereum address - change to your recipient
    const AMOUNT_TO_SEND = "10.00"; // REEF (reduced amount for testing)

    console.log(`🔌 Connecting to ${RPC_URL}`);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = ethers.Wallet.fromPhrase(MNEMONIC, provider);

    console.log(`👤 Sender: ${wallet.address}`);
    console.log(`🎯 Recipient: ${RECIPIENT}`);

    try {
        const balanceBefore = await provider.getBalance(wallet.address);
        console.log(`💰 Sender Balance: ${ethers.formatEther(balanceBefore)} REEF`);

        // First, estimate the gas required
        console.log(`📊 Estimating gas...`);
        const estimatedGas = await provider.estimateGas({
            from: wallet.address,
            to: RECIPIENT,
            value: ethers.parseEther(AMOUNT_TO_SEND)
        });
        console.log(`   Estimated Gas: ${estimatedGas.toString()}`);

        // Add 10% safety margin
        const gasLimit = (estimatedGas * 110n) / 100n;
        console.log(`   Gas Limit (with 10% margin): ${gasLimit.toString()}`);

        const tx = {
            to: RECIPIENT,
            value: ethers.parseEther(AMOUNT_TO_SEND),
            gasLimit: gasLimit,
        };

        console.log(`💸 Sending ${AMOUNT_TO_SEND} REEF...`);

        const response = await wallet.sendTransaction(tx);
        console.log(`✅ Transaction Sent! Hash: ${response.hash}`);

        console.log("⏳ Waiting for confirmation...");
        const receipt = await response.wait();

        console.log(`🎉 Transaction Mined in Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

        const balanceAfter = await provider.getBalance(wallet.address);
        console.log(`💰 New Balance: ${ethers.formatEther(balanceAfter)} REEF`);

    } catch (error) {
        console.error("❌ Transfer Failed:");
        if (error.info && error.info.error) {
            console.log("   RPC Error:", error.info.error);
        } else {
            console.log("   Error:", error.message);
        }
    }
}

main();
