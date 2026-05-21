import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  LogOut, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  StudentRegistration, 
  LiteratureBook, 
  Question, 
  QuizAttemptQuestion, 
  TestResult,
  QuizSettings
} from '../types';

interface QuizScreenProps {
  registration: StudentRegistration;
  books: LiteratureBook[];
  settings: QuizSettings;
  onFinishQuiz: (result: TestResult) => void;
  onCancelQuiz: () => void;
}

export default function QuizScreen({ registration, books, settings, onFinishQuiz, onCancelQuiz }: QuizScreenProps) {
  const [questions, setQuestions] = useState<QuizAttemptQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // index -> chosen text
  const [timeLeft, setTimeLeft] = useState(settings.vaqtDaqiqa * 60); // Dynamic configured minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [startTime] = useState(Date.now());

  // Set up the randomized questions pool exactly according to dynamic settings and business rules
  useEffect(() => {
    // 1. Get literature materials actually selected by student
    const studentSelectedBookIds = registration.tanlanganKitoblar;
    const selectedLiteratureList = [...books.filter(b => studentSelectedBookIds.includes(b.id))];

    // Shuffle the books so that excess allocation is distributed randomly
    const shuffledSelectedLiteratureList = selectedLiteratureList.sort(() => Math.random() - 0.5);

    // 2. Determine question allocations per book to reach settings.savollarSoni
    const bookAllocations: Record<string, number> = {};
    shuffledSelectedLiteratureList.forEach(b => {
      bookAllocations[b.id] = 0;
    });

    let allocatedCount = 0;
    let attempts = 0;
    const maxAllocated = settings.savollarSoni;

    while (allocatedCount < maxAllocated && attempts < 1000) {
      attempts++;
      let allocatedInThisRound = false;
      for (const book of shuffledSelectedLiteratureList) {
        if (allocatedCount >= maxAllocated) break;
        
        const currentAllocated = bookAllocations[book.id];
        const availableQuestionsCount = book.savollar.length;
        
        if (currentAllocated < availableQuestionsCount) {
          bookAllocations[book.id]++;
          allocatedCount++;
          allocatedInThisRound = true;
        }
      }
      if (!allocatedInThisRound) break;
    }

    // 3. Extract the allocated questions from each book
    const finalPreparedQuestions: QuizAttemptQuestion[] = [];

    shuffledSelectedLiteratureList.forEach((book) => {
      const allowedCountForThisBook = bookAllocations[book.id] || 0;
      if (allowedCountForThisBook <= 0) return;

      const bookQuestions = [...book.savollar];
      const shuffledBookQuestions = bookQuestions.sort(() => Math.random() - 0.5);
      const selected = shuffledBookQuestions.slice(0, allowedCountForThisBook);

      selected.forEach((q) => {
        const shuffledOptions = [...q.javoblar].sort(() => Math.random() - 0.5);
        
        finalPreparedQuestions.push({
          savol: {
            ...q,
            javoblar: shuffledOptions
          },
          bookId: book.id,
          bookName: book.nom,
          togri: false
        });
      });
    });

    // Shuffle the combined quiz questions pool so they appear in completely mixed order
    const randomizedCombinedList = finalPreparedQuestions.sort(() => Math.random() - 0.5);
    setQuestions(randomizedCombinedList);
  }, [registration, books, settings.savollarSoni]);

  // Real-time timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectOption = (optionText: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionText
    });
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitTest = () => {
    // Grade the test
    let correctCount = 0;
    const finalQuestions = questions.map((q, idx) => {
      const studentJavob = selectedAnswers[idx];
      const togri = studentJavob === q.savol.togriJavob;
      if (togri) correctCount++;
      return {
        ...q,
        studentJavob,
        togri
      };
    });

    const percent = Math.round((correctCount / questions.length) * 100) || 0;
    
    const resultObject: TestResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      familiyaIsm: registration.familiyaIsm,
      kurs: registration.kurs,
      daraja: registration.daraja,
      talimYonalishi: registration.talimYonalishi,
      jamiSavollar: questions.length,
      togriJavoblar: correctCount,
      foiz: percent,
      vaqt: new Date().toISOString(),
      tanlanganKitoblar: Array.from(new Set(questions.map(q => q.bookName)))
    };

    setQuestions(finalQuestions);
    setIsFinished(true);
    onFinishQuiz(resultObject);
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-gray-200 rounded-xl my-8 max-w-4xl mx-auto p-8 shadow-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Test savollari generatsiya qilinmoqda. Iltimos kuting...</p>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];

  // If score screen is visible
  if (isFinished) {
    const totalCorrect = questions.filter(q => q.studentJavob === q.savol.togriJavob).length;
    const isPassed = totalCorrect >= (questions.length * 0.6); // 60% standard passing bar

    return (
      <div id="quiz-results-screen" className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Award className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Test yakunlandi!
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Hurmatli <strong className="text-gray-900">{registration.familiyaIsm}</strong> ({registration.kurs}), siz topshirgan test muvaffaqiyatli qabul qilindi.
            </p>
          </div>

          {/* Core Score Circle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50/50 rounded-xl border border-gray-150 max-w-2xl mx-auto">
            <div className="text-center flex flex-col justify-center border-r border-gray-200 last:border-0 pr-2 pb-2 sm:pb-0">
              <span className="text-xs font-medium text-gray-500 block">Kurs/Yo‘nalish</span>
              <span className="text-xs font-bold text-gray-900 mt-1 line-clamp-2">
                {registration.kurs} / {registration.talimYonalishi}
              </span>
            </div>
            <div className="text-center flex flex-col justify-center border-r border-gray-200 last:border-0 pr-2 pb-2 sm:pb-0">
              <span className="text-xs font-medium text-gray-500 block">To‘g‘ri javoblar</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1">
                {totalCorrect} / {questions.length}
              </span>
            </div>
            <div className="text-center flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500 block">Foiz Ko‘rsatkichi</span>
              <span className="text-xl font-extrabold text-gray-900 mt-1">
                {Math.round((totalCorrect / questions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              id="btn-back-home"
              onClick={onCancelQuiz}
              className="px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="quiz-playing-screen" className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Registration Info bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 font-medium">Talaba:</div>
          <div className="font-bold text-gray-900 text-sm">
            {registration.familiyaIsm} <span className="text-xs font-mono font-medium text-gray-500">({registration.kurs})</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500 font-medium">Ta‘lim yo‘nalishi:</div>
          <div className="font-semibold text-gray-800 text-sm">
            {registration.daraja} • {registration.talimYonalishi}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-1 sm:mt-0">
          {/* Answer Status */}
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Javob berildi:</span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          {/* Clock Timer */}
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-150 text-rose-800 rounded-lg">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-mono font-bold text-sm tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main active question view card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider font-mono">
              Savol kitobi: <span className="text-gray-900 font-sans italic">{activeQuestion.bookName}</span>
            </span>
          </div>
          <span className="font-mono text-xs text-gray-400 font-bold">
            {currentIdx + 1} - SAVOL
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-950 leading-snug">
            {activeQuestion.savol.savol}
          </h2>
        </div>

        {/* Option Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {activeQuestion.savol.javoblar.map((option, index) => {
            const isSelected = selectedAnswers[currentIdx] === option;
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                id={`btn-option-${index}`}
                key={option}
                onClick={() => handleSelectOption(option)}
                className={`flex items-start text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50/50 shadow-2xs'
                    : 'border-gray-150 hover:border-gray-300 hover:bg-gray-50/40'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 mr-3 ${
                  isSelected ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {optionLabel}
                </span>
                <span className="text-sm font-medium text-gray-800 pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagination Buttons & Quiz Submission Controls */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <button
          id="btn-quiz-prev"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`px-4 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            currentIdx === 0
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Oldingi
        </button>

        {/* Progress Navigation Dots */}
        <div id="quiz-dots-grid" className="hidden md:flex gap-1.5 overflow-x-auto max-w-sm px-2 py-1 scrollbar-thin">
          {questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isActive = idx === currentIdx;

            return (
              <button
                id={`btn-dot-${idx}`}
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-sm text-[10px] font-bold font-mono shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gray-950 text-white ring-2 ring-gray-400'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-150'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {currentIdx < totalQuestions - 1 ? (
          <button
            id="btn-quiz-next"
            onClick={handleNext}
            className="px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            Keyingi
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-submit-confirmation"
            onClick={() => setShowConfirmSubmit(true)}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-pulse"
          >
            Testni yakunlash
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmation Submit Overlay Dialog popup */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs" onClick={() => setShowConfirmSubmit(false)}></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-6 relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-950">Test topshirishni yakunlash</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ishingizni tugatishga rozi ekansiz, natijangiz zudlik bilan saqlanadi.</p>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 leading-relaxed font-semibold">
                Siz hali barcha savollarga javob bermadingiz! ({answeredCount} ta belgilandi, {totalQuestions - answeredCount} ta qoldi).
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                id="btn-confirm-cancel"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium cursor-pointer"
              >
                Orqaga qaytish
              </button>
              <button
                id="btn-confirm-submit"
                onClick={handleSubmitTest}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-2xs cursor-pointer"
              >
                Yakunlash va natija
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
