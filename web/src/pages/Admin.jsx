import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../services/admin';
import { DataGrid } from '@mui/x-data-grid';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsers();
      setUsers(users);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const columns = [
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'name', headerName: 'Name', width: 200 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => (
        <select
          value={params.value || 'member'}
          onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
          className="p-1 border rounded"
        >
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
        </select>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <button
          onClick={() => handleDeleteUser(params.row.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow" style={{ height: 600 }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          loading={loading}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </div>
  );
}