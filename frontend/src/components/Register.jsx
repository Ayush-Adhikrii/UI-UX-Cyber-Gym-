import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../store/useAuthStore";

const Register = ({ onClose }) => {
    const navigate = useNavigate();
    const [gymLogo, setGymLogo] = useState(null); // Changed to null, will be set to file object
    const [gymName, setGymName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [registrationDoc, setRegistrationDoc] = useState(null);
    const [govtIdDoc, setGovtIdDoc] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState("form"); // form -> packageSelection -> paymentLogin -> paymentVerification -> paymentConfirmation
    const [esewaId, setEsewaId] = useState("");
    const [passwordPayment, setPasswordPayment] = useState(""); // Renamed to avoid conflict
    const [otp, setOtp] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const { register, loading } = useAuthStore();

    useEffect(() => {
        console.log("Register function from store:", register);
        if (!register) {
            console.error("Register function is undefined. Check store import or definition.");
        }
    }, [register]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^\d{10}$/.test(phone);
    const validatePassword = (pass) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass);

    const handleGymLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGymLogo(file);
            const url = URL.createObjectURL(file);
            setGymLogo((prev) => ({ file, url }));
        }
    };

    const handleDocChange = (e, docType) => {
        const file = e.target.files[0];
        if (file) {
            if (docType === "registration") setRegistrationDoc(file);
            else if (docType === "govtId") setGovtIdDoc(file);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!gymName.trim()) newErrors.gymName = "Gym name is required";
        else if (gymName.trim().length < 2) newErrors.gymName = "Gym name must be at least 2 characters";
        if (!address.trim()) newErrors.address = "Address is required";
        else if (address.trim().length < 5) newErrors.address = "Address must be at least 5 characters";
        if (!contact.trim()) newErrors.contact = "Contact is required";
        else if (!validatePhone(contact)) newErrors.contact = "Contact must be a 10-digit number";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!validateEmail(email)) newErrors.email = "Invalid email format";
        if (!password.trim()) newErrors.password = "Password is required";
        else if (!validatePassword(password)) newErrors.password = "Password must be at least 8 characters with 1 letter and 1 number";
        if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
        else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!gymLogo || !gymLogo.file) newErrors.gymLogo = "Gym logo is required";
        if (!registrationDoc) newErrors.registrationDoc = "Gym registration document is required";
        if (!govtIdDoc) newErrors.govtIdDoc = "Owner's government ID is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setStep("packageSelection");
    };

    const handlePackageSelection = () => {
        // Navigate to payment page regardless of which package is clicked
        navigate("/esewa-payment-new", {
            state: {
                gymName,
                address,
                contact,
                email,
                amount: 1000.00, // Fixed amount, as per original
            },
        });
    };

    const handleLogin = () => {
        // Mock login
        setStep("paymentVerification");
    };

    const handleVerification = () => {
        // Mock OTP validation
        setStep("paymentConfirmation");
    };

    const handleConfirmation = async () => {
        const formData = new FormData();
        formData.append("gymName", gymName.trim());
        formData.append("address", address.trim());
        formData.append("contact", contact.trim());
        formData.append("email", email.trim());
        formData.append("password", password.trim());
        formData.append("gymLogo", gymLogo.file);
        formData.append("registrationDoc", registrationDoc);
        formData.append("govtIdDoc", govtIdDoc);

        try {
            await register(formData);
            toast.success("Registration and Payment Successful");
            navigate("/dashboard");
        } catch (error) {
            toast.error("Registration failed");
            setStep("form"); // Return to form on failure
        }
    };

    const handleCancel = () => {
        setStep("form"); // Return to form on cancel
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

                {step === "form" && (
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                        {/* Gym Logo */}
                        <div className="text-center">
                            <label>
                                <img
                                    src={gymLogo?.url || "/assets/icons/logo.png"}
                                    alt="Gym Logo"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto cursor-pointer"
                                    onClick={() => document.getElementById("gym-logo-input").click()}
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
                            <label htmlFor="gymName" className="block text-base font-medium text-[#C62828]">
                                Gym Name
                            </label>
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
                            <label htmlFor="address" className="block text-base font-medium text-[#C62828]">
                                Address
                            </label>
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
                            <label htmlFor="contact" className="block text-base font-medium text-[#C62828]">
                                Contact
                            </label>
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
                            <label htmlFor="email" className="block text-base font-medium text-[#C62828]">
                                Email
                            </label>
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
                            <label htmlFor="password" className="block text-base font-medium text-[#C62828]">
                                Password
                            </label>
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
                            <label htmlFor="confirmPassword" className="block text-base font-medium text-[#C62828]">
                                Confirm Password
                            </label>
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
                            <div className="w-1/2">
                                <label htmlFor="registrationDoc" className="block text-base font-medium text-[#C62828]">
                                    Gym Registration Document
                                </label>
                                <input
                                    type="file"
                                    id="registrationDoc"
                                    accept=".pdf,.jpg,.png"
                                    onChange={(e) => handleDocChange(e, "registration")}
                                    className="mt-1 p-1 w-full border-4 border-[#C62828] rounded focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] text-sm"
                                    required
                                />
                                {errors.registrationDoc && <p className="text-red-500 text-xs mt-1">{errors.registrationDoc}</p>}
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="govtIdDoc" className="block text-base font-medium text-[#C62828]">
                                    Owner's Government ID
                                </label>
                                <input
                                    type="file"
                                    id="govtIdDoc"
                                    accept=".pdf,.jpg,.png"
                                    onChange={(e) => handleDocChange(e, "govtId")}
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
                            {loading ? "Registering..." : "Proceed to Package Selection"}
                        </button>
                    </form>
                )}

                {step === "packageSelection" && (
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold mb-4 text-[#C62828]">Select Your Package</h3>
                        <p className="text-gray-600 mb-4">Choose a package to proceed with payment.</p>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={handlePackageSelection}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Gold Package - NPR 3000.00 (1 Month)
                            </button>
                            <button
                                onClick={handlePackageSelection}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Diamond Package - NPR 12000.00 (5 years)
                            </button>
                            <button
                                onClick={handlePackageSelection}
                                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            >
                                Platinum Package - NPR 18000.00 (lifetime)
                            </button>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="mt-4 bg-gray-600 text-gray-300 px-4 py-2 rounded"
                        >
                            Back to Form
                        </button>
                    </div>
                )}

                {step === "paymentLogin" && (
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold mb-4 text-[#C62828]">Sign in to your eSewa account</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">eSewa ID</label>
                            <input
                                type="text"
                                value={esewaId}
                                onChange={(e) => setEsewaId(e.target.value)}
                                className="w-full p-2 rounded bg-gray-600 text-white"
                                placeholder="eSewa ID"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Password/MPIN</label>
                            <input
                                type="password"
                                value={passwordPayment}
                                onChange={(e) => setPasswordPayment(e.target.value)}
                                className="w-full p-2 rounded bg-gray-600 text-white"
                                placeholder="Password"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-600 text-gray-300 px-4 py-2 rounded"
                                onClick={handleCancel}
                            >
                                CANCEL
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleLogin}
                            >
                                LOGIN
                            </button>
                        </div>
                    </div>
                )}

                {step === "paymentVerification" && (
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold mb-4 text-[#C62828]">Enter a verification code</h3>
                        <p className="text-gray-400 mb-4">Please type the 6-digit verification code sent to your mobile number.</p>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-2 rounded bg-gray-600 text-white"
                                placeholder="Enter verification token"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-600 text-gray-300 px-4 py-2 rounded"
                                onClick={() => setStep("paymentLogin")}
                            >
                                BACK TO LOGIN
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleVerification}
                            >
                                VERIFY
                            </button>
                        </div>
                    </div>
                )}

                {step === "paymentConfirmation" && (
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold mb-4 text-[#C62828]">Confirmation</h3>
                        <p className="text-gray-400 mb-4">Confirm the details below</p>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Choose your other payment option</label>
                            <button className="bg-green-500 text-white px-4 py-2 rounded mr-2">Pay via e-Sewa Wallet</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded">Linked Bank Account</button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-400">FULL NAME</p>
                            <p className="text-lg">{gymName || "N/A"}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-400">CONTACT NUMBER</p>
                            <p className="text-lg">{contact || "N/A"}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-400">ADDRESS</p>
                            <p className="text-lg">{address || "N/A"}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-400">Total Amount</p>
                            <p className="text-lg">NPR. {formattedAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}</p>
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-600 text-gray-300 px-4 py-2 rounded"
                                onClick={handleCancel}
                            >
                                CANCEL
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleConfirmation}
                            >
                                PAY VIA ESEWA
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;