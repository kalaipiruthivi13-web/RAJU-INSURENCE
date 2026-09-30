import React from 'react';
import { Lock } from 'lucide-react';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import QuotesPage from './pages/QuotesPage';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import RenewalsPage from './pages/RenewalsPage';
import LoansPage from './pages/LoansPage';
import EmployeesPage from './pages/EmployeesPage';
import CompaniesMasterPage from './pages/CompaniesMasterPage';
import ReportsAuditPage from './pages/ReportsAuditPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function AccessRestrictedBanner({ title = 'Administrator Access Required' }) {
  const { setActiveTab } = useAppData();
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center max-w-lg mx-auto my-12 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your current profile (Staff / User) has standard operations access. This section requires Principal Broker or Administrator privileges.
        </p>
      </div>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
      >
        Return to Operational Dashboard →
      </button>
    </div>
  );
}

function MainRouter() {
  const { activeTab, isAuthenticated, currentUser, setActiveTab } = useAppData();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'dashboard-settlements':
        return <DashboardPage />;
      case 'applications':
      case 'wizard':
      case 'insurance':
      case 'motor-insurance':
      case 'health-insurance':
        return <ApplicationsPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'policies':
        return <PoliciesPage />;
      case 'claims':
      case 'claims-tracker':
      case 'claims-new':
      case 'claims-pending':
      case 'claims-settlements':
        return <ClaimsPage />;
      case 'renewals':
        return <RenewalsPage />;
      case 'loans':
      case 'loans-dashboard':
      case 'loans-new':
      case 'loans-ledger':
      case 'loans-applications':
      case 'loans-active':
      case 'loans-repayments':
      case 'loans-settlement':
        return <LoansPage />;
      case 'staff':
        return isAdmin ? <EmployeesPage initialTab="directory" /> : <AccessRestrictedBanner title="HR Directory Restricted" />;
      case 'leaves':
        return isAdmin ? <EmployeesPage initialTab="leaves" /> : <AccessRestrictedBanner title="Leave Management Restricted" />;
      case 'payroll':
        return isAdmin ? <EmployeesPage initialTab="payroll" /> : <AccessRestrictedBanner title="Payroll Processing Restricted" />;
      case 'companies':
        return isAdmin ? <CompaniesMasterPage initialTab="companies" /> : <AccessRestrictedBanner title="Insurance Partners Restricted" />;
      case 'products':
        return isAdmin ? <CompaniesMasterPage initialTab="products" /> : <AccessRestrictedBanner title="Products Master Restricted" />;
      case 'repository':
        return isAdmin ? <CompaniesMasterPage initialTab="repository" /> : <AccessRestrictedBanner title="Documents Repository Restricted" />;
      case 'reports':
      case 'audit':
        return <ReportsAuditPage />;
      case 'settings':
      case 'settings-permissions':
      case 'settings-users':
      case 'settings-partners':
      case 'settings-docs':
      case 'settings-system':
      case 'settings-audit':
        return isAdmin ? <SettingsPage /> : <AccessRestrictedBanner title="Permissions & Roles Restricted" />;
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
