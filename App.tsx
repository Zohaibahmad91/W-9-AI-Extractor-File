
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import { ProcessingState, W9Data } from './types';
import { extractW9Data } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    total: 0,
    results: []
  });

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    // Reset and initialize state for new batch
    const newResults: W9Data[] = files.map(f => ({
      fileName: f.name,
      businessName: '',
      disregardedEntityName: '',
      taxClassification: '',
      otherClassification: '',
      address: '',
      cityStateZip: '',
      tin: '',
      status: 'pending'
    }));

    setState({
      isProcessing: true,
      progress: 0,
      total: files.length,
      results: newResults
    });

    // Process files sequentially to avoid rate limits
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to processing for the current file
      setState(prev => ({
        ...prev,
        results: prev.results.map((item, idx) => 
          idx === i ? { ...item, status: 'processing' } : item
        )
      }));

      try {
        const extracted = await extractW9Data(file);
        
        setState(prev => ({
          ...prev,
          progress: i + 1,
          results: prev.results.map((item, idx) => 
            idx === i ? { 
              ...item, 
              ...extracted, 
              status: 'completed' 
            } : item
          )
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          progress: i + 1,
          results: prev.results.map((item, idx) => 
            idx === i ? { 
              ...item, 
              status: 'error', 
              errorMessage: error.message || 'Extraction failed' 
            } : item
          )
        }));
      }
    }

    setState(prev => ({ ...prev, isProcessing: false }));
  };

  const downloadCSV = () => {
    const headers = [
      'File Name', 'Business Name', 'Entity Name', 
      'Classification', 'Other Classification', 
      'Address', 'City State Zip', 'TIN'
    ];
    
    const rows = state.results
      .filter(r => r.status === 'completed')
      .map(r => [
        `"${r.fileName}"`,
        `"${r.businessName}"`,
        `"${r.disregardedEntityName}"`,
        `"${r.taxClassification}"`,
        `"${r.otherClassification}"`,
        `"${r.address}"`,
        `"${r.cityStateZip}"`,
        `"${r.tin}"`
      ]);

    if (rows.length === 0) return;

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `w9_extraction_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progressPercentage = state.total > 0 ? (state.progress / state.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        <section>
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Automate your W-9 Data Entry</h2>
            <p className="text-slate-600 mb-8 max-w-2xl">
              Upload your tax forms, and our AI will automatically extract legal names, tax classifications, 
              addresses, and identification numbers into a structured spreadsheet format.
            </p>
            <FileUploader 
              onFilesSelected={handleFilesSelected} 
              disabled={state.isProcessing} 
            />
          </div>
        </section>

        {state.total > 0 && (
          <section className="space-y-6">
            {state.isProcessing && (
              <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-indigo-700">Processing Batch</span>
                  <span className="text-sm font-bold text-indigo-900">{state.progress} / {state.total} Files</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <DataTable 
              data={state.results} 
              onDownloadCSV={downloadCSV} 
            />
          </section>
        )}

        {!state.isProcessing && state.results.length === 0 && (
           <section className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Privacy First', desc: 'Documents are processed via secure Gemini API and never stored on our servers.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { title: 'High Accuracy', desc: 'Powered by Gemini 3 Flash for industry-leading OCR and structured data extraction.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Batch Export', desc: 'Extract data from dozens of forms at once and download as a universal CSV file.', icon: 'M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4' }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                  <div className="bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              ))}
           </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">W-9 AI Extractor Pro &copy; {new Date().getFullYear()} - Optimized for Financial Compliance</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
