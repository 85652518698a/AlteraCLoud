export interface CourseMeta {
  id: string;
  label: string;
}

export const COURSES: CourseMeta[] = [
  { id: 'bca', label: 'BCA' },
  { id: 'bba', label: 'BBA' },
  { id: 'bcom', label: 'B.Com' },
  { id: 'bsc', label: 'B.Sc' },
  { id: 'ba', label: 'BA' },
  { id: 'ma', label: 'MA' },
  { id: 'msc', label: 'M.Sc' },
  { id: 'mcom', label: 'M.Com' },
  { id: 'btech-cse', label: 'B.Tech(CSE)' },
  { id: 'btech-cse-aiml', label: 'B.Tech CSE(AI&ML)' },
];
