import { Link } from 'react-router-dom';
import { HiOutlineBookOpen } from 'react-icons/hi';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 shrink-0 ${className}`} aria-label="EduShelf home">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
        <HiOutlineBookOpen className="w-5 h-5 text-white" />
      </span>
      <span className="font-display font-extrabold text-ink text-xl tracking-tight">
        Edu<span className="text-brand-600">Shelf</span>
      </span>
    </Link>
  );
}
