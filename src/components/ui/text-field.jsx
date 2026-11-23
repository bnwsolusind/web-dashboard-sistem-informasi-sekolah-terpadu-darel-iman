import * as React from 'react'
import PropTypes from 'prop-types'
import { TextField as HeroTextField } from '@heroui/react'
import { cn } from '../../lib/utils'

export function TextField({ className, ...props }) {
 return (
 <HeroTextField
 className={cn('flex flex-col gap-1.5', className)}
 {...props}
 />
 )
}

TextField.propTypes = {
 className: PropTypes.string,
}

export default TextField
