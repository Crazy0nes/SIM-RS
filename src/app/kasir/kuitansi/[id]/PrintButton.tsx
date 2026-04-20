'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} style={{ background: "#0070f3", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontSize: "14px" }}>
        🖨️ Cetak Dokumen
    </button>
  );
}
