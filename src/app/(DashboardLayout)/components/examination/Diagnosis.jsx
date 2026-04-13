import React from 'react';
import { 
  Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Typography, Grid, TextField,
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
  onDiagnosisInputChange,
  diagnosisQuery,
  diagnosisLoading,
  diagnosisError,
  onActionChange, 
  diagnosisOptions,
  selectedDiagnosis,
  actionOptions 
}) => {
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
                inputValue={diagnosisQuery}
                loading={diagnosisLoading}
                filterOptions={(options) => options}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return [option.code, option.name].filter(Boolean).join(' - ');
                }}
                onChange={onDiagnosisChange}
                onInputChange={onDiagnosisInputChange}
                noOptionsText={
                  diagnosisQuery.trim().length < 2
                    ? 'Хамгийн багадаа 2 тэмдэгт оруулна уу'
                    : 'Тохирох онош олдсонгүй'
                }
                loadingText="ICD-10 онош хайж байна..."
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id || option.code}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {[option.code, option.name].filter(Boolean).join(' - ')}
                      </Typography>
                      {option.detail ? (
                        <Typography variant="caption" color="text.secondary">
                          {option.detail}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Онош хайх"
                    placeholder="ICD-10 код, нэр эсвэл түлхүүр үг"
                    required
                    size="small"
                    fullWidth
                    helperText="Кодоор, нэрээр, эсвэл хэсэгчилсэн үгээр хайна"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {diagnosisLoading ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            {diagnosisError ? (
              <Grid item xs={12}>
                <Alert severity="warning">{diagnosisError}</Alert>
              </Grid>
            ) : null}
            {selectedDiagnosis ? (
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'success.light',
                    bgcolor: 'success.50',
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Сонгосон ICD-10 онош
                      </Typography>
                      <Chip
                        size="small"
                        color="success"
                        label={selectedDiagnosis.source || 'icd10'}
                        variant="outlined"
                      />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body1" fontWeight={600}>
                      {[selectedDiagnosis.code, selectedDiagnosis.name].filter(Boolean).join(' - ')}
                    </Typography>
                    {selectedDiagnosis.detail ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        {selectedDiagnosis.detail}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            ) : null}
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
                label="Оношийн нэмэлт тэмдэглэл"
                name="diagnosisNote"
                value={formData.diagnosisNote}
                onChange={onChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Жишээ: Баруун доод дэлбэнд сэжигтэй хатгалгаа"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Үзлэгийн ерөнхий тэмдэглэл"
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
