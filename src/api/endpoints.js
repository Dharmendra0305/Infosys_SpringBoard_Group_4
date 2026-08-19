import { api } from './client';

// ---- Master Data ----
export const getDepartments = () => api.get('/api/departments');
export const createDepartment = (data) => api.post('/api/departments', data);

export const getCostCenters = () => api.get('/api/cost-centers');
export const createCostCenter = (data) => api.post('/api/cost-centers', data);

export const getCategories = () => api.get('/api/categories');
export const createCategory = (data) => api.post('/api/categories', data);

export const getSuppliers = () => api.get('/api/suppliers');
export const createSupplier = (data) => api.post('/api/suppliers', data);
export const getSupplierContacts = (id) => api.get(`/api/suppliers/${id}/contacts`);

// ---- Requisitions ----
export const getRequisitions = () => api.get('/api/requisitions');
export const getMyRequisitions = () => api.get('/api/requisitions/mine');
export const getMyPendingApprovals = () => api.get('/api/requisitions/my-pending');
export const getRequisition = (id) => api.get(`/api/requisitions/${id}`);
export const getRequisitionApprovals = (id) => api.get(`/api/requisitions/${id}/approvals`);
export const createRequisition = (data) => api.post('/api/requisitions', data);
export const decideRequisition = (id, data) => api.post(`/api/requisitions/${id}/decision`, data);

// ---- Purchase Orders ----
export const getPurchaseOrders = () => api.get('/api/purchase-orders');
export const convertToPO = (data) => api.post('/api/purchase-orders/from-requisition', data);
export const updatePOStatus = (id, data) => api.post(`/api/purchase-orders/${id}/status`, data);
export const receiveGoods = (id, data) => api.post(`/api/purchase-orders/${id}/receipts`, data);

// ---- Reporting ----
export const getSpendSummary = () => api.get('/api/reports/spend-summary');
export const getStatistics = (year, month) => {
  const params = year && month ? `?year=${year}&month=${month}` : '';
  return api.get(`/api/statistics${params}`);
};
export const getBudgetAllocations = () => api.get('/api/reports/budget-allocations');

// ---- Governance ----
export const getRoles = () => api.get('/api/roles');
export const getEmployees = () => api.get('/api/employees');
export const getEmployeeRoles = (id) => api.get(`/api/employees/${id}/roles`);
export const getAuditTrail = (entityName, entityId) => api.get(`/api/audit-log/${entityName}/${entityId}`);
