import {
  useAccount,
  useConnect,
  useChains,
  useChainId,
} from "wagmi";

import { formatAddress } from "../utils/format";

export function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const chains = useChains();
  const chainId = useChainId();

  const currentChain = chains.find(chain => chain.id === chainId);

  if (isConnected) {
    return (
      <>
        <p>Connected to: {currentChain ? currentChain.name : 'Not connected'}</p>
        <div>Connected account:</div>
        <div>{formatAddress(address || "")}</div>
        {/* <SignButton /> */}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
    >
      Connect
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