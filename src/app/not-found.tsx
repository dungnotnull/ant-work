import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "28rem" }}>
        <p style={{ fontSize: "4.5rem", fontWeight: 800, color: "#6366f1", lineHeight: 1, margin: "0 0 0.5rem" }}>
          404
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.375rem" }}>
          Page not found
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.5rem" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "0.625rem 1.5rem",
            borderRadius: 8,
            background: "#6366f1",
            color: "white",
            fontSize: "0.8125rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
