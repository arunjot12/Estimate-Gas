const { ethers } = require("ethers");

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    // Standard Alice Mnemonic
    const mnemonic = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";

    const tests = [
        { name: "Legacy (EIP-155) - Chain ID 13939", chainId: 13939, type: 0, eip155: true },
        { name: "Legacy (EIP-155) - Chain ID 420420420", chainId: 420420420, type: 0, eip155: true },
        { name: "Legacy (No EIP-155) - Random Chain ID", chainId: null, type: 0, eip155: false }, // chainId null implies no replay protection specific chain
        { name: "EIP-1559 - Chain ID 13939", chainId: 13939, type: 2 },
        { name: "EIP-1559 - Chain ID 420420420", chainId: 420420420, type: 2 },
    ];

    console.log("🚀 Starting Brute-Force Transaction Testing...");

    for (const test of tests) {
        console.log(`\n---------------------------------------------------------`);
        console.log(`🧪 Testing: ${test.name}`);

        let provider;
        if (test.chainId) {
            provider = new ethers.JsonRpcProvider(RPC_URL, {
                chainId: test.chainId,
                name: 'custom'
            }, { staticNetwork: true });
        } else {
            // For No EIP-155, we just use standard provider but will construct tx manually if needed, 
            // but ethers v6 makes it hard to strictly disable EIP-155 if chain ID is known.
            // We'll simulate "Generic" by just connecting without forcing static network if chainId is null,
            // but realistically ethers will fetch the chainId from RPC (420420420).
            provider = new ethers.JsonRpcProvider(RPC_URL);
        }

        try {
            const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
            const nonce = await provider.getTransactionCount(wallet.address);
            const feeData = await provider.getFeeData();

            let tx = {
                to: wallet.address, // Self-transfer
                value: 0,
                gasLimit: 100000,
                nonce: nonce,
                type: test.type
            };

            if (test.type === 2) {
                // EIP-1559
                tx.maxPriorityFeePerGas = ethers.parseUnits("2.5", "gwei");
                tx.maxFeePerGas = (feeData.maxFeePerGas || ethers.parseUnits("10", "gwei")) * 2n;
            } else {
                // Legacy
                tx.gasPrice = (feeData.gasPrice || ethers.parseUnits("1", "gwei")) * 2n;
            }

            // Ethers v6 automatically handles serialization based on tx properties.
            // To force "No EIP-155" (old legacy), we would need to sign raw, but let's see if 
            // standard signing with the specific provider config works.

            console.log(`   Params: Nonce=${nonce}, GasPrice=${tx.gasPrice || tx.maxFeePerGas}`);

            const response = await wallet.sendTransaction(tx);
            console.log(`   ✅ SUCCESS! Hash: ${response.hash}`);
            // If one succeeds, we might want to stop, or keep going to see all valid ones.
            // console.log("   (Stopping tests on first success)");
            // break; 

        } catch (error) {
            console.log(`   ❌ FAILED`);
            console.log("   Full Error:", JSON.stringify(error, null, 2));
            if (error.info && error.info.error) {
                console.log(`   RPC Error: Code=${error.info.error.code}, Message="${error.info.error.message}"`);
                if (error.info.error.message.includes("Invalid Transaction")) {
                    // Try to decode if there's extra data, usually there isn't for 1010
                }
            } else if (error.code) {
                console.log(`   Error Code: ${error.code} - ${error.shortMessage}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
        }
    }
    console.log(`\n---------------------------------------------------------`);
    console.log("🏁 Testing Completed.");
}

main();
