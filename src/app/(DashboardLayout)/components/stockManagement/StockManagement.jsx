'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import InventoryIcon from '@mui/icons-material/Inventory';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningIcon from '@mui/icons-material/Warning';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Import components


import StockTable from './comp/StockTable';

// Import dialogs


// Import constants and helpers
import { mockStockItems } from './constants';
import StockHeader from './comp/StockHeader';
import StatusSummary from './comp/StatusSummary';
import SearchAndFilter from './comp/SearchAndFilter';
import FilterDialog from './dialog/FilterDialog';
import AddItemDialog from './dialog/AddItemDialog';
import EditItemDialog from './dialog/EditItemDialog';
import DeleteConfirmationDialog from './dialog/DeleteDialog';
import StockTransactionDialog from './dialog/TransactionDialog'; // path нь зөв эсэхийг шалгаарай
import medicineService from '../../../service/medicineService';


const PharmacyStockManagement = ({ onOpenTransaction }) => {
  const router = useRouter();
  const [stockItems, setStockItems] = useState(mockStockItems);
  const [filteredItems, setFilteredItems] = useState(mockStockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const mapApiTypeToCategory = (type, category) => {
    if (category) return category;

    const typeMap = {
      medication: 'Эм',
      Supplies: 'Хэрэгсэл',
      Creams: 'Уусмал',
      'Emergency Items': 'Вакцин',
    };
    return typeMap[type] || 'Бусад';
  };

  const mapCategoryToApiType = (category) => {
    const categoryMap = {
      'Эм': 'medication',
      'Хэрэгсэл': 'Supplies',
      'Уусмал': 'Creams',
      'Вакцин': 'Emergency Items',
      'Бусад': 'Supplies',
    };
    return categoryMap[category] || 'medication';
  };

  const deriveStatus = (item) => {
    if (item.status) return item.status;
    if (Number(item.quantity) <= Number(item.reorderLevel || 0)) return 'Дахин захиалах';
    return 'Хангалттай';
  };

  const transformMedicineToStockItem = (medicine) => ({
    id: medicine._id,
    name: medicine.name || '',
    category: mapApiTypeToCategory(medicine.type, medicine.category),
    subCategory: medicine.subCategory || '',
    form: medicine.form || '',
    dosage: medicine.dosage || '',
    manufacturer: medicine.manufacturer || '',
    supplier: medicine.supplier || '',
    batchNumber: medicine.batchNumber || '',
    expiryDate: medicine.expiryDate || null,
    quantity: Number(medicine.quantity || 0),
    unit: medicine.unit || '',
    location: medicine.location || '',
    reorderLevel: Number(medicine.reorderLevel || 0),
    price: Number(medicine.price || 0),
    status: deriveStatus(medicine),
    description: medicine.description || '',
    lastUpdated: medicine.updatedAt || medicine.createdAt || null,
  });

  const buildMedicinePayload = (item) => ({
    name: item.name,
    type: mapCategoryToApiType(item.category),
    dosage: item.dosage || '',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    expiryDate: item.expiryDate,
    category: item.category || '',
    subCategory: item.subCategory || '',
    form: item.form || '',
    manufacturer: item.manufacturer || '',
    supplier: item.supplier || '',
    batchNumber: item.batchNumber || '',
    location: item.location || '',
    unit: item.unit || '',
    reorderLevel: Number(item.reorderLevel || 0),
    status: item.status || deriveStatus(item),
    description: item.description || '',
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineService.getAllMedicines();
      const medicines = Array.isArray(response?.data) ? response.data : [];
      const transformedItems = medicines.map(transformMedicineToStockItem);
      setStockItems(transformedItems);
      setSnackbar((prev) => ({ ...prev, open: false }));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || error?.message || 'Эмийн мэдээлэл татахад алдаа гарлаа',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // New item/edit item form state
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    category: 'Эм',
    subCategory: '',
    form: '',
    dosage: '',
    manufacturer: '',
    supplier: '',
    batchNumber: '',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year from now
    quantity: 0,
    unit: '',
    location: '',
    reorderLevel: 0,
    price: 0,
    status: 'Хангалттай',
    description: ''
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);
  
  // Filter items based on search and filters
  useEffect(() => {
    let result = stockItems;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          (item.batchNumber && item.batchNumber.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredItems(result);
  }, [stockItems, searchQuery, categoryFilter, statusFilter]);
  
  // Handle filter dialog
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  
  const applyFilters = () => {
    handleCloseFilterDialog();
  };
  
  // Handle item form changes
  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
    
    // Handle category-dependent dropdowns
    if (name === 'category') {
      setItemForm(prev => ({
        ...prev,
        subCategory: '',
        form: ''
      }));
    }
  };
  
  const handleExpiryDateChange = (date) => {
    setItemForm(prev => ({ ...prev, expiryDate: date }));
  };
  
  // Handle add new item
  const handleOpenAddDialog = () => {
    // Generate a new ID based on category
    const prefix = itemForm.category === 'Эм' ? 'MED-' : 'SUP-';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randomNum}`;
    
    // Reset form with new ID
    setItemForm({
      id: newId,
      name: '',
      category: 'Эм',
      subCategory: '',
      form: '',
      dosage: '',
      manufacturer: '',
      supplier: '',
      batchNumber: '',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      quantity: 0,
      unit: '',
      location: '',
      reorderLevel: 0,
      price: 0,
      status: 'Хангалттай',
      description: ''
    });
    
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleAddItem = () => {
    setLoading(true);
    
    // Validate form
    if (!itemForm.name || !itemForm.category) {
      setSnackbar({
        open: true,
        message: 'Шаардлагатай талбаруудыг бөглөнө үү',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    medicineService.createMedicine(buildMedicinePayload(itemForm))
      .then((response) => {
        const createdItem = transformMedicineToStockItem(response.data);
        setStockItems(prev => [...prev, createdItem]);
        setSnackbar({
          open: true,
          message: 'Бараа амжилттай нэмэгдлээ',
          severity: 'success'
        });
        setAddDialogOpen(false);
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: error?.response?.data?.error || error?.message || 'Бараа нэмэхэд алдаа гарлаа',
          severity: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Handle edit item
  const handleOpenEditDialog = (item) => {
    setSelectedItem(item);
    setItemForm({
      ...item,
      expiryDate: new Date(item.expiryDate)
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  
  const handleUpdateItem = () => {
    setLoading(true);
    
    // Validate form
    if (!itemForm.name || !itemForm.category) {
      setSnackbar({
        open: true,
        message: 'Шаардлагатай талбаруудыг бөглөнө үү',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    medicineService.updateMedicine(itemForm.id, buildMedicinePayload(itemForm))
      .then((response) => {
        const updatedItem = transformMedicineToStockItem(response.data);
        setStockItems(prev => 
          prev.map(item => item.id === updatedItem.id ? updatedItem : item)
        );
        setSnackbar({
          open: true,
          message: 'Бараа амжилттай шинэчлэгдлээ',
          severity: 'success'
        });
        setEditDialogOpen(false);
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: error?.response?.data?.error || error?.message || 'Бараа шинэчлэхэд алдаа гарлаа',
          severity: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Handle delete item
  const handleOpenDeleteDialog = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteItem = () => {
    setLoading(true);
    
    medicineService.deleteMedicine(selectedItem.id)
      .then(() => {
        setStockItems(prev => prev.filter(item => item.id !== selectedItem.id));
        setSnackbar({
          open: true,
          message: 'Бараа амжилттай устгагдлаа',
          severity: 'success'
        });
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: error?.response?.data?.error || error?.message || 'Бараа устгахад алдаа гарлаа',
          severity: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle back button
  const handleBack = () => {
    router.push('/dashboard');
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      {/* Header */}
      <StockHeader onAddItem={handleOpenAddDialog} onBack={handleBack} />
      
      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Tab 
          icon={<InventoryIcon />} 
          iconPosition="start"
          label="Бүх бараа" 
          sx={{ textTransform: 'none' }}
        />
        
      </Tabs>
      
      {/* Status summary */}
      <StatusSummary stockItems={stockItems} />
      
      {/* Search and filter */}
      <SearchAndFilter 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onOpenFilterDialog={handleOpenFilterDialog}
      />
      
      {/* Items Table */}
      <StockTable 
        filteredItems={filteredItems}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
      />
      
      {/* Filter Dialog */}
      <FilterDialog 
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onApply={applyFilters}
      />
      
      {/* Add Item Dialog */}
      <AddItemDialog 
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        loading={loading}
        itemForm={itemForm}
        handleItemFormChange={handleItemFormChange}
        handleExpiryDateChange={handleExpiryDateChange}
        onAdd={handleAddItem}
      />
      
      {/* Edit Item Dialog */}
      <EditItemDialog 
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        loading={loading}
        itemForm={itemForm}
        selectedItem={selectedItem}
        handleItemFormChange={handleItemFormChange}
        handleExpiryDateChange={handleExpiryDateChange}
        onUpdate={handleUpdateItem}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        selectedItem={selectedItem}
        loading={loading}
        onDelete={handleDeleteItem}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Export both components
export { PharmacyStockManagement, StockTransactionDialog };
export default PharmacyStockManagement;
