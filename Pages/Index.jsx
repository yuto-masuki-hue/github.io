import React, { useState } from 'react';
import FileUploader from '../Components/upload/FileUploader.jsx'; 
import DataEditor from '../Components/review/DataEditor.jsx';
import DocumentPreview from '../Components/preview/DocumentPreview.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function InheritanceApp() {
  const [step, setStep] = useState('upload'); // upload, edit, preview
  const [extractedData, setExtractedData] = useState(null);

  const handleDataExtracted = (data) => {
    // Ensure clean data structure
    const cleanData = {
      deceased: data.deceased || {},
      heirs: Array.isArray(data.heirs) ? data.heirs : [],
      properties: Array.isArray(data.properties) ? data.properties : [],
      assignments: {}
    };
    setExtractedData(cleanData);
    setStep('edit');
  };

  const handleEditComplete = (data) => {
    setExtractedData(data);
    setStep('preview');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-serif font-bold">
              遺
            </div>
            <h1 className="text-xl font-bold tracking-tight">遺産分割協議書メーカー</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
             <span className={step === 'upload' ? 'text-indigo-600 font-semibold' : ''}>1. 取込</span>
             <span className="text-gray-300">/</span>
             <span className={step === 'edit' ? 'text-indigo-600 font-semibold' : ''}>2. 編集・分割</span>
             <span className="text-gray-300">/</span>
             <span className={step === 'preview' ? 'text-indigo-600 font-semibold' : ''}>3. 完成</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:w-full print:max-w-none">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">財産目録から、協議書を自動作成。</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  エクセルやPDFの財産一覧表をアップロードするだけで、AIが内容を読み取り、
                  きれいな遺産分割協議書（PDF）を作成します。<br/>
                  <span className="text-sm text-gray-400 mt-2 block">※ データはサーバーに保存されず、ブラウザ上でのみ処理されます。</span>
                </p>
              </div>
              <FileUploader onDataExtracted={handleDataExtracted} />
            </motion.div>
          )}

          {step === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DataEditor initialData={extractedData} onComplete={handleEditComplete} />
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DocumentPreview data={extractedData} onBack={() => setStep('edit')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}