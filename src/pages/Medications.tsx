"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash, Search, FileSpreadsheet, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { localStorageService, type Medication } from "@/services/localStorageService"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import { exportToExcel, type ExcelColumn } from "@/utils/excelUtils"
import { AppPagination } from "../components/ui/AppPagination"
const Medications = () => {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    stockQuantity: 0,
    unitPrice: 0,
    category: "",
    expiryDate: "",
    imageUrl: "",
    categoryInput: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const pageSize = 12

  useEffect(() => {
    fetchMedications()
  }, [])

  // Reset to first page on search/filter
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, filterStatus, itemsPerPage])

  const fetchMedications = () => {
    try {
      const data = localStorageService.getMedications()
      setMedications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const categoryValue = formData.category === "other" ? formData.categoryInput : formData.category
      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        stockQuantity: Number(formData.stockQuantity),
        unitPrice: Number(formData.unitPrice),
        category: categoryValue,
        expiryDate: formData.expiryDate,
        imageUrl: formData.imageUrl,
      }

      if (editingMedication) {
        localStorageService.updateMedication(editingMedication.id, medicationData)
        toast({
          title: "Success",
          description: "Medication updated successfully",
        })
      } else {
        localStorageService.createMedication(medicationData)
        toast({
          title: "Success",
          description: "Medication added successfully",
        })
      }

      setDialogOpen(false)
      setEditingMedication(null)
      resetForm()
      fetchMedications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      stockQuantity: 0,
      unitPrice: 0,
      category: "",
      expiryDate: "",
      imageUrl: "",
      categoryInput: "",
    })
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormData({
      name: medication.name,
      dosage: medication.dosage || "",
      stockQuantity: medication.stockQuantity,
      unitPrice: medication.unitPrice || 0,
      category: medication.category || "",
      expiryDate: medication.expiryDate || "",
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
    try {
      localStorageService.deleteMedication(medicationToDelete.id)
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      })
      fetchMedications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      })
    }
    setMedicationToDelete(null)
  }

  const openAddDialog = () => {
    setEditingMedication(null)
    resetForm()
    setDialogOpen(true)
  }

  const getStockStatus = (medication: Medication) => {
    const { stockQuantity } = medication
    if (stockQuantity === 0) {
      return {
        text: "Out of Stock",
        color: "bg-red-50 text-red-600 border-red-200",
        icon: XCircle,
        iconColor: "text-red-500",
        dotColor: "bg-red-500",
      }
    }
    if (stockQuantity < 10) {
      return {
        text: "Low Stock",
        color: "bg-amber-50 text-amber-600 border-amber-200",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        dotColor: "bg-amber-500",
      }
    }
    return {
      text: "In Stock",
      color: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-500",
      dotColor: "bg-green-500",
    }
  }

  const categories = Array.from(new Set(medications.map((med) => med.category).filter(Boolean)))

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch =
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medication.dosage && medication.dosage.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === "all" || medication.category === filterCategory
    const status = getStockStatus(medication)
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "low" && status.text === "Low Stock") ||
      (filterStatus === "out" && status.text === "Out of Stock") ||
      (filterStatus === "normal" && status.text === "In Stock")
    return matchesSearch && matchesCategory && matchesStatus
  })

  const paginatedMedications = filteredMedications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExportExcel = () => {
    try {
      const columns: ExcelColumn[] = [
        { key: "name", header: "Medication Name", width: 25 },
        { key: "dosage", header: "Dosage", width: 15 },
        { key: "stockQuantity", header: "Stock Quantity", width: 15 },
        { key: "unitPrice", header: "Unit Price", width: 15 },
        { key: "category", header: "Category", width: 20 },
        { key: "expiryDate", header: "Expiry Date", width: 15 },
        { key: "status", header: "Status", width: 15 },
      ]

      const exportData = filteredMedications.map((medication) => ({
        name: medication.name,
        dosage: medication.dosage || "",
        stockQuantity: medication.stockQuantity,
        unitPrice: medication.unitPrice || 0,
        category: medication.category || "",
        expiryDate: medication.expiryDate || "",
        status: getStockStatus(medication).text,
      }))

      exportToExcel(exportData, "medications", columns, "Medications")

      toast({
        title: "Success",
        description: "Medications data exported to Excel successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export medications data to Excel",
        variant: "destructive",
      })
    }
  }

  // Calculate summary stats
  const totalValue = medications.reduce((sum, med) => sum + (med.unitPrice || 0) * (med.stockQuantity || 0), 0)
  const totalItems = medications.length
  const lowStockCount = medications.filter((med) => med.stockQuantity > 0 && med.stockQuantity < 10).length
  const outOfStockCount = medications.filter((med) => med.stockQuantity === 0).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Package className="animate-spin w-6 h-6 text-blue-500" />
          <span className="text-gray-600">{t('loadingMedications')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('medications.title')}</h1>
            <p className="text-gray-600 mt-1">{t('medications.subtitle')}</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {filteredMedications.length} {t('medications.items')}
          </Badge>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md rounded-xl">
            <CardContent className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 mb-2">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4m8-4h-4m-8 0H4" /></svg>
              </div>
              <span className="text-xs text-gray-500">{t('medications.totalValue')}</span>
              <span className="text-lg font-bold text-green-700 mt-1">${totalValue.toLocaleString()}</span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md rounded-xl">
            <CardContent className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 mb-2">
                <Package className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-xs text-gray-500">{t('medications.totalItems')}</span>
              <span className="text-lg font-bold text-blue-700 mt-1">{totalItems}</span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-md rounded-xl">
            <CardContent className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-200 mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-xs text-gray-500">{t('medications.lowStock')}</span>
              <span className="text-lg font-bold text-amber-700 mt-1">{lowStockCount}</span>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-md rounded-xl">
            <CardContent className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-200 mb-2">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
              <span className="text-xs text-gray-500">{t('medications.outOfStock')}</span>
              <span className="text-lg font-bold text-red-700 mt-1">{outOfStockCount}</span>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('medications.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('medications.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('medications.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('medications.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('medications.allStatus')}</SelectItem>
                  <SelectItem value="normal">{t('inStock')}</SelectItem>
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
                  <Button onClick={openAddDialog} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addMedication')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingMedication ? t('medications.editMedication') : t('medications.addNewMedication')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('medications.name')}</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dosage">{t('dosage')}</Label>
                        <Input
                          id="dosage"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          placeholder={t('medications.dosagePlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">{t('stockQuantity')}</Label>
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
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">{t('medications.category')}</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('medications.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                            <SelectItem value="Antibiotics">{t('medications.antibiotics')}</SelectItem>
                            <SelectItem value="Pain Relief">{t('medications.painRelief')}</SelectItem>
                            <SelectItem value="Vitamins">{t('medications.vitamins')}</SelectItem>
                            <SelectItem value="other">{t('medications.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.category === "other" && (
                          <Input
                            placeholder={t('medications.enterNewCategory')}
                            value={formData.categoryInput}
                            onChange={(e) => setFormData({ ...formData, categoryInput: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">{t('medications.expiryDate')}</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">{t('medications.productImage')}</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                      {formData.imageUrl && (
                        <img
                          src={formData.imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-2 h-20 w-20 object-cover rounded border"
                        />
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit">{editingMedication ? t('common.update') : t('common.add')} {t('medications.medication')}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredMedications.length === 0 ? (
          <Card className="border-dashed border-2 bg-white text-center py-16">
            <CardContent className="flex flex-col items-center justify-center">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? t('medications.noMedicationsFound') : t('medications.noMedicationsYet')}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? t('medications.noMedicationsMatch') + ` "${searchTerm}"`
                  : t('medications.startBuildingInventory')}
              </p>
              {!searchTerm && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('medications.addFirstMedication')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedMedications.map((medication) => {
                const stockStatus = getStockStatus(medication)

                return (
                  <Card
                    key={medication.id}
                    className="group hover:shadow-md transition-all duration-200 bg-white border border-gray-200"
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm">{medication.name}</h3>
                          {medication.dosage && <p className="text-xs text-gray-500 mt-1">{medication.dosage}</p>}
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(medication)}
                            className="h-7 w-7 p-0 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(medication)}
                            className="h-7 w-7 p-0 hover:bg-red-50"
                          >
                            <Trash className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Image */}
                      {medication.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={medication.imageUrl || "/placeholder.svg"}
                            alt={medication.name}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                        </div>
                      )}

                      {/* Stock Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${stockStatus.dotColor}`}></div>
                          <span className="text-xs font-medium text-gray-700">{stockStatus.text}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{medication.stockQuantity}</span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-gray-600">
                        {medication.category && (
                          <div className="flex justify-between">
                            <span>{t('medications.category')}:</span>
                            <span className="font-medium text-gray-900">{medication.category}</span>
                          </div>
                        )}
                        {medication.unitPrice && (
                          <div className="flex justify-between">
                            <span>{t('medications.unitPrice')}:</span>
                            <span className="font-medium text-green-600">${medication.unitPrice}</span>
                          </div>
                        )}
                        {medication.expiryDate && (
                          <div className="flex justify-between">
                            <span>{t('medications.expires')}:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(medication.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="mt-4 flex justify-center">
              <AppPagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredMedications.length}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        <AlertDialog
          open={!!medicationToDelete}
          onOpenChange={(open) => {
            if (!open) setMedicationToDelete(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('medications.deleteMedication')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('medications.deleteMedicationConfirm') + (medicationToDelete?.name ? ` "${medicationToDelete.name}"` : '')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default Medications
