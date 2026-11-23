import React from 'react'
import { Drawer } from '../ui/drawer'

/**
 * AppDrawer - canonical side drawer / bottom sheet.
 * position: right | left | bottom
 */
export default function AppDrawer({ isOpen, onClose, title, description, icon: Icon, children, position = 'right', footer }) {
 if (!isOpen) return null

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title={
 <span className="flex items-center gap-2.5">
 {Icon && (
 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#10B981]">
 <Icon className="h-4 w-4" />
 </span>
 )}
 <span className="min-w-0">
 <span className="block truncate">{title}</span>
 </span>
 </span>
 }
 position={position}
 description={description}
 footer={footer}
 >
 {children}
 </Drawer>
 )
}
