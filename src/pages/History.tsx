"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { localStorageService } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  Search,
  Eye,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  HistoryIcon,
  User,
  Package,
  Pill,
} from "lucide-react"

interface SaleItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  subtotal: number
  category: string
}

interface Sale {
  id: string
  items: SaleItem[]
  total: number
  totalUSD: number
  totalKHR: number
  customerName?: string
  date: string
  exchangeRate: number
}

const History: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [tableView, setTableView] = useState(false)

  // Get sales from localStorage
  const sales = useMemo(() => {
    const salesData = localStorage.getItem("hms-sales")
    if (!salesData) return []
    try {
      const parsed = JSON.parse(salesData)
      return Array.isArray(parsed)
        ? parsed.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : []
    } catch (error) {
      console.error("Error parsing sales data:", error)
      return []
    }
  }, [])

  // Get medications for image lookup
  const medications = useMemo(() => localStorageService.getMedications(), [])

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalUSD, 0)
    const totalItems = sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

    return {
      totalSales,
      totalRevenue,
      totalItems,
      averageSale,
    }
  }, [sales])

  // Filter sales based on search term
  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales

    return sales.filter((sale) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        sale.id.toLowerCase().includes(searchLower) ||
        sale.customerName?.toLowerCase().includes(searchLower) ||
        sale.items.some((item) => item.name.toLowerCase().includes(searchLower))
      )
    })
  }, [sales, searchTerm])

  const viewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setShowDetails(true)
  }

  const printReceipt = (sale: Sale) => {
    const receiptContent = `
      <div style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">VITAL INFO CORE</h2>
          <p style="margin: 5px 0;">Hospital Management System</p>
          <p style="margin: 5px 0;">Receipt #${sale.id}</p>
          <p style="margin: 5px 0;">${new Date(sale.date).toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Customer: ${sale.customerName || "Guest"}</strong>
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          ${sale.items
            .map(
              (item) => `
            <div style="margin-bottom: 8px;">
              <div>${item.name}</div>
              <div style="display: flex; justify-content: space-between;">
                <span>${item.quantity} x $${item.unitPrice.toFixed(2)}</span>
                <span>$${item.subtotal.toFixed(2)}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
            <span>Total (USD):</span>
            <span>$${sale.totalUSD.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
            <span>Total (KHR):</span>
            <span>${sale.totalKHR.toLocaleString()} ៛</span>
          </div>
          <div style="margin-top: 10px; font-size: 12px; text-align: center;">
            Exchange Rate: 1 USD = ${sale.exchangeRate} KHR
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Thank you for your purchase!</p>
          <p>Get well soon!</p>
        </div>
      </div>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt #${sale.id}</title></head>
          <body>${receiptContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getMedicationImage = (medicationId: string) => {
    const medication = medications.find((med) => med.id === medicationId)
    return medication?.imageUrl
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-xl text-gray-700">
                <HistoryIcon className="h-6 w-6" />
              </div>
              {t('salesHistory') || 'Sales History'}
            </h1>
            <p className="text-gray-600">{t('viewAndManageSales') || 'View and manage your sales transactions'}</p>
          </div>
          <Button variant={tableView ? 'default' : 'outline'} onClick={() => setTableView(v => !v)}>
            {tableView ? t('cardView') || 'Card View' : t('tableView') || 'Table View'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white text-gray-900 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Sales</p>
                  <p className="text-2xl font-bold">{statistics.totalSales}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-900 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">${statistics.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-900 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Items Sold</p>
                  <p className="text-2xl font-bold">{statistics.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-900 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Average Sale</p>
                  <p className="text-2xl font-bold">${statistics.averageSale.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sales List */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-gray-100 text-gray-900 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              {t('salesTransactions') || 'Sales Transactions'}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchSalesPlaceholder') || 'Search by receipt ID, customer name, or medicine...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HistoryIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {sales.length === 0 ? t('noSalesYet') || 'No sales recorded yet' : t('noSalesMatch') || 'No sales match your search'}
                </p>
                <p className="text-sm">
                  {sales.length === 0 ? t('startMakingSales') || 'Start making sales to see them here' : t('tryAdjustingSearch') || 'Try adjusting your search terms'}
                </p>
              </div>
            ) : tableView ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('receiptId') || 'Receipt ID'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('date') || 'Date'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('customer') || 'Customer'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('items') || 'Items'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('totalUSD') || 'Total (USD)'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('totalKHR') || 'Total (KHR)'}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">#{sale.id}</td>
                        <td className="px-4 py-2 text-sm">{new Date(sale.date).toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">{sale.customerName || 'Guest'}</td>
                        <td className="px-4 py-2 text-sm">{sale.items.length}</td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">${sale.totalUSD.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{sale.totalKHR.toLocaleString()} ៛</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewSaleDetails(sale)}>
                            <Eye className="h-3 w-3 mr-1" />
                            {t('view') || 'View'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => printReceipt(sale)}>
                            <Printer className="h-3 w-3 mr-1" />
                            {t('print') || 'Print'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSales.map((sale) => (
                  <Card
                    key={sale.id}
                    className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">#{sale.id}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sale.date).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          {sale.items.length} items
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                          <User className="h-3 w-3" />
                          Customer: {sale.customerName || "Guest"}
                        </p>

                        {/* Show first 3 items */}
                        <div className="space-y-1">
                          {sale.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {getMedicationImage(item.id) ? (
                                  <img
                                    src={getMedicationImage(item.id) || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = "none"
                                      const parent = target.parentElement
                                      if (parent) {
                                        const fallback = parent.querySelector(".fallback-icon") as HTMLElement
                                        if (fallback) fallback.style.display = "block"
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`fallback-icon text-gray-400 ${getMedicationImage(item.id) ? "hidden" : ""}`}
                                >
                                  <Pill className="h-2 w-2" />
                                </div>
                              </div>
                              <span className="truncate">
                                {item.name} x{item.quantity}
                              </span>
                            </div>
                          ))}
                          {sale.items.length > 3 && (
                            <p className="text-xs text-gray-500">+{sale.items.length - 3} more items</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600">${sale.totalUSD.toFixed(2)}</span>
                          <span className="text-sm text-gray-600">{sale.totalKHR.toLocaleString()} ៛</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewSaleDetails(sale)} className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printReceipt(sale)} className="flex-1">
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Sale Details - #{selectedSale?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">{new Date(selectedSale.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedSale.customerName || "Guest"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exchange Rate</p>
                  <p className="font-medium">1 USD = {selectedSale.exchangeRate.toLocaleString()} KHR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="font-medium">{selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </div>

              <Separator />

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Items Purchased</h3>
                <div className="space-y-3">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getMedicationImage(item.id) ? (
                          <img
                            src={getMedicationImage(item.id) || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector(".fallback-icon") as HTMLElement
                                if (fallback) fallback.style.display = "block"
                              }
                            }}
                          />
                        ) : null}
                        <div className={`fallback-icon text-gray-400 ${getMedicationImage(item.id) ? "hidden" : ""}`}>
                          <Pill className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.subtotal.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-blue-600">${item.subtotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {(item.subtotal * selectedSale.exchangeRate).toLocaleString()} ៛
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>Total (USD)</span>
                  <span className="text-blue-600">${selectedSale.totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>Total (KHR)</span>
                  <span className="text-green-600">{selectedSale.totalKHR.toLocaleString()} ៛</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => printReceipt(selectedSale)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default History
