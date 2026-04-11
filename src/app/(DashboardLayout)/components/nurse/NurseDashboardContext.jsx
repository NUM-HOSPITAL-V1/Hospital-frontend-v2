'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import treatmentService from '@/app/service/treatmentService';
import vitalService from '@/app/service/vitalService';

const NurseDashboardContext = createContext(null);

const emptyState = {
  loading: true,
  error: null,
  stats: {
    totalTreatments: 0,
    totalVitals: 0,
    pendingTreatments: 0,
    completedTreatments: 0,
    todayCompletionPercent: 0,
    monthCompletionPercent: 0,
    monthChangePercent: 0,
    progressItems: [],
  },
  activities: [],
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

const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const getTreatmentState = (treatment) => {
  const completed = Number(treatment?.sessionsCompleted) || 0;
  const total = Number(treatment?.totalQuantity) || 0;

  if (total > 0 && completed >= total) {
    return 'completed';
  }

  if (completed > 0) {
    return 'ongoing';
  }

  return 'pending';
};

const getFullName = (user) => {
  if (!user) {
    return 'Тодорхойгүй';
  }

  return `${user.lastname || ''} ${user.firstname || ''}`.trim() || 'Тодорхойгүй';
};

const buildActivityFromTreatment = (treatment) => {
  const state = getTreatmentState(treatment);
  const date = toValidDate(treatment.date || treatment.createdAt);

  return {
    id: treatment._id,
    title: `${treatment.treatmentType || 'Эмчилгээ'} - ${getFullName(treatment.patient)}`,
    description: `${treatment.diagnosisType === 'in' ? 'Хэвтэн' : 'Амбулатори'} • ${treatment.sessionsCompleted || 0}/${treatment.totalQuantity || 0} удаа`,
    time: date
      ? date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    completed: state === 'completed',
    upcoming: state === 'pending',
    color: state === 'completed' ? 'success' : state === 'ongoing' ? 'warning' : 'primary',
    users: [((treatment.patient?.firstname || 'Т').charAt(0)).toUpperCase()],
    sortDate: date || new Date(0),
  };
};

const buildActivityFromVital = (vital) => {
  const date = toValidDate(vital.date || vital.createdAt);

  return {
    id: vital._id,
    title: `Амин үзүүлэлт - ${getFullName(vital.patient)}`,
    description: `Даралт ${vital.right_systolic || vital.left_systolic || '-'} / ${vital.right_diastolic || vital.left_diastolic || '-'} • Пульс ${vital.right_heart_rate || vital.left_heart_rate || '-'}`,
    time: date
      ? date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    completed: true,
    upcoming: false,
    color: 'error',
    users: [((vital.patient?.firstname || 'Т').charAt(0)).toUpperCase()],
    sortDate: date || new Date(0),
  };
};

const buildState = ({ treatments, vitals }) => {
  const now = new Date();
  const todayKey = now.toDateString();
  const currentMonthKey = getMonthKey(now);
  const previousMonthKey = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const completedTreatments = treatments.filter((item) => getTreatmentState(item) === 'completed').length;
  const ongoingTreatments = treatments.filter((item) => getTreatmentState(item) === 'ongoing').length;
  const pendingTreatments = treatments.filter((item) => getTreatmentState(item) === 'pending').length;

  const todayTreatments = treatments.filter((item) => {
    const date = toValidDate(item.date || item.createdAt);
    return date ? date.toDateString() === todayKey : false;
  });

  const todayCompleted = todayTreatments.filter((item) => getTreatmentState(item) === 'completed').length;
  const todayCompletionPercent = todayTreatments.length
    ? Math.round((todayCompleted / todayTreatments.length) * 100)
    : 0;

  const currentMonthTreatments = treatments.filter((item) => {
    const date = toValidDate(item.date || item.createdAt);
    return date ? getMonthKey(date) === currentMonthKey : false;
  });
  const previousMonthTreatments = treatments.filter((item) => {
    const date = toValidDate(item.date || item.createdAt);
    return date ? getMonthKey(date) === previousMonthKey : false;
  });

  const currentMonthCompleted = currentMonthTreatments.filter((item) => getTreatmentState(item) === 'completed').length;
  const previousMonthCompleted = previousMonthTreatments.filter((item) => getTreatmentState(item) === 'completed').length;

  const monthCompletionPercent = currentMonthTreatments.length
    ? Math.round((currentMonthCompleted / currentMonthTreatments.length) * 100)
    : 0;
  const previousMonthCompletionPercent = previousMonthTreatments.length
    ? Math.round((previousMonthCompleted / previousMonthTreatments.length) * 100)
    : 0;
  const monthChangePercent = previousMonthCompletionPercent
    ? monthCompletionPercent - previousMonthCompletionPercent
    : monthCompletionPercent > 0 ? monthCompletionPercent : 0;

  const progressItems = [
    {
      title: 'Хийгдсэн эмчилгээ',
      value: completedTreatments,
      percentage: treatments.length ? Math.round((completedTreatments / treatments.length) * 100) : 0,
      color: 'success.main',
    },
    {
      title: 'Хийгдэж буй эмчилгээ',
      value: ongoingTreatments,
      percentage: treatments.length ? Math.round((ongoingTreatments / treatments.length) * 100) : 0,
      color: 'warning.main',
    },
    {
      title: 'Хүлээгдэж буй эмчилгээ',
      value: pendingTreatments,
      percentage: treatments.length ? Math.round((pendingTreatments / treatments.length) * 100) : 0,
      color: 'error.main',
    },
  ];

  const activities = [
    ...treatments.slice(0, 6).map(buildActivityFromTreatment),
    ...vitals.slice(0, 6).map(buildActivityFromVital),
  ]
    .sort((left, right) => right.sortDate - left.sortDate)
    .slice(0, 8);

  return {
    loading: false,
    error: null,
    stats: {
      totalTreatments: treatments.length,
      totalVitals: vitals.length,
      pendingTreatments,
      completedTreatments,
      todayCompletionPercent,
      monthCompletionPercent,
      monthChangePercent,
      progressItems,
    },
    activities,
  };
};

export const NurseDashboardProvider = ({ children }) => {
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [treatmentsResponse, vitalsResponse] = await Promise.all([
          treatmentService.getAllTreatments(),
          vitalService.getMyRecordedVitalSigns(20),
        ]);

        if (!mounted) {
          return;
        }

        const treatments = unwrapList(treatmentsResponse, ['data', 'treatments']);
        const vitals = unwrapList(vitalsResponse, ['data', 'vitals']);
        setState(buildState({ treatments, vitals }));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setState({
          ...emptyState,
          loading: false,
          error: error?.error || error?.message || 'Сувилагчийн хяналтын самбарын мэдээлэл татаж чадсангүй.',
        });
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <NurseDashboardContext.Provider value={value}>{children}</NurseDashboardContext.Provider>;
};

export const useNurseDashboard = () => useContext(NurseDashboardContext) || emptyState;
