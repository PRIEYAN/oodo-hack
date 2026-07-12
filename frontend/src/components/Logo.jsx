// Bespoke TransitOps logo mark.
// A rounded "waypoint route" glyph: two nodes joined by a road curve with a
// motion chevron — reads as routing / dispatch, not a generic vehicle icon.
// Swap `mark` for an <img src="/logo.svg" /> once you drop your Canva export in
// frontend/public/logo.svg.

export function LogoMark({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#2775CA" />
      {/* road curve */}
      <path
        d="M9 22c0-5 14-5 14-11"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* start node */}
      <circle cx="9" cy="22" r="3" fill="#fff" />
      <circle cx="9" cy="22" r="1.3" fill="#2775CA" />
      {/* end waypoint (chevron) */}
      <path
        d="M20 9l4 2-2 4"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ compact = false }) {
  // Full horizontal lockup exported from Canva (public/logo.png).
  // Falls back to the inline mark + wordmark if the image is missing.
  if (compact) return <LogoMark />;
  return (
    <img
      src="/logo.png"
      alt="TransitOps"
      className="h-8 w-auto"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

// Oversized, faint version of the mark's road curve — a recurring background
// motif for dark hero/brand panels so the logo's shape shows up as more than
// a corner badge.
export function RouteWatermark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M20 340c0-90 200-90 200-200s160-90 160-140"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="1 14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 380c0-110 220-110 220-230"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <circle cx="60" cy="380" r="7" fill="currentColor" />
      <path d="M270 130l24 10-10 24" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
    </svg>
  );
}

export default Logo;
