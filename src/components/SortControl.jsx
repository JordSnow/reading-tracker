function SortControl({
  value,
  onChange,
  options,
  direction,
  onDirectionChange,
}) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map((o) => {
        const isActive = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => {
              if (isActive) {
                onDirectionChange(direction === "asc" ? "desc" : "asc");
              } else {
                onChange(o.value);
              }
            }}
            style={{
              padding: "5px 10px",
              borderRadius: "999px",
              border: "1px solid",
              borderColor: isActive ? "#E8682A" : "rgba(255,255,255,0.08)",
              background: isActive
                ? "rgba(232,104,42,0.15)"
                : "rgba(255,255,255,0.04)",
              color: isActive ? "#E8682A" : "rgba(255,255,255,0.4)",
              fontSize: "12px",
              fontWeight: isActive ? 500 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {o.label}
            {isActive && (
              <span style={{ fontSize: "10px", opacity: 0.8 }}>
                {direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SortControl;
