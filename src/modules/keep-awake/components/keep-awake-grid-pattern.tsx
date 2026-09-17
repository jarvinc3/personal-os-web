export function KeepAwakeGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.35]" aria-hidden>
      {Array.from({ length: 14 }, (_, row) => (
        <div
          key={`row-${row}`}
          className="absolute right-0 left-0 border-t border-border"
          style={{ top: row * 28 }}
        />
      ))}
      {Array.from({ length: 30 }, (_, col) => (
        <div
          key={`col-${col}`}
          className="absolute top-0 bottom-0 border-l border-border"
          style={{ left: col * 35 }}
        />
      ))}
    </div>
  )
}
