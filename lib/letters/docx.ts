import type { Block, Seg } from './templates'

const segText = (segs: Seg[]) => segs.map((s) => s.text).join('')

/** Render the letter blocks to an editable Word file and download it. */
export async function downloadLetterDocx(blocks: Block[], filename: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun } = await import('docx')
  const font = 'Times New Roman'
  const size = 23 // half-points: 11.5pt
  const run = (text: string, bold = false) => new TextRun({ text, bold, font, size })

  const children: InstanceType<typeof Paragraph>[] = []
  for (const b of blocks) {
    if (b.kind === 'gap') {
      children.push(new Paragraph({ children: [run('')] }))
    } else if (b.kind === 'h') {
      children.push(new Paragraph({ children: [run(b.text, true)], spacing: { before: 60 } }))
    } else if (b.kind === 'p') {
      children.push(new Paragraph({ children: [run(segText(b.segs))] }))
    } else if (b.kind === 'lines') {
      b.lines.forEach((l) => children.push(new Paragraph({ children: [run(segText(l))] })))
    } else if (b.kind === 'list') {
      b.items.forEach((i) => children.push(new Paragraph({ children: [run(segText(i))], bullet: { level: 0 } })))
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1247, bottom: 1247, left: 1247, right: 1247 } } },
        children,
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
