import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ModalErrorBoundary extends Component {
 constructor(props) {
 super(props)
 this.state = { hasError: false, error: null }
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error }
 }

 componentDidCatch(error, errorInfo) {
 console.error('Modal Error Caught by ModalErrorBoundary:', error, errorInfo)
 }

 handleRetry = () => {
 this.setState({ hasError: false, error: null })
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
 <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-[#1B2433] dark:border-emerald-800/60 text-center space-y-4">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
 <AlertTriangle className="h-6 w-6 stroke-[2]" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Data detail tidak dapat dimuat
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 {this.state.error?.message || 'Terjadi kesalahan saat merender detail data KPI.'}
 </p>
 </div>
 <div className="flex justify-center gap-3 pt-2">
 <button
 type="button"
 onClick={this.handleRetry}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#1E8E5A] transition cursor-pointer"
 >
 <RefreshCw className="h-3.5 w-3.5" />
 Coba Lagi
 </button>
 {this.props.onClose && (
 <button
 type="button"
 onClick={this.props.onClose}
 className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-slate-200 dark:bg-emerald-950/40 dark:text-slate-200 transition cursor-pointer"
 >
 Tutup
 </button>
 )}
 </div>
 </div>
 </div>
 )
 }

 return this.props.children
 }
}

ModalErrorBoundary.propTypes = {
 children: PropTypes.node.isRequired,
 onClose: PropTypes.func,
}

export default ModalErrorBoundary
