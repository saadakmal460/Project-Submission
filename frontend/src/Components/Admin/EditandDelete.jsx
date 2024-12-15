import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import { Link } from 'react-router-dom';

const EditandDelete = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://aibackend-us18nadk.b4a.run/api/getAllUsers');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const deleteUser = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://aibackend-us18nadk.b4a.run/api/delete?id=${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Edit user
    const editUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.patch(`http:localhost:8080/api/update?id=${selectedUser._id}`, editedData);
            fetchUsers();
            closeModal();
        } catch (error) {
            console.error('Error editing user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Open modal
    const openModal = (user) => {
        setSelectedUser(user);
        setEditedData(user);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setEditedData({});
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    // Toggle password visibility
    const handlePasswordShow = () => {
        setShowPassword((prev) => !prev);
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 100 },
        { field: 'username', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'role', headerName: 'Role', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <Button onClick={() => openModal(params.row)}>
                        <EditIcon color="primary" />
                    </Button>
                    <Button onClick={() => deleteUser(params.row._id)}>
                        <DeleteIcon color="error" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className='mt-2' style={{height: 600, width: '100%', position: 'relative' }}>
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Link to='/admin/add'>
                <Button>
                    Add user
                </Button>
            </Link>

            <DataGrid
                rows={users}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                checkboxSelection
                disableSelectionOnClick
                getRowId={(row) => row._id}
            />

            <Modal open={isModalOpen} onClose={closeModal}>
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                        {/* Cross Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
                        >
                            <CloseIcon />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={editUser} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editedData.username || ''}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editedData.email || ''}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Role
                                </label>
                                <select
                                    name="role"
                                    id="role"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    required
                                    value={editedData.role || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="Police_Officer">Police Officer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EditandDelete;
