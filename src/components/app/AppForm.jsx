import React from 'react'

/**
 * AppForm - canonical form boundary for page and modal forms.
 */
export default function AppForm({ children, className = '', ...props }) {
 return (
 <form className={`space-y-5 ${className}`} {...props}>
 {children}
 </form>
 )
}
