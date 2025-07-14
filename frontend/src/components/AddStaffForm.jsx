import { useState } from 'react';
import useStaffStore from '../store/useStaffStore'; // Assuming this store contains addStaff

const AddStaffForm = ({ onClose, setToastMessage }) => {
    const [avatarFile, setAvatarFile] = useState(null); // Store file object
    const [name, setName] = useState('');
    const [gender, setGender] = useState('male');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [post, setPost] = useState('');
    const [salary, setSalary] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');
    const [govIdFile, setGovIdFile] = useState(null); // Store file object, no preview
    const [errors, setErrors] = useState({});
    const [showImagePicker, setShowImagePicker] = useState(false);

    const { addStaff, fetchStaffs } = useStaffStore(); // Access addStaff and fetchStaffs from store

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatarFile(file); // Store file object
    };

    const handleGovIdChange = (e) => {
        const file = e.target.files[0];
        if (file) setGovIdFile(file); // Store file object, no preview
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (!number.trim()) newErrors.number = 'Phone number is required';
        if (!post.trim()) newErrors.post = 'Post is required';
        if (!salary.trim()) newErrors.salary = 'Salary is required';
        if (!emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        if (!emergencyRelation.trim()) newErrors.emergencyRelation = 'Relation is required';
        if (!govIdFile) newErrors.govId = 'Government ID image is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Convert files to base64
        const reader = new FileReader();
        const getBase64 = (file) =>
            new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });

        const imageBase64 = avatarFile ? await getBase64(avatarFile) : null;
        const govIdBase64 = govIdFile ? await getBase64(govIdFile) : null;

        // Prepare JSON payload
        const payload = {
            name: name.trim(),
            gender,
            email: email.trim(),
            phoneNumber: number.trim(),
            post: post.trim(),
            salary: salary.trim(),
            emergencyContact: emergencyContact.trim(),
            relation: emergencyRelation.trim(),
            image: imageBase64,
            govId: govIdBase64,
        };

        console.log('Payload:', payload); // Debug payload

        // Call addStaff function
        const error = await addStaff(payload);
        if (error) {
            setErrors({ submit: error });
        } else {
            if (setToastMessage && typeof setToastMessage === 'function') {
                setToastMessage('Staff Added Successfully');
                setTimeout(() => setToastMessage(null), 3000);
            }
            onClose(); // Close modal on success
        }
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
                            src={avatarFile ? URL.createObjectURL(avatarFile) : '/assets/icons/avatar.svg'}
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
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleGovIdChange}
                            className="w-full"
                        />
                        {errors.govId && <p className="text-red-500 text-xs">{errors.govId}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#C62828] text-white py-2 rounded hover:bg-[#a82121] transition text-sm"
                    >
                        Add Staff
                    </button>

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

export default AddStaffForm;