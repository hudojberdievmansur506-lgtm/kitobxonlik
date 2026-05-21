import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  Check, 
  AlertCircle, 
  Settings, 
  ListOrdered 
} from 'lucide-react';
import { 
  StudentRegistration, 
  LiteratureBook, 
  CourseType, 
  EducationLevelType 
} from '../types';
import { 
  BAKALAVRIAT_DIRECTIONS, 
  MAGISTRATURA_DIRECTIONS 
} from '../data/constants';

interface StudentFormProps {
  books: LiteratureBook[];
  onStartQuiz: (registration: StudentRegistration) => void;
  onOpenAdmin: () => void;
}

export default function StudentForm({ books, onStartQuiz, onOpenAdmin }: StudentFormProps) {
  const [familiyaIsm, setFamiliyaIsm] = useState('');
  const [kurs, setKurs] = useState<CourseType>('1-kurs');
  const [daraja, setDaraja] = useState<EducationLevelType>('Bakalavriat');
  const [talimYonalishi, setTalimYonalishi] = useState(BAKALAVRIAT_DIRECTIONS[0]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isSubmitTouched, setIsSubmitTouched] = useState(false);

  // When changing level, update selected direction to default of that level
  const handleLevelChange = (level: EducationLevelType) => {
    setDaraja(level);
    if (level === 'Bakalavriat') {
      setTalimYonalishi(BAKALAVRIAT_DIRECTIONS[0]);
    } else {
      setTalimYonalishi(MAGISTRATURA_DIRECTIONS[0]);
    }
  };

  const handleBookToggle = (bookId: string) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter(id => id !== bookId));
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(b => b.id));
    }
  };

  const activeDirections = daraja === 'Bakalavriat' ? BAKALAVRIAT_DIRECTIONS : MAGISTRATURA_DIRECTIONS;

  const isValid = 
    familiyaIsm.trim().length >= 3 && 
    selectedBooks.length >= 10 && 
    talimYonalishi !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitTouched(true);
    
    if (isValid) {
      onStartQuiz({
        familiyaIsm: familiyaIsm.trim(),
        kurs,
        daraja,
        talimYonalishi,
        tanlanganKitoblar: selectedBooks
      });
    }
  };

  return (
    <div id="student-registration" className="max-w-6xl mx-auto py-6 px-4">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
            Kitobxonlik Testi
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-1">
            Talabalar bilimini baholash uchun maxsus intellektual test portali
          </p>
        </div>
        <button
          id="btn-open-admin"
          onClick={onOpenAdmin}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:ring-2 active:ring-gray-200 transition-all cursor-pointer shadow-xs font-mono"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          ADMIN PANEL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Student Credentials */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-700" />
              Talaba ma‘lumotlari
            </h2>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Familiyangiz va ismingiz <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="input-student-name"
                type="text"
                placeholder="Masalan: Abdullayev Anvar"
                value={familiyaIsm}
                onChange={(e) => setFamiliyaIsm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm placeholder-gray-400 bg-gray-50/50"
              />
            </div>
            {isSubmitTouched && familiyaIsm.trim().length < 3 && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Iltimos, to‘liq familiya va ismingizni kiriting (kamida 3 ta belgi)
              </p>
            )}
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kursni tanlang <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['1-kurs', '2-kurs'] as CourseType[]).map((c) => (
                <button
                  id={`btn-course-${c}`}
                  key={c}
                  type="button"
                  onClick={() => setKurs(c)}
                  className={`py-3 px-4 rounded-lg text-sm font-medium border text-center transition-all cursor-pointer ${
                    kurs === c
                      ? 'bg-gray-900 border-gray-900 text-white shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Level (Bakalavriat vs Magistratura) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ta‘lim darajasi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['Bakalavriat', 'Magistratura'] as EducationLevelType[]).map((level) => (
                <button
                  id={`btn-level-${level}`}
                  key={level}
                  type="button"
                  onClick={() => handleLevelChange(level)}
                  className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    daraja === level
                      ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 ${daraja === level ? 'text-white' : 'text-gray-400'}`} />
                  <div className="font-semibold text-sm">{level}</div>
                  <div className={`text-[10px] ${daraja === level ? 'text-gray-300' : 'text-gray-400'}`}>
                    {level === 'Bakalavriat' ? '1-rasm ro‘yxati' : '2-rasm ro‘yxati'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Education Direction Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ta‘lim yo‘nalishini tanlang <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-direction"
                value={talimYonalishi}
                onChange={(e) => setTalimYonalishi(e.target.value)}
                className="block w-full py-3 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-gray-50/50 appearance-none"
              >
                {activeDirections.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Book Selection List */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col h-[520px] max-h-[520px]">
          <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-700" />
              O‘ng taraf: Adabiyotlar ro‘yxati
            </h2>
            <button
              id="btn-select-all"
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium underline cursor-pointer"
            >
              {selectedBooks.length === books.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-2 shrink-0">
            Test topshirish uchun quyidagi kitoblardan kamida <strong className="text-gray-900">10 ta</strong> kitob tanlashingiz shart.
          </p>

          {/* List scrollbox */}
          <div id="books-list-container" className="grow overflow-y-auto border border-gray-150 rounded-lg p-2 bg-gray-50/30 space-y-1.5 custom-scrollbar">
            {books.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Tizimda kitoblar yo‘q. Admin panelidan kitoblar qo‘shing.
              </div>
            ) : (
              books.map((book) => {
                const isSelected = selectedBooks.includes(book.id);
                const hasQuestions = book.savollar.length > 0;
                
                return (
                  <div
                    id={`book-item-${book.id}`}
                    key={book.id}
                    onClick={() => hasQuestions && handleBookToggle(book.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs' 
                        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                    } ${!hasQuestions ? 'opacity-50 !cursor-not-allowed bg-gray-100' : ''}`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-5 h-5 rounded-xs border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    </div>
                    <div className="grow">
                      <div className="font-medium text-xs leading-relaxed">
                        {book.nom}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          hasQuestions 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-red-50 text-red-600 font-bold'
                        }`}>
                          {hasQuestions ? `${book.savollar.length} ta test savoli` : 'Test biriktirilmagan!'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected indicator state */}
          <div className="mt-4 pt-4 border-t border-gray-150 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-gray-500" />
                Tanlangan kitoblar:
              </span>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                selectedBooks.length >= 10 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedBooks.length} / 10
              </span>
            </div>

            {isSubmitTouched && selectedBooks.length < 10 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>Iltimos, eng kamida 10 ta kitob tanlang (hozir {selectedBooks.length} ta tanlandi).</span>
              </div>
            )}

            <button
              id="btn-submit-registration"
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-gray-900 text-white hover:bg-gray-800 active:ring-4 active:ring-gray-300'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              TESTNI BOSHLASH
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
