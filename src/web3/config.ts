import { createConfig, http } from "wagmi";
import { mainnet, polygon, bsc, arbitrum, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export type SupportedChainId =
  | typeof mainnet.id
  | typeof polygon.id
  | typeof bsc.id
  | typeof arbitrum.id
  | typeof base.id;

export interface ChainMeta {
  id: SupportedChainId;
  name: string;
  shortName: string;
  nativeSymbol: string;
  accent: string;
  explorerUrl: string;
  explorerName: string;
  avgGasUsd: string;
}

export const SUPPORTED_CHAINS: ChainMeta[] = [
  {
    id: mainnet.id,
    name: "Ethereum",
    shortName: "Ethereum",
    nativeSymbol: "ETH",
    accent: "#627EEA",
    explorerUrl: "https://etherscan.io",
    explorerName: "Etherscan",
    avgGasUsd: "$1.84",
  },
  {
    id: polygon.id,
    name: "Polygon",
    shortName: "Polygon",
    nativeSymbol: "POL",
    accent: "#8247E5",
    explorerUrl: "https://polygonscan.com",
    explorerName: "Polygonscan",
    avgGasUsd: "$0.02",
  },
  {
    id: bsc.id,
    name: "BNB Smart Chain",
    shortName: "BNB Chain",
    nativeSymbol: "BNB",
    accent: "#F3BA2F",
    explorerUrl: "https://bscscan.com",
    explorerName: "BscScan",
    avgGasUsd: "$0.09",
  },
  {
    id: arbitrum.id,
    name: "Arbitrum",
    shortName: "Arbitrum",
    nativeSymbol: "ETH",
    accent: "#28A0F0",
    explorerUrl: "https://arbiscan.io",
    explorerName: "Arbiscan",
    avgGasUsd: "$0.04",
  },
  {
    id: base.id,
    name: "Base",
    shortName: "Base",
    nativeSymbol: "ETH",
    accent: "#0052FF",
    explorerUrl: "https://basescan.org",
    explorerName: "BaseScan",
    avgGasUsd: "$0.01",
  },
];

export const CHAIN_BY_ID: Record<number, ChainMeta> = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, c])
);

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, base],
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: "coinbaseWallet" }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

export function abbreviateAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length < 11) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function abbreviateHash(hash?: string | null): string {
  if (!hash) return "";
  if (hash.length < 14) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function getExplorerTxUrl(chainId: number, hash: string): string {
  const meta = CHAIN_BY_ID[chainId] || SUPPORTED_CHAINS[0];
  return `${meta.explorerUrl}/tx/${hash}`;
}

export function getExplorerAddressUrl(
  chainId: number,
  address: string
): string {
  const meta = CHAIN_BY_ID[chainId] || SUPPORTED_CHAINS[0];
  return `${meta.explorerUrl}/address/${address}`;
}
