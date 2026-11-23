import React from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '../ui/button'

const VARIANTS = [
  'primary',
  'secondary',
  'accent',
  'view',
  'edit',
  'restore',
  'print',
  'import',
  'export',
  'warning',
  'success',
  'destructive',
  'danger',
  'error',
  'ghost',
  'outline',
  'icon',
  'link',
  'default',
]

/**
 * AppButton - canonical enterprise button.
 * Satu-satunya tombol yang boleh dipakai di seluruh aplikasi.
 *
 * variant: primary | secondary | accent | view | edit | restore | print | import | export | warning | success | destructive | danger | ghost | outline | icon | link
 * loading: menampilkan spinner dan menonaktifkan tombol
 * tooltip: native tooltip (title)
 */
export default function AppButton({
  variant = 'primary',
  size,
  loading = false,
  isLoading = false,
  loadingText,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  isDisabled,
  tooltip,
  ...props
}) {
  const isDestructive = variant === 'destructive' || variant === 'danger' || variant === 'error'
  const resolvedVariant = isDestructive ? 'destructive' : variant
  const isButtonLoading = Boolean(loading || isLoading)
  const isButtonDisabled = Boolean(disabled || isDisabled || isButtonLoading)

  const content = (
    <>
      {isButtonLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
        </>
      )}
    </>
  )

  return (
    <Button
      variant={resolvedVariant}
      size={size}
      disabled={isButtonDisabled}
      aria-busy={isButtonLoading || undefined}
      title={tooltip}
      className={className}
      {...props}
    >
      {content}
    </Button>
  )
}

AppButton.VARIANTS = VARIANTS
