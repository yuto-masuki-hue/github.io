import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

export default function DocumentPreview({ data, onBack }) {
  
  const handlePrint = () => {
    window.print();
  };

  // Group properties by heir
  const getHeirInheritance = () => {
    const mapping = {};
    data.heirs.forEach(h => {
      mapping[h.id] = {
        info: h,
        properties: []
      };
    });

    Object.entries(data.assignments || {}).forEach(([propId, heirId]) => {
      if (heirId && mapping[heirId]) {
        const prop = data.properties.find(p => p.id === propId);
        if (prop) mapping[heirId].properties.push(prop);
      }
    });

    return Object.values(mapping).filter(m => m.properties.length > 0);
  };

  const inheritanceGroups = getHeirInheritance();

  // Get current date for the document
  const today = new Date();
  const dateStr = `令和 ${today.getFullYear() - 2018} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> 編集に戻る
        </Button>
        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700">
          <Printer className="w-4 h-4 mr-2" /> PDFとして保存 / 印刷
        </Button>
      </div>

      <div className="bg-white p-12 shadow-lg min-h-[297mm] mx-auto print:shadow-none print:p-0 print:w-full">
        {/* Document Content - A4 Style */}
        <div className="max-w-[180mm] mx-auto space-y-8 font-serif text-gray-900 leading-relaxed print:max-w-none">
          
          <h1 className="text-3xl font-bold text-center mb-12 tracking-widest border-b-2 border-black pb-4">遺産分割協議書</h1>

          <div className="space-y-4">
            <p>
              被相続人 {data.deceased?.name}（{data.deceased?.deathDate}死亡、最後の住所：{data.deceased?.lastAddress}）の遺産について、
              共同相続人全員で協議をした結果、以下の通り分割することに合意した。
            </p>
          </div>

          <div className="space-y-8 mt-8">
            {inheritanceGroups.map((group, idx) => (
              <div key={group.info.id} className="space-y-3">
                <h3 className="font-bold text-lg border-b border-gray-400 pb-1">
                  第{idx + 1}条（{group.info.name}の取得分）
                </h3>
                <p>
                  相続人 {group.info.name} は、以下の遺産を取得する。
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
                  {group.properties.map(prop => (
                    <li key={prop.id} className="pl-2">
                      <span className="font-semibold">【{prop.type}】</span>
                      <span className="ml-2">{prop.details}</span>
                      {prop.value && <span className="ml-2 text-sm text-gray-600">（評価額: {prop.value}）</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* If there are no assignments yet */}
            {inheritanceGroups.length === 0 && (
               <p className="text-red-500 italic print:hidden">
                 ※ 財産の分割指定がされていません。「編集に戻る」から財産を誰が相続するか指定してください。
               </p>
            )}
          </div>

          <div className="space-y-4 mt-12">
            <h3 className="font-bold text-lg border-b border-gray-400 pb-1">
              第{inheritanceGroups.length + 1}条（事後の発見）
            </h3>
            <p>
              本協議書に記載のない遺産が後日判明した場合には、相続人 {data.heirs[0]?.name || '代表者'} がこれを取得する。
              <span className="text-xs text-gray-400 ml-2 print:hidden">（※標準的な条項ですが、必要に応じて手書き修正等が可能です）</span>
            </p>
          </div>

          <div className="mt-16 space-y-4 page-break-inside-avoid">
            <p>
              以上の協議の成立を証するため、本協議書を{data.heirs.length}通作成し、
              各相続人が署名（記名）押印の上、各自１通を保有する。
            </p>
            
            <p className="text-right mt-8 mr-8">
              {dateStr}
            </p>

            <div className="space-y-12 mt-12">
              {data.heirs.map(heir => (
                <div key={heir.id} className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <div className="flex">
                      <span className="w-24 font-bold">住　所</span>
                      <span>{heir.address}</span>
                    </div>
                    <div className="flex items-end">
                      <span className="w-24 font-bold">相続人</span>
                      <span className="text-xl">{heir.name}</span>
                      <span className="ml-auto text-gray-300 border-b border-gray-300 w-24 text-center mr-12 text-sm">実印</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white {
            box-shadow: none !important;
          }
          /* Print only the document container */
          .max-w-\\[180mm\\] {
            max-width: none !important;
            width: 100% !important;
          }
          /* Target the specific container for printing */
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm !important;
          }
        }
      `}</style>
    </div>
  );
}