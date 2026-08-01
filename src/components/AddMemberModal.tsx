import React, { useState } from 'react';
import { X, UserPlus, Users, GraduationCap, Loader2 } from 'lucide-react';
import { Member, MemberType } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: Omit<Member, 'id' | 'memberNumber' | 'registrationDate' | 'active'>) => void;
}

const GRADES_OPTIONS = [
  "I-1", "I-2", "II-1", "II-2", "III-1", "III-2", "IV-1", "IV-2",
  "V-а", "V-б", "VI-а", "VI-б", "VII-а", "VII-б", "VIII-а", "VIII-б", "IX-а", "IX-б",
  "Наставник", "Персонал"
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [fullName, setFullName] = useState('');
  const [gradeClass, setGradeClass] = useState('VI-а');
  const [type, setType] = useState<MemberType>('ученик');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || isSubmitting) return;

    const memberData = {
      fullName: fullName.trim(),
      gradeClass: type === 'ученик' ? gradeClass : (gradeClass.includes('Наставник') ? gradeClass : 'Наставник / Кадар'),
      type,
      phone: phone.trim() || '078 000-000',
      email: email.trim() || `${fullName.split(' ')[0].toLowerCase()}@oouilinden-kp.edu.mk`,
      notes: notes.trim() || 'Новорегистриран член во ООУ „Илинден“.'
    };

    setIsSubmitting(true);
    try {
      // Save directly to Firestore using collection(db, "members") and addDoc
      await addDoc(collection(db, "members"), {
        ...memberData,
        memberNumber: `ИЛ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationDate: new Date().toISOString().split('T')[0],
        active: true
      });
    } catch (err) {
      console.error("Грешка при зачувување на член во Firestore:", err);
    } finally {
      onAddMember(memberData);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Регистрирање на Нов Член
            </h2>
            <p className="text-xs text-slate-300">
              ООУ „Илинден“ Крива Паланка • Нов ученик или наставник
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Име и Презиме *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="напр. Марко Стојановски, Елена Петровска..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Тип на член</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as MemberType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ученик">Ученик</option>
                <option value="наставник">Наставник</option>
                <option value="персонал">Персонал / Вработен</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Одделение / Улога</label>
              <select
                value={gradeClass}
                onChange={e => setGradeClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {GRADES_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Телефон за контакт</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="078 123-456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Е-пошта</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ucenik@oouilinden-kp.edu.mk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Забелешка / Белешка</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Белешка за библиотекарот..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition shadow-md flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Се зачувува во Firestore...' : 'Регистрирај член'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
