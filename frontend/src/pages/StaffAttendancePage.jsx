import { useEffect, useState } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import EditStaffForm from '../components/EditStaffForm';
import useStaffStore from '../store/useStaffStore';

const StaffAttendancePage = ({ setToastMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const {
        Staffs, // Changed from staff to match store
        absent,
        loading,
        error,
        fetchStaffs, // Changed from fetchStaff
        fetchAbsent,
        attendance,
    } = useStaffStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showConfirmPresent, setShowConfirmPresent] = useState(false);
    const [staffToPresent, setStaffToPresent] = useState(null);

    // Filter Staffs based on search term, with a fallback to empty array
    const filteredStaffs = (Staffs || []).filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchAbsent(); // Fetch absent staff
        fetchStaffs(); // Fetch all staff
    }, [fetchAbsent, fetchStaffs]);

    const handleUpdate = (updatedStaff) => {
        setIsFormOpen(false);
        setSelectedStaff(null);
        setToastMessage('Staff updated successfully');
        fetchAbsent();
        fetchStaffs(); // Refresh staff list
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handlePresent = (staff) => {
        setStaffToPresent(staff);
        setShowConfirmPresent(true);
    };

    const confirmPresent = async () => {
        if (staffToPresent?.id) {
            setShowConfirmPresent(false);
            setToastMessage('Marking Present...');
            try {
                const error = await attendance({ staffId: staffToPresent.id });
                if (error) throw new Error(error);
                setToastMessage('Marked as present successfully');
                setStaffToPresent(null);
                fetchAbsent(); // Refresh absent list
                fetchStaffs(); // Refresh staff list
            } catch (err) {
                setToastMessage(`Error: ${err.message}`);
            } finally {
                setTimeout(() => setToastMessage(null), 3000);
            }
        }
    };

    const cancelPresent = () => {
        setShowConfirmPresent(false);
        setStaffToPresent(null);
    };

    // Only show loading or error if no data is available
    if (loading && !(Staffs || []).length && !(absent || []).length) return <div className="p-6 text-center">Loading Staffs...</div>;
    if (error && !(Staffs || []).length && !(absent || []).length) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    console.log('Staffs:', Staffs, 'Absent:', absent, 'Loading:', loading, 'Error:', error); // Debug log

    return (
        <div className="p-6 h-full box-border">
            <div className="mb-6 sticky top-0 bg-[#FBEAEA] z-10">
                <input
                    type="text"
                    placeholder="Search Staffs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border-2 border-[#C62828] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-sm"
                />
            </div>

            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {filteredStaffs.map(staff => {
                    const isAbsent = (absent || []).some(absentStaff => absentStaff.id === staff.id);
                    return (
                        <div
                            key={staff.id}
                            className="flex items-center justify-between bg-white rounded-full p-2 shadow-md"
                            style={{ minHeight: '80px' }}
                        >
                            <img
                                src={staff.image || '/assets/icons/avatar-placeholder.png'}
                                alt={`${staff.name}'s avatar`}
                                className="w-16 h-16 rounded-full object-cover ml-4"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/icons/avatar-placeholder.png';
                                }}
                            />
                            <span className="flex-1 text-2xl font-medium text-[#C62828] text-center">
                                {staff.name}
                            </span>
                            <div className="flex items-center space-x-4 mr-6">
                                <input
                                    type="checkbox"
                                    checked={!isAbsent} // Checked if not absent
                                    onChange={() => isAbsent && handlePresent(staff)} // Trigger confirmation only if absent
                                    className="w-6 h-6 cursor-pointer accent-[#C62828]" // Styled checkbox
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {isFormOpen && selectedStaff && (
                <EditStaffForm
                    staff={selectedStaff}
                    onClose={() => setIsFormOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}

            {showConfirmPresent && (
                <ConfirmationPopup
                    title="Mark Present"
                    message={`Do you want to mark ${staffToPresent?.name} as present?`}
                    onConfirm={confirmPresent}
                    onCancel={cancelPresent}
                />
            )}
        </div>
    );
};

export default StaffAttendancePage;