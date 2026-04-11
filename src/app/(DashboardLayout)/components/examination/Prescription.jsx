import React from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const PrescriptionTab = ({ formData, onChange }) => {
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
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Эмийн жор</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Эмийн мэдээлэл
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Эмийн нэр"
                name="medicationName"
                value={formData.medicationName || ''}
                onChange={onChange}
                fullWidth
                placeholder="Жишээ: Парацетамол"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Тун"
                name="medicationDose"
                value={formData.medicationDose || ''}
                onChange={onChange}
                fullWidth
                placeholder="Жишээ: 500мг"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Давтамж"
                name="medicationFrequency"
                value={formData.medicationFrequency || ''}
                onChange={onChange}
                fullWidth
                placeholder="Жишээ: Өдөрт 3 удаа"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Нэмэлт тайлбар"
                name="medicationDescription"
                value={formData.medicationDescription || ''}
                onChange={onChange}
                fullWidth
                placeholder="Хоолны дараа ууна"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Эмийн жорын тайлбар"
                name="prescriptionNotes"
                value={formData.prescriptionNotes}
                onChange={onChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Эмийн жорын нэмэлт тайлбар, зөвлөгөө..."
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

export default PrescriptionTab;
