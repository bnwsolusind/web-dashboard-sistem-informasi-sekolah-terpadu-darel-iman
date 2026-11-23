import React from 'react'
import { Tabs as TabsPrimitive, Tab, TabList, TabPanel } from '../ui/tabs'

/**
 * AppTabs - canonical tab bar based on HeroUI.
 * Delegasi ke ui/tabs: tabs={[{id,label,icon,badge}]}, activeTab, onChange.
 */
export default function AppTabs(props) {
 return <TabsPrimitive {...props} />
}

export { Tab, TabList, TabPanel }

