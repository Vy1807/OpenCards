import { useEffect, useId, useRef } from 'react';
import IMask from 'imask';
import { maskDefinition, type MaskKind } from '../lib/masks';

export interface MaskedInputProps {
  /** Mascara aplicada na entrada. */
  mask: MaskKind;
  /** id do input, para associar a um rótulo externo (htmlFor). */
  id?: string;
  /** Valor desmascarado (apenas digitos), controlado pelo form. */
  value: string;
  /** Disparado com o valor desmascarado a cada mudança do usuário. */
  onChange: (valor: string) => void;
  label?: string;
  className?: string;
  error?: boolean;
  required?: boolean;
}

/**
 * Entrada mascarada compatível com o React Hook Form.
 *
 * O imask e dono do valor visível do input; o form recebe apenas o valor
 * desmascarado. Sincroniza de volta apenas quando o valor controlado muda
 * por fora (ex.: reset), preservando o cursor do usuário.
 */
export function MaskedInput({
  id,
  mask,
  value,
  onChange,
  label,
  className,
  error,
  required,
}: MaskedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<ReturnType<typeof IMask> | null>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const imask = IMask(input, maskDefinition(mask));
    maskRef.current = imask;

    const onInput = () => {
      onChange(imask.unmaskedValue);
    };
    input.addEventListener('input', onInput);
    return () => {
      input.removeEventListener('input', onInput);
      imask.destroy();
      maskRef.current = null;
    };
  }, [mask, onChange]);

  useEffect(() => {
    const imask = maskRef.current;
    if (!imask) return;
    if (imask.unmaskedValue !== value) {
      imask.value = value;
    }
  }, [value]);

  return (
    <div className={className ?? undefined}>
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={inputRef}
        className={`input ${error ? 'error' : ''}`}
        required={required}
      />
    </div>
  );
}
