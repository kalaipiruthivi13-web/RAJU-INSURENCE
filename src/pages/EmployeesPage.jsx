import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  ReceiptText,
  CheckCircle2,
  XCircle,
  Download,
  Printer
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export function EmployeesPage({ initialTab = 'directory' }) {
  const { employees, leaves, updateLeaveStatus, globalSearch } = useAppData();

  const [activeHrTab, setActiveHrTab] = useState(initialTab);
  const [selectedEmpForPayroll, setSelectedEmpForPayroll] = useState(employees[0]);
  const [payrollMonth, setPayrollMonth] = useState('September 2024');
  const [bonusInput, setBonusInput] = useState('2000');
  const [leaveDeductionInput, setLeaveDeductionInput] = useState('0');

  useEffect(() => {
    if (initialTab) {
      setActiveHrTab(initialTab);
    }
  }, [initialTab]);

  const filteredEmployees = employees.filter((emp) => {
    if (!globalSearch) return true;
    const term = globalSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term)
    );
  });

  // Payroll Calculation
  const basic = selectedEmpForPayroll ? selectedEmpForPayroll.basicSalary : 35000;
  const allowances = selectedEmpForPayroll ? selectedEmpForPayroll.allowances : 8000;
  const standardDeductions = selectedEmpForPayroll ? selectedEmpForPayroll.deductions : 2500;
  const bonus = Number(bonusInput) || 0;
  const leaveDeduction = Number(leaveDeductionInput) || 0;

  const grossEarnings = basic + allowances + bonus;
  const totalDeductions = standardDeductions + leaveDeduction;
  const netPayable = grossEarnings - totalDeductions;

  const employeeColumns = [
    {
      key: 'name',
      label: 'Staff Member',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {row.avatar || 'EM'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{val}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Designation & Dept',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <p className="text-xs text-slate-400">{row.department} Division</p>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Mobile',
      render: (val) => <span className="font-mono text-xs text-slate-600">{val}</span>
    },
    {
      key: 'basicSalary',
      label: 'Basic Salary',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-slate-900">
          ₹{val.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'Active' ? 'active' : 'neutral'} dot size="sm">
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedEmpForPayroll(row);
            setActiveHrTab('payroll');
          }}
        >
          Generate Slip
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Employee Directory, Leave & Payroll
            </h1>
            <Badge variant="primary" size="sm">Operations</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff profiles, review leave applications, and calculate monthly salary payslips.
          </p>
        </div>

        {/* HR Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
          {[
            { id: 'directory', label: 'Staff Directory', icon: Users },
            { id: 'leaves', label: `Leave Approvals (${leaves.filter(l => l.status === 'Pending').length})`, icon: CalendarCheck },
            { id: 'payroll', label: 'Payroll Slip Generator', icon: ReceiptText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveHrTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeHrTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeHrTab === 'directory' && (
        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          searchPlaceholder="Search staff by name, role or email..."
          emptyMessage="No employees found"
        />
      )}

      {/* TAB 2: Leave Approvals */}
      {activeHrTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Leave Requests & Approvals ({leaves.length})
            </h3>
            <span className="text-xs text-slate-500">
              Approve or reject agency employee leave applications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {leaves.map((leave) => {
              const isPending = leave.status === 'Pending';
              const isApproved = leave.status === 'Approved';

              return (
                <div
                  key={leave.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {leave.id}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs font-bold text-indigo-900">
                          {leave.leaveType}
                        </span>
                      </div>
                      <Badge
                        variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                        size="sm"
                        dot
                      >
                        {leave.status}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-2">
                      {leave.employeeName}
                    </h4>

                    <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                      <p>
                        <strong className="text-slate-700">Duration:</strong> {leave.startDate} to{' '}
                        {leave.endDate} ({leave.days} Days)
                      </p>
                      <p>
                        <strong className="text-slate-700">Reason:</strong> {leave.reason}
                      </p>
                      <p className="text-[11px] text-slate-400">Applied on {leave.appliedOn}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
                    {isPending ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => updateLeaveStatus(leave.id, 'Rejected')}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => updateLeaveStatus(leave.id, 'Approved')}
                        >
                          Approve Leave
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 italic">
                        Request has been {leave.status.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Payroll Slip Generator */}
      {activeHrTab === 'payroll' && selectedEmpForPayroll && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Payroll Inputs & Staff Select
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Employee
              </label>
              <select
                value={selectedEmpForPayroll.id}
                onChange={(e) => {
                  const emp = employees.find((x) => x.id === e.target.value);
                  if (emp) setSelectedEmpForPayroll(emp);
                }}
                className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pay Period / Month
              </label>
              <input
                type="text"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Performance Bonus / Incentive (₹)
              </label>
              <input
                type="number"
                value={bonusInput}
                onChange={(e) => setBonusInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unpaid Leave LOP Deductions (₹)
              </label>
              <input
                type="number"
                value={leaveDeductionInput}
                onChange={(e) => setLeaveDeductionInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-indigo-200/60 text-xs text-indigo-900">
              <span className="font-bold block">Calculation Formula:</span>
              <p className="mt-0.5 font-mono text-[11px]">
                Net Pay = (Basic + Allowances + Bonus) - (PF/Tax + Leave LOP)
              </p>
            </div>
          </div>

          {/* Printable Salary Slip Card */}
          <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">RAJU VENDOR</h2>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800">
                      SALARY PAYSLIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Insurance Brokerage & Agency Firm • Operations Division
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">{payrollMonth}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    REF: SLIP-{selectedEmpForPayroll.id}-2024
                  </span>
                </div>
              </div>

              {/* Staff Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee Name</span>
                  <strong className="text-slate-900">{selectedEmpForPayroll.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Designation</span>
                  <strong className="text-slate-800">{selectedEmpForPayroll.role}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <strong className="text-slate-800">{selectedEmpForPayroll.department}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Join Date</span>
                  <strong className="text-slate-800">{selectedEmpForPayroll.joinDate}</strong>
                </div>
              </div>

              {/* Earnings vs Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/80 px-3.5 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Earnings Breakdown
                  </div>
                  <div className="p-3.5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Pay</span>
                      <span className="font-semibold">₹{basic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">HRA & Allowances</span>
                      <span className="font-semibold">₹{allowances.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Broker Incentive / Bonus</span>
                      <span className="font-bold">+₹{bonus.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings</span>
                      <span>₹{grossEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/80 px-3.5 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Statutory Deductions
                  </div>
                  <div className="p-3.5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund (PF)</span>
                      <span className="font-semibold">₹{(standardDeductions * 0.6).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional Tax (PT)</span>
                      <span className="font-semibold">₹{(standardDeductions * 0.4).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Leave LOP Deductions</span>
                      <span className="font-bold">-₹{leaveDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span>₹{totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Pay Pill with Dual-Color Background */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Net Take-Home Salary
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Direct Bank Transfer via Agency Current Account
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{netPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Pay Slip
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Download}
                onClick={() => alert(`Salary slip for ${selectedEmpForPayroll.name} generated & sent via email.`)}
              >
                Generate & Dispatch Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
