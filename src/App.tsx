import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { HashRouter, Route, Routes } from 'react-router-dom';

import Lobby from "./pages/Lobby";
import BingoGame from "./pages/BingoGame";
import BingoGameOffChain from "./pages/BingoGameOffChain";
import TestBingoGame from "./pages/TestBingoGame";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/game/test"
          element={<TestBingoGame />} />
        <Route
          path="/game/offchain/:gameid"
          element={<BingoGameOffChain />} />
        <Route
          path="/game/:gameid"
          element={<BingoGame />} />
        <Route
          path="/"
          element={<Lobby />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
