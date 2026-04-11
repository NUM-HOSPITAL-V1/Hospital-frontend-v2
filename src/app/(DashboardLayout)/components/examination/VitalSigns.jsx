import React from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField } from '@mui/material';

const VitalSigns = ({ formData, onChange }) => {
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
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Амин үзүүлэлт</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Биеийн халуун (°C)"
                name="temperature"
                value={formData.temperature}
                onChange={onChange}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Цусны даралт (mmHg)"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={onChange}
                required
                fullWidth
                size="small"
                placeholder="120/80"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Зүрхний цохилт (удаа/мин)"
                name="heartRate"
                value={formData.heartRate}
                onChange={onChange}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Амьсгалын хэмнэл (удаа/мин)"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={onChange}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Жин (кг)"
                name="weight"
                value={formData.weight}
                onChange={onChange}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Өндөр (см)"
                name="height"
                value={formData.height}
                onChange={onChange}
                required
                fullWidth
                size="small"
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

export default VitalSigns;
