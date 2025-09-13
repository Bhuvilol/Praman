const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting PRAMAN Supply Chain deployment to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️ Warning: Low balance! You need at least 0.01 ETH for deployment.");
    console.log("💡 Get Sepolia ETH from: https://sepoliafaucet.com/");
  }

  console.log("📦 Deploying PRAMAN Supply Chain contract...");
  
  // Deploy the contract
  const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
  const pramanSupplyChain = await PRAMANSupplyChain.deploy();
  
  await pramanSupplyChain.waitForDeployment();
  
  const contractAddress = await pramanSupplyChain.getAddress();
  
  console.log("✅ PRAMAN Supply Chain deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network: Sepolia Testnet");
  console.log("⛓️ Chain ID: 11155111");
  console.log("👤 Deployer:", deployer.address);
  
  // Verify deployment
  console.log("\n🔍 Contract Verification:");
  try {
    const batchCount = await pramanSupplyChain.getBatchCount();
    const userCount = await pramanSupplyChain.getUserCount();
    console.log("📊 Initial Batch Count:", batchCount.toString());
    console.log("👥 Initial User Count:", userCount.toString());
    console.log("✅ Contract is working correctly!");
  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
  }
  
  console.log("\n📋 Deployment Information:");
  console.log(JSON.stringify({
    contractAddress: contractAddress,
    network: "sepolia",
    chainId: 11155111,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: pramanSupplyChain.deploymentTransaction().hash
  }, null, 2));
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n💡 Next steps:");
  console.log("1. Update your frontend with the contract address:", contractAddress);
  console.log("2. Update NEW_CONTRACT_ADDRESS.txt with:", contractAddress);
  console.log("3. Configure MetaMask to use Sepolia testnet");
  console.log("4. Test the contract functions on Sepolia");
  
  console.log("\n🔗 View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
