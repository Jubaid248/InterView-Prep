// Brand mark: Tota talking inside a speech bubble, with voice waves.
// Keep in sync with app/icon.svg (the favicon).
export default function ParrotLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path
        d="M24 14H96Q110 14 110 28V74Q110 88 96 88H52L32 106V88H24Q10 88 10 74V28Q10 14 24 14Z"
        fill="#2F5E25"
      />
      <path d="M36 30Q32 18 42 16Q42 24 48 28Z" fill="#57C6B8" />
      <circle cx="46" cy="51" r="20" fill="#4E9A3E" />
      <path d="M42 71Q28 67 28 53Q36 63 48 64Z" fill="#2E9F9C" />
      <path d="M62 41Q78 41 78 56Q76 62 71 64Q72 55 63 55Z" fill="#E2432B" />
      <circle cx="53" cy="45" r="5" fill="#FBF9F4" />
      <circle cx="54" cy="45" r="2.5" fill="#17221A" />
      <g fill="none" stroke="#B4E585" strokeWidth="5" strokeLinecap="round">
        <path d="M85 42Q90 51 85 60" />
        <path d="M94 36Q101 51 94 66" />
      </g>
    </svg>
  );
}
