import type { SupportedChainId } from "./config";

export type TokenSymbol = "ETH" | "USDC" | "POL" | "BNB" | "ARB" | "WBTC";

export interface TokenAsset {
  symbol: TokenSymbol;
  name: string;
  chainId: SupportedChainId;
  balance: number;
  priceUsd: number;
  change24h: number;
  color: string;
}

export type TxStatus = "confirmed" | "pending" | "failed";
export type TxKind = "send" | "swap" | "mint" | "stake" | "transfer";

export interface TxRecord {
  id: string;
  hash: `0x${string}`;
  kind: TxKind;
  title: string;
  amountLabel: string;
  counterparty: string;
  chainId: SupportedChainId;
  status: TxStatus;
  timestamp: string;
  isDemo: boolean;
}

export type NftRarity = "Mythic" | "Legendary" | "Epic" | "Rare";

export interface NftCollectible {
  id: string;
  tokenId: string;
  name: string;
  collection: string;
  image: string;
  imageHiRes: string;
  placeholderColor: string;
  rarity: NftRarity;
  rarityRank: string;
  floorEth: number;
  chainId: SupportedChainId;
  owner: string;
  ownedByUser: boolean;
  contractAddress: `0x${string}`;
  standard: "ERC-721";
  description: string;
  traits: { label: string; value: string; prevalence: string }[];
}

export interface PortfolioPoint {
  label: string;
  value: number;
}

export type TimeframeKey = "7D" | "30D" | "90D" | "1Y";

export const DEMO_WALLET_ADDRESS =
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7" as const;

export const DEMO_TOKENS: TokenAsset[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    chainId: 1,
    balance: 3.42,
    priceUsd: 3280,
    change24h: 4.18,
    color: "#627EEA",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chainId: 8453,
    balance: 5420.5,
    priceUsd: 1.0,
    change24h: 0.01,
    color: "#2775CA",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    chainId: 42161,
    balance: 2850,
    priceUsd: 1.14,
    change24h: 6.45,
    color: "#28A0F0",
  },
  {
    symbol: "BNB",
    name: "BNB",
    chainId: 56,
    balance: 4.15,
    priceUsd: 618,
    change24h: -1.12,
    color: "#F3BA2F",
  },
  {
    symbol: "POL",
    name: "Polygon Ecosystem",
    chainId: 137,
    balance: 3120,
    priceUsd: 0.56,
    change24h: 2.84,
    color: "#8247E5",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    chainId: 1,
    balance: 0.045,
    priceUsd: 91200,
    change24h: 3.05,
    color: "#F7931A",
  },
];

export const DEMO_PORTFOLIO_HISTORY: Record<TimeframeKey, PortfolioPoint[]> = {
  "7D": [
    { label: "Mon", value: 25410 },
    { label: "Tue", value: 25980 },
    { label: "Wed", value: 25690 },
    { label: "Thu", value: 26420 },
    { label: "Fri", value: 27015 },
    { label: "Sat", value: 27480 },
    { label: "Sun", value: 28301 },
  ],
  "30D": [
    { label: "W1", value: 22800 },
    { label: "W2", value: 24150 },
    { label: "W3", value: 23680 },
    { label: "W4", value: 25910 },
    { label: "W5", value: 27120 },
    { label: "Now", value: 28301 },
  ],
  "90D": [
    { label: "Sep", value: 19400 },
    { label: "Oct", value: 21950 },
    { label: "Nov", value: 24800 },
    { label: "Now", value: 28301 },
  ],
  "1Y": [
    { label: "Q1", value: 14200 },
    { label: "Q2", value: 17900 },
    { label: "Q3", value: 22450 },
    { label: "Q4", value: 28301 },
  ],
};

export const DEMO_TRANSACTIONS: TxRecord[] = [
  {
    id: "demo-tx-1",
    hash: "0x8a92c4e1b7f0392a14c8d92761e4b30f92c81a4e5b7d21f0c4a89e1b3f6d20a1",
    kind: "stake",
    title: "Staked in Mint Vault",
    amountLabel: "1.25 ETH",
    counterparty: "0x4A1c...89F2",
    chainId: 1,
    status: "confirmed",
    timestamp: "18 mins ago",
    isDemo: true,
  },
  {
    id: "demo-tx-2",
    hash: "0x3f71d9a2c8e0415b29a6f81340c2e97d11b4a62f8c3e90d2a5b71c4e8f2a91b4",
    kind: "swap",
    title: "Swapped USDC → ARB",
    amountLabel: "850 USDC",
    counterparty: "Tally Router v2",
    chainId: 42161,
    status: "confirmed",
    timestamp: "3 hours ago",
    isDemo: true,
  },
  {
    id: "demo-tx-3",
    hash: "0x6c42e8f9a1b3074d58e2c91073f4a82b60d1e95c4a7b83f1d2e60a9c4b7f35e2",
    kind: "mint",
    title: "Minted Genesis Vault #0421",
    amountLabel: "0.08 ETH",
    counterparty: "Tally Genesis Pass",
    chainId: 8453,
    status: "confirmed",
    timestamp: "Yesterday",
    isDemo: true,
  },
  {
    id: "demo-tx-4",
    hash: "0x9b14f2c7d8e0632a47b5d19802e3c74f51a8b26d9e4c01f3a6b82d5e9c1f40c8",
    kind: "send",
    title: "Sent POL to Treasury",
    amountLabel: "420 POL",
    counterparty: "0x91eB...22D0",
    chainId: 137,
    status: "failed",
    timestamp: "2 days ago",
    isDemo: true,
  },
];

export const DEMO_NFTS: NftCollectible[] = [
  {
    id: "nft-vault-cube",
    tokenId: "#0421",
    name: "Mint Vault Cube",
    collection: "Genesis Vaults",
    image: "/src/assets/images/nft_mint_vault_cube_1795784524735_480.webp",
    imageHiRes: "/src/assets/images/nft_mint_vault_cube_1795784524735_800.webp",
    placeholderColor: "#143554",
    rarity: "Mythic",
    rarityRank: "Top 1.2%",
    floorEth: 1.45,
    chainId: 1,
    owner: DEMO_WALLET_ADDRESS,
    ownedByUser: true,
    contractAddress: "0x98A2cE41b7F0392a14C8d92761e4B30f92c81A4E",
    standard: "ERC-721",
    description:
      "A frosted electric-mint hardware vault artifact with a spinning gold cryptographic core. Grants boosted staking yield inside Tally Protocol.",
    traits: [
      { label: "Chassis", value: "Frosted Mint", prevalence: "2.1%" },
      { label: "Core", value: "Solar Gold Key", prevalence: "1.4%" },
      { label: "Pedestal", value: "Royal Cobalt", prevalence: "8.5%" },
      { label: "Yield Boost", value: "+1.2% APY", prevalence: "3.0%" },
    ],
  },
  {
    id: "nft-coin-totem",
    tokenId: "#1088",
    name: "Cobalt Coin Totem",
    collection: "Chrome Coins",
    image: "/src/assets/images/nft_cobalt_coin_totem_1795784527391_480.webp",
    imageHiRes: "/src/assets/images/nft_cobalt_coin_totem_1795784527391_800.webp",
    placeholderColor: "#18397a",
    rarity: "Legendary",
    rarityRank: "Top 3.8%",
    floorEth: 0.82,
    chainId: 8453,
    owner: DEMO_WALLET_ADDRESS,
    ownedByUser: true,
    contractAddress: "0x31F8bC92d4E0512a78B1c49203a6D18f40e92B1C",
    standard: "ERC-721",
    description:
      "Stacked sovereign coin totem forged from brushed brass, matte cobalt ceramic, and refracting violet shards. Zero-fee Base bridge pass.",
    traits: [
      { label: "Alloy", value: "Brushed Brass", prevalence: "5.2%" },
      { label: "Crown", value: "Coral Ring", prevalence: "6.4%" },
      { label: "Prism", value: "Tri-Violet", prevalence: "4.1%" },
      { label: "Perk", value: "Free Bridges", prevalence: "7.0%" },
    ],
  },
  {
    id: "nft-prism-key",
    tokenId: "#2304",
    name: "Coral Prism Key",
    collection: "Cyber Keys",
    image: "/src/assets/images/nft_coral_prism_key_1795784527917_480.webp",
    imageHiRes: "/src/assets/images/nft_coral_prism_key_1795784527917_800.webp",
    placeholderColor: "#422c6b",
    rarity: "Epic",
    rarityRank: "Top 9.4%",
    floorEth: 0.54,
    chainId: 42161,
    owner: "0xB891e4F20cD3a1189F4b72e901A4c32E118D7a90",
    ownedByUser: false,
    contractAddress: "0x72E4dA19c6B8304f15A9e72184c2F60b31d84E5A",
    standard: "ERC-721",
    description:
      "Twin coral-and-marigold master keys sealed inside a lavender gravity sphere. Unlocks early Arbitrum governance proposals.",
    traits: [
      { label: "Sphere", value: "Lavender Glass", prevalence: "11.0%" },
      { label: "Finish", value: "Coral Ceramic", prevalence: "9.8%" },
      { label: "Mount", value: "Faceted Brass", prevalence: "14.2%" },
      { label: "Voting", value: "2x Weight", prevalence: "8.9%" },
    ],
  },
  {
    id: "nft-ledger-orb",
    tokenId: "#0779",
    name: "Violet Ledger Orb",
    collection: "Hologram Ledgers",
    image: "/src/assets/images/nft_violet_ledger_orb_1795784529371_480.webp",
    imageHiRes: "/src/assets/images/nft_violet_ledger_orb_1795784529371_800.webp",
    placeholderColor: "#25245e",
    rarity: "Rare",
    rarityRank: "Top 14.6%",
    floorEth: 0.39,
    chainId: 137,
    owner: DEMO_WALLET_ADDRESS,
    ownedByUser: true,
    contractAddress: "0x54C9aF83e1D7206b49E3c15872a4B90d62f13C7D",
    standard: "ERC-721",
    description:
      "Iridescent mint-and-violet state sphere strapped in brushed titanium bands with orbiting gold tiles. Verifies Polygon gasless swaps.",
    traits: [
      { label: "Shell", value: "Holo Mint-Violet", prevalence: "12.5%" },
      { label: "Bands", value: "Brushed Steel", prevalence: "16.8%" },
      { label: "Satellites", value: "Gold Shards", prevalence: "10.3%" },
      { label: "Gas Rebate", value: "50% Back", prevalence: "15.0%" },
    ],
  },
];
