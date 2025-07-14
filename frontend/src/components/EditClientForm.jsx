import { useEffect, useState } from 'react';

const EditClientForm = ({ client, onClose, onUpdate }) => {
    const [avatar, setAvatar] = useState('/assets/icons/avatar.svg');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('male');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [relation, setEmergencyRelation] = useState('');
    const [errors, setErrors] = useState({});
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Pre-fill form with client data
    useEffect(() => {
        if (client) {
            setAvatar(client.image || '/assets/icons/avatar.svg');
            setName(client.name || '');
            setGender(client.gender || 'male');
            setEmail(client.email || '');
            setNumber(client.phoneNumber || '');
            setAddress(client.address || '');
            setEmergencyContact(client.emergencyContact || '');
            setEmergencyRelation(client.relation || '');
        }
    }, [client]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatar(URL.createObjectURL(file));
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
        if (!address.trim()) newErrors.address = 'Address is required';
        if (!emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        if (!relation.trim()) newErrors.emergencyRelation = 'Relation is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const clientData = {
            name,
            gender,
            email,
            phoneNumber: number,
            address,
            emergencyContact,
            emergencyRelation: relation,
            image: avatar,
        };

        if (client?.id) {
            try {
                const response = await fetch(`http://localhost:5000/api/clients/${client.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData),
                });
                if (!response.ok) throw new Error('Failed to update client');
                const updatedClient = await response.json();
                if (onUpdate) onUpdate(updatedClient);
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
                    aria-label="Close form"
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
                            onClick={handleAvatarClick}
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
                        <label htmlFor="name" className="block text-base font-medium text-[#C62828]">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-base font-medium text-[#C62828]">Gender</label>
                        <div className="mt-1 flex space-x-6">
                            {['Male', 'Female'].map((g) => (
                                <label key={g} className="flex items-center space-x-2 text-[#C62828] font-medium">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        checked={gender === g}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="form-radio text-[#C62828] focus:ring-[#C62828] border-gray-300"
                                    />
                                    <span className="capitalize">{g}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-base font-medium text-[#C62828]">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Number */}
                    <div>
                        <label htmlFor="number" className="block text-base font-medium text-[#C62828]">Number</label>
                        <input
                            type="tel"
                            id="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-base font-medium text-[#C62828]">Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label htmlFor="emergencyContact" className="block text-base font-medium text-[#C62828]">Emergency Contact</label>
                        <input
                            type="tel"
                            id="emergencyContact"
                            value={emergencyContact}
                            onChange={(e) => setEmergencyContact(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
                    </div>

                    {/* Relation with Emergency Contact */}
                    <div>
                        <label htmlFor="emergencyRelation" className="block text-base font-medium text-[#C62828]">Relation with Emergency Contact</label>
                        <input
                            type="text"
                            id="emergencyRelation"
                            value={relation}
                            onChange={(e) => setEmergencyRelation(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.emergencyRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyRelation}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#C62828] text-white p-1.5 rounded hover:bg-[#a82121] transition text-sm"
                    >
                        Save Changes
                    </button>

                    {errors.submit && <p className="text-red-500 text-xs mt-1 text-center">{errors.submit}</p>}

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

export default EditClientForm;