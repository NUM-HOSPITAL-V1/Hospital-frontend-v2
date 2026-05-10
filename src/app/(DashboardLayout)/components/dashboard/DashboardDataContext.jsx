'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import patientService from '@/app/service/patientService';
import examinationService from '@/app/service/examinationService';
import medicineService from '@/app/service/medicineService';
import treatmentService from '@/app/service/treatmentService';

const DashboardDataContext = createContext(null);

const MONTH_FORMATTER = new Intl.DateTimeFormat('mn-MN', { month: 'short' });
const DAY_TIME_FORMATTER = new Intl.DateTimeFormat('mn-MN', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const SCHOOL_COLORS = ['primary.main', 'secondary.main', 'success.main', 'error.main', 'warning.main', 'info.main'];

const emptyDashboardData = {
  loading: true,
  error: null,
  stats: {
    totalPatients: 0,
    totalExaminations: 0,
    totalTreatments: 0,
    totalMedicines: 0,
  },
  patientOverview: {
    categories: [],
    series: [],
  },
  departmentBreakdown: {
    total: 0,
    currentMonthCount: 0,
    percentChange: 0,
    series: [],
    departments: [],
  },
  monthlyPatients: {
    total: 0,
    percentChange: 0,
    series: [],
  },
  recentAppointments: [],
  medicines: [],
  treatmentProgress: [],
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

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getRecentMonthBuckets = (count) => {
  const buckets = [];
  const today = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    buckets.push({
      key: getMonthKey(date),
      label: MONTH_FORMATTER.format(date),
      date,
    });
  }

  return buckets;
};

const groupCountByMonth = (items, getDate, buckets) => {
  const counts = Object.fromEntries(buckets.map((bucket) => [bucket.key, 0]));

  items.forEach((item) => {
    const date = toValidDate(getDate(item));
    if (!date) {
      return;
    }

    const key = getMonthKey(date);
    if (Object.prototype.hasOwnProperty.call(counts, key)) {
      counts[key] += 1;
    }
  });

  return buckets.map((bucket) => counts[bucket.key]);
};

const calculatePercentChange = (current, previous) => {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
};

const getFullName = (person) => {
  if (!person) {
    return 'Тодорхойгүй';
  }

  const firstname = person.firstname || '';
  const lastname = person.lastname || '';
  const fullName = `${lastname} ${firstname}`.trim();
  return fullName || 'Тодорхойгүй';
};

const getAge = (birthOfDate) => {
  const birthDate = toValidDate(birthOfDate);
  if (!birthDate) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

const getMedicineStockLevel = (medicine) => {
  const quantity = Number(medicine?.quantity) || 0;
  const reorderLevel = Number(medicine?.reorderLevel) || 0;

  if (quantity <= 0) {
    return 0;
  }

  if (reorderLevel <= 0) {
    return Math.min(quantity, 100);
  }

  if (quantity <= reorderLevel) {
    return 25;
  }

  if (quantity <= reorderLevel * 2) {
    return 60;
  }

  return 100;
};

const getTreatmentStatus = (treatment) => {
  const totalQuantity = Number(treatment?.totalQuantity) || 0;
  const sessionsCompleted = Number(treatment?.sessionsCompleted) || 0;

  if (totalQuantity > 0 && sessionsCompleted >= totalQuantity) {
    return { label: 'Дууссан', color: '#13deb9' };
  }

  if (sessionsCompleted > 0) {
    return { label: 'Явцтай', color: '#5d87ff' };
  }

  return { label: 'Хүлээгдэж буй', color: '#fa896b' };
};

const buildDashboardData = ({ patients, examinations, medicines, treatments }) => {
  const patientMap = new Map(patients.map((patient) => [patient._id || patient.id, patient]));
  const overviewBuckets = getRecentMonthBuckets(6);
  const monthlyBuckets = getRecentMonthBuckets(8);
  const currentMonthKey = getMonthKey(new Date());
  const previousMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(previousMonthDate);

  const patientsByMonth = groupCountByMonth(patients, (item) => item.createdAt, overviewBuckets);
  const examinationsByMonth = groupCountByMonth(
    examinations,
    (item) => item.exam_date || item.createdAt,
    overviewBuckets
  );
  const treatmentsByMonth = groupCountByMonth(
    treatments,
    (item) => item.date || item.createdAt,
    overviewBuckets
  );
  const monthlyPatientSeries = groupCountByMonth(
    examinations,
    (item) => item.exam_date || item.createdAt,
    monthlyBuckets
  );

  const schoolCountMap = new Map();
  patients.forEach((patient) => {
    const schoolName = patient.school || 'Тодорхойгүй';
    schoolCountMap.set(schoolName, (schoolCountMap.get(schoolName) || 0) + 1);
  });

  const totalPatients = patients.length;
  const departmentEntries = [...schoolCountMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const departmentSeries = departmentEntries.map(([, count]) =>
    totalPatients ? Math.round((count / totalPatients) * 100) : 0
  );
  const departments = departmentEntries.map(([name], index) => ({
    name,
    color: SCHOOL_COLORS[index] || 'grey.500',
  }));

  const currentMonthPatients = examinations.filter((item) => {
    const date = toValidDate(item.exam_date || item.createdAt);
    return date ? getMonthKey(date) === currentMonthKey : false;
  }).length;
  const previousMonthPatients = examinations.filter((item) => {
    const date = toValidDate(item.exam_date || item.createdAt);
    return date ? getMonthKey(date) === previousMonthKey : false;
  }).length;

  const currentMonthExaminations = examinations.filter((item) => {
    const date = toValidDate(item.exam_date || item.createdAt);
    return date ? getMonthKey(date) === currentMonthKey : false;
  }).length;
  const previousMonthExaminations = examinations.filter((item) => {
    const date = toValidDate(item.exam_date || item.createdAt);
    return date ? getMonthKey(date) === previousMonthKey : false;
  }).length;

  const recentAppointments = examinations.slice(0, 5).map((examination) => ({
    id: examination._id,
    title: examination.reason || examination.exam_type || 'Үзлэг',
    patientName: getFullName(examination.patient),
    doctorName: getFullName(examination.medicalStaff),
    dateLabel: DAY_TIME_FORMATTER.format(toValidDate(examination.exam_date || examination.createdAt) || new Date()),
  }));

  const medicinesForCard = [...medicines]
    .sort((left, right) => (Number(right.quantity) || 0) - (Number(left.quantity) || 0))
    .slice(0, 4)
    .map((medicine) => ({
      id: medicine._id,
      title: medicine.name || 'Нэргүй эм',
      category: medicine.category || medicine.type || 'Ангилалгүй',
      stock: Number(medicine.quantity) || 0,
      stockLevel: getMedicineStockLevel(medicine),
      price: Number(medicine.price) || 0,
      icon: (medicine.name || 'Э').charAt(0).toUpperCase(),
    }));

  const treatmentProgress = treatments.slice(0, 6).map((treatment) => {
    const patientId = treatment.patient?._id || treatment.patient?.id;
    const patient = patientMap.get(patientId);
    const status = getTreatmentStatus(treatment);

    return {
      id: treatment._id,
      name: getFullName(treatment.patient),
      age: getAge(patient?.birthOfDate) ?? '-',
      department: patient?.school || 'Тодорхойгүй',
      status: status.label,
      statusColor: status.color,
    };
  });

  return {
    loading: false,
    error: null,
    stats: {
      totalPatients,
      totalExaminations: examinations.length,
      totalTreatments: treatments.length,
      totalMedicines: medicines.length,
    },
    patientOverview: {
      categories: overviewBuckets.map((bucket) => bucket.label),
      series: [
        { name: 'Үйлчлүүлэгч', data: patientsByMonth },
        { name: 'Үзлэг', data: examinationsByMonth },
        { name: 'Эмчилгээ', data: treatmentsByMonth },
      ],
    },
    departmentBreakdown: {
      total: totalPatients,
      currentMonthCount: currentMonthExaminations,
      percentChange: calculatePercentChange(currentMonthExaminations, previousMonthExaminations),
      series: departmentSeries,
      departments,
    },
    monthlyPatients: {
      total: currentMonthPatients,
      percentChange: calculatePercentChange(currentMonthPatients, previousMonthPatients),
      series: monthlyPatientSeries,
    },
    recentAppointments,
    medicines: medicinesForCard,
    treatmentProgress,
  };
};

export const DashboardDataProvider = ({ children }) => {
  const [data, setData] = useState(emptyDashboardData);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const [patientsResponse, examinationsResponse, medicinesResponse, treatmentsResponse] = await Promise.all([
          patientService.getAllPatients(),
          examinationService.getAllExaminations(),
          medicineService.getAllMedicines(),
          treatmentService.getAllTreatments(),
        ]);

        if (!mounted) {
          return;
        }

        const patients = unwrapList(patientsResponse, ['patients', 'data']);
        const examinations = unwrapList(examinationsResponse, ['data', 'examinations']);
        const medicines = unwrapList(medicinesResponse, ['data', 'medicines']);
        const treatments = unwrapList(treatmentsResponse, ['data', 'treatments']);

        setData(buildDashboardData({ patients, examinations, medicines, treatments }));
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (error === "Refreshed" || error === "Unauthorized" || error === "Session expired") {
          return;
        }

        setData({
          ...emptyDashboardData,
          loading: false,
          error: error?.error || error?.message || 'Хяналтын самбарын мэдээлэл татаж чадсангүй.',
        });
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => data, [data]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
};

export const useDashboardData = () => useContext(DashboardDataContext) || emptyDashboardData;
