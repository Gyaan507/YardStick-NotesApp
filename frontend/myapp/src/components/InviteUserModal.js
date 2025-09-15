import React, { useState } from 'react';

const InviteUserModal = ({ onInvite, onClose, isSubmitting }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const handleInvite = (e) => {
    e.preventDefault();
    onInvite({ email, role });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invite New User</h2>
        <form onSubmit={handleInvite}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input type="radio" value="MEMBER" checked={role === 'MEMBER'} onChange={(e) => setRole(e.target.value)} className="form-radio" />
                <span className="ml-2">Member</span>
              </label>
              <label className="flex items-center">
                <input type="radio" value="ADMIN" checked={role === 'ADMIN'} onChange={(e) => setRole(e.target.value)} className="form-radio" />
                <span className="ml-2">Admin</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;