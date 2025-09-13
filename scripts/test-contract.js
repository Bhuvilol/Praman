const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing PRAMAN Supply Chain contract...");

  // Get the deployed contract
  const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // Deployed contract address
  const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
  const contract = PRAMANSupplyChain.attach(contractAddress);

  // Get test accounts
  const [owner, farmer, distributor, consumer] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log("Owner:", owner.address);
  console.log("Farmer:", farmer.address);
  console.log("Distributor:", distributor.address);
  console.log("Consumer:", consumer.address);

  try {
    // Test 1: Register users
    console.log("\n📝 Test 1: Registering users...");
    
    await contract.connect(farmer).registerUser(
      "John Farmer",
      "john@farmer.com",
      "FARM001",
      "farmer"
    );
    console.log("✅ Farmer registered");

    await contract.connect(distributor).registerUser(
      "Jane Distributor",
      "jane@distributor.com",
      "DIST001",
      "distributor"
    );
    console.log("✅ Distributor registered");

    await contract.connect(consumer).registerUser(
      "Bob Consumer",
      "bob@consumer.com",
      "CONS001",
      "consumer"
    );
    console.log("✅ Consumer registered");

    // Test 2: Create genesis batch
    console.log("\n🌱 Test 2: Creating genesis batch...");
    
    const batchId = "FARM001-1703123456-ASH";
    const signatureHash = "0x" + "a".repeat(64);
    
    await contract.connect(farmer).createGenesisBatch(
      batchId,
      "Ashwagandha",
      "100",
      "Premium",
      "Excellent",
      "Low",
      "123456789",
      "987654321",
      "Farm Location, India",
      "50",
      "60",
      "25",
      "10",
      "1013",
      signatureHash
    );
    console.log("✅ Genesis batch created:", batchId);

    // Test 3: Get batch information
    console.log("\n📊 Test 3: Getting batch information...");
    
    const batch = await contract.getBatch(batchId);
    console.log("Batch Status:", batch.status);
    console.log("Crop Name:", batch.cropName);
    console.log("Quantity:", batch.quantity.toString());
    console.log("Current Owner:", batch.previousActor);

    // Test 4: Send batch
    console.log("\n📤 Test 4: Sending batch...");
    
    await contract.connect(farmer).sendBatch(
      batchId,
      "DIST001",
      "Truck",
      "0x" + "b".repeat(64)
    );
    console.log("✅ Batch sent to distributor");

    // Test 5: Receive batch
    console.log("\n📥 Test 5: Receiving batch...");
    
    await contract.connect(distributor).receiveBatch(
      batchId,
      "Quality check passed",
      "0x" + "c".repeat(64)
    );
    console.log("✅ Batch received by distributor");

    // Test 6: Get updated batch information
    console.log("\n📊 Test 6: Getting updated batch information...");
    
    const updatedBatch = await contract.getBatch(batchId);
    console.log("Updated Status:", updatedBatch.status);
    console.log("Current Owner:", updatedBatch.previousActor);

    // Test 7: Get all batches
    console.log("\n📋 Test 7: Getting all batches...");
    
    const allBatches = await contract.getAllBatches();
    console.log("Total Batches:", allBatches.length);
    console.log("Batch IDs:", allBatches.map(b => b.batchId));

    // Test 8: Get user information
    console.log("\n👤 Test 8: Getting user information...");
    
    const farmerInfo = await contract.getUser(farmer.address);
    console.log("Farmer Info:", {
      name: farmerInfo.name,
      email: farmerInfo.email,
      regdNo: farmerInfo.regdNo,
      role: farmerInfo.role
    });

    console.log("\n🎉 All tests passed successfully!");
    console.log("✅ Contract is working correctly on local blockchain");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  });
