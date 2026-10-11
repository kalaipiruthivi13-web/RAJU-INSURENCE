import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  FileText,
  RefreshCw,
  X,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { scanAndExtractDocument, SAMPLE_DOCUMENTS } from '../../services/documentScannerService';
import Button from '../ui/Button';

export function DocumentScanDropzone({
  onScanComplete,
  allowedPresets = null, // array of sample IDs to show, or null for all
  title = 'Smart Document / Photo Scan & Auto-Fill',
  subtitle = 'Upload RC Copy, Policy Copy, or Spot Photo to auto-fill form',
  compact = false,
  className = ''
}) {
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedResult, setScannedResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const availablePresets = allowedPresets
    ? SAMPLE_DOCUMENTS.filter((p) => allowedPresets.includes(p.id))
    : SAMPLE_DOCUMENTS;

  const handleProcessFile = async (file, presetId = null) => {
    setIsScanning(true);
    setScanProgress(15);
    setScannedResult(null);

    // Create preview if image
    if (file && file.type && file.type.startsWith('image/')) {
      try {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } catch (e) {
        // ignore
      }
    }

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 25;
      });
    }, 150);

    try {
      const fileObj = presetId ? { name: file.fileName, presetId, size: 450000 } : file;
      const res = await scanAndExtractDocument(fileObj, { delay: 650 });
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        setScannedResult(res);
        if (onScanComplete) {
          onScanComplete(res.data, res);
        }
      }, 200);
    } catch (err) {
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handlePresetSelect = (preset) => {
    handleProcessFile({ fileName: preset.fileName }, preset.id);
  };

  const handleClear = () => {
    setScannedResult(null);
    setPreviewUrl(null);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        scannedResult
          ? 'bg-emerald-50/70 border-emerald-300'
          : dragActive
          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300'
          : 'bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-blue-200/80 shadow-2xs'
      } p-3 ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Info & Scan Status */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              scannedResult
                ? 'bg-emerald-600 text-white'
                : isScanning
                ? 'bg-blue-600 text-white animate-pulse'
                : 'bg-[#1E4E8C] text-white shadow-2xs'
            }`}
          >
            {scannedResult ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {title}
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  AI OCR
                </span>
              </span>

              {scannedResult && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Auto-filled {scannedResult.extractedFieldsCount} fields
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {isScanning
                ? 'Analyzing document layout & extracting entities...'
                : scannedResult
                ? `Scanned: ${scannedResult.fileName} (${scannedResult.documentType})`
                : subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {scannedResult ? (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Re-scan
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1E4E8C] hover:bg-[#0B1E3D] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo / Doc
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scanning Progress Bar */}
      {isScanning && (
        <div className="mt-2.5 space-y-1">
          <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-blue-700 font-medium">
            <span>Extracting Vehicle Reg, Policy No, Client Name & Dates...</span>
            <span className="font-bold">{scanProgress}%</span>
          </div>
        </div>
      )}

      {/* Preset Test Chips for 1-Click Verification */}
      {!scannedResult && !isScanning && (
        <div className="mt-2 pt-2 border-t border-blue-200/50 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Test Presets:
          </span>
          {availablePresets.slice(0, 3).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 transition-colors cursor-pointer shadow-2xs"
            >
              + {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentScanDropzone;
