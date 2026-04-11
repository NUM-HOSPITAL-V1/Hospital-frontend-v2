import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PatientInfoCard from './PatientInfo';
import TreatmentTabs from './TreatmentTabs';


// Helper function for status chips
const getStatusColor = (status) => {
  switch (status) {
    case 'Хүлээгдэж буй':
      return 'warning';
    case 'Хийгдэж буй':
      return 'info';
    case 'Дууссан':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Хүлээгдэж буй':
      return <PendingIcon fontSize="small" />;
    case 'Хийгдэж буй':
      return <ScheduleIcon fontSize="small" />;
    case 'Дууссан':
      return <CheckCircleIcon fontSize="small" />;
    default:
      return null;
  }
};

const TreatmentDetailsDialog = ({
  open,
  onClose,
  treatment,
  tabValue,
  onTabChange,
  onAdministerMedication,
  onAdministerTreatment,
  onCompleteAll,
  onOpenNoteDialog,
  actionLoading = false,
}) => {
  if (!treatment) return null;

  const isCompleted = treatment.status === 'Дууссан';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Эмчилгээний дэлгэрэнгүй</Typography>
          <Chip
            label={treatment.status}
            size="small"
            color={getStatusColor(treatment.status)}
            icon={getStatusIcon(treatment.status)}
            sx={{ borderRadius: '4px', fontWeight: 500 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Patient Info */}
        <PatientInfoCard patient={treatment} />

        {/* Tabs */}
        <TreatmentTabs
          treatment={treatment}
          tabValue={tabValue}
          onTabChange={onTabChange}
          onAdministerMedication={onAdministerMedication}
          onAdministerTreatment={onAdministerTreatment}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onCompleteAll} 
          variant="contained" 
          color="primary"
          disabled={actionLoading || isCompleted}
        >
          {isCompleted ? 'Дууссан' : actionLoading ? 'Түр хүлээнэ үү...' : 'Бүх зүйлийг дуусгах'}
        </Button>
        <Button 
          onClick={onOpenNoteDialog} 
          variant="outlined" 
          startIcon={<NoteAddIcon />}
          disabled={actionLoading}
        >
          Тэмдэглэл нэмэх
        </Button>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={actionLoading}
        >
          Хаах
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TreatmentDetailsDialog;
