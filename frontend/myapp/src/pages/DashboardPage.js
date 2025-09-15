// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import EditNoteModal from '../components/EditNoteModal';
import InviteUserModal from '../components/InviteUserModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = 'https://yard-stick-notes-app.vercel.app';

const DashboardPage = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { toast, showToast, hideToast } = useToast();
  
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- It is defined right here
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentlyEditingNote, setCurrentlyEditingNote] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await axios.get(`${API_URL}/notes`);
      setNotes(res.data);
    } catch (err) {
      showToast('Failed to fetch notes.', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/notes`, { title: newNoteTitle });
      setNewNoteTitle('');
      showToast('Note created successfully!', 'success');
      fetchNotes();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create note.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteId, newTitle) => {
    setIsSubmitting(true);
    try {
      await axios.put(`${API_URL}/notes/${noteId}`, { title: newTitle });
      showToast('Note updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchNotes();
    } catch (err) {
      showToast('Failed to update note.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/notes/${noteId}`);
      showToast('Note deleted.', 'success');
      fetchNotes();
    } catch (err) {
      showToast('Failed to delete note.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/tenants/${user.tenantSlug}/upgrade`);
      showToast('Upgrade successful! You now have unlimited notes.', 'success');
      updateUser({ tenantPlan: 'PRO' });
      fetchNotes();
    } catch (err) {
      showToast('Upgrade failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInviteUser = async ({ email, role }) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/users/invite`, { email, role });
      showToast(res.data.message, 'success');
      setIsInviteModalOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send invite.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const memoizedNotes = useMemo(() => notes, [notes]);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-indigo-600">SaaS Notes</h1>
        </div>
        <div className="flex-grow p-4">
          <div className="p-3 mb-4 bg-slate-100 rounded-lg">
            <p className="text-sm font-semibold text-slate-800">{user?.tenantName}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full mb-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Invite User
            </button>
          )}
        </div>
        <div className="p-4 border-t">
          <button onClick={logout} className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h2>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md transition hover:shadow-lg">
          <form onSubmit={handleCreateNote} className="flex items-center space-x-4">
            <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Create a new note..." className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md transition hover:shadow-lg">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Your Notes</h3>
          {user?.tenantPlan === 'FREE' && notes.length >= 3 && user?.role === 'ADMIN' && (
            <div className="p-4 mb-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
              <p>You have reached the 3-note limit for the Free plan.</p>
              <button onClick={handleUpgrade} disabled={isSubmitting} className="mt-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400">
                {isSubmitting ? 'Upgrading...' : 'Upgrade to Pro'}
              </button>
            </div>
          )}
          {pageLoading ? (
            <p className="text-slate-500">Loading notes...</p>
          ) : (
            <div className="space-y-3">
              {memoizedNotes.length > 0 ? (
                memoizedNotes.map((note) => (
                  <div key={note.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-400 transition">
                    <p className="text-slate-800">{note.title}</p>
                    <div className="space-x-3">
                      <button onClick={() => { setCurrentlyEditingNote(note); setIsEditModalOpen(true); }} disabled={isSubmitting} className="text-sm font-medium text-blue-600 hover:underline disabled:text-slate-400">Edit</button>
                      <button onClick={() => handleDeleteNote(note.id)} disabled={isSubmitting} className="text-sm font-medium text-red-600 hover:underline disabled:text-slate-400">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">You have no notes yet. Add one above!</p>
              )}
            </div>
          )}
        </div>
      </main>

      {isEditModalOpen && (
        <EditNoteModal note={currentlyEditingNote} onSave={handleUpdateNote} onClose={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting}/>
      )}
      {isInviteModalOpen && (
        <InviteUserModal onInvite={handleInviteUser} onClose={() => setIsInviteModalOpen(false)} isSubmitting={isSubmitting}/>
      )}
    </div>
  );
};

export default DashboardPage;