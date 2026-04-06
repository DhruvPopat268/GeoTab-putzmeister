import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

export default function EquipmentDetailModal({ equipment, onClose }) {
  if (!equipment) return null;

  const {
    EquipmentHeader: h, Location, EngineStatus, MachineStatus,
    CumulativeOperatingHours, CumulativePumpedTotals, MaximumSpeedLast24,
    HydraulicOilTemperature, HydraulicOilPressure, CumulativeStrokesTotals,
    Software, CautionMessages,
  } = equipment;

  const isOnline = MachineStatus?.Status === "ONLINE";
  const isRunning = EngineStatus?.Running;
  const oilTemp = HydraulicOilTemperature?.Temperature ?? 0;
  const oilPressure = HydraulicOilPressure?.Pressure ?? 0;
  const opHours = CumulativeOperatingHours?.Hour ?? 0;
  const pumped = CumulativePumpedTotals?.Pumped ?? 0;
  const strokes = (CumulativeStrokesTotals?.Strokes ?? 0) / 1000;
  const speed = MaximumSpeedLast24?.Speed ?? 0;

  const kpis = [
    { icon: "⏱", value: opHours.toFixed(1), unit: "hrs", label: "Operating Hours", color: "#6366f1" },
    { icon: "💧", value: pumped.toFixed(0), unit: "m³", label: "Total Pumped", color: "#22c55e" },
    { icon: "🔄", value: strokes.toFixed(1), unit: "k strokes", label: "Total Strokes", color: "#f97316" },
    { icon: "🚗", value: speed, unit: "kilometres", label: "Max Speed (24h)", color: "#a855f7" },
  ];

  const barData = [
    { name: "Op. Hours", value: opHours },
    { name: "Pumped (m³)", value: pumped },
    { name: "Strokes (k)", value: strokes },
  ];

  const tempPct = Math.min((oilTemp / 120) * 100, 100);
  const pressurePct = Math.min((oilPressure / 400) * 100, 100);
  const speedPct = Math.min((speed / 120) * 100, 100);

  const gaugeData = [
    { name: "Temp", value: tempPct, fill: "#f97316" },
    { name: "Pressure", value: pressurePct, fill: "#6366f1" },
    { name: "Speed", value: speedPct, fill: "#a855f7" },
  ];

  const statusCards = [
    { icon: "⚙️", label: "ENGINE", value: isRunning ? "Running" : "Stopped", valueColor: isRunning ? "#16a34a" : "#dc2626", sub: EngineStatus?.datetime ? new Date(EngineStatus.datetime).toLocaleString() : "—" },
    { icon: "🖥", label: "MACHINE STATUS", value: MachineStatus?.Status ?? "—", valueColor: isOnline ? "#16a34a" : "#dc2626", sub: MachineStatus?.datetime ? new Date(MachineStatus.datetime).toLocaleString() : "—" },
    { icon: "📍", label: "LAST LOCATION UPDATE", value: Location?.datetime ? new Date(Location.datetime).toLocaleDateString() : "—", valueColor: "#1e293b", sub: Location?.datetime ? new Date(Location.datetime).toLocaleTimeString() : "" },
    { icon: "💾", label: "SOFTWARE", value: Software?.Version ? `V ${Software.Version}` : "—", valueColor: "#1e293b", sub: Software?.Interface ?? "" },
  ];

  return (
    <div style={s.panel}>
      {/* Title bar */}
      <div style={s.titleBar}>
        <div style={s.titleLeft}>
          <span style={s.serialChip}>{h.SerialNumber}</span>
          <span style={s.tags}>{h.OEMName} · {h.Model}</span>
          <span style={{ ...s.statusChip, background: isOnline ? "#dcfce7" : "#fee2e2", color: isOnline ? "#16a34a" : "#dc2626", border: `1px solid ${isOnline ? "#86efac" : "#fca5a5"}` }}>
            <span style={{ ...s.dot, background: isOnline ? "#16a34a" : "#dc2626" }} />
            {MachineStatus?.Status ?? "UNKNOWN"}
          </span>
        </div>
        <button style={s.closeBtn} onClick={onClose}>✕ Close</button>
      </div>

      <div style={s.body}>
        {/* KPI Cards */}
        <div style={s.kpiRow}>
          {kpis.map((k) => (
            <div key={k.label} style={{ ...s.kpiCard, borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 28 }}>{k.icon}</div>
              <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
              <div style={s.kpiUnit}>{k.unit}</div>
              <div style={s.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div style={s.midRow}>
          {/* Live Metrics Gauge */}
          <div style={s.card}>
            <div style={s.cardTitle}>⚡ LIVE METRICS</div>
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                cx="50%" cy="85%" innerRadius="40%" outerRadius="100%"
                startAngle={180} endAngle={0}
                data={gaugeData}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#f1f5f9" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={s.gaugeLegend}>
              {gaugeData.map((g) => (
                <span key={g.name} style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: g.fill }} />
                  {g.name}: {g.value.toFixed(1)}%
                </span>
              ))}
            </div>
          </div>

          {/* Cumulative Stats Bar Chart */}
          <div style={{ ...s.card, flex: 2 }}>
            <div style={s.cardTitle}>📊 CUMULATIVE STATS</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}
                  formatter={(v) => [v.toLocaleString(), "Value"]}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hydraulics + Location */}
          <div style={s.rightCol}>
            <div style={s.card}>
              <div style={s.cardTitle}>🌡 HYDRAULICS</div>
              <div style={s.metricRow}>
                <span style={s.metricLabel}>Oil Temp</span>
                <span style={{ ...s.metricValue, color: oilTemp > 80 ? "#dc2626" : "#f97316" }}>
                  {oilTemp} {HydraulicOilTemperature?.TemperatureUnits ?? "°C"}
                </span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${tempPct}%`, background: oilTemp > 80 ? "#dc2626" : "#f97316" }} />
              </div>
              <div style={{ ...s.metricRow, marginTop: 10 }}>
                <span style={s.metricLabel}>Oil Pressure</span>
                <span style={{ ...s.metricValue, color: "#6366f1" }}>
                  {oilPressure} {HydraulicOilPressure?.PressureUnits ?? "bar"}
                </span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${pressurePct}%`, background: "#6366f1" }} />
              </div>
            </div>

            {Location && (
              <div style={s.card}>
                <div style={s.cardTitle}>📍 LOCATION</div>
                <div style={s.locRow}><span style={s.locLabel}>Latitude</span><span style={s.locVal}>{Location.Latitude?.toFixed(6)}</span></div>
                <div style={s.locRow}><span style={s.locLabel}>Longitude</span><span style={s.locVal}>{Location.Longitude?.toFixed(6)}</span></div>
                <a
                  href={`https://maps.google.com/?q=${Location.Latitude},${Location.Longitude}`}
                  target="_blank" rel="noreferrer"
                  style={s.mapBtn}
                >
                  🗺 Open in Maps
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div style={s.statusRow}>
          {statusCards.map((c) => (
            <div key={c.label} style={s.statusCard}>
              <div style={s.statusIcon}>{c.icon}</div>
              <div style={s.statusLabel}>{c.label}</div>
              <div style={{ ...s.statusValue, color: c.valueColor }}>{c.value}</div>
              <div style={s.statusSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Caution Messages */}
        {CautionMessages?.CautionDescription?.length > 0 && (
          <div style={s.cautionWrap}>
            <div style={s.cautionTitle}>
              ⚠️ CAUTION MESSAGES
              <span style={s.cautionBadge}>{CautionMessages.CautionDescription.length}</span>
            </div>
            {CautionMessages.CautionDescription.map((c, i) => (
              <div key={i} style={{ ...s.cautionRow, background: i % 2 === 0 ? "#fff" : "#fffbeb" }}>
                <span style={s.cautionId}>#{c.Identifier}</span>
                <span style={s.cautionDesc}>{c.Description}</span>
                <span style={s.cautionDate}>{c.datetime}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  panel: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", fontFamily: "'Segoe UI', Arial, sans-serif", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" },
  titleBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "2px solid #e2e8f0", background: "#fff" },
  titleLeft: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  serialChip: { fontWeight: 700, fontSize: 15, color: "#1e293b" },
  tags: { fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 4, border: "1px solid #e2e8f0" },
  statusChip: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4 },
  dot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  closeBtn: { background: "none", border: "1px solid #e2e8f0", color: "#64748b", padding: "5px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  body: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },

  // KPI
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  kpiCard: { background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  kpiValue: { fontSize: 28, fontWeight: 800, lineHeight: 1.1 },
  kpiUnit: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },
  kpiLabel: { fontSize: 12, color: "#64748b", fontWeight: 600, textAlign: "center", marginTop: 2 },

  // Middle
  midRow: { display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr", gap: 14 },
  card: { background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 11, fontWeight: 800, color: "#0178d2", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },

  // Gauge legend
  gaugeLegend: { display: "flex", flexDirection: "column", gap: 4, marginTop: 6 },
  legendItem: { fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },

  // Right col
  rightCol: { display: "flex", flexDirection: "column", gap: 14 },
  metricRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  metricLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  metricValue: { fontSize: 13, fontWeight: 700 },
  progressTrack: { height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, transition: "width 0.4s" },

  // Location
  locRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f1f5f9" },
  locLabel: { fontSize: 12, color: "#64748b" },
  locVal: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
  mapBtn: { display: "block", marginTop: 10, background: "#0178d2", color: "#fff", textAlign: "center", padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" },

  // Status cards
  statusRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  statusCard: { background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", textAlign: "center" },
  statusIcon: { fontSize: 22, marginBottom: 4 },
  statusLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 },
  statusValue: { fontSize: 16, fontWeight: 800, margin: "4px 0 2px" },
  statusSub: { fontSize: 10, color: "#94a3b8" },

  // Caution
  cautionWrap: { borderRadius: 10, overflow: "hidden", border: "1px solid #fde68a" },
  cautionTitle: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.8, background: "#fef3c7", borderBottom: "1px solid #fde68a" },
  cautionBadge: { background: "#f59e0b", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 },
  cautionRow: { display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid #fde68a" },
  cautionId: { background: "#f59e0b", color: "#fff", borderRadius: 3, padding: "1px 7px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  cautionDesc: { fontSize: 13, color: "#78350f", flex: 1 },
  cautionDate: { fontSize: 11, color: "#a16207", whiteSpace: "nowrap" },
};
