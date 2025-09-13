const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking registered users in PRAMAN Supply Chain...");

  // Get the deployed contract
  const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
  const contract = PRAMANSupplyChain.attach(contractAddress);

  // Get test accounts
  const [owner, farmer, distributor, consumer, account4, account5] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log("Account #0 (Owner):", owner.address);
  console.log("Account #1 (Farmer):", farmer.address);
  console.log("Account #2 (Distributor):", distributor.address);
  console.log("Account #3 (Consumer):", consumer.address);
  console.log("Account #4:", account4.address);
  console.log("Account #5:", account5.address);

  try {
    // Check which users are registered
    console.log("\n📋 Checking user registrations...");
    
    const accounts = [owner, farmer, distributor, consumer, account4, account5];
    const accountNames = ["Owner", "Farmer", "Distributor", "Consumer", "Account4", "Account5"];
    
    for (let i = 0; i < accounts.length; i++) {
      try {
        const isRegistered = await contract.isUserRegistered(accounts[i].address);
        if (isRegistered) {
          const user = await contract.getUser(accounts[i].address);
          console.log(`✅ ${accountNames[i]} (${accounts[i].address}):`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Regd No: ${user.regdNo}`);
          console.log(`   Role: ${user.role}`);
        } else {
          console.log(`❌ ${accountNames[i]} (${accounts[i].address}): Not registered`);
        }
      } catch (error) {
        console.log(`⚠️ ${accountNames[i]} (${accounts[i].address}): Error checking - ${error.message}`);
      }
    }

    // Check total user count
    console.log("\n📊 Contract Statistics:");
    const userCount = await contract.getUserCount();
    const batchCount = await contract.getBatchCount();
    console.log(`Total Users: ${userCount.toString()}`);
    console.log(`Total Batches: ${batchCount.toString()}`);

    // Get all batches if any exist
    if (batchCount > 0) {
      console.log("\n📦 Existing Batches:");
      const allBatches = await contract.getAllBatches();
      allBatches.forEach((batch, index) => {
        console.log(`Batch ${index + 1}:`);
        console.log(`  ID: ${batch.batchId}`);
        console.log(`  Crop: ${batch.cropName}`);
        console.log(`  Status: ${batch.status}`);
        console.log(`  Owner: ${batch.previousActor}`);
        console.log(`  Created: ${new Date(parseInt(batch.createdAt) * 1000).toLocaleString()}`);
      });
    }

    console.log("\n💡 Recommendations:");
    console.log("1. Use unregistered accounts for new tests");
    console.log("2. Or use different registration numbers");
    console.log("3. Or reset the contract by redeploying");

  } catch (error) {
    console.error("❌ Error checking users:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
