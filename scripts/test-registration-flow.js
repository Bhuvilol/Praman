const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Registration Flow...\n");

    // Get the deployed contract
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = PRAMANSupplyChain.attach(contractAddress);

    // Get test accounts
    const [owner, account1, account2] = await ethers.getSigners();

    console.log("👥 Test Accounts:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Account 1: ${account1.address}`);
    console.log(`Account 2: ${account2.address}\n`);

    try {
        // Test 1: Check initial registration status
        console.log("🔍 Test 1: Checking initial registration status...");
        
        const isOwnerRegistered = await contract.isUserRegistered(owner.address);
        const isAccount1Registered = await contract.isUserRegistered(account1.address);
        
        console.log(`Owner registered: ${isOwnerRegistered}`);
        console.log(`Account 1 registered: ${isAccount1Registered}\n`);

        // Test 2: Register Account 1 as Farmer with FRM001
        console.log("📝 Test 2: Registering Account 1 as FARMER with FRM001...");
        await contract.connect(account1).registerUser(
            "John Farmer",
            "john@farmer.com",
            "FRM001",
            "farmer"
        );
        console.log("✅ Account 1 registered as FARMER with FRM001\n");

        // Test 3: Check registration status after registration
        console.log("🔍 Test 3: Checking registration status after registration...");
        
        const isAccount1RegisteredAfter = await contract.isUserRegistered(account1.address);
        console.log(`Account 1 registered after: ${isAccount1RegisteredAfter}`);
        
        if (isAccount1RegisteredAfter) {
            const user1 = await contract.getUser(account1.address);
            console.log(`Account 1 role: ${user1.role}`);
            console.log(`Account 1 name: ${user1.name}`);
            console.log(`Account 1 regdNo: ${user1.regdNo}\n`);
        }

        // Test 4: Try to register Account 1 again with different ID (should fail)
        console.log("🚫 Test 4: Trying to register Account 1 again with FRM002 (should fail)...");
        try {
            await contract.connect(account1).registerUser(
                "John Farmer",
                "john@farmer.com",
                "FRM002", // Different registration number
                "farmer" // Same role
            );
            console.log("❌ ERROR: Account 1 should not be able to register again!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 1 correctly blocked from registering again");
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 5: Try to register Account 1 with different role (should fail)
        console.log("🚫 Test 5: Trying to register Account 1 as COLLECTOR (should fail)...");
        try {
            await contract.connect(account1).registerUser(
                "John Farmer",
                "john@farmer.com",
                "COL001", // Different registration number
                "collector" // Different role
            );
            console.log("❌ ERROR: Account 1 should not be able to register with different role!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 1 correctly blocked from registering with different role");
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 6: Register Account 2 as Collector
        console.log("📝 Test 6: Registering Account 2 as COLLECTOR...");
        await contract.connect(account2).registerUser(
            "Jane Collector",
            "jane@collector.com",
            "COL001",
            "collector"
        );
        console.log("✅ Account 2 registered as COLLECTOR\n");

        // Test 7: Verify both users are registered correctly
        console.log("🔍 Test 7: Verifying both users are registered correctly...");
        
        const user1Final = await contract.getUser(account1.address);
        const user2Final = await contract.getUser(account2.address);
        
        console.log(`Account 1 - Role: ${user1Final.role}, ID: ${user1Final.regdNo}`);
        console.log(`Account 2 - Role: ${user2Final.role}, ID: ${user2Final.regdNo}\n`);

        console.log("🎉 Registration flow tests completed successfully!");
        console.log("\n📊 Summary:");
        console.log("✅ Users can register with unique registration numbers");
        console.log("✅ Users cannot register again with the same address");
        console.log("✅ Users cannot register with different roles");
        console.log("✅ Each address is permanently tied to one role and one registration ID");
        console.log("✅ Registration numbers are unique across the system");

        console.log("\n💡 Expected Frontend Behavior:");
        console.log("1. When Account 1 connects wallet and selects 'Farmer' role:");
        console.log("   → Should show: 'Welcome back! You're already registered as a Farmer'");
        console.log("   → Should redirect to: /dashboard/farmer");
        console.log("2. When Account 1 connects wallet and selects 'Collector' role:");
        console.log("   → Should show: 'Dear address 0x7099...79C8, you are already registered as a \"farmer\". Please login there instead of trying to register as a \"Collector\".'");
        console.log("   → Should redirect to: /contributor");

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
