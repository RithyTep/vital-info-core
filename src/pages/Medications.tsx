"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash, Search, FileSpreadsheet, Package, AlertTriangle, CheckCircle, XCircle, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { localStorageService, Medication } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"
import * as XLSX from "xlsx"

// Mock data and types
const Medications = () => {
  const { t } = useLanguage()
  const [medications, setMedications] = useState<Medication[]>([])
  // const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    stockQuantity: 0,
    unitPrice: 0,
    category: "",
    expiryDate: "",
    imageUrl: "",
    categoryInput: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    setMedications(localStorageService.getMedications())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const categoryValue = formData.category === "other" ? formData.categoryInput : formData.category
    const newMedication: Medication = {
      id: editingMedication?.id || Date.now().toString(),
      name: formData.name,
      stockQuantity: Number(formData.stockQuantity),
      unitPrice: Number(formData.unitPrice),
      category: categoryValue,
      expiryDate: formData.expiryDate,
      imageUrl: formData.imageUrl,
      lastRestocked: editingMedication ? editingMedication.lastRestocked : new Date().toISOString().split('T')[0],
      createdAt: editingMedication?.createdAt || new Date().toISOString(),
      remainingStock: Number(formData.stockQuantity),
    }
    if (editingMedication) {
      localStorageService.updateMedication(editingMedication.id, newMedication)
    } else {
      localStorageService.createMedication(newMedication)
    }
    setDialogOpen(false)
    setEditingMedication(null)
    setFormData({
      name: "",
      stockQuantity: 0,
      unitPrice: 0,
      category: "",
      expiryDate: "",
      imageUrl: "",
      categoryInput: "",
    })
    setMedications(localStorageService.getMedications())
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormData({
      name: medication.name,
      stockQuantity: medication.stockQuantity,
      unitPrice: medication.unitPrice,
      category: medication.category,
      expiryDate: medication.expiryDate,
      imageUrl: medication.imageUrl || "",
      categoryInput: "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication)
  }

  const confirmDelete = () => {
    if (!medicationToDelete) return
    localStorageService.deleteMedication(medicationToDelete.id)
    setMedications(localStorageService.getMedications())
    setMedicationToDelete(null)
  }

  const openAddDialog = () => {
    setEditingMedication(null)
    setFormData({
      name: "",
      stockQuantity: 0,
      unitPrice: 0,
      category: "",
      expiryDate: "",
      imageUrl: "",
      categoryInput: "",
    })
    setDialogOpen(true)
  }

  const getStockStatus = (medication: Medication) => {
    const { stockQuantity } = medication
    if (stockQuantity === 0) {
      return {
        text: "Out of Stock",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        iconColor: "text-red-500",
        progress: 0,
      }
    }
    if (stockQuantity < 10) {
      return {
        text: "Low Stock",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        progress: 25,
      }
    }
    if (stockQuantity > 50) {
      return {
        text: "Well Stocked",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        iconColor: "text-green-500",
        progress: 100,
      }
    }
    return {
      text: "In Stock",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle,
      iconColor: "text-blue-500",
      progress: 60,
    }
  }

  const categories = Array.from(new Set(medications.map(med => med.category)))

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || medication.category === filterCategory
    const status = getStockStatus(medication)
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "low" && status.text === "Low Stock") ||
      (filterStatus === "out" && status.text === "Out of Stock") ||
      (filterStatus === "normal" && (status.text === "In Stock" || status.text === "Well Stocked"))
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalValue = medications.reduce((sum, med) => sum + (med.stockQuantity * med.unitPrice), 0)
  const lowStockCount = medications.filter(med => getStockStatus(med).text === "Low Stock").length
  const outOfStockCount = medications.filter(med => getStockStatus(med).text === "Out of Stock").length

  // const isExpiringSoon = (expiryDate: string) => {
  //   const today = new Date()
  //   const expiry = new Date(expiryDate)
  //   const diffTime = expiry.getTime() - today.getTime()
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  //   return diffDays <= 30 && diffDays > 0
  // }

  // const isExpired = (expiryDate: string) => {
  //   const today = new Date()
  //   const expiry = new Date(expiryDate)
  //   return expiry < today
  // }

  const handleExportExcel = () => {
    const data = medications.map(med => ({
      Name: med.name,
      Category: med.category,
      Stock: med.stockQuantity,
      "Unit Price": med.unitPrice,
      "Expiry Date": med.expiryDate,
      "Last Restocked": med.lastRestocked,
      "Created At": med.createdAt,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medications");
    XLSX.writeFile(workbook, "medications.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {t('medications.inventoryTitle')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('medications.inventorySubtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-blue-100 text-sm font-medium">{t('medications.totalValue')}</p>
                  <p className="text-3xl font-bold text-white">${totalValue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-blue-400/20 rounded-full">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-emerald-100 text-sm font-medium">{t('medications.totalItems')}</p>
                  <p className="text-3xl font-bold text-white">{medications.length}</p>
                </div>
                <div className="p-3 bg-emerald-400/20 rounded-full">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-amber-100 text-sm font-medium">{t('medications.lowStock')}</p>
                  <p className="text-3xl font-bold text-white">{lowStockCount}</p>
                </div>
                <div className="p-3 bg-amber-400/20 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-red-500 to-red-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-red-100 text-sm font-medium">{t('medications.outOfStock')}</p>
                  <p className="text-3xl font-bold text-white">{outOfStockCount}</p>
                </div>
                <div className="p-3 bg-red-400/20 rounded-full">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('medications.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('medications.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('medications.allCategories')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('medications.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('medications.allStatus')}</SelectItem>
                  <SelectItem value="normal">{t('medications.normalStock')}</SelectItem>
                  <SelectItem value="low">{t('medications.lowStock')}</SelectItem>
                  <SelectItem value="out">{t('medications.outOfStock')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('medications.export')}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('medications.addItem')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-1">{editingMedication ? t('medications.editInventoryItem') : t('medications.addNewInventoryItem')}</DialogTitle>
                    <p className="text-gray-500 text-sm mb-4">{editingMedication ? t('medications.updateDetails') : t('medications.fillDetails')}</p>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('medications.productName')}</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">{t('medications.category')}</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder={t('medications.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <SelectItem value="other">{t('medications.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.category === "other" && (
                          <Input
                            className="mt-2"
                            placeholder={t('medications.enterNewCategory')}
                            value={formData.categoryInput || ""}
                            onChange={e => setFormData({ ...formData, categoryInput: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">{t('medications.currentStock')}</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitPrice">{t('medications.unitPrice')}</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">{t('medications.expiryDate')}</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        required
                      />
                    </div>
                    <hr className="my-4" />
                    <div className="space-y-2">
                      <Label htmlFor="image">{t('medications.productImage')}</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                      {formData.imageUrl && (
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="mt-2 h-20 w-20 object-cover rounded border"
                        />
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingMedication ? t('medications.updateItem') : t('medications.addItem')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredMedications.length === 0 ? (
          <Card className="border-dashed border-2 bg-white text-center py-16 flex flex-col items-center justify-center">
            <CardContent>
              <Package className="h-16 w-16 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? t('medications.noItemsFound') : t('medications.noInventoryItems')}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? t('medications.noItemsMatch') : t('medications.startBuildingInventory')}
              </p>
              {!searchTerm && (
                <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('medications.addFirstItem')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMedications.map((medication) => {
              const stockStatus = getStockStatus(medication)
              const StockIcon = stockStatus.icon
              const totalValue = medication.stockQuantity * medication.unitPrice
              
              return (
                <Card key={medication.id} className={`hover:shadow-lg transition-all duration-200 bg-white border-l-4`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-bold text-gray-900 truncate">
                            {medication.name}
                          </CardTitle>
                          <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-blue-200 capitalize">
                            {medication.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span>{t('medications.stock')}: <span className="font-semibold text-gray-900">{medication.stockQuantity}</span></span>
                          <span>•</span>
                          <span>{t('medications.unit')}: <span className="font-semibold text-green-700">${medication.unitPrice}</span></span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* <Badge variant={stockStatus.color} className="text-xs px-2 py-1 font-semibold"> */}
                          <Badge className={`text-xs px-2 py-1 font-semibold ${stockStatus.color}`}>
                            <StockIcon className="h-3 w-3 mr-1" />
                            {stockStatus.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(medication)} 
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(medication)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {medication.imageUrl && (
                      <img
                        src={medication.imageUrl}
                        alt={medication.name}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{t('medications.stockLevel')}</span>
                        <span className="font-medium">{medication.stockQuantity}</span>
                      </div>
                      <Progress value={stockStatus.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{t('medications.unitPrice')}</p>
                        <p className="font-semibold text-green-600">${medication.unitPrice}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{t('medications.totalValue')}</p>
                        <p className="font-semibold text-blue-600">${totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="space-y-1 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{t('medications.expires')}</span>
                        <span className="font-medium">{new Date(medication.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <AlertDialog open={!!medicationToDelete} onOpenChange={(open) => {
  if (!open) setMedicationToDelete(null)
}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('medications.deleteInventoryItem')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('medications.deleteConfirm', { name: medicationToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMedicationToDelete(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmDelete(); setMedicationToDelete(null); }} className="bg-red-600 hover:bg-red-700">
              {t('medications.deleteItem')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}

export default Medications;
