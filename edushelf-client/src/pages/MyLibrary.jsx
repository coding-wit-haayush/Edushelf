import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import { getSavedBooks, getLikedBooks, getDownloadedBooks, getRecentBooks } from '../services/api';

const TABS = ['Saved Books', 'Liked Books', 'Downloaded', 'Recently Viewed'];

// The Sidebar links to /my-library?tab=liked etc — map those query values to tab labels
const TAB_QUERY_MAP = {
  saved: 'Saved Books',
  liked: 'Liked Books',
  downloads: 'Downloaded',
  recent: 'Recently Viewed',
};

export default function MyLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = TAB_QUERY_MAP[searchParams.get('tab')] || 'Saved Books';

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  // Keep the tab in sync if the URL changes (e.g. clicking a different Sidebar link)
  useEffect(() => { setActiveTab(tabFromUrl); }, [tabFromUrl]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const queryKey = Object.keys(TAB_QUERY_MAP).find(k => TAB_QUERY_MAP[k] === tab);
    setSearchParams(queryKey ? { tab: queryKey } : {});
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(false);
      try {
        let res;
        if (activeTab === 'Saved Books')          res = await getSavedBooks();
        else if (activeTab === 'Liked Books')     res = await getLikedBooks();
        else if (activeTab === 'Downloaded')      res = await getDownloadedBooks();
        else                                       res = await getRecentBooks();

        setBooks(res.data.books || []);
      } catch {
        setError(true);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [activeTab]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-ink">My Library</h1>
          <p className="text-gray-500 mt-1">Your personal collection of saved and liked books</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-navy-border">
          {TABS.map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-ink border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-ink font-semibold text-lg">Couldn't load your library</p>
            <p className="text-gray-500 text-sm mt-1">Check that the backend server is running and try again.</p>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-ink font-semibold text-lg">No books here yet</p>
            <p className="text-gray-500 text-sm mt-1">Save or like books to see them here</p>
          </div>
        )}
      </main>
    </div>
  );
}
