import { inputConstraints } from '@/modules/inputValidation';

export default function NewInput({
  inputName,
  type,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  useHTMLValidators,
}: {
  inputName: string,
  type: 'number' | 'text' | 'password',
  placeholder?: string,
  className?: string,
  inputClassName?: string,
  labelClassName?: string,
  useHTMLValidators?: true,
}) {
  return (
    <div className={className}>
      <label className={labelClassName} htmlFor={inputName}>
        {inputName[0].toUpperCase() + inputName.replace(/([A-Z])/g, ' $1').slice(1) + ':'}
      </label>
      <input className={inputClassName}
        id={inputName}
        name={inputName}
        type={type}
        placeholder={placeholder}
        onInput={(e) => {
          e.currentTarget.setCustomValidity('')
        }}
        {...(useHTMLValidators ? inputConstraints[inputName] : {})}
      />
    </div>
  )
}
