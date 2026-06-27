'use client'

import Link from 'next/link'
import SortableTable, { type Column } from '@/components/data/SortableTable'
import type { PassportRow } from '@/lib/data/researchData'

export default function PassportTable({ rows }: { rows: PassportRow[] }) {
  const columns: Column<PassportRow>[] = [
    { key: 'rank', label: '#', align: 'center', sortValue: (r) => r.rank },
    {
      key: 'name',
      label: 'Passport',
      render: (r) => {
        const inner = (
          <span className="font-medium text-gray-800">
            <span className="mr-1.5" aria-hidden="true">{r.flag}</span>
            {r.name}
          </span>
        )
        return r.nationalitySlug ? (
          <Link href={`/visa-free-countries-for-${r.nationalitySlug}-passport`} className="hover:text-teal-600 hover:underline">
            {inner}
          </Link>
        ) : inner
      },
      sortValue: (r) => r.name,
    },
    { key: 'visaFree', label: 'Visa-free', align: 'right', sortValue: (r) => r.visaFree, hideOnMobile: true },
    { key: 'visaOnArrival', label: 'Visa on arrival', align: 'right', sortValue: (r) => r.visaOnArrival, hideOnMobile: true },
    {
      key: 'total',
      label: 'No-visa access',
      align: 'right',
      render: (r) => <span className="font-bold text-teal-600">{r.total}</span>,
      sortValue: (r) => r.total,
    },
  ]

  return (
    <SortableTable
      columns={columns}
      rows={rows}
      initialSortKey="total"
      initialSortDir="desc"
      filterKeys={['name']}
      filterPlaceholder="Search a passport…"
      caption="Visa-free and visa-on-arrival access by passport"
    />
  )
}
