
import React, { useRef } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative group border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out text-center 
        ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`}
      onClick={!disabled ? triggerUpload : undefined}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".pdf,image/*"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center">
        <div className={`p-4 rounded-full mb-4 ${disabled ? 'bg-slate-100' : 'bg-indigo-100 group-hover:bg-indigo-200'}`}>
          <svg className={`w-8 h-8 ${disabled ? 'text-slate-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className={`text-lg font-semibold ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
          {disabled ? 'Processing Files...' : 'Upload W-9 Documents'}
        </h3>
        <p className={`mt-1 text-sm ${disabled ? 'text-slate-400' : 'text-slate-500'}`}>
          Select multiple PDFs or images from your folder
        </p>
        <button
          disabled={disabled}
          className={`mt-6 px-6 py-2 rounded-lg font-medium shadow-sm transition-colors
            ${disabled ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
