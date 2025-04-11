export const CONTRACT_ADDRESS = '0x0e79dd711611bB54d70BFac1a5f8A3de62f8d015';
export const BingoABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "BingoClaimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "callNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "CardGenerated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "claimBingo",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "entryFee",
				"type": "uint256"
			}
		],
		"name": "createRoom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "GameStarted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "joinRoom",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "row",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "col",
				"type": "uint8"
			}
		],
		"name": "markNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "number",
				"type": "uint256"
			}
		],
		"name": "NumberCalled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "PlayerJoinedRoom",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "entryFee",
				"type": "uint256"
			}
		],
		"name": "RoomCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newFeePercent",
				"type": "uint256"
			}
		],
		"name": "setPlatformFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "startGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllRooms",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "getPlayerCard",
		"outputs": [
			{
				"internalType": "uint8[5]",
				"name": "bColumn",
				"type": "uint8[5]"
			},
			{
				"internalType": "uint8[5]",
				"name": "iColumn",
				"type": "uint8[5]"
			},
			{
				"internalType": "uint8[5]",
				"name": "nColumn",
				"type": "uint8[5]"
			},
			{
				"internalType": "uint8[5]",
				"name": "gColumn",
				"type": "uint8[5]"
			},
			{
				"internalType": "uint8[5]",
				"name": "oColumn",
				"type": "uint8[5]"
			},
			{
				"internalType": "bool[25]",
				"name": "marked",
				"type": "bool[25]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "getRoomDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "playerCount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "gameInProgress",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "entryFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "prize",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "calledNumbers",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_BINGO_NUMBER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NUMBER_CALL_INTERVAL",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeePercent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformWallet",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "playerAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "playerCards",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "roomIds",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "rooms",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "maxPlayers",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "playerCount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "gameInProgress",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "entryFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "prize",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastNumberTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];