import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import examinationService from '../../../service/examinationService';
import vitalService from '../../../service/vitalService';
import prescriptionService from '../../../service/prescriptionService';

const DEFAULT_VITALS = {
  temperature: '-',
  bloodPressure: '-',
  heartRate: '-',
  respiratoryRate: '-',
  weight: '-',
  height: '-',
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const mapExamType = (exam) => {
  if (exam.exam_type) return exam.exam_type;
  const typeMap = {
    Initial: 'Анхан',
    'Follow-up': 'Давтан',
    Preventive: 'Сэргийлэх',
    'Active Monitoring': 'Хяналт',
    'Home Visit': 'Гэрийн үзлэг',
    'House Call': 'Дуудлага',
  };
  return typeMap[exam.doctors_examination] || exam.doctors_examination || 'Үзлэг';
};

const mapStatus = (status) => {
  const statusMap = {
    Ongoing: 'Хийгдэж буй',
    Done: 'Дууссан',
    Todo: 'Хүлээгдэж буй',
  };
  return statusMap[status] || status || 'Хийгдэж буй';
};

const getPatientId = (patient) => patient?._id || patient?.id || patient;

const getDoctorName = (exam) => {
  const doctor = exam?.doctor || exam?.medicalStaff || exam?.createdBy;
  if (!doctor) return 'Тодорхойгүй';
  const name = [doctor.lastname, doctor.firstname].filter(Boolean).join(' ').trim();
  return name || doctor.name || doctor.email || 'Тодорхойгүй';
};

const getClosestVitals = (exam, vitals) => {
  if (!Array.isArray(vitals) || vitals.length === 0) {
    return DEFAULT_VITALS;
  }

  const examTime = new Date(exam.exam_date || exam.createdAt).getTime();
  const sortedVitals = vitals
    .filter((item) => item)
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.date || a.createdAt || 0).getTime();
      const bTime = new Date(b.date || b.createdAt || 0).getTime();
      return Math.abs(aTime - examTime) - Math.abs(bTime - examTime);
    });

  const vital = sortedVitals[0];
  if (!vital) {
    return DEFAULT_VITALS;
  }

  const systolic = vital.right_systolic ?? vital.left_systolic;
  const diastolic = vital.right_diastolic ?? vital.left_diastolic;

  return {
    temperature: vital.temperature ?? '-',
    bloodPressure: systolic && diastolic ? `${systolic}/${diastolic}` : '-',
    heartRate: vital.right_heart_rate ?? vital.left_heart_rate ?? '-',
    respiratoryRate: vital.respiration_rate ?? '-',
    weight: vital.weight ?? '-',
    height: vital.height ?? '-',
  };
};

const getPrescriptionNotes = (exam, guides = []) => {
  const guideText = guides
    .map((guide) => guide?.description || guide?.name || '')
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return guideText || exam.reason || 'Тэмдэглэл байхгүй';
};

const transformHistoryItem = (exam, vitals, medications = [], guides = []) => ({
  id: exam._id,
  date: formatDate(exam.exam_date || exam.createdAt),
  doctor: getDoctorName(exam),
  diagnosis: exam.illness || exam.reason || 'Онош бүртгэгдээгүй',
  diagnosisCode: exam.diagnosis?.code || '',
  type: mapExamType(exam),
  status: mapStatus(exam.status),
  vitals: getClosestVitals(exam, vitals),
  prescriptions: medications.map((item) => ({
    name: item.name || 'Эмийн нэргүй',
    dosage: item.dose || '-',
    frequency: item.frequency || '-',
    duration: item.description || '-',
  })),
  notes: getPrescriptionNotes(exam, guides),
});

// Row component for expandable table
const HistoryRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <TableRow 
        hover
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' },
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            {row.date}
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>{row.doctor}</TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {row.diagnosis}
            {row.diagnosisCode ? (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({row.diagnosisCode})
              </Typography>
            ) : null}
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Chip 
            label={row.type} 
            size="small" 
            color={row.type === 'Анхан' ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{ borderRadius: '4px', minWidth: 70, textAlign: 'center' }}
          />
        </TableCell>
        <TableCell sx={{ py: 1.5 }}>
          <Chip 
            label={row.status} 
            size="small" 
            color={row.status === 'Дууссан' ? 'success' : 'info'}
            sx={{ borderRadius: '4px', minWidth: 90, textAlign: 'center' }}
          />
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3, px: 2 }}>
              <Grid container spacing={3}>
                {/* Vitals */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MonitorHeartOutlinedIcon sx={{ color: 'primary.main', fontSize: 20, mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="600">Амин үзүүлэлт</Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Биеийн халуун:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.temperature === '-' ? '-' : `${row.vitals.temperature}°C`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Цусны даралт:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.bloodPressure === '-' ? '-' : `${row.vitals.bloodPressure} mmHg`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Зүрхний цохилт:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.heartRate === '-' ? '-' : `${row.vitals.heartRate} удаа/мин`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Амьсгал:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.respiratoryRate === '-' ? '-' : `${row.vitals.respiratoryRate} удаа/мин`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Жин:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.weight === '-' ? '-' : `${row.vitals.weight} кг`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Өндөр:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {row.vitals.height === '-' ? '-' : `${row.vitals.height} см`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
                
                {/* Prescriptions */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MedicationOutlinedIcon sx={{ color: 'warning.main', fontSize: 20, mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="600">Эмийн жор</Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      {row.prescriptions.length > 0 ? (
                        row.prescriptions.map((prescription, index) => (
                          <Box key={index} sx={{ mb: index < row.prescriptions.length - 1 ? 1.5 : 0 }}>
                            <Typography variant="body2" fontWeight="medium">{prescription.name}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={prescription.dosage} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: '4px', height: 22 }}
                              />
                              <Chip 
                                label={prescription.frequency} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: '4px', height: 22 }}
                              />
                              <Chip 
                                label={prescription.duration} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: '4px', height: 22 }}
                              />
                            </Box>
                            {index < row.prescriptions.length - 1 && <Divider sx={{ my: 1 }} />}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">Эмийн жор байхгүй</Typography>
                      )}
                    </Paper>
                  </Box>
                </Grid>
                
                {/* Notes */}
                <Grid item xs={12}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AssignmentOutlinedIcon sx={{ color: 'success.main', fontSize: 20, mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="600">Тэмдэглэл</Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2">{row.notes}</Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const PatientMedicalHistory = ({ patient }) => {
  const [tabValue, setTabValue] = useState(0);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const patientId = getPatientId(patient);

    if (!patientId) {
      setMedicalHistory([]);
      setError('');
      return;
    }

    const loadMedicalHistory = async () => {
      try {
        setLoading(true);
        setError('');

        let examinationsResponse;
        try {
          examinationsResponse = await examinationService.getAllExaminations();
        } catch (allError) {
          examinationsResponse = await examinationService.getMyExaminations();
        }

        const allExams = Array.isArray(examinationsResponse?.data) ? examinationsResponse.data : [];
        const patientExams = allExams.filter((exam) => {
          const examPatientId = getPatientId(exam?.patient);
          return String(examPatientId || '') === String(patientId);
        });

        const [vitalResponse, prescriptionsResponse] = await Promise.all([
          vitalService.getPatientVitalSigns(patientId).catch(() => ({ data: [] })),
          prescriptionService.getPatientPrescriptions(patientId).catch(() => ({ data: [] })),
        ]);

        const vitals = Array.isArray(vitalResponse?.data) ? vitalResponse.data : [];
        const prescriptions = Array.isArray(prescriptionsResponse?.data) ? prescriptionsResponse.data : [];

        const medicalHistoryRows = await Promise.all(
          patientExams
            .slice()
            .sort((a, b) => new Date(b.exam_date || b.createdAt || 0) - new Date(a.exam_date || a.createdAt || 0))
            .map(async (exam) => {
              const matchingPrescription = prescriptions.find((item) => {
                const itemExamId = item?.examination_id?._id || item?.examination_id;
                return String(itemExamId || '') === String(exam._id || '');
              });

              if (!matchingPrescription?._id) {
                return transformHistoryItem(exam, vitals);
              }

              const [medicationsResponse, guidesResponse] = await Promise.all([
                prescriptionService.getPrescriptionMedications(matchingPrescription._id).catch(() => ({ data: [] })),
                prescriptionService.getPrescriptionGuides(matchingPrescription._id).catch(() => ({ data: [] })),
              ]);

              const medications = Array.isArray(medicationsResponse?.data) ? medicationsResponse.data : [];
              const guides = Array.isArray(guidesResponse?.data) ? guidesResponse.data : [];

              return transformHistoryItem(exam, vitals, medications, guides);
            })
        );

        setMedicalHistory(medicalHistoryRows);
      } catch (fetchError) {
        console.error('Error fetching medical history:', fetchError);
        setMedicalHistory([]);
        setError('Үзлэгийн түүх татахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    loadMedicalHistory();
  }, [patient]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2, 
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HistoryIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight="600">Үзлэгийн түүх</Typography>
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            mb: 2,
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { 
              minWidth: 100,
              fontSize: '0.875rem',
              textTransform: 'none',
              fontWeight: 500,
              py: 1.5
            } 
          }}
        >
          <Tab 
            label="Бүгд" 
            icon={<AssignmentOutlinedIcon fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>

        {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.5,
              p: 5,
            }}
          >
            <CircularProgress size={24} />
            <Typography color="text.secondary">Үзлэгийн түүх ачаалж байна...</Typography>
          </Box>
        ) : medicalHistory.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <TableCell width={50}></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Огноо</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Эмч</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Онош</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Төрөл</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Төлөв</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medicalHistory.map((history) => (
                  <HistoryRow key={history.id} row={history} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              p: 5, 
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <Typography color="text.secondary">Үзлэгийн түүх бүртгэгдээгүй байна</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientMedicalHistory;
