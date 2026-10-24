import { useState, useRef } from 'react';
import { HiOutlineCloudUpload, HiOutlineDocument, HiX } from 'react-icons/hi';
import Sidebar from '../components/Sidebar';
import { uploadBook } from '../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['BCA', 'BBA', 'B.Tech', 'Pharma', 'Agriculture', 'MBA', 'BCA (AI/ML)', 'B.Sc', 'B.Com'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function UploadBook() {
  const [form, setForm] = useState({ title: '', author: '', department: '', semester: '', subject: '', tags: '', description: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') setPdfFile(file);
    else toast.error('Only PDF files allowed');
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') setPdfFile(file);
    else toast.error('Only PDF files allowed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department || !form.semester) { toast.error('Fill required fields'); return; }
    if (!pdfFile) { toast.error('Upload a PDF file'); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append('pdf', pdfFile);
    if (coverFile) formData.append('coverImage', coverFile);

    setLoading(true);
    try {
      await uploadBook(formData);
      toast.success('Book uploaded successfully! Pending admin approval.');
      setForm({ title: '', author: '', department: '', semester: '', subject: '', tags: '', description: '' });
      setPdfFile(null);
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-ink">Upload New Book</h1>
          <p className="text-gray-500 mt-1">Share knowledge with thousands of students</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left — PDF Drop Zone */}
            <div className="flex flex-col gap-4">
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`drop-zone rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-52 ${dragging ? 'dragging' : ''}`}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

                {pdfFile ? (
                  <>
                    <HiOutlineDocument className="w-12 h-12 text-brand-600" />
                    <div className="text-center">
                      <p className="text-ink font-medium text-sm truncate max-w-[200px]">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs">
                      <HiX className="w-3 h-3" /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="w-12 h-12 text-gray-600" />
                    <div className="text-center">
                      <p className="text-ink font-medium text-sm">Drag & Drop PDF here</p>
                      <p className="text-xs text-gray-500 mt-1">or</p>
                    </div>
                    <button type="button" className="btn-primary text-sm px-4 py-2">Choose PDF File</button>
                    <p className="text-xs text-gray-600">Max file size: 50MB</p>
                  </>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Cover Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])}
                  className="input-field text-sm py-2.5 file:mr-3 file:bg-navy-card file:text-gray-300 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs" />
              </div>
            </div>

            {/* Right — Form */}
            <div className="card p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Book Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="Enter book title" className="input-field" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Author</label>
                <input type="text" name="author" value={form.author} onChange={handleChange}
                  placeholder="Enter author name" className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Department *</label>
                  <select name="department" value={form.department} onChange={handleChange} className="input-field appearance-none">
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Semester *</label>
                  <select name="semester" value={form.semester} onChange={handleChange} className="input-field appearance-none">
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange}
                  placeholder="Enter subject" className="input-field" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Tags (comma separated)</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange}
                  placeholder="e.g. DBMS, Computer, SQL" className="input-field" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Enter book description..." className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary py-3 text-base font-semibold mt-2 disabled:opacity-60">
                {loading ? 'Uploading...' : '⬆ Upload Book'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
