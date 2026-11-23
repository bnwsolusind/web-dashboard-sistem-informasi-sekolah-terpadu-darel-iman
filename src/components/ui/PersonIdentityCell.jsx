import React from 'react'
import PropTypes from 'prop-types'
import PersonAvatar from './PersonAvatar'

export function PersonIdentityCell({
	src,
	name,
	subtitle,
	size = 'table',
	avatarShape = 'circle',
	className = '',
}) {
	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<PersonAvatar src={src} name={name} size={size} shape={avatarShape} />
			<div className="flex flex-col min-w-0">
				<span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs" title={typeof name === 'string' ? name : undefined}>
					{name || '-'}
				</span>
				{subtitle && (
					<span className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={typeof subtitle === 'string' ? subtitle : undefined}>
						{subtitle}
					</span>
				)}
			</div>
		</div>
	)
}

PersonIdentityCell.propTypes = {
	src: PropTypes.string,
	name: PropTypes.string,
	subtitle: PropTypes.node,
	size: PropTypes.string,
	avatarShape: PropTypes.string,
	className: PropTypes.string,
}

export default PersonIdentityCell
