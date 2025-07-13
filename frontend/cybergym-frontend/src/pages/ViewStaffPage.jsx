import { useEffect, useState } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import EditStaffForm from '../components/EditStaffForm';
import useStaffStore from '../store/useStaffStore';

const ViewStaffPage = ({ setToastMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { Staffs, loading, error, deleteStaff, fetchStaffs } = useStaffStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [StaffToDelete, setStaffToDelete] = useState(null);

    const filteredStaffs = Staffs.filter(Staff =>
        Staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchStaffs();
    }, [fetchStaffs]);

    const handleEdit = (Staff) => {
        setSelectedStaff(Staff);
        setIsFormOpen(true);
    };

    const handleUpdate = (updatedStaff) => {
        setIsFormOpen(false);
        setSelectedStaff(null);
        setToastMessage('Staff updated successfully');
        fetchStaffs();
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDelete = (Staff) => {
        setStaffToDelete(Staff);
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (StaffToDelete?.id) {
            setShowConfirmDelete(false); // Hide popup immediately
            setToastMessage('Deleting...'); // Show immediate feedback
            try {
                const error = await deleteStaff(StaffToDelete.id);
                if (error) throw new Error(error);
                setToastMessage('Staff deleted successfully');
                setStaffToDelete(null);
                fetchStaffs();
            } catch (err) {
                setToastMessage(`Error: ${err.message}`);
            } finally {
                setTimeout(() => setToastMessage(null), 3000); // Clear toast after 3 seconds
            }
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setStaffToDelete(null);
    };

    if (loading) return <div className="p-6 text-center">Loading Staffs...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 h-full box-border">
            {/* Search Bar */}
            <div className="mb-6 sticky top-0 bg-[#FBEAEA] z-10">
                <input
                    type="text"
                    placeholder="Search Staffs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border-2 border-[#C62828] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-sm"
                />
            </div>

            {/* Staff List */}
            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {filteredStaffs.map(Staff => (
                    <div
                        key={Staff.id}
                        className="flex items-center justify-between bg-white rounded-full p-2 shadow-md"
                        style={{ minHeight: '80px' }}
                    >
                        <img
                            src={Staff.image || '/assets/icons/avatar-placeholder.png'}
                            alt={`${Staff.name}'s avatar`}
                            className="w-16 h-16 rounded-full object-cover ml-4"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/icons/avatar-placeholder.png';
                            }}
                        />
                        <span className="flex-1 text-2xl font-medium text-[#C62828] text-center">
                            {Staff.name}
                        </span>
                        <div className="flex space-x-4 mr-6">
                            <img
                                src="/assets/icons/pencil.png"
                                alt="Edit"
                                className="w-6 h-6 cursor-pointer hover:opacity-80"
                                onClick={() => handleEdit(Staff)}
                            />
                            <img
                                src="/assets/icons/bin.png"
                                alt="Delete"
                                className="w-6 h-6 cursor-pointer hover:opacity-80"
                                onClick={() => handleDelete(Staff)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {isFormOpen && selectedStaff && (
                <EditStaffForm
                    Staff={selectedStaff}
                    onClose={() => setIsFormOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}

            {/* Confirmation Popup */}
            {showConfirmDelete && (
                <ConfirmationPopup
                    title="Delete Staff"
                    message={`Are you sure you want to delete ${StaffToDelete?.name}?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};

export default ViewStaffPage;