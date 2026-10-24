import { HiOutlineCheckCircle } from 'react-icons/hi';
import Logo from './Logo';

const POINTS = [
  'Semester-wise books for every department',
  'Read online or download as PDF',
  'Save, like and review your favourites',
  'Request any book that is missing',
];

// Two-column auth layout: brand panel (desktop) + form card.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <aside className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-12 xl:p-16 flex-col justify-center">
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/10" />
        <div className="relative max-w-md">
          <h2 className="font-display font-extrabold !text-white text-4xl leading-tight mb-4">Everything you need to study, in one shelf.</h2>
          <p className="text-brand-100 mb-8 leading-relaxed">Find the right book for the right semester — organised by department, searchable and free to read.</p>
          <ul className="space-y-3.5">
            {POINTS.map(p => (
              <li key={p} className="flex items-start gap-3 text-white/95 text-sm">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6"><Logo /></div>
          <div className="card p-6 sm:p-8">
            <h1 className="font-display font-extrabold text-ink text-2xl mb-1">{title}</h1>
            <p className="text-gray-500 text-sm mb-7">{subtitle}</p>
            {children}
          </div>
          {footer && <p className="text-center text-sm text-gray-500 mt-6">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
