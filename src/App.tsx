import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Upload, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Database, 
  MessageSquare,
  ChevronRight,
  Info,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type InputType = 'text' | 'file' | 'sql' | 'chat' | 'log';

interface Finding {
  type: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  value: string;
}

interface AnalysisResult {
  summary: string;
  content_type: string;
  findings: Finding[];
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  insights: string[];
}

export default function App() {
  const [inputType, setInputType] = useState<InputType>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [options, setOptions] = useState({
    mask: true,
    block_high_risk: true,
    log_analysis: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setInputType(e.target.files[0].name.endsWith('.log') ? 'log' : 'file');
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('input_type', inputType);
    formData.append('options', JSON.stringify(options));
    
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('content', content);
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SecureData AI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Terminal size={20} className="text-indigo-600" />
                  Data Ingestion
                </h2>
                <p className="text-sm text-slate-500 mt-1">Select source and input data for security scanning.</p>
              </div>

              <div className="p-6">
                {/* Source Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(['text', 'file', 'sql', 'chat', 'log'] as InputType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setInputType(type)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border",
                        inputType === type 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                      )}
                    >
                      {type === 'text' && <FileText size={16} />}
                      {type === 'file' && <Upload size={16} />}
                      {type === 'sql' && <Database size={16} />}
                      {type === 'chat' && <MessageSquare size={16} />}
                      {type === 'log' && <Terminal size={16} />}
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  {inputType === 'file' || inputType === 'log' ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".txt,.log,.pdf,.docx"
                      />
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-slate-400 group-hover:text-indigo-600" size={32} />
                      </div>
                      <h3 className="font-bold text-slate-700">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Supports .LOG, .TXT, .PDF, .DOCX (Max 50MB)
                      </p>
                    </div>
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`Enter ${inputType} content here...`}
                      className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                    />
                  )}

                  {/* Options */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        options.mask ? "bg-indigo-600" : "bg-slate-300"
                      )}>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={options.mask} 
                          onChange={() => setOptions(prev => ({ ...prev, mask: !prev.mask }))} 
                        />
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          options.mask ? "left-6" : "left-1"
                        )} />
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Mask Sensitive Data</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        options.block_high_risk ? "bg-indigo-600" : "bg-slate-300"
                      )}>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={options.block_high_risk} 
                          onChange={() => setOptions(prev => ({ ...prev, block_high_risk: !prev.block_high_risk }))} 
                        />
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          options.block_high_risk ? "left-6" : "left-1"
                        )} />
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Block High Risk</span>
                    </label>
                  </div>

                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing || (!content && !file)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="animate-spin" size={20} />
                        ANALYZING DATA...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        START SCANNING
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className={cn("p-1 h-2", getRiskColor(result.risk_level).split(' ')[1])} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <BarChart3 size={20} className="text-indigo-600" />
                          Risk Assessment
                        </h2>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border uppercase",
                          getRiskColor(result.risk_level)
                        )}>
                          {result.risk_level} Risk
                        </div>
                      </div>

                      <div className="flex items-end gap-2 mb-6">
                        <span className="text-5xl font-black tracking-tighter text-slate-900">{result.risk_score}</span>
                        <span className="text-slate-400 font-bold mb-1">/ 10</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden ml-4 mb-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.risk_score * 10}%` }}
                            className={cn("h-full", result.risk_score > 7 ? "bg-red-500" : result.risk_score > 4 ? "bg-orange-500" : "bg-indigo-500")}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-medium text-slate-700 italic">"{result.summary}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Insights Panel */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="font-bold flex items-center gap-2">
                        <Info size={18} className="text-indigo-600" />
                        AI-Powered Insights
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {result.insights.map((insight, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                          <ChevronRight size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-indigo-900 font-medium">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Findings List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" />
                        Detected Findings
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                        {result.findings.length} TOTAL
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {result.findings.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {result.findings.map((finding, i) => (
                            <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  LINE {finding.line} • {finding.type.replace('_', ' ')}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-black px-1.5 py-0.5 rounded uppercase border",
                                  getRiskColor(finding.risk)
                                )}>
                                  {finding.risk}
                                </span>
                              </div>
                              <p className="text-sm font-mono text-slate-700 break-all bg-slate-100 p-2 rounded mt-2">
                                {finding.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4 opacity-20" />
                          <p className="text-slate-400 font-medium">No immediate risks detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Shield size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400">Analysis Pending</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-[240px]">
                    Upload a file or enter text to begin the security intelligence scan.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Shield size={20} />
            <span className="font-bold text-sm">SecureData AI Platform v2.4</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Security Standards</span>
            <span>API Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
