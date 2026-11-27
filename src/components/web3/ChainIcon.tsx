import type { SupportedChainId } from "../../web3/config";
import type { TokenSymbol } from "../../web3/data";

export function ChainIcon({
  chainId,
  size = 18,
}: {
  chainId: SupportedChainId | number;
  size?: number;
}) {
  switch (chainId) {
    case 1: // Ethereum
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#627EEA" />
          <path d="M12 4.5L7.4 12.1L12 14.8L16.6 12.1L12 4.5Z" fill="#fff" />
          <path
            d="M12 15.8L7.4 13.1L12 19.5L16.6 13.1L12 15.8Z"
            fill="#dbe4ff"
          />
        </svg>
      );
    case 137: // Polygon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#8247E5" />
          <path
            d="M15.4 9.2L13 7.8L9.6 9.8V13.8L7.6 14.9L5.6 13.8V11.4L7.6 10.3L8.8 11V9.2L7.6 8.5L4.2 10.5V14.5L7.6 16.5L11 14.5V10.5L13 9.4L15 10.5V12.9L13 14L11.8 13.3V15.1L13 15.8L16.4 13.8V9.8L15.4 9.2Z"
            fill="#fff"
          />
        </svg>
      );
    case 56: // BNB Smart Chain
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#F3BA2F" />
          <path
            d="M12 5.2L14.5 7.7L12 10.2L9.5 7.7L12 5.2ZM16.3 9.5L18.8 12L16.3 14.5L13.8 12L16.3 9.5ZM7.7 9.5L10.2 12L7.7 14.5L5.2 12L7.7 9.5ZM12 13.8L14.5 16.3L12 18.8L9.5 16.3L12 13.8ZM12 10.5L13.5 12L12 13.5L10.5 12L12 10.5Z"
            fill="#0e2447"
          />
        </svg>
      );
    case 42161: // Arbitrum
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#213147" />
          <path
            d="M12 4.5L18.5 8.2V15.8L12 19.5L5.5 15.8V8.2L12 4.5Z"
            fill="none"
            stroke="#28A0F0"
            strokeWidth="1.8"
          />
          <path d="M10.2 15.6L12.8 8.4H14.8L12.2 15.6H10.2Z" fill="#fff" />
          <path d="M13.6 15.6L15.4 10.8L16.8 15.6H13.6Z" fill="#28A0F0" />
        </svg>
      );
    case 8453: // Base
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#0052FF" />
          <path
            d="M12 6.2C15.2 6.2 17.8 8.8 17.8 12C17.8 15.2 15.2 17.8 12 17.8C9 17.8 6.6 15.5 6.3 12.6H13.8V11.4H6.3C6.6 8.5 9 6.2 12 6.2Z"
            fill="#fff"
          />
        </svg>
      );
  }
}

export function TokenIcon({
  symbol,
  size = 36,
}: {
  symbol: TokenSymbol | string;
  size?: number;
}) {
  switch (symbol) {
    case "ETH":
      return <ChainIcon chainId={1} size={size} />;
    case "POL":
      return <ChainIcon chainId={137} size={size} />;
    case "BNB":
      return <ChainIcon chainId={56} size={size} />;
    case "ARB":
      return <ChainIcon chainId={42161} size={size} />;
    case "USDC":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#2775CA" />
          <circle
            cx="12"
            cy="12"
            r="7.8"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeDasharray="10 4"
          />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            $
          </text>
        </svg>
      );
    case "WBTC":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#F7931A" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            ₿
          </text>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#0e2447" />
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#5ef2b6"
            fontSize="9"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            {symbol.slice(0, 3)}
          </text>
        </svg>
      );
  }
}

export function WalletBrandIcon({
  provider,
  size = 28,
}: {
  provider: "metamask" | "walletconnect" | "coinbase" | "demo";
  size?: number;
}) {
  if (provider === "metamask") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#FFF3E0" />
        <path d="M25.5 6L17.4 12L18.9 8.5L25.5 6Z" fill="#E2761B" />
        <path d="M6.5 6L14.5 12.1L13.1 8.5L6.5 6Z" fill="#E4761B" />
        <path d="M22.6 21.4L20.4 24.8L25 26L26.3 21.5L22.6 21.4Z" fill="#E4761B" />
        <path d="M5.7 21.5L7 26L11.6 24.8L9.4 21.4L5.7 21.5Z" fill="#E4761B" />
        <path d="M11.3 14.7L10 16.6L14.6 16.8L14.4 11.9L11.3 14.7Z" fill="#E4761B" />
        <path d="M20.7 14.7L17.5 11.8L17.4 16.8L22 16.6L20.7 14.7Z" fill="#E4761B" />
        <path d="M11.6 24.8L14.4 23.4L12 21.5L11.6 24.8Z" fill="#D7C1B3" />
        <path d="M17.6 23.4L20.4 24.8L20 21.5L17.6 23.4Z" fill="#D7C1B3" />
        <path d="M14.4 19.6L17.6 19.6L18.4 21.5L13.6 21.5L14.4 19.6Z" fill="#233447" />
      </svg>
    );
  }
  if (provider === "walletconnect") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#3B99FC" />
        <path
          d="M10.2 12.8C13.4 9.7 18.6 9.7 21.8 12.8L22.2 13.2C22.4 13.4 22.4 13.7 22.2 13.9L20.8 15.3C20.7 15.4 20.5 15.4 20.4 15.3L19.8 14.7C17.7 12.6 14.3 12.6 12.2 14.7L11.5 15.4C11.4 15.5 11.2 15.5 11.1 15.4L9.7 14C9.5 13.8 9.5 13.5 9.7 13.3L10.2 12.8ZM24.5 15.5L25.7 16.7C25.9 16.9 25.9 17.2 25.7 17.4L20.2 22.8C20 23 19.7 23 19.5 22.8L15.6 19C15.5 18.9 15.4 18.9 15.4 19L11.5 22.8C11.3 23 11 23 10.8 22.8L5.3 17.4C5.1 17.2 5.1 16.9 5.3 16.7L6.5 15.5C6.7 15.3 7 15.3 7.2 15.5L11.1 19.3C11.2 19.4 11.3 19.4 11.3 19.3L15.2 15.5C15.4 15.3 15.7 15.3 15.9 15.5L19.8 19.3C19.9 19.4 20 19.4 20 19.3L23.9 15.5C24.1 15.3 24.3 15.3 24.5 15.5Z"
          fill="#fff"
        />
      </svg>
    );
  }
  if (provider === "coinbase") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#0052FF" />
        <circle cx="16" cy="16" r="9.5" fill="#fff" />
        <rect x="12.8" y="12.8" width="6.4" height="6.4" rx="1.6" fill="#0052FF" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0e2447" />
      <circle cx="16" cy="16" r="8" fill="#5ef2b6" />
      <path
        d="M12.5 16L15 18.5L19.8 13.5"
        stroke="#0e2447"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
