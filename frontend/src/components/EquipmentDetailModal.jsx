import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function EquipmentDetailModal({ equipment, onClose }) {
  if (!equipment) return null;

  const {
    EquipmentHeader: h, Location, EngineStatus, MachineStatus,
    CumulativeOperatingHours, CumulativePumpedTotals, MaximumSpeedLast24,
    HydraulicOilTemperature, HydraulicOilPressure, CumulativeStrokesTotals,
    Software, CautionMessages,
  } = equipment;

  const isOnline = MachineStatus?.Status === "ONLINE";
  const statusColor = isOnline ? "#22c55e" : "#ef4444";

  const tempVal = HydraulicOilTemperature?.Temperature ?? 0;
  const pressureVal = HydraulicOilPressure?.Pressure ?? 0;
  const speedVal = MaximumSpeedLast24?.Speed ?? 0;
  const hoursVal = CumulativeOperatingHours?.Hour ?? 0;
  const pumpedVal = CumulativePumpedTotals?.Pumped ?? 0;
  const strokesVal = CumulativeStrokesTotals?.Strokes ?? 0;

  const radialData = [
    { name: "Temp", value: Math.min((tempVal / 120) * 100, 100), fill: "#f97316" },
    { name: "Pressure", value: Math.min((pressureVal / 400) * 100, 100), fill: "#3b82f6" },
    { name: "Speed", value: Math.min((speedVal / 120) * 100, 100), fill: "#a855f7" },
  ];

  const barData = [
    { name: "Op. Hours", value: parseFloat(hoursVal.toFixed(1)), fill: "#3b82f6" },
    { name: "Pumped (m³)", value: parseFloat(pumpedVal.toFixed(1)), fill: "#22c55e" },
    { name: "Strokes (k)", value: parseFloat((strokesVal / 1000).toFixed(1)), fill: "#f97316" },
  ];

  const StatCard = ({ icon, label, value, unit, color }) => (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ ...styles.statValue, color }}>{value ?? "—"}</div>
      <div style={styles.statUnit}>{unit}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.modelBadge}>{h.OEMName}</div>
            <div style={styles.modelName}>{h.Model}</div>
            <div style={styles.serialNo}>S/N: {h.SerialNumber}</div>
          </div>
          <div style={styles.headerRight}>
            <div style={{ ...styles.statusPill, background: isOnline ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${statusColor}` }}>
              <span style={{ ...styles.statusDot, background: statusColor }} />
              <span style={{ color: statusColor, fontWeight: 700, fontSize: 13 }}>{MachineStatus?.Status ?? "UNKNOWN"}</span>
            </div>
            <div style={styles.softwareTag}>{Software?.Interface} · {Software?.Version}</div>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={styles.body}>

          {/* Stat Cards Row */}
          <div style={styles.statsRow}>
            <StatCard icon="🕐" label="Operating Hours" value={hoursVal.toFixed(1)} unit="hrs" color="#3b82f6" />
            <StatCard icon="💧" label="Total Pumped" value={pumpedVal.toFixed(0)} unit={CumulativePumpedTotals?.PumpedUnits ?? "m³"} color="#22c55e" />
            <StatCard icon="🔁" label="Total Strokes" value={(strokesVal / 1000).toFixed(1)} unit="k strokes" color="#f97316" />
            <StatCard icon="🚗" label="Max Speed (24h)" value={speedVal} unit={MaximumSpeedLast24?.SpeedUnits?.split(" ")[0] ?? "km/h"} color="#a855f7" />
          </div>

          {/* Charts Row */}
          <div style={styles.chartsRow}>

            {/* Radial Gauges */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>⚡ Live Metrics</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#f0f0f0" }} />
                  <Tooltip formatter={(v, n) => [`${v.toFixed(1)}%`, n]} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={styles.radialLegend}>
                {radialData.map((d) => (
                  <div key={d.name} style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: d.fill }} />
                    <span style={styles.legendText}>{d.name}: {d.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📊 Cumulative Stats</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hydraulics + Location */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>🌡️ Hydraulics</div>
              <div style={styles.gaugeRow}>
                <GaugeBar label="Oil Temp" value={tempVal} max={120} unit={HydraulicOilTemperature?.TemperatureUnits ?? "°C"} color="#f97316" />
                <GaugeBar label="Oil Pressure" value={pressureVal} max={400} unit={HydraulicOilPressure?.PressureUnits ?? "bar"} color="#3b82f6" />
              </div>
              <div style={styles.chartTitle}>📍 Location</div>
              <div style={styles.locationBox}>
                <div style={styles.locRow}><span style={styles.locLabel}>Latitude</span><span style={styles.locVal}>{Location?.Latitude?.toFixed(6) ?? "—"}</span></div>
                <div style={styles.locRow}><span style={styles.locLabel}>Longitude</span><span style={styles.locVal}>{Location?.Longitude?.toFixed(6) ?? "—"}</span></div>
                {Location && (
                  <a href={`https://maps.google.com/?q=${Location.Latitude},${Location.Longitude}`} target="_blank" rel="noreferrer" style={styles.mapBtn}>
                    🗺️ Open in Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Engine + Status Row */}
          <div style={styles.infoRow}>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>⚙️</div>
              <div style={styles.infoLabel}>Engine</div>
              <div style={{ ...styles.infoValue, color: EngineStatus?.Running ? "#22c55e" : "#ef4444" }}>
                {EngineStatus?.Running ? "Running" : "Stopped"}
              </div>
              <div style={styles.infoSub}>{EngineStatus?.datetime ? new Date(EngineStatus.datetime).toLocaleString() : "—"}</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>🖥️</div>
              <div style={styles.infoLabel}>Machine Status</div>
              <div style={{ ...styles.infoValue, color: statusColor }}>{MachineStatus?.Status ?? "—"}</div>
              <div style={styles.infoSub}>{MachineStatus?.datetime ? new Date(MachineStatus.datetime).toLocaleString() : "—"}</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>📍</div>
              <div style={styles.infoLabel}>Last Location Update</div>
              <div style={styles.infoValue}>{Location?.datetime ? new Date(Location.datetime).toLocaleDateString() : "—"}</div>
              <div style={styles.infoSub}>{Location?.datetime ? new Date(Location.datetime).toLocaleTimeString() : ""}</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>💾</div>
              <div style={styles.infoLabel}>Software</div>
              <div style={styles.infoValue}>{Software?.Version ?? "—"}</div>
              <div style={styles.infoSub}>{Software?.Interface}</div>
            </div>
          </div>

          {/* Caution Messages */}
          {CautionMessages?.CautionDescription?.length > 0 && (
            <div style={styles.cautionSection}>
              <div style={styles.cautionHeader}>⚠️ Caution Messages <span style={styles.cautionCount}>{CautionMessages.CautionDescription.length}</span></div>
              <div style={styles.timeline}>
                {CautionMessages.CautionDescription.map((c, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineTop}>
                        <span style={styles.cautionId}>#{c.Identifier}</span>
                        <span style={styles.cautionDate}>{c.datetime}</span>
                      </div>
                      <div style={styles.cautionDesc}>{c.Description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GaugeBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value} {unit}</span>
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 6, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#f8fafc", borderRadius: 16, width: "100%", maxWidth: 1000, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 28px", background: "#0178d2", borderRadius: "16px 16px 0 0" },
  headerLeft: {},
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  modelBadge: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  modelName: { fontSize: 22, fontWeight: 800, color: "#fff" },
  serialNo: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  statusPill: { display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: "50%" },
  softwareTag: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  closeBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 15 },
  body: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  statCard: { background: "#fff", borderRadius: 10, padding: "14px 16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 800 },
  statUnit: { fontSize: 11, color: "#999", marginTop: 2 },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4 },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  chartCard: { background: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  chartTitle: { fontSize: 12, fontWeight: 700, color: "#0178d2", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  radialLegend: { display: "flex", justifyContent: "center", gap: 12, marginTop: 8 },
  legendItem: { display: "flex", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: "50%" },
  legendText: { fontSize: 11, color: "#555" },
  gaugeRow: { marginBottom: 12 },
  locationBox: { background: "#f8fafc", borderRadius: 8, padding: "10px 12px" },
  locRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f0f0" },
  locLabel: { fontSize: 12, color: "#888" },
  locVal: { fontSize: 12, fontWeight: 600, color: "#333" },
  mapBtn: { display: "block", textAlign: "center", marginTop: 10, padding: "7px", background: "#0178d2", color: "#fff", borderRadius: 6, fontSize: 12, textDecoration: "none", fontWeight: 600 },
  infoRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  infoCard: { background: "#fff", borderRadius: 10, padding: "14px 16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  infoIcon: { fontSize: 20, marginBottom: 6 },
  infoLabel: { fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: 700, color: "#222" },
  infoSub: { fontSize: 11, color: "#aaa", marginTop: 3 },
  cautionSection: { background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cautionHeader: { fontSize: 13, fontWeight: 700, color: "#0178d2", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  cautionCount: { background: "#0178d2", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11 },
  timeline: { display: "flex", flexDirection: "column", gap: 0 },
  timelineItem: { display: "flex", gap: 12, paddingBottom: 14, borderLeft: "2px solid #ffe0b2", marginLeft: 8, paddingLeft: 16, position: "relative" },
  timelineDot: { position: "absolute", left: -6, top: 4, width: 10, height: 10, borderRadius: "50%", background: "#ff9800", border: "2px solid #fff" },
  timelineContent: { flex: 1 },
  timelineTop: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  cautionId: { background: "#ff9800", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 },
  cautionDate: { fontSize: 11, color: "#999" },
  cautionDesc: { fontSize: 13, color: "#444" },
};
