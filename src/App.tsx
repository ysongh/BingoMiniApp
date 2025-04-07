import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";

import Lobby from "./pages/Lobby";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <div>Mini App + Vite + TS + React + Wagmi</div>
      <Lobby />
    </>
  );
}

export default App;
