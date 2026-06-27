'use client'

import Link from 'next/link'
import SortableTable, { type Column } from '@/components/data/SortableTable'
import type { DocRow } from '@/lib/data/researchData'

export default function DocTable({ rows }: { rows: DocRow[] }) {
  const columns: Column<DocRow>[] = [
    {
      key: 'route',
      label: 'Route',
      render: (r) => (
        <Link href={r.visaUrl} className="font-medium text-gray-800 hover:text-teal-600 hover:underline">
          <span aria-hidden="true">{r.passportFlag}</span> {r.passport}
          <span className="px-1 text-gray-300">→</span>
          <span aria-hidden="true">{r.destFlag}</span> {r.destination}
        </Link>
      ),
      sortValue: (r) => `${r.passport} ${r.destination}`,
    },
    { key: 'visaType', label: 'Visa type', hideOnMobile: true, sortValue: (r) => r.visaType },
    {
      key: 'mandatory',
      label: 'Mandatory',
      align: 'right',
      render: (r) => <span className="font-semibold text-amber-700">{r.mandatory}</span>,
      sortValue: (r) => r.mandatory,
    },
    {
      key: 'total',
      label: 'Total items',
      align: 'right',
      render: (r) => <span className="font-bold text-teal-600">{r.total}</span>,
      sortValue: (r) => r.total,
    },
    {
      key: 'source',
      label: 'Official source',
      align: 'center',
      hideOnMobile: true,
      render: (r) => (
        <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" title={r.sourceLabel} className="text-teal-600 hover:underline">
          source ↗
        </a>
      ),
      sortValue: (r) => r.lastVerified,
    },
  ]

  return (
    <SortableTable
      columns={columns}
      rows={rows}
      initialSortKey="total"
      initialSortDir="desc"
      filterKeys={['passport', 'destination', 'visaType']}
      filterPlaceholder="Search passport, destination or visa type…"
      caption="Document counts per visa route with official source and verification date"
    />
  )
}
