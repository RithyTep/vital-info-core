import * as XLSX from "xlsx"

export interface ExcelColumn {
  key: string
  header: string
  width?: number
}

export const exportToExcel = (data: any[], filename: string, columns: ExcelColumn[], sheetName = "Sheet1") => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data with headers
    const headers = columns.map((col) => col.header)
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.key]
        // Handle different data types
        if (value === null || value === undefined) return ""
        if (typeof value === "boolean") return value ? "Yes" : "No"
        if (typeof value === "object") return JSON.stringify(value)
        return value
      }),
    )

    // Combine headers and data
    const worksheetData = [headers, ...rows]

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const columnWidths = columns.map((col) => ({ wch: col.width || 15 }))
    worksheet["!cols"] = columnWidths

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" },
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const fullFilename = `${filename}_${timestamp}.xlsx`

    // Write and download file
    XLSX.writeFile(workbook, fullFilename)

    return true
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    throw new Error("Failed to export data to Excel")
  }
}

export const exportMultipleSheets = (
  sheets: Array<{
    data: any[]
    sheetName: string
    columns: ExcelColumn[]
  }>,
  filename: string,
) => {
  try {
    const workbook = XLSX.utils.book_new()

    sheets.forEach(({ data, sheetName, columns }) => {
      const headers = columns.map((col) => col.header)
      const rows = data.map((item) =>
        columns.map((col) => {
          const value = item[col.key]
          if (value === null || value === undefined) return ""
          if (typeof value === "boolean") return value ? "Yes" : "No"
          if (typeof value === "object") return JSON.stringify(value)
          return value
        }),
      )

      const worksheetData = [headers, ...rows]
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      const columnWidths = columns.map((col) => ({ wch: col.width || 15 }))
      worksheet["!cols"] = columnWidths

      // Style header row
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!worksheet[cellAddress]) continue

        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center", vertical: "center" },
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const fullFilename = `${filename}_${timestamp}.xlsx`

    XLSX.writeFile(workbook, fullFilename)

    return true
  } catch (error) {
    console.error("Error exporting multiple sheets to Excel:", error)
    throw new Error("Failed to export data to Excel")
  }
}
