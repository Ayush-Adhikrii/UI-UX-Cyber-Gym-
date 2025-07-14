import { useEffect, useState } from 'react';

const EditStaffForm = ({ Staff, onClose, onUpdate }) => {
    const [avatar, setAvatar] = useState('/assets/icons/avatar.svg');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('male'); // Default to 'male' with Staff override
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [post, setPost] = useState('');
    const [salary, setSalary] = useState(''); // Store as string
    const [emergencyContact, setEmergencyContact] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');
    const [govId, setGovId] = useState(null);
    const [errors, setErrors] = useState({});
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showGovIdPreview, setShowGovIdPreview] = useState(false);

    // Pre-fill form with Staff data
    useEffect(() => {
        if (Staff) {
            setAvatar(Staff.image || '/assets/icons/avatar.svg');
            setName(Staff.name || '');
            setGender(Staff.gender || 'male');
            setEmail(Staff.email || '');
            setNumber(Staff.phoneNumber || '');
            setPost(Staff.post || '');
            setSalary(Staff.salary?.toString() || ''); // Convert to string
            setEmergencyContact(Staff.emergencyContact || '');
            setEmergencyRelation(Staff.relation || '');
            setGovId(Staff.govId || null);
        }
    }, [Staff]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatar(URL.createObjectURL(file));
    };

    const handleGovIdChange = (e) => {
        const file = e.target.files[0];
        if (file) setGovId(URL.createObjectURL(file));
    };

    const handleAvatarClick = () => {
        setShowImagePicker(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (!number.trim()) newErrors.number = 'Number is required';
        if (!post.trim()) newErrors.post = 'Post is required';
        if (!salary.trim()) newErrors.salary = 'Salary is required'; // Validate as string
        if (!emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        if (!emergencyRelation.trim()) newErrors.emergencyRelation = 'Relation is required';
        if (!govId) newErrors.govId = 'Government ID image is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const StaffData = {
            name,
            gender,
            email,
            phoneNumber: number,
            post,
            salary: parseFloat(salary), // Convert to number for backend
            emergencyContact,
            emergencyRelation,
            image: avatar,
            govId,
        };

        if (Staff?.id) {
            try {
                const response = await fetch(`http://localhost:5000/api/staff/${Staff.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(StaffData),
                });
                if (!response.ok) throw new Error('Failed to update Staff');
                const updatedStaff = await response.json();
                if (onUpdate) onUpdate(updatedStaff);
            } catch (err) {
                setErrors({ submit: err.message });
                return;
            }
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-[#C62828] text-4xl font-bold"
                    aria-label="Close"
                >
                    ×
                </button>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Avatar */}
                    <div className="text-center">
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto cursor-pointer"
                            onClick={() => setShowImagePicker(true)}
                        />
                        <input
                            type="file"
                            id="avatar-file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <input
                            type="file"
                            id="avatar-camera"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-[#C62828] font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-[#C62828] font-medium">Gender</label>
                        <div className="mt-1 flex space-x-6">
                            {['Male', 'Female'].map((g) => (
                                <label key={g} className="flex items-center space-x-2 text-[#C62828] font-medium">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        checked={gender === g}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    <span className="capitalize">{g}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[#C62828] font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>

                    {/* Number */}
                    <div>
                        <label className="block text-[#C62828] font-medium">Phone Number</label>
                        <input
                            type="tel"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                        />
                        {errors.number && <p className="text-red-500 text-xs">{errors.number}</p>}
                    </div>

                    {/* Post + Salary */}
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <label className="block text-[#C62828] font-medium">Post</label>
                            <input
                                type="text"
                                value={post}
                                onChange={(e) => setPost(e.target.value)}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            />
                            {errors.post && <p className="text-red-500 text-xs">{errors.post}</p>}
                        </div>
                        <div className="w-1/2">
                            <label className="block text-[#C62828] font-medium">Salary</label>
                            <input
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            />
                            {errors.salary && <p className="text-red-500 text-xs">{errors.salary}</p>}
                        </div>
                    </div>

                    {/* Emergency Contact + Relation */}
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <label className="block text-[#C62828] font-medium">Emergency Contact</label>
                            <input
                                type="tel"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            />
                            {errors.emergencyContact && <p className="text-red-500 text-xs">{errors.emergencyContact}</p>}
                        </div>
                        <div className="w-1/2">
                            <label className="block text-[#C62828] font-medium">Relation</label>
                            <input
                                type="text"
                                value={emergencyRelation}
                                onChange={(e) => setEmergencyRelation(e.target.value)}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            />
                            {errors.emergencyRelation && <p className="text-red-500 text-xs">{errors.emergencyRelation}</p>}
                        </div>
                    </div>

                    {/* Government ID Image */}
                    <div>
                        <label className="block text-[#C62828] font-medium">Government ID (Image)</label>
                        <div className="flex space-x-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleGovIdChange}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            />
                            {(govId || Staff?.govId) && (
                                <button
                                    type="button"
                                    onClick={() => setShowGovIdPreview(true)}
                                    className="mt-1 w-10 h-10 bg-[#C62828] text-white rounded-full hover:bg-[#a82121] transition flex items-center justify-center"
                                >
                                    👁️
                                </button>
                            )}
                        </div>
                        {errors.govId && <p className="text-red-500 text-xs">{errors.govId}</p>}
                        {(govId || Staff?.govId) && showGovIdPreview && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-72 text-center space-y-4">
                                    <img
                                        src={govId || Staff?.govId}
                                        alt="Government ID"
                                        className="w-full h-48 object-contain border rounded"
                                    />
                                    <button
                                        className="w-full bg-[#C62828] text-white py-2 rounded hover:bg-[#a82121] transition"
                                        onClick={() => setShowGovIdPreview(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#C62828] text-white py-2 rounded hover:bg-[#a82121] transition text-sm"
                    >
                        Save Changes
                    </button>

                    {errors.submit && <p className="text-red-500 text-xs mt-1 text-center">{errors.submit}</p>}

                    {/* Image Picker Modal */}
                    {showImagePicker && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-72 text-center space-y-4">
                                <p className="text-lg font-semibold text-[#C62828]">Choose Image Source</p>
                                <button
                                    className="w-full bg-[#C62828] text-white py-2 rounded hover:bg-[#a82121] transition"
                                    onClick={() => {
                                        setShowImagePicker(false);
                                        document.getElementById('avatar-file').click();
                                    }}
                                >
                                    Pick from Device
                                </button>
                                <button
                                    className="w-full bg-[#C62828] text-white py-2 rounded hover:bg-[#a82121] transition"
                                    onClick={() => {
                                        setShowImagePicker(false);
                                        document.getElementById('avatar-camera').click();
                                    }}
                                >
                                    Use Camera
                                </button>
                                <button
                                    className="text-[#C62828] hover:underline"
                                    onClick={() => setShowImagePicker(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditStaffForm;