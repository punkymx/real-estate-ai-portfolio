// src/app/admin/users/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Redirect if not authenticated or not ADMIN role
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Function to fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || 'Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount and when session/status changes
  useEffect(() => {
    if (status === 'authenticated' && session.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session, status]);

  // --- Delete User Logic ---
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Remove the deleted user from the state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
      console.log(`User ${userToDelete.email} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || 'Failed to delete user.');
    } finally {
      setIsDeletingUser(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // --- Edit Role Logic ---
  const handleEditClick = (user) => {
    setUserToEdit(user);
    setNewRole(user.role); // Set initial role in the modal
    setShowEditModal(true);
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const confirmEditRole = async () => {
    if (!userToEdit || !newRole) return;

    setIsUpdatingRole(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Update the user's role in the local state
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userToEdit.id ? { ...u, role: newRole } : u
      ));
      console.log(`User ${userToEdit.email} role updated to ${newRole}.`);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError(err.message || 'Failed to update user role.');
    } finally {
      setIsUpdatingRole(false);
      setShowEditModal(false);
      setUserToEdit(null);
      setNewRole('');
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setNewRole('');
  };


  // Display loading or unauthorized message
  if (status === 'loading' || isLoading) {
    return <p className="text-center text-blue-600 p-8 text-lg">Loading users...</p>;
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="text-center text-red-600 p-8 text-lg">
        <p>You do not have permission to access this page.</p>
        <Link href="/auth/signin" className="text-blue-500 hover:underline mt-4 inline-block">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">User Management (Admin Panel)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {users.length === 0 && !isLoading && !error ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Created At</th> {/* New column */}
                <th className="py-3 px-6 text-left">Updated At</th> {/* New column */}
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{user.name || 'N/A'}</td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">{user.role}</td>
                  <td className="py-3 px-6 text-left">{new Date(user.createdAt).toLocaleDateString()}</td> {/* Format date */}
                  <td className="py-3 px-6 text-left">{new Date(user.updatedAt).toLocaleDateString()}</td> {/* Format date */}
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-xs mr-2 transition-colors duration-200"
                        disabled={isUpdatingRole || isDeletingUser}
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors duration-200"
                        disabled={isUpdatingRole || isDeletingUser || user.id === session.user.id} // Prevent deleting self
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm User Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete user "{userToDelete.email}"? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                disabled={isDeletingUser}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeletingUser}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {isDeletingUser ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Edit Role for {userToEdit.email}</h3>
            <div className="mb-4">
              <label htmlFor="newRole" className="block text-sm font-medium text-gray-700 mb-2">Select New Role:</label>
              <select
                id="newRole"
                name="newRole"
                value={newRole}
                onChange={handleRoleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUpdatingRole}
              >
                {/* Dynamically get roles from a predefined list or enum if available */}
                {['CLIENT', 'AGENT', 'ADMIN'].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelEdit}
                disabled={isUpdatingRole}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditRole}
                disabled={isUpdatingRole}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {isUpdatingRole ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
// This component serves as the admin panel for managing users.
// It allows admins to view, edit roles, and delete users. The component handles user authentication    
// and authorization, ensuring only users with the ADMIN role can access it.
// The design is responsive and uses Tailwind CSS for styling.
// It includes loading states, error handling, and confirmation modals for delete and edit actions. 
// The component also prevents admins from deleting themselves and provides a user-friendly interface for managing user roles.
// The admin can edit user roles and delete users, with appropriate confirmation prompts for these actions.
// The component uses Next.js's `useSession` for authentication and `useRouter` for navigation.
