'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/api-client';
import patientService from '@/app/service/patientService';
import treatmentService from '@/app/service/treatmentService';
import vitalService from '@/app/service/vitalService';

const PatientDashboardContext = createContext(null);

const emptyState = {
  loading: true,
  error: null,
  medications: [],
  guides: [],
  vitals: [],
  latestVital: null,
  examinations: [],
  treatments: [],
  prescriptions: [],
};

const unwrapList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
};

const toValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDoctorName = (user) => `${user?.lastname || ''} ${user?.firstname || ''}`.trim() || 'Тодорхойгүй';

export const PatientDashboardProvider = ({ children }) => {
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [
          medicationsResponse,
          guidesResponse,
          vitalsResponse,
          latestVitalResponse,
          examinationsResponse,
          treatmentsResponse,
          prescriptionsResponse,
        ] = await Promise.all([
          apiClient.get('/prescription/my-medications'),
          apiClient.get('/prescription/my-guides'),
          apiClient.get('/vital/vitalsigns/my/recorded'),
          apiClient.get('/vital/vitalsigns/my/latest'),
          patientService.getOwnExaminations(),
          treatmentService.getMyTreatments(),
          apiClient.get('/prescription/my-prescriptions'),
        ]);

        if (!mounted) {
          return;
        }

        const medications = unwrapList(medicationsResponse, ['data', 'medications']);
        const guides = unwrapList(guidesResponse, ['data', 'guides']);
        const vitals = unwrapList(vitalsResponse, ['data', 'vitals']);
        const examinations = unwrapList(examinationsResponse, ['data', 'examinations']);
        const treatments = unwrapList(treatmentsResponse, ['data', 'treatments']);
        const prescriptions = unwrapList(prescriptionsResponse, ['data', 'prescriptions']);

        setState({
          loading: false,
          error: null,
          medications: medications.map((item) => ({
            ...item,
            displayName: item.name || 'Эмийн нэргүй',
          })),
          guides: guides.map((item) => ({
            ...item,
            displayName: item.name || 'Зөвлөмжийн нэргүй',
          })),
          vitals: vitals
            .map((item) => ({
              ...item,
              chartDate: (toValidDate(item.date || item.createdAt) || new Date()).toLocaleDateString('mn-MN', {
                month: '2-digit',
                day: '2-digit',
              }),
            }))
            .sort((left, right) => (toValidDate(left.date || left.createdAt) || 0) - (toValidDate(right.date || right.createdAt) || 0)),
          latestVital: latestVitalResponse?.data || latestVitalResponse || null,
          examinations: examinations.map((item) => ({
            ...item,
            doctorName: formatDoctorName(item.medicalStaff),
          })),
          treatments: treatments.map((item) => ({
            ...item,
            doctorName: formatDoctorName(item.medicalStaff),
          })),
          prescriptions: prescriptions.map((item) => ({
            ...item,
            doctorName: formatDoctorName(item.prescribedBy),
          })),
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setState({
          ...emptyState,
          loading: false,
          error: error?.error || error?.message || 'Өвчтөний хяналтын самбарын мэдээлэл татаж чадсангүй.',
        });
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <PatientDashboardContext.Provider value={value}>{children}</PatientDashboardContext.Provider>;
};

export const usePatientDashboard = () => useContext(PatientDashboardContext) || emptyState;
