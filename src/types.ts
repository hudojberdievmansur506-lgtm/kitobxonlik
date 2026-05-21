/**
 * Type declarations for the Kitobxonlik Testi (Book Reading Quiz) Application
 */

export interface Question {
  id: string;
  savol: string;
  togriJavob: string;
  javoblar: string[]; // Options, including the correct one
}

export interface LiteratureBook {
  id: string;
  nom: string;
  savollar: Question[];
  yaratilganVaqt: string;
}

export type CourseType = '1-kurs' | '2-kurs';

export type EducationLevelType = 'Bakalavriat' | 'Magistratura';

export interface StudentRegistration {
  familiyaIsm: string;
  kurs: CourseType;
  talimYonalishi: string;
  daraja: EducationLevelType;
  tanlanganKitoblar: string[]; // Book IDs
}

export interface QuizAttemptQuestion {
  savol: Question;
  bookId: string;
  bookName: string;
  studentJavob?: string;
  togri: boolean;
}

export interface TestResult {
  id: string;
  familiyaIsm: string;
  kurs: CourseType;
  daraja: EducationLevelType;
  talimYonalishi: string;
  jamiSavollar: number;
  togriJavoblar: number;
  foiz: number;
  vaqt: string; // ISO String
  tanlanganKitoblar: string[]; // Book Names
}

export interface QuizSettings {
  vaqtDaqiqa: number; // in minutes, e.g. 30
  savollarSoni: number; // in counts, e.g. 30
}
