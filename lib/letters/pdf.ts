import type { Block, Seg } from './templates'

const segText = (segs: Seg[]) => segs.map((s) => s.text).join('')

/** Render the letter blocks to an A4 PDF (selectable text) and download it. */
export async function downloadLetterPdf(blocks: Block[], filename: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 22
  const width = 210 - margin * 2
  const lineH = 5.6
  const bottom = 297 - margin
  let y = margin

  doc.setFont('times', 'normal')
  doc.setFontSize(11.5)

  const write = (text: string, indent = 0) => {
    const lines = doc.splitTextToSize(text, width - indent) as string[]
    for (const line of lines) {
      if (y > bottom) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin + indent, y)
      y += lineH
    }
  }

  for (const b of blocks) {
    if (b.kind === 'gap') {
      y += lineH * 0.7
    } else if (b.kind === 'h') {
      y += lineH * 0.3
      doc.setFont('times', 'bold')
      write(b.text)
      doc.setFont('times', 'normal')
    } else if (b.kind === 'p') {
      write(segText(b.segs))
    } else if (b.kind === 'lines') {
      b.lines.forEach((l) => write(segText(l)))
    } else if (b.kind === 'list') {
      b.items.forEach((i) => write(`•  ${segText(i)}`, 4))
    }
  }

  doc.save(filename)
}
