export interface GameRoom {
  _id?: string;
  roomId: string;
  name: string;
  maxPlayers: number;
  players: Player[];
  status: 'Waiting' | 'In Progress' | 'Finished';
  calledNumbers: number[];
  latestNumber?: { letter: string; number: number };
  winner?: string;
  createdAt?: string;
}

export interface SelectedCellsType {
  [key: string]: boolean;
}

export interface PlayerType {
  id: number;
  name: string;
  score: number;
  bingos: number;
}

export interface ApiError {
  error: string;
  remainingSeconds?: number;
}

export interface StartGameResponse {
  message: string;
  status: 'Waiting' | 'In Progress' | 'Finished';
}

export interface ChatMessageType {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

export interface CallNumberResponse {
  message: string;
  calledNumbers: number[];
  latestNumber: { letter: string; number: number };
}

export interface BingoCard {
  B: (number | string)[];
  I: (number | string)[];
  N: (number | string)[];
  G: (number | string)[];
  O: (number | string)[];
}

export interface Player {
  userId: string;
  username: string;
  score: number;
  bingos: number;
  bingoCard: BingoCard;
}

export interface CheckBingoResponse {
  message: string;
  hasBingo: boolean;
  winner?: string;
  status?: 'Waiting' | 'In Progress' | 'Finished';
}
