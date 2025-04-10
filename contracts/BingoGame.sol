// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BingoGame
 * @dev Smart contract to manage bingo games, players, and game state
 */
contract BingoGame {
    // ======== STRUCTS ========
    
    struct Room {
        string name;
        address owner;
        uint256 maxPlayers;
        uint256 playerCount;
        bool gameInProgress;
        uint256 entryFee;
        uint256 prize;
        uint256[] calledNumbers;
        uint256 lastNumberTimestamp;
        mapping(address => bool) players;
        mapping(address => bool) claimedBingo;
        bool exists;
    }
    
    struct BingoCard {
        uint8[5] bColumn;
        uint8[5] iColumn;
        uint8[5] nColumn; // Center is FREE
        uint8[5] gColumn;
        uint8[5] oColumn;
        bool[25] marked; // Tracks which cells are marked
        bool exists;
    }
    
    // ======== STATE VARIABLES ========
    
    // Room management
    mapping(string => Room) public rooms;
    string[] public roomIds;
    
    // Player management
    address[] public playerAddresses;
    
    // Player cards - maps player address to room ID to bingo card
    mapping(address => mapping(string => BingoCard)) public playerCards;
    
    // Game configuration
    uint256 public constant MAX_BINGO_NUMBER = 75;
    uint256 public constant NUMBER_CALL_INTERVAL = 15 seconds;
    
    // Platform fee
    uint256 public platformFeePercent = 5; // 5% platform fee
    address public platformWallet;
    
    // ======== EVENTS ========
    
    event RoomCreated(string roomId, string name, address indexed owner, uint256 maxPlayers, uint256 entryFee);
    event PlayerJoinedRoom(string roomId, address indexed player);
    event GameStarted(string roomId);
    event NumberCalled(string roomId, uint256 number);
    event BingoClaimed(string roomId, address indexed player, uint256 reward);
    event CardGenerated(address indexed player, string roomId);
    
    // ======== CONSTRUCTOR ========
    
    constructor() {
        platformWallet = msg.sender;
    }
    
    // ======== MODIFIERS ========
    
    modifier onlyRoomOwner(string memory roomId) {
        require(rooms[roomId].owner == msg.sender, "Only room owner can perform this action");
        _;
    }
    
    modifier roomExists(string memory roomId) {
        require(rooms[roomId].exists, "Room does not exist");
        _;
    }
    
    modifier roomNotInProgress(string memory roomId) {
        require(!rooms[roomId].gameInProgress, "Game is already in progress");
        _;
    }
    
    modifier roomInProgress(string memory roomId) {
        require(rooms[roomId].gameInProgress, "Game is not in progress");
        _;
    }
    
    modifier playerInRoom(string memory roomId) {
        require(rooms[roomId].players[msg.sender], "Player is not in this room");
        _;
    }
    
    modifier hasNotClaimedBingo(string memory roomId) {
        require(!rooms[roomId].claimedBingo[msg.sender], "Player has already claimed bingo in this game");
        _;
    }
    
    // ======== FUNCTIONS ========
    
    /**
     * @dev Create a new bingo room
     * @param roomId Unique identifier for the room
     * @param name Room name
     * @param maxPlayers Maximum players allowed
     * @param entryFee Fee to join (in wei)
     */
    function createRoom(string memory roomId, string memory name, uint256 maxPlayers, uint256 entryFee) public {
        require(!rooms[roomId].exists, "Room ID already exists");
        require(bytes(name).length > 0, "Room name cannot be empty");
        // require(maxPlayers > 1, "Room must allow at least 2 players");
        
        Room storage newRoom = rooms[roomId];
        newRoom.name = name;
        newRoom.owner = msg.sender;
        newRoom.maxPlayers = maxPlayers;
        newRoom.playerCount = 0;
        newRoom.gameInProgress = false;
        newRoom.entryFee = entryFee;
        newRoom.prize = 0;
        newRoom.exists = true;
        
        roomIds.push(roomId);
        emit RoomCreated(roomId, name, msg.sender, maxPlayers, entryFee);
    }
    
    /**
     * @dev Join a bingo room
     * @param roomId Room identifier
     */
    function joinRoom(string memory roomId) public payable roomExists(roomId) roomNotInProgress(roomId) {
        Room storage room = rooms[roomId];
        
        require(!room.players[msg.sender], "Player already in room");
        require(room.playerCount < room.maxPlayers, "Room is full");
        require(msg.value >= room.entryFee, "Insufficient entry fee");
        
        // Refund excess payment if any
        uint256 excess = msg.value - room.entryFee;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        // Add player to room
        room.players[msg.sender] = true;
        room.playerCount++;
        room.prize += room.entryFee;
        
        // Generate a bingo card for the player
        _generateBingoCard(roomId);
        
        emit PlayerJoinedRoom(roomId, msg.sender);
    }
    
    /**
     * @dev Start a bingo game in a room
     * @param roomId Room identifier
     */
    function startGame(string memory roomId) public onlyRoomOwner(roomId) roomNotInProgress(roomId) {
        Room storage room = rooms[roomId];
        // require(room.playerCount >= 2, "Need at least 2 players to start");
        
        room.gameInProgress = true;
        room.calledNumbers = new uint256[](0);
        room.lastNumberTimestamp = block.timestamp;
        
        emit GameStarted(roomId);
        
        // Call the first number automatically
        callNumber(roomId);
    }
    
    /**
     * @dev Call the next number in a bingo game
     * @param roomId Room identifier
     */
    function callNumber(string memory roomId) public roomExists(roomId) roomInProgress(roomId) {
        Room storage room = rooms[roomId];
        
        // Only allow calling a new number after the interval
        if (msg.sender != room.owner) {
            require(block.timestamp >= room.lastNumberTimestamp + NUMBER_CALL_INTERVAL, 
                    "Too soon to call next number");
        }
        
        // Generate a random number that hasn't been called yet
        uint256 newNumber = _getRandomNumber(roomId, MAX_BINGO_NUMBER);
        while (_numberAlreadyCalled(roomId, newNumber)) {
            newNumber = (newNumber + 1) % MAX_BINGO_NUMBER;
            if (newNumber == 0) newNumber = MAX_BINGO_NUMBER;
        }
        
        room.calledNumbers.push(newNumber);
        room.lastNumberTimestamp = block.timestamp;
        
        emit NumberCalled(roomId, newNumber);
    }
    
    /**
     * @dev Claim a bingo win
     * @param roomId Room identifier
     */
    function claimBingo(string memory roomId) public  
        roomExists(roomId) 
        roomInProgress(roomId)
        playerInRoom(roomId)
        hasNotClaimedBingo(roomId)
    {
        // Verify the player has a valid bingo
        require(_verifyBingo(roomId, msg.sender), "No valid bingo found");
        
        Room storage room = rooms[roomId];
        
        // Mark player as having claimed bingo in this game
        room.claimedBingo[msg.sender] = true;
        
        // Calculate reward (split if multiple winners)
        uint256 totalWinners = _countBingoWinners(roomId);
        uint256 platformFee = (room.prize * platformFeePercent) / 100;
        uint256 winnerPrize = (room.prize - platformFee) / totalWinners;
        
        // Transfer the winnings
        payable(msg.sender).transfer(winnerPrize);
        payable(platformWallet).transfer(platformFee);
        
        emit BingoClaimed(roomId, msg.sender, winnerPrize);
        
        // End game if this is the first bingo claim
        if (totalWinners == 1) {
            _endGame(roomId);
        }
    }
    
    /**
     * @dev End a bingo game
     * @param roomId Room identifier
     */
    function _endGame(string memory roomId) internal {
        Room storage room = rooms[roomId];
        room.gameInProgress = false;
        room.prize = 0;
    }
    
    /**
     * @dev Get all available rooms
     * @return Array of room IDs
     */
    function getAllRooms() public view returns (string[] memory) {
        return roomIds;
    }
    
    /**
     * @dev Get room details
     * @param roomId Room identifier
     * @return name Room name
     * @return owner Room owner address
     * @return maxPlayers Maximum players allowed
     * @return playerCount Current player count
     * @return gameInProgress Whether game is in progress
     * @return entryFee Entry fee (in wei)
     * @return prize Current prize pool
     * @return calledNumbers Array of called numbers
     */
    function getRoomDetails(string memory roomId) public view roomExists(roomId) returns (
        string memory name,
        address owner,
        uint256 maxPlayers,
        uint256 playerCount,
        bool gameInProgress,
        uint256 entryFee,
        uint256 prize,
        uint256[] memory calledNumbers
    ) {
        Room storage room = rooms[roomId];
        return (
            room.name,
            room.owner,
            room.maxPlayers,
            room.playerCount,
            room.gameInProgress,
            room.entryFee,
            room.prize,
            room.calledNumbers
        );
    }
    
    /**
     * @dev Get player's bingo card for a room
     * @param roomId Room identifier
     * The player's bingo card data (uint8[5] memory bColumn,
        uint8[5] memory iColumn, uint8[5] memory nColumn,
        uint8[5] memory gColumn, and bool[25] memory marked)
     */
    function getPlayerCard(string memory roomId) public view  
        roomExists(roomId) 
        playerInRoom(roomId) 
        returns (
            uint8[5] memory bColumn,
            uint8[5] memory iColumn,
            uint8[5] memory nColumn,
            uint8[5] memory gColumn,
            uint8[5] memory oColumn,
            bool[25] memory marked
        )
    {
        BingoCard storage card = playerCards[msg.sender][roomId];
        require(card.exists, "Player does not have a card for this room");
        
        return (
            card.bColumn,
            card.iColumn,
            card.nColumn,
            card.gColumn,
            card.oColumn,
            card.marked
        );
    }
    
    /**
     * @dev Mark a number on player's card
     * @param roomId Room identifier
     * @param row Row index (0-4)
     * @param col Column index (0-4)
     */
    function markNumber(string memory roomId, uint8 row, uint8 col) public  
        roomExists(roomId) 
        roomInProgress(roomId)
        playerInRoom(roomId)
    {
        require(row < 5 && col < 5, "Invalid row or column");
        
        BingoCard storage card = playerCards[msg.sender][roomId];
        uint8 number;
        
        // Get the number based on column and row
        if (col == 0) number = card.bColumn[row];
        else if (col == 1) number = card.iColumn[row];
        else if (col == 2) number = card.nColumn[row];
        else if (col == 3) number = card.gColumn[row];
        else number = card.oColumn[row];
        
        // Check if center (free space)
        if (col == 2 && row == 2) {
            card.marked[row * 5 + col] = true;
            return;
        }
        
        // Check if the number has been called
        require(_numberAlreadyCalled(roomId, number), "Number has not been called yet");
        
        // Mark the number
        card.marked[row * 5 + col] = true;
    }
    
    /**
     * @dev Generate a bingo card for a player
     * @param roomId Room identifier
     */
    function _generateBingoCard(string memory roomId) internal {
        BingoCard storage card = playerCards[msg.sender][roomId];
        require(!card.exists, "Player already has a card for this room");
        
        // Generate B column (1-15)
        card.bColumn = _generateUniqueNumbers(1, 15);
        
        // Generate I column (16-30)
        card.iColumn = _generateUniqueNumbers(16, 30);
        
        // Generate N column (31-45) with FREE space in the middle
        card.nColumn = _generateUniqueNumbers(31, 45);
        
        // Generate G column (46-60)
        card.gColumn = _generateUniqueNumbers(46, 60);
        
        // Generate O column (61-75)
        card.oColumn = _generateUniqueNumbers(61, 75);
        
        // Set center as free space (already marked)
        // Initialize each element individually
        for (uint8 i = 0; i < 25; i++) {
            card.marked[i] = false;
        }
        // Set center as free space (already marked)
        card.marked[12] = true; // Center position (2,2)
        
        card.exists = true;
        
        emit CardGenerated(msg.sender, roomId);
    }
    
    /**
     * @dev Generate 5 unique random numbers within a range
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @return Array of 5 unique random numbers
     */
    function _generateUniqueNumbers(uint8 min, uint8 max) internal view returns (uint8[5] memory) {
        uint8[5] memory numbers;
        uint8 range = max - min + 1;
        
        for (uint8 i = 0; i < 5; i++) {
            bool unique = false;
            while (!unique) {
                // Generate random number within range
                uint8 rand = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % range) + min;
                
                // Check if number is unique
                unique = true;
                for (uint8 j = 0; j < i; j++) {
                    if (numbers[j] == rand) {
                        unique = false;
                        break;
                    }
                }
                
                if (unique) {
                    numbers[i] = rand;
                }
            }
        }
        
        return numbers;
    }
    
    /**
     * @dev Check if a number has been called in a room
     * @param roomId Room identifier
     * @param number The number to check
     * @return Whether the number has been called
     */
    function _numberAlreadyCalled(string memory roomId, uint256 number) internal view returns (bool) {
        uint256[] storage calledNumbers = rooms[roomId].calledNumbers;
        for (uint256 i = 0; i < calledNumbers.length; i++) {
            if (calledNumbers[i] == number) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Generate a pseudo-random number
     * @param roomId Room identifier for additional entropy
     * @param max Maximum value (exclusive)
     * @return A pseudo-random number
     */
    function _getRandomNumber(string memory roomId, uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            roomId,
            rooms[roomId].calledNumbers.length
        ))) % max + 1;
    }
    
    /**
     * @dev Verify if a player has a valid bingo
     * @param roomId Room identifier
     * @param playerAddress Player address
     * @return Whether the player has a valid bingo
     */
    function _verifyBingo(string memory roomId, address playerAddress) internal view returns (bool) {
        BingoCard storage card = playerCards[playerAddress][roomId];
        bool[25] memory marked = card.marked;
        
        // Check rows
        for (uint8 row = 0; row < 5; row++) {
            if (marked[row*5] && marked[row*5+1] && marked[row*5+2] && marked[row*5+3] && marked[row*5+4]) {
                return true;
            }
        }
        
        // Check columns
        for (uint8 col = 0; col < 5; col++) {
            if (marked[col] && marked[col+5] && marked[col+10] && marked[col+15] && marked[col+20]) {
                return true;
            }
        }
        
        // Check diagonals
        if (marked[0] && marked[6] && marked[12] && marked[18] && marked[24]) {
            return true;
        }
        if (marked[4] && marked[8] && marked[12] && marked[16] && marked[20]) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Count how many players have claimed bingo
     * @param roomId Room identifier
     * @return Count of bingo winners
     */
    function _countBingoWinners(string memory roomId) internal view returns (uint256) {
        Room storage room = rooms[roomId];
        uint256 count = 0;
        
        // Since we can't iterate through all players, count the ones who've claimed
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            address player = playerAddresses[i];
            if (room.players[player] && room.claimedBingo[player]) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @dev Set platform fee percentage
     * @param newFeePercent New fee percentage (1-20%)
     */
    function setPlatformFee(uint256 newFeePercent) public {
        require(msg.sender == platformWallet, "Only platform owner can set fee");
        require(newFeePercent <= 20, "Fee cannot exceed 20%");
        platformFeePercent = newFeePercent;
    }
}
