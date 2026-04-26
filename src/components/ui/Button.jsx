export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-deepPink shadow-soft',
    secondary: 'border border-rose-200 bg-white text-textPrimary hover:bg-rose-50',
    ghost: 'bg-white/70 text-textPrimary hover:bg-white',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  }

  return (
    <button
      className={`rounded-xl px-4 py-2.5 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rosePink ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
