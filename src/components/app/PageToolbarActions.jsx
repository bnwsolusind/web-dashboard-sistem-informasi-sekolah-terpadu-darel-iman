import * as React from 'react'
import PropTypes from 'prop-types'
import { Printer, Upload, Download, RefreshCw, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Tooltip } from '../ui/tooltip'
import { cn } from '../../lib/utils'

/**
 * PageToolbarActions - Canonical Toolbar Action Buttons for Dar El-Iman HeroUI system.
 * - Standard Semantic Actions:
 *   - Print: variant="print" (Pastel Indigo)
 *   - Import: variant="import" (Pastel Sky)
 *   - Export: variant="export" (Pastel Amber)
 *   - Refresh: variant="outline" (Neutral surface)
 *   - Secondary actions: variant="outline" (default) or sec.variant
 *   - Primary action (+ Tambah, + Terbitkan, etc.): variant="primary" (Solid SIMSIT Green #059669)
 */
export function PageToolbarActions({
  onPrint,
  printLabel = 'Cetak',
  onImport,
  importLabel = 'Import',
  onExport,
  exportLabel = 'Export',
  onRefresh,
  refreshLabel = 'Segarkan',
  refreshing = false,
  primaryAction,
  onAdd,
  addLabel,
  secondaryActions = [],
  children,
  className,
  iconOnly = true,
  showLabel = false,
  ...props
}) {
  const isIconOnly = iconOnly && !showLabel
  const effectivePrimaryAction = primaryAction || (onAdd ? { label: addLabel || 'Tambah Data', onClick: onAdd } : null)
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="toolbar"
      aria-label="Aksi Halaman"
      {...props}
    >
      {/* Optional custom left children */}
      {children}

      {/* Standard Secondary Action: Refresh */}
      {onRefresh && (
        <Tooltip content={refreshLabel}>
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            size={isIconOnly ? "icon" : "default"}
            className={cn(
              "h-9 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-200 shadow-xs active:scale-95",
              isIconOnly ? "w-9 p-0 shrink-0" : "px-3.5 gap-2 text-sm font-medium"
            )}
          >
            <RefreshCw className={cn('w-4 h-4 shrink-0', refreshing && 'animate-spin')} />
            {!isIconOnly && <span>{refreshLabel}</span>}
          </Button>
        </Tooltip>
      )}

      {/* Standard Secondary Action: Print */}
      {onPrint && (
        <Tooltip content={printLabel}>
          <Button
            type="button"
            variant="print"
            onClick={onPrint}
            size={isIconOnly ? "icon" : "default"}
            className={cn(
              "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center shadow-xs",
              isIconOnly ? "w-9 p-0 shrink-0" : "px-3.5 gap-2"
            )}
          >
            <Printer className="w-4 h-4 shrink-0 text-white" />
            {!isIconOnly && <span>{printLabel}</span>}
          </Button>
        </Tooltip>
      )}

      {/* Standard Secondary Action: Import */}
      {onImport && (
        <Tooltip content={importLabel}>
          <Button
            type="button"
            variant="import"
            onClick={onImport}
            size={isIconOnly ? "icon" : "default"}
            className={cn(
              "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center shadow-xs",
              isIconOnly ? "w-9 p-0 shrink-0" : "px-3.5 gap-2"
            )}
          >
            <Upload className="w-4 h-4 shrink-0 text-white" />
            {!isIconOnly && <span>{importLabel}</span>}
          </Button>
        </Tooltip>
      )}

      {/* Standard Secondary Action: Export */}
      {onExport && (
        <Tooltip content={exportLabel}>
          <Button
            type="button"
            variant="export"
            onClick={onExport}
            size={isIconOnly ? "icon" : "default"}
            className={cn(
              "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center shadow-xs",
              isIconOnly ? "w-9 p-0 shrink-0" : "px-3.5 gap-2"
            )}
          >
            <Download className="w-4 h-4 shrink-0 text-white" />
            {!isIconOnly && <span>{exportLabel}</span>}
          </Button>
        </Tooltip>
      )}

      {/* Custom Secondary Actions */}
      {secondaryActions.map((sec, idx) => {
        const SecIcon = sec.icon
        const secVariant = sec.variant || (sec.className ? 'primary' : 'secondary')
        const secLabel = sec.label || 'Aksi'
        return (
          <Tooltip key={sec.key || secLabel || idx} content={secLabel}>
            <Button
              type="button"
              variant={secVariant}
              onClick={sec.onClick}
              disabled={sec.disabled || sec.loading}
              size={isIconOnly ? "icon" : "default"}
              className={cn(
                'h-9 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center shadow-xs',
                isIconOnly ? 'w-9 p-0 shrink-0' : 'px-3.5 gap-2',
                sec.className
              )}
            >
              {SecIcon && <SecIcon className="w-4 h-4 shrink-0 text-white" />}
              {!isIconOnly && <span>{secLabel}</span>}
            </Button>
          </Tooltip>
        )
      })}

      {/* Standard Primary Action: Placed at far right */}
      {effectivePrimaryAction && (
        <Tooltip content={effectivePrimaryAction.label || 'Tambah Data'}>
          <Button
            type="button"
            variant="create"
            onClick={effectivePrimaryAction.onClick}
            disabled={effectivePrimaryAction.disabled || effectivePrimaryAction.loading}
            size={isIconOnly ? "icon" : "default"}
            className={cn(
              'h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs inline-flex items-center justify-center',
              isIconOnly ? 'w-9 p-0 shrink-0' : 'px-4 gap-2',
              effectivePrimaryAction.className
            )}
          >
            {effectivePrimaryAction.icon ? (
              <effectivePrimaryAction.icon className="w-4 h-4 text-white shrink-0" />
            ) : (
              <Plus className="w-4 h-4 text-white shrink-0" />
            )}
            {!isIconOnly && <span>{effectivePrimaryAction.label || 'Tambah Data'}</span>}
          </Button>
        </Tooltip>
      )}
    </div>
  )
}

PageToolbarActions.propTypes = {
  onPrint: PropTypes.func,
  printLabel: PropTypes.string,
  onImport: PropTypes.func,
  importLabel: PropTypes.string,
  onExport: PropTypes.func,
  exportLabel: PropTypes.string,
  onRefresh: PropTypes.func,
  refreshLabel: PropTypes.string,
  refreshing: PropTypes.bool,
  primaryAction: PropTypes.shape({
    label: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    icon: PropTypes.elementType,
    className: PropTypes.string,
  }),
  secondaryActions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.elementType,
      variant: PropTypes.string,
      disabled: PropTypes.bool,
      loading: PropTypes.bool,
      className: PropTypes.string,
    })
  ),
  children: PropTypes.node,
  className: PropTypes.string,
}

export default PageToolbarActions
