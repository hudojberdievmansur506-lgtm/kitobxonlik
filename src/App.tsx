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

  // Load configuration from local storage on mount, and books from the backend API
  useEffect(() => {
    // 1. Fetch books list from backend API
    fetch('https://king-dork-opulently.ngrok-free.dev/api/books')
      .then((res) => {
        if (!res.ok) {
          throw new Error('API server returned error status');
        }
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const mappedBooks: LiteratureBook[] = data.map((item: any) => {
            // Check if there is a matching default book to retain quiz questions if they are omitted by API
            const matchingDefault = DEFAULT_BOOKS.find((db) => db.id === item.id);
            return {
              id: item.id || '',
              nom: item.nom || '',
              yaratilganVaqt: item.yaratilgan_vaqt || item.yaratilganVaqt || new Date().toISOString(),
              savollar: item.savollar || matchingDefault?.savollar || []
            };
          });
          setBooks(mappedBooks);
        } else {
          throw new Error('Fetched data is not an array');
        }
      })
      .catch((err) => {
        console.warn('Backend API books fetch failed, using local/default books as fallback:', err);
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
      });

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

  const handleDeleteBook = (id: string) => {
    const filtered = books.filter(b => b.id !== id);
    setBooks(filtered);
    localStorage.setItem('kitobxonlik_books', JSON.stringify(filtered));
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
