export default function GoogleMeetIcon({ size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <rect x="2" y="6" width="13" height="12" rx="2.5" fill="#1a73e8" />
      <path d="M15 10.2l6-3.4v10.4l-6-3.4z" fill="#00ac47" />
      <rect x="2" y="6" width="13" height="4" rx="2" fill="#4285f4" />
      <rect x="2" y="14" width="13" height="4" rx="2" fill="#ea4335" />
      <rect x="5" y="10" width="6" height="4" fill="#fbbc04" opacity=".9" />
    </svg>
  )
}
