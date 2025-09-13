const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying to Sepolia...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.005")) {
      console.log("⚠️ Low balance! Get Sepolia ETH from faucet.");
      return;
    }
    
    // Deploy contract
    console.log("📦 Deploying contract...");
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = await PRAMANSupplyChain.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("✅ Contract deployed at:", address);
    
    // Save address to file
    const fs = require('fs');
    fs.writeFileSync('SEPOLIA_CONTRACT_ADDRESS.txt', address);
    console.log("📝 Address saved to SEPOLIA_CONTRACT_ADDRESS.txt");
    
    console.log("🔗 View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${address}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
