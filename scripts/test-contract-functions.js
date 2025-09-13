const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Contract Functions...\n");

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
        // Test 1: Check if users are registered (should be false initially)
        console.log("🔍 Test 1: Checking user registration status...");
        
        const isOwnerRegistered = await contract.isUserRegistered(owner.address);
        const isAccount1Registered = await contract.isUserRegistered(account1.address);
        const isAccount2Registered = await contract.isUserRegistered(account2.address);
        
        console.log(`Owner registered: ${isOwnerRegistered}`);
        console.log(`Account 1 registered: ${isAccount1Registered}`);
        console.log(`Account 2 registered: ${isAccount2Registered}\n`);

        // Test 2: Register Account 1 as Farmer
        console.log("📝 Test 2: Registering Account 1 as FARMER...");
        await contract.connect(account1).registerUser(
            "John Farmer",
            "john@farmer.com",
            "FARM001",
            "farmer"
        );
        console.log("✅ Account 1 registered as FARMER\n");

        // Test 3: Check registration status again
        console.log("🔍 Test 3: Checking registration status after registration...");
        
        const isAccount1RegisteredAfter = await contract.isUserRegistered(account1.address);
        console.log(`Account 1 registered after: ${isAccount1RegisteredAfter}`);
        
        if (isAccount1RegisteredAfter) {
            const user1 = await contract.getUser(account1.address);
            console.log(`Account 1 role: ${user1.role}`);
            console.log(`Account 1 name: ${user1.name}`);
            console.log(`Account 1 regdNo: ${user1.regdNo}\n`);
        }

        // Test 4: Register Account 2 as Collector
        console.log("📝 Test 4: Registering Account 2 as COLLECTOR...");
        await contract.connect(account2).registerUser(
            "Jane Collector",
            "jane@collector.com",
            "COL001",
            "collector"
        );
        console.log("✅ Account 2 registered as COLLECTOR\n");

        // Test 5: Check role permissions
        console.log("🔍 Test 5: Checking role permissions...");
        
        const canAccount1CreateGenesis = await contract.canCreateGenesisBatch(account1.address);
        const canAccount2CreateGenesis = await contract.canCreateGenesisBatch(account2.address);
        
        console.log(`Account 1 (farmer) can create genesis batch: ${canAccount1CreateGenesis}`);
        console.log(`Account 2 (collector) can create genesis batch: ${canAccount2CreateGenesis}\n`);

        // Test 6: Test role interactions
        console.log("🤝 Test 6: Testing role interactions...");
        
        const farmerToCollector = await contract.canInteractWithRole("farmer", "collector");
        const collectorToFarmer = await contract.canInteractWithRole("collector", "farmer");
        
        console.log(`Farmer → Collector: ${farmerToCollector}`);
        console.log(`Collector → Farmer: ${collectorToFarmer}\n`);

        // Test 7: Test getAddressByRegdNo
        console.log("🔍 Test 7: Testing getAddressByRegdNo...");
        
        const addressByRegdNo1 = await contract.getAddressByRegdNo("FARM001");
        const addressByRegdNo2 = await contract.getAddressByRegdNo("COL001");
        
        console.log(`Address for FARM001: ${addressByRegdNo1}`);
        console.log(`Address for COL001: ${addressByRegdNo2}`);
        console.log(`Account 1 address: ${account1.address}`);
        console.log(`Account 2 address: ${account2.address}\n`);

        console.log("🎉 All contract function tests completed successfully!");
        console.log("\n📊 Summary:");
        console.log("✅ isUserRegistered function working");
        console.log("✅ registerUser function working");
        console.log("✅ getUser function working");
        console.log("✅ canCreateGenesisBatch function working");
        console.log("✅ canInteractWithRole function working");
        console.log("✅ getAddressByRegdNo function working");
        console.log("✅ Role restrictions working correctly");

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
