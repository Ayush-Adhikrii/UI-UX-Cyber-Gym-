import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import ChartsPage from '../pages/ChartsPage';
import ClientAttendancePage from '../pages/ClientAttendancePage';
import ClientPage from '../pages/ClientPage';
import StaffAttendancePage from '../pages/StaffAttendancePage';
import StaffPage from '../pages/StaffPage';
import UpdateMembershipPage from '../pages/UpdateMembershipPage';
import UpdateSalaryPage from '../pages/UpdateSalaryPage';
import ViewClientPage from '../pages/ViewClientPage';
import ViewStaffPage from '../pages/ViewStaffPage';

const Dashboard = ({ sidebarLogo = "/assets/images/roc.png" }) => {
    const [activePage, setActivePage] = useState('Client');
    const [navbarText, setNavbarText] = useState('Dashboard'); // Default navbar text
    const [toastMessage, setToastMessage] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Navigate to root route (/)
        navigate('/');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'Client':
                return <ClientPage onViewClients={() => setActivePage('ViewClient')} onUpdateMembership={() => setActivePage('UpdateMembership')} onClientAttendance={() => setActivePage('ClientAttendance')} setToastMessage={setToastMessage} />;
            case 'Staff':
                return <StaffPage onViewStaffs={() => setActivePage('ViewStaff')} onUpdateSalary={() => setActivePage('UpdateSalary')} onStaffAttendance={() => setActivePage('StaffAttendance')} setToastMessage={setToastMessage} />;
            case 'ViewClient':
                return <ViewClientPage setToastMessage={setToastMessage} />;
            case 'UpdateSalary':
                return <UpdateSalaryPage setToastMessage={setToastMessage} />;
            case 'UpdateMembership':
                return <UpdateMembershipPage setToastMessage={setToastMessage} />;
            case 'ClientAttendance':
                return <ClientAttendancePage setToastMessage={setToastMessage} />;
            case 'ViewStaff':
                return <ViewStaffPage setToastMessage={setToastMessage} />;
            case 'StaffAttendance':
                return <StaffAttendancePage setToastMessage={setToastMessage} />;
            case 'Charts':
                return <ChartsPage setNavbarText={setNavbarText} />;
            default:
                return <ClientPage onViewClients={() => setActivePage('ViewClient')} onUpdateMembership={() => setActivePage('UpdateMembership')} onClientAttendance={() => setActivePage('ClientAttendance')} setToastMessage={setToastMessage} />;
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-72 bg-[#C62828] text-white fixed h-full p-8 flex flex-col">
                <div className="flex justify-center mb-20">
                    <img src={sidebarLogo} alt="Logo" className="w-28 h-28 object-contain rounded-full" />
                </div>

                <div className="flex flex-col space-y-10 flex-grow items-center">
                    <button className="w-full py-5 text-xl font-bold rounded-full bg-white text-[#C62828] hover:bg-gray-100 transition" onClick={() => { setActivePage('Client'); setNavbarText('Client'); }}>
                        Client
                    </button>
                    <button className="w-full py-5 text-xl font-bold rounded-full bg-white text-[#C62828] hover:bg-gray-100 transition" onClick={() => { setActivePage('Staff'); setNavbarText('Staff'); }}>
                        Staff
                    </button>
                    <button className="w-full py-5 text-xl font-bold rounded-full bg-white text-[#C62828] hover:bg-gray-100 transition" onClick={() => { setActivePage('Charts'); setNavbarText('Charts'); }}>
                        Charts
                    </button>
                </div>

                {/* Moved logout button upwards */}
                <div className="mt-8 flex justify-center">
                    <img src="/assets/images/logout.png" alt="Logout" className="w-16 h-16 cursor-pointer hover:opacity-80 transition" onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-72 flex-1 flex flex-col relative">
                {/* Navbar */}
                <header className="bg-[#FBEAEA] w-full flex justify-between items-center px-6 py-4 shadow-md z-10 relative">
                    <div className="flex items-center space-x-2">
                        <img src="/assets/icons/logo.png" alt="CyberGym Icon" className="w-14 h-14 object-contain" />
                    </div>

                    <div className="flex-1 text-center text-2xl font-bold text-[#C62828]">
                        {navbarText}
                    </div>

                    <div className="relative flex items-center justify-end w-48">
                        {toastMessage && (
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-[#C62828] px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50 whitespace-nowrap">
                                {toastMessage}
                            </div>
                        )}
                    </div>
                </header>

                {/* Workspace */}
                <main className="flex-1 p-6 bg-white overflow-auto">
                    <div className="h-full bg-[#FBEAEA] rounded-lg shadow-md p-4">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;