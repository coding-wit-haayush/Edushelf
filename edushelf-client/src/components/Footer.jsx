import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import Logo from './Logo';
import { DEVELOPER, DEPARTMENTS } from '../constants';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-navy-border mt-8 pb-20 lg:pb-0">
      <div className="page-container mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-xs">
              A free digital library for college students — semester-wise books, notes and study material, in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link to="/explore" className="hover:text-brand-600 transition-colors">Browse Library</Link></li>
              <li><Link to="/request-book" className="hover:text-brand-600 transition-colors">Request a Book</Link></li>
              <li><Link to="/my-library" className="hover:text-brand-600 transition-colors">My Library</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink mb-4">Departments</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              {DEPARTMENTS.map(d => (
                <li key={d.name}>
                  <Link to={`/department/${encodeURIComponent(d.name)}`} className="hover:text-brand-600 transition-colors">{d.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink mb-4">Developer</h4>
            <p className="text-sm text-gray-500">Designed &amp; developed by</p>
            <p className="font-display font-bold text-ink text-lg mt-0.5">{DEVELOPER.name}</p>
            <div className="flex items-center gap-3 mt-4">
              <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer"
                aria-label="Aayush Sharma on LinkedIn"
                className="w-10 h-10 rounded-xl border border-navy-border flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href={DEVELOPER.github} target="_blank" rel="noopener noreferrer"
                aria-label="Aayush Sharma on GitHub"
                className="w-10 h-10 rounded-xl border border-navy-border flex items-center justify-center text-gray-500 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all">
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} EduShelf. All rights reserved.</p>
          <p>
            Developed by{' '}
            <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-brand-600 transition-colors">
              {DEVELOPER.name}
            </a>
            {' · '}
            <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">LinkedIn</a>
            {' · '}
            <a href={DEVELOPER.github} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">GitHub</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
