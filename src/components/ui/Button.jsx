/** <Button variant="primary|secondary|danger|ghost" loading disabled type="button" /> */
export function Button({ variant = 'primary', loading = false, disabled, type = 'button', className = '', children, ...rest }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
