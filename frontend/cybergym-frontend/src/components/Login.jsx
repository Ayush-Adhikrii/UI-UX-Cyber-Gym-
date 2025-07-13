import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';


const Login = ({ onClose, onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();


    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (!password.trim()) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const loginData = { email, password };
        console.log('Login attempted with:', loginData);
        try {
            await login(loginData);
            navigate("/dash");
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ submit: error.response?.data?.message || 'Invalid credentials' });
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
                <h2 className="text-2xl font-bold text-center mb-4 text-[#C62828]">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-2 w-full border rounded pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    {errors.submit && <p className="text-red-500 text-xs mt-1">{errors.submit}</p>}
                    <button
                        type="submit"
                        className="w-full bg-[#C62828] text-white p-2 rounded hover:bg-[#a82121] transition"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a href="/forgot-password" className="text-sm text-[#C62828] hover:underline">Forgot Password?</a>
                    <p className="text-sm text-gray-600 mt-2">
                        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onRegister(); }} className="text-[#C62828] hover:underline">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;