"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { localStorageService, type Medication } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"
import { Search, Plus, Minus, ShoppingCart, Printer, Trash2, Calculator, Package, Pill } from "lucide-react"

interface CartItem extends Medication {
  quantity: number
  subtotal: number
}

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

const POS: React.FC = () => {
  const { t } = useLanguage()
  const [medications] = useState<Medication[]>(() => localStorageService.getMedications())
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getExchangeRate = () => {
    const settings = localStorage.getItem("hms-settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.exchangeRate || 4000
    }
    return 4000
  }

  const exchangeRate = getExchangeRate()

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(medications.map((med) => med.category).filter(Boolean))]
    return ["all", ...uniqueCategories]
  }, [medications])

  const filteredMedications = useMemo(() => {
    return medications.filter((medication) => {
      const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || medication.category === selectedCategory
      const hasStock = medication.stockQuantity > 0
      return matchesSearch && matchesCategory && hasStock
    })
  }, [medications, searchTerm, selectedCategory])

  const addToCart = (medication: Medication) => {
    const existingItem = cart.find((item) => item.id === medication.id)

    if (existingItem) {
      if (existingItem.quantity >= medication.stockQuantity) {
        toast({
          title: t("error"),
          description: `Only ${medication.stockQuantity} items available in stock`,
          variant: "destructive",
        })
        return
      }

      setCart(
        cart.map((item) =>
          item.id === medication.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item,
        ),
      )
    } else {
      const cartItem: CartItem = {
        ...medication,
        quantity: 1,
        subtotal: medication.unitPrice,
      }
      setCart([...cart, cartItem])
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }

    const medication = medications.find((med) => med.id === id)
    if (medication && newQuantity > medication.stockQuantity) {
      toast({
        title: t("error"),
        description: `Only ${medication.stockQuantity} items available in stock`,
        variant: "destructive",
      })
      return
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice } : item,
      ),
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
  }

  const totalUSD = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalKHR = totalUSD * exchangeRate

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: t("error"),
        description: "Cart is empty",
        variant: "destructive",
      })
      return
    }

    try {
      cart.forEach((cartItem) => {
        const newStock = cartItem.stockQuantity - cartItem.quantity
        localStorageService.updateMedication(cartItem.id, { stockQuantity: newStock })
      })

      const saleItems: SaleItem[] = cart.map((item) => ({
        id: item.id,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        category: item.category,
      }))

      const sale: Sale = {
        id: Date.now().toString(),
        items: saleItems,
        total: totalUSD,
        totalUSD,
        totalKHR,
        customerName: customerName || "Guest",
        date: new Date().toISOString(),
        exchangeRate,
      }

      const existingSales = localStorage.getItem("hms-sales")
      const sales = existingSales ? JSON.parse(existingSales) : []
      sales.push(sale)

      const newSalesData = JSON.stringify(sales)
      if (newSalesData.length > 4000000) {
        const recentSales = sales.slice(-100)
        localStorage.setItem("hms-sales", JSON.stringify(recentSales))
        toast({
          title: "Info",
          description: "Old sales data cleaned to free up storage space",
        })
      } else {
        localStorage.setItem("hms-sales", newSalesData)
      }

      setLastSale(sale)
      setShowReceipt(true)
      clearCart()

      toast({
        title: t("success"),
        description: "Sale completed successfully",
      })
    } catch (error) {
      console.error("Error processing sale:", error)
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      })
    }
  }

  const printReceipt = () => {
    if (!lastSale) return

    const receiptContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 280px; margin: auto; padding: 15px; font-size: 12px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 1.2em;">VITAL INFO CORE</h2>
          <p style="margin: 2px 0;">Hospital Management System</p>
          <p style="margin: 2px 0;">Receipt #${lastSale.id}</p>
          <p style="margin: 2px 0;">${new Date(lastSale.date).toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 10px;">
          <strong>Customer: ${lastSale.customerName}</strong>
        </div>
        
        <div style="border-top: 1px dashed #333; padding-top: 8px;">
          ${lastSale.items
        .map(
          (item) => `
            <div style="margin-bottom: 6px;">
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
        
        <div style="border-top: 1px dashed #333; padding-top: 8px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em;">
            <span>Total (USD):</span>
            <span>$${lastSale.totalUSD.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em;">
            <span>Total (KHR):</span>
            <span>${lastSale.totalKHR.toLocaleString()} ៛</span>
          </div>
          <div style="margin-top: 8px; font-size: 0.9em; text-align: center;">
            Exchange Rate: 1 USD = ${lastSale.exchangeRate} KHR
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 15px; font-size: 0.9em;">
          <p>Thank you for your purchase!</p>
          <p>Get well soon!</p>
        </div>
      </div>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt</title></head>
          <body>${receiptContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen w-full overflow-hidden">
      <div className="max-w-full mx-auto p-2 sm:p-3 md:p-4 h-screen flex flex-col">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 xl:gap-4 flex-1 h-full min-h-0">
          {/* Products Section */}
          <div className="xl:col-span-3 h-full flex flex-col">
            <Card className="h-full flex flex-col shadow-md border-slate-200 bg-white">
              <CardHeader className="p-3 xl:p-4 flex-shrink-0 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md bg-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
                  <TabsList className="flex flex-wrap gap-2 p-2 h-auto flex-shrink-0 bg-slate-100/80 border-b">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="text-xs font-medium px-3 py-1 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors shadow-sm whitespace-nowrap"
                      >
                        {category === "all" ? t("all") || "All" : category}
                        <Badge variant="secondary" className="ml-1.5 bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full">
                          {category === "all"
                            ? medications.filter((m) => m.stockQuantity > 0).length
                            : medications.filter((m) => m.category === category && m.stockQuantity > 0).length}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div
                    className="flex-1 min-h-0 overflow-auto p-3 xl:p-4"
                    style={{ maxHeight: "calc(100vh - 244px)" }}
                  >
                    {categories.map((category) => (
                      <TabsContent key={category} value={category} className="m-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                          {filteredMedications.map((medication) => (
                            <div
                              key={medication.id}
                              className="group cursor-pointer bg-white border border-slate-200 rounded-lg p-2.5 hover:border-blue-500 hover:shadow-md transition-all duration-150 flex flex-col"
                              onClick={() => addToCart(medication)}
                            >
                              <div className="w-full h-16 mb-2 rounded-md overflow-hidden bg-slate-50 flex items-center justify-center border">
                                {medication.imageUrl ? (
                                  <img
                                    src={medication.imageUrl || "/placeholder.svg"}
                                    alt={medication.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = "none"
                                      const parent = target.parentElement
                                      if (parent) {
                                        const fallback = parent.querySelector(".fallback-icon") as HTMLElement
                                        if (fallback) fallback.style.display = "flex"
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`fallback-icon text-slate-300 ${medication.imageUrl ? "hidden" : "flex"} items-center justify-center w-full h-full`}
                                >
                                  <Pill className="h-6 w-6" />
                                </div>
                              </div>
                              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                                <h4 className="font-semibold text-slate-800 text-xs leading-snug break-words">
                                  {medication.name}
                                </h4>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                    {medication.category}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-green-50 text-green-700 border-green-200 shrink-0 px-1.5 py-0.5 rounded-full"
                                  >
                                    {medication.stockQuantity}
                                  </Badge>
                                </div>
                                <div className="pt-1">
                                  <div className="text-base font-bold text-blue-600">
                                    ${medication.unitPrice.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {filteredMedications.length === 0 && (
                          <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                            <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-base font-medium text-slate-500">{t("noMedicationsFound") || "No medicines found"}</p>
                            <p className="text-xs text-slate-400">{t("adjustSearchOrCategory") || "Adjust your search or category filters"}</p>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* =============================================================================== */}
          {/* === CART SECTION FIX APPLIED HERE ============================================ */}
          {/* The CardContent is now the single scrollable container for the entire cart   */}
          {/* =============================================================================== */}
          <div className="h-full flex flex-col">
            <Card className="h-full flex flex-col shadow-md border-slate-200 bg-white">
              <CardHeader className="p-3 xl:p-4 flex-shrink-0 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    Cart <span className="text-blue-600">({cart.length})</span>
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearCart}
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 rounded-full"
                      title={t("clearCart") || "Clear Cart"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1.5 mt-3">
                  <Label htmlFor="customerName" className="text-xs font-medium text-slate-600">
                    {t("pos.customerName") || "Customer Name"}
                  </Label>
                  <Input
                    id="customerName"
                    placeholder={t("pos.customerName") || "Guest"}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-md bg-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-3 xl:p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm text-slate-500">{t("pos.cartIsEmpty") || "Your cart is empty"}</p>
                    <p className="text-xs text-slate-400">{t("addMedicinesToStart") || "Add medicines to start"}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-white border flex items-center justify-center flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallback = parent.querySelector(".fallback-icon") as HTMLElement
                                    if (fallback) fallback.style.display = "flex"
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`fallback-icon text-slate-300 ${item.imageUrl ? "hidden" : "flex"} items-center justify-center w-full h-full`}
                            >
                              <Pill className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-xs text-slate-800 truncate">{item.name}</h5>
                            <p className="text-[11px] text-slate-500">${item.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 rounded-full"
                              title="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 rounded-full"
                              title="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right w-16">
                            <p className="font-bold text-xs text-blue-700">${item.subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2 p-3 bg-blue-50/70 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-slate-700">{t("pos.totalUSD") || "Total (USD)"}</span>
                          <span className="text-lg font-bold text-blue-700">${totalUSD.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-slate-700">{t("pos.totalKHR") || "Total (KHR)"}</span>
                          <span className="text-base font-bold text-blue-700">{totalKHR.toLocaleString()} ៛</span>
                        </div>
                      </div>
                      <Button
                        onClick={processSale}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm font-bold rounded-lg shadow-sm"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        {t("pos.completeSale") || "Complete Sale"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-[320px] p-0 rounded-lg shadow-lg border-0 bg-white">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-center text-green-600 flex items-center justify-center gap-2 text-base font-bold">
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-lg">✓</div>
              {t("pos.saleCompleted") || "Sale Completed Successfully"}
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-3 p-4">
              <div className="text-center text-xs text-slate-600">
                <p>{t("pos.receipt") || "Receipt"} ID: <span className="font-semibold text-slate-800">#{lastSale.id}</span></p>
                <p>{t("pos.customerName") || "Customer"}: <span className="font-semibold text-slate-800">{lastSale.customerName}</span></p>
              </div>
              <Separator />
              <div className="space-y-1 max-h-28 overflow-y-auto px-1">
                {lastSale.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 rounded-md">
                    <span className="font-medium text-slate-800 truncate pr-2">
                      {item.name} <span className="text-slate-500">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-blue-700">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 p-3 bg-blue-50/80 rounded-lg">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-slate-700">{t("pos.totalUSD") || "Total (USD)"}</span>
                  <span className="text-blue-700">${lastSale.totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm">
                  <span className="text-slate-700">{t("pos.totalKHR") || "Total (KHR)"}</span>
                  <span className="text-blue-700">{lastSale.totalKHR.toLocaleString()} ៛</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={printReceipt} className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 text-xs text-white font-bold rounded-md shadow-sm">
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  {t("pos.printReceipt") || "Print Receipt"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReceipt(false)}
                  className="h-9 text-xs px-3 rounded-md"
                >
                  {t("pos.close") || "Close"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default POS
