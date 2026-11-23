import React from 'react'
import { AppPageHeader } from '../../components/app'

export function MutabaahPageHeader({ title, subtitle, icon: Icon, actions }) {
 return (
 <AppPageHeader
 variant="default"
 icon={Icon}
 title={title}
 description={subtitle}
 eyebrow="Mutaba'ah Yaumiyyah"
 actions={actions}
 />
 )
}

export default MutabaahPageHeader
