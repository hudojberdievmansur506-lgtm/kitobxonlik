import React, { useState, useEffect } from 'react';
import StudentForm from './components/StudentForm';
import QuizScreen from './components/QuizScreen';
import AdminPanel from './components/AdminPanel';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import { LiteratureBook, TestResult, StudentRegistration, QuizSettings, Question } from './types';

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
      const headersObj = {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      };

      const [booksRes, questionsRes, resultsRes] = await Promise.all([
        fetch("/api/books-proxy", { headers: headersObj }),
        fetch("/api/questions-proxy", { headers: headersObj }),
        fetch("/api/results-proxy", { headers: headersObj })
      ]);

      if (!booksRes.ok) {
        throw new Error('Serverdan kitoblar ro‘yxatini yuklab bo‘lmadi: ' + booksRes.status);
      }

      const booksData = await booksRes.json();
      let questionsData: any[] = [];
      if (questionsRes.ok) {
        questionsData = await questionsRes.json();
      }
      let resultsData: any[] = [];
      if (resultsRes.ok) {
        resultsData = await resultsRes.json();
      }

      if (Array.isArray(booksData)) {
        const mappedBooks: LiteratureBook[] = booksData.map((item: any) => {
          // Find questions belongs to this book from the backend pool
          const bookQuestionsRaw = Array.isArray(questionsData) 
            ? questionsData.filter((q: any) => String(q.book_id || q.bookId) === String(item.id))
            : [];

          const formattedQuestions: Question[] = bookQuestionsRaw.map((q: any) => ({
            id: q.id || q._id || String(Math.random()),
            savol: q.savol || '',
            togriJavob: q.togri_javob || q.togriJavob || '',
            javoblar: q.variantlar || q.javoblar || []
          }));

          // Fallback to default questions if none exist on the backend yet
          let finalQuestions = formattedQuestions;
          if (finalQuestions.length === 0) {
            const matchingDefault = DEFAULT_BOOKS.find((db) => {
              if (db.id === item.id) return true;
              const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яўқғҳ]/g, '');
              const normDB = normalize(db.nom);
              const normItem = normalize(item.nom || '');
              return normDB.includes(normItem) || normItem.includes(normDB);
            });
            if (matchingDefault) {
              finalQuestions = matchingDefault.savollar;
            }
          }

          return {
            id: item.id || '',
            nom: item.nom || '',
            yaratilganVaqt: item.yaratilgan_vaqt || item.yaratilganVaqt || new Date().toISOString(),
            savollar: finalQuestions
          };
        });

        setBooks(mappedBooks);
        localStorage.setItem('kitobxonlik_books', JSON.stringify(mappedBooks));

        // Format and map backend results
        if (Array.isArray(resultsData)) {
          const mappedResults: TestResult[] = resultsData.map((r: any) => {
            let tanlanganKitoblarRaw: string[] = [];
            if (typeof r.book_ids === 'string') {
              try {
                if (r.book_ids.startsWith('[')) {
                  tanlanganKitoblarRaw = JSON.parse(r.book_ids);
                } else {
                  tanlanganKitoblarRaw = r.book_ids.split(',').map((x: string) => x.trim()).filter(Boolean);
                }
              } catch {
                tanlanganKitoblarRaw = [r.book_ids];
              }
            } else if (Array.isArray(r.book_ids)) {
              tanlanganKitoblarRaw = r.book_ids;
            } else if (Array.isArray(r.tanlanganKitoblar)) {
              tanlanganKitoblarRaw = r.tanlanganKitoblar;
            }

            return {
              id: r.id || String(Math.random()),
              familiyaIsm: r.familiya_ism || r.familiyaIsm || '',
              kurs: r.kurs || '1-kurs',
              daraja: r.daraja || 'Bakalavriat',
              talimYonalishi: r.talim_yonalishi || r.talimYonalishi || '',
              jamiSavollar: Number(r.jami_savollar !== undefined ? r.jami_savollar : (r.jamiSavollar || 0)),
              togriJavoblar: Number(r.togri_javoblar !== undefined ? r.togri_javoblar : (r.togriJavoblar || 0)),
              foiz: Number(r.foiz !== undefined ? r.foiz : (r.foiz || 0)),
              vaqt: r.vaqt || r.created_at || new Date().toISOString(),
              tanlanganKitoblar: tanlanganKitoblarRaw
            };
          });
          setResults(mappedResults);
          localStorage.setItem('kitobxonlik_results', JSON.stringify(mappedResults));
        }

        setApiStatus('success');
        setApiError(null);
      } else {
        throw new Error('Qaytarilgan kitoblar ma‘lumoti massiv emas');
      }
    } catch (err) {
      console.warn('Backend API fetch failed, using local/default books as fallback:', err);
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

      const savedResults = localStorage.getItem('kitobxonlik_results');
      if (savedResults) {
        try {
          setResults(JSON.parse(savedResults));
        } catch (e) {
          setResults([]);
        }
      }
    }
  };

  // Load configuration from local storage on mount, and books from the backend API
  useEffect(() => {
    fetchBooks();

    // 2. Load other configurations from local storage
    const savedSettings = localStorage.getItem('kitobxonlik_settings');

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
          "ngrok-skip-browser-warning": "true",
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
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        }
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

  const handleAddQuestions = async (bookId: string, questionsList: Question[]) => {
    try {
      // Post all items sequentially or parallelly using fetch with required headers
      const headersObj = {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      };

      const promises = questionsList.map(async (q) => {
        const payload = {
          book_id: bookId,
          savol: q.savol,
          togri_javob: q.togriJavob,
          variantlar: q.javoblar
        };

        const response = await fetch("/api/questions-proxy", {
          method: "POST",
          headers: headersObj,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Xatolik: Server ${response.status} qaytardi`);
        }

        return await response.json();
      });

      await Promise.all(promises);
      await fetchBooks();
    } catch (err: any) {
      console.error("Savollarni saqlashda xatolik:", err);
      throw err;
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
  const handleFinishQuiz = async (result: TestResult) => {
    try {
      setApiStatus('loading');
      const headersObj = {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      };

      const payload = {
        familiya_ism: result.familiyaIsm,
        kurs: result.kurs,
        daraja: result.daraja,
        talim_yonalishi: result.talimYonalishi,
        jami_savollar: result.jamiSavollar,
        togri_javoblar: result.togriJavoblar,
        foiz: result.foiz,
        book_ids: result.tanlanganKitoblar.join(", ")
      };

      const res = await fetch("/api/results-proxy", {
        method: "POST",
        headers: headersObj,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Xatolik: Server natijani saqlab qola olmadi");
      }

      await fetchBooks();
    } catch (err: any) {
      console.error("Natijani backendga jo‘natishda xatolik:", err);
      // Fallback local option
      const newResultsList = [result, ...results];
      setResults(newResultsList);
      localStorage.setItem('kitobxonlik_results', JSON.stringify(newResultsList));
      setApiStatus('success');
    }
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
            onAddQuestions={handleAddQuestions}
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
