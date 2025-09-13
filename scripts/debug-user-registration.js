const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging User Registration...\n");

    // Get the deployed contract
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const PRAMANSupplyChain = await ethers.getContractFactory("PRAMANSupplyChain");
    const contract = PRAMANSupplyChain.attach(contractAddress);

    // Your specific address that you mentioned
    const yourAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    console.log("🔍 Checking your address:", yourAddress);
    console.log("=" * 50);

    try {
        // Check if you're registered
        const isRegistered = await contract.isUserRegistered(yourAddress);
        console.log(`Is registered: ${isRegistered}`);

        if (isRegistered) {
            // Get your user details
            const user = await contract.getUser(yourAddress);
            console.log("\n📋 Your Registration Details:");
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Registration ID: ${user.regdNo}`);
            console.log(`Role: ${user.role}`);
            console.log(`Wallet Address: ${user.walletAddress}`);
            console.log(`Exists: ${user.exists}`);

            // Check role permissions
            const canCreateGenesis = await contract.canCreateGenesisBatch(yourAddress);
            const canSend = await contract.canSendBatch(yourAddress);
            const canReceive = await contract.canReceiveBatch(yourAddress);

            console.log("\n🔐 Your Permissions:");
            console.log(`Can create genesis batch: ${canCreateGenesis}`);
            console.log(`Can send batch: ${canSend}`);
            console.log(`Can receive batch: ${canReceive}`);

            // Check if you can interact with other roles
            console.log("\n🤝 Role Interactions:");
            const farmerToCollector = await contract.canInteractWithRole("farmer", "collector");
            const farmerToConsumer = await contract.canInteractWithRole("farmer", "consumer");
            console.log(`Farmer → Collector: ${farmerToCollector}`);
            console.log(`Farmer → Consumer: ${farmerToConsumer}`);

        } else {
            console.log("❌ You are not registered yet.");
            console.log("You need to register first before you can use the system.");
        }

        // Check all registered users
        console.log("\n👥 All Registered Users:");
        const [owner, account1, account2, account3, account4] = await ethers.getSigners();
        const accounts = [owner, account1, account2, account3, account4];

        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const isReg = await contract.isUserRegistered(account.address);
            if (isReg) {
                const user = await contract.getUser(account.address);
                console.log(`Account ${i}: ${account.address} - ${user.role} (${user.regdNo})`);
            }
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
