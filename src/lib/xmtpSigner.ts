import type { Signer, Identifier } from "@xmtp/browser-sdk";
import { useAccount, useSignMessage } from "wagmi";

// Hook to create XMTP signer with wagmi
export function useXmtpSigner(): Signer | null {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  if (!isConnected || !address) {
    return null;
  }

  const accountIdentifier: Identifier = {
    identifier: address,
    identifierKind: "Ethereum",
  };

  const signer: Signer = {
    type: "EOA",
    getIdentifier: () => accountIdentifier,
    signMessage: async (message: string): Promise<Uint8Array> => {
      try {
        // Sign the message using wagmi
        const signature = await signMessageAsync({ message });
        
        // Convert hex string to Uint8Array
        // Remove '0x' prefix if present
        const hexString = signature.startsWith('0x') ? signature.slice(2) : signature;
        
        // Convert hex to bytes
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        
        return bytes;
      } catch (error) {
        console.error('Failed to sign message:', error);
        throw error;
      }
    },
  };

  return signer;
}