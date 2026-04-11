import { useEffect, useState } from 'react';
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
  TextField,
  Alert
} from '@mui/material';
import { IconCheck, IconClock, IconNotes, IconStethoscope } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import treatmentService from '@/app/service/treatmentService';

const TreatmentSchedule = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [notes, setNotes] = useState('');

  const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  };

  const mapStatus = (treatment) => {
    if (treatment.sessionsCompleted >= treatment.totalQuantity && treatment.totalQuantity > 0) {
      return 'Дууссан';
    }
    if (treatment.sessionsCompleted > 0) {
      return 'Хийгдэж буй';
    }
    return 'Хүлээгдэж буй';
  };

  const transformTreatment = (treatment) => ({
    id: treatment._id,
    patientName: `${treatment.patient?.lastname || ''} ${treatment.patient?.firstname || ''}`.trim(),
    patientId: treatment.patient?.register || treatment.patient?._id || '',
    department: treatment.diagnosisType === 'in' ? 'Хэвтэн' : 'Амбулатори',
    treatment: treatment.treatmentType || 'Тодорхойгүй',
    time: formatTime(treatment.date),
    status: mapStatus(treatment),
    notes: treatment.notes || '',
    raw: treatment,
  });

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await treatmentService.getAllTreatments();
      setTreatments((response?.data || []).map(transformTreatment));
    } catch (fetchError) {
      console.error('Error fetching nurse treatment schedule:', fetchError);
      setError(fetchError?.response?.data?.error || 'Эмчилгээний хуваарь татахад алдаа гарлаа');
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

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
  
  const handleUpdateTreatmentStatus = async (treatment, nextSessionsCompleted) => {
    try {
      setError('');
      const response = await treatmentService.updateTreatment(treatment.id, {
        sessionsCompleted: nextSessionsCompleted,
      });
      const updatedTreatment = transformTreatment(response?.data || {
        ...treatment.raw,
        sessionsCompleted: nextSessionsCompleted,
      });
      setTreatments((prev) => prev.map((item) => (
        item.id === treatment.id ? updatedTreatment : item
      )));
      if (selectedTreatment?.id === treatment.id) {
        setSelectedTreatment(updatedTreatment);
      }
    } catch (updateError) {
      console.error('Error updating nurse treatment schedule:', updateError);
      setError(updateError?.response?.data?.error || 'Эмчилгээний төлөв шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleSaveNotes = () => {
    // Here you would update the notes in your actual data
    console.log(`Saving notes for treatment ${selectedTreatment?.id}: ${notes}`);
    setOpenDialog(false);
  };

  return (
    <DashboardCard 
      title="Эмчилгээний хуваарь" 
      subtitle={loading ? 'Уншиж байна...' : `${treatments.length} эмчилгээ`}
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
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

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
            {(loading ? [] : filteredTreatments).map((treatment) => (
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
                        onClick={() => handleUpdateTreatmentStatus(
                          treatment,
                          Math.min((treatment.raw?.sessionsCompleted || 0) + 1, treatment.raw?.totalQuantity || 0)
                        )}
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
                        onClick={() => handleUpdateTreatmentStatus(
                          treatment,
                          treatment.raw?.totalQuantity || treatment.raw?.sessionsCompleted || 0
                        )}
                      >
                        Дуусгах
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredTreatments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Эмчилгээний мэдээлэл олдсонгүй
                </TableCell>
              </TableRow>
            ) : null}
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
