import { useState } from 'react';
import AddClientForm from '../components/AddClientForm';

const ClientPage = ({ onViewClients, onUpdateMembership, onClientAttendance, setToastMessage }) => {
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [toastMessage] = useState(null);

    return (
        <div className="h-full w-full p-6">
            {toastMessage && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#C62828] text-white px-4 py-2 rounded shadow-lg z-50">
                    {toastMessage}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 place-items-center h-full">
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={() => setIsAddClientOpen(true)}
                >
                    Add Client
                </button>
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onViewClients}
                >
                    View Client
                </button>
                <button
                    className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onUpdateMembership}
                >
                    Update Membership
                </button>
                <button className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                    onClick={onClientAttendance}
                >
                    Today's Attendance
                </button>
            </div>
            {isAddClientOpen && <AddClientForm onClose={() => setIsAddClientOpen(false)}
                setToastMessage={setToastMessage} />}
        </div>
    );
};

export default ClientPage;