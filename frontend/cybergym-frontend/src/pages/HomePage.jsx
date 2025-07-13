import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const Section = ({ id, bgImage, children }) => (
    <section
        id={id}
        className="relative h-screen w-full flex items-center justify-center px-10"
        style={{
            backgroundImage: bgImage ? `url(${bgImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >
        {children}
    </section>
);

const VisitSection = () => (
    <section
        id="visit"
        className="relative w-full flex flex-col items-center px-4 lg:px-20 py-10 space-y-0"
        style={{
            backgroundImage: `url(/assets/images/visit.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >
        {/* Map and Visit Info Box */}
        <div className="flex flex-col lg:flex-row w-full items-center justify-center gap-0">
            {/* Map */}
            <div className="w-full lg:w-1/2 h-[80vh] rounded-lg overflow-hidden shadow-lg">
                <iframe
                    title="Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.135678765815!2d85.3240!3d27.7058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzIxLjAiTiA4NcKwMTknMjQuMCJF!5e0!3m2!1sen!2snp!4v1625256000000!5m2!1sen!2snp"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="rounded-lg"
                ></iframe>
            </div>

            {/* Visit Info */}
            <div className="bg-black bg-opacity-80 text-white p-6 rounded-lg w-full lg:w-1/2 shadow-xl text-center">
                <h2 className="text-xl font-bold text-[#C62828] mb-4">VISIT OUR OFFICE</h2>
                <p className="text-sm mb-2">Address: Kathmandu – 30, Dillibazar, Kathmandu, Nepal</p>
                <p className="text-sm mb-2">Email: <a href="mailto:softwarecg@gmail.com" className="underline">softwarecg@gmail.com</a></p>
                <p className="text-sm mb-2">Contact Number: 9802047500</p>
                <p className="font-semibold pt-2 text-sm">OUR SOCIALS:</p>
                <div className="flex justify-center space-x-4 text-xl pt-2">
                    <a href="#"><i className="fab fa-facebook"></i></a>
                    <a href="#"><i className="fab fa-whatsapp"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
            </div>
        </div>

        {/* Contact Form */}
        <div className="w-full bg-gray-700 bg-opacity-50 rounded-xl p-6">
            <div className="bg-white rounded-xl p-8 w-full max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
                <form className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full p-3 rounded bg-gray-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-3 rounded bg-gray-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            className="w-full p-3 rounded bg-gray-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-gray-700 mb-1">Message</label>
                        <textarea
                            id="message"
                            rows="4"
                            className="w-full p-3 rounded bg-gray-200"
                            required
                        ></textarea>
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            className="bg-[#C62828] text-white px-6 py-2 rounded-full hover:bg-[#a82121] transition"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white text-center py-4">
        <p>Developed by Ayush Adhikari</p>
    </footer>
);

const HomePage = () => {
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    return (
        <div className="font-sans w-screen overflow-x-hidden">
            {/* Header */}
            <header className="bg-white w-full flex justify-between items-center px-6 py-2 z-20 shadow-md sticky top-0">
                <div className="flex items-center space-x-2">
                    <img
                        src="/assets/icons/logo.png"
                        alt="CyberGym Icon"
                        className="w-16 h-16 object-contain"
                    />
                    <span className="font-bold text-[#C62828] text-lg">CYBER GYM</span>
                </div>
                <nav className="flex items-center space-x-6 text-base text-black">
                    {["about", "services", "pricing", "visit", "contact"].map((id) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onClick={(e) => scrollToSection(e, id)}
                            className="hover:underline"
                        >
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                        </a>
                    ))}
                    <button
                        onClick={() => setIsLoginOpen(true)}
                        className="bg-[#C62828] text-white px-5 py-2.5 rounded-full text-base hover:bg-[#a82121] transition"
                    >
                        Login
                    </button>
                </nav>
            </header>

            {/* Login Modal */}
            {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} onRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />}

            {/* Register Modal */}
            {isRegisterOpen && <Register onClose={() => setIsRegisterOpen(false)} />}

            {/* Hero Section */}
            <section
                id="hero"
                className="relative h-screen w-full flex items-center justify-between px-10"
                style={{
                    backgroundImage: `url("/assets/images/hero.png")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#C62828] to-transparent z-0" />

                <div className="relative z-10 text-white w-1/2">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Start a better shape of you!
                        <br />
                        Come Join Us!
                    </h1>
                    <button
                        onClick={(e) => scrollToSection(e, "about")}
                        className="mt-6 bg-white text-black px-8 py-3 rounded-full font-semibold text-base"
                    >
                        Learn More
                    </button>
                </div>

                <div className="relative z-10 w-1/2 flex justify-center">
                    <img
                        src="/assets/icons/logo.png"
                        alt="CyberGym Logo"
                        className="w-3/4 max-w-md object-contain"
                    />
                </div>
            </section>

            {/* Dynamic Sections */}
            <Section id="about" bgImage="/assets/images/about.png" />
            <Section id="services" bgImage="/assets/images/services.png" />
            <Section id="pricing" bgImage="/assets/images/pricing.png" />
            <VisitSection />
            <Footer />
        </div>
    );
};

export default HomePage;