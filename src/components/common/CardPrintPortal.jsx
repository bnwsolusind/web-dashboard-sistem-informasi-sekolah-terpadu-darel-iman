import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function CardPrintPortal({ children }) {
 const [container, setContainer] = useState(() => document.getElementById('print-root'))

 useEffect(() => {
 let el = document.getElementById('print-root')
 if (!el) {
 el = document.createElement('div')
 el.id = 'print-root'
 document.body.appendChild(el)
 }
 setContainer(el)
 }, [])

 if (!container) return null

 return createPortal(children, container)
}
