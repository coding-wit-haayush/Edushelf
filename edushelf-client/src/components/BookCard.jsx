import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineBookmark, HiBookmark,
         HiOutlineEye, HiOutlineDownload, HiStar } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { likeBook, saveBook } from '../services/api';
import { DEPT_BY_NAME, DEFAULT_TINT } from '../constants';
import toast from 'react-hot-toast';

const BOOK_COVERS = [
  { bg: 'from-blue-500 to-indigo-600',   emoji: '📐' },
  { bg: 'from-violet-500 to-purple-600', emoji: '🧠' },
  { bg: 'from-teal-500 to-cyan-600',     emoji: '💻' },
  { bg: 'from-orange-400 to-rose-500',   emoji: '📊' },
  { bg: 'from-emerald-500 to-green-600', emoji: '🔬' },
  { bg: 'from-pink-500 to-rose-600',     emoji: '📖' },
];

const coverFor = (title = '') => BOOK_COVERS[(title.charCodeAt(0) || 0) % BOOK_COVERS.length];

export default function BookCard({ book, compact = false }) {
  const { user, updateUser } = useAuth();
  // Work out whether THIS user already liked/saved the book (the API returns the list of user ids)
  const uid = user?._id;
  const initialLiked = !!(uid && Array.isArray(book.likes) && book.likes.includes(uid));
  const initialSaved = !!(user?.savedBooks && user.savedBooks.includes(book._id));
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likesCount, setLikesCount] = useState(Array.isArray(book.likes) ? book.likes.length : 0);
  const [busy, setBusy] = useState(false);

  // The logged-in user may finish loading after the card first renders
  useEffect(() => { setLiked(initialLiked); setSaved(initialSaved); /* eslint-disable-next-line */ }, [uid, book._id]);

  const cover = coverFor(book.title);
  const tint = DEPT_BY_NAME[book.department]?.tint || DEFAULT_TINT;
  const rating = Number(book.averageRating);

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like books'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const res = await likeBook(book._id);
      const nowLiked = res.data?.isLiked ?? !liked;
      setLiked(nowLiked);
      setLikesCount(res.data?.likes ?? (nowLiked ? likesCount + 1 : likesCount - 1));
    } catch { toast.error('Something went wrong'); }
    finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save books'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const res = await saveBook(book._id);
      const nowSaved = res.data?.isSaved ?? !saved;
      toast.success(nowSaved ? 'Added to My Library' : 'Removed from My Library');
      setSaved(nowSaved);
      updateUser(u => ({
        ...u,
        savedBooks: nowSaved ? [...(u.savedBooks || []), book._id] : (u.savedBooks || []).filter(id => id !== book._id),
      }));
    } catch { toast.error('Something went wrong'); }
    finally { setBusy(false); }
  };

  if (compact) {
    return (
      <Link to={`/book/${book._id}`} className="flex items-center gap-3 p-3 card hover:border-brand-300 transition-all duration-200 group">
        <div className={`w-10 h-12 rounded-lg bg-gradient-to-br ${cover.bg} flex items-center justify-center text-lg shrink-0`}>{cover.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate group-hover:text-brand-700 transition-colors">{book.title}</p>
          <p className="text-xs text-gray-500 truncate">{book.author}</p>
        </div>
        <div className="text-xs text-gray-500 shrink-0">Sem {book.semester}</div>
      </Link>
    );
  }

  return (
    <article className="card book-card group overflow-hidden flex flex-col">
      <Link to={`/book/${book._id}`} className="block flex-1" aria-label={`Open ${book.title}`}>
        {/* Cover */}
        <div className={`relative aspect-[4/3] bg-gradient-to-br ${cover.bg} flex items-center justify-center overflow-hidden`}>
          {book.coverImage ? (
            <img src={book.coverImage} alt={`Cover of ${book.title}`} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl drop-shadow-sm" aria-hidden="true">{cover.emoji}</span>
          )}
          <span className={`dept-badge border absolute top-2.5 left-2.5 ${tint}`}>{book.department}</span>
          <span className="absolute top-2.5 right-2.5 bg-white/90 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">Sem {book.semester}</span>
        </div>

        {/* Content */}
        <div className="p-4 pb-2">
          <h3 className="font-display font-bold text-ink text-[15px] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
        </div>
      </Link>

      {/* Footer: stats + actions (always visible — works on touch screens too) */}
      <div className="px-4 pb-3.5 pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
          <span className="flex items-center gap-1" title="Rating">
            <HiStar className="w-4 h-4 text-amber-500" />{rating > 0 ? rating.toFixed(1) : '—'}
          </span>
          <span className="hidden sm:flex items-center gap-1" title="Views"><HiOutlineEye className="w-4 h-4" />{book.views || 0}</span>
          <span className="hidden xl:flex items-center gap-1" title="Downloads"><HiOutlineDownload className="w-4 h-4" />{book.downloads || 0}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleLike} aria-label={liked ? 'Unlike' : 'Like'} aria-pressed={liked} title="Like"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${liked ? 'text-pink-600 bg-pink-50' : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'}`}>
            {liked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}{likesCount}
          </button>
          <button onClick={handleSave} aria-label={saved ? 'Remove from library' : 'Save to library'} aria-pressed={saved} title="Save"
            className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'}`}>
            {saved ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
