const { ethers } = require("ethers");

async function main() {
    const RPC_URL = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Alice address
    const alice = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    console.log("🔍 Probing EVM State...");

    // 1. Chain ID
    try {
        const net = await provider.getNetwork();
        console.log(`1️⃣  Network Chain ID: ${net.chainId}`);
    } catch (e) {
        console.log("1️⃣  Failed to get network:", e.message);
    }

    // 2. Balance
    try {
        const bal = await provider.getBalance(alice);
        console.log(`2️⃣  Alice Balance: ${ethers.formatEther(bal)} REEF`);
    } catch (e) {
        console.log("2️⃣  Failed to get balance:", e.message);
    }

    // 3. Get Code (Precompile 1 - Recover)
    try {
        const code = await provider.getCode("0x0000000000000000000000000000000000000001");
        console.log(`3️⃣  Precompile 0x01 Code (Expect 0x): ${code}`);
    } catch (e) {
        console.log("3️⃣  Failed to get code:", e.message);
    }

    // 4. Identity Precompile Call (0x04)
    // Input: 0xDEADBEEF -> Output: 0xDEADBEEF
    try {
        const input = "0xdeadbeef";
        const result = await provider.call({
            to: "0x0000000000000000000000000000000000000004",
            data: input
        });
        console.log(`4️⃣  Identity Precompile Call: Input=${input}, Output=${result}`);
        if (result.toLowerCase() === input.toLowerCase()) console.log("   ✅ EVM Execution seems working!");
        else console.log("   ❌ EVM Execution returned unexpected result");
    } catch (e) {
        console.log("4️⃣  Identity Precompile Failed:", e.message);
    }

    // 5. Transfer Simulation Variants
    try {
        console.log("5️⃣a. Transfer (Value: 0, Gas: 21000)...");
        const res1 = await provider.call({
            from: alice,
            to: alice,
            value: 0,
            gasLimit: 21000
        });
        console.log(`   ✅ Success (Result: ${res1})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    try {
        console.log("5️⃣b. Transfer (Value: 0, Gas: 100000)...");
        const res2 = await provider.call({
            from: alice,
            to: alice,
            value: 0,
            gasLimit: 100000
        });
        console.log(`   ✅ Success (Result: ${res2})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    try {
        console.log("5️⃣c. Transfer (Value: 1, Gas: 100000)...");
        const res3 = await provider.call({
            from: alice,
            to: alice, // Self-transfer
            value: 1,
            gasLimit: 100000
        });
        console.log(`   ✅ Success (Result: ${res3})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    // 6. Identity Call FROM Alice
    try {
        console.log("6️⃣  Identity Call FROM Alice...");
        const res = await provider.call({
            from: alice,
            to: "0x0000000000000000000000000000000000000004",
            data: "0xdeadbeef",
            gasLimit: 100000
        });
        console.log(`   ✅ Success (Result: ${res})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    // 7. Identity Call FROM Random
    try {
        console.log("7️⃣  Identity Call FROM Random Address...");
        const randomAddr = ethers.Wallet.createRandom().address;
        const res = await provider.call({
            from: randomAddr,
            to: "0x0000000000000000000000000000000000000004",
            data: "0xdeadbeef",
            gasLimit: 100000
        });
        console.log(`   ✅ Success (Result: ${res})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }
    // 8. Estimate Gas Identity Call (Anonymous)
    try {
        console.log("8️⃣  Estimate Gas Identity Call (Anonymous)...");
        const gas = await provider.estimateGas({
            to: "0x0000000000000000000000000000000000000004",
            data: "0xdeadbeef"
        });
        console.log(`   ✅ Success (Gas: ${gas})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    // 9. Estimate Gas Identity Call (From Alice)
    try {
        console.log("9️⃣  Estimate Gas Identity Call (From Alice)...");
        const gas = await provider.estimateGas({
            from: alice,
            to: "0x0000000000000000000000000000000000000004",
            data: "0xdeadbeef"
        });
        console.log(`   ✅ Success (Gas: ${gas})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }
    // 10. Estimate Gas Transfer (From Alice)
    try {
        console.log("🔟 Estimate Gas Transfer (From Alice)...");
        const gas = await provider.estimateGas({
            from: alice,
            to: alice,
            value: 1
        });
        console.log(`   ✅ Success (Gas: ${gas})`);
    } catch (e) {
        console.log(`   ❌ Failed: ${e.shortMessage || e.message}`);
    }

    // 11. Get Block Info (Gas Limit)
    try {
        const block = await provider.getBlock("latest");
        console.log(`1️⃣1️⃣ Block Gas Limit: ${block.gasLimit}`);
    } catch (e) {
        console.log("   ❌ Failed to get block:", e.message);
    }
}

main();
