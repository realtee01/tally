import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useWeb3, type WalletProviderChoice } from "../../web3/Web3Context";
import { getExplorerAddressUrl } from "../../web3/config";
import { ChainIcon, WalletBrandIcon } from "./ChainIcon";

const WALLET_OPTIONS: {
  id: WalletProviderChoice;
  label: string;
  desc: string;
}[] = [
  {
    id: "metamask",
    label: "MetaMask",
    desc: "Browser extension & mobile signer",
  },
  {
    id: "walletconnect",
    label: "WalletConnect",
    desc: "QR pairing & mobile wallet session",
  },
  {
    id: "coinbase",
    label: "Coinbase Wallet",
    desc: "Smart Wallet & browser extension",
  },
];

export function WalletConnectModal() {
  const {
    mode,
    isConnected,
    address,
    abbreviatedAddress,
    connectorName,
    activeChain,
    connectWallet,
    disconnectWallet,
    isConnecting,
    connectError,
    clearConnectError,
    liveNativeBalance,
    walletModalOpen,
    setWalletModalOpen,
  } = useWeb3();

  const [copied, setCopied] = React.useState(false);
  const [pendingProvider, setPendingProvider] =
    React.useState<WalletProviderChoice | null>(null);

  React.useEffect(() => {
    if (!walletModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWalletModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [walletModalOpen, setWalletModalOpen]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable in restricted iframe
    }
  };

  return (
    <AnimatePresence>
      {walletModalOpen && (
        <motion.div
          className="w3-modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              clearConnectError();
              setWalletModalOpen(false);
            }
          }}
        >
          <motion.div
            className="w3-modal"
            role="dialog"
            aria-modal="true"
            aria-label={isConnected ? "Connected wallet details" : "Connect wallet"}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w3-modal-head">
              <div className="w3-modal-title-row">
                <Wallet size={20} strokeWidth={2.5} aria-hidden="true" />
                <h2 className="w3-modal-title">
                  {isConnected ? "Connected Wallet" : "Connect Wallet"}
                </h2>
              </div>
              <button
                type="button"
                className="tb-drawer-close"
                onClick={() => {
                  clearConnectError();
                  setWalletModalOpen(false);
                }}
                aria-label="Close wallet modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="w3-modal-body">
              {isConnected && address ? (
                <div className="w3-acct-panel">
                  <div className="w3-acct-top">
                    <div className="w3-acct-mode">
                      <ShieldCheck size={15} />
                      <span>
                        {mode === "live"
                          ? `Live · ${connectorName}`
                          : `Demo · ${connectorName}`}
                      </span>
                    </div>
                    <div className="w3-acct-chain">
                      <ChainIcon chainId={activeChain.id} size={16} />
                      <span>{activeChain.name}</span>
                    </div>
                  </div>

                  <div className="w3-acct-addr-card">
                    <span className="w3-acct-addr">{abbreviatedAddress}</span>
                    <div className="w3-acct-actions">
                      <button
                        type="button"
                        className="w3-chip-btn"
                        onClick={handleCopy}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={getExplorerAddressUrl(activeChain.id, address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w3-chip-btn"
                      >
                        <ExternalLink size={14} />
                        <span>{activeChain.explorerName}</span>
                      </a>
                    </div>
                  </div>

                  <div className="w3-acct-bal-row">
                    <span>
                      {mode === "live" ? "Live Native Balance" : "Demo Portfolio"}
                    </span>
                    <strong className="w3-tabular">
                      {mode === "live"
                        ? liveNativeBalance
                          ? `${liveNativeBalance.formatted} ${liveNativeBalance.symbol}`
                          : `0.0000 ${activeChain.nativeSymbol}`
                        : "$28,301.10 (Demo)"}
                    </strong>
                  </div>

                  {mode === "demo" && (
                    <p className="w3-note-box">
                      Interactive demo mode &mdash; sample balances and
                      simulated transactions with no real funds or API keys
                      required.
                    </p>
                  )}

                  <button
                    type="button"
                    className="w3-disconnect-btn"
                    onClick={disconnectWallet}
                  >
                    <LogOut size={16} />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              ) : (
                <>
                  <p className="w3-modal-lead">
                    Choose a wallet below to launch the interactive Tally Web3
                    demo &mdash; no API keys or browser extensions required.
                  </p>

                  {connectError && (
                    <div className="w3-alert-err" role="alert">
                      <AlertCircle size={16} className="w3-alert-ico" />
                      <span>{connectError}</span>
                    </div>
                  )}

                  <div className="w3-wallet-list">
                    {WALLET_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="w3-wallet-opt"
                        disabled={isConnecting}
                        onClick={async () => {
                          setPendingProvider(opt.id);
                          await connectWallet(opt.id);
                          setPendingProvider(null);
                        }}
                      >
                        <WalletBrandIcon provider={opt.id} size={34} />
                        <span className="w3-wallet-opt-copy">
                          <span className="w3-wallet-opt-name">
                            {opt.label}
                          </span>
                          <span className="w3-wallet-opt-desc">{opt.desc}</span>
                        </span>
                        <span className="w3-wallet-opt-go">
                          {isConnecting && pendingProvider === opt.id
                            ? "Connecting…"
                            : "Connect"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="w3-divider">
                    <span>Or jump straight in</span>
                  </div>

                  <button
                    type="button"
                    className="w3-demo-btn"
                    disabled={isConnecting}
                    onClick={async () => {
                      setPendingProvider("demo");
                      await connectWallet("demo");
                      setPendingProvider(null);
                    }}
                  >
                    <Sparkles size={17} />
                    <span>
                      <strong>Quick Demo Session</strong>
                      <small>
                        Pre-loaded sample balances, multi-chain tokens, NFTs
                        &amp; tx flows
                      </small>
                    </span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
