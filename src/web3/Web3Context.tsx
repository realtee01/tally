import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { formatUnits } from "viem";
import {
  CHAIN_BY_ID,
  SUPPORTED_CHAINS,
  abbreviateAddress,
  wagmiConfig,
  type ChainMeta,
  type SupportedChainId,
} from "./config";
import {
  DEMO_TRANSACTIONS,
  DEMO_WALLET_ADDRESS,
  type TxKind,
  type TxRecord,
} from "./data";

export type WalletMode = "disconnected" | "live" | "demo";
export type WalletProviderChoice =
  | "metamask"
  | "coinbase"
  | "walletconnect"
  | "demo";

export interface TxModalRequest {
  kind: TxKind;
  title: string;
  assetSymbol: string;
  defaultAmount?: string;
  defaultRecipient?: string;
  editable?: boolean;
  subtitle?: string;
}

interface Web3ContextValue {
  mode: WalletMode;
  isConnected: boolean;
  address: `0x${string}` | undefined;
  abbreviatedAddress: string;
  connectorName: string;
  activeChainId: SupportedChainId;
  activeChain: ChainMeta;
  supportedChains: ChainMeta[];
  isSwitchingChain: boolean;
  networkError: string | null;
  clearNetworkError: () => void;
  switchNetwork: (chainId: SupportedChainId) => Promise<void>;
  connectWallet: (provider: WalletProviderChoice) => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  connectError: string | null;
  clearConnectError: () => void;
  liveNativeBalance: {
    formatted: string;
    symbol: string;
    numeric: number;
  } | null;
  isBalanceLoading: boolean;
  balanceError: string | null;
  refetchBalance: () => void;
  transactions: TxRecord[];
  addTransaction: (tx: TxRecord) => void;
  updateTransaction: (id: string, patch: Partial<TxRecord>) => void;
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  txModalRequest: TxModalRequest | null;
  openTxModal: (req: TxModalRequest) => void;
  closeTxModal: () => void;
}

const Web3Context = React.createContext<Web3ContextValue | null>(null);

const queryClient = new QueryClient();

function Web3StateInner({ children }: { children: React.ReactNode }) {
  const {
    address: wagmiAddress,
    isConnected: wagmiConnected,
    connector,
  } = useAccount();
  const wagmiChainId = useChainId();
  const { isPending: wagmiConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: wagmiSwitching } = useSwitchChain();

  const [demoConnected, setDemoConnected] = React.useState(false);
  const [demoProviderName, setDemoProviderName] = React.useState("Demo Wallet");
  const [demoConnecting, setDemoConnecting] = React.useState(false);
  const [demoChainId, setDemoChainId] = React.useState<SupportedChainId>(1);
  const [demoSwitching, setDemoSwitching] = React.useState(false);
  const [connectError, setConnectError] = React.useState<string | null>(null);
  const [networkError, setNetworkError] = React.useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = React.useState(false);
  const [txModalRequest, setTxModalRequest] =
    React.useState<TxModalRequest | null>(null);

  const [liveTxs, setLiveTxs] = React.useState<TxRecord[]>([]);
  const [demoTxs, setDemoTxs] = React.useState<TxRecord[]>(DEMO_TRANSACTIONS);

  const mode: WalletMode = wagmiConnected
    ? "live"
    : demoConnected
      ? "demo"
      : "disconnected";

  const isConnected = mode !== "disconnected";
  const address: `0x${string}` | undefined =
    mode === "live"
      ? wagmiAddress
      : mode === "demo"
        ? DEMO_WALLET_ADDRESS
        : undefined;

  const rawChainId = mode === "live" ? wagmiChainId : demoChainId;
  const activeChainId: SupportedChainId = (
    CHAIN_BY_ID[rawChainId] ? rawChainId : 1
  ) as SupportedChainId;
  const activeChain = CHAIN_BY_ID[activeChainId] || SUPPORTED_CHAINS[0];

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    error: rawBalanceError,
    refetch: refetchWagmiBalance,
  } = useBalance({
    address: mode === "live" ? wagmiAddress : undefined,
    chainId: activeChainId,
    query: {
      enabled: mode === "live" && Boolean(wagmiAddress),
    },
  });

  const liveNativeBalance = React.useMemo(() => {
    if (mode !== "live" || !balanceData) return null;
    const formattedFull = formatUnits(balanceData.value, balanceData.decimals);
    const num = Number.parseFloat(formattedFull);
    return {
      formatted: Number.isFinite(num) ? num.toFixed(4) : "0.0000",
      symbol: balanceData.symbol,
      numeric: Number.isFinite(num) ? num : 0,
    };
  }, [mode, balanceData]);

  const connectWallet = React.useCallback(
    async (provider: WalletProviderChoice) => {
      setConnectError(null);
      const labelMap: Record<WalletProviderChoice, string> = {
        metamask: "MetaMask",
        walletconnect: "WalletConnect",
        coinbase: "Coinbase Wallet",
        demo: "Demo Wallet",
      };

      setDemoConnecting(true);
      await new Promise((r) => window.setTimeout(r, 380));
      setDemoProviderName(labelMap[provider]);
      setDemoConnected(true);
      setDemoConnecting(false);
      setWalletModalOpen(false);
    },
    []
  );

  const disconnectWallet = React.useCallback(() => {
    setConnectError(null);
    setNetworkError(null);
    if (wagmiConnected) {
      disconnect();
    }
    setDemoConnected(false);
    setWalletModalOpen(false);
  }, [wagmiConnected, disconnect]);

  const switchNetwork = React.useCallback(
    async (chainId: SupportedChainId) => {
      setNetworkError(null);
      if (mode === "live") {
        try {
          await switchChainAsync({ chainId });
        } catch (err) {
          setNetworkError(
            err instanceof Error
              ? err.message
              : "Network switch was rejected by your wallet."
          );
        }
        return;
      }
      setDemoSwitching(true);
      await new Promise((r) => window.setTimeout(r, 260));
      setDemoChainId(chainId);
      setDemoSwitching(false);
    },
    [mode, switchChainAsync]
  );

  const addTransaction = React.useCallback(
    (tx: TxRecord) => {
      if (tx.isDemo) {
        setDemoTxs((prev) => [tx, ...prev]);
      } else {
        setLiveTxs((prev) => [tx, ...prev]);
      }
    },
    []
  );

  const updateTransaction = React.useCallback(
    (id: string, patch: Partial<TxRecord>) => {
      setDemoTxs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
      setLiveTxs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const transactions = mode === "live" ? liveTxs : mode === "demo" ? demoTxs : [];

  const value: Web3ContextValue = {
    mode,
    isConnected,
    address,
    abbreviatedAddress: abbreviateAddress(address),
    connectorName:
      mode === "live"
        ? connector?.name || "Injected Wallet"
        : mode === "demo"
          ? demoProviderName
          : "",
    activeChainId,
    activeChain,
    supportedChains: SUPPORTED_CHAINS,
    isSwitchingChain: mode === "live" ? wagmiSwitching : demoSwitching,
    networkError,
    clearNetworkError: () => setNetworkError(null),
    switchNetwork,
    connectWallet,
    disconnectWallet,
    isConnecting: wagmiConnecting || demoConnecting,
    connectError,
    clearConnectError: () => setConnectError(null),
    liveNativeBalance,
    isBalanceLoading,
    balanceError: rawBalanceError ? rawBalanceError.message : null,
    refetchBalance: () => {
      if (mode === "live") void refetchWagmiBalance();
    },
    transactions,
    addTransaction,
    updateTransaction,
    walletModalOpen,
    setWalletModalOpen,
    txModalRequest,
    openTxModal: (req) => setTxModalRequest(req),
    closeTxModal: () => setTxModalRequest(null),
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3StateInner>{children}</Web3StateInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWeb3() {
  const ctx = React.useContext(Web3Context);
  if (!ctx) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return ctx;
}
