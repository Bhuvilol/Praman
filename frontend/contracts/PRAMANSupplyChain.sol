// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PRAMANSupplyChain {
    // Structs
    struct Batch {
        string batchId;
        string regdNo;
        string cropName;
        uint256 quantity;
        string variant;
        string condition;
        string contaminationLevel;
        uint256 latitude;
        uint256 longitude;
        string location;
        uint256 rainfall;
        uint256 humidity;
        uint256 temperature;
        uint256 windSpeed;
        uint256 pressure;
        string signatureHash;
        string transactionHash;
        uint256 blockNumber;
        string status; // "created", "in_transit", "received", "completed"
        string supplyChainStage; // "genesis", "in_transit", "received"
        string previousActor;
        string nextActor;
        string currentHolder; // Track who currently holds the batch
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    struct User {
        string name;
        string email;
        string regdNo;
        string role;
        address walletAddress;
        bool exists;
    }

    // State variables
    mapping(string => Batch) public batches;
    mapping(address => User) public users;
    mapping(string => bool) public batchIds;
    mapping(string => bool) public regdNumbers;
    mapping(string => address) public regdToAddress;
    string[] public allBatchIds;
    
    address public owner;
    uint256 public batchCounter;
    uint256 public userCounter;

    // Events for complete transaction tracking
    event BatchCreated(string indexed batchId, address indexed creator, string regdNo, string cropName, uint256 timestamp, uint256 blockNumber);
    event BatchSent(string indexed batchId, address indexed from, address indexed to, string fromRegdNo, string toRegdNo, string transportMethod, uint256 timestamp, uint256 blockNumber);
    event BatchReceived(string indexed batchId, address indexed receiver, string regdNo, string qualityCheck, uint256 timestamp, uint256 blockNumber);
    event BatchStatusChanged(string indexed batchId, string oldStatus, string newStatus, string newStage, uint256 timestamp, uint256 blockNumber);
    event UserRegistered(address indexed walletAddress, string regdNo, string role, uint256 timestamp);
    event BatchTransferred(string indexed batchId, string fromActor, string toActor, uint256 timestamp);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRegisteredUser() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }

    modifier batchExists(string memory _batchId) {
        require(batchIds[_batchId], "Batch does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        batchCounter = 0;
        userCounter = 0;
    }

    // User Management Functions
    function registerUser(
        string memory _name,
        string memory _email,
        string memory _regdNo,
        string memory _role
    ) external {
        require(!users[msg.sender].exists, "User already registered");
        require(!regdNumbers[_regdNo], "Registration number already exists");
        
        // Validate role is one of the allowed roles
        require(isValidRole(_role), "Invalid role specified");
        
        users[msg.sender] = User({
            name: _name,
            email: _email,
            regdNo: _regdNo,
            role: _role,
            walletAddress: msg.sender,
            exists: true
        });
        
        regdNumbers[_regdNo] = true;
        regdToAddress[_regdNo] = msg.sender;
        userCounter++;
        
        emit UserRegistered(msg.sender, _regdNo, _role, block.timestamp);
    }

    // Validate if role is one of the allowed roles
    function isValidRole(string memory _role) internal pure returns (bool) {
        bytes32 roleHash = keccak256(bytes(_role));
        return (
            roleHash == keccak256(bytes("farmer")) ||
            roleHash == keccak256(bytes("collector")) ||
            roleHash == keccak256(bytes("lab")) ||
            roleHash == keccak256(bytes("supplier")) ||
            roleHash == keccak256(bytes("distributor")) ||
            roleHash == keccak256(bytes("retailer")) ||
            roleHash == keccak256(bytes("consumer"))
        );
    }

    // Function to check if an address can perform a specific action based on role
    function canPerformAction(address _user, string memory _requiredRole) external view returns (bool) {
        require(users[_user].exists, "User not registered");
        return keccak256(bytes(users[_user].role)) == keccak256(bytes(_requiredRole));
    }

    // Function to get user role (read-only)
    function getUserRole(address _user) external view returns (string memory) {
        require(users[_user].exists, "User not registered");
        return users[_user].role;
    }

    // Function to check if user can create genesis batches (only farmers)
    function canCreateGenesisBatch(address _user) public view returns (bool) {
        require(users[_user].exists, "User not registered");
        return keccak256(bytes(users[_user].role)) == keccak256(bytes("farmer"));
    }

    // Function to check if user can send batches (farmers, collectors, labs, suppliers, distributors, retailers)
    function canSendBatch(address _user) public view returns (bool) {
        require(users[_user].exists, "User not registered");
        bytes32 roleHash = keccak256(bytes(users[_user].role));
        return (
            roleHash == keccak256(bytes("farmer")) ||
            roleHash == keccak256(bytes("collector")) ||
            roleHash == keccak256(bytes("lab")) ||
            roleHash == keccak256(bytes("supplier")) ||
            roleHash == keccak256(bytes("distributor")) ||
            roleHash == keccak256(bytes("retailer"))
        );
    }

    // Function to check if user can receive batches (all roles except farmers for final delivery)
    function canReceiveBatch(address _user) public view returns (bool) {
        require(users[_user].exists, "User not registered");
        bytes32 roleHash = keccak256(bytes(users[_user].role));
        return (
            roleHash == keccak256(bytes("collector")) ||
            roleHash == keccak256(bytes("lab")) ||
            roleHash == keccak256(bytes("supplier")) ||
            roleHash == keccak256(bytes("distributor")) ||
            roleHash == keccak256(bytes("retailer")) ||
            roleHash == keccak256(bytes("consumer"))
        );
    }

    // Function to check if an address is already registered with a different role
    function isAddressRegisteredWithDifferentRole(address _address, string memory _newRole) external view returns (bool) {
        if (!users[_address].exists) {
            return false; // Address not registered, so no conflict
        }
        return keccak256(bytes(users[_address].role)) != keccak256(bytes(_newRole));
    }

    // Function to get all valid roles (for frontend validation)
    function getValidRoles() external pure returns (string[7] memory) {
        return ["farmer", "collector", "lab", "supplier", "distributor", "retailer", "consumer"];
    }

    // Function to check if a role can interact with another role in the supply chain
    function canInteractWithRole(string memory _senderRole, string memory _recipientRole) public pure returns (bool) {
        bytes32 senderHash = keccak256(bytes(_senderRole));
        bytes32 recipientHash = keccak256(bytes(_recipientRole));
        
        // Define valid interaction patterns
        // Farmers can send to: collectors, suppliers
        if (senderHash == keccak256(bytes("farmer"))) {
            return recipientHash == keccak256(bytes("collector")) || 
                   recipientHash == keccak256(bytes("supplier"));
        }
        
        // Collectors can send to: labs, suppliers
        if (senderHash == keccak256(bytes("collector"))) {
            return recipientHash == keccak256(bytes("lab")) || 
                   recipientHash == keccak256(bytes("supplier"));
        }
        
        // Labs can send to: suppliers, distributors
        if (senderHash == keccak256(bytes("lab"))) {
            return recipientHash == keccak256(bytes("supplier")) || 
                   recipientHash == keccak256(bytes("distributor"));
        }
        
        // Suppliers can send to: distributors, retailers
        if (senderHash == keccak256(bytes("supplier"))) {
            return recipientHash == keccak256(bytes("distributor")) || 
                   recipientHash == keccak256(bytes("retailer"));
        }
        
        // Distributors can send to: retailers, consumers
        if (senderHash == keccak256(bytes("distributor"))) {
            return recipientHash == keccak256(bytes("retailer")) || 
                   recipientHash == keccak256(bytes("consumer"));
        }
        
        // Retailers can send to: consumers
        if (senderHash == keccak256(bytes("retailer"))) {
            return recipientHash == keccak256(bytes("consumer"));
        }
        
        // Consumers cannot send to anyone (end of chain)
        return false;
    }

    function getUser(address _walletAddress) external view returns (User memory) {
        require(users[_walletAddress].exists, "User not found");
        return users[_walletAddress];
    }

    function isUserRegistered(address _walletAddress) external view returns (bool) {
        return users[_walletAddress].exists;
    }

    // Batch Management Functions
    function createGenesisBatch(
        string memory _batchId,
        string memory _cropName,
        uint256 _quantity,
        string memory _variant,
        string memory _condition,
        string memory _contaminationLevel,
        uint256 _latitude,
        uint256 _longitude,
        string memory _location,
        uint256 _rainfall,
        uint256 _humidity,
        uint256 _temperature,
        uint256 _windSpeed,
        uint256 _pressure,
        string memory _signatureHash
    ) external onlyRegisteredUser {
        require(!batchIds[_batchId], "Batch ID already exists");
        require(canCreateGenesisBatch(msg.sender), "Only farmers can create genesis batches");
        
        batches[_batchId] = Batch({
            batchId: _batchId,
            regdNo: users[msg.sender].regdNo,
            cropName: _cropName,
            quantity: _quantity,
            variant: _variant,
            condition: _condition,
            contaminationLevel: _contaminationLevel,
            latitude: _latitude,
            longitude: _longitude,
            location: _location,
            rainfall: _rainfall,
            humidity: _humidity,
            temperature: _temperature,
            windSpeed: _windSpeed,
            pressure: _pressure,
            signatureHash: _signatureHash,
            transactionHash: "",
            blockNumber: block.number,
            status: "created",
            supplyChainStage: "genesis",
            previousActor: "",
            nextActor: "",
            currentHolder: users[msg.sender].regdNo, // Initially held by the creator
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });
        
        batchIds[_batchId] = true;
        allBatchIds.push(_batchId);
        batchCounter++;
        
        emit BatchCreated(_batchId, msg.sender, users[msg.sender].regdNo, _cropName, block.timestamp, block.number);
        emit BatchStatusChanged(_batchId, "", "created", "genesis", block.timestamp, block.number);
    }

    function sendBatch(
        string memory _batchId,
        string memory _recipientRegdNo,
        string memory _transportMethod,
        string memory _newSignatureHash
    ) external onlyRegisteredUser batchExists(_batchId) {
        Batch storage batch = batches[_batchId];
        require(canSendBatch(msg.sender), "Your role cannot send batches");
        require(
            keccak256(bytes(batch.status)) == keccak256(bytes("created")) || 
            keccak256(bytes(batch.status)) == keccak256(bytes("received")),
            "Batch not available for sending"
        );
        
        string memory oldStatus = batch.status;
        batch.status = "in_transit";
        batch.supplyChainStage = "in_transit";
        batch.previousActor = users[msg.sender].regdNo;
        batch.nextActor = _recipientRegdNo;
        batch.currentHolder = ""; // Clear current holder during transit
        batch.signatureHash = _newSignatureHash;
        batch.transactionHash = "";
        batch.updatedAt = block.timestamp;
        
        // Find recipient address and validate role interaction
        address recipientAddress = getAddressByRegdNo(_recipientRegdNo);
        require(recipientAddress != address(0), "Recipient not found");
        require(users[recipientAddress].exists, "Recipient not registered");
        
        // Validate that sender role can interact with recipient role
        require(
            canInteractWithRole(users[msg.sender].role, users[recipientAddress].role),
            "Invalid role interaction: Your role cannot send to this recipient role"
        );
        
        emit BatchSent(_batchId, msg.sender, recipientAddress, users[msg.sender].regdNo, _recipientRegdNo, _transportMethod, block.timestamp, block.number);
        emit BatchStatusChanged(_batchId, oldStatus, "in_transit", "in_transit", block.timestamp, block.number);
        emit BatchTransferred(_batchId, users[msg.sender].regdNo, _recipientRegdNo, block.timestamp);
    }

    function receiveBatch(
        string memory _batchId,
        string memory _qualityCheck,
        string memory _newSignatureHash
    ) external onlyRegisteredUser batchExists(_batchId) {
        Batch storage batch = batches[_batchId];
        require(canReceiveBatch(msg.sender), "Your role cannot receive batches");
        require(
            keccak256(bytes(batch.status)) == keccak256(bytes("in_transit")),
            "Batch not in transit"
        );
        require(
            keccak256(bytes(batch.nextActor)) == keccak256(bytes(users[msg.sender].regdNo)),
            "You are not the intended recipient"
        );
        
        string memory oldStatus = batch.status;
        batch.status = "received";
        batch.supplyChainStage = "received";
        batch.previousActor = batch.previousActor; // Keep previous actor
        batch.nextActor = ""; // Clear next actor
        batch.currentHolder = users[msg.sender].regdNo; // Set current holder to receiver
        batch.signatureHash = _newSignatureHash;
        batch.transactionHash = "";
        batch.updatedAt = block.timestamp;
        
        emit BatchReceived(_batchId, msg.sender, users[msg.sender].regdNo, _qualityCheck, block.timestamp, block.number);
        emit BatchStatusChanged(_batchId, oldStatus, "received", "received", block.timestamp, block.number);
    }

    function getBatch(string memory _batchId) external view batchExists(_batchId) returns (Batch memory) {
        return batches[_batchId];
    }

    function getBatchStatus(string memory _batchId) external view batchExists(_batchId) returns (string memory) {
        return batches[_batchId].status;
    }

    function getBatchHistory(string memory _batchId) external view batchExists(_batchId) returns (
        string memory,
        string memory,
        string memory,
        uint256,
        uint256
    ) {
        Batch memory batch = batches[_batchId];
        return (
            batch.previousActor,
            batch.nextActor,
            batch.status,
            batch.createdAt,
            batch.updatedAt
        );
    }

    // Utility Functions
    function getBatchCount() external view returns (uint256) {
        return batchCounter;
    }

    function getUserCount() external view returns (uint256) {
        return userCounter;
    }

    function getCurrentBlockNumber() external view returns (uint256) {
        return block.number;
    }

    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    // Helper function to get address by registration number
    function getAddressByRegdNo(string memory _regdNo) public view returns (address) {
        return regdToAddress[_regdNo];
    }

    // Get all batch IDs
    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }

    // Get batch ID by index
    function getBatchIdByIndex(uint256 _index) external view returns (string memory) {
        require(_index < allBatchIds.length, "Index out of bounds");
        return allBatchIds[_index];
    }

    // Get all batches with their current status
    function getAllBatches() external view returns (Batch[] memory) {
        Batch[] memory allBatches = new Batch[](allBatchIds.length);
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            allBatches[i] = batches[allBatchIds[i]];
        }
        return allBatches;
    }

    // Get batches by status
    function getBatchesByStatus(string memory _status) external view returns (Batch[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            if (keccak256(bytes(batches[allBatchIds[i]].status)) == keccak256(bytes(_status))) {
                count++;
            }
        }
        
        Batch[] memory filteredBatches = new Batch[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            if (keccak256(bytes(batches[allBatchIds[i]].status)) == keccak256(bytes(_status))) {
                filteredBatches[index] = batches[allBatchIds[i]];
                index++;
            }
        }
        return filteredBatches;
    }

    // Admin Functions
    function updateBatchStatus(
        string memory _batchId,
        string memory _newStatus
    ) external onlyOwner batchExists(_batchId) {
        string memory oldStatus = batches[_batchId].status;
        batches[_batchId].status = _newStatus;
        batches[_batchId].updatedAt = block.timestamp;
        
        emit BatchStatusChanged(_batchId, oldStatus, _newStatus, batches[_batchId].supplyChainStage, block.timestamp, block.number);
    }
}
