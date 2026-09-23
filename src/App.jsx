import React from 'react';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import QuotesPage from './pages/QuotesPage';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import RenewalsPage from './pages/RenewalsPage';
import LoansPage from './pages/LoansPage';
import PaymentsPage from './pages/PaymentsPage';
import EmployeesPage from './pages/EmployeesPage';
import CompaniesMasterPage from './pages/CompaniesMasterPage';
import ReportsAuditPage from './pages/ReportsAuditPage';

function MainRouter() {
  const { activeTab } = useAppData();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'applications':
      case 'wizard':
      case 'insurance':
        return <ApplicationsPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'policies':
        return <PoliciesPage />;
      case 'claims':
        return <ClaimsPage />;
      case 'renewals':
        return <RenewalsPage />;
      case 'loans':
        return <LoansPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'staff':
        return <EmployeesPage initialTab="directory" />;
      case 'leaves':
        return <EmployeesPage initialTab="leaves" />;
      case 'payroll':
        return <EmployeesPage initialTab="payroll" />;
      case 'companies':
        return <CompaniesMasterPage initialTab="companies" />;
      case 'repository':
        return <CompaniesMasterPage initialTab="repository" />;
      case 'reports':
      case 'audit':
        return <ReportsAuditPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppShell>{renderActivePage()}</AppShell>;
}

export function App() {
  return (
    <AppDataProvider>
      <MainRouter />
    </AppDataProvider>
  );
}

export default App;
