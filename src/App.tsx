import React, { useState, useEffect } from 'react';
import StudentForm from './components/StudentForm';
import QuizScreen from './components/QuizScreen';
import AdminPanel from './components/AdminPanel';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import { LiteratureBook, TestResult, StudentRegistration, QuizSettings } from './types';

const DEFAULT_SETTINGS: QuizSettings = {
  vaqtDaqiqa: 30,
  savollarSoni: 30
};

export default function App() {
  const [books, setBooks] = useState<LiteratureBook[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [currentScreen, setCurrentScreen] = useState<'registration' | 'quiz' | 'admin'>('registration');
  const [registration, setRegistration] = useState<StudentRegistration | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setApiStatus('loading');
    try {
      const res = await fetch("/api/books-proxy");
      if (!res.ok) {
        throw new Error('API server returned error status ' + res.status);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Mahalliy saqlangan kitoblar ro‘yxatini olish (foydalanuvchi kiritgan yangi kitoblar va tahrirlarni saqlash uchun)
        let savedBooksList: LiteratureBook[] = [];
        const savedBooksStr = localStorage.getItem('kitobxonlik_books');
        if (savedBooksStr) {
          try {
            savedBooksList = JSON.parse(savedBooksStr);
          } catch (e) {
            savedBooksList = [];
          }
        }

        const mappedBooks: LiteratureBook[] = data.map((item: any) => {
          // 1. Mahalliy saqlangan tahrirlangan kitobni izlash (biriktirilgan savollar uchun)
          const matchingLocal = savedBooksList.find((lb) => lb.id === item.id);

          // 2. Default kitoblar orasidan mosini izlash (savollarni saqlab qolish uchun)
          const matchingDefault = DEFAULT_BOOKS.find((db) => {
            if (db.id === item.id) return true;
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яўқғҳ]/g, '');
            const normDB = normalize(db.nom);
            const normItem = normalize(item.nom || '');
            if (normDB.includes(normItem) || normItem.includes(normDB)) return true;
            if (normItem.includes('sariq') && normDB.includes('sariq')) return true;
            if (normItem.includes('ufq') && normDB.includes('ufq')) return true;
            if (normItem.includes('dunyo') && normDB.includes('dunyo')) return true;
            return false;
          });

          return {
            id: item.id || '',
            nom: item.nom || '',
            yaratilganVaqt: item.yaratilgan_vaqt || item.yaratilganVaqt || new Date().toISOString(),
            savollar: matchingLocal?.savollar && matchingLocal.savollar.length > 0 
              ? matchingLocal.savollar 
              : (item.savollar || matchingDefault?.savollar || [])
          };
        });

        // API-dan kelmagan, lekin admin paneldan qo‘shilgan yangi maxsus kitoblarni saqlab qolish
        const customBooks = savedBooksList.filter(
          (lb) => !mappedBooks.some((mb) => mb.id === lb.id)
        );

        const finalBooks = [...mappedBooks, ...customBooks];
        setBooks(finalBooks);
        localStorage.setItem('kitobxonlik_books', JSON.stringify(finalBooks));
        setApiStatus('success');
        setApiError(null);
      } else {
        throw new Error('Fetched data is not an array');
      }
    } catch (err) {
      console.warn('Backend API books fetch failed, using local/default books as fallback:', err);
      setApiStatus('error');
      setApiError(err instanceof Error ? err.message : String(err));
      const savedBooks = localStorage.getItem('kitobxonlik_books');
      if (savedBooks) {
        try {
          setBooks(JSON.parse(savedBooks));
        } catch (e) {
          setBooks(DEFAULT_BOOKS);
        }
      } else {
        setBooks(DEFAULT_BOOKS);
        localStorage.setItem('kitobxonlik_books', JSON.stringify(DEFAULT_BOOKS));
      }
    }
  };

  // Load configuration from local storage on mount, and books from the backend API
  useEffect(() => {
    fetchBooks();

    // 2. Load other configurations from local storage
    const savedResults = localStorage.getItem('kitobxonlik_results');
    const savedSettings = localStorage.getItem('kitobxonlik_settings');

    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        setResults([]);
      }
    } else {
      setResults([]);
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  // Update central state list of books
  const handleUpdateBooks = (newBooks: LiteratureBook[]) => {
    setBooks(newBooks);
    localStorage.setItem('kitobxonlik_books', JSON.stringify(newBooks));
  };

  const handleAddNewBook = async (nom: string) => {
    try {
      setApiStatus('loading');
      const response = await fetch("/api/books-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nom })
      });

      if (!response.ok) {
        throw new Error(`Xatolik: Server ${response.status} qaytardi`);
      }

      // Muvaffaqiyatli saqlangach qayta yuklash
      await fetchBooks();
    } catch (err: any) {
      console.error("Kitob qo‘shishda xatolik:", err);
      alert("Kitob qo‘shishda xatolik yuz berdi: " + (err.message || String(err)));
      setApiStatus('success');
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      setApiStatus('loading');
      const response = await fetch(`/api/books-proxy/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Xatolik: Server ${response.status} qaytardi`);
      }

      // Muvaffaqiyatli o'chgach qayta yuklash
      await fetchBooks();
    } catch (err: any) {
      console.error("Kitobni o‘chirishda xatolik:", err);
      alert("Kitobni o‘chirishda xatolik yuz berdi: " + (err.message || String(err)));
      setApiStatus('success');
    }
  };

  // Update central state settings
  const handleUpdateSettings = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    localStorage.setItem('kitobxonlik_settings', JSON.stringify(newSettings));
  };

  // Student begins quiz challenge
  const handleStartQuiz = (reg: StudentRegistration) => {
    setRegistration(reg);
    setCurrentScreen('quiz');
  };

  // Student completes quiz successfully
  const handleFinishQuiz = (result: TestResult) => {
    const newResultsList = [result, ...results];
    setResults(newResultsList);
    localStorage.setItem('kitobxonlik_results', JSON.stringify(newResultsList));
  };

  // Registration cancellation/back to home screen
  const handleCancelQuiz = () => {
    setRegistration(null);
    setCurrentScreen('registration');
  };

  // Admin purges attempts log
  const handleClearResults = () => {
    setResults([]);
    localStorage.setItem('kitobxonlik_results', JSON.stringify([]));
  };

  return (
    <div className="min-h-screen bg-gray-50/55 text-gray-900 pb-12 font-sans selection:bg-gray-900 selection:text-white antialiased">
      {/* Top minimalistic subtle ambient stripe */}
      <div className="h-1.5 bg-gray-950 w-full shrink-0"></div>

      {currentScreen === 'registration' && (
        <main className="animate-fade-in-up">
          <StudentForm 
            books={books} 
            apiStatus={apiStatus}
            apiError={apiError}
            onStartQuiz={handleStartQuiz} 
            onOpenAdmin={() => setCurrentScreen('admin')} 
          />
        </main>
      )}

      {currentScreen === 'quiz' && registration && (
        <main>
          <QuizScreen 
            registration={registration} 
            books={books} 
            settings={settings}
            onFinishQuiz={handleFinishQuiz} 
            onCancelQuiz={handleCancelQuiz} 
          />
        </main>
      )}

      {currentScreen === 'admin' && (
        <main className="animate-fade-in">
          <AdminPanel 
            books={books} 
            results={results} 
            settings={settings}
            onBack={() => setCurrentScreen('registration')} 
            onUpdateBooks={handleUpdateBooks} 
            onUpdateSettings={handleUpdateSettings}
            onClearResults={handleClearResults}
            onDeleteBook={handleDeleteBook}
            onAddBook={handleAddNewBook}
          />
        </main>
      )}

      {/* Persistent humble human footer accent, keeping outer styling clean of any telemetry or logs */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-sans">
        <div>
          &copy; {new Date().getFullYear()} Kitobxonlik Testi. O‘zbekiston talabalari kitobsevarlik ko‘rik-tanlovi maxsus test tizimi.
        </div>
        <div>
          Sana: {new Date().toLocaleDateString('uz-UZ')}
        </div>
      </footer>
    </div>
  );
}
