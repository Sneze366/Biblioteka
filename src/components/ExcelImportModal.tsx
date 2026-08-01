import React, { useState, useRef } from 'react';
import { 
  X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, 
  Download, Users, ArrowRight, Table, FileCheck, RefreshCw, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Member, MemberType } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembersCount: number;
  onImportMembers: (newMembers: Member[], replaceExisting: boolean) => void;
}

interface ColumnMapping {
  fullName: number;
  gradeClass: number;
  type: number;
  phone: number;
  email: number;
  memberNumber: number;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingMembersCount,
  onImportMembers,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colMapping, setColMapping] = useState<ColumnMapping>({
    fullName: -1,
    gradeClass: -1,
    type: -1,
    phone: -1,
    email: -1,
    memberNumber: -1,
  });
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [parsedMembers, setParsedMembers] = useState<Partial<Member>[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setErrorMsg(null);
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Parse sheet to array of arrays
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

        if (!data || data.length === 0) {
          setErrorMsg("Избраниот фајл е празен или нема податоци.");
          setIsProcessing(false);
          return;
        }

        // Filter out completely empty rows
        const nonEmptyRows = data.filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''));

        if (nonEmptyRows.length === 0) {
          setErrorMsg("Фајлот не содржи пополнети редови.");
          setIsProcessing(false);
          return;
        }

        const firstRow = nonEmptyRows[0].map(c => String(c ?? '').trim());
        setHeaders(firstRow);
        setRawRows(nonEmptyRows);

        // Smart column mapping detection
        const autoMapping: ColumnMapping = {
          fullName: -1,
          gradeClass: -1,
          type: -1,
          phone: -1,
          email: -1,
          memberNumber: -1,
        };

        firstRow.forEach((h, index) => {
          const lower = h.toLowerCase();
          if (autoMapping.fullName === -1 && (lower.includes('име') || lower.includes('презиме') || lower.includes('ученик') || lower.includes('член') || lower.includes('корисник') || lower.includes('name') || lower.includes('student'))) {
            autoMapping.fullName = index;
          } else if (autoMapping.gradeClass === -1 && (lower.includes('одд') || lower.includes('клас') || lower.includes('одделение') || lower.includes('grade') || lower.includes('class'))) {
            autoMapping.gradeClass = index;
          } else if (autoMapping.phone === -1 && (lower.includes('тел') || lower.includes('телефон') || lower.includes('повик') || lower.includes('phone') || lower.includes('mobile'))) {
            autoMapping.phone = index;
          } else if (autoMapping.email === -1 && (lower.includes('емаил') || lower.includes('е-пошта') || lower.includes('email') || lower.includes('mail'))) {
            autoMapping.email = index;
          } else if (autoMapping.type === -1 && (lower.includes('тип') || lower.includes('вид') || lower.includes('улога') || lower.includes('role') || lower.includes('type'))) {
            autoMapping.type = index;
          } else if (autoMapping.memberNumber === -1 && (lower.includes('број') || lower.includes('ид') || lower.includes('id') || lower.includes('блок') || lower.includes('номер'))) {
            autoMapping.memberNumber = index;
          }
        });

        // Fallback mapping if auto-detection missed full name
        if (autoMapping.fullName === -1) {
          autoMapping.fullName = 0; // default to first column
        }
        if (autoMapping.gradeClass === -1 && firstRow.length > 1) {
          autoMapping.gradeClass = 1; // default to second column
        }

        setColMapping(autoMapping);
        parseMembersWithMapping(nonEmptyRows, autoMapping, true);

      } catch (err) {
        console.error("Грешка при читање на Excel фајлот:", err);
        setErrorMsg("Настана грешка при читање на фајлот. Проверете дали фајлот е валиден .xlsx, .xls или .csv.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Неуспешно читање на фајлот од компјутерот.");
      setIsProcessing(false);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Convert raw rows into Member objects using selected column mapping
  const parseMembersWithMapping = (rows: any[][], mapping: ColumnMapping, headerRow: boolean) => {
    const dataRows = headerRow ? rows.slice(1) : rows;
    
    const parsedList: Partial<Member>[] = [];

    dataRows.forEach((row, idx) => {
      if (!Array.isArray(row)) return;

      const rawName = mapping.fullName >= 0 ? String(row[mapping.fullName] ?? '').trim() : '';
      if (!rawName) return; // Skip rows without name

      const rawGrade = mapping.gradeClass >= 0 ? String(row[mapping.gradeClass] ?? '').trim() : 'VI-а';
      const rawPhone = mapping.phone >= 0 ? String(row[mapping.phone] ?? '').trim() : '';
      const rawEmail = mapping.email >= 0 ? String(row[mapping.email] ?? '').trim() : '';
      const rawType = mapping.type >= 0 ? String(row[mapping.type] ?? '').toLowerCase().trim() : '';
      const rawNum = mapping.memberNumber >= 0 ? String(row[mapping.memberNumber] ?? '').trim() : '';

      let mType: MemberType = 'ученик';
      if (rawType.includes('настав') || rawType.includes('проф') || rawType.includes('учител') || rawType.includes('teacher')) {
        mType = 'наставник';
      } else if (rawType.includes('персон') || rawType.includes('вработен') || rawType.includes('staff')) {
        mType = 'персонал';
      }

      parsedList.push({
        fullName: rawName,
        gradeClass: rawGrade || 'VI-а',
        type: mType,
        phone: rawPhone,
        email: rawEmail,
        memberNumber: rawNum || `ЧЛ-${1001 + idx + (replaceExisting ? 0 : existingMembersCount)}`,
        notes: 'Увезен корисник од Excel'
      });
    });

    setParsedMembers(parsedList);
  };

  const handleMappingChange = (field: keyof ColumnMapping, colIdx: number) => {
    const newMapping = { ...colMapping, [field]: colIdx };
    setColMapping(newMapping);
    parseMembersWithMapping(rawRows, newMapping, hasHeaderRow);
  };

  const handleHeaderRowToggle = (checked: boolean) => {
    setHasHeaderRow(checked);
    parseMembersWithMapping(rawRows, colMapping, checked);
  };

  // Execute import
  const handleConfirmImport = () => {
    if (parsedMembers.length === 0) {
      setErrorMsg("Нема пронајдено валидни корисници за увоз.");
      return;
    }

    const finalMembersList: Member[] = parsedMembers.map((pm, idx) => ({
      id: `member-imp-${Date.now()}-${idx}-${Math.floor(Math.random()*1000)}`,
      fullName: pm.fullName || 'Непознат корисник',
      gradeClass: pm.gradeClass || 'VI-а',
      type: pm.type || 'ученик',
      phone: pm.phone || '',
      email: pm.email || '',
      memberNumber: pm.memberNumber || `ЧЛ-${2000 + idx}`,
      notes: pm.notes || 'Увезен од Excel',
      registeredAt: new Date().toISOString().split('T')[0]
    }));

    onImportMembers(finalMembersList, replaceExisting);
    onClose();
  };

  // Download sample template for user
  const handleDownloadTemplate = () => {
    const sampleData = [
      ["Име и Презиме", "Одделение / Клас", "Телефон", "Тип (ученик/наставник)", "Е-пошта"],
      ["Марко Стојановски", "VI-а", "078 123-456", "ученик", "marko@email.com"],
      ["Елена Ангеловска", "VII-б", "071 987-654", "ученик", "elena@email.com"],
      ["Александар Николовски", "Наставник", "070 555-333", "наставник", "aleksandar@school.edu.mk"],
      ["Јована Петровска", "I-1", "075 444-222", "ученик", "jovana@email.com"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ученици");
    XLSX.writeFile(wb, "Пример_Ученици_Библиотека.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-3xl w-full border border-[#E6E8E0] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#3A4B3D] rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-[#D9E4DD]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-serif">Брз увоз на корисници од Excel (XLSX / CSV)</h3>
              <p className="text-xs text-[#D9E4DD]">Внесете ја вашата листа на ученици или наставници одеднаш</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#D9E4DD] hover:text-white hover:bg-[#3A4B3D] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Upload Area */}
          {!file ? (
            <div className="space-y-4">
              
              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#A8763E]/40 hover:border-[#A8763E] bg-[#F1F3ED]/60 hover:bg-[#F1F3ED] p-8 rounded-3xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group"
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <div className="w-14 h-14 rounded-2xl bg-[#A8763E]/10 text-[#A8763E] group-hover:scale-110 transition flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="font-bold text-[#2C332D] text-base">Притиснете за избор на Excel фајл</h4>
                  <p className="text-xs text-[#8B9285] mt-1">
                    Поддржани формати: <strong>.XLSX</strong>, <strong>.XLS</strong> или <strong>.CSV</strong>
                  </p>
                </div>

                <div className="text-[11px] text-[#A8763E] font-bold bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                  Drag & Drop фајлот тука
                </div>
              </div>

              {/* Download Template Option */}
              <div className="flex items-center justify-between p-4 bg-[#F1F3ED] rounded-2xl border border-[#E6E8E0] text-xs">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#5D8A66]" />
                  <div>
                    <span className="font-bold text-[#2C332D]">Немате подготвено Excel фајл?</span>
                    <p className="text-[#8B9285] text-[11px]">Преземете подготвен пример шаблон во Excel со точни колони.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="bg-[#5D8A66] hover:bg-[#4D7454] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Симни пример Excel</span>
                </button>
              </div>

            </div>
          ) : (
            
            /* File Uploaded & Processing Options */
            <div className="space-y-5">
              
              {/* File details bar */}
              <div className="flex items-center justify-between p-4 bg-[#F1F3ED] rounded-2xl border border-[#E6E8E0]">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-6 h-6 text-[#5D8A66]" />
                  <div>
                    <h5 className="font-bold text-[#2C332D] text-sm">{file.name}</h5>
                    <p className="text-xs text-[#8B9285]">
                      Вкупно пронајдени редови: <strong>{rawRows.length}</strong> • Подготвени за увоз: <strong className="text-[#5D8A66]">{parsedMembers.length} корисници</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setRawRows([]);
                    setParsedMembers([]);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold underline"
                >
                  Избери друг фајл
                </button>
              </div>

              {/* Column Mapping Controls */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6E8E0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1F3ED] pb-2">
                  <h5 className="font-bold text-xs text-[#2C332D] uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#A8763E]" />
                    <span>Подесување на колоните од вашиот Excel:</span>
                  </h5>

                  <label className="flex items-center gap-2 text-xs text-[#2C332D] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasHeaderRow} 
                      onChange={e => handleHeaderRowToggle(e.target.checked)}
                      className="rounded accent-[#A8763E]"
                    />
                    <span>Првиот ред е заглавие (наслови)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Име и Презиме <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={colMapping.fullName}
                      onChange={e => handleMappingChange('fullName', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl font-bold text-[#2C332D]"
                    >
                      <option value={-1}>-- Не е избрано --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Одделение / Клас
                    </label>
                    <select
                      value={colMapping.gradeClass}
                      onChange={e => handleMappingChange('gradeClass', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Без колона (Стандардно: VI-а) --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Телефонски број
                    </label>
                    <select
                      value={colMapping.phone}
                      onChange={e => handleMappingChange('phone', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Празно --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Import Mode Toggle */}
              <div className="bg-[#F1F3ED]/80 p-4 rounded-2xl border border-[#E6E8E0] space-y-2">
                <label className="block text-xs font-bold text-[#2C332D]">Начин на внесување во базата:</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 font-bold transition ${!replaceExisting ? 'bg-white border-[#5D8A66] text-[#2C332D] shadow-xs' : 'border-transparent text-[#8B9285]'}`}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={!replaceExisting} 
                      onChange={() => setReplaceExisting(false)} 
                      className="accent-[#5D8A66]"
                    />
                    <Plus className="w-4 h-4 text-[#5D8A66]" />
                    <span>Додај на постоечките корисници ({existingMembersCount})</span>
                  </label>

                  <label className={`flex-1 p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 font-bold transition ${replaceExisting ? 'bg-white border-rose-500 text-rose-800 shadow-xs' : 'border-transparent text-[#8B9285]'}`}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={replaceExisting} 
                      onChange={() => setReplaceExisting(true)} 
                      className="accent-rose-600"
                    />
                    <RefreshCw className="w-4 h-4 text-rose-600" />
                    <span>Замени ги постоечките и стави ги само овие</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#2C332D]">
                  <span className="font-bold">Преглед на членови што ќе бидат увезени ({parsedMembers.length}):</span>
                  <span className="text-[#8B9285]">Приказани првите 10 редови</span>
                </div>

                <div className="border border-[#E6E8E0] rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-white text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F1F3ED] text-[#2C332D] font-bold border-b border-[#E6E8E0]">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Име и Презиме</th>
                        <th className="p-2.5">Одделение</th>
                        <th className="p-2.5">Тип</th>
                        <th className="p-2.5">Телефон</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3ED] text-[#2C332D]">
                      {parsedMembers.slice(0, 10).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-[#8B9285]">{idx + 1}</td>
                          <td className="p-2.5 font-bold">{m.fullName}</td>
                          <td className="p-2.5">{m.gradeClass}</td>
                          <td className="p-2.5 capitalize">{m.type}</td>
                          <td className="p-2.5">{m.phone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#F1F3ED] border-t border-[#E6E8E0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-[#2C332D] hover:bg-[#E6E8E0] rounded-xl transition"
          >
            Откажи
          </button>

          {file && (
            <button
              type="button"
              disabled={parsedMembers.length === 0}
              onClick={handleConfirmImport}
              className="bg-[#A8763E] hover:bg-[#966835] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Увези {parsedMembers.length} корисници во базата</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
