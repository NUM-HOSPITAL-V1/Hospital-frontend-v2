import React from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, TextField, 
  FormControl, InputLabel, Select, MenuItem, Autocomplete 
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const DiagnosisTab = ({ 
  formData, 
  onChange, 
  onDateChange, 
  onDiagnosisChange, 
  onActionChange, 
  diagnosisOptions, 
  actionOptions 
}) => {
  const selectedDiagnosis =
    diagnosisOptions.find((option) => option.code === formData.diagnosisCode)
    || diagnosisOptions.find((option) => option.label === formData.diagnosis)
    || null;

  const selectedAction =
    actionOptions.find((option) => option.code === formData.actionCode)
    || actionOptions.find((option) => option.label === formData.action)
    || null;

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2, 
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Үзлэг, оношилгоо</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Үзлэгийн өдөр"
                  value={formData.date}
                  onChange={onDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: "small", 
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                        },
                      }
                    } 
                  }}
                  format="yyyy-MM-dd"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              >
                <InputLabel>Үзлэгийн төрөл</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={onChange}
                  label="Үзлэгийн төрөл"
                >
                  <MenuItem value="Анхан">Анхан</MenuItem>
                  <MenuItem value="Давтан">Давтан</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              >
                <InputLabel>Төлөв</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={onChange}
                  label="Төлөв"
                >
                  <MenuItem value="Хийгдэж буй">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', color: 'info.main' }}>
                        <HourglassEmptyIcon fontSize="small" />
                      </Box>
                      <Typography>Хийгдэж буй</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Дууссан">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', color: 'success.main' }}>
                        <CheckCircleOutlineIcon fontSize="small" />
                      </Box>
                      <Typography>Дууссан</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={diagnosisOptions}
                value={selectedDiagnosis}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                getOptionLabel={(option) => `${option.code} - ${option.label}`}
                onChange={onDiagnosisChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Онош"
                    required
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={actionOptions}
                value={selectedAction}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                getOptionLabel={(option) => `${option.code} - ${option.label}`}
                onChange={onActionChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Хийсэн ажилбар"
                    required
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Тэмдэглэл"
                name="notes"
                value={formData.notes}
                onChange={onChange}
                multiline
                rows={4}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiagnosisTab;
