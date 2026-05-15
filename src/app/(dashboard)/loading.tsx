export default function Loading() {
  return (
    <div style={{
      minHeight: "calc(100vh - 200px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>Loading...</p>
      </div>
    </div>
  );
}
