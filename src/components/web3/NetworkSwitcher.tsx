import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useWeb3 } from "../../web3/Web3Context";
import { ChainIcon } from "./ChainIcon";

export function NetworkSwitcher({ compact = false }: { compact?: boolean }) {
  const {
    activeChain,
    supportedChains,
    switchNetwork,
    isSwitchingChain,
    networkError,
    clearNetworkError,
  } = useWeb3();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="w3-net-wrap">
      <button
        type="button"
        className={"w3-net-btn" + (compact ? " w3-net-btn-sm" : "")}
        onClick={() => {
          clearNetworkError();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active network: ${activeChain.name}. Switch blockchain network`}
      >
        {isSwitchingChain ? (
          <Loader2 size={16} className="w3-spin" aria-hidden="true" />
        ) : (
          <ChainIcon chainId={activeChain.id} size={18} />
        )}
        <span className="w3-net-name">{activeChain.shortName}</span>
        <ChevronDown
          size={14}
          className={"w3-chev" + (open ? " w3-chev-up" : "")}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="w3-net-menu"
            role="listbox"
            aria-label="Select blockchain network"
          >
            <div className="w3-net-menu-head">
              <span>Select Network</span>
              <span className="w3-net-menu-sub">5 chains</span>
            </div>

            {networkError && (
              <div className="w3-inline-err" role="alert">
                <AlertCircle size={14} />
                <span>{networkError}</span>
              </div>
            )}

            <div className="w3-net-list">
              {supportedChains.map((chain) => {
                const active = chain.id === activeChain.id;
                return (
                  <button
                    key={chain.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={"w3-net-item" + (active ? " w3-net-item-active" : "")}
                    disabled={isSwitchingChain}
                    onClick={async () => {
                      await switchNetwork(chain.id);
                      setOpen(false);
                    }}
                  >
                    <ChainIcon chainId={chain.id} size={22} />
                    <span className="w3-net-item-copy">
                      <span className="w3-net-item-title">{chain.name}</span>
                      <span className="w3-net-item-meta">
                        {chain.nativeSymbol} &middot; Avg gas {chain.avgGasUsd}
                      </span>
                    </span>
                    {active && (
                      <span className="w3-net-check" aria-hidden="true">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
