import { useEffect, useState } from "react";
import { getEquipments } from "../api/putzmeister";
import EquipmentDetailModal from "../components/EquipmentDetailModal";

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [snapshotTime, setSnapshotTime] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getEquipments(page)
      .then((data) => {
        setEquipments(data.Equipment || []);
        setSnapshotTime(data.snapshotTime);
        const lastLink = data.Links?.find((l) => l.rel === "last");
        const lastPage = lastLink ? parseInt(lastLink.href.split("/").pop()) : 1;
        setHasNext(page < lastPage);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const statusColor = (status) => status === "ONLINE" ? "#22c55e" : "#ef4444";

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>Equipment Report</div>
          {snapshotTime && (
            <div style={styles.headerSub}>Snapshot: {new Date(snapshotTime).toLocaleString()}</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...styles.refreshBtn, opacity: loading ? 0.6 : 1 }} onClick={fetchData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <div style={styles.headerBadge}>{equipments.length} Equipment{equipments.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Error */}
      {error && <div style={styles.error}>⚠️ {error}</div>}

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>OEM Name</th>
              <th style={styles.th}>Model</th>
              <th style={styles.th}>Serial Number</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={styles.center}>
                <div style={styles.spinnerWrap}>
                  <div style={styles.spinner} />
                  <span style={styles.spinnerText}>Loading equipment data...</span>
                </div>
              </td></tr>
            ) : equipments.length === 0 ? (
              <tr><td colSpan={7} style={styles.center}>No equipment found.</td></tr>
            ) : (
              equipments.map((eq, i) => {
                const h = eq.EquipmentHeader;
                const loc = eq.Location;
                const status = eq.MachineStatus?.Status ?? "UNKNOWN";
                return (
                  <tr key={h.SerialNumber} style={{ ...styles.tr, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={styles.td}>{(page - 1) * 10 + i + 1}</td>
                    <td style={styles.td}><span style={styles.oemBadge}>{h.OEMName}</span></td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{h.Model}</td>
                    <td style={{ ...styles.td, fontFamily: "monospace", color: "#555" }}>{h.SerialNumber}</td>
                    <td style={styles.td}>
                      {loc ? (
                        <a href={`https://maps.google.com/?q=${loc.Latitude},${loc.Longitude}`} target="_blank" rel="noreferrer" style={styles.mapLink}>
                          📍 {loc.Latitude?.toFixed(4)}, {loc.Longitude?.toFixed(4)}
                        </a>
                      ) : "—"}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: statusColor(status) }}>{status}</span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.viewBtn} onClick={() => setSelected(eq)}>View</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span style={styles.pageNum}>Page {page}</span>
        <button style={{ ...styles.pageBtn, opacity: !hasNext ? 1  : 1 }}  onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>

      {/* Inline Detail Panel */}
      {selected && (
        <div style={{ margin: "0 24px 24px" }} ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <EquipmentDetailModal equipment={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7fa", fontFamily: "'Segoe UI', Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "14px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderBottom: "2px solid #0178d2" },
  headerTitle: { fontSize: 18, fontWeight: 700, color: "#0178d2", letterSpacing: 0.2 },
  headerSub: { fontSize: 11, color: "#888", marginTop: 3 },
  headerBadge: { background: "#e8f3fc", color: "#0178d2", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #b3d9f5" },
  error: { margin: "12px 24px", padding: "10px 14px", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 6, color: "#c00", fontSize: 13 },
  tableWrap: { margin: "16px 24px", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1px solid #e5e9ef" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#0178d2" },
  th: { padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: 0.6 },
  tr: { borderBottom: "1px solid #eef1f5", transition: "background 0.1s" },
  td: { padding: "11px 14px", fontSize: 13, color: "#333", verticalAlign: "middle" },
  center: { textAlign: "center", padding: 40, color: "#999" },
  oemBadge: { background: "#e8f3fc", color: "#0178d2", padding: "3px 10px", borderRadius: 10, fontSize: 12, fontWeight: 600 },
  statusBadge: { color: "#fff", padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 },
  mapLink: { color: "#0178d2", textDecoration: "none", fontSize: 12 },
  viewBtn: { background: "#0178d2", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  pagination: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, padding: "12px 24px 24px" },
  refreshBtn: { background: "#222", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  pageBtn: { background: "#fff", color: "#0178d2", border: "1px solid #0178d2", padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  pageNum: { fontSize: 13, fontWeight: 600, color: "#555", padding: "0 4px" },
  spinnerWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 14 },
  spinner: { width: 40, height: 40, border: "3px solid #dbeafe", borderTop: "3px solid #0178d2", borderRadius: "50%", animation: "spin 0.75s linear infinite" },
  spinnerText: { fontSize: 13, color: "#0178d2", fontWeight: 600, letterSpacing: 0.3 },
};
