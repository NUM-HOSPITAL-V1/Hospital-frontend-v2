import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { IconCheck, IconClock, IconNotes, IconStethoscope } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

// TODO: Nurse/medical staff dashboard дээрх хуваарийг API-аар сольж авах
const treatments = [];

const TreatmentSchedule = () => {
  const [filter, setFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [notes, setNotes] = useState('');

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Дууссан':
        return 'success';
      case 'Хийгдэж буй':
        return 'warning';
      case 'Хүлээгдэж буй':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Дууссан':
        return <IconCheck size={16} />;
      case 'Хийгдэж буй':
        return <IconStethoscope size={16} />;
      case 'Хүлээгдэж буй':
        return <IconClock size={16} />;
      default:
        return null;
    }
  };
  
  const filteredTreatments = treatments.filter(treatment => {
    if (filter === 'all') return true;
    return treatment.status === filter;
  });
  
  const handleOpenNotes = (treatment) => {
    setSelectedTreatment(treatment);
    setNotes(treatment.notes);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleSaveNotes = () => {
    // Here you would update the notes in your actual data
    console.log(`Saving notes for treatment ${selectedTreatment?.id}: ${notes}`);
    setOpenDialog(false);
  };

  return (
    <DashboardCard 
      title="Эмчилгээний хуваарь" 
      subtitle={`${treatments.length} эмчилгээ өнөөдөр`}
      action={
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Төлөв</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Төлөв"
          >
            <MenuItem value="all">Бүгд</MenuItem>
            <MenuItem value="Хүлээгдэж буй">Хүлээгдэж буй</MenuItem>
            <MenuItem value="Хийгдэж буй">Хийгдэж буй</MenuItem>
            <MenuItem value="Дууссан">Дууссан</MenuItem>
          </Select>
        </FormControl>
      }
    >
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }} aria-label="treatment schedule table">
          <TableHead>
            <TableRow>
              <TableCell>Үйлчлүүлэгч</TableCell>
              <TableCell>Эмчилгээ</TableCell>
              <TableCell>Цаг</TableCell>
              <TableCell>Төлөв</TableCell>
              <TableCell align="center">Үйлдэл</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTreatments.map((treatment) => (
              <TableRow key={treatment.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {treatment.patientName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID: {treatment.patientId} | {treatment.department}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{treatment.treatment}</TableCell>
                <TableCell>{treatment.time}</TableCell>
                <TableCell>
                  <Chip 
                    icon={getStatusIcon(treatment.status)}
                    label={treatment.status} 
                    size="small"
                    color={getStatusColor(treatment.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <IconButton color="primary" onClick={() => handleOpenNotes(treatment)}>
                      <Badge badgeContent=" " variant="dot" color="secondary" invisible={!treatment.notes}>
                        <IconNotes size={20} />
                      </Badge>
                    </IconButton>
                    {treatment.status === 'Хүлээгдэж буй' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      >
                        Эхлүүлэх
                      </Button>
                    )}
                    {treatment.status === 'Хийгдэж буй' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      >
                        Дуусгах
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Эмчилгээний тэмдэглэл</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Тэмдэглэл"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Хаах</Button>
          <Button onClick={handleSaveNotes} color="primary">Хадгалах</Button>
        </DialogActions>
      </Dialog>
    </DashboardCard>
  );
};

export default TreatmentSchedule;