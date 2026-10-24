// Shared constants used across pages.

export const DEVELOPER = {
  name: 'Aayush Sharma',
  linkedin: 'https://www.linkedin.com/in/aayush-sharma-java-dev79914/',
  github: 'https://github.com/coding-wit-haayush',
};

// Departments shown on the home page and filters. `tint` classes are for light-theme badges.
export const DEPARTMENTS = [
  { name: 'BCA',         icon: '💻', desc: 'Computer Applications',   tint: 'bg-blue-50 text-blue-700 border-blue-200',       grad: 'from-blue-500 to-indigo-600' },
  { name: 'BBA',         icon: '📈', desc: 'Business Administration', tint: 'bg-orange-50 text-orange-700 border-orange-200', grad: 'from-orange-400 to-amber-500' },
  { name: 'B.Tech',      icon: '⚙️', desc: 'Technology & Engineering', tint: 'bg-violet-50 text-violet-700 border-violet-200', grad: 'from-violet-500 to-purple-600' },
  { name: 'Pharma',      icon: '💊', desc: 'Pharmacy & Life Sciences', tint: 'bg-emerald-50 text-emerald-700 border-emerald-200', grad: 'from-emerald-500 to-teal-600' },
  { name: 'Agriculture', icon: '🌾', desc: 'Agricultural Sciences',    tint: 'bg-lime-50 text-lime-700 border-lime-200',       grad: 'from-lime-500 to-green-600' },
  { name: 'MBA',         icon: '🏆', desc: 'Master of Business Admin', tint: 'bg-pink-50 text-pink-700 border-pink-200',       grad: 'from-pink-500 to-rose-600' },
];

export const DEPT_BY_NAME = Object.fromEntries(DEPARTMENTS.map(d => [d.name, d]));

export const SEMESTER_LIST = [1, 2, 3, 4, 5, 6, 7, 8];

// Fallback badge style for departments not in the list above (e.g. B.Sc, B.Com)
export const DEFAULT_TINT = 'bg-slate-50 text-slate-600 border-slate-200';
