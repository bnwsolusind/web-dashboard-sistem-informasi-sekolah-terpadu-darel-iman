import React from 'react'
import AppButton from './AppButton'
import { Tooltip } from '../ui/tooltip'

/**
 * IconButton - canonical icon-only button.
 * label menjadi tooltip + aria-label (aksesibilitas).
 *
 * variant mengikuti AppButton (ghost/outline/primary/destructive, dst).
 */
export default function IconButton({
	label,
	tooltip,
	icon: Icon,
	variant = 'ghost',
	size = 'icon',
	onClick,
	disabled,
	loading,
	className = '',
	...props
}) {
	const effectiveTooltip = tooltip || label || ''
	return (
		<Tooltip content={effectiveTooltip}>
			<AppButton
				type="button"
				variant={variant}
				size={size}
				icon={Icon}
				onClick={onClick}
				disabled={disabled}
				loading={loading}
				tooltip={effectiveTooltip}
				title={effectiveTooltip}
				aria-label={effectiveTooltip}
				className={className}
				{...props}
			/>
		</Tooltip>
	)
}
