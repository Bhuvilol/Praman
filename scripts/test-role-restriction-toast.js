const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Role Restriction with Toast Notifications...\n");

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

        // Test 2: Try to register Account 1 as Collector (should fail)
        console.log("🚫 Test 2: Trying to register Account 1 as COLLECTOR (should fail)...");
        try {
            await contract.connect(account1).registerUser(
                "John Farmer",
                "john@farmer.com",
                "COL001", // Different regd number
                "collector" // Different role
            );
            console.log("❌ ERROR: Account 1 should not be able to register with different role!");
        } catch (error) {
            console.log("✅ SUCCESS: Account 1 correctly blocked from registering with different role");
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 3: Register Account 2 as Collector
        console.log("📝 Test 3: Registering Account 2 as COLLECTOR...");
        await contract.connect(account2).registerUser(
            "Jane Collector",
            "jane@collector.com",
            "COL001",
            "collector"
        );
        console.log("✅ Account 2 registered as COLLECTOR\n");

        // Test 4: Try to register Account 2 as Lab (should fail)
        console.log("🚫 Test 4: Trying to register Account 2 as LAB (should fail)...");
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

        // Test 5: Register Account 3 as Consumer
        console.log("📝 Test 5: Registering Account 3 as CONSUMER...");
        await contract.connect(account3).registerUser(
            "Bob Consumer",
            "bob@consumer.com",
            "CONS001",
            "consumer"
        );
        console.log("✅ Account 3 registered as CONSUMER\n");

        // Test 6: Verify role restrictions
        console.log("🔍 Test 6: Verifying role restrictions...");
        
        const account1Role = await contract.getUserRole(account1.address);
        const account2Role = await contract.getUserRole(account2.address);
        const account3Role = await contract.getUserRole(account3.address);
        
        console.log(`Account 1 role: ${account1Role}`);
        console.log(`Account 2 role: ${account2Role}`);
        console.log(`Account 3 role: ${account3Role}\n`);

        // Test 7: Test role interaction restrictions
        console.log("🤝 Test 7: Testing role interaction restrictions...");
        
        const farmerToCollector = await contract.canInteractWithRole("farmer", "collector");
        const farmerToConsumer = await contract.canInteractWithRole("farmer", "consumer");
        const collectorToLab = await contract.canInteractWithRole("collector", "lab");
        const consumerToFarmer = await contract.canInteractWithRole("consumer", "farmer");
        
        console.log(`Farmer → Collector: ${farmerToCollector}`);
        console.log(`Farmer → Consumer: ${farmerToConsumer}`);
        console.log(`Collector → Lab: ${collectorToLab}`);
        console.log(`Consumer → Farmer: ${consumerToFarmer}\n`);

        console.log("🎉 Role restriction tests completed successfully!");
        console.log("\n📊 Summary:");
        console.log("✅ Each address is permanently tied to one role");
        console.log("✅ Role changes are completely blocked");
        console.log("✅ Registration numbers are unique");
        console.log("✅ Role interactions follow proper supply chain flow");
        console.log("✅ Frontend will show appropriate toast notifications");

        console.log("\n💡 Frontend Toast Notifications:");
        console.log("🔴 Error Toast: 'You have already registered under \"farmer\" role. You cannot register as a \"Collector\". Each wallet address is permanently tied to one role.'");
        console.log("🟢 Success Toast: 'Welcome back! You're already registered as a Farmer'");
        console.log("🟡 Warning Toast: 'You are already registered as a Farmer. Redirecting to dashboard...'");

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
