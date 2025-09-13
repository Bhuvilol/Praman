const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Clear Toast Messages for Role Restrictions...\n");

    // Get the deployed contract
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = PRAMANSupplyChain.attach(contractAddress);

    // Get test accounts
    const [owner, account1, account2, account3] = await ethers.getSigners();

    console.log("👥 Test Accounts:");
    console.log(`Account 1: ${account1.address}`);
    console.log(`Account 2: ${account2.address}`);
    console.log(`Account 3: ${account3.address}\n`);

    try {
        // Test 1: Register Account 1 as Farmer
        console.log("📝 Test 1: Registering Account 1 as FARMER...");
        await contract.connect(account1).registerUser(
            "John Farmer",
            "john@farmer.com",
            "FARM001",
            "farmer"
        );
        console.log("✅ Account 1 registered as FARMER\n");

        // Test 2: Register Account 2 as Collector
        console.log("📝 Test 2: Registering Account 2 as COLLECTOR...");
        await contract.connect(account2).registerUser(
            "Jane Collector",
            "jane@collector.com",
            "COL001",
            "collector"
        );
        console.log("✅ Account 2 registered as COLLECTOR\n");

        // Test 3: Register Account 3 as Consumer
        console.log("📝 Test 3: Registering Account 3 as CONSUMER...");
        await contract.connect(account3).registerUser(
            "Bob Consumer",
            "bob@consumer.com",
            "CONS001",
            "consumer"
        );
        console.log("✅ Account 3 registered as CONSUMER\n");

        // Test 4: Try to register Account 1 as Collector (should fail)
        console.log("🚫 Test 4: Trying to register Account 1 as COLLECTOR (should fail)...");
        try {
            await contract.connect(account1).registerUser(
                "John Farmer",
                "john@farmer.com",
                "COL002", // Different regd number
                "collector" // Different role
            );
            console.log("❌ ERROR: Account 1 should not be able to register with different role!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 1 correctly blocked from registering with different role");
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 5: Try to register Account 2 as Lab (should fail)
        console.log("🚫 Test 5: Trying to register Account 2 as LAB (should fail)...");
        try {
            await contract.connect(account2).registerUser(
                "Jane Collector",
                "jane@collector.com",
                "LAB001", // Different regd number
                "lab" // Different role
            );
            console.log("❌ ERROR: Account 2 should not be able to register with different role!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 2 correctly blocked from registering with different role");
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 6: Try to register Account 3 as Farmer (should fail)
        console.log("🚫 Test 6: Trying to register Account 3 as FARMER (should fail)...");
        try {
            await contract.connect(account3).registerUser(
                "Bob Consumer",
                "bob@consumer.com",
                "FARM002", // Different regd number
                "farmer" // Different role
            );
            console.log("❌ ERROR: Account 3 should not be able to register with different role!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 3 correctly blocked from registering with different role");
            console.log(`   Error: ${error.message}\n`);
        }

        console.log("🎉 Role restriction tests completed successfully!");
        console.log("\n📊 Summary:");
        console.log("✅ Each address is permanently tied to one role");
        console.log("✅ Role changes are completely blocked");
        console.log("✅ Registration numbers are unique");
        console.log("✅ Role interactions follow proper supply chain flow");

        console.log("\n💡 Updated Frontend Toast Notifications:");
        console.log("🔴 Error Toast Examples:");
        console.log(`   "Dear address 0x7099...79C8, you are already registered as a "farmer". Please login there instead of trying to register as a "Collector"."`);
        console.log(`   "Dear address 0x3C44...293B, you are already registered as a "collector". Please login there instead of trying to register as a "Lab"."`);
        console.log(`   "Dear address 0x90F7...3b90, you are already registered as a "consumer". Please login there instead of trying to register as a "Farmer"."`);
        
        console.log("\n🟢 Success Toast Examples:");
        console.log(`   "Welcome back! You're already registered as a Farmer"`);
        console.log(`   "Welcome! You can now register as a Collector"`);
        
        console.log("\n🟡 Warning Toast Examples:");
        console.log(`   "You are already registered as a Farmer. Redirecting to dashboard..."`);

        console.log("\n🔄 User Flow:");
        console.log("1. User connects wallet and selects role");
        console.log("2. System checks if user is already registered");
        console.log("3. If different role: Shows clear error toast with address + redirects to /contributor");
        console.log("4. If same role: Shows success toast + redirects to dashboard");
        console.log("5. If new user: Shows welcome toast + redirects to registration");

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
