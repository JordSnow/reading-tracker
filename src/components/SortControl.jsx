function SortControl({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="text-xs font-medium text-white/50 rounded-lg px-2 py-1.5 outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
            {options.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0d1117' }}>{o.label}</option>
            ))}
        </select>
    )
}

export default SortControl