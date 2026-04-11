import React from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField } from '@mui/material';

const TreatmentTab = ({ formData, onChange }) => {
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
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Эмчилгээний заавар</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Эмчилгээний заавар"
                name="treatmentInstructions"
                value={formData.treatmentInstructions}
                onChange={onChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Эмчилгээний заавар, зөвлөгөө оруулна уу..."
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
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Дэглэм
              </Typography>
              <TextField
                label="Зөвлөмжийн гарчиг"
                name="guideName"
                value={formData.guideName || ''}
                onChange={onChange}
                fullWidth
                placeholder="Жишээ: Хоолны дэглэм"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
              <TextField
                label="Дэглэмийн заавар"
                name="regimen"
                value={formData.regimen}
                onChange={onChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Өдөр тутмын дэглэм, хэрхэн мөрдөх талаар мэдээлэл оруулна уу..."
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

export default TreatmentTab;
