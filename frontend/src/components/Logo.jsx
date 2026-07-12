// RC Tutors logo mark — a graduation cap in the brand purple with a gold tassel.
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-label="RC Tutors logo" role="img">
      <defs>
        <linearGradient id="rcGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8E7BFF" />
          <stop offset="100%" stopColor="#6C63FF" />
        </linearGradient>
      </defs>
      {/* rounded badge */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#rcGrad)" />
      {/* cap base (sits on the head) */}
      <path d="M13 18.5 V23.2 C13 25.8 27 25.8 27 23.2 V18.5" fill="#EAE7FF" />
      {/* mortarboard top */}
      <path d="M20 10.5 L33.5 16.3 L20 22.1 L6.5 16.3 Z" fill="#FFFFFF" />
      {/* tassel */}
      <path d="M28.7 16.3 V21.2" stroke="#FFC94D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="28.7" cy="22.4" r="1.7" fill="#FFC94D" />
    </svg>
  )
}
