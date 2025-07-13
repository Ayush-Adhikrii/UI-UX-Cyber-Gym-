import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const Register = ({ onClose }) => {
    const [gymLogo, setGymLogo] = useState(null); // Changed to null, will be set to file object
    const [gymName, setGymName] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationDoc, setRegistrationDoc] = useState(null); // Renamed for consistency
    const [govtIdDoc, setGovtIdDoc] = useState(null); // Renamed for consistency
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, loading } = useAuthStore();

    useEffect(() => {
        console.log('Register function from store:', register);
        if (!register) {
            console.error('Register function is undefined. Check store import or definition.');
        }
    }, [register]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^\d{10}$/.test(phone); // Validates 10-digit phone number
    const validatePassword = (pass) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass); // At least 8 chars, 1 letter, 1 number

    const handleGymLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGymLogo(file); // Set the file object directly
            // Optionally, create a URL for preview
            const url = URL.createObjectURL(file);
            setGymLogo(prev => ({ file, url })); // Store both file and URL as an object
        }
    };

    const handleDocChange = (e, docType) => {
        const file = e.target.files[0];
        if (file) {
            if (docType === 'registration') setRegistrationDoc(file);
            else if (docType === 'govtId') setGovtIdDoc(file);
        }
    };

    const handleSubmit = async (e) => {
        console.log("handleSubmit triggered");
        e.preventDefault();
        const newErrors = {};
        if (!gymName.trim()) newErrors.gymName = 'Gym name is required';
        else if (gymName.trim().length < 2) newErrors.gymName = 'Gym name must be at least 2 characters';
        if (!address.trim()) newErrors.address = 'Address is required';
        else if (address.trim().length < 5) newErrors.address = 'Address must be at least 5 characters';
        if (!contact.trim()) newErrors.contact = 'Contact is required';
        else if (!validatePhone(contact)) newErrors.contact = 'Contact must be a 10-digit number';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (!password.trim()) newErrors.password = 'Password is required';
        else if (!validatePassword(password)) newErrors.password = 'Password must be at least 8 characters with 1 letter and 1 number';
        if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!gymLogo || !gymLogo.file) newErrors.gymLogo = 'Gym logo is required'; // Check file presence
        if (!registrationDoc) newErrors.registrationDoc = 'Gym registration document is required';
        if (!govtIdDoc) newErrors.govtIdDoc = "Owner's government ID is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append('gymName', gymName.trim());
        formData.append('address', address.trim());
        formData.append('contact', contact.trim());
        formData.append('email', email.trim());
        formData.append('password', password.trim());
        formData.append('gymLogo', gymLogo.file); // Append the file object
        formData.append('registrationDoc', registrationDoc);
        formData.append('govtIdDoc', govtIdDoc);

        console.log('FormData contents:', Object.fromEntries(formData)); // Debug form data
        await register(formData);
        onClose();
    };

    if (!onClose) return null;

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
                    {/* Gym Logo */}
                    <div className="text-center">
                        <label>
                            <img
                                src={gymLogo?.url || '/assets/icons/logo.png'} // Use URL for preview, fallback to default
                                alt="Gym Logo"
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto cursor-pointer"
                                onClick={() => document.getElementById('gym-logo-input').click()}
                            />
                            <input
                                type="file"
                                id="gym-logo-input"
                                accept="image/*"
                                className="hidden"
                                onChange={handleGymLogoChange}
                            />
                        </label>
                        {errors.gymLogo && <p className="text-red-500 text-xs mt-1">{errors.gymLogo}</p>}
                    </div>

                    {/* Gym Name */}
                    <div>
                        <label htmlFor="gymName" className="block text-base font-medium text-[#C62828]">Gym Name</label>
                        <input
                            type="text"
                            id="gymName"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.gymName && <p className="text-red-500 text-xs mt-1">{errors.gymName}</p>}
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

                    {/* Contact */}
                    <div>
                        <label htmlFor="contact" className="block text-base font-medium text-[#C62828]">Contact</label>
                        <input
                            type="tel"
                            id="contact"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                            required
                        />
                        {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
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

                    {/* Password */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-base font-medium text-[#C62828]">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-9 transform -translate-y-1/2 text-[#C62828] hover:text-[#a82121]"
                        >
                            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-base font-medium text-[#C62828]">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-9 transform -translate-y-1/2 text-[#C62828] hover:text-[#a82121]"
                        >
                            <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Documents Side by Side */}
                    <div className="flex gap-3">
                        {/* Gym Registration Document */}
                        <div className="w-1/2">
                            <label htmlFor="registrationDoc" className="block text-base font-medium text-[#C62828]">Gym Registration Document</label>
                            <input
                                type="file"
                                id="registrationDoc"
                                accept=".pdf,.jpg,.png"
                                onChange={(e) => handleDocChange(e, 'registration')}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                                required
                            />
                            {errors.registrationDoc && <p className="text-red-500 text-xs mt-1">{errors.registrationDoc}</p>}
                        </div>

                        {/* Owner's Government ID */}
                        <div className="w-1/2">
                            <label htmlFor="govtIdDoc" className="block text-base font-medium text-[#C62828]">Owner's Government ID</label>
                            <input
                                type="file"
                                id="govtIdDoc"
                                accept=".pdf,.jpg,.png"
                                onChange={(e) => handleDocChange(e, 'govtId')}
                                className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                                required
                            />
                            {errors.govtIdDoc && <p className="text-red-500 text-xs mt-1">{errors.govtIdDoc}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#C62828] text-white p-1.5 rounded hover:bg-[#a82121] transition text-sm"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Gym'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;