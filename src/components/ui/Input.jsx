import { forwardRef, useId } from 'react';

/**
 * <Input label="Email" type="email" error="msg" hint="help" />
 * <Input as="textarea" rows={6} label="Content" />
 * Extra props go to the underlying control.
 */
export const Input = forwardRef(function Input({ label, error, hint, as = 'input', id, className = '', ...rest }, ref) {
  const auto = useId();
  const inputId = id || auto;
  const describedBy = [error && `${inputId}-err`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  const Control = as;
  return (
    <div className={`field ${className}`.trim()}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <Control
        ref={ref}
        id={inputId}
        className="control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && <p id={`${inputId}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${inputId}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  );
});
