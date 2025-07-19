import axios from 'axios'; // Ensure axios is installed
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = ({ onClose }) => {
    const [step, setStep] = useState('email'); // email -> otp -> reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (pass) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass);

    const sendOtpEmail = async (email) => {
        try {
            await axios.post('http://localhost:5000/api/gym/send-otp', { email });
            toast.info(`OTP sent to ${email}`);
        } catch (error) {
            console.error('OTP error:', error);
            setErrors({ email: 'Failed to send OTP' });
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await sendOtpEmail(email);
        setStep('otp');
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!otp.trim()) newErrors.otp = 'OTP is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setStep('reset');
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
        else if (!validatePassword(newPassword)) newErrors.newPassword = 'Password must be at least 8 characters with 1 letter and 1 number';
        if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
        else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/gym/forgot-password', { email, otp, newPassword });
            if (response.status === 200) {
                toast.success(response.data.message);
                onClose();
                navigate('/login');
            }
        } catch (error) {
            console.error('Update error:', error);
            setErrors({ submit: error.response?.data || 'Failed to update password' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ×
                </button>
                <div className="flex justify-center mb-4">
                    <img src="/assets/icons/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
                </div>
                {step === 'email' && (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-4 text-[#C62828]">Forgot Password</h2>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#C62828] text-white p-2 rounded hover:bg-[#a82121] transition"
                            >
                                Send OTP
                            </button>
                        </form>
                    </>
                )}
                {step === 'otp' && (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-4 text-[#C62828]">Verify OTP</h2>
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded"
                                    required
                                />
                                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#C62828] text-white p-2 rounded hover:bg-[#a82121] transition"
                            >
                                Verify OTP
                            </button>
                        </form>
                    </>
                )}
                {step === 'reset' && (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-4 text-[#C62828]">Reset Password</h2>
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded"
                                    required
                                />
                                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded"
                                    required
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                            {errors.submit && <p className="text-red-500 text-xs mt-1">{errors.submit}</p>}
                            <button
                                type="submit"
                                className="w-full bg-[#C62828] text-white p-2 rounded hover:bg-[#a82121] transition"
                            >
                                Update Password
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;