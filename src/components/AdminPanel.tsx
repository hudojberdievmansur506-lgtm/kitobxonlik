import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  FileText, 
  Upload, 
  Check, 
  Download, 
  Search, 
  Trash, 
  Lock, 
  BookOpen, 
  AlertCircle,
  Eye,
  Settings,
  X,
  Filter
} from 'lucide-react';
import { LiteratureBook, TestResult, Question, CourseType, EducationLevelType, QuizSettings } from '../types';
import { parseDocxQuestions, parseTextQuestions } from '../utils/docxParser';
import { exportResultsToPDF } from '../utils/pdfGenerator';
import { BAKALAVRIAT_DIRECTIONS, MAGISTRATURA_DIRECTIONS } from '../data/constants';

interface AdminPanelProps {
  books: LiteratureBook[];
  results: TestResult[];
  settings: QuizSettings;
  onBack: () => void;
  onUpdateBooks: (updatedBooks: LiteratureBook[]) => void;
  onUpdateSettings: (updatedSettings: QuizSettings) => void;
  onClearResults: () => void;
  onDeleteBook: (id: string) => void;
  onAddBook: (nom: string) => void;
}

export default function AdminPanel({ 
  books, 
  results, 
  settings,
  onBack, 
  onUpdateBooks, 
  onUpdateSettings,
  onClearResults,
  onDeleteBook,
  onAddBook
}: AdminPanelProps) {
  // Simple password lock
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Settings editors state
  const [localVaqt, setLocalVaqt] = useState(settings?.vaqtDaqiqa?.toString() || '30');
  const [localSavollarSoni, setLocalSavollarSoni] = useState(settings?.savollarSoni?.toString() || '30');
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState('');

  // Tab state: 'books' or 'results'
  const [activeTab, setActiveTab] = useState<'books' | 'results'>('results');

  // New book creation state
  const [newBookTitle, setNewBookTitle] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);

  // States for custom iframe-safe confirmations
  const [deleteBookTarget, setDeleteBookTarget] = useState<LiteratureBook | null>(null);
  const [showClearResultsConfirm, setShowClearResultsConfirm] = useState(false);
  
  // Attach questions modal / overlay state
  const [selectedBookForQuestions, setSelectedBookForQuestions] = useState<LiteratureBook | null>(null);
  const [attachMethod, setAttachMethod] = useState<'docx' | 'manual'>('docx');
  const [manualText, setManualText] = useState('');
  const [parsedPreviewQuestions, setParsedPreviewQuestions] = useState<Question[]>([]);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results screen filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterDirection, setFilterDirection] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'latest' | 'score_desc' | 'score_asc'>('latest');

  // Book review state
  const [reviewedBook, setReviewedBook] = useState<LiteratureBook | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin777') {
      setIsAdminUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Noto‘g‘ri parol! (Parol: ***)');
    }
  };

  const handleAddNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBookTitle.trim().length === 0) return;

    onAddBook(newBookTitle.trim());
    setNewBookTitle('');
    setShowAddBook(false);
  };

  // Parsing Word or Manual files handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setParseError('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const parsedQuestions = await parseDocxQuestions(arrayBuffer);
          setParsedPreviewQuestions(parsedQuestions);
        } catch (err: any) {
          setParseError(err.message || 'Faylni o‘qib bo‘lmadi.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setParseError('Word faylini o‘qishda xatolik yuz berdi.');
    }
  };

  const handleManualTextChange = (text: string) => {
    setManualText(text);
    try {
      const parsedQuestions = parseTextQuestions(text);
      setParsedPreviewQuestions(parsedQuestions);
    } catch {
      // ignore live parsing intermediate errors
    }
  };

  const handleSaveQuestions = () => {
    if (!selectedBookForQuestions) return;

    const updated = books.map(b => {
      if (b.id === selectedBookForQuestions.id) {
        return {
          ...b,
          savollar: parsedPreviewQuestions
        };
      }
      return b;
    });

    onUpdateBooks(updated);
    
    // reset attach states
    setSelectedBookForQuestions(null);
    setParsedPreviewQuestions([]);
    setManualText('');
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter and sort core logic for historic results
  const filteredResults = results.filter(r => {
    const matchesSearch = r.familiyaIsm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'All' || r.kurs === filterCourse;
    const matchesLevel = filterLevel === 'All' || r.daraja === filterLevel;
    const matchesDirection = filterDirection === 'All' || r.talimYonalishi === filterDirection;
    return matchesSearch && matchesCourse && matchesLevel && matchesDirection;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.vaqt).getTime() - new Date(a.vaqt).getTime();
    }
    if (sortOrder === 'score_desc') {
      return b.foiz - a.foiz;
    }
    if (sortOrder === 'score_asc') {
      return a.foiz - b.foiz;
    }
    return 0;
  });

  const handleDownloadPDF = () => {
    if (sortedResults.length === 0) return;
    exportResultsToPDF(sortedResults);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVaqt = parseInt(localVaqt, 10);
    const parsedCount = parseInt(localSavollarSoni, 10);

    if (isNaN(parsedVaqt) || parsedVaqt <= 0) {
      alert("Iltimos, test vaqtini to‘g‘ri kiriting (daqiqa)!");
      return;
    }
    if (isNaN(parsedCount) || parsedCount <= 0) {
      alert("Iltimos, testlar sonini to‘g‘ri kiriting (masalan, 30)!");
      return;
    }

    onUpdateSettings({
      vaqtDaqiqa: parsedVaqt,
      savollarSoni: parsedCount
    });

    setSettingsSuccessMessage('Test sozlamalari muvaffaqiyatli saqlandi!');
    setTimeout(() => {
      setSettingsSuccessMessage('');
    }, 3000);
  };

  const allDirections = Array.from(new Set([...BAKALAVRIAT_DIRECTIONS, ...MAGISTRATURA_DIRECTIONS]));

  // Prior to unlocking, render elegant passcode padlock
  if (!isAdminUnlocked) {
    return (
      <div id="admin-lockbox" className="min-h-[500px] flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-lg text-center space-y-6">
          <div className="mx-auto w-14 h-14 bg-gray-150 rounded-full flex items-center justify-center text-gray-700">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Admin login panel</h2>
            <p className="text-xs text-gray-500 mt-1">Kitoblarni tahrirlash va natijalarni ko‘rish uchun parolni kiriting</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-600 block">Admin Parol:</label>
              <input
                id="input-admin-password"
                type="password"
                placeholder="Parolni kiriting..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gray-900 text-sm font-semibold tracking-widest text-center"
                autoFocus
              />
              {passwordError && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                id="btn-admin-cancel"
                type="button"
                onClick={onBack}
                className="w-1/2 py-2.5 text-xs font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                Orqaga
              </button>
              <button
                id="btn-admin-unlock"
                type="submit"
                className="w-1/2 py-2.5 text-xs font-bold bg-gray-950 text-white rounded-lg hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
              >
                Tasdiqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel" className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Admin Panel Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-6 mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-700" />
            Boshqaruv Tizimi (Admin Panel)
          </h1>
          <p className="text-xs text-gray-500 mt-1">Kitoblar kutubxonasini boshqarish, testlarni yuklash va talabalar natijalari statistikasi</p>
        </div>

        <button
          id="btn-admin-return"
          onClick={onBack}
          className="flex items-center justify-center gap-1 px-4 py-2.5 bg-white border border-gray-350 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 active:ring-2 active:ring-gray-200 transition-all cursor-pointer shadow-2xs font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Chiqish
        </button>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          id="btn-tab-results"
          onClick={() => setActiveTab('results')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'results'
              ? 'border-gray-950 text-gray-950 bg-gray-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
          }`}
        >
          Natijalar (Test yakunlari) {results.length > 0 && `(${results.length})`}
        </button>
        <button
          id="btn-tab-books"
          onClick={() => setActiveTab('books')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'books'
              ? 'border-gray-950 text-gray-950 bg-gray-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
          }`}
        >
          Kutubxona & Test biriktirish ({books.length})
        </button>
      </div>

      {/* Test Parametrlari (Sozlamalar) */}
      <div id="test-settings-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-3 mb-4 gap-2">
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-700 animate-spin-slow" />
              Sozlamalar: Test vaqti va savollar soni
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Test tizimi bo‘yicha global savollar soni va vaqt cheklovi</p>
          </div>
          <span className="text-[11px] font-mono font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
            Joriy holat: {settings.vaqtDaqiqa} daqiqa / {settings.savollarSoni} ta savol
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-700 block">Imtihon vaqti (daqiqa):</label>
            <input
              id="settings-time-input"
              type="number"
              min="1"
              max="300"
              value={localVaqt}
              onChange={(e) => setLocalVaqt(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-950 focus:border-gray-950 focus:outline-hidden"
              placeholder="Masalan: 30"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-700 block font-sans">Savollar soni (testlar soni):</label>
            <input
              id="settings-count-input"
              type="number"
              min="1"
              max="500"
              value={localSavollarSoni}
              onChange={(e) => setLocalSavollarSoni(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-950 focus:border-gray-950 focus:outline-hidden"
              placeholder="Masalan: 30"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-save-settings"
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer h-10 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Sozlamalarni saqlash
            </button>
          </div>
        </form>

        {settingsSuccessMessage && (
          <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200 animate-pulse">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{settingsSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Panel Content switch templates */}
      {activeTab === 'books' ? (
        <div id="books-manager-sub" className="space-y-6">
          {/* Header & New book toggle button */}
          <div className="flex flex-wrap text-left justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Adabiyotlar kutubxonasi</h2>
              <p className="text-xs text-gray-500 mt-0.5">Yangi kitoblar qo‘shish va ularga Word jadval ko‘rinishidagi testlarni biriktirish</p>
            </div>

            <button
              id="btn-add-book-trigger"
              onClick={() => setShowAddBook(!showAddBook)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-950 hover:bg-gray-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              YANGI KITOB QO‘SHISH
            </button>
          </div>

          {showAddBook && (
            <form onSubmit={handleAddNewBook} className="bg-gray-50 border border-gray-250 rounded-xl p-5 max-w-xl animate-fade-in flex flex-col sm:flex-row gap-4">
              <div className="grow space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Yangi to‘liq kitob nomi va muallifi:</label>
                <input
                  id="input-new-book-title"
                  type="text"
                  placeholder="Masalan: Ikki eshik orasi (O‘tkir Hoshimov)"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  id="btn-add-book-submit"
                  type="submit"
                  className="py-2.5 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                >
                  Qo‘shish
                </button>
                <button
                  id="btn-add-book-close"
                  type="button"
                  onClick={() => { setShowAddBook(false); setNewBookTitle(''); }}
                  className="py-2.5 px-3 text-xs font-semibold border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          )}

          {/* Core Library Books display table grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                id={`admin-book-card-${book.id}`}
                key={book.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    
                    {/* Delete book handler */}
                    <button
                      id={`btn-delete-book-${book.id}`}
                      onClick={() => setDeleteBookTarget(book)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-all cursor-pointer"
                      title="Kitobni butunlay o‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-950 text-sm line-clamp-2 leading-relaxed">
                      {book.nom}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Sana: {new Date(book.yaratilganVaqt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-mono">Testlar holati:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      book.savollar.length > 0
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {book.savollar.length > 0 ? `${book.savollar.length} ta savol bor` : 'Test yuklanmagan!'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Review Attached Questions Button */}
                    <button
                      id={`btn-review-book-${book.id}`}
                      disabled={book.savollar.length === 0}
                      onClick={() => setReviewedBook(book)}
                      className={`py-2 px-3 border border-gray-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        book.savollar.length === 0 
                          ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Savollar
                    </button>
                    
                    {/* Attach Tests button */}
                    <button
                      id={`btn-attach-quiz-${book.id}`}
                      onClick={() => {
                        setSelectedBookForQuestions(book);
                        setParsedPreviewQuestions([...book.savollar]);
                      }}
                      className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      Test yuklash
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div id="results-manager-sub" className="space-y-6">
          {/* Header info & filters toggle bar */}
          <div className="flex flex-wrap text-left justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Test topshirish natijalari</h2>
              <p className="text-xs text-gray-500 mt-0.5">O‘tilgan testlar, ball ko‘rsatkichlari, yuklab olish va filtrlash</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-clear-results-history"
                disabled={results.length === 0}
                onClick={() => setShowClearResultsConfirm(true)}
                className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  results.length === 0
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                    : 'border-red-200 text-red-600 hover:bg-red-50/50'
                }`}
              >
                <Trash className="w-3.5 h-3.5" />
                BAZANI TOZALASH
              </button>

              <button
                id="btn-download-pdf-results"
                disabled={sortedResults.length === 0}
                onClick={handleDownloadPDF}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                  sortedResults.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Download className="w-4 h-4" />
                PDF GA YUKLASH {sortedResults.length > 0 && `(${sortedResults.length})`}
              </button>
            </div>
          </div>

          {/* Structured Filter Card Panel with dropdowns & search inputs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-950 border-b border-gray-100 pb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              Qidirish va filtrlash paneli
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search fullname */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Talaba ismi:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </span>
                  <input
                    id="filter-input-search"
                    type="text"
                    placeholder="Qidiruv..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-gray-50/30"
                  />
                </div>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Kurs:</label>
                <select
                  id="filter-select-course"
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-xs bg-gray-50/50"
                >
                  <option value="All">Barchasi (Kurslar)</option>
                  <option value="1-kurs">1-kurs</option>
                  <option value="2-kurs">2-kurs</option>
                </select>
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Daraja:</label>
                <select
                  id="filter-select-level"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-xs bg-gray-50/50"
                >
                  <option value="All">Barchasi (Daraja)</option>
                  <option value="Bakalavriat">Bakalavriat</option>
                  <option value="Magistratura">Magistratura</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Saralash tartibi:</label>
                <select
                  id="filter-select-sorting"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-xs bg-gray-50/50"
                >
                  <option value="latest">Eng yangi birinchi</option>
                  <option value="score_desc">Ball kamayishi bo‘yicha</option>
                  <option value="score_asc">Ball ko‘payishi bo‘yicha</option>
                </select>
              </div>
            </div>

            {/* Fine grained direction filtering */}
            <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Mutaxassislik yo‘nalishi:</label>
                <select
                  id="filter-select-direction"
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value)}
                  className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-xs bg-gray-50/50"
                >
                  <option value="All">Barchasi (Yo‘nalishlar)</option>
                  {allDirections.map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results table layout */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto min-w-full">
              <table id="tbl-results-history" className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 font-mono text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-4">T/r</th>
                    <th scope="col" className="px-6 py-4">F.I.O. (Talaba)</th>
                    <th scope="col" className="px-6 py-4">Kurs</th>
                    <th scope="col" className="px-6 py-4">Ta‘lim Yo‘nalishi & Darajasi</th>
                    <th scope="col" className="px-6 py-4 text-center">To‘g‘ri / Jami</th>
                    <th scope="col" className="px-6 py-4 text-center">Natija (%)</th>
                    <th scope="col" className="px-6 py-4 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs text-gray-800">
                  {sortedResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                        Qidiruv bo‘yicha hech qanday natijalar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    sortedResults.map((r, index) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-950">
                          {r.familiyaIsm}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {r.kurs}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-semibold text-gray-700">{r.daraja}</span> • {r.talimYonalishi}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">
                          {r.togriJavoblar} / {r.jamiSavollar}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono ${
                            r.foiz >= 75
                              ? 'bg-emerald-50 text-emerald-800'
                              : r.foiz >= 50
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {r.foiz}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 font-mono">
                          {new Date(r.vaqt).toLocaleDateString('uz-UZ')} {new Date(r.vaqt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Attached Questions Details Overlay Modal Dialog */}
      {reviewedBook && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs" onClick={() => setReviewedBook(null)}></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-2xl w-full max-h-[75vh] flex flex-col relative z-10 p-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-950 leading-relaxed max-w-lg truncate">{reviewedBook.nom}</h3>
                <p className="text-[10px] text-gray-500 font-mono">Yuklangan jami test savollar: {reviewedBook.savollar.length} ta</p>
              </div>
              <button
                id="btn-close-review"
                onClick={() => setReviewedBook(null)}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin grow">
              {reviewedBook.savollar.map((q, idx) => (
                <div key={q.id} className="bg-gray-50/50 border border-gray-150 rounded-lg p-4 space-y-2">
                  <div className="text-[10px] font-bold font-mono text-gray-400">
                    SAVOL {idx + 1}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs">
                    {q.savol}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 text-xs text-gray-600">
                    {q.javoblar.map((ans, aIdx) => {
                      const isCorrect = ans === q.togriJavob;
                      return (
                        <div key={aIdx} className={`px-2.5 py-1.5 rounded-md border flex justify-between items-center ${
                          isCorrect 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <span>{ans}</span>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 text-right shrink-0">
              <button
                id="btn-review-close-bottom"
                onClick={() => setReviewedBook(null)}
                className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Muloqot oynasini yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach/Upload Questions Overlay Dialog Modal */}
      {selectedBookForQuestions && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs" onClick={() => setSelectedBookForQuestions(null)}></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col relative z-10 p-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-950">Yangi test biriktirish</h3>
                <p className="text-[11px] text-gray-500 max-w-md truncate">Kitob: <strong className="text-gray-900">{selectedBookForQuestions.nom}</strong></p>
              </div>
              <button
                id="btn-close-attach-modal"
                onClick={() => setSelectedBookForQuestions(null)}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin grow">
              {/* Method switches */}
              <div className="flex border border-gray-200 rounded-lg p-0.5 max-w-xs text-xs">
                <button
                  id="btn-method-docx"
                  onClick={() => { setAttachMethod('docx'); setParsedPreviewQuestions([]); }}
                  className={`w-1/2 py-2 text-center rounded-md font-bold cursor-pointer transition-all ${
                    attachMethod === 'docx' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  📂 Word Fayl Yuklash (.docx)
                </button>
                <button
                  id="btn-method-manual"
                  onClick={() => { setAttachMethod('manual'); setParsedPreviewQuestions([]); }}
                  className={`w-1/2 py-2 text-center rounded-md font-bold cursor-pointer transition-all ${
                    attachMethod === 'manual' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  ✍️ Matn nusxasini qo‘yish
                </button>
              </div>

              {attachMethod === 'docx' ? (
                <div className="space-y-4">
                  {/* File Upload drag-and-drop zone */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-900 transition-colors text-center relative">
                    <input
                      id="input-docx-upload"
                      type="file"
                      ref={fileInputRef}
                      accept=".docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-700">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-semibold text-gray-700">Test word faylini shu erga bosing yoki sudrab olib keling</div>
                      <div className="text-[10px] text-gray-400">Faqatgina (.docx) kengaytmali jadval fayli qo‘llab quvvatlanadi</div>
                    </div>
                  </div>

                  {/* Formatting Instruction alert box */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-650 leading-relaxed">
                    <strong className="text-gray-950 font-bold block mb-1">Jadval formati talabi:</strong>
                    Word fayldagi jadvalda ketma-ket quyidagilar bo‘lishi shart:<br />
                    1-qator: Savol matni, 2-qator: To‘g‘ri javob, 3, 4, 5-qatorlar: Qolgan variantlar. Keyin yana 6-qator yangi savol va h.k.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-600 block">Jadval qatorlaridan nusxalangan matnni kiriting:</label>
                  <textarea
                    id="textarea-manual-tests"
                    rows={8}
                    className="block w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-gray-900 bg-gray-50/20"
                    placeholder={`1-savol matni\nTo‘g‘ri javob variant\nVariant B\nVariant C\nVariant D\n2-savol matni\nTo‘g‘ri javob variant\nVariant B\nVariant C\nVariant D`}
                    value={manualText}
                    onChange={(e) => handleManualTextChange(e.target.value)}
                  ></textarea>
                </div>
              )}

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  {parseError}
                </div>
              )}

              {/* Parsed questions preview box */}
              {parsedPreviewQuestions.length > 0 && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Yuklanadigan testlar predpromotri ({parsedPreviewQuestions.length} ta savol topildi)
                    </h4>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-4 text-xs">
                    {parsedPreviewQuestions.map((q, idx) => (
                      <div key={idx} className="border-b border-gray-250 pb-3 last:border-0 last:pb-0">
                        <div className="font-semibold text-gray-900 mb-1">{idx+1}. {q.savol}</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] mt-1.5 text-gray-600 pl-3">
                          <div><strong className="text-emerald-700">✓ {q.togriJavob}</strong></div>
                          {q.javoblar.filter(o => o !== q.togriJavob).map((option, oIdx) => (
                            <div key={oIdx}>• {option}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="border-t border-gray-150 pt-4 flex gap-3 justify-end shrink-0">
              <button
                id="btn-attach-cancel"
                onClick={() => setSelectedBookForQuestions(null)}
                className="px-4 py-2 text-xs font-semibold border border-gray-300 text-gray-700 rounded-lg cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                id="btn-attach-save"
                disabled={parsedPreviewQuestions.length === 0}
                onClick={handleSaveQuestions}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-2xs cursor-pointer ${
                  parsedPreviewQuestions.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Testlarni tizimga biriktirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Book Confirmation Modal */}
      {deleteBookTarget && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-left animate-zoom-in">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-red-50 text-red-650 rounded-full shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-950">Kitobni o‘chirish</h3>
                <p className="text-[11px] text-gray-400">Kitob va uning savollari butunlay o‘chiriladi.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-150 text-xs text-gray-700">
              <span className="text-gray-400 block mb-0.5">Kitob nomi:</span>
              <strong className="text-gray-950 text-xs block truncate">{deleteBookTarget.nom}</strong>
              <span className="text-gray-400 block mt-2 mb-0.5">Savollar soni:</span>
              <strong className="text-gray-950 text-xs block">{deleteBookTarget.savollar.length} ta test</strong>
            </div>

            <p className="text-[11px] text-red-600 font-medium bg-red-50/50 p-2 rounded border border-red-100">
              Ushbu amalni aslo ortga qaytarib bo‘lmaydi.
            </p>

            <div className="flex gap-2 justify-end pt-1">
              <button
                id="btn-confirm-delete-cancel"
                onClick={() => setDeleteBookTarget(null)}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-50 cursor-pointer transition-all"
              >
                Bekor qilish
              </button>
              <button
                id="btn-confirm-delete-action"
                onClick={() => {
                  onDeleteBook(deleteBookTarget.id);
                  setDeleteBookTarget(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                O‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Clear Results Confirmation Modal */}
      {showClearResultsConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-left animate-zoom-in">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-rose-50 text-rose-650 rounded-full shrink-0">
                <Trash className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-950">Natijalar tarixini o‘chirish</h3>
                <p className="text-[11px] text-gray-400 font-sans">Barcha talaba test natijalarini tozalash.</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 text-xs text-rose-950 border border-rose-100 rounded-lg space-y-1 font-sans">
              <p className="font-semibold">Siz barcha {results.length} ta imtihon natijasini o‘chirmoqchisiz!</p>
              <p className="text-gray-500">Natijalar, ballar va hisobotlar butunlay o‘chib ketadi.</p>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                id="btn-confirm-clear-cancel"
                onClick={() => setShowClearResultsConfirm(false)}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-50 cursor-pointer transition-all"
              >
                Bekor qilish
              </button>
              <button
                id="btn-confirm-clear-action"
                onClick={() => {
                  onClearResults();
                  setShowClearResultsConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
              >
                <Trash className="w-3.5 h-3.5" />
                Tozalansin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
