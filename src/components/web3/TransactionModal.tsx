import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseEther } from "viem";
import { useWeb3 } from "../../web3/Web3Context";
import {
  abbreviateAddress,
  abbreviateHash,
  getExplorerTxUrl,
} from "../../web3/config";
import { ChainIcon } from "./ChainIcon";

type ModalStep = "review" | "confirming" | "pending" | "success" | "failed";

function randomDemoHash(): `0x${string}` {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out as `0x${string}`;
}

export function TransactionModal() {
  const {
    mode,
    isConnected,
    activeChain,
    txModalRequest,
    closeTxModal,
    setWalletModalOpen,
    addTransaction,
    updateTransaction,
  } = useWeb3();

  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [step, setStep] = React.useState<ModalStep>("review");
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [copiedHash, setCopiedHash] = React.useState(false);

  const { sendTransactionAsync } = useSendTransaction();
  const {
    isSuccess: liveReceiptSuccess,
    isError: liveReceiptError,
    error: liveReceiptErrObj,
  } = useWaitForTransactionReceipt({
    hash: mode === "live" && txHash ? txHash : undefined,
    query: {
      enabled: mode === "live" && Boolean(txHash) && step === "pending",
    },
  });

  const activeRecordIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!txModalRequest) return;
    setRecipient(
      txModalRequest.defaultRecipient ||
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    );
    setAmount(txModalRequest.defaultAmount || "0.05");
    setStep("review");
    setTxHash(null);
    setErrorMsg(null);
    setSimulateFailure(false);
    setCopiedHash(false);
    activeRecordIdRef.current = null;
  }, [txModalRequest]);

  React.useEffect(() => {
    if (mode !== "live" || step !== "pending") return;
    if (liveReceiptSuccess) {
      setStep("success");
      if (activeRecordIdRef.current) {
        updateTransaction(activeRecordIdRef.current, { status: "confirmed" });
      }
    } else if (liveReceiptError) {
      setStep("failed");
      setErrorMsg(
        liveReceiptErrObj?.message || "Transaction reverted on-chain."
      );
      if (activeRecordIdRef.current) {
        updateTransaction(activeRecordIdRef.current, { status: "failed" });
      }
    }
  }, [
    mode,
    step,
    liveReceiptSuccess,
    liveReceiptError,
    liveReceiptErrObj,
    updateTransaction,
  ]);

  React.useEffect(() => {
    if (!txModalRequest) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "confirming") {
        closeTxModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [txModalRequest, step, closeTxModal]);

  const handleCopyHash = async () => {
    if (!txHash) return;
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedHash(true);
      window.setTimeout(() => setCopiedHash(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleConfirm = async () => {
    if (!txModalRequest) return;
    setErrorMsg(null);

    if (!isConnected) {
      closeTxModal();
      setWalletModalOpen(true);
      return;
    }

    if (!isAddress(recipient.trim())) {
      setErrorMsg("Enter a valid 0x EVM recipient or contract address.");
      return;
    }

    const numericAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      setErrorMsg("Enter a valid non-negative transaction amount.");
      return;
    }

    const recId = "tx-" + Date.now();
    activeRecordIdRef.current = recId;

    if (mode === "live") {
      try {
        setStep("confirming");
        const hash = await sendTransactionAsync({
          to: recipient.trim() as `0x${string}`,
          value: parseEther(numericAmount > 0 ? String(numericAmount) : "0"),
          chainId: activeChain.id,
        });
        setTxHash(hash);
        setStep("pending");
        addTransaction({
          id: recId,
          hash,
          kind: txModalRequest.kind,
          title: txModalRequest.title,
          amountLabel: `${amount} ${txModalRequest.assetSymbol}`,
          counterparty: abbreviateAddress(recipient.trim()),
          chainId: activeChain.id,
          status: "pending",
          timestamp: "Just now",
          isDemo: false,
        });
      } catch (err) {
        setStep("failed");
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Transaction signature was rejected by your wallet."
        );
      }
      return;
    }

    // Transparent Demo Simulation mode
    setStep("confirming");
    await new Promise((r) => window.setTimeout(r, 700));

    const demoHash = randomDemoHash();
    setTxHash(demoHash);
    setStep("pending");

    addTransaction({
      id: recId,
      hash: demoHash,
      kind: txModalRequest.kind,
      title: txModalRequest.title,
      amountLabel: `${amount} ${txModalRequest.assetSymbol}`,
      counterparty: abbreviateAddress(recipient.trim()),
      chainId: activeChain.id,
      status: "pending",
      timestamp: "Just now",
      isDemo: true,
    });

    await new Promise((r) => window.setTimeout(r, 1500));

    if (simulateFailure) {
      setStep("failed");
      setErrorMsg(
        "Simulated revert: gas limit exceeded or slippage threshold breached (Demo Mode)."
      );
      updateTransaction(recId, { status: "failed" });
    } else {
      setStep("success");
      updateTransaction(recId, { status: "confirmed" });
    }
  };

  return (
    <AnimatePresence>
      {txModalRequest && (
        <motion.div
          className="w3-modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && step !== "confirming") {
              closeTxModal();
            }
          }}
        >
          <motion.div
            className="w3-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Blockchain transaction confirmation"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w3-modal-head w3-modal-head-gold">
              <div className="w3-modal-title-row">
                <ArrowUpRight size={20} strokeWidth={2.6} aria-hidden="true" />
                <h2 className="w3-modal-title">{txModalRequest.title}</h2>
              </div>
              <button
                type="button"
                className="tb-drawer-close"
                onClick={closeTxModal}
                disabled={step === "confirming"}
                aria-label="Close transaction modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="w3-modal-body">
              <div className="w3-tx-mode-bar">
                <span className="w3-tx-chain-chip">
                  <ChainIcon chainId={activeChain.id} size={16} />
                  <span>{activeChain.name}</span>
                </span>
                <span
                  className={
                    "w3-mode-tag" +
                    (mode === "live" ? " w3-mode-tag-live" : " w3-mode-tag-demo")
                  }
                >
                  {mode === "live" ? "Live On-Chain" : "Demo Simulation"}
                </span>
              </div>

              {step === "review" && (
                <div className="w3-tx-review">
                  {txModalRequest.subtitle && (
                    <p className="w3-modal-lead">{txModalRequest.subtitle}</p>
                  )}

                  <div className="w3-field">
                    <label htmlFor="w3-tx-recipient">
                      Recipient / Contract Address
                    </label>
                    <input
                      id="w3-tx-recipient"
                      type="text"
                      className="w3-input w3-mono"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      readOnly={txModalRequest.editable === false}
                      placeholder="0x..."
                    />
                  </div>

                  <div className="w3-field">
                    <label htmlFor="w3-tx-amount">
                      Amount ({txModalRequest.assetSymbol})
                    </label>
                    <input
                      id="w3-tx-amount"
                      type="text"
                      inputMode="decimal"
                      className="w3-input w3-tabular"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      readOnly={txModalRequest.editable === false}
                    />
                  </div>

                  <div className="w3-tx-summary">
                    <div>
                      <span>Network</span>
                      <strong>{activeChain.name}</strong>
                    </div>
                    <div>
                      <span>Est. Network Fee</span>
                      <strong className="w3-tabular">
                        ~{activeChain.avgGasUsd} ({activeChain.nativeSymbol})
                      </strong>
                    </div>
                    <div>
                      <span>Explorer</span>
                      <strong>{activeChain.explorerName}</strong>
                    </div>
                  </div>

                  {mode === "demo" && (
                    <label className="w3-demo-toggle">
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                      />
                      <span>
                        Simulate failed transaction (test error recovery state)
                      </span>
                    </label>
                  )}

                  {errorMsg && (
                    <div className="w3-alert-err" role="alert">
                      <AlertTriangle size={16} className="w3-alert-ico" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="w3-tx-actions">
                    <button
                      type="button"
                      className="w3-btn-ghost"
                      onClick={closeTxModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="tb-btn"
                      onClick={handleConfirm}
                    >
                      {isConnected
                        ? mode === "live"
                          ? "Sign & Broadcast"
                          : "Simulate Transaction"
                        : "Connect Wallet First"}
                    </button>
                  </div>
                </div>
              )}

              {step === "confirming" && (
                <div className="w3-tx-state">
                  <motion.div
                    className="w3-tx-orb w3-tx-orb-busy"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "linear",
                    }}
                  >
                    <Loader2 size={36} strokeWidth={2.5} />
                  </motion.div>
                  <h3>Awaiting Signature</h3>
                  <p>
                    {mode === "live"
                      ? "Check your connected wallet extension to approve this transaction."
                      : "Preparing simulated transaction payload for Tally Demo Mode…"}
                  </p>
                </div>
              )}

              {step === "pending" && (
                <div className="w3-tx-state">
                  <motion.div
                    className="w3-tx-orb w3-tx-orb-pending"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                  >
                    <Loader2 size={36} className="w3-spin" strokeWidth={2.5} />
                  </motion.div>
                  <h3>Transaction Processing</h3>
                  <p>
                    Broadcasting on <strong>{activeChain.name}</strong> and
                    waiting for block confirmation…
                  </p>
                  {txHash && (
                    <div className="w3-hash-box">
                      <span className="w3-mono">{abbreviateHash(txHash)}</span>
                      <button
                        type="button"
                        className="w3-chip-btn"
                        onClick={handleCopyHash}
                      >
                        {copiedHash ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedHash ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={getExplorerTxUrl(activeChain.id, txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w3-chip-btn"
                      >
                        <ExternalLink size={13} />
                        <span>{activeChain.explorerName}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {step === "success" && (
                <div className="w3-tx-state">
                  <motion.div
                    className="w3-tx-orb w3-tx-orb-ok"
                    initial={{ scale: 0.4, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                  </motion.div>
                  <h3>
                    {mode === "live"
                      ? "Transaction Confirmed"
                      : "Simulation Confirmed"}
                  </h3>
                  <p>
                    <strong>
                      {amount} {txModalRequest.assetSymbol}
                    </strong>{" "}
                    settled on {activeChain.name} and logged in your transaction
                    history.
                  </p>
                  {txHash && (
                    <div className="w3-hash-box">
                      <span className="w3-mono">{abbreviateHash(txHash)}</span>
                      <button
                        type="button"
                        className="w3-chip-btn"
                        onClick={handleCopyHash}
                      >
                        {copiedHash ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedHash ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={getExplorerTxUrl(activeChain.id, txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w3-chip-btn"
                      >
                        <ExternalLink size={13} />
                        <span>View on {activeChain.explorerName}</span>
                      </a>
                    </div>
                  )}
                  <button
                    type="button"
                    className="tb-btn"
                    onClick={closeTxModal}
                  >
                    Done
                  </button>
                </div>
              )}

              {step === "failed" && (
                <div className="w3-tx-state">
                  <motion.div
                    className="w3-tx-orb w3-tx-orb-err"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  >
                    <XCircle size={40} strokeWidth={2.5} />
                  </motion.div>
                  <h3>Transaction Failed</h3>
                  <p className="w3-err-detail">
                    {errorMsg || "The transaction could not be completed."}
                  </p>
                  {txHash && (
                    <div className="w3-hash-box">
                      <span className="w3-mono">{abbreviateHash(txHash)}</span>
                      <a
                        href={getExplorerTxUrl(activeChain.id, txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w3-chip-btn"
                      >
                        <ExternalLink size={13} />
                        <span>{activeChain.explorerName}</span>
                      </a>
                    </div>
                  )}
                  <div className="w3-tx-actions">
                    <button
                      type="button"
                      className="w3-btn-ghost"
                      onClick={closeTxModal}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="tb-btn"
                      onClick={() => {
                        setStep("review");
                        setErrorMsg(null);
                      }}
                    >
                      <RefreshCw size={15} />
                      <span>Try Again</span>
                    </button>
                  </div>
                </div>
              )}

              {mode === "demo" && step !== "review" && (
                <p className="w3-demo-disclaimer">
                  <ShieldAlert size={14} />
                  <span>
                    Demo simulation — no live funds or mainnet gas were spent.
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
