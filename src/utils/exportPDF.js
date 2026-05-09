export async function exportToPDF(element, featureName) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * contentWidth) / canvas.width

  let yOffset = 0
  let remainingHeight = imgHeight

  while (remainingHeight > 0) {
    if (yOffset > 0) pdf.addPage()

    const sourceY = (yOffset / imgHeight) * canvas.height
    const sliceHeight = Math.min(pageHeight - margin * 2, remainingHeight)
    const sourceHeight = (sliceHeight / imgHeight) * canvas.height

    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sourceHeight
    const ctx = sliceCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceHeight)

    yOffset += sliceHeight
    remainingHeight -= sliceHeight
  }

  const filename = `${featureName.replace(/\s+/g, '-').toLowerCase()}-prd.pdf`
  pdf.save(filename)
}
