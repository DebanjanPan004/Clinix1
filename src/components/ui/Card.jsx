export default function Card({ children, className = '' }) {
  return (
    <div className={`glass-strong rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}
