import React from 'react';
import { 
  Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Box, Chip, IconButton, 
  Tooltip, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

import { getStatusColor, getRowStyle, isLowStock, isNearExpiry } from '../helper';

const formatDateYMD = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  // Use UTC to avoid SSR/CSR timezone hydration mismatches
  return d.toISOString().slice(0, 10);
};

const StockTable = ({ 
  filteredItems, 
  page, 
  rowsPerPage, 
  handleChangePage, 
  handleChangeRowsPerPage, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, flexGrow: 1 }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Нэр</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Төрөл</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Тун/Хэмжээ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Хугацаа</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Үлдэгдэл</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Нэгж үнэ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Төлөв</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Сүүлд шинэчилсэн</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow 
                    key={item.id} 
                    hover
                    sx={getRowStyle(item)}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.name}
                        {isLowStock(item) && (
                          <Tooltip title="Нөөц бага байна">
                            <WarningIcon 
                              color="error" 
                              fontSize="small" 
                              sx={{ ml: 1 }} 
                            />
                          </Tooltip>
                        )}
                        {isNearExpiry(item) && (
                          <Tooltip title="Хугацаа дуусах дөхөж байна">
                            <WarningIcon 
                              color="warning" 
                              fontSize="small" 
                              sx={{ ml: 1 }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.dosage ? `${item.dosage}, ${item.form}` : item.form}
                    </TableCell>
                    <TableCell>{formatDateYMD(item.expiryDate)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={isLowStock(item) ? 600 : 400} color={isLowStock(item) ? 'error.main' : 'inherit'}>
                        {item.quantity} {item.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', maximumFractionDigits: 0 }).format(item.price)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={getStatusColor(item.status)}
                        sx={{ borderRadius: '4px' }} 
                      />
                    </TableCell>
                    <TableCell>{formatDateYMD(item.lastUpdated)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(item)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onDelete(item)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Бараа олдсонгүй
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredItems.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Хуудсанд:"
        />
      </CardContent>
    </Card>
  );
};

export default StockTable;