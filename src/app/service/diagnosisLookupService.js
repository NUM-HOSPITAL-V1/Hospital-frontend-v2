import axios from 'axios';
import API_BASE_URL from '../../utils/apiBaseUrl';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('USER');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Diagnosis lookup auth token parse error:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const normalizeDiagnosisItem = (item = {}) => ({
  id: item.id || item.code || '',
  code: item.code || '',
  name: item.name || item.label || '',
  detail: item.detail || item.description || '',
  source: item.source || 'icd10',
  chapterCode: item.chapterCode || '',
  chapterName: item.chapterName || '',
  categoryCode: item.categoryCode || '',
  categoryName: item.categoryName || '',
  score: item.score ?? null,
});

const diagnosisLookupService = {
  searchDiagnoses: async ({ query, limit = 10, signal } = {}) => {
    const trimmedQuery = String(query || '').trim();

    if (trimmedQuery.length < 2) {
      return {
        success: true,
        data: [],
        meta: {
          query: trimmedQuery,
          limit,
          count: 0,
        },
      };
    }

    const response = await apiClient.get('/diagnosis-lookup/search', {
      params: {
        q: trimmedQuery,
        limit,
      },
      signal,
    });

    const payload = response.data || {};
    const rawItems = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: payload.success !== false,
      data: rawItems.map(normalizeDiagnosisItem),
      meta: payload.meta || {
        query: trimmedQuery,
        limit,
        count: rawItems.length,
      },
    };
  },

  getDiagnosisByCode: async (code, { signal } = {}) => {
    const trimmedCode = String(code || '').trim();

    if (!trimmedCode) {
      return null;
    }

    const response = await apiClient.get(`/diagnosis-lookup/code/${encodeURIComponent(trimmedCode)}`, {
      signal,
    });

    return normalizeDiagnosisItem(response.data?.data || {});
  },
};

export default diagnosisLookupService;
