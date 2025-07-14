import { useEffect, useState } from 'react';
import useStaffStore from '../store/useStaffStore';

const UpdateSalary = ({ setToastMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { Staffs, loading, error, fetchStaffs, fetchSalary, updateSalary } = useStaffStore();
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Start with 1-12
    const [paidAmount, setPaidAmount] = useState('0'); // Static paid amount
    const [dueAmount, setDueAmount] = useState('0');   // Static due amount
    const [transactionInput, setTransactionInput] = useState(''); // Separate input for transaction

    useEffect(() => {
        fetchStaffs();
    }, [fetchStaffs]);

    const filteredStaffs = Staffs.filter((staff) =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch salary data when staff or date changes
    useEffect(() => {
        if (selectedStaff) {
            fetchSalary(selectedStaff.id, selectedYear, selectedMonth).then((paidAmt) => {
                const currentPaid = paidAmt || 0;
                setPaidAmount(currentPaid.toString());
                const due = selectedStaff.salary ? (selectedStaff.salary - currentPaid) : 0;
                setDueAmount(due.toLocaleString());
            });
        }
    }, [selectedStaff, selectedYear, selectedMonth, fetchSalary]);

    const handleSaveTransaction = async () => {
        if (selectedStaff && transactionInput && !isNaN(transactionInput) && parseFloat(transactionInput) > 0) {
            const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
            const error = await updateSalary(selectedStaff.id, date, transactionInput);
            if (error) {
                setToastMessage('Failed to save transaction');
                setTimeout(() => setToastMessage(null), 3000);
            } else {
                setToastMessage('Transaction saved successfully');
                setTimeout(() => setToastMessage(null), 3000);
                // Refetch to update paid and due amounts
                fetchSalary(selectedStaff.id, selectedYear, selectedMonth).then((paidAmt) => {
                    const currentPaid = paidAmt || 0;
                    setPaidAmount(currentPaid.toString());
                    const due = selectedStaff.salary ? (selectedStaff.salary - currentPaid) : 0;
                    setDueAmount(due.toLocaleString());
                });
                setTransactionInput(''); // Clear input after success
            }
        } else {
            setToastMessage('Please select a staff and enter a valid amount');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const isSaveDisabled = parseFloat(dueAmount.replace(/,/g, '')) <= 0;

    return (
        <div className="flex flex-col w-full h-full max-h-[calc(100vh-100px)] bg-[#fff6f6] rounded-xl p-4 shadow-md overflow-hidden">
            {loading && <div className="text-center p-4">Loading Staffs...</div>}
            {error && <div className="text-center text-red-500 p-4">Error: {error}</div>}

            {!loading && !error && (
                <div className="flex flex-1 overflow-hidden gap-4">
                    {/* Staff List */}
                    <div className="w-1/3 flex flex-col overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search Staffs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2 p-2 border border-[#C62828] rounded text-sm"
                        />
                        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                            {filteredStaffs.map((staff) => (
                                <div
                                    key={staff.id}
                                    className={`flex items-center justify-between bg-white rounded-full p-2 shadow-md cursor-pointer ${selectedStaff?.id === staff.id ? 'ring-2 ring-[#C62828]' : ''}`}
                                    onClick={() => setSelectedStaff(staff)}
                                >
                                    <img
                                        src={staff.image || '/assets/icons/avatar-placeholder.png'}
                                        alt={`${staff.name}'s avatar`}
                                        className="w-14 h-14 rounded-full object-cover ml-2"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/assets/icons/avatar-placeholder.png';
                                        }}
                                    />
                                    <span className="flex-1 text-lg font-medium text-[#C62828] text-center">
                                        {staff.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Salary Form */}
                    <div className="w-2/3 bg-[#FBEAEA] rounded-xl p-6 flex flex-col overflow-hidden">
                        {selectedStaff ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Top Row: Staff Image + Form Title */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-1/2 flex justify-center">
                                        <img
                                            src={selectedStaff.image || '/assets/icons/avatar-placeholder.png'}
                                            alt={`${selectedStaff.name}'s avatar`}
                                            className="w-20 h-20 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/icons/avatar-placeholder.png';
                                            }}
                                        />
                                    </div>
                                    <div className="w-1/2 flex justify-center">
                                        <h2 className="text-3xl font-semibold text-[#C62828] self-center">
                                            {selectedStaff.name}
                                        </h2>
                                    </div>
                                </div>

                                {/* Content Row: Month Picker + Form Fields */}
                                <div className="flex gap-6 flex-1 overflow-hidden">
                                    {/* Month Picker */}
                                    <div className="w-1/2 bg-[#FCD9D9] rounded-xl p-4 flex flex-col items-center">
                                        <div className="flex justify-center items-center mb-12 gap-4">
                                            <button
                                                onClick={() => setSelectedYear((prev) => prev - 1)}
                                                className="bg-[#C62828] text-white text-lg font-bold w-8 h-8 rounded-full"
                                            >
                                                &lt;
                                            </button>
                                            <span className="text-lg font-bold text-white bg-[#C62828] px-5 py-1 rounded-full">
                                                {selectedYear}
                                            </span>
                                            <button
                                                onClick={() => setSelectedYear((prev) => prev + 1)}
                                                className="bg-[#C62828] text-white text-lg font-bold w-8 h-8 rounded-full"
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 w-full mt-2">
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const monthNum = i + 1; // 1 to 12
                                                const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
                                                const isSelected = selectedMonth === monthNum;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedMonth(monthNum)}
                                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isSelected
                                                            ? 'bg-[#C62828] text-white'
                                                            : 'bg-[#E19A9A] text-white opacity-50'
                                                            }`}
                                                    >
                                                        {monthName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="w-1/2 flex flex-col justify-between">
                                        <div>
                                            <label className="block text-[#C62828] font-medium mb-1">Paid Amount:</label>
                                            <input
                                                type="text"
                                                value={paidAmount}
                                                readOnly
                                                className="mb-4 p-2 w-full border border-[#C62828] rounded text-left"
                                            />

                                            <label className="block text-[#C62828] font-medium mb-1">Due Amount:</label>
                                            <input
                                                type="text"
                                                value={dueAmount}
                                                readOnly
                                                className="mb-4 p-2 w-full border border-[#C62828] rounded text-left"
                                            />

                                            <label className="block text-[#C62828] font-medium mb-1">Add Transaction</label>
                                            <input
                                                type="number"
                                                value={transactionInput}
                                                onChange={(e) => setTransactionInput(e.target.value)}
                                                placeholder={parseFloat(dueAmount.replace(/,/g, '')) === 0 ? 'Fully Paid' : 'Enter amount'}
                                                className="mb-6 p-2 w-full border border-[#C62828] rounded text-left"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveTransaction}
                                            className="bg-[#C62828] text-white font-bold py-2 rounded-full text-lg hover:bg-[#a82121] transition"
                                            disabled={isSaveDisabled}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-base">
                                ← Select a staff to view or update their salary.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateSalary;