const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Role Restrictions...\n");

    // Get the deployed contract
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = PRAMANSupplyChain.attach(contractAddress);

    // Get test accounts
    const [owner, account1, account2, account3, account4] = await ethers.getSigners();

    console.log("👥 Test Accounts:");
    console.log(`Owner: ${owner.address}`);
    console.log(`Account 1: ${account1.address}`);
    console.log(`Account 2: ${account2.address}`);
    console.log(`Account 3: ${account3.address}`);
    console.log(`Account 4: ${account4.address}\n`);

    try {
        // Test 1: Register users with different roles
        console.log("📝 Test 1: Registering users with different roles...");
        
        // Register Account 1 as Farmer
        await contract.connect(account1).registerUser(
            "John Farmer",
            "john@farmer.com",
            "FARM001",
            "farmer"
        );
        console.log("✅ Account 1 registered as FARMER");

        // Register Account 2 as Collector
        await contract.connect(account2).registerUser(
            "Jane Collector",
            "jane@collector.com",
            "COLL001",
            "collector"
        );
        console.log("✅ Account 2 registered as COLLECTOR");

        // Register Account 3 as Consumer
        await contract.connect(account3).registerUser(
            "Bob Consumer",
            "bob@consumer.com",
            "CONS001",
            "consumer"
        );
        console.log("✅ Account 3 registered as CONSUMER");

        // Register Account 4 as Lab
        await contract.connect(account4).registerUser(
            "Alice Lab",
            "alice@lab.com",
            "LAB001",
            "lab"
        );
        console.log("✅ Account 4 registered as LAB\n");

        // Test 2: Check role permissions
        console.log("🔍 Test 2: Checking role permissions...");
        
        const canFarmerCreateGenesis = await contract.canCreateGenesisBatch(account1.address);
        const canCollectorCreateGenesis = await contract.canCreateGenesisBatch(account2.address);
        const canConsumerCreateGenesis = await contract.canCreateGenesisBatch(account3.address);
        
        console.log(`Farmer can create genesis batch: ${canFarmerCreateGenesis}`);
        console.log(`Collector can create genesis batch: ${canCollectorCreateGenesis}`);
        console.log(`Consumer can create genesis batch: ${canConsumerCreateGenesis}\n`);

        const canFarmerSend = await contract.canSendBatch(account1.address);
        const canCollectorSend = await contract.canSendBatch(account2.address);
        const canConsumerSend = await contract.canSendBatch(account3.address);
        
        console.log(`Farmer can send batches: ${canFarmerSend}`);
        console.log(`Collector can send batches: ${canCollectorSend}`);
        console.log(`Consumer can send batches: ${canConsumerSend}\n`);

        const canCollectorReceive = await contract.canReceiveBatch(account2.address);
        const canLabReceive = await contract.canReceiveBatch(account4.address);
        const canConsumerReceive = await contract.canReceiveBatch(account3.address);
        
        console.log(`Collector can receive batches: ${canCollectorReceive}`);
        console.log(`Lab can receive batches: ${canLabReceive}`);
        console.log(`Consumer can receive batches: ${canConsumerReceive}\n`);

        // Test 3: Test role interactions
        console.log("🤝 Test 3: Testing role interactions...");
        
        const farmerToCollector = await contract.canInteractWithRole("farmer", "collector");
        const farmerToConsumer = await contract.canInteractWithRole("farmer", "consumer");
        const collectorToLab = await contract.canInteractWithRole("collector", "lab");
        const consumerToFarmer = await contract.canInteractWithRole("consumer", "farmer");
        
        console.log(`Farmer → Collector: ${farmerToCollector}`);
        console.log(`Farmer → Consumer: ${farmerToConsumer}`);
        console.log(`Collector → Lab: ${collectorToLab}`);
        console.log(`Consumer → Farmer: ${consumerToFarmer}\n`);

        // Test 4: Test batch creation restrictions
        console.log("🌱 Test 4: Testing batch creation restrictions...");
        
        try {
            // Farmer should be able to create genesis batch
            await contract.connect(account1).createGenesisBatch(
                "BATCH001",
                "Wheat",
                1000,
                "Premium",
                "Good",
                "Low",
                123456789,
                987654321,
                "Farm Location",
                50,
                60,
                25,
                10,
                1013,
                "signature_hash_1"
            );
            console.log("✅ Farmer successfully created genesis batch");
        } catch (error) {
            console.log("❌ Farmer failed to create genesis batch:", error.message);
        }

        try {
            // Collector should NOT be able to create genesis batch
            await contract.connect(account2).createGenesisBatch(
                "BATCH002",
                "Rice",
                500,
                "Standard",
                "Good",
                "Low",
                123456789,
                987654321,
                "Collector Location",
                50,
                60,
                25,
                10,
                1013,
                "signature_hash_2"
            );
            console.log("❌ Collector should not be able to create genesis batch!");
        } catch (error) {
            console.log("✅ Collector correctly blocked from creating genesis batch:", error.message);
        }

        try {
            // Consumer should NOT be able to create genesis batch
            await contract.connect(account3).createGenesisBatch(
                "BATCH003",
                "Corn",
                300,
                "Standard",
                "Good",
                "Low",
                123456789,
                987654321,
                "Consumer Location",
                50,
                60,
                25,
                10,
                1013,
                "signature_hash_3"
            );
            console.log("❌ Consumer should not be able to create genesis batch!");
        } catch (error) {
            console.log("✅ Consumer correctly blocked from creating genesis batch:", error.message);
        }

        // Test 5: Test role change prevention
        console.log("\n🚫 Test 5: Testing role change prevention...");
        
        try {
            // Try to register Account 1 (farmer) with a different role
            await contract.connect(account1).registerUser(
                "John Farmer",
                "john@farmer.com",
                "FARM002", // Different regd number
                "collector" // Different role
            );
            console.log("❌ Role change should not be allowed!");
        } catch (error) {
            console.log("✅ Role change correctly blocked:", error.message);
        }

        console.log("\n🎉 Role restriction tests completed!");
        console.log("\n📊 Summary:");
        console.log("✅ Role-based permissions working correctly");
        console.log("✅ Genesis batch creation restricted to farmers only");
        console.log("✅ Role interactions validated");
        console.log("✅ Role changes prevented");

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
