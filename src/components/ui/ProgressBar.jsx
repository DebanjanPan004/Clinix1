export default function ProgressBar({ value }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div className="h-3 w-full rounded-full bg-rose-100">
      <div
        className="h-3 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
