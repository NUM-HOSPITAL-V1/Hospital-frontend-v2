'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { actionOptions } from '../mockdata';
import Header from '../../components/examination/Header';
import PatientInfo from '../../components/examination/PatientInfo';
import PatientAllergies from '../../components/examination/Allergy';
import PatientChronicDiseases from '../../components/examination/ChronicDisease';
import PatientSelection from '../../components/examination/PatientSelection';
import ServiceCategories from '../../components/examination/ServiceCategories';
import VitalSigns from '../../components/examination/VitalSigns';
import DiagnosisTab from '../../components/examination/Diagnosis';
import TreatmentTab from '../../components/examination/Treatment';
import PrescriptionTab from '../../components/examination/Prescription';
import ActionButtons from '../../components/examination/ActionButtons';
import PatientSearchDialog from '../../components/examination/PatientSearchDialog';
import PatientMedicalHistory from '../../components/examination/MedicalHistory';
import examinationService from '../../../service/examinationService';
import patientService from '../../../service/patientService';
import vitalService from '../../../service/vitalService';
import prescriptionService from '../../../service/prescriptionService';
import treatmentService from '../../../service/treatmentService';
import diagnosisLookupService from '../../../service/diagnosisLookupService';

export default function CreateExaminationPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date(),
    type: 'Анхан',
    diagnosis: '',
    diagnosisCode: '',
    diagnosisId: '',
    diagnosisSource: '',
    diagnosisDetail: '',
    diagnosisNote: '',
    action: '',
    actionCode: '',
    notes: '',
    status: 'Хийгдэж буй',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    treatmentInstructions: '',
    treatmentTotalQuantity: '',
    treatmentFrequency: '',
    treatmentDays: '',
    guideName: '',
    regimen: '',
    medicationName: '',
    medicationDose: '',
    medicationFrequency: '',
    medicationDescription: '',
    prescriptionNotes: ''
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    // Auto-clear notification after it's shown
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!patientDialogOpen) return;
    const fetchPatients = async () => {
      try {
        const response = await patientService.getAllPatients();
        const transformedPatients = (response?.patients || []).map((patient) => ({
          id: patient.id,
          firstName: patient.firstname,
          lastName: patient.lastname,
          registerNum: patient.register || '',
          gender: patient.gender || '',
          age: calculateAge(patient.birthOfDate),
          department: patient.type || '',
          doctorType: patient.occupation || '',
          section: patient.address || '',
          allergies: [],
          chronicDiseases: [],
        }));
        setPatients(transformedPatients);
      } catch (error) {
        console.error('Error fetching patients for examination:', error);
        showNotification('Үйлчлүүлэгчийн мэдээлэл татахад алдаа гарлаа', 'error');
      }
    };

    fetchPatients();
  }, [patientDialogOpen]);

  useEffect(() => {
    const trimmedQuery = diagnosisQuery.trim();

    if (trimmedQuery.length < 2) {
      setDiagnosisOptions(selectedDiagnosis ? [selectedDiagnosis] : []);
      setDiagnosisLoading(false);
      setDiagnosisError('');
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setDiagnosisLoading(true);
      setDiagnosisError('');

      try {
        const response = await diagnosisLookupService.searchDiagnoses({
          query: trimmedQuery,
          limit: 10,
          signal: controller.signal,
        });

        const results = Array.isArray(response?.data) ? response.data : [];
        const nextOptions = selectedDiagnosis
          ? [
              selectedDiagnosis,
              ...results.filter((item) => item.code !== selectedDiagnosis.code),
            ]
          : results;

        setDiagnosisOptions(nextOptions);
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return;
        }

        console.error('Error searching diagnoses:', error);
        setDiagnosisOptions(selectedDiagnosis ? [selectedDiagnosis] : []);
        setDiagnosisError('ICD-10 онош хайхад алдаа гарлаа. Дараа дахин оролдоно уу.');
      } finally {
        setDiagnosisLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [diagnosisQuery, selectedDiagnosis]);

  const examinationTypeMap = {
    'Анхан': 'Initial',
    'Давтан': 'Follow-up',
  };

  const examinationStatusMap = {
    'Хийгдэж буй': 'Ongoing',
    'Дууссан': 'Done',
    'Хүлээгдэж буй': 'Todo',
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push('/examination');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleDiagnosisChange = (event, newValue) => {
    if (newValue) {
      setSelectedDiagnosis(newValue);
      setDiagnosisQuery([newValue.code, newValue.name].filter(Boolean).join(' - '));
      setDiagnosisOptions((prev) => {
        const next = Array.isArray(prev) ? prev.filter((item) => item.code !== newValue.code) : [];
        return [newValue, ...next];
      });
      setDiagnosisError('');
      setFormData(prev => ({
        ...prev,
        diagnosis: newValue.name,
        diagnosisCode: newValue.code,
        diagnosisId: newValue.id || '',
        diagnosisSource: newValue.source || 'icd10',
        diagnosisDetail: newValue.detail || '',
      }));
    } else {
      setSelectedDiagnosis(null);
      setDiagnosisQuery('');
      setDiagnosisOptions([]);
      setFormData(prev => ({
        ...prev,
        diagnosis: '',
        diagnosisCode: '',
        diagnosisId: '',
        diagnosisSource: '',
        diagnosisDetail: '',
      }));
    }
  };

  const handleDiagnosisInputChange = (event, value, reason) => {
    if (reason === 'reset') {
      return;
    }

    setDiagnosisQuery(value);

    if (reason === 'clear') {
      setSelectedDiagnosis(null);
      setDiagnosisOptions([]);
      setDiagnosisError('');
      setFormData(prev => ({
        ...prev,
        diagnosis: '',
        diagnosisCode: '',
        diagnosisId: '',
        diagnosisSource: '',
        diagnosisDetail: '',
      }));
    }
  };

  const handleActionChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        action: newValue.label,
        actionCode: newValue.code
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        action: '',
        actionCode: ''
      }));
    }
  };

  const handleOpenPatientDialog = () => {
    setPatientDialogOpen(true);
  };

  const handleClosePatientDialog = () => {
    setPatientDialogOpen(false);
  };

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.lastName} ${patient.firstName}`
    }));
    setPatientDialogOpen(false);
  };
  
  const handleUpdateAllergies = (updatedAllergies) => {
    setSelectedPatient(prevPatient => ({
      ...prevPatient,
      allergies: updatedAllergies
    }));
    showNotification('Харшлын мэдээлэл шинэчлэгдлээ');
  };
  
  const handleUpdateChronicDiseases = (updatedDiseases) => {
    setSelectedPatient(prevPatient => ({
      ...prevPatient,
      chronicDiseases: updatedDiseases
    }));
    showNotification('Архаг өвчний мэдээлэл шинэчлэгдлээ');
  };

  const requiredVitalFields = [
    { key: 'temperature', label: 'Биеийн халуун' },
    { key: 'bloodPressure', label: 'Цусны даралт' },
    { key: 'heartRate', label: 'Зүрхний цохилт' },
    { key: 'respiratoryRate', label: 'Амьсгалын хэмнэл' },
    { key: 'weight', label: 'Жин' },
    { key: 'height', label: 'Өндөр' },
  ];

const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔴 REQUIRED VALIDATION
  if (!selectedPatient) {
    showNotification('Та үйлчлүүлэгч сонгоно уу', 'warning');
    return;
  }

  if (!formData.diagnosis) {
    showNotification('Онош сонгоно уу', 'warning');
    return;
  }

  if (!formData.action) {
    showNotification('Хийсэн ажилбар сонгоно уу', 'warning');
    return;
  }

  const missingVital = requiredVitalFields.find(
    ({ key }) => !String(formData[key] ?? '').trim()
  );

  if (missingVital) {
    showNotification(`${missingVital.label} бөглөнө үү`, 'warning');
    setTabValue(0);
    return;
  }

  const bloodPressurePattern = /^\d+\s*\/\s*\d+$/;

  if (!bloodPressurePattern.test(String(formData.bloodPressure).trim())) {
    showNotification('Цусны даралтыг 120/80 хэлбэрээр оруулна уу', 'warning');
    setTabValue(0);
    return;
  }

  setLoading(true);

  try {
    const payload = {
      patient: selectedPatient.id,
      exam_date: formData.date,
      doctors_examination: examinationTypeMap[formData.type] || 'Initial',
      exam_type: formData.type,
      illness: formData.diagnosisCode
        ? [formData.diagnosisCode, formData.diagnosis].filter(Boolean).join(' - ')
        : formData.diagnosis,

      surgery: formData.action || '',
      reason: [formData.diagnosisNote, formData.notes].filter((value) => value && String(value).trim() !== '').join('\n\n'),
      callback: false,
      sendToHigherLevel: false,
      isVioleted: false,
      sickDays: 0,
      status: examinationStatusMap[formData.status] || 'Ongoing',
      diagnosis: selectedDiagnosis
        ? {
            id: selectedDiagnosis.id || '',
            code: selectedDiagnosis.code,
            name: selectedDiagnosis.name,
            detail: selectedDiagnosis.detail || '',
            source: selectedDiagnosis.source || 'icd10',
          }
        : undefined,
    };

    const examinationResponse = await examinationService.createExamination(payload);
    const examinationId = examinationResponse?.data?._id;

    const warnings = [];

    // 🟢 VITAL SIGNS (optional)
    const hasVitalSigns = [
      formData.temperature,
      formData.bloodPressure,
      formData.heartRate,
      formData.respiratoryRate,
      formData.weight,
      formData.height,
    ].some((value) => value !== '' && value !== null && value !== undefined);

    if (hasVitalSigns) {
      try {
        const [systolic, diastolic] = String(formData.bloodPressure || '')
          .split('/')
          .map((value) => Number(value.trim()));

        await vitalService.createVitalSigns({
          patient: selectedPatient.id,
          date: formData.date,
          temperature: formData.temperature === '' ? undefined : Number(formData.temperature),
          right_systolic: Number.isFinite(systolic) ? systolic : undefined,
          right_diastolic: Number.isFinite(diastolic) ? diastolic : undefined,
          right_heart_rate: formData.heartRate === '' ? undefined : Number(formData.heartRate),
          respiration_rate: formData.respiratoryRate === '' ? undefined : Number(formData.respiratoryRate),
          weight: formData.weight === '' ? undefined : Number(formData.weight),
          height: formData.height === '' ? undefined : Number(formData.height),
        });
      } catch (error) {
        console.error('Error creating vital signs:', error);
        warnings.push('Амин үзүүлэлт хадгалагдсангүй');
      }
    }

    // 🟢 TREATMENT / PRESCRIPTION (OPTIONAL)
    const guideDescription = [formData.treatmentInstructions, formData.regimen]
      .filter((value) => value && String(value).trim() !== '')
      .join('\n\n')
      .trim();

    const hasGuide = guideDescription.length > 0;
    const hasTreatmentTabInput = [
      formData.treatmentInstructions,
      formData.treatmentTotalQuantity,
      formData.treatmentFrequency,
      formData.treatmentDays,
      formData.guideName,
      formData.regimen,
    ].some((value) => value && String(value).trim() !== '');
    const shouldCreateTreatment =
      hasTreatmentTabInput ||
      formData.actionCode === 'TREAT' ||
      String(formData.action || '').toLowerCase().includes('эмчилгээ');

    const hasMedication = [
      formData.medicationName,
      formData.medicationDose,
      formData.medicationFrequency,
    ].every((value) => value && String(value).trim() !== '');

    if (shouldCreateTreatment) {
      try {
        const totalQuantity = Math.max(1, Number(formData.treatmentTotalQuantity || 1));
        const treatmentDays = formData.treatmentDays === '' ? undefined : Number(formData.treatmentDays);
        await treatmentService.createTreatment({
          patient: selectedPatient.id,
          date: formData.date,
          examination_id: examinationId,
          treatmentType: 'Emchilgee',
          diagnosisType: 'out',
          totalQuantity,
          frequency: formData.treatmentFrequency?.trim() || undefined,
          treatmentDays: Number.isFinite(treatmentDays) ? treatmentDays : undefined,
          sessionsCompleted: formData.status === 'Дууссан' ? totalQuantity : 0,
        });
      } catch (error) {
        console.error('Error creating treatment:', error);
        warnings.push('Эмчилгээ хадгалагдсангүй');
      }
    }

    if (hasGuide || hasMedication) {
      try {
        const prescriptionResponse = await prescriptionService.createPrescription({
          patient: selectedPatient.id,
          date: formData.date,
          examination_id: examinationId,
        });

        const prescriptionId = prescriptionResponse?.data?._id;

        if (prescriptionId && hasGuide) {
          await prescriptionService.createPrescribedGuide({
            name: formData.guideName?.trim() || 'Эмчилгээний заавар',
            description: guideDescription,
            patient: selectedPatient.id,
            prescription: prescriptionId,
          });
        }

        if (prescriptionId && hasMedication) {
          await prescriptionService.createPrescribedMed({
            name: formData.medicationName.trim(),
            description: formData.medicationDescription || formData.prescriptionNotes || '',
            dose: formData.medicationDose.trim(),
            frequency: formData.medicationFrequency.trim(),
            patient: selectedPatient.id,
            prescription: prescriptionId,
          });
        }
      } catch (error) {
        console.error('Error creating prescription:', error);
        warnings.push('Жор хадгалагдсангүй');
      }
    }

    showNotification(
      warnings.length > 0
        ? `Үзлэг хадгалагдлаа. ${warnings.join(', ')}`
        : 'Амжилттай хадгалагдлаа'
    );

    setTimeout(() => {
      router.push('/examination');
    }, 800);

  } catch (error) {
    console.error('Error submitting examination:', error);

    const validationMessage = Array.isArray(error?.response?.data?.errors)
      ? error.response.data.errors.map((item) => item.message).join(', ')
      : null;

    showNotification(
      validationMessage || error?.response?.data?.error || 'Хадгалах үед алдаа гарлаа',
      'error'
    );
  } finally {
    setLoading(false);
  }
};

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
    const regNum = (patient.registerNum || '').toLowerCase();
    const search = patientSearch.toLowerCase();
    
    return fullName.includes(search) || regNum.includes(search);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      {/* Header */}
      <Header onBack={handleBack} />

      <Box component="form" onSubmit={handleSubmit}>
        {/* Patient Selection or Info Card */}
        {selectedPatient ? (
          <>
            <PatientInfo 
              patient={selectedPatient} 
              onChangePatient={() => setSelectedPatient(null)} 
            />
            <PatientAllergies 
              allergies={selectedPatient.allergies || []} 
              onUpdate={handleUpdateAllergies} 
            />
            <PatientChronicDiseases 
              chronicDiseases={selectedPatient.chronicDiseases || []} 
              onUpdate={handleUpdateChronicDiseases} 
            />
            <PatientMedicalHistory patient={selectedPatient} />
          </>
        ) : (
          <PatientSelection onOpenDialog={handleOpenPatientDialog} />
        )}

        {/* Rest of the form is disabled if no patient is selected */}
        <Box sx={{ opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
          {/* Service Categories */}
          <ServiceCategories 
            tabValue={tabValue} 
            onChange={handleTabChange} 
          />

          {/* Form Content Based on Selected Tab */}
          {tabValue === 0 && (
            <VitalSigns 
              formData={formData} 
              onChange={handleChange} 
            />
          )}

          {tabValue === 1 && (
            <DiagnosisTab 
              formData={formData} 
              onChange={handleChange}
              onDateChange={handleDateChange}
              onDiagnosisChange={handleDiagnosisChange}
              onDiagnosisInputChange={handleDiagnosisInputChange}
              diagnosisQuery={diagnosisQuery}
              diagnosisLoading={diagnosisLoading}
              diagnosisError={diagnosisError}
              onActionChange={handleActionChange}
              diagnosisOptions={diagnosisOptions}
              selectedDiagnosis={selectedDiagnosis}
              actionOptions={actionOptions}
            />
          )}

          {tabValue === 2 && (
            <TreatmentTab 
              formData={formData} 
              onChange={handleChange} 
            />
          )}

          {tabValue === 3 && (
            <PrescriptionTab 
              formData={formData} 
              onChange={handleChange} 
            />
          )}
          
          {/* Action Buttons */}
          <ActionButtons 
            onCancel={handleBack} 
            loading={loading} 
          />
        </Box>
      </Box>

      {/* Patient Selection Dialog */}
      <PatientSearchDialog 
        open={patientDialogOpen}
        onClose={handleClosePatientDialog}
        patients={filteredPatients}
        searchValue={patientSearch}
        onSearchChange={handlePatientSearchChange}
        onSelectPatient={handleSelectPatient}
      />

      {/* Notification component */}
      {notification && (
  <Box
    sx={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999
    }}
  >
    <Alert
      message={notification.message}
      type={notification.severity}
      showIcon
      closable
    />
  </Box>
)}
    </Box>
  );
}
