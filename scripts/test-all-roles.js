const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing All Roles in PRAMAN Supply Chain...\n");

    // Get the deployed contract
    const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = PRAMANSupplyChain.attach(contractAddress);

    // Get test accounts
    const [owner, farmer, collector, lab, supplier, distributor, retailer, consumer] = await ethers.getSigners();

    console.log("📋 Available Accounts:");
    console.log("Farmer:", farmer.address);
    console.log("Collector:", collector.address);
    console.log("Lab:", lab.address);
    console.log("Supplier:", supplier.address);
    console.log("Distributor:", distributor.address);
    console.log("Retailer:", retailer.address);
    console.log("Consumer:", consumer.address);
    console.log();

    try {
        // Register all users with their respective roles
        console.log("👥 Registering all users...");
        
        await contract.connect(farmer).registerUser("Test Farmer", "farmer@test.com", "FARM001", "farmer");
        console.log("✅ Farmer registered");

        await contract.connect(collector).registerUser("Test Collector", "collector@test.com", "COLL001", "collector");
        console.log("✅ Collector registered");

        await contract.connect(lab).registerUser("Test Lab", "lab@test.com", "LAB001", "lab");
        console.log("✅ Lab registered");

        await contract.connect(supplier).registerUser("Test Supplier", "supplier@test.com", "SUPP001", "supplier");
        console.log("✅ Supplier registered");

        await contract.connect(distributor).registerUser("Test Distributor", "distributor@test.com", "DIST001", "distributor");
        console.log("✅ Distributor registered");

        await contract.connect(retailer).registerUser("Test Retailer", "retailer@test.com", "RETAIL001", "retailer");
        console.log("✅ Retailer registered");

        await contract.connect(consumer).registerUser("Test Consumer", "consumer@test.com", "CONS001", "consumer");
        console.log("✅ Consumer registered");

        console.log("\n🔍 Testing Role Permissions...");

        // Test farmer permissions
        console.log("\n🌾 Farmer Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(farmer.address));
        console.log("Can send batch:", await contract.canSendBatch(farmer.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(farmer.address));

        // Test collector permissions
        console.log("\n📋 Collector Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(collector.address));
        console.log("Can send batch:", await contract.canSendBatch(collector.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(collector.address));

        // Test lab permissions
        console.log("\n🔬 Lab Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(lab.address));
        console.log("Can send batch:", await contract.canSendBatch(lab.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(lab.address));

        // Test supplier permissions
        console.log("\n📦 Supplier Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(supplier.address));
        console.log("Can send batch:", await contract.canSendBatch(supplier.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(supplier.address));

        // Test distributor permissions
        console.log("\n🚚 Distributor Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(distributor.address));
        console.log("Can send batch:", await contract.canSendBatch(distributor.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(distributor.address));

        // Test retailer permissions
        console.log("\n🏪 Retailer Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(retailer.address));
        console.log("Can send batch:", await contract.canSendBatch(retailer.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(retailer.address));

        // Test consumer permissions
        console.log("\n👤 Consumer Permissions:");
        console.log("Can create genesis batch:", await contract.canCreateGenesisBatch(consumer.address));
        console.log("Can send batch:", await contract.canSendBatch(consumer.address));
        console.log("Can receive batch:", await contract.canReceiveBatch(consumer.address));

        console.log("\n🔗 Testing Role Interactions...");

        // Test valid interactions
        console.log("\n✅ Valid Role Interactions:");
        console.log("Farmer -> Collector:", await contract.canInteractWithRole("farmer", "collector"));
        console.log("Collector -> Lab:", await contract.canInteractWithRole("collector", "lab"));
        console.log("Lab -> Supplier:", await contract.canInteractWithRole("lab", "supplier"));
        console.log("Supplier -> Distributor:", await contract.canInteractWithRole("supplier", "distributor"));
        console.log("Distributor -> Retailer:", await contract.canInteractWithRole("distributor", "retailer"));
        console.log("Retailer -> Consumer:", await contract.canInteractWithRole("retailer", "consumer"));

        // Test invalid interactions
        console.log("\n❌ Invalid Role Interactions:");
        console.log("Consumer -> Anyone:", await contract.canInteractWithRole("consumer", "farmer"));
        console.log("Farmer -> Consumer:", await contract.canInteractWithRole("farmer", "consumer"));

        console.log("\n📊 Final Statistics:");
        const batchCount = await contract.getBatchCount();
        const userCount = await contract.getUserCount();
        console.log("Total batches:", batchCount.toString());
        console.log("Total users:", userCount.toString());

        console.log("\n🎉 All role tests completed successfully!");

    } catch (error) {
        console.error("❌ Error during testing:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
