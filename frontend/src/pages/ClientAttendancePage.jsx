import { useEffect, useState } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import EditClientForm from '../components/EditClientForm';
import useClientStore from '../store/useClientStore';

const ClientAttendancePage = ({ setToastMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const {
        clients,
        absent,
        loading,
        error,
        fetchClients,
        fetchAbsent,
        attendance,
    } = useClientStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showConfirmPresent, setShowConfirmPresent] = useState(false);
    const [clientToPresent, setClientToPresent] = useState(null);

    // Filter clients based on search term, with a fallback to empty array
    const filteredClients = (clients || []).filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchAbsent(); // Fetch absent clients
        fetchClients(); // Fetch all clients
    }, [fetchAbsent, fetchClients]);

    const handleUpdate = (updatedClient) => {
        setIsFormOpen(false);
        setSelectedClient(null);
        setToastMessage('Client updated successfully');
        fetchAbsent();
        fetchClients(); // Refresh clients list
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handlePresent = (client) => {
        setClientToPresent(client);
        setShowConfirmPresent(true);
    };

    const confirmPresent = async () => {
        if (clientToPresent?.id) {
            setShowConfirmPresent(false);
            setToastMessage('Marking Present...');
            try {
                const error = await attendance({ clientId: clientToPresent.id });
                if (error) throw new Error(error);
                setToastMessage('Marked as present successfully');
                setClientToPresent(null);
                fetchAbsent(); // Refresh absent list
                fetchClients(); // Refresh clients list
            } catch (err) {
                setToastMessage(`Error: ${err.message}`);
            } finally {
                setTimeout(() => setToastMessage(null), 3000);
            }
        }
    };

    const cancelPresent = () => {
        setShowConfirmPresent(false);
        setClientToPresent(null);
    };

    // Only show loading or error if they are the sole conditions
    if (loading && !clients.length && !absent.length) return <div className="p-6 text-center">Loading clients...</div>;
    if (error && !clients.length && !absent.length) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 h-full box-border">
            <div className="mb-6 sticky top-0 bg-[#FBEAEA] z-10">
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border-2 border-[#C62828] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-sm"
                />
            </div>

            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {filteredClients.map(client => {
                    const isAbsent = absent.some(absentClient => absentClient.id === client.id);
                    return (
                        <div
                            key={client.id}
                            className="flex items-center justify-between bg-white rounded-full p-2 shadow-md"
                            style={{ minHeight: '80px' }}
                        >
                            <img
                                src={client.image || '/assets/icons/avatar-placeholder.png'}
                                alt={`${client.name}'s avatar`}
                                className="w-16 h-16 rounded-full object-cover ml-4"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/icons/avatar-placeholder.png';
                                }}
                            />
                            <span className="flex-1 text-2xl font-medium text-[#C62828] text-center">
                                {client.name}
                            </span>
                            <div className="flex items-center space-x-4 mr-6">
                                <input
                                    type="checkbox"
                                    checked={!isAbsent} // Checked if not absent
                                    onChange={() => isAbsent && handlePresent(client)} // Trigger confirmation only if absent
                                    className="w-6 h-6 cursor-pointer accent-[#C62828]" // Styled checkbox
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {isFormOpen && selectedClient && (
                <EditClientForm
                    client={selectedClient}
                    onClose={() => setIsFormOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}

            {showConfirmPresent && (
                <ConfirmationPopup
                    title="Mark Present"
                    message={`Do you want mark ${clientToPresent?.name} as present?`}
                    onConfirm={confirmPresent}
                    onCancel={cancelPresent}
                />
            )}
        </div>
    );
};

export default ClientAttendancePage;