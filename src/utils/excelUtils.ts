import * as XLSX from "xlsx"

export interface ExcelColumn {
  key: string
  header: string
  width?: number
}

export function exportToExcel(data: any[], filename: string, columns: ExcelColumn[], sheetName = "Sheet1") {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data with proper headers
    const exportData = data.map((item) => {
      const row: any = {}
      columns.forEach((col) => {
        row[col.header] = item[col.key]
      })
      return row
    })

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = columns.map((col) => ({ wch: col.width || 15 }))
    worksheet["!cols"] = colWidths

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" },
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const finalFilename = `${filename}_${timestamp}.xlsx`

    // Write file
    XLSX.writeFile(workbook, finalFilename)

    return true
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    throw error
  }
}

export function exportMultipleSheets(
  sheets: Array<{
    data: any[]
    sheetName: string
    columns: ExcelColumn[]
  }>,
  filename: string,
) {
  try {
    const workbook = XLSX.utils.book_new()

    sheets.forEach((sheet) => {
      const exportData = sheet.data.map((item) => {
        const row: any = {}
        sheet.columns.forEach((col) => {
          row[col.header] = item[col.key]
        })
        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      const colWidths = sheet.columns.map((col) => ({ wch: col.width || 15 }))
      worksheet["!cols"] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
    })

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const finalFilename = `${filename}_${timestamp}.xlsx`

    XLSX.writeFile(workbook, finalFilename)

    return true
  } catch (error) {
    console.error("Error exporting multiple sheets to Excel:", error)
    throw error
  }
}
