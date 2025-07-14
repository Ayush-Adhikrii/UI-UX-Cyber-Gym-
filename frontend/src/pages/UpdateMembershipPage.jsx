import { useEffect, useRef, useState } from 'react';
import useClientStore from '../store/useClientStore';

const UpdateMembershipPage = ({ setToastMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { clients, loading, error, fetchClients } = useClientStore();
    const [selectedClient, setSelectedClient] = useState(null);
    const [startDateValue, setStartDateValue] = useState(''); // To track start date for end date validation

    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const paymentDateRef = useRef(null);
    const paymentAmountRef = useRef(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    if (loading) return <div className="p-6 text-center">Loading clients...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    // Function to determine light color based on membershipExpiry
    const getExpiryStatus = (expiryDate) => {
        const today = new Date();
        if (!expiryDate || new Date(expiryDate) < today) {
            return 'red'; // Expired or no membership
        }
        const diffDays = Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5) {
            return 'yellow'; // Within 5 days
        }
        return 'green'; // More than 5 days
    };

    // Define styles for each indicator color (if needed for future use)
    const getIndicatorStyle = (color) => {
        const styles = {
            red: { backgroundColor: '#C62828' },
            yellow: { backgroundColor: '#F9A825' },
            green: { backgroundColor: '#2E7D32' },
        };
        return styles[color] || { backgroundColor: '#C62828' }; // Default to red if invalid
    };

    // Calculate min date for startDate input
    const getMinStartDate = () => {
        if (selectedClient?.membershipExpiry) {
            const expiryDate = new Date(selectedClient.membershipExpiry);
            return !isNaN(expiryDate) ? expiryDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0]; // Default to today if no expiry
    };

    // Get membership status text
    const getMembershipText = (expiryDate) => {
        const today = new Date();
        if (!expiryDate) {
            return 'No membership yet';
        }
        const expiry = new Date(expiryDate);
        if (isNaN(expiry)) {
            return 'No membership yet';
        }
        const formattedExpiry = expiry.toISOString().split('T')[0];
        return expiry < today ? `Expired on: ${formattedExpiry}` : `Expires on: ${formattedExpiry}`;
    };

    const handleSave = async () => {
        if (!selectedClient) return;

        const startDate = startDateRef.current.value;
        const endDate = endDateRef.current.value;
        const paymentAmount = paymentAmountRef.current.value;

        if (!startDate || !paymentAmount) {
            setToastMessage('Start date and payment amount are required');
            setTimeout(() => setToastMessage(null), 2000);
            return;
        }

        setToastMessage('Saving membership...');
        try {
            // Check if an active membership exists
            const currentMembershipResponse = await fetch(`http://localhost:5000/api/memberships/${selectedClient.id}/current`);
            let currentMembership = null;
            if (currentMembershipResponse.ok) {
                currentMembership = await currentMembershipResponse.json();
            } // If 404, currentMembership remains null, proceed to create

            const membershipData = {
                clientId: selectedClient.id,
                startDate,
                endDate,
                paymentAmount: parseFloat(paymentAmount),
            };

            let response;
            if (!currentMembership || currentMembership.endDate) {
                // No active membership or expired, create new
                response = await fetch('http://localhost:5000/api/memberships/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(membershipData),
                });
                if (!response.ok) throw new Error('Failed to create membership');
                setToastMessage('Membership created successfully');
            } else {
                // Active membership exists, update it
                response = await fetch('http://localhost:5000/api/memberships/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(membershipData),
                });
                if (!response.ok) throw new Error('Failed to update membership');
                setToastMessage('Membership updated successfully');
            }

            // Clear form fields on success
            startDateRef.current.value = '';
            endDateRef.current.value = '';
            paymentDateRef.current.value = '';
            paymentAmountRef.current.value = '';
            setStartDateValue(''); // Reset start date state

            // Refetch clients to update membershipExpiry
            await fetchClients();
        } catch (error) {
            setToastMessage(`Error: ${error.message}`);
        } finally {
            setTimeout(() => setToastMessage(null), 2000); // Reduced from 3000ms to 2000ms
        }
    };

    // Update min for endDate based on startDate
    const handleStartDateChange = (e) => {
        setStartDateValue(e.target.value);
    };

    // Get max date for paymentDate (today)
    const getMaxPaymentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className="flex flex-col w-full h-full max-h-[calc(100vh-100px)] bg-[#fff6f6] rounded-xl p-4 shadow-md overflow-hidden">
            <div className="flex flex-1 overflow-hidden gap-4">

                {/* Left: Client List */}
                <div className="w-1/3 flex flex-col overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2 p-2 border border-[#C62828] rounded text-sm"
                    />
                    <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                className={`flex items-center justify-between bg-white rounded-full p-2 shadow-md cursor-pointer ${selectedClient?.id === client.id ? 'ring-2 ring-[#C62828]' : ''}`}
                                onClick={() => setSelectedClient(client)}
                            >
                                <img
                                    src={client.image || '/assets/icons/avatar-placeholder.png'}
                                    alt={`${client.name}'s avatar`}
                                    className="w-14 h-14 rounded-full object-cover ml-2"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/icons/avatar-placeholder.png';
                                    }}
                                />
                                <div className="flex-1 text-center">
                                    <span className="text-lg font-medium text-[#C62828]">{client.name}</span>
                                    <span className="text-xs text-gray-600 ml-2">{getMembershipText(client.membershipExpiry)}</span>
                                </div>
                                <img
                                    src={
                                        getExpiryStatus(client.membershipExpiry) === 'red'
                                            ? '/assets/icons/red.png'
                                            : getExpiryStatus(client.membershipExpiry) === 'yellow'
                                                ? '/assets/icons/yellow.png'
                                                : '/assets/icons/green.png'
                                    }
                                    alt="Membership Status"
                                    className="w-7 h-7"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/icons/avatar-placeholder.png'; // Fallback
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Membership Form */}
                <div className="w-2/3 bg-[#FBEAEA] rounded-xl p-6 flex flex-col overflow-hidden">
                    {selectedClient ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Header Row */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-1/2 flex justify-center">
                                    <img
                                        src={selectedClient.image || '/assets/icons/avatar-placeholder.png'}
                                        alt={`${selectedClient.name}'s avatar`}
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                </div>
                                <div className="w-1/2 flex justify-center">
                                    <h2 className="text-3xl font-semibold text-[#C62828] self-center">{selectedClient.name}</h2>
                                </div>
                            </div>

                            {/* Membership Fields */}
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div>
                                    <label className="block text-[#C62828] font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        ref={startDateRef}
                                        className="p-2 w-full border border-[#C62828] rounded text-sm"
                                        min={getMinStartDate()}
                                        onChange={handleStartDateChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#C62828] font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        ref={endDateRef}
                                        className="p-2 w-full border border-[#C62828] rounded text-sm"
                                        min={startDateValue || getMinStartDate()} // Dynamic min based on start date
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#C62828] font-medium mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        ref={paymentDateRef}
                                        className="p-2 w-full border border-[#C62828] rounded text-sm"
                                        max={getMaxPaymentDate()} // Restrict to today
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#C62828] font-medium mb-1">Payment Amount</label>
                                    <input
                                        type="number"
                                        ref={paymentAmountRef}
                                        className="p-2 w-full border border-[#C62828] rounded text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="mt-6 bg-[#C62828] text-white font-bold py-2 rounded-full text-lg hover:bg-[#a82121] transition"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-base">
                            ← Select a client to update membership.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateMembershipPage;