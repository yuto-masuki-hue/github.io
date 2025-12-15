import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function FileUploader({ onDataExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Upload file to get URL for the LLM
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // 2. Call LLM to extract data
      const prompt = `
        この画像は相続財産と相続人の一覧表（全体集計表）です。
        以下の情報を抽出し、指定されたJSON形式のみを返してください。余計な説明は不要です。

        **抽出項目:**
        1. 被相続人（亡くなった方）の情報（氏名、死亡日、最後の住所 - 画像になければ空でOK）
        2. 相続人リスト（氏名、続柄、現在の住所）
        3. 財産リスト（種類: 不動産/預貯金/株式など、詳細: 所在や口座番号など、評価額）

        **JSON Schema:**
        {
          "deceased": { "name": "...", "deathDate": "...", "lastAddress": "..." },
          "heirs": [
            { "id": "h1", "name": "...", "relation": "...", "address": "..." }
          ],
          "properties": [
            { "id": "p1", "type": "...", "details": "...", "value": "..." }
          ]
        }
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [file_url],
        response_json_schema: {
            type: "object",
            properties: {
                deceased: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        deathDate: { type: "string" },
                        lastAddress: { type: "string" }
                    }
                },
                heirs: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            relation: { type: "string" },
                            address: { type: "string" }
                        }
                    }
                },
                properties: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            type: { type: "string" },
                            details: { type: "string" },
                            value: { type: "string" }
                        }
                    }
                }
            }
        }
      });

      console.log("Extracted Data:", result);
      onDataExtracted(result);

    } catch (err) {
      console.error(err);
      setError("画像の解析に失敗しました。もう一度お試しください。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <Card 
        className={`p-8 border-2 border-dashed transition-colors bg-white/50 backdrop-blur-sm ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">AIが画像を解析中...</h3>
              <p className="text-sm text-gray-500">財産目録と相続人情報を抽出しています</p>
            </div>
          </div>
        ) : (
          <div onClick={handleClick} className="cursor-pointer text-center py-8">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf"
            />
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-indigo-50 rounded-full">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ここに画像をドロップ
            </h3>
            <p className="text-gray-500 mb-6">
              またはクリックしてファイルを選択<br/>
              (財産目録や相続関係図の画像・PDF)
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              <FileText className="w-3 h-3" />
              <span>JPG, PNG, PDF 対応</span>
            </div>
          </div>
        )}
      </Card>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}
    </div>
  );
}