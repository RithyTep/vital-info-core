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

  // Get exchange rate from localStorage or use default
  const getExchangeRate = () => {
    const settings = localStorage.getItem("hms-settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.exchangeRate || 4000
    }
    return 4000
  }

  const exchangeRate = getExchangeRate()

  const filteredMedications = useMemo(() => {
    return medications.filter(
      (medication) => medication.name.toLowerCase().includes(searchTerm.toLowerCase()) && medication.stockQuantity > 0,
    )
  }, [medications, searchTerm])

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
      // Update stock quantities
      cart.forEach((cartItem) => {
        const newStock = cartItem.stockQuantity - cartItem.quantity
        localStorageService.updateMedication(cartItem.id, { stockQuantity: newStock })
      })

      // Create sale record without image data to prevent quota issues
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

      // Save sale to localStorage
      const existingSales = localStorage.getItem("hms-sales")
      const sales = existingSales ? JSON.parse(existingSales) : []
      sales.push(sale)

      // Check if we're approaching localStorage limit
      const newSalesData = JSON.stringify(sales)
      if (newSalesData.length > 4000000) {
        // 4MB limit to be safe
        // Keep only the last 100 sales to prevent quota issues
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
      <div style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">VITAL INFO CORE</h2>
          <p style="margin: 5px 0;">Hospital Management System</p>
          <p style="margin: 5px 0;">Receipt #${lastSale.id}</p>
          <p style="margin: 5px 0;">${new Date(lastSale.date).toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Customer: ${lastSale.customerName}</strong>
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          ${lastSale.items
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
            <span>$${lastSale.totalUSD.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
            <span>Total (KHR):</span>
            <span>${lastSale.totalKHR.toLocaleString()} ៛</span>
          </div>
          <div style="margin-top: 10px; font-size: 12px; text-align: center;">
            Exchange Rate: 1 USD = ${lastSale.exchangeRate} KHR
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
          <head><title>Receipt</title></head>
          <body>${receiptContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-gray-200 rounded-xl text-gray-700">
              <ShoppingCart className="h-6 w-6" />
            </div>
            Point of Sale System
          </h1>
          <p className="text-gray-600">Quick medicine sales and inventory management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="bg-gray-100 text-gray-900 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Available Medicines
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                  {filteredMedications.map((medication) => (
                    <Card
                      key={medication.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 bg-white"
                      onClick={() => addToCart(medication)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          {/* Medicine Image */}
                          <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
                                    if (fallback) fallback.style.display = "block"
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`fallback-icon text-gray-400 ${medication.imageUrl ? "hidden" : ""}`}> 
                              <Pill className="h-8 w-8" />
                            </div>
                          </div>

                          <div className="w-full">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm text-gray-800 truncate flex-1">{medication.name}</h4>
                              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800 text-xs">
                                {medication.stockQuantity}
                              </Badge>
                            </div>

                            <p className="text-xs text-gray-600 mb-3 bg-gray-100 px-2 py-1 rounded-full">
                              {medication.category}
                            </p>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-600 text-lg">
                                  ${medication.unitPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                {(medication.unitPrice * exchangeRate).toLocaleString()} ៛
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredMedications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No medicines found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div>
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="bg-gray-100 text-gray-900 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart ({cart.length})
                  </span>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-gray-700 hover:bg-gray-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <div>
                  <Label htmlFor="customerName" className="text-gray-700">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-white border-gray-200 mt-1"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      {/* Item Image */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                                if (fallback) fallback.style.display = "block"
                              }
                            }}
                          />
                        ) : null}
                        <div className={`fallback-icon text-gray-400 ${item.imageUrl ? "hidden" : ""}`}> 
                          <Pill className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">{item.name}</h5>
                        <p className="text-xs text-gray-600">${item.unitPrice.toFixed(2)} per unit</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-sm text-blue-600">${item.subtotal.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{(item.subtotal * exchangeRate).toLocaleString()} ៛</p>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Your cart is empty</p>
                    <p className="text-sm">Add medicines to get started</p>
                  </div>
                )}

                {cart.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total (USD)</span>
                        <span className="text-blue-600">${totalUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total (KHR)</span>
                        <span className="text-green-600">{totalKHR.toLocaleString()} ៛</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center bg-white py-1 px-2 rounded">
                        Exchange Rate: 1 USD = {exchangeRate.toLocaleString()} KHR
                      </p>
                    </div>
                    <Button
                      onClick={processSale}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Complete Sale
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">🎉 Sale Completed!</DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg">Receipt #{lastSale.id}</h3>
                <p className="text-sm text-gray-600">{new Date(lastSale.date).toLocaleString()}</p>
                <p className="text-sm font-medium">Customer: {lastSale.customerName}</p>
              </div>

              <Separator />

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lastSale.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total (USD)</span>
                  <span className="text-blue-600">${lastSale.totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total (KHR)</span>
                  <span className="text-green-600">{lastSale.totalKHR.toLocaleString()} ៛</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={printReceipt} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowReceipt(false)}>
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

export default POS
