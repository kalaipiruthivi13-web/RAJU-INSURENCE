import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  CheckCircle2,
  Building2,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import Button from '../components/ui/Button';

export function LoginPage() {
  const { login } = useAppData();
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' | 'USER'
  const [email, setEmail] = useState('rajkumar@rajuvendor.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setEmail('rajkumar@rajuvendor.in');
    } else {
      setEmail('priya.k@rajuvendor.in');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    login(selectedRole, { email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
            R
          </div>
          <div>
            <span className="font-black text-sm tracking-wider text-white block leading-tight">
              RAJU VENDOR
            </span>
            <span className="text-[10px] font-mono text-blue-400">IRDA/DB-784/21</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Broker Operations Node Active</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Portal Authentication
          </h1>
          <p className="text-xs text-slate-400">
            Select access profile or enter your broker credentials to sign in
          </p>
        </div>

        {/* 1-Click Fast Login Access Profiles */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Fast Access Profiles</span>
            <span className="text-blue-400 font-mono">1-Click Sign-in</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Admin Fast Login */}
            <button
              type="button"
              onClick={() => login('ADMIN')}
              className="p-3 rounded-xl border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 hover:border-indigo-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                  Admin
                </span>
                <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-2">
                <p className="font-bold text-xs text-white">R. Rajkumar</p>
                <p className="text-[10px] text-slate-400 leading-tight">Principal Broker • Full Access</p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-indigo-900/60 flex items-center justify-between text-[10px] font-bold text-indigo-300">
                <span>Login as Admin</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Staff / User Fast Login */}
            <button
              type="button"
              onClick={() => login('USER')}
              className="p-3 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/40 hover:border-blue-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                  Staff / User
                </span>
                <User className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-2">
                <p className="font-bold text-xs text-white">K. Priya</p>
                <p className="text-[10px] text-slate-400 leading-tight">Operations Executive • Daily Ops</p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-blue-900/60 flex items-center justify-between text-[10px] font-bold text-blue-300">
                <span>Login as User</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
            Or Standard Credentials
          </span>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3.5">
          {/* Role Pill Switcher */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Select Sign-In Role
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('USER')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'USER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>User Login</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Security Key / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            className="w-full justify-center bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2.5 shadow-md shadow-blue-600/20 cursor-pointer mt-2"
          >
            Sign In to {selectedRole === 'ADMIN' ? 'Admin Portal' : 'User Portal'} →
          </Button>
        </form>
      </div>

      {/* Footer Compliance Notice */}
      <div className="text-center text-[10px] text-slate-500 pb-2 space-y-1 max-w-lg mx-auto">
        <p className="flex items-center justify-center gap-2">
          <span>IRDAI Registered Direct Insurance Broker</span>
          <span>•</span>
          <span className="font-mono text-slate-400">IRDA/DB-784/21</span>
        </p>
        <p>256-Bit SSL Encrypted Session • ISO 27001 Certified Security Standard</p>
      </div>
    </div>
  );
}

export default LoginPage;
