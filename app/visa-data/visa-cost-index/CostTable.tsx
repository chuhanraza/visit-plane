'use client'

import SortableTable, { type Column } from '@/components/data/SortableTable'
import type { CostRow } from '@/lib/data/researchData'

const VISA_COLORS: Record<string, string> = {
  'Visa Free': 'bg-emerald-50 text-emerald-700',
  'Visa on Arrival': 'bg-teal-50 text-teal-700',
  eVisa: 'bg-sky-50 text-sky-700',
  'Visa Required': 'bg-amber-50 text-amber-700',
}

// Client wrapper: column definitions (which contain render/sortValue functions)
// must be created in a Client Component — functions can't be passed from a Server
// Component across the RSC boundary. The page passes only the plain `rows`.
export default function CostTable({ rows }: { rows: CostRow[] }) {
  const columns: Column<CostRow>[] = [
    {
      key: 'name',
      label: 'Destination',
      render: (r) => (
        <span className="font-medium text-gray-800">
          <span className="mr-1.5" aria-hidden="true">{r.flag}</span>
          {r.name}
        </span>
      ),
      sortValue: (r) => r.name,
    },
    { key: 'region', label: 'Region', hideOnMobile: true, sortValue: (r) => r.region },
    {
      key: 'visa',
      label: 'Visa type',
      align: 'center',
      render: (r) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${VISA_COLORS[r.visa] ?? 'bg-gray-100 text-gray-600'}`}>
          {r.visa}
        </span>
      ),
      sortValue: (r) => r.visa,
    },
    {
      key: 'feeDisplay',
      label: 'Typical fee (USD)',
      align: 'right',
      render: (r) =>
        r.feeUsd === 0 ? (
          <span className="font-semibold text-emerald-600">Free</span>
        ) : r.numeric ? (
          <span className="font-semibold text-gray-800">${r.feeUsd}</span>
        ) : (
          <span className="text-gray-400" title="Not a fixed published number">{r.feeDisplay}</span>
        ),
      sortValue: (r) => (r.feeUsd ?? -1),
    },
    { key: 'maxStay', label: 'Max stay', align: 'right', hideOnMobile: true, sortValue: (r) => r.maxStay },
  ]

  return (
    <SortableTable
      columns={columns}
      rows={rows}
      initialSortKey="feeDisplay"
      initialSortDir="desc"
      filterKeys={['name', 'region']}
      filterPlaceholder="Search destination or region…"
      caption="Typical tourist-visa fee, visa type and maximum stay by destination"
    />
  )
}
