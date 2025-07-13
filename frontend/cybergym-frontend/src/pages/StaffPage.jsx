import { useState } from 'react';
import AddStaffForm from '../components/AddStaffForm';

const StaffPage = ({ onViewStaffs, onUpdateSalary, onStaffAttendance }) => {
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    return (
        <div className="h-full w-full p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 place-items-center h-full">
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={() => setIsAddStaffOpen(true)}
                >
                    Add Staff
                </button>
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onViewStaffs}
                >
                    View Staff
                </button>
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onUpdateSalary}
                >
                    Update Salary
                </button>
                <button className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onStaffAttendance}
                >
                    Today's Attendance
                </button>
            </div>
            {isAddStaffOpen && <AddStaffForm onClose={() => setIsAddStaffOpen(false)} />}
        </div>
    );
};

export default StaffPage;



