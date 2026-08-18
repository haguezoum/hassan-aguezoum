import { useState } from "react";

const PRESETS = [
  { label: "B&W",     filter: "none" },
  { label: "Cyan",    filter: "hue-rotate(180deg) saturate(3)" },
  { label: "Neon",    filter: "hue-rotate(270deg) saturate(4) brightness(1.1)" },
  { label: "Amber",   filter: "sepia(0.8) saturate(3) hue-rotate(10deg)" },
  { label: "Red",     filter: "hue-rotate(130deg) saturate(4)" },
  { label: "Matrix",  filter: "hue-rotate(90deg) saturate(5) brightness(0.9)" },
  { label: "Cold",    filter: "hue-rotate(200deg) saturate(2) brightness(1.05)" },
];

const ColorTester = () => {
  const [active, setActive] = useState(0);
  const [opacity, setOpacity] = useState(0.5);
  const [visible, setVisible] = useState(true);

  if (!visible) return (
    <button
      onClick={() => setVisible(true)}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        background: "#111", color: "#fff", border: "1px solid #333",
        borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12,
      }}
    >
      🎨 color tester
    </button>
  );

  return (
    <>
      {/* Tint overlay */}
      {active !== 0 && (
        <div
          style={{
            position: "fixed", inset: 0,
            zIndex: 1000,
            filter: PRESETS[active].filter,
            opacity,
            background: "white",
            pointerEvents: "none",
            mixBlendMode: "color",
          }}
        />
      )}

      {/* Control panel */}
      <div
        style={{
          position: "fixed", bottom: 24, right: 24,
          zIndex: 9999,
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minWidth: 220,
          fontFamily: "monospace",
          fontSize: 12,
          color: "#aaa",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 600 }}>color tester</span>
          <button
            onClick={() => setVisible(false)}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14 }}
          >✕</button>
        </div>

        {/* Preset buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActive(i)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${active === i ? "#fff" : "#333"}`,
                background: active === i ? "#fff" : "transparent",
                color: active === i ? "#000" : "#aaa",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "monospace",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Opacity slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>opacity</span>
            <span style={{ color: "#fff" }}>{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range" min={0} max={1} step={0.01}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#fff" }}
          />
        </div>

        {/* Active filter string */}
        <div style={{ color: "#444", fontSize: 10, wordBreak: "break-all" }}>
          {PRESETS[active].filter}
        </div>
      </div>
    </>
  );
};

export default ColorTester;