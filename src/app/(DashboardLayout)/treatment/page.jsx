'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchBar from '../components/treatment/SearchBar';
import StatusSummary from '../components/treatment/StatusSummary';
import TreatmentTable from '../components/treatment/TreatmentTable';
import FilterDialog from '../components/treatment/FilterDialog';
import TreatmentDetailsDialog from '../components/treatment/TreatmentDetailsDialog';
import AddNoteDialog from '../components/treatment/AddNoteDialog';
import PageHeader from '../components/treatment/PageHeader';
import treatmentService from '../../service/treatmentService';
import prescriptionService from '../../service/prescriptionService';

const TreatmentListPage = () => {
  const router = useRouter();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date());
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('USER') || 'null');
    } catch (parseError) {
      return null;
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

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

  const getTreatmentDisplayName = (treatment, guideName) => {
    if (guideName && String(guideName).trim()) {
      return String(guideName).trim();
    }

    const rawType = String(treatment.treatmentType || '').trim();
    if (rawType && rawType !== 'Uvch' && rawType !== 'Emchilgee') {
      return rawType;
    }

    const procedureName = treatment.examination_id?.surgery;
    if (procedureName && String(procedureName).trim()) {
      return String(procedureName).trim();
    }

    return 'Эмчилгээ';
  };

  const transformTreatment = (treatment, details = {}) => {
    const medications = Array.isArray(details.medications) ? details.medications : [];
    const guides = Array.isArray(details.guides) ? details.guides : [];
    const primaryGuide = guides[0];
    const treatmentName = getTreatmentDisplayName(treatment, primaryGuide?.name);
    const instructionText = guides
      .map((guide) => [guide.name, guide.description].filter(Boolean).join('\n'))
      .filter(Boolean)
      .join('\n\n');

    return {
      id: treatment._id,
      patientName: `${treatment.patient?.lastname || ''} ${treatment.patient?.firstname || ''}`.trim(),
      patientId: treatment.patient?.register || treatment.patient?._id || '',
      diagnosis: treatment.examination_id?.illness || (treatment.diagnosisType === 'in' ? 'Хэвтэн эмчлүүлэх' : 'Амбулатори'),
      doctorName: `${treatment.medicalStaff?.lastname || ''} ${treatment.medicalStaff?.firstname || ''}`.trim(),
      scheduledDate: formatDate(treatment.date),
      scheduledTime: formatTime(treatment.date),
      status: mapStatus(treatment),
      raw: treatment,
      prescribedMedications: medications.map((medication) => ({
        id: medication._id,
        name: medication.name || 'Эм',
        dosage: medication.dose || '-',
        frequency: medication.frequency || '-',
        duration: medication.description || '-',
        status: 'Хүлээгдэж буй',
      })),
      prescribedTreatments: [
        {
          id: treatment._id,
          name: treatmentName,
          details: treatment.examination_id?.reason || treatment.examination_id?.exam_type || 'Үзлэгтэй холбоотой',
          duration: `${treatment.totalQuantity || 0} удаа`,
          frequency: treatment.frequency || '-',
          days: treatment.treatmentDays ? `${treatment.treatmentDays} өдөр` : '-',
          status: mapStatus(treatment),
          totalSessions: treatment.totalQuantity || 0,
          currentSessions: treatment.sessionsCompleted || 0,
        },
      ],
      instructions: instructionText || treatment.examination_id?.reason || '',
    };
  };

  const getTreatmentId = (treatment) => treatment?._id || treatment?.id || '';

  const buildTreatmentUpdatePayload = (treatment, sessionsCompleted) => {
    const totalQuantity = Number(treatment?.totalQuantity || 0);
    const normalizedSessions = totalQuantity > 0
      ? Math.min(Number(sessionsCompleted || 0), totalQuantity)
      : Number(sessionsCompleted || 0);

    return {
      sessionsCompleted: normalizedSessions,
      status: totalQuantity > 0 && normalizedSessions >= totalQuantity ? 'Done' : 'Ongoing',
    };
  };

  const applyUpdatedTreatment = (responseData, fallbackRaw) => {
    const nextRaw = responseData || fallbackRaw;
    const transformed = transformTreatment(nextRaw);
    setSelectedTreatment(transformed);
    setTreatments((prev) => prev.map((item) => (
      item.id === transformed.id ? transformed : item
    )));
  };

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError('');
      const currentUser = getCurrentUser();
      const userRole = currentUser?.user?.role;
      const userPosition = currentUser?.user?.position;
      const shouldLoadAllTreatments = userRole === 'Admin' || userPosition === 'Nurse';
      const response = shouldLoadAllTreatments
        ? await treatmentService.getAllTreatments()
        : await treatmentService.getMyTreatments();
      setTreatments((response?.data || []).map(transformTreatment));
    } catch (fetchError) {
      console.error('Error fetching treatments:', fetchError);
      setError(fetchError?.response?.data?.error || 'Эмчилгээний мэдээлэл татахад алдаа гарлаа');
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  // Filter handlers
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleDateFilterChange = (date) => {
    setDateFilter(date);
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const applyFilters = () => {
    handleCloseFilterDialog();
    console.log('Filters applied:', { statusFilter, dateFilter });
  };

  const filteredTreatments = treatments.filter((treatment) => {
    // Фильтр төлөвөөр
    if (statusFilter !== 'all' && treatment.status !== statusFilter) {
      return false;
    }
    // Хайлт query-аар
    const searchLower = searchQuery.toLowerCase();
    return (
      treatment.patientName.toLowerCase().includes(searchLower) ||
      treatment.patientId.toLowerCase().includes(searchLower) ||
      treatment.diagnosis.toLowerCase().includes(searchLower)
    );
  });

  // Detail dialog functions
  const handleViewDetails = async (treatment) => {
    try {
      setError('');
      const response = await treatmentService.getTreatmentById(treatment.id);
      const detailedTreatment = response?.data || treatment.raw || treatment;
      const patientId = detailedTreatment?.patient?._id || detailedTreatment?.patient;
      const examinationId = detailedTreatment?.examination_id?._id || detailedTreatment?.examination_id;

      let medications = [];
      let guides = [];

      if (patientId && examinationId) {
        const prescriptionsResponse = await prescriptionService.getPatientPrescriptions(patientId);
        const prescriptions = Array.isArray(prescriptionsResponse?.data) ? prescriptionsResponse.data : [];
        const matchingPrescription = prescriptions.find((item) => {
          const itemExamId = item?.examination_id?._id || item?.examination_id;
          return String(itemExamId || '') === String(examinationId);
        });

        if (matchingPrescription?._id) {
          const [medicationsResponse, guidesResponse] = await Promise.all([
            prescriptionService.getPrescriptionMedications(matchingPrescription._id),
            prescriptionService.getPrescriptionGuides(matchingPrescription._id),
          ]);

          medications = Array.isArray(medicationsResponse?.data) ? medicationsResponse.data : [];
          guides = Array.isArray(guidesResponse?.data) ? guidesResponse.data : [];
        }
      }

      setSelectedTreatment(transformTreatment(detailedTreatment, { medications, guides }));
      setDetailsOpen(true);
      setTabValue(0);
    } catch (detailError) {
      console.error('Error fetching treatment details:', detailError);
      setError(detailError?.response?.data?.error || 'Эмчилгээний дэлгэрэнгүй татахад алдаа гарлаа');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleAdministerMedication = () => {};

  const handleAdministerTreatment = async (treatmentId) => {
    if (!selectedTreatment?.raw) {
      return;
    }

    const selectedTreatmentId = getTreatmentId(selectedTreatment.raw);
    if (!selectedTreatmentId || selectedTreatmentId !== treatmentId) {
      return;
    }

    const totalQuantity = selectedTreatment.raw.totalQuantity || 0;
    const currentSessions = selectedTreatment.raw.sessionsCompleted || 0;
    const nextSessionsCompleted = Math.min(currentSessions + 1, totalQuantity);

    try {
      setActionLoading(true);
      setError('');
      const payload = buildTreatmentUpdatePayload(selectedTreatment.raw, nextSessionsCompleted);
      const response = await treatmentService.updateTreatment(treatmentId, payload);
      applyUpdatedTreatment(response?.data, {
        ...selectedTreatment.raw,
        ...payload,
      });
    } catch (updateError) {
      console.error('Error updating treatment progress:', updateError);
      setError(updateError?.response?.data?.error || 'Эмчилгээний төлөв шинэчлэхэд алдаа гарлаа');
    } finally {
      setActionLoading(false);
    }
  };

  // Бүх үйлдлийг дуусгах
  const handleCompleteAll = async () => {
    if (!selectedTreatment?.raw) {
      return;
    }

    const treatmentId = getTreatmentId(selectedTreatment.raw);
    const totalQuantity = selectedTreatment.raw.totalQuantity || 0;
    const payload = buildTreatmentUpdatePayload(
      selectedTreatment.raw,
      totalQuantity > 0 ? totalQuantity : selectedTreatment.raw.sessionsCompleted || 0
    );

    if (!treatmentId) {
      setError('Эмчилгээний ID олдсонгүй');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const response = await treatmentService.updateTreatment(treatmentId, payload);
      applyUpdatedTreatment(response?.data, {
        ...selectedTreatment.raw,
        ...payload,
      });
    } catch (updateError) {
      console.error('Error completing treatment:', updateError);
      setError(updateError?.response?.data?.error || 'Эмчилгээг дуусгахад алдаа гарлаа');
    } finally {
      setActionLoading(false);
    }
  };

  // Тэмдэглэл нэмэх dialog функцүүд
  const handleOpenNoteDialog = () => {
    setNoteDialogOpen(true);
  };

  const handleCloseNoteDialog = () => {
    setNoteDialogOpen(false);
  };

  const handleSaveNote = () => {
    console.log('Note saved:', noteText);
    handleCloseNoteDialog();
    setNoteText('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
        {/* Header */}
        <PageHeader 
          title="Сувилагчийн эмчилгээний хуудас"
          onBack={handleBack}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          onOpenFilterDialog={handleOpenFilterDialog}
        />

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {/* Search */}
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Status summary */}
        <StatusSummary treatments={treatments} />

        {/* Treatment list */}
        <TreatmentTable 
          treatments={loading ? [] : filteredTreatments}
          onViewDetails={handleViewDetails}
        />

        {/* Dialogs */}
        <FilterDialog 
          open={filterDialogOpen}
          onClose={handleCloseFilterDialog}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          onApplyFilters={applyFilters}
        />

        <TreatmentDetailsDialog 
          open={detailsOpen}
          onClose={handleCloseDetails}
          treatment={selectedTreatment}
          tabValue={tabValue}
          onTabChange={handleTabChange}
          onAdministerMedication={handleAdministerMedication}
          onAdministerTreatment={handleAdministerTreatment}
          onCompleteAll={handleCompleteAll}
          onOpenNoteDialog={handleOpenNoteDialog}
          actionLoading={actionLoading}
        />

        <AddNoteDialog 
          open={noteDialogOpen}
          onClose={handleCloseNoteDialog}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onSave={handleSaveNote}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default TreatmentListPage;
