import api from './client.js';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const vehicleApi = {
  list: (params) => api.get('/vehicles', { params }).then((r) => r.data),
  available: () => api.get('/vehicles/available').then((r) => r.data),
  create: (body) => api.post('/vehicles', body).then((r) => r.data),
  update: (id, body) => api.put(`/vehicles/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/vehicles/${id}`).then((r) => r.data),
};

export const driverApi = {
  list: (params) => api.get('/drivers', { params }).then((r) => r.data),
  available: () => api.get('/drivers/available').then((r) => r.data),
  create: (body) => api.post('/drivers', body).then((r) => r.data),
  update: (id, body) => api.put(`/drivers/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/drivers/${id}`).then((r) => r.data),
};

export const tripApi = {
  list: (params) => api.get('/trips', { params }).then((r) => r.data),
  create: (body) => api.post('/trips', body).then((r) => r.data),
  dispatch: (id) => api.post(`/trips/${id}/dispatch`).then((r) => r.data),
  complete: (id, body) => api.post(`/trips/${id}/complete`, body).then((r) => r.data),
  cancel: (id) => api.post(`/trips/${id}/cancel`).then((r) => r.data),
};

export const maintenanceApi = {
  list: (params) => api.get('/maintenance', { params }).then((r) => r.data),
  open: (body) => api.post('/maintenance', body).then((r) => r.data),
  close: (id, body) => api.post(`/maintenance/${id}/close`, body).then((r) => r.data),
};

export const financeApi = {
  listFuel: (params) => api.get('/fuel', { params }).then((r) => r.data),
  createFuel: (body) => api.post('/fuel', body).then((r) => r.data),
  listExpenses: (params) => api.get('/expenses', { params }).then((r) => r.data),
  createExpense: (body) => api.post('/expenses', body).then((r) => r.data),
};

export const reportApi = {
  kpis: (params) => api.get('/dashboard/kpis', { params }).then((r) => r.data),
  reports: () => api.get('/reports').then((r) => r.data),
  exportCsvUrl: () => `${api.defaults.baseURL}/reports/export.csv`,
};
