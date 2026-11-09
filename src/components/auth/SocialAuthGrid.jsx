const PROVIDERS = [
  { icon: "fa-google", label: "Google" },
  { icon: "fa-apple", label: "Apple" },
  { icon: "fa-microsoft", label: "Microsoft" },
  { icon: "fa-github", label: "GitHub" },
];

export default function SocialAuthGrid({ onSelect }) {
  return (
    <>
      <div className="auth-divider">
        <span>O continúa con</span>
      </div>

      <div className="social-auth-grid">
        {PROVIDERS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="social-btn"
            onClick={() => onSelect?.(p.label)}
          >
            <i className={`fa-brands ${p.icon}`}></i>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}