import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useChains,
  useChainId,
} from "wagmi";
import sdk from "@farcaster/frame-sdk";

import { formatAddress } from "../utils/format";

export function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const chains = useChains();
  const chainId = useChainId();

  const currentChain = chains.find(chain => chain.id === chainId);

  const [username, setUsername] = useState<string>("");
  const [pfpUrl, setpfpUrl] = useState<string>("");

  useEffect(() => {
    const loadSDK = async () => {
      const context = await sdk.context;
      setUsername(context?.user?.username || "");
      setpfpUrl(context?.user?.pfpUrl || "");
    }
    loadSDK();
  }, [])

  if (isConnected) {
    return (
      <div className="bg-indigo-600 text-white flex justify-between py-2 px-4">
        <div>
          <p>Connected to: {currentChain ? currentChain.name : 'Not connected'}</p>
        </div>
        <div className="flex">
          <img
            src={pfpUrl ? pfpUrl : `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
            alt="wallet avatar"
            className="w-6 h-6 rounded-full mr-1"
          />
          <div>{username ? username : formatAddress(address || "")}</div>
        </div>
        {/* <SignButton /> */}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
    >
      Connect Wallet to Play
    </button>
  );
}

// function SignButton() {
//   const { signMessage, isPending, data, error } = useSignMessage();

//   return (
//     <>
//       <button
//         type="button"
//         onClick={() => signMessage({ message: "hello world" })}
//         disabled={isPending}
//         className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
//       >
//         {isPending ? "Signing..." : "Sign message"}
//       </button>
//       {data && (
//         <>
//           <div>Signature</div>
//           <div>{data}</div>
//         </>
//       )}
//       {error && (
//         <>
//           <div>Error</div>
//           <div>{error.message}</div>
//         </>
//       )}
//     </>
//   );
// }