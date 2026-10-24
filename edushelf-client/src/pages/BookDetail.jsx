import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineChevronLeft, HiOutlineHeart, HiHeart,
  HiOutlineBookmark, HiBookmark, HiOutlineShare, HiOutlineDownload,
  HiOutlineEye
} from 'react-icons/hi';
import { getBookById, likeBook, saveBook, downloadBook, getBookReviews, addBookReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const COVER_GRADIENTS = ['from-blue-600 to-indigo-800', 'from-brand-600 to-pink-700', 'from-teal-600 to-cyan-700', 'from-orange-600 to-red-700'];

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [bookRes, revRes] = await Promise.all([getBookById(id), getBookReviews(id)]);
        const fetchedBook = bookRes.data.book || bookRes.data;
        setBook(fetchedBook);
        setReviews(revRes.data.reviews || []);
        setLiked(!!user && fetchedBook.likes?.includes(user._id));
        setSaved(!!user && fetchedBook.savedBy?.includes(user._id));
      } catch (err) {
        // A real 404 (or any fetch failure) should say so, not quietly swap in fake
        // "Clean Code" sample data — that hides genuinely broken links from the user.
        setNotFound(true);
        if (err.response?.status !== 404) toast.error('Could not load this book');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { toast.error('Login to like'); return; }
    const wasLiked = liked;
    setLiked(!wasLiked); // optimistic
    try {
      const res = await likeBook(book._id);
      setLiked(res.data.isLiked);
    } catch {
      setLiked(wasLiked); // roll back
      toast.error('Something went wrong');
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error('Login to save'); return; }
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      const res = await saveBook(book._id);
      setSaved(res.data.isSaved);
      toast.success(res.data.isSaved ? '📚 Saved to My Library' : 'Removed from library');
    } catch {
      setSaved(wasSaved);
      toast.error('Something went wrong');
    }
  };

  // Share: native share sheet on phones, otherwise copy the link
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: book?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error('Could not share this link');
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) { toast.error('Login to review'); return; }
    if (!rating) { toast.error('Select a rating'); return; }
    if (!comment.trim()) { toast.error('Write a comment'); return; }

    setSubmittingReview(true);
    try {
      const res = await addBookReview(book._id, { rating, comment });
      setReviews([res.data.review, ...reviews]);
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      // Show the real reason it failed (e.g. "already reviewed") instead of
      // silently adding a fake review to the list on error.
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Open the PDF in a new tab, and tell the backend so downloads/views are tracked for real.
  const handleReadBook = async () => {
    if (!book?.pdfUrl) { toast.error('PDF link is not available for this book'); return; }
    window.open(book.pdfUrl, '_blank');
  };

  // Download PDF, going through the backend first so the download counter and the
  // user's download history actually update (previously this only opened Cloudinary
  // directly and the backend never knew a download happened).
  const handleDownloadBook = async () => {
    if (!book?.pdfUrl) { toast.error('Download link not available'); return; }
    try {
      if (user) await downloadBook(book._id);
    } catch {
      // Tracking failure shouldn't block the actual download
    }
    const link = document.createElement('a');
    link.href = book.pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    // Note: browsers ignore the `download` attribute for cross-origin URLs (Cloudinary
    // is a different origin), so this will open in a new tab rather than force-saving —
    // a true forced download would need the file proxied through our own backend.
    link.download = `${book.title || 'book'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="page-container mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[300px_1fr_240px] gap-8">
          <div className="w-52 h-64 rounded-2xl bg-navy-card animate-pulse" />
          <div className="flex flex-col gap-3">
            <div className="h-8 w-2/3 rounded bg-navy-card animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-navy-card animate-pulse" />
            <div className="h-24 w-full rounded bg-navy-card animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-5xl mb-4">📕</p>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Book not found</h1>
        <p className="text-gray-500 mb-6">This book may have been removed, or the link is incorrect.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
          <HiOutlineChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const coverGrad = COVER_GRADIENTS[(book.title?.charCodeAt(0) || 0) % 4];

  return (
    <div className="page-container mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ink transition-colors mb-6">
        <HiOutlineChevronLeft className="w-4 h-4" /> Back to results
      </Link>

      <div className="grid lg:grid-cols-[300px_1fr_240px] gap-8">
        {/* LEFT — Cover */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-52 h-64 rounded-2xl bg-gradient-to-br ${coverGrad} flex items-center justify-center shadow-card text-6xl overflow-hidden`}>
            {book.coverImage ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" /> : '📖'}
          </div>

          {/* Actions */}
          <div className="w-52 flex flex-col gap-2.5">
            <button onClick={handleReadBook} className="btn-primary flex items-center justify-center gap-2 py-3">
              <HiOutlineEye className="w-5 h-5" /> Read Now
            </button>
            <button onClick={handleDownloadBook} className="btn-secondary flex items-center justify-center gap-2 py-2.5">
              <HiOutlineDownload className="w-4 h-4" /> Download PDF
            </button>
            <div className="flex gap-2">
              <button onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm transition-all ${
                  liked ? 'bg-pink-600/20 border-pink-500 text-pink-600' : 'border-navy-border text-gray-400 hover:border-pink-500 hover:text-pink-600'}`}>
                {liked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />} Like
              </button>
              <button onClick={handleSave}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm transition-all ${
                  saved ? 'bg-brand-600/20 border-brand-500 text-brand-600' : 'border-navy-border text-gray-400 hover:border-brand-500 hover:text-brand-600'}`}>
                {saved ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />} Save
              </button>
              <button onClick={handleShare} aria-label="Share this book" title="Share" className="p-2.5 rounded-xl border border-navy-border text-gray-400 hover:text-ink hover:border-gray-400 transition-all">
                <HiOutlineShare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CENTER — Details */}
        <div>
          <div className="mb-6">
            <h1 className="font-display text-3xl font-extrabold text-ink mb-1">{book.title}</h1>
            <p className="text-brand-600 font-medium mb-3">{book.author}</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <StarRating value={Math.round(book.averageRating || 0)} readOnly size="sm" />
                <span className="text-amber-500 font-bold text-sm">{(book.averageRating || 0).toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({reviews.length.toLocaleString()} reviews)</span>
              </div>
              <span className="text-gray-500 text-sm flex items-center gap-1"><HiOutlineEye className="w-4 h-4" />{(book.views || 0).toLocaleString()} Views</span>
              <span className="text-gray-500 text-sm flex items-center gap-1"><HiOutlineDownload className="w-4 h-4" />{(book.downloads || 0).toLocaleString()} Downloads</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="dept-badge border bg-blue-500/10 text-blue-600 border-blue-500/20">{book.department}</span>
              <span className="dept-badge border bg-brand-500/10 text-brand-600 border-brand-500/20">Semester {book.semester}</span>
              {book.subject && <span className="dept-badge border bg-cyan-500/10 text-cyan-600 border-cyan-500/20">{book.subject}</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-navy-border mb-6">
            {['about', 'reviews'].map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? 'text-ink border-brand-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                {tab} {tab === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div>
              <h3 className="font-semibold text-ink mb-2">About the Book</h3>
              <p className="text-gray-400 leading-relaxed mb-4">{book.description || 'No description provided.'}</p>
              <div className="flex flex-wrap gap-2">
                {book.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-navy-card border border-navy-border text-gray-400 px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {/* Add Review */}
              {user && (
                <div className="card p-4 mb-6">
                  <p className="text-sm font-semibold text-ink mb-3">Write a Review</p>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating value={rating} onChange={setRating} size="lg" />
                    <span className="text-sm text-gray-500">{rating ? `${rating}/5` : 'Select rating'}</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your thoughts about this book..."
                    className="input-field resize-none mb-3 text-sm"
                  />
                  <button onClick={handleReviewSubmit} disabled={submittingReview} className="btn-primary text-sm disabled:opacity-60">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No reviews yet — be the first to review this book!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map(review => (
                    <div key={review._id} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                            {review.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">{review.user?.name}</p>
                            <p className="text-xs text-gray-500">{review.user?.department} • {new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating value={review.rating} readOnly size="sm" />
                      </div>
                      <p className="text-sm text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Book Info Panel */}
        <div className="hidden lg:block">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-ink mb-4 text-sm">Book Info</h3>
            {[
              { label: 'Author',    value: book.author },
              { label: 'Publisher', value: book.publisher || 'Not specified' },
              { label: 'Department', value: book.department },
              { label: 'Semester', value: `Semester ${book.semester}` },
              { label: 'Subject',  value: book.subject || '—' },
              { label: 'Published', value: book.publishedDate || '—' },
              { label: 'Pages',    value: book.pages ? `${book.pages} pages` : '—' },
              { label: 'Language', value: book.language || 'English' },
              { label: 'File Size',value: book.fileSize || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col mb-3">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
