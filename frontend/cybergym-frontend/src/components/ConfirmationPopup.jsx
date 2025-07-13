const ConfirmationPopup = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#FBEAEA] p-6 rounded-2xl shadow-lg w-full max-w-md text-center flex flex-col">
                <div className="flex justify-start mb-4">
                    <h2 className="text-2xl font-bold text-[#C62828]">{title}</h2>
                </div>
                <p className="text-lg text-[#C62828] mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="bg-white text-[#C62828] px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-[#C62828] text-white px-4 py-2 rounded-lg hover:bg-[#a82121] transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;