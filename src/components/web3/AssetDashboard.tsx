import * as React from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useWeb3 } from "../../web3/Web3Context";
import {
  CHAIN_BY_ID,
  abbreviateHash,
  getExplorerTxUrl,
} from "../../web3/config";
import {
  DEMO_PORTFOLIO_HISTORY,
  DEMO_TOKENS,
  type TimeframeKey,
  type TokenAsset,
} from "../../web3/data";
import { ChainIcon, TokenIcon } from "./ChainIcon";
import { NetworkSwitcher } from "./NetworkSwitcher";

const TIMEFRAMES: TimeframeKey[] = ["7D", "30D", "90D", "1Y"];

function formatUsd(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function PortfolioAreaChart({
  timeframe,
  points,
}: {
  timeframe: TimeframeKey;
  points: { label: string; value: number }[];
}) {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const W = 520;
  const H = 180;
  const padX = 16;
  const padY = 18;

  const minVal = Math.min(...points.map((p) => p.value)) * 0.96;
  const maxVal = Math.max(...points.map((p) => p.value)) * 1.03;
  const span = Math.max(1, maxVal - minVal);

  const coords = points.map((p, i) => {
    const x =
      padX + (i / Math.max(1, points.length - 1)) * (W - padX * 2);
    const y = H - padY - ((p.value - minVal) / span) * (H - padY * 2);
    return { ...p, x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)} ${H - padY} L${coords[0].x.toFixed(1)} ${H - padY} Z`;

  const activePoint =
    hoverIdx !== null ? coords[hoverIdx] : coords[coords.length - 1];

  return (
    <div className="w3-chart-wrap">
      <div className="w3-chart-readout">
        <span className="w3-chart-period">
          {timeframe} Snapshot &middot; {activePoint.label}
        </span>
        <strong className="w3-tabular">{formatUsd(activePoint.value)}</strong>
      </div>
      <svg
        className="w3-area-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Portfolio performance over ${timeframe}`}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="w3AreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5ef2b6" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#5ef2b6" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={padX}
            y1={padY + r * (H - padY * 2)}
            x2={W - padX}
            y2={padY + r * (H - padY * 2)}
            stroke="#0e2447"
            strokeOpacity="0.1"
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaPath} fill="url(#w3AreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#0e2447"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <g key={c.label}>
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIdx === i ? 7 : 4.5}
              fill={hoverIdx === i ? "#ffd447" : "#5ef2b6"}
              stroke="#0e2447"
              strokeWidth="2.5"
            />
            <rect
              x={c.x - 24}
              y={0}
              width={48}
              height={H}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverIdx(i)}
            />
          </g>
        ))}
      </svg>
      <div className="w3-chart-axis">
        {coords.map((c) => (
          <span key={c.label}>{c.label}</span>
        ))}
      </div>
    </div>
  );
}

function AllocationDonut({
  tokens,
  totalUsd,
}: {
  tokens: TokenAsset[];
  totalUsd: number;
}) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const R = 58;
  const C = 2 * Math.PI * R;

  let acc = 0;
  const segments = tokens.map((t) => {
    const usd = t.balance * t.priceUsd;
    const share = totalUsd > 0 ? usd / totalUsd : 0;
    const dash = share * C;
    const offset = -acc;
    acc += dash;
    return { token: t, usd, share, dash, offset };
  });

  const activeSeg = segments.find((s) => s.token.symbol === hovered);

  return (
    <div className="w3-donut-layout">
      <div className="w3-donut-svg-wrap">
        <svg viewBox="0 0 160 160" className="w3-donut-svg" aria-hidden="true">
          <circle
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke="#e8edf5"
            strokeWidth="22"
          />
          {segments.map((seg) => (
            <circle
              key={seg.token.symbol}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={seg.token.color}
              strokeWidth={hovered === seg.token.symbol ? 26 : 22}
              strokeDasharray={`${Math.max(0, seg.dash - 2)} ${C}`}
              strokeDashoffset={seg.offset}
              transform="rotate(-90 80 80)"
              style={{ transition: "stroke-width 0.16s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(seg.token.symbol)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="w3-donut-center">
          <span className="w3-donut-k">
            {activeSeg ? activeSeg.token.symbol : "Assets"}
          </span>
          <strong className="w3-tabular">
            {activeSeg
              ? `${(activeSeg.share * 100).toFixed(1)}%`
              : `${tokens.length}`}
          </strong>
        </div>
      </div>

      <div className="w3-donut-legend">
        {segments.map((seg) => (
          <button
            key={seg.token.symbol}
            type="button"
            className={
              "w3-legend-row" +
              (hovered === seg.token.symbol ? " w3-legend-row-hi" : "")
            }
            onMouseEnter={() => setHovered(seg.token.symbol)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="w3-legend-swatch"
              style={{ background: seg.token.color }}
            />
            <span className="w3-legend-sym">{seg.token.symbol}</span>
            <span className="w3-legend-pct w3-tabular">
              {(seg.share * 100).toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const AssetDashboard = React.memo(function AssetDashboard() {
  const {
    mode,
    isConnected,
    abbreviatedAddress,
    activeChain,
    connectWallet,
    setWalletModalOpen,
    liveNativeBalance,
    isBalanceLoading,
    balanceError,
    refetchBalance,
    transactions,
    openTxModal,
  } = useWeb3();

  const [timeframe, setTimeframe] = React.useState<TimeframeKey>("30D");
  const [activeTab, setActiveTab] = React.useState<"tokens" | "history">(
    "tokens"
  );
  const [chainFilter, setChainFilter] = React.useState<"all" | "active">("all");

  const demoTotalUsd = React.useMemo(
    () => DEMO_TOKENS.reduce((acc, t) => acc + t.balance * t.priceUsd, 0),
    []
  );

  const visibleDemoTokens = React.useMemo(() => {
    if (chainFilter === "active") {
      return DEMO_TOKENS.filter((t) => t.chainId === activeChain.id);
    }
    return DEMO_TOKENS;
  }, [chainFilter, activeChain.id]);

  return (
    <section
      className="w3-dash tb-grainy"
      data-sec="portfolio"
      aria-label="Digital Asset Dashboard"
    >
      <div className="tb-join tb-join-gold" aria-hidden="true">
        <i className="tb-join-in" />
      </div>

      <div className="w3-container">
        <div className="w3-sec-head">
          <div>
            <p className="tb-label">04 &mdash; Multi-chain portfolio</p>
            <h2 className="w3-sec-h">
              Digital
              <br />
              Assets
            </h2>
          </div>
          <div className="w3-sec-controls">
            <NetworkSwitcher />
            {isConnected && (
              <button
                type="button"
                className="tb-btn tb-btn-sm"
                onClick={() =>
                  openTxModal({
                    kind: "send",
                    title: `Send ${activeChain.nativeSymbol}`,
                    assetSymbol: activeChain.nativeSymbol,
                    defaultAmount: "0.05",
                    editable: true,
                    subtitle: `Transfer ${activeChain.nativeSymbol} on ${activeChain.name}.`,
                  })
                }
              >
                <Send size={14} />
                <span>Send Crypto</span>
              </button>
            )}
          </div>
        </div>

        {!isConnected ? (
          <motion.div
            className="w3-empty-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w3-empty-icon">
              <Wallet size={32} strokeWidth={2.4} />
            </div>
            <h3>Connect to explore the on-chain portfolio</h3>
            <p>
              Connect MetaMask, WalletConnect, or Coinbase Wallet in interactive
              demo mode to explore multi-chain token balances, allocation
              charts, and transaction history across Ethereum, Polygon, BNB
              Smart Chain, Arbitrum, and Base.
            </p>
            <div className="w3-empty-actions">
              <button
                type="button"
                className="tb-btn"
                onClick={() => setWalletModalOpen(true)}
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
              <button
                type="button"
                className="w3-btn-ghost"
                onClick={() => connectWallet("demo")}
              >
                <Sparkles size={16} />
                <span>Load Demo Portfolio</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="w3-dash-stack">
            <div className="w3-status-strip">
              <div className="w3-status-left">
                <span
                  className={
                    "w3-mode-tag" +
                    (mode === "live" ? " w3-mode-tag-live" : " w3-mode-tag-demo")
                  }
                >
                  {mode === "live" ? "Live RPC Data" : "Demo Data"}
                </span>
                <span className="w3-mono w3-status-addr">
                  {abbreviatedAddress}
                </span>
                <span className="w3-status-sep" aria-hidden="true">
                  &middot;
                </span>
                <span className="w3-status-chain">
                  <ChainIcon chainId={activeChain.id} size={15} />
                  <span>{activeChain.name}</span>
                </span>
              </div>
              {mode === "live" && (
                <button
                  type="button"
                  className="w3-chip-btn"
                  onClick={refetchBalance}
                  disabled={isBalanceLoading}
                >
                  <RefreshCw
                    size={13}
                    className={isBalanceLoading ? "w3-spin" : ""}
                  />
                  <span>Refresh RPC</span>
                </button>
              )}
            </div>

            {mode === "demo" ? (
              <div className="w3-analytics-grid">
                <div className="w3-card">
                  <div className="w3-card-top">
                    <div>
                      <span className="w3-meta-label">
                        Demo Total Net Worth
                      </span>
                      <div className="w3-big-balance w3-tabular">
                        {formatUsd(demoTotalUsd)}
                      </div>
                      <span className="w3-delta-up w3-tabular">
                        <TrendingUp size={14} /> +3.42% (+$936.20) past 24h
                      </span>
                    </div>
                    <div
                      className="w3-seg"
                      role="tablist"
                      aria-label="Chart timeframe"
                    >
                      {TIMEFRAMES.map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          role="tab"
                          aria-selected={timeframe === tf}
                          className={timeframe === tf ? "w3-seg-active" : ""}
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PortfolioAreaChart
                    timeframe={timeframe}
                    points={DEMO_PORTFOLIO_HISTORY[timeframe]}
                  />
                </div>

                <div className="w3-card">
                  <div className="w3-card-top">
                    <div>
                      <span className="w3-meta-label">Asset Allocation</span>
                      <h3 className="w3-card-h">Multi-Chain Breakdown</h3>
                    </div>
                  </div>
                  <AllocationDonut
                    tokens={DEMO_TOKENS}
                    totalUsd={demoTotalUsd}
                  />
                </div>
              </div>
            ) : (
              <div className="w3-card w3-live-summary">
                <div className="w3-card-top">
                  <div>
                    <span className="w3-meta-label">
                      Live Native Balance ({activeChain.name})
                    </span>
                    {isBalanceLoading ? (
                      <div className="w3-loading-row">
                        <Loader2 size={20} className="w3-spin" />
                        <span>Querying {activeChain.name} RPC…</span>
                      </div>
                    ) : balanceError ? (
                      <div className="w3-alert-err" role="alert">
                        <AlertCircle size={16} />
                        <span>RPC error: {balanceError}</span>
                      </div>
                    ) : (
                      <div className="w3-big-balance w3-tabular">
                        {liveNativeBalance
                          ? `${liveNativeBalance.formatted} ${liveNativeBalance.symbol}`
                          : `0.0000 ${activeChain.nativeSymbol}`}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="tb-btn tb-btn-sm"
                    onClick={() =>
                      openTxModal({
                        kind: "send",
                        title: `Send ${activeChain.nativeSymbol}`,
                        assetSymbol: activeChain.nativeSymbol,
                        defaultAmount: "0.01",
                        editable: true,
                      })
                    }
                  >
                    <Send size={14} />
                    <span>Transfer {activeChain.nativeSymbol}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="w3-card">
              <div className="w3-table-bar">
                <div className="w3-seg" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "tokens"}
                    className={activeTab === "tokens" ? "w3-seg-active" : ""}
                    onClick={() => setActiveTab("tokens")}
                  >
                    Tokens ({mode === "demo" ? visibleDemoTokens.length : 1})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "history"}
                    className={activeTab === "history" ? "w3-seg-active" : ""}
                    onClick={() => setActiveTab("history")}
                  >
                    Transaction History ({transactions.length})
                  </button>
                </div>

                {activeTab === "tokens" && mode === "demo" && (
                  <div className="w3-seg">
                    <button
                      type="button"
                      className={chainFilter === "all" ? "w3-seg-active" : ""}
                      onClick={() => setChainFilter("all")}
                    >
                      All Chains
                    </button>
                    <button
                      type="button"
                      className={
                        chainFilter === "active" ? "w3-seg-active" : ""
                      }
                      onClick={() => setChainFilter("active")}
                    >
                      {activeChain.shortName} Only
                    </button>
                  </div>
                )}
              </div>

              {activeTab === "tokens" ? (
                mode === "demo" ? (
                  visibleDemoTokens.length === 0 ? (
                    <div className="w3-empty-inline">
                      <p>
                        No demo tokens held on {activeChain.name}. Switch to All
                        Chains or change networks above.
                      </p>
                      <button
                        type="button"
                        className="w3-chip-btn"
                        onClick={() => setChainFilter("all")}
                      >
                        Show All Chains
                      </button>
                    </div>
                  ) : (
                    <div className="w3-token-list">
                      {visibleDemoTokens.map((t) => {
                        const chain = CHAIN_BY_ID[t.chainId];
                        const usdValue = t.balance * t.priceUsd;
                        const isPos = t.change24h >= 0;
                        return (
                          <div key={t.symbol} className="w3-token-row">
                            <div className="w3-token-main">
                              <TokenIcon symbol={t.symbol} size={38} />
                              <div>
                                <p className="w3-token-name">{t.name}</p>
                                <p className="w3-token-sub">
                                  {t.symbol} &middot; {chain?.shortName}
                                </p>
                              </div>
                            </div>
                            <div className="w3-token-num w3-tabular">
                              <strong>
                                {t.balance.toLocaleString()} {t.symbol}
                              </strong>
                              <span>{formatUsd(t.priceUsd)}</span>
                            </div>
                            <div className="w3-token-num w3-tabular">
                              <strong>{formatUsd(usdValue)}</strong>
                              <span
                                className={
                                  isPos ? "w3-chg-pos" : "w3-chg-neg"
                                }
                              >
                                {isPos ? "+" : ""}
                                {t.change24h.toFixed(2)}%
                              </span>
                            </div>
                            <div className="w3-token-act">
                              <button
                                type="button"
                                className="w3-chip-btn"
                                onClick={() =>
                                  openTxModal({
                                    kind: "send",
                                    title: `Send ${t.symbol}`,
                                    assetSymbol: t.symbol,
                                    defaultAmount:
                                      t.symbol === "USDC" ? "100" : "0.1",
                                    editable: true,
                                    subtitle: `Transfer ${t.name} on ${activeChain.name}.`,
                                  })
                                }
                              >
                                <Send size={13} />
                                <span>Send</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="w3-token-list">
                    <div className="w3-token-row">
                      <div className="w3-token-main">
                        <TokenIcon
                          symbol={activeChain.nativeSymbol}
                          size={38}
                        />
                        <div>
                          <p className="w3-token-name">{activeChain.name}</p>
                          <p className="w3-token-sub">
                            {activeChain.nativeSymbol} &middot; Native Gas Asset
                          </p>
                        </div>
                      </div>
                      <div className="w3-token-num w3-tabular">
                        <strong>
                          {liveNativeBalance
                            ? `${liveNativeBalance.formatted} ${liveNativeBalance.symbol}`
                            : `0.0000 ${activeChain.nativeSymbol}`}
                        </strong>
                        <span>Live RPC</span>
                      </div>
                      <div className="w3-token-num">
                        <strong>On-Chain</strong>
                        <span>Verified</span>
                      </div>
                      <div className="w3-token-act">
                        <button
                          type="button"
                          className="w3-chip-btn"
                          onClick={() =>
                            openTxModal({
                              kind: "send",
                              title: `Send ${activeChain.nativeSymbol}`,
                              assetSymbol: activeChain.nativeSymbol,
                              defaultAmount: "0.01",
                              editable: true,
                            })
                          }
                        >
                          <Send size={13} />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : transactions.length === 0 ? (
                <div className="w3-empty-inline">
                  <Clock size={22} />
                  <p>
                    No transactions recorded in this session yet. Use{" "}
                    <strong>Send Crypto</strong> above to broadcast a
                    transaction.
                  </p>
                </div>
              ) : (
                <div className="w3-tx-list">
                  {transactions.map((tx) => {
                    const chain = CHAIN_BY_ID[tx.chainId];
                    return (
                      <div key={tx.id} className="w3-tx-row">
                        <div className="w3-tx-left">
                          <span className="w3-tx-ico" aria-hidden="true">
                            {tx.kind === "swap" ? (
                              <ArrowLeftRight size={16} />
                            ) : tx.kind === "mint" ? (
                              <ArrowDownLeft size={16} />
                            ) : (
                              <ArrowUpRight size={16} />
                            )}
                          </span>
                          <div>
                            <p className="w3-token-name">{tx.title}</p>
                            <p className="w3-token-sub">
                              {chain?.shortName} &middot; {tx.timestamp} &middot;{" "}
                              <span className="w3-mono">
                                {abbreviateHash(tx.hash)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="w3-tx-right">
                          <strong className="w3-tabular">
                            {tx.amountLabel}
                          </strong>
                          <span className={"w3-status-label w3-st-" + tx.status}>
                            {tx.status}
                          </span>
                          <a
                            href={getExplorerTxUrl(tx.chainId, tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w3-chip-btn"
                            aria-label={`View transaction on ${chain?.explorerName || "Explorer"}`}
                          >
                            <ExternalLink size={13} />
                            <span>Explorer</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
