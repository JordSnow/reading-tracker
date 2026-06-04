function SortControl({
  value,
  onChange,
  options,
  direction,
  onDirectionChange,
}) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-medium text-white/50 rounded-lg px-2 py-1.5 outline-none"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "16px",
        }}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: "#1a1a1a" }}
          >
            {o.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onDirectionChange(direction === "asc" ? "desc" : "asc")}
        className="text-white/40 hover:text-white transition-all px-2 py-1.5 rounded-lg text-xs"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {direction === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}

export default SortControl;
