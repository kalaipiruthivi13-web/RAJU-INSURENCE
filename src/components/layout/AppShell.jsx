import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RegisterNewClaimModal from '../claims/RegisterNewClaimModal';
import TowingRequestModal from '../dashboard/TowingRequestModal';
import { useAppData } from '../../context/AppDataContext';

export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    showRegisterClaimModal,
    setShowRegisterClaimModal,
    showTowingModal,
    setShowTowingModal
  } = useAppData();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-3 sm:p-4 lg:p-4.5 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Register New Claim Modal */}
      <RegisterNewClaimModal
        isOpen={showRegisterClaimModal}
        onClose={() => setShowRegisterClaimModal(false)}
      />

      {/* Global Roadside Assistance & Towing Modal */}
      <TowingRequestModal
        isOpen={showTowingModal}
        onClose={() => setShowTowingModal(false)}
      />
    </div>
  );
}

export default AppShell;
