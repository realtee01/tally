import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ExternalLink,
  Gem,
  LayoutGrid,
  List,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { useWeb3 } from "../../web3/Web3Context";
import {
  CHAIN_BY_ID,
  abbreviateAddress,
  getExplorerAddressUrl,
} from "../../web3/config";
import { DEMO_NFTS, type NftCollectible } from "../../web3/data";
import { ChainIcon } from "./ChainIcon";

const COLLECTIONS = [
  "All",
  "Genesis Vaults",
  "Chrome Coins",
  "Cyber Keys",
  "Hologram Ledgers",
];

export const NftGallery = React.memo(function NftGallery() {
  const { mode, address, isConnected, openTxModal, setWalletModalOpen } =
    useWeb3();
  const [layout, setLayout] = React.useState<"grid" | "list">("grid");
  const [collection, setCollection] = React.useState("All");
  const [selected, setSelected] = React.useState<NftCollectible | null>(null);
  const [loadedMap, setLoadedMap] = React.useState<Record<string, boolean>>({});
  const preloadedRef = React.useRef<Set<string>>(new Set());

  const preloadHiRes = React.useCallback((url: string) => {
    if (preloadedRef.current.has(url)) return;
    preloadedRef.current.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }, []);

  const filtered = React.useMemo(() => {
    if (collection === "All") return DEMO_NFTS;
    return DEMO_NFTS.filter((n) => n.collection === collection);
  }, [collection]);

  React.useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const ownerDisplay = (nft: NftCollectible) => {
    if (nft.ownedByUser && isConnected && address) {
      return `You (${abbreviateAddress(address)})`;
    }
    return abbreviateAddress(nft.owner);
  };

  return (
    <section
      className="w3-nft-sec tb-grainy"
      data-sec="nfts"
      aria-label="NFT Collectibles Gallery"
    >
      <div className="tb-join tb-join-foil" aria-hidden="true">
        <i className="tb-join-in" />
      </div>

      <div className="w3-container">
        <div className="w3-sec-head">
          <div>
            <p className="tb-label">05 &mdash; Digital collectibles</p>
            <h2 className="w3-sec-h w3-sec-h-light">
              Vault
              <br />
              Gallery
            </h2>
          </div>
          <div className="w3-nft-meta-note">
            <span className="w3-mode-tag w3-mode-tag-demo">
              Curated Demo Collection
            </span>
            <p>
              Inspect traits, rarity scores, and on-chain provenance — or
              initiate an ERC-721 transfer directly from any artifact.
            </p>
          </div>
        </div>

        <div className="w3-nft-toolbar">
          <div
            className="w3-filter-bar"
            role="tablist"
            aria-label="Filter NFT collection"
          >
            {COLLECTIONS.map((col) => (
              <button
                key={col}
                type="button"
                role="tab"
                aria-selected={collection === col}
                className={
                  "w3-filter-btn" +
                  (collection === col ? " w3-filter-btn-active" : "")
                }
                onClick={() => setCollection(col)}
              >
                {col}
              </button>
            ))}
          </div>

          <div className="w3-seg" role="group" aria-label="Gallery layout">
            <button
              type="button"
              className={layout === "grid" ? "w3-seg-active" : ""}
              onClick={() => setLayout("grid")}
              aria-label="Grid layout"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={layout === "list" ? "w3-seg-active" : ""}
              onClick={() => setLayout("list")}
              aria-label="List layout"
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>
        </div>

        <div
          className={
            layout === "grid" ? "w3-nft-grid" : "w3-nft-list"
          }
        >
          {filtered.map((nft) => {
            const chain = CHAIN_BY_ID[nft.chainId];
            return (
              <motion.article
                key={nft.id}
                layout
                className={
                  "w3-nft-card" +
                  (layout === "list" ? " w3-nft-card-list" : "")
                }
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <button
                  type="button"
                  className="w3-nft-trigger"
                  onMouseEnter={() => preloadHiRes(nft.imageHiRes)}
                  onFocus={() => preloadHiRes(nft.imageHiRes)}
                  onTouchStart={() => preloadHiRes(nft.imageHiRes)}
                  onClick={() => setSelected(nft)}
                >
                  <div
                    className="w3-nft-media"
                    style={{ backgroundColor: nft.placeholderColor }}
                  >
                    <img
                      src={nft.image}
                      srcSet={`${nft.image} 480w, ${nft.imageHiRes} 800w`}
                      sizes={
                        layout === "list"
                          ? "118px"
                          : "(max-width: 720px) 92vw, (max-width: 1020px) 46vw, 24vw"
                      }
                      width={480}
                      height={480}
                      alt={`${nft.name} from ${nft.collection}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className={
                        "w3-nft-img" +
                        (loadedMap[nft.id] ? " w3-nft-img-loaded" : "")
                      }
                      onLoad={() =>
                        setLoadedMap((prev) =>
                          prev[nft.id] ? prev : { ...prev, [nft.id]: true }
                        )
                      }
                    />
                  </div>

                  <div className="w3-nft-info">
                    <div className="w3-nft-top-meta">
                      <span>{nft.collection}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span className={"w3-rarity w3-rar-" + nft.rarity.toLowerCase()}>
                        {nft.rarity}
                      </span>
                    </div>

                    <h3 className="w3-nft-title">
                      {nft.name}{" "}
                      <span className="w3-nft-id w3-tabular">{nft.tokenId}</span>
                    </h3>

                    <div className="w3-nft-details">
                      <div>
                        <span className="w3-nft-k">Owner</span>
                        <span className="w3-mono">{ownerDisplay(nft)}</span>
                      </div>
                      <div>
                        <span className="w3-nft-k">Floor</span>
                        <strong className="w3-tabular">
                          {nft.floorEth} ETH
                        </strong>
                      </div>
                      <div className="w3-nft-chain-cell">
                        <ChainIcon chainId={nft.chainId} size={16} />
                        <span>{chain?.shortName}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="w3-modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            <motion.div
              className="w3-modal w3-modal-wide"
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name} collectible details`}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w3-modal-head w3-modal-head-mint">
                <div className="w3-modal-title-row">
                  <Gem size={19} strokeWidth={2.5} aria-hidden="true" />
                  <h2 className="w3-modal-title">
                    {selected.name} {selected.tokenId}
                  </h2>
                </div>
                <button
                  type="button"
                  className="tb-drawer-close"
                  onClick={() => setSelected(null)}
                  aria-label="Close collectible details"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="w3-nft-modal-grid">
                <div
                  className="w3-nft-modal-art"
                  style={{ backgroundColor: selected.placeholderColor }}
                >
                  <img
                    src={selected.imageHiRes}
                    width={800}
                    height={800}
                    alt={`${selected.name} high resolution preview`}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>

                <div className="w3-nft-modal-body">
                  <div className="w3-nft-modal-kicker">
                    <span>{selected.collection}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span
                      className={
                        "w3-rarity w3-rar-" + selected.rarity.toLowerCase()
                      }
                    >
                      {selected.rarity} ({selected.rarityRank})
                    </span>
                  </div>

                  <p className="w3-nft-desc">{selected.description}</p>

                  <div className="w3-traits-grid">
                    {selected.traits.map((tr) => (
                      <div key={tr.label} className="w3-trait-box">
                        <span className="w3-trait-k">{tr.label}</span>
                        <strong className="w3-trait-v">{tr.value}</strong>
                        <span className="w3-trait-p w3-tabular">
                          {tr.prevalence} have this
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="w3-tx-summary">
                    <div>
                      <span>Owner</span>
                      <strong className="w3-mono">
                        {ownerDisplay(selected)}
                      </strong>
                    </div>
                    <div>
                      <span>Contract ({selected.standard})</span>
                      <a
                        href={getExplorerAddressUrl(
                          selected.chainId,
                          selected.contractAddress
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w3-inline-link w3-mono"
                      >
                        <span>{abbreviateAddress(selected.contractAddress)}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div>
                      <span>Floor Price</span>
                      <strong className="w3-tabular">
                        {selected.floorEth} ETH
                      </strong>
                    </div>
                  </div>

                  <div className="w3-nft-modal-foot">
                    {isConnected ? (
                      <button
                        type="button"
                        className="tb-btn"
                        onClick={() => {
                          const targetNft = selected;
                          setSelected(null);
                          openTxModal({
                            kind: "transfer",
                            title: `Transfer ${targetNft.name} ${targetNft.tokenId}`,
                            assetSymbol: targetNft.standard,
                            defaultAmount: "1",
                            defaultRecipient:
                              "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
                            editable: true,
                            subtitle:
                              mode === "live"
                                ? `Submit an ${targetNft.standard} transfer on ${CHAIN_BY_ID[targetNft.chainId]?.name || "Ethereum"}.`
                                : `Simulate transferring ${targetNft.name} (${targetNft.tokenId}) in Demo Mode.`,
                          });
                        }}
                      >
                        <Send size={15} />
                        <span>Transfer NFT</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="tb-btn"
                        onClick={() => {
                          setSelected(null);
                          setWalletModalOpen(true);
                        }}
                      >
                        <ShieldCheck size={15} />
                        <span>Connect Wallet to Transfer</span>
                      </button>
                    )}
                    <a
                      href={getExplorerAddressUrl(
                        selected.chainId,
                        selected.contractAddress
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w3-btn-ghost"
                    >
                      <ExternalLink size={15} />
                      <span>Contract</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
