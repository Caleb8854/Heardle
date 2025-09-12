export default function MyButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}
