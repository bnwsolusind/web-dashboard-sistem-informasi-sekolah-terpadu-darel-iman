import React from 'react'
import AppPageHeader from './AppPageHeader'

/**
 * AppHero - semantic alias for the branded global page header.
 */
export default function AppHero(props) {
 return <AppPageHeader variant="brand" {...props} />
}
