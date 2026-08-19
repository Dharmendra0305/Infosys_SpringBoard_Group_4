import { useEffect, useState } from 'react';
import {
  getDepartments,
  getCostCenters,
  getCategories,
  getSuppliers,
  getEmployees,
} from '../api/endpoints';

function toMap(list, key = 'id') {
  const map = {};
  for (const item of list) map[item[key]] = item;
  return map;
}

export default function useReferenceData() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    departments: [],
    costCenters: [],
    categories: [],
    suppliers: [],
    employees: [],
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDepartments(), getCostCenters(), getCategories(), getSuppliers(), getEmployees()])
      .then(([departments, costCenters, categories, suppliers, employees]) => {
        if (cancelled) return;
        setState({ loading: false, error: '', departments, costCenters, categories, suppliers, employees });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const departmentsById = toMap(state.departments);
  const costCentersById = toMap(state.costCenters);
  const categoriesById = toMap(state.categories);
  const suppliersById = toMap(state.suppliers);
  const employeesById = toMap(state.employees);

  const employeeName = (id) => {
    const e = employeesById[id];
    return e ? `${e.firstName} ${e.lastName}` : id ? `#${id}` : '—';
  };

  return {
    ...state,
    departmentsById,
    costCentersById,
    categoriesById,
    suppliersById,
    employeesById,
    employeeName,
    departmentName: (id) => departmentsById[id]?.name || (id ? `#${id}` : '—'),
    costCenterName: (id) => costCentersById[id]?.name || (id ? `#${id}` : '—'),
    categoryName: (id) => categoriesById[id]?.name || (id ? `#${id}` : '—'),
    supplierName: (id) => suppliersById[id]?.name || (id ? `#${id}` : '—'),
  };
}
