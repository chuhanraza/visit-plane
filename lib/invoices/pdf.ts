import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

// Robust across ESM/CJS interop: register the plugin on the jsPDF prototype so we
// call doc.autoTable(...) (the default-export form trips Node ESM interop).
applyPlugin(jsPDF)

export interface InvoicePdfData {
  invoiceNumber: string
  orderRef: string
  status: string
  issuedAt: string
  currency: string
  customerName: string
  customerEmail: string
  countryService: string
  lineItems: { description: string; qty: number; unit: number; amount: number }[]
  subtotal: number
  discount: number
  total: number
}

/** Build a branded VisitPlane invoice PDF and return it as a Buffer. */
export function buildInvoicePdf(d: InvoicePdfData): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const m = 48
  const money = (n: number) => `${d.currency} ${Number(n).toFixed(2)}`

  // Header
  doc.setFontSize(22); doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39); doc.text('Visit', m, 60)
  doc.setTextColor(37, 99, 235); doc.text('Plane', m + doc.getTextWidth('Visit'), 60)

  doc.setFont('helvetica', 'normal'); doc.setFontSize(20); doc.setTextColor(17, 24, 39)
  doc.text('INVOICE', 547, 60, { align: 'right' })
  doc.setFontSize(10); doc.setTextColor(107, 114, 128)
  doc.text(d.invoiceNumber, 547, 78, { align: 'right' })
  doc.text(`Status: ${d.status.toUpperCase()}`, 547, 92, { align: 'right' })

  // Meta
  doc.setFontSize(10); doc.setTextColor(55, 65, 81)
  doc.text(`Order: ${d.orderRef}`, m, 100)
  doc.text(`Issued: ${new Date(d.issuedAt).toLocaleDateString()}`, m, 114)

  // Bill to
  doc.setFont('helvetica', 'bold'); doc.text('Bill to', m, 146)
  doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
  doc.text(d.customerName || d.customerEmail, m, 162)
  if (d.customerEmail) doc.text(d.customerEmail, m, 176)
  doc.text(d.countryService, m, 190)

  // Line items
  ;(doc as unknown as { autoTable: (o: object) => void }).autoTable({
    startY: 214,
    head: [['Description', 'Qty', 'Unit', 'Amount']],
    body: d.lineItems.map(li => [li.description, String(li.qty), money(li.unit), money(li.amount)]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: m, right: m },
    styles: { fontSize: 10, cellPadding: 6 },
  })

  // Totals
  const lastY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
  let y = (lastY ?? 320) + 20
  const right = 547
  const row = (label: string, val: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(bold ? 17 : 107, bold ? 24 : 114, bold ? 39 : 128)
    doc.text(label, 400, y); doc.text(val, right, y, { align: 'right' }); y += 18
  }
  row('Subtotal', money(d.subtotal))
  if (d.discount > 0) row('Discount', `-${money(d.discount)}`)
  doc.setDrawColor(229, 231, 235); doc.line(400, y - 8, right, y - 8)
  row('Total', money(d.total), true)

  // Footer
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(156, 163, 175)
  doc.text(
    'VisitPlane provides visa application assistance and guidance. We are not a government body and do not\nguarantee visa approval. Government fees are collected on your behalf and remitted to the relevant authority.',
    m, 760, { maxWidth: 500 },
  )

  return Buffer.from(doc.output('arraybuffer'))
}
