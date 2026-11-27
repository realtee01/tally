import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, ShoppingBag, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useWeb3 } from "../web3/Web3Context";
import { NetworkSwitcher } from "./web3/NetworkSwitcher";
import { AssetDashboard } from "./web3/AssetDashboard";
import { NftGallery } from "./web3/NftGallery";
import { ChainIcon } from "./web3/ChainIcon";

const WalletConnectModal = React.lazy(() =>
  import("./web3/WalletConnectModal").then((m) => ({
    default: m.WalletConnectModal,
  }))
);
const TransactionModal = React.lazy(() =>
  import("./web3/TransactionModal").then((m) => ({
    default: m.TransactionModal,
  }))
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(500, 33);
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
}

export type TallySpoolKind = "frost" | "mint" | "gold" | "violet" | "foil";

export type TallyProduct = {
  name: string;
  line: string;
  price: string;
  kind: TallySpoolKind;
};

export interface TallyBankTemplateProps {
  /** Height of the hero and of the sticky vault stage. Must be a definite length. */
  height?: string;
  /** Wordmark printed on the coin emblem, spools, and footer. */
  brand?: string;
  /** The two headline lines that pop in. */
  headline?: [string, string];
  /** Brand story on the buttercream ledger card. */
  story?: string;
  /** Items on the on-chain sticky note. The third one is ticked. */
  todo?: string[];
  /** Phrases printed on the wavy ribbon, separated by the emblem. */
  marquee?: string[];
  /** Headline of the vault-lock section, one line per entry. */
  maskHeadline?: string[];
  products?: TallyProduct[];
  /** Play the layered preloader on mount. */
  preloader?: boolean;
  /** Google Fonts stylesheet; null loads nothing (bring your own fonts). */
  fontHref?: string | null;
  className?: string;
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Caveat:wght@500..700&display=swap";

const DEFAULT_PRODUCTS: TallyProduct[] = [
  {
    name: "Clear Key",
    line: "NFC cold-storage hardware signer card with instant tap-to-sign.",
    price: "$29",
    kind: "frost",
  },
  {
    name: "Mint Pass",
    line: "Genesis protocol pass unlocking 0% swap fees across 5 chains.",
    price: "$45",
    kind: "mint",
  },
  {
    name: "Gold Vault",
    line: "Multi-sig treasury module with automated staking & yield routing.",
    price: "$18",
    kind: "gold",
  },
  {
    name: "Bridge Pack",
    line: "Pre-funded gas relayer credits for Ethereum, Base, Arbitrum & Polygon.",
    price: "$12",
    kind: "violet",
  },
];

const KIND_LABEL: Record<TallySpoolKind, string> = {
  frost: "Signer",
  mint: "Pass",
  gold: "Vault",
  violet: "Bridge",
  foil: "Reserve",
};

const useIso =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
const REDUCE = "(prefers-reduced-motion: reduce)";
const IS_COMPACT_GPU =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
const FACET_COUNT = IS_COMPACT_GPU ? 16 : 24;
const FACETS = Array.from({ length: FACET_COUNT }, (_, i) => i);
const REPEAT = IS_COMPACT_GPU ? 4 : 6;
const v = (o: Record<string, string | number>) => o as React.CSSProperties;

const NAV_SECTIONS = [
  { id: "story", label: "Story" },
  { id: "vaults", label: "Vaults" },
  { id: "portfolio", label: "Assets" },
  { id: "nfts", label: "NFTs" },
  { id: "cards", label: "Stack" },
] as const;

/** Notched wax-coin emblem: alternating sharp peaks around 60,60. */
function coinEdge(rIn: number, rOut: number, n: number) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? rOut : rIn;
    pts.push(
      (60 + r * Math.cos(a)).toFixed(2) + " " + (60 + r * Math.sin(a)).toFixed(2)
    );
  }
  return "M" + pts.join(" L") + "Z";
}

const SEAL_OUT = coinEdge(49, 57, 16);
const SEAL_IN = coinEdge(44, 51, 16);

const MK_L = 2600;
const MK_W = 92;
const MK_STRIPS = [
  { cx: 800, cy: 285, a: -10 },
  { cx: 800, cy: 545, a: 6 },
  { cx: 800, cy: 790, a: -4 },
];

function parsePrice(price: string): number {
  const parsed = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Notched coin-seal emblem for Tally Web3 Co. */
export function TallyBadge({
  size,
  brand = "TALLY",
  className,
}: {
  size?: number;
  brand?: string;
  className?: string;
}) {
  return (
    <svg
      className={"tb-badge" + (className ? " " + className : "")}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <path d={SEAL_OUT} fill="#fffaf2" />
      <path d={SEAL_IN} fill="#0e2447" />
      <circle
        cx="60"
        cy="60"
        r="37"
        fill="none"
        stroke="#5ef2b6"
        strokeWidth="1.8"
      />
      <circle
        cx="60"
        cy="60"
        r="32"
        fill="none"
        stroke="#ffd447"
        strokeWidth="1.2"
        strokeDasharray="2 4"
      />
      <text
        x="60"
        y="65"
        textAnchor="middle"
        className="tb-badge-word"
        fill="#5ef2b6"
        fontSize={brand.length > 6 ? 19 : 25}
      >
        {brand}
      </text>
      <text
        x="60"
        y="80"
        textAnchor="middle"
        className="tb-badge-sub"
        fill="#fffaf2"
        fontSize="8.5"
        letterSpacing="2.2"
      >
        WEB3 CO.
      </text>
      <rect x="47" y="34" width="26" height="4" rx="2" fill="#ffd447" />
      <rect x="53" y="40" width="14" height="3" rx="1.5" fill="#ff5a43" />
      <ellipse
        cx="42"
        cy="30"
        rx="16"
        ry="6"
        fill="#fff"
        opacity="0.16"
        transform="rotate(-28 42 30)"
      />
    </svg>
  );
}

/** The flat end of a protocol spool: layered edges, dark core, printed badge. */
function SpoolFace({ kind, brand }: { kind: TallySpoolKind; brand: string }) {
  return (
    <div className={"tb-face tb-k-" + kind}>
      <div className="tb-face-core" />
      <div className="tb-face-label">
        <span className="tb-face-brand">{brand}</span>
        <span className="tb-face-kind">{KIND_LABEL[kind]}</span>
      </div>
      <div className="tb-face-gloss" />
    </div>
  );
}

/** A true 3D spool: adaptive band facets around the x axis plus two end caps. */
const Spool3D = React.memo(function Spool3D({
  kind,
  brand,
}: {
  kind: TallySpoolKind;
  brand: string;
}) {
  return (
    <div
      className={"tb-roll tb-k-" + kind}
      style={v({ "--facets": FACET_COUNT })}
      aria-hidden="true"
    >
      <div className="tb-roll-shadow" />
      <div className="tb-roll-body">
        {FACETS.map((i) => (
          <i key={i} className="tb-roll-facet" style={v({ "--i": i })} />
        ))}
        <div className="tb-roll-cap tb-roll-cap-a">
          <SpoolFace kind={kind} brand={brand} />
        </div>
        <div className="tb-roll-cap tb-roll-cap-b">
          <SpoolFace kind={kind} brand={brand} />
        </div>
      </div>
    </div>
  );
});

/** A torn paper/security strip. `peel` makes it a drag/press target. */
function BandStrip({
  kind,
  x,
  y,
  w,
  r,
  peel,
}: {
  kind: TallySpoolKind;
  x: string;
  y: string;
  w: string;
  r: number;
  peel?: boolean;
}) {
  const pos = v({ left: x, top: y, width: w, "--r": r + "deg" });
  return peel ? (
    <i
      className={"tb-tp tb-tp-" + kind + " tb-peel"}
      style={pos}
      role="button"
      tabIndex={0}
      aria-label="Peel off this security strip"
    >
      <b className="tb-tp-in" />
    </i>
  ) : (
    <i className={"tb-tp tb-tp-" + kind} style={pos} aria-hidden="true">
      <b className="tb-tp-in" />
    </i>
  );
}

/** Die-cut geometric coin-burst / star sticker for the vault section. */
function CoinBurst({
  points,
  color,
  center,
  className,
  depth = 1,
}: {
  points: number;
  color: string;
  center: string;
  className: string;
  depth?: number;
}) {
  const poly = (rIn: number, rOut: number) => {
    const out: string[] = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? rOut : rIn;
      out.push((r * Math.cos(a)).toFixed(2) + "," + (r * Math.sin(a)).toFixed(2));
    }
    return out.join(" ");
  };

  return (
    <svg
      className={"tb-burst " + className}
      data-depth={depth}
      viewBox="-64 -64 128 128"
      aria-hidden="true"
    >
      <polygon
        points={poly(30, 52)}
        fill="#fffaf2"
        stroke="#fffaf2"
        strokeWidth="12"
        strokeLinejoin="round"
      />
      <polygon points={poly(30, 52)} fill={color} strokeLinejoin="round" />
      <circle r="21" fill={center} />
      <circle
        r="14"
        fill="none"
        stroke="#0e2447"
        strokeWidth="2.2"
        strokeDasharray="3 4"
        opacity="0.45"
      />
      <rect x="-6" y="-2" width="12" height="4" rx="2" fill="#0e2447" opacity="0.55" />
      <rect x="-2" y="-6" width="4" height="12" rx="2" fill="#0e2447" opacity="0.55" />
    </svg>
  );
}

/** Custom geometric token & ledger guilloché pattern sheet. */
function BanknotePrint({ uid }: { uid: string }) {
  return (
    <svg
      className="tb-print-svg"
      viewBox="0 0 300 380"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={uid + "bg"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.24" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0e2447" stopOpacity="0.1" />
        </linearGradient>
        <pattern
          id={uid + "bp"}
          width="140"
          height="140"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-10)"
        >
          <rect width="140" height="140" fill="#f7fcf9" />
          <path
            d="M0 35 Q35 15 70 35 T140 35 M0 105 Q35 85 70 105 T140 105"
            fill="none"
            stroke="#c4f5df"
            strokeWidth="3"
          />
          <g transform="translate(46 46)">
            <circle r="26" fill="#5ef2b6" stroke="#0e2447" strokeWidth="2" />
            <circle
              r="20"
              fill="none"
              stroke="#0e2447"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <path
              d="M-7 -6 H7 M0 -6 V10 M-5 2 H5"
              stroke="#0e2447"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
          <g transform="translate(106 102) rotate(12)">
            <rect
              x="-24"
              y="-15"
              width="48"
              height="30"
              rx="6"
              fill="#ffd447"
              stroke="#0e2447"
              strokeWidth="2"
            />
            <circle cx="0" cy="0" r="8" fill="#ff5a43" />
            <circle cx="-15" cy="0" r="2.2" fill="#0e2447" />
            <circle cx="15" cy="0" r="2.2" fill="#0e2447" />
          </g>
          <path
            d="M112 24 l6 6 l-6 6 l-6 -6z M26 112 l6 6 l-6 6 l-6 -6z"
            fill="#6d5dfc"
          />
        </pattern>
      </defs>
      <rect width="300" height="380" fill={"url(#" + uid + "bp)"} />
      <rect width="300" height="380" fill={"url(#" + uid + "bg)"} />
    </svg>
  );
}

/** Metallic wax-seal ribbon knot for the Genesis Airdrop Packet. */
function PaydayCrest({ uid }: { uid: string }) {
  return (
    <svg className="tb-packet-crest" viewBox="0 0 220 160" aria-hidden="true">
      <defs>
        <linearGradient id={uid + "gld"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7cf" />
          <stop offset="0.45" stopColor="#ffd447" />
          <stop offset="0.75" stopColor="#ffe580" />
          <stop offset="1" stopColor="#d99d14" />
        </linearGradient>
      </defs>
      <g filter="drop-shadow(0 6px 6px rgba(14,36,71,.32))">
        <path
          d="M92 86 L72 150 L96 138 L108 156 L118 90Z"
          fill={"url(#" + uid + "gld)"}
        />
        <path
          d="M128 86 L148 150 L124 138 L112 156 L102 90Z"
          fill={"url(#" + uid + "gld)"}
        />
        <circle cx="110" cy="76" r="42" fill="#0e2447" />
        <circle cx="110" cy="76" r="35" fill={"url(#" + uid + "gld)"} />
        <circle
          cx="110"
          cy="76"
          r="27"
          fill="none"
          stroke="#0e2447"
          strokeWidth="2.5"
          strokeDasharray="3 4"
        />
        <path
          d="M99 66 H121 M110 66 V90 M103 77 H117"
          stroke="#0e2447"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default function TallyBankTemplate({
  height = "100svh",
  brand = "TALLY",
  headline = ["KEEP IT", "ON-CHAIN"],
  story = "Gas spikes at midnight, five chains to bridge, dusty token approvals, the yield vault that never sticks. We sort every wallet, so you don't have to.",
  todo = [
    "bridge ETH to Base",
    "stake 2 ETH in vault",
    "claim genesis drop",
    "revoke old approvals",
    "collect vault cube",
  ],
  marquee = ["ZERO HIDDEN GAS", "YOUR CRYPTO, SORTED"],
  maskHeadline = ["PURE", "SELF", "CUSTODY"],
  products = DEFAULT_PRODUCTS,
  preloader = true,
  fontHref = FONT_HREF,
  className,
}: TallyBankTemplateProps) {
  const {
    mode,
    isConnected,
    abbreviatedAddress,
    activeChain,
    walletModalOpen,
    setWalletModalOpen,
    txModalRequest,
    openTxModal,
  } = useWeb3();

  const [mountWalletModal, setMountWalletModal] = React.useState(false);
  const [mountTxModal, setMountTxModal] = React.useState(false);

  React.useEffect(() => {
    if (walletModalOpen) setMountWalletModal(true);
  }, [walletModalOpen]);

  React.useEffect(() => {
    if (txModalRequest) setMountTxModal(true);
  }, [txModalRequest]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const ctxRef = React.useRef<gsap.Context | null>(null);
  const addedTimerRef = React.useRef<number | null>(null);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [bagOpen, setBagOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [added, setAdded] = React.useState(-1);
  const [peeledCount, setPeeledCount] = React.useState(0);
  const [email, setEmail] = React.useState("");
  const [joined, setJoined] = React.useState(false);

  React.useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const bagCount = React.useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  );

  const bagItems = React.useMemo(
    () =>
      products
        .filter((p) => (cart[p.name] || 0) > 0)
        .map((p) => ({
          product: p,
          qty: cart[p.name] || 0,
          unitPrice: parsePrice(p.price),
        })),
    [products, cart]
  );

  const bagSubtotal = React.useMemo(
    () => bagItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
    [bagItems]
  );

  const cycle = React.useMemo(() => {
    const out: string[] = [];
    for (const p of marquee) {
      for (const ch of p) out.push(ch);
      out.push(" ", "@", " ");
    }
    return out;
  }, [marquee]);

  const items = React.useMemo(() => {
    const out: string[] = [];
    for (let r = 0; r < REPEAT; r++) out.push(...cycle);
    return out;
  }, [cycle]);

  const go = (sec: string) => () => {
    const el = rootRef.current?.querySelector('[data-sec="' + sec + '"]');
    const smooth = !window.matchMedia(REDUCE).matches;
    el?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  const add = (i: number) => () => {
    const prod = products[i];
    if (!prod) return;
    setOrderPlaced(false);
    setCart((prev) => ({
      ...prev,
      [prod.name]: (prev[prod.name] || 0) + 1,
    }));
    setAdded(i);
    if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setAdded(-1), 1400);

    const root = rootRef.current;
    const pill = root?.querySelector(".tb-bag-n");
    if (pill && ctxRef.current && !window.matchMedia(REDUCE).matches) {
      ctxRef.current.add(() => {
        gsap.fromTo(
          pill,
          { scale: 1.8, rotation: -20 },
          { scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1,.35)" }
        );
      });
    }
  };

  const updateQty = (name: string, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[name] || 0) + delta;
      const next = { ...prev };
      if (nextQty <= 0) {
        delete next[name];
      } else {
        next[name] = nextQty;
      }
      return next;
    });
  };

  const handleOnChainCheckout = () => {
    const ethApprox = Math.max(0.004, bagSubtotal / 3280).toFixed(4);
    const summary = bagItems
      .map((i) => `${i.qty}× ${i.product.name}`)
      .join(", ");
    setBagOpen(false);
    openTxModal({
      kind: "mint",
      title: `Mint Tally Kit ($${bagSubtotal})`,
      assetSymbol: activeChain.nativeSymbol,
      defaultAmount: ethApprox,
      defaultRecipient: "0x98A2cE41b7F0392a14C8d92761e4B30f92c81A4E",
      editable: false,
      subtitle: `Order items: ${summary}. Settlement routed via Tally Protocol treasury.`,
    });
    setCart({});
  };

  const restickAll = () => {
    const root = rootRef.current;
    if (!root) return;
    const calm = window.matchMedia(REDUCE).matches;
    const strips = Array.from(root.querySelectorAll(".tb-peel")) as HTMLElement[];
    const dropped = Array.from(root.querySelectorAll("[data-drop]")) as HTMLElement[];
    strips.forEach((tp) => {
      tp.classList.remove("tb-peeled", "tb-lifting");
      tp.removeAttribute("aria-hidden");
      tp.tabIndex = 0;
      const bit = tp.querySelector(".tb-tp-in");
      if (bit) {
        if (calm) {
          gsap.set(bit, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
        } else {
          gsap.fromTo(
            bit,
            { x: 0, y: 0, rotation: 0, scale: 1.6, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.32, ease: "power4.in" }
          );
        }
      }
    });
    dropped.forEach((el) => {
      if (calm) {
        gsap.set(el, { y: 0, rotation: 0 });
      } else {
        gsap.to(el, { y: 0, rotation: 0, duration: 0.65, ease: "back.out(1.6)" });
      }
    });
    setPeeledCount(0);
  };

  React.useEffect(() => {
    if (!bagOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBagOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bagOpen]);

  React.useEffect(() => {
    return () => {
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [isConnected, mode]);

  // ---- motion choreography ---------------------------------------------------------------------
  useIso(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = (s: string) => root.querySelector(s) as HTMLElement | null;
    const qa = (s: string) =>
      Array.from(root.querySelectorAll(s)) as HTMLElement[];
    const cleanups: (() => void)[] = [];
    let alive = true;

    const ctx = gsap.context(() => {
      const run = q(".tb-run");
      const hero = q(".tb-hero");
      const roll = q(".tb-run .tb-roll");
      const body = q(".tb-run .tb-roll-body");
      const strip = q(".tb-strip");
      const tape = { p: 0, dy: 0, y0: 0, y1: 0, D: 160 };

      const measureTape = () => {
        if (!run || !hero || !roll || !strip) return;
        tape.D = roll.offsetWidth;
        tape.y0 = hero.offsetHeight - tape.D * 0.46;
        tape.y1 = run.offsetHeight - tape.D * 0.62;
        strip.style.top = tape.y0 + "px";
      };

      const drawTape = (full?: boolean) => {
        if (!roll || !body || !strip) return;
        const { p, dy, y0, y1, D } = tape;
        const dist = (y1 - y0) * p;
        const y = y0 + dist + dy;
        const spin = (-(dist + dy * 0.6) / (D / 2)) * 57.2958;
        const tilt =
          -52 +
          30 * Math.min(1, p * 7) -
          22 * Math.max(0, (p - 0.92) * 12.5) +
          Math.sin(dist / 240) * 4;
        roll.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
        body.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
        body.style.setProperty("--spin", spin.toFixed(2) + "deg");
        strip.style.height =
          Math.max(0, full ? y1 - y0 : dist + D * 0.04).toFixed(1) + "px";
        strip.style.setProperty("--gy", (dist * 0.55).toFixed(1) + "px");
      };

      const banner = q(".tb-banner");
      const bsvg = q(".tb-bn-svg");
      const glyphLayer = q(".tb-bn-glyphs");
      const bClip = q(".tb-bn-cliprect");
      const bRoll = q(".tb-bn-roll");
      const glyphs = qa(".tb-mq-i");
      const perCycle = glyphs.length / REPEAT;
      const bn = {
        W: 0,
        H: 0,
        A: 0,
        A0: 0,
        k: 0,
        mid: 0,
        T: 0,
        ph: 0.9,
        X: [0],
        Y: [0],
        S: [0],
        w: [0],
        h: [0],
        cum: [0],
        cyc: 1,
        off: 0,
        reveal: 0,
        boost: 0,
      };

      const buildWave = (A: number) => {
        if (!bsvg) return;
        const { W, H, T, mid, k, ph } = bn;
        const X: number[] = [];
        const Y: number[] = [];
        const S: number[] = [];
        let s = 0;
        for (let x = -240; x <= W + 240; x += 4) {
          const y = mid + A * Math.sin(k * x + ph);
          if (X.length) {
            s += Math.hypot(x - X[X.length - 1], y - Y[Y.length - 1]);
          }
          X.push(x);
          Y.push(y);
          S.push(s);
        }
        Object.assign(bn, { A, X, Y, S });
        let d = "";
        for (let i = 0; i < X.length; i += 2) {
          d += (i ? " L" : "M") + X[i].toFixed(1) + " " + Y[i].toFixed(1);
        }
        for (const p of Array.from(bsvg.querySelectorAll(".tb-bn-line"))) {
          p.setAttribute("d", d);
          const f = Number(p.getAttribute("data-w"));
          p.setAttribute("stroke-width", (T * f).toFixed(1));
        }
        const sheen = bsvg.querySelector(".tb-bn-sheen");
        if (sheen) {
          sheen.setAttribute(
            "transform",
            "translate(0 " + (-T * 0.24).toFixed(1) + ")"
          );
        }
        const fill = bsvg.querySelector(".tb-bn-fill");
        if (fill) {
          fill.setAttribute(
            "d",
            d + " L" + (W + 240) + " " + (H + 0.5) + " L-240 " + (H + 0.5) + "Z"
          );
        }
      };

      const measureBanner = () => {
        if (!banner || !bsvg || !glyphLayer) return;
        const W = banner.clientWidth;
        const H = banner.clientHeight;
        const T = H * 0.34;
        Object.assign(bn, {
          W,
          H,
          T,
          A0: H * 0.12,
          mid: H * 0.5,
          k: (2 * Math.PI) / Math.max(620, W * 0.7),
        });
        bsvg.setAttribute("viewBox", "0 0 " + W + " " + H);
        buildWave(bn.A0);
        glyphLayer.style.setProperty("--fs", (T * 0.58).toFixed(1) + "px");
        if (bRoll) bRoll.style.setProperty("--d", (T * 1.9).toFixed(1) + "px");
        bn.w = glyphs.map((g) => g.offsetWidth);
        bn.h = glyphs.map((g) => g.offsetHeight);
        bn.cum = [];
        let c = 0;
        for (const w of bn.w) {
          bn.cum.push(c);
          c += w;
        }
        bn.cyc = Math.max(1, perCycle ? (bn.cum[perCycle] ?? c) : c);
      };

      const drawBanner = () => {
        if (!bn.W || !glyphLayer) return;
        const { X, Y, S, A, k, W, mid } = bn;
        const xr = -240 + (W + 480) * bn.reveal;
        if (bClip) bClip.setAttribute("width", Math.max(0, xr + 240).toFixed(1));
        glyphLayer.style.clipPath =
          "polygon(-10% -60%, " +
          xr.toFixed(1) +
          "px -60%, " +
          xr.toFixed(1) +
          "px 160%, -10% 160%)";
        const base = -(((bn.off % bn.cyc) + bn.cyc) % bn.cyc);
        const last = S[S.length - 1];
        let j = 0;
        for (let i = 0; i < glyphs.length; i++) {
          const el = glyphs[i];
          const s = base + bn.cum[i] + bn.w[i] / 2 + 60;
          if (s < 0 || s > last) {
            el.style.visibility = "hidden";
            continue;
          }
          while (j < S.length - 2 && S[j + 1] < s) j++;
          const t = (s - S[j]) / Math.max(0.001, S[j + 1] - S[j]);
          const x = X[j] + (X[j + 1] - X[j]) * t;
          const y = Y[j] + (Y[j + 1] - Y[j]) * t;
          const ang = Math.atan(A * k * Math.cos(k * x + bn.ph));
          el.style.visibility = x > W + 60 ? "hidden" : "visible";
          el.style.transform =
            "translate3d(" +
            (x - bn.w[i] / 2).toFixed(1) +
            "px," +
            (y - bn.h[i] / 2).toFixed(1) +
            "px,0) rotate(" +
            ang.toFixed(4) +
            "rad)";
        }
        if (bRoll) {
          const d = bn.T * 1.9;
          const y = mid + A * Math.sin(k * xr + bn.ph);
          bRoll.style.opacity =
            bn.reveal > 0.001 && bn.reveal < 0.999 ? "1" : "0";
          bRoll.style.transform =
            "translate3d(" +
            (xr - d / 2).toFixed(1) +
            "px," +
            (y - d / 2).toFixed(1) +
            "px,0) rotate(" +
            ((xr / (d / 2)) * 57.3).toFixed(1) +
            "deg)";
        }
      };

      const mask = q(".tb-mask");
      const mkBodies = qa(".tb-mk-body");
      const mkLeads = qa(".tb-mk-lead");
      const mkCurls = qa(".tb-mk-curl");
      const mkClip = q(".tb-mk-cliprect");
      const mkRoller = q(".tb-mk-roller");
      const mkFace = q(".tb-mask-roll .tb-face");
      const ms = { l0: 0, l1: 0, l2: 0, p0: 0, p1: 0, p2: 0, paint: 0, t: 0 };

      const drawMask = () => {
        const lays = [ms.l0, ms.l1, ms.l2];
        const peels = [ms.p0, ms.p1, ms.p2];
        for (let i = 0; i < 3; i++) {
          const xa = -MK_L / 2 + peels[i] * MK_L;
          const xb = -MK_L / 2 + lays[i] * MK_L;
          for (const r of Array.from(mkBodies[i]?.children || [])) {
            r.setAttribute("x", xa.toFixed(1));
            r.setAttribute("width", Math.max(0, xb - xa).toFixed(1));
          }
          const lead = mkLeads[i];
          if (lead) {
            const on = lays[i] > 0.001 && lays[i] < 0.999;
            lead.setAttribute("opacity", on ? "1" : "0");
            lead.setAttribute(
              "transform",
              "translate(" +
                xb.toFixed(1) +
                " -64) rotate(" +
                ((xb / 78) * 57.3).toFixed(1) +
                ")"
            );
          }
          const curl = mkCurls[i];
          if (curl) {
            curl.setAttribute(
              "opacity",
              peels[i] > 0.001 && peels[i] < 0.999 ? "1" : "0"
            );
            curl.setAttribute("transform", "translate(" + xa.toFixed(1) + " 0)");
          }
        }
        const px = -200 + ms.paint * 2000;
        if (mkClip) mkClip.setAttribute("width", Math.max(0, px + 200).toFixed(1));
        if (mkRoller) {
          mkRoller.setAttribute(
            "opacity",
            ms.paint > 0.001 && ms.paint < 0.999 ? "1" : "0"
          );
          mkRoller.setAttribute("transform", "translate(" + px.toFixed(1) + " 0)");
        }
        if (mkFace) {
          mkFace.style.transform = "rotate(" + (ms.t * 620).toFixed(1) + "deg)";
        }
      };

      const maskTimeline = (tl: gsap.core.Timeline) => {
        const e = "power1.inOut";
        tl.to(ms, { l0: 1, duration: 0.13, ease: e }, 0.02)
          .to(ms, { l1: 1, duration: 0.13, ease: e }, 0.12)
          .to(ms, { l2: 1, duration: 0.13, ease: e }, 0.22)
          .to(ms, { paint: 1, duration: 0.24, ease: "none" }, 0.37)
          .to(ms, { p0: 1, duration: 0.12, ease: e }, 0.64)
          .to(ms, { p1: 1, duration: 0.12, ease: e }, 0.73)
          .to(ms, { p2: 1, duration: 0.12, ease: e }, 0.82)
          .to(ms, { t: 1, duration: 1, ease: "none" }, 0)
          .fromTo(
            q(".tb-mask-stamp"),
            { scale: 2.2, opacity: 0, rotation: -24 },
            { scale: 1, opacity: 1, rotation: -9, duration: 0.05, ease: "power4.in" },
            0.95
          );
        return tl;
      };

      const calm = () => window.matchMedia(REDUCE).matches;
      for (const tp of qa(".tb-peel")) {
        const bit = tp.querySelector(".tb-tp-in");
        let sx = 0;
        let sy = 0;
        let held = false;

        const peel = (dx: number, dy: number) => {
          if (tp.classList.contains("tb-peeled")) return;
          tp.classList.add("tb-peeled");
          tp.setAttribute("aria-hidden", "true");
          tp.tabIndex = -1;
          setPeeledCount((n) => n + 1);
          const side = dx >= 0 ? 1 : -1;
          ctx.add(() => {
            if (calm()) {
              gsap.to(bit, { opacity: 0, duration: 0.3 });
            } else {
              gsap.to(bit, {
                x: dx * 3,
                y: dy * 3 + 280,
                rotation: side * 140,
                opacity: 0,
                duration: 0.95,
                ease: "power2.in",
              });
            }
            const item = tp.closest("[data-drop]");
            if (item && !item.querySelector(".tb-peel:not(.tb-peeled)") && !calm()) {
              gsap.to(item, {
                y: "+=110",
                rotation: "+=" + side * 11,
                duration: 1.2,
                ease: "bounce.out",
              });
            }
          });
        };

        const onDown = (e: PointerEvent) => {
          held = true;
          sx = e.clientX;
          sy = e.clientY;
          tp.setPointerCapture(e.pointerId);
          tp.classList.add("tb-lifting");
        };

        const onMove = (e: PointerEvent) => {
          if (!held) return;
          const dx = e.clientX - sx;
          const dy = e.clientY - sy;
          gsap.set(bit, {
            x: dx * 0.35,
            y: dy * 0.35,
            rotation: dx * 0.06,
            scale: 1.05,
          });
        };

        const onUp = (e: PointerEvent) => {
          if (!held) return;
          held = false;
          tp.classList.remove("tb-lifting");
          const dx = e.clientX - sx;
          const dy = e.clientY - sy;
          if (Math.hypot(dx, dy) > 46) {
            peel(dx, dy);
          } else {
            ctx.add(() =>
              gsap.to(bit, {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 0.6,
                ease: "elastic.out(1,.4)",
              })
            );
          }
        };

        const onKey = (e: KeyboardEvent) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          peel(24, 12);
        };

        tp.addEventListener("pointerdown", onDown);
        tp.addEventListener("pointermove", onMove);
        tp.addEventListener("pointerup", onUp);
        tp.addEventListener("pointercancel", onUp);
        tp.addEventListener("keydown", onKey);
        cleanups.push(() => {
          tp.removeEventListener("pointerdown", onDown);
          tp.removeEventListener("pointermove", onMove);
          tp.removeEventListener("pointerup", onUp);
          tp.removeEventListener("pointercancel", onUp);
          tp.removeEventListener("keydown", onKey);
        });
      }

      const doodles = q(".tb-doodles");
      if (hero && doodles && window.matchMedia("(pointer: fine)").matches) {
        let cur: HTMLElement | null = null;
        let ox = 0;
        let oy = 0;
        const at = (e: PointerEvent) => {
          const r = hero.getBoundingClientRect();
          return [e.clientX - r.left, e.clientY - r.top] as const;
        };

        const onDown = (e: PointerEvent) => {
          if (
            e.button !== 0 ||
            (e.target as HTMLElement).closest("button,a,input")
          ) {
            return;
          }
          [ox, oy] = at(e);
          cur = document.createElement("i");
          cur.className = "tb-doodle";
          cur.textContent = (brand + " SIGNED \u2726 ").repeat(24);
          cur.style.left = ox + "px";
          cur.style.top = oy + "px";
          doodles.appendChild(cur);
          hero.setPointerCapture(e.pointerId);
        };

        const onMove = (e: PointerEvent) => {
          if (!cur) return;
          const [x, y] = at(e);
          cur.style.width = Math.hypot(x - ox, y - oy).toFixed(1) + "px";
          cur.style.transform =
            "rotate(" + Math.atan2(y - oy, x - ox).toFixed(4) + "rad)";
        };

        const onUp = () => {
          const el = cur;
          cur = null;
          if (!el) return;
          if (el.offsetWidth < 28) {
            el.remove();
            return;
          }
          if (!calm()) {
            ctx.add(() =>
              gsap.fromTo(
                el,
                { scaleY: 1.6, opacity: 0.6 },
                { scaleY: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }
              )
            );
          }
          while (doodles.children.length > 8) {
            doodles.firstElementChild?.remove();
          }
        };

        hero.addEventListener("pointerdown", onDown);
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerup", onUp);
        hero.addEventListener("pointercancel", onUp);
        cleanups.push(() => {
          hero.removeEventListener("pointerdown", onDown);
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerup", onUp);
          hero.removeEventListener("pointercancel", onUp);
          doodles.replaceChildren();
        });
      }

      const refreshAll = () => {
        measureTape();
        measureBanner();
      };

      const mm = gsap.matchMedia();

      mm.add(REDUCE, () => {
        const still = () => {
          refreshAll();
          tape.p = 0;
          tape.dy = 0;
          drawTape(true);
          bn.reveal = 1;
          drawBanner();
        };
        still();
        maskTimeline(gsap.timeline({ paused: true, onUpdate: drawMask })).progress(1);
        drawMask();
        gsap.from(qa(".tb-hero-copy, .tb-hero-note, .tb-cue"), {
          opacity: 0,
          duration: 0.9,
          ease: "power1.out",
        });
        for (const el of qa(
          "[data-drop], .tb-prod, .tb-word, .tb-mask-copy, .tb-burst"
        )) {
          gsap.from(el, {
            opacity: 0,
            duration: 0.8,
            ease: "power1.out",
            scrollTrigger: { trigger: el, start: "top 92%" },
          });
        }
        const ro = new ResizeObserver(still);
        ro.observe(root);
        if (document.fonts) {
          document.fonts.ready.then(() => alive && still());
        }
        return () => ro.disconnect();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        refreshAll();
        drawTape();
        drawBanner();

        const pre = q(".tb-pre");
        const letters = qa(".tb-l");
        gsap.set(letters, { opacity: 0, transformOrigin: "50% 100%" });
        gsap.set(qa(".tb-kw"), { opacity: 0, y: 14 });
        gsap.set(q(".tb-kicker .tb-badge"), { scale: 0, rotation: -160 });
        gsap.set(qa(".tb-hero-note, .tb-cue"), { opacity: 0 });
        tape.dy = -(tape.y0 + tape.D * 1.2);
        drawTape();

        const intro = gsap.timeline({ paused: true });
        let t0 = 0;
        if (pre && preloader) {
          gsap.set(pre, { autoAlpha: 1 });
          const bands = qa(".tb-pre-band");
          intro
            .to(
              q(".tb-pre-label"),
              { opacity: 0, y: -24, duration: 0.22, ease: "power2.in" },
              0.05
            )
            .fromTo(
              bands,
              { yPercent: 64 },
              {
                yPercent: -36,
                duration: 0.56,
                ease: "power3.inOut",
                stagger: 0.06,
              },
              0
            )
            .set(pre, { autoAlpha: 0 }, 0.06 * (bands.length - 1) + 0.54);
          t0 = 0.06 * (bands.length - 1) + 0.34;
          const n = { v: 0 };
          const num = q(".tb-pre-num");
          gsap.to(n, {
            v: 100,
            duration: 0.42,
            ease: "power2.out",
            onUpdate: () => {
              if (num) num.textContent = Math.round(n.v) + "%";
            },
          });
        }
        intro.to(
          tape,
          { dy: 0, duration: 0.85, ease: "bounce.out", onUpdate: () => drawTape() },
          t0
        );
        intro
          .to(
            qa(".tb-kw"),
            { opacity: 1, y: 0, duration: 0.42, ease: "back.out(2)", stagger: 0.09 },
            t0 + 0.14
          )
          .to(
            q(".tb-kicker .tb-badge"),
            { scale: 1, rotation: -8, duration: 0.65, ease: "back.out(2.2)" },
            t0 + 0.18
          );
        const order = gsap.utils.shuffle(letters.slice());
        order.forEach((el, i) => {
          const t = t0 + 0.24 + i * 0.038;
          intro
            .fromTo(
              el,
              { opacity: 0, scaleX: 1.5, scaleY: 0.14, y: 42 },
              {
                opacity: 1,
                scaleX: 0.8,
                scaleY: 1.28,
                y: -36,
                duration: 0.16,
                ease: "power2.out",
              },
              t
            )
            .to(
              el,
              { scaleX: 1.18, scaleY: 0.84, y: 0, duration: 0.12, ease: "power2.in" },
              t + 0.16
            )
            .to(
              el,
              { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1,.32)" },
              t + 0.28
            );
        });
        intro.to(
          qa(".tb-hero-note, .tb-cue"),
          { opacity: 1, duration: 0.45, stagger: 0.08 },
          t0 + 0.72
        );

        let ready = false;
        const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
        Promise.race([
          fonts,
          new Promise((r) => window.setTimeout(r, 120)),
        ]).then(() => {
          if (!alive) return;
          ready = true;
          refreshAll();
          ScrollTrigger.refresh();
          intro.play();
        });
        fonts.then(() => {
          if (!alive) return;
          refreshAll();
          ScrollTrigger.refresh();
        });

        const h1 = q(".tb-h1");
        const onOver = (e: Event) => {
          const el = (e.target as HTMLElement).closest(".tb-l");
          if (!el || !ready || intro.isActive()) return;
          ctx.add(() =>
            gsap.fromTo(
              el,
              { scaleX: 1.25, scaleY: 0.72 },
              {
                scaleX: 1,
                scaleY: 1,
                duration: 0.8,
                ease: "elastic.out(1,.28)",
                overwrite: "auto",
              }
            )
          );
        };
        if (h1 && window.matchMedia("(pointer: fine)").matches) {
          h1.addEventListener("pointerover", onOver);
          cleanups.push(() => h1.removeEventListener("pointerover", onOver));
        }

        const onInit = () => refreshAll();
        const onDone = () => {
          drawTape();
          drawBanner();
        };
        ScrollTrigger.addEventListener("refreshInit", onInit);
        ScrollTrigger.addEventListener("refresh", onDone);
        cleanups.push(() => {
          ScrollTrigger.removeEventListener("refreshInit", onInit);
          ScrollTrigger.removeEventListener("refresh", onDone);
        });
        gsap.to(tape, {
          p: 1,
          ease: "none",
          onUpdate: () => drawTape(),
          scrollTrigger: {
            trigger: run,
            start: "top top",
            end: () => "+=" + Math.max(200, tape.y1 - window.innerHeight * 0.62),
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        qa("[data-drop]").forEach((el, i) => {
          const s = i % 2 ? 1 : -1;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
          tl.from(el, {
            y: 170,
            x: s * 80,
            rotation: s * 16,
            scale: 1.07,
            opacity: 0,
            duration: 1.05,
            ease: "back.out(1.5)",
          });
          const bits = el.querySelectorAll(".tb-tp-in");
          if (bits.length) {
            tl.from(
              bits,
              {
                scale: 1.8,
                opacity: 0,
                duration: 0.28,
                ease: "power4.in",
                stagger: 0.09,
              },
              0.6
            );
          }
        });

        gsap.to(bn, {
          reveal: 1,
          ease: "none",
          onUpdate: drawBanner,
          scrollTrigger: {
            trigger: banner,
            start: "top 92%",
            end: "top 30%",
            scrub: 0.6,
          },
        });
        const tick = (_t: number, dt: number) => {
          bn.off += (dt / 1000) * (70 + bn.boost);
          if (bn.boost > 2) {
            bn.ph += (dt / 1000) * bn.boost * 0.004;
            buildWave(bn.A0 * (1 + Math.min(0.55, bn.boost / 900)));
          } else if (bn.A !== bn.A0) {
            buildWave(bn.A0);
          }
          bn.boost *= 0.93;
          drawBanner();
        };
        ScrollTrigger.create({
          trigger: banner,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) =>
            self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick),
          onUpdate: (self) => {
            bn.boost = Math.min(
              700,
              Math.max(bn.boost, Math.abs(self.getVelocity()) * 0.35)
            );
          },
        });
        cleanups.push(() => gsap.ticker.remove(tick));

        maskTimeline(
          gsap.timeline({
            onUpdate: drawMask,
            scrollTrigger: {
              trigger: mask,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
            },
          })
        );
        gsap.from(qa(".tb-burst"), {
          scale: 0,
          rotation: -120,
          duration: 0.9,
          ease: "back.out(2.4)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: mask,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.from(qa(".tb-mask-h .tb-ml"), {
          yPercent: 110,
          rotation: 6,
          duration: 0.9,
          ease: "back.out(1.6)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: mask,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        });
        for (const el of qa(".tb-burst")) {
          gsap.to(el, {
            yPercent: -60 * Number(el.getAttribute("data-depth") || 1),
            ease: "none",
            scrollTrigger: {
              trigger: mask,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        for (const j of qa(".tb-join")) {
          gsap.fromTo(
            j.querySelector(".tb-join-in"),
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: j,
                start: "top 96%",
                end: "top 50%",
                scrub: 0.5,
              },
            }
          );
        }

        const cards = qa(".tb-prod");
        const shopTl = gsap.timeline({
          scrollTrigger: {
            trigger: q(".tb-shop-grid"),
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
        shopTl.from(cards, {
          y: 220,
          x: (i: number) => (1.5 - i) * 90,
          rotation: (i: number) => [-16, 11, -8, 14][i % 4],
          opacity: 0,
          duration: 1.05,
          ease: "back.out(1.4)",
          stagger: 0.1,
        });
        shopTl.from(
          qa(".tb-prod .tb-tp-in"),
          { scale: 1.8, opacity: 0, duration: 0.26, ease: "power4.in", stagger: 0.05 },
          0.7
        );

        const word = q(".tb-word");
        const footTl = gsap.timeline({
          scrollTrigger: {
            trigger: word,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        footTl
          .from(qa(".tb-word-l"), {
            yPercent: 70,
            scaleY: 0.3,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(2)",
            stagger: 0.07,
          })
          .from(
            qa(".tb-word .tb-tp-in"),
            { scale: 2, opacity: 0, duration: 0.25, ease: "power4.in", stagger: 0.06 },
            0.55
          );

        let lastW = root.clientWidth;
        let roTimer: number | null = null;
        const ro = new ResizeObserver(() => {
          const nextW = root.clientWidth;
          if (IS_COMPACT_GPU && Math.abs(nextW - lastW) < 2) return;
          lastW = nextW;
          if (roTimer) window.clearTimeout(roTimer);
          roTimer = window.setTimeout(() => {
            if (alive) ScrollTrigger.refresh();
          }, 180);
        });
        ro.observe(root);
        return () => {
          if (roTimer) window.clearTimeout(roTimer);
          ro.disconnect();
        };
      });
    }, root);

    ctxRef.current = ctx;
    return () => {
      alive = false;
      ctx.revert();
      ctxRef.current = null;
      for (const fn of cleanups) fn();
    };
  }, [preloader, items.length, brand]);

  return (
    <div
      ref={rootRef}
      className={"tb-root" + (className ? " " + className : "")}
      style={v({ "--h": height })}
    >
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      {preloader && (
        <div className="tb-pre" aria-hidden="true">
          <div className="tb-pre-label">
            <span className="tb-pre-word">Syncing</span>
            <span className="tb-pre-num">0%</span>
          </div>
          {["#ffd447", "#6d5dfc", "#1842b8", "#0e2447", "#5ef2b6"].map((c) => (
            <i key={c} className="tb-pre-band" style={{ background: c }} />
          ))}
        </div>
      )}

      <header className="tb-nav">
        <div className="tb-nav-in">
          <div className="tb-nav-left">
            <button
              type="button"
              className="tb-mob-menu-btn"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-controls={uid + "mob-sidebar"}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileNavOpen ? (
                <X size={18} strokeWidth={2.6} aria-hidden="true" />
              ) : (
                <Menu size={18} strokeWidth={2.6} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="tb-nav-brand"
              onClick={go("top")}
              aria-label={brand + " Web3 Co., back to top"}
            >
              <TallyBadge brand={brand} />
            </button>
          </div>

          <nav className="tb-nav-links" aria-label="Sections">
            {NAV_SECTIONS.map((sec) => (
              <button key={sec.id} type="button" onClick={go(sec.id)}>
                {sec.label}
              </button>
            ))}
          </nav>

          <div className="w3-nav-actions">
            <NetworkSwitcher compact />

            <button
              type="button"
              className={
                "w3-connect-btn" +
                (isConnected ? " w3-connect-btn-active" : "")
              }
              onClick={() => setWalletModalOpen(true)}
            >
              {isConnected ? (
                <>
                  <ChainIcon chainId={activeChain.id} size={16} />
                  <span className="w3-mono">{abbreviatedAddress}</span>
                  {mode === "demo" && <span className="w3-mini-demo">Demo</span>}
                </>
              ) : (
                <>
                  <Wallet size={15} strokeWidth={2.5} aria-hidden="true" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="tb-bag tb-bag-compact"
              onClick={() => {
                setOrderPlaced(false);
                setBagOpen(true);
              }}
              aria-expanded={bagOpen}
              aria-controls={uid + "kit-drawer"}
              aria-label={`Open Tally kit bag, ${bagCount} items`}
            >
              <ShoppingBag size={15} strokeWidth={2.5} aria-hidden="true" />
              <span className="tb-bag-n">{bagCount}</span>
              <span className="tb-sr" aria-live="polite">
                {bagCount
                  ? bagCount + (bagCount === 1 ? " item" : " items") + " in your kit"
                  : ""}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="tb-run">
        <section className="tb-hero" data-sec="top">
          <svg
            className="tb-hill"
            viewBox="0 0 1600 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 150 Q800 -10 1600 150 L1600 300 L0 300Z" fill="#2563eb" />
            <path d="M0 176 Q800 16 1600 176 L1600 300 L0 300Z" fill="#1842b8" />
          </svg>
          <div className="tb-doodles" aria-hidden="true" />
          <div className="tb-hero-copy">
            <p className="tb-kicker">
              <span className="tb-kw">Web3</span>
              <TallyBadge brand={brand} />
              <span className="tb-kw">built to</span>
            </p>
            <h1 className="tb-h1" aria-label={headline.join(" ")}>
              {headline.map((line, li) => (
                <span key={li} className="tb-h1-line" aria-hidden="true">
                  {Array.from(line).map((ch, i) =>
                    ch === " " ? (
                      <span key={i} className="tb-sp" />
                    ) : (
                      <span key={i} className="tb-l">
                        {ch}
                      </span>
                    )
                  )}
                </span>
              ))}
            </h1>
          </div>
          <p className="tb-hero-note">
            <b>6.4%</b> Staking APY
          </p>
          <p className="tb-cue">
            <span className="tb-cue-drag">Drag to sign &middot; </span>Scroll, it
            rolls <span aria-hidden="true">&darr;</span>
          </p>
        </section>

        <section className="tb-collage" data-sec="story" aria-label="Our protocol">
          <div className="tb-board">
            <div className="tb-item tb-i-head" style={v({ "--r": "-3deg" })}>
              <div className="tb-in" data-drop>
                <p className="tb-label">02 &mdash; The block trail</p>
                <div className="tb-hint-row">
                  <p className="tb-hint">psst, peel the seals off &rarr;</p>
                  {peeledCount > 0 && (
                    <button
                      type="button"
                      className="tb-restick"
                      onClick={restickAll}
                    >
                      Re-seal all
                    </button>
                  )}
                </div>
                <h2 className="tb-collage-h">
                  For real
                  <br />
                  Web3 life
                </h2>
              </div>
            </div>

            <div className="tb-item tb-i-card" style={v({ "--r": "2.5deg" })}>
              <div className="tb-in" data-drop>
                <article className="tb-card tb-paper">
                  <p className="tb-card-k">Our protocol &middot; est. 2024</p>
                  <p className="tb-card-t">{story}</p>
                  <p className="tb-card-sign">
                    &mdash; the {brand.toLowerCase()} dao
                  </p>
                </article>
                <BandStrip kind="gold" x="88%" y="2%" w="30%" r={38} peel />
                <BandStrip kind="gold" x="86%" y="98%" w="26%" r={-30} peel />
              </div>
            </div>

            <div className="tb-item tb-i-note" style={v({ "--r": "-7deg" })}>
              <div className="tb-in" data-drop>
                <div className="tb-note">
                  <p className="tb-note-h">chain list</p>
                  <ul>
                    {todo.map((t, i) => (
                      <li key={i} className={i === 2 ? "tb-done" : undefined}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <BandStrip kind="frost" x="50%" y="1%" w="56%" r={-4} peel />
              </div>
            </div>

            <div className="tb-item tb-i-print" style={v({ "--r": "-11deg" })}>
              <div className="tb-in" data-drop>
                <div className="tb-print tb-paper">
                  <BanknotePrint uid={uid} />
                </div>
                <BandStrip kind="gold" x="34%" y="2%" w="44%" r={-14} peel />
                <BandStrip kind="frost" x="90%" y="94%" w="34%" r={48} peel />
              </div>
            </div>

            <div className="tb-item tb-i-packet" style={v({ "--r": "7deg" })}>
              <div className="tb-in" data-drop>
                <div className="tb-packet">
                  <div className="tb-packet-rib tb-packet-rib-v" />
                  <div className="tb-packet-rib tb-packet-rib-h" />
                  <PaydayCrest uid={uid} />
                  <div className="tb-packet-tag">
                    airdrop!
                    <br />
                    <small>zero gas</small>
                  </div>
                </div>
                <BandStrip kind="frost" x="8%" y="64%" w="30%" r={70} peel />
              </div>
            </div>

            <div className="tb-item tb-i-ticket" style={v({ "--r": "9deg" })}>
              <div className="tb-in" data-drop>
                <div className="tb-ticket tb-paper">
                  <span className="tb-ticket-k">Genesis drop</span>
                  <span className="tb-ticket-big">Fri 12:00</span>
                  <span className="tb-ticket-s">
                    5 chains &middot; 0% fee &middot; instant
                  </span>
                </div>
                <BandStrip kind="mint" x="50%" y="0%" w="64%" r={-3} peel />
              </div>
            </div>

            <div className="tb-item tb-i-seal" style={v({ "--r": "12deg" })}>
              <div className="tb-in" data-drop>
                <div className="tb-seal">
                  <span>Earns</span>
                  <b>6.4%</b>
                  <span>APY*</span>
                </div>
              </div>
            </div>
          </div>
          <p className="tb-fine">
            *Indicative variable staking APY on audited Tally Smart Vaults. Self-custody
            keys remain exclusively in your connected wallet.
          </p>
        </section>

        <div className="tb-tape" aria-hidden="true">
          <div className="tb-strip">
            <div className="tb-strip-print">
              {(brand + " PROTOCOL \u2726 SELF CUSTODY \u2726 ").repeat(24)}
            </div>
          </div>
          <Spool3D kind="frost" brand={brand} />
        </div>
      </div>

      <div className="tb-banner" aria-hidden="true">
        <svg className="tb-bn-svg" preserveAspectRatio="none">
          <defs>
            <clipPath id={uid + "bc"}>
              <rect
                className="tb-bn-cliprect"
                x="-240"
                y="-400"
                width="0"
                height="2000"
              />
            </clipPath>
          </defs>
          <path className="tb-bn-fill" fill="#ff5a43" />
          <g className="tb-bn-band" clipPath={"url(#" + uid + "bc)"}>
            <path
              className="tb-bn-line"
              data-w="1.06"
              fill="none"
              stroke="rgba(14,36,71,.28)"
              transform="translate(0 7)"
            />
            <path className="tb-bn-line" data-w="1" fill="none" stroke="#ffd447" />
            <path
              className="tb-bn-line"
              data-w="0.9"
              fill="none"
              stroke="#ffe06b"
            />
            <g className="tb-bn-sheen">
              <path
                className="tb-bn-line"
                data-w="0.2"
                fill="none"
                stroke="rgba(255,255,255,.4)"
              />
            </g>
          </g>
        </svg>
        <div className="tb-bn-glyphs">
          {items.map((ch, i) =>
            ch === "@" ? (
              <span key={i} className="tb-mq-i tb-mq-logo">
                <TallyBadge brand={brand} />
              </span>
            ) : (
              <span key={i} className="tb-mq-i">
                {ch}
              </span>
            )
          )}
        </div>
        <div className="tb-bn-roll">
          <SpoolFace kind="gold" brand={brand} />
        </div>
      </div>
      <p className="tb-sr">{marquee.join(". ")}</p>

      <section
        className="tb-mask"
        data-sec="vaults"
        aria-label="Smart vault custody trick"
      >
        <div className="tb-mask-stage">
          <svg
            className="tb-mask-svg"
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <mask
                id={uid + "mm"}
                maskUnits="userSpaceOnUse"
                x="-400"
                y="-400"
                width="2400"
                height="1800"
              >
                <rect x="-400" y="-400" width="2400" height="1800" fill="#fff" />
                {MK_STRIPS.map((s, i) => (
                  <rect
                    key={i}
                    x={-MK_L / 2}
                    y={-MK_W / 2}
                    width={MK_L}
                    height={MK_W}
                    fill="#000"
                    transform={
                      "translate(" + s.cx + " " + s.cy + ") rotate(" + s.a + ")"
                    }
                  />
                ))}
              </mask>
              <clipPath id={uid + "mc"}>
                <rect
                  className="tb-mk-cliprect"
                  x="-200"
                  y="-400"
                  width="0"
                  height="1800"
                />
              </clipPath>
              <pattern
                id={uid + "pt"}
                width="420"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <rect width="420" height="26" fill="#6d5dfc" />
                <rect y="3" width="420" height="2" fill="#8476ff" />
                <rect y="11" width="300" height="1.5" fill="#5848eb" />
                <rect x="120" y="18" width="300" height="3" fill="#7c6eff" />
              </pattern>
              <pattern
                id={uid + "mt"}
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-62)"
              >
                <rect width="10" height="10" fill="#f7e7ba" />
                <rect width="10" height="1.2" fill="#e2cc8f" />
                <rect y="5" width="10" height="0.8" fill="#fff3d1" />
              </pattern>
              <linearGradient id={uid + "me"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8c6d2c" stopOpacity="0.32" />
                <stop offset="0.07" stopColor="#fff" stopOpacity="0.28" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.93" stopColor="#000" stopOpacity="0.04" />
                <stop offset="1" stopColor="#6b4e16" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id={uid + "mcu"} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#c7aa61" />
                <stop offset="0.35" stopColor="#fff2c9" />
                <stop offset="0.7" stopColor="#e3c882" />
                <stop offset="1" stopColor="#947632" />
              </linearGradient>
              <linearGradient id={uid + "rl"} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#4c3dd4" />
                <stop offset="0.3" stopColor="#8d80ff" />
                <stop offset="0.55" stopColor="#6d5dfc" />
                <stop offset="1" stopColor="#4536c4" />
              </linearGradient>
            </defs>
            <g mask={"url(#" + uid + "mm)"}>
              <g clipPath={"url(#" + uid + "mc)"}>
                <rect
                  x="-400"
                  y="-400"
                  width="2400"
                  height="1800"
                  fill={"url(#" + uid + "pt)"}
                />
              </g>
            </g>
            <g className="tb-mk-roller" opacity="0">
              <rect
                x="-150"
                y="-400"
                width="150"
                height="1800"
                fill="#6d5dfc"
                opacity="0.5"
              />
              <rect
                x="-38"
                y="-400"
                width="76"
                height="1800"
                rx="38"
                fill={"url(#" + uid + "rl)"}
              />
              <rect
                x="-38"
                y="-400"
                width="76"
                height="1800"
                fill="none"
                stroke="#3728ab"
                strokeWidth="2"
                strokeDasharray="3 9"
                opacity="0.5"
              />
            </g>
            {MK_STRIPS.map((s, i) => (
              <g
                key={i}
                transform={
                  "translate(" + s.cx + " " + s.cy + ") rotate(" + s.a + ")"
                }
              >
                <g className="tb-mk-body">
                  <rect
                    y={-MK_W / 2 + 5}
                    height={MK_W}
                    width="0"
                    fill="rgba(14,36,71,.22)"
                  />
                  <rect
                    y={-MK_W / 2}
                    height={MK_W}
                    width="0"
                    fill={"url(#" + uid + "mt)"}
                  />
                  <rect
                    y={-MK_W / 2}
                    height={MK_W}
                    width="0"
                    fill={"url(#" + uid + "me)"}
                  />
                </g>
                <g className="tb-mk-curl" opacity="0">
                  <rect
                    x="4"
                    y={-MK_W / 2 - 4}
                    width="34"
                    height={MK_W + 8}
                    rx="10"
                    fill="rgba(14,36,71,.25)"
                  />
                  <rect
                    x="-18"
                    y={-MK_W / 2 - 8}
                    width="34"
                    height={MK_W + 16}
                    rx="17"
                    fill={"url(#" + uid + "mcu)"}
                  />
                </g>
                <g className="tb-mk-lead" opacity="0">
                  <circle r="80" cy="6" fill="rgba(14,36,71,.25)" />
                  <circle r="78" fill="#f7e3a8" />
                  <circle
                    r="78"
                    fill="none"
                    stroke="#d9bc6c"
                    strokeWidth="14"
                    strokeDasharray="1 3"
                    opacity="0.5"
                  />
                  <circle r="50" fill="#2c446e" />
                  <circle r="42" fill="#ff5a43" />
                  <text
                    y="5"
                    textAnchor="middle"
                    className="tb-mk-lead-t"
                    fill="#fffaf2"
                    fontSize="17"
                  >
                    {brand}
                  </text>
                  <ellipse
                    cx="-34"
                    cy="-46"
                    rx="20"
                    ry="8"
                    fill="#fff"
                    opacity="0.35"
                    transform="rotate(-36 -34 -46)"
                  />
                </g>
              </g>
            ))}
          </svg>

          <h2 className="tb-mask-h" aria-label={maskHeadline.join(" ")}>
            {maskHeadline.map((l, i) => (
              <span key={i} className="tb-ml-wrap" aria-hidden="true">
                <span className="tb-ml">{l}</span>
              </span>
            ))}
          </h2>

          <div className="tb-mask-roll" aria-hidden="true">
            <SpoolFace kind="gold" brand={brand} />
          </div>

          <div className="tb-mask-copy">
            <p className="tb-label">03 &mdash; Vault trick: lock, stake, bridge</p>
            <p>
              {brand.charAt(0) + brand.slice(1).toLowerCase()} Smart Vaults isolate
              staking yield and gas budgets before you sign, then unlock cleanly on
              demand. No hidden approvals, no custodial risk.
            </p>
            <button type="button" className="tb-btn" onClick={go("portfolio")}>
              Open portfolio
            </button>
          </div>

          <div className="tb-mask-stamp" aria-hidden="true">
            100%
            <br />
            on-chain
          </div>

          <CoinBurst
            points={10}
            color="#ffd447"
            center="#ff5a43"
            className="tb-b1"
            depth={0.85}
          />
          <CoinBurst
            points={8}
            color="#5ef2b6"
            center="#ffd447"
            className="tb-b2"
            depth={1.3}
          />
          <CoinBurst
            points={12}
            color="#ff9ad5"
            center="#fffaf2"
            className="tb-b3"
            depth={0.65}
          />
          <CoinBurst
            points={8}
            color="#d8d2ff"
            center="#5ef2b6"
            className="tb-b4"
            depth={1.45}
          />
          <CoinBurst
            points={10}
            color="#fffaf2"
            center="#ffd447"
            className="tb-b5"
            depth={1.1}
          />
        </div>
      </section>

      <AssetDashboard />

      <NftGallery />

      <section
        className="tb-shop tb-grainy"
        data-sec="cards"
        aria-label="Hardware and protocol passes"
      >
        <div className="tb-join tb-join-gold" aria-hidden="true">
          <i className="tb-join-in" />
        </div>
        <div className="tb-shop-head">
          <p className="tb-label">06 &mdash; Hardware &amp; passes</p>
          <h2 className="tb-shop-h">
            Pick your
            <br />
            stack
          </h2>
          <p className="tb-shop-sub">
            Four Web3 essentials, zero bloat. Pair a cold-storage signer card with
            multi-chain passes, vault modules, and gasless bridge credits.
          </p>
        </div>
        <div className="tb-shop-grid">
          {products.map((p, i) => (
            <article key={p.name} className="tb-prod">
              <BandStrip kind="violet" x="18%" y="0%" w="36%" r={-28} />
              <BandStrip kind="violet" x="84%" y="1%" w="30%" r={22} />
              <div className="tb-prod-roll">
                <Spool3D kind={p.kind} brand={brand} />
              </div>
              <h3 className="tb-prod-name">{p.name}</h3>
              <p className="tb-prod-line">{p.line}</p>
              <div className="tb-prod-foot">
                <span className="tb-prod-price">{p.price}</span>
                <button
                  type="button"
                  className="tb-btn tb-btn-sm"
                  onClick={add(i)}
                >
                  {added === i ? "Added!" : "Add to kit"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="tb-foot tb-grainy">
        <div className="tb-join tb-join-foil" aria-hidden="true">
          <i className="tb-join-in" />
        </div>
        <div className="tb-foot-top">
          <div>
            <p className="tb-label">07 &mdash; Stay synced</p>
            <p className="tb-foot-h">Protocol drops, yield boosts, zero spam.</p>
          </div>
          <form
            className="tb-form"
            onSubmit={(e) => {
              e.preventDefault();
              setJoined(true);
              setEmail("");
            }}
          >
            <label className="tb-sr" htmlFor={uid + "em"}>
              Email address
            </label>
            <input
              id={uid + "em"}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="tb-input"
            />
            <button type="submit" className="tb-btn">
              Count me in
            </button>
            <p className="tb-form-msg" aria-live="polite">
              {joined ? "You're synced with Tally Protocol." : ""}
            </p>
          </form>
        </div>
        <div className="tb-word" aria-label={brand}>
          {Array.from(brand).map((ch, i) => (
            <span key={i} className="tb-word-l" aria-hidden="true">
              {ch}
              <BandStrip
                kind="foil"
                x="50%"
                y="46%"
                w="72%"
                r={i % 2 ? 34 : -36}
              />
            </span>
          ))}
        </div>
        <div className="tb-foot-bar">
          <span>
            &copy; 2026 {brand.charAt(0) + brand.slice(1).toLowerCase()} Web3 Co.
          </span>
          <span>Built to keep your crypto sorted.</span>
        </div>
      </footer>

      {bagOpen && (
        <div
          className="tb-drawer-bg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBagOpen(false);
          }}
        >
          <aside
            id={uid + "kit-drawer"}
            className="tb-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your Tally Web3 kit"
          >
            <div className="tb-drawer-head">
              <h2 className="tb-drawer-title">Your Kit ({bagCount})</h2>
              <button
                type="button"
                className="tb-drawer-close"
                onClick={() => setBagOpen(false)}
                aria-label="Close kit drawer"
              >
                &times;
              </button>
            </div>

            <div className="tb-drawer-body">
              {orderPlaced ? (
                <div className="tb-drawer-done">
                  <h3>All sorted!</h3>
                  <p>
                    Your {brand.charAt(0) + brand.slice(1).toLowerCase()} hardware
                    &amp; pass kit is reserved.
                  </p>
                  <button
                    type="button"
                    className="tb-btn tb-btn-sm"
                    onClick={() => {
                      setOrderPlaced(false);
                      setBagOpen(false);
                    }}
                  >
                    Keep exploring
                  </button>
                </div>
              ) : bagItems.length === 0 ? (
                <div className="tb-drawer-empty">
                  <p className="tb-drawer-empty-note">Your kit is empty!</p>
                  <p>
                    Pick a hardware signer or protocol pass from the stack below.
                  </p>
                  <button
                    type="button"
                    className="tb-btn"
                    onClick={() => {
                      setBagOpen(false);
                      go("cards")();
                    }}
                  >
                    Pick your stack
                  </button>
                </div>
              ) : (
                bagItems.map(({ product, qty, unitPrice }) => (
                  <div key={product.name} className="tb-bag-item">
                    <div className="tb-bag-item-face" aria-hidden="true">
                      <SpoolFace kind={product.kind} brand={brand} />
                    </div>
                    <div className="tb-bag-item-info">
                      <p className="tb-bag-item-name">{product.name}</p>
                      <p className="tb-bag-item-unit">
                        {product.price} each &middot; ${qty * unitPrice}
                      </p>
                    </div>
                    <div className="tb-qty" aria-label={product.name + " quantity"}>
                      <button
                        type="button"
                        onClick={() => updateQty(product.name, -1)}
                        aria-label={"Remove one " + product.name}
                      >
                        &minus;
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(product.name, 1)}
                        aria-label={"Add one " + product.name}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {bagItems.length > 0 && !orderPlaced && (
              <div className="tb-drawer-foot">
                <div className="tb-drawer-total">
                  <span>One-time kit total</span>
                  <strong>${bagSubtotal}</strong>
                </div>
                <button
                  type="button"
                  className="tb-btn"
                  onClick={handleOnChainCheckout}
                >
                  Checkout On-Chain &middot; ${bagSubtotal}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="tb-mob-side-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileNavOpen(false);
            }}
          >
            <motion.aside
              id={uid + "mob-sidebar"}
              className="tb-mob-side"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile sections navigation"
              initial={{ x: -200, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="tb-mob-side-head">
                <span>Menu</span>
                <button
                  type="button"
                  className="tb-mob-side-close"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation sidebar"
                >
                  <X size={15} strokeWidth={2.6} />
                </button>
              </div>
              <nav className="tb-mob-side-nav" aria-label="Mobile sections">
                {NAV_SECTIONS.map((sec, idx) => (
                  <button
                    key={sec.id}
                    type="button"
                    className="tb-mob-side-link"
                    onClick={() => {
                      setMobileNavOpen(false);
                      go(sec.id)();
                    }}
                  >
                    <span className="tb-mob-side-idx">0{idx + 1}</span>
                    <span>{sec.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <React.Suspense fallback={null}>
        {mountWalletModal && <WalletConnectModal />}
        {mountTxModal && <TransactionModal />}
      </React.Suspense>
    </div>
  );
}
