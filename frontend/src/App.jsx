import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard"; // Verify this path
import ErrorBoundary from "./components/ErrorBoundry";
import HomePage from "./pages/HomePage"; // Verify this path
import { useAuthStore } from "./store/useAuthStore";

function App() {
	const { authUser, loading } = useAuthStore();

	// No initial auth check needed; rely on login/register to set authUser
	// useEffect is removed since checkAuth is skipped

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-white">
				<p className="text-lg text-[#C62828]">Loading...</p>
			</div>
		);
	}

	return (
		<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
			<ErrorBoundary>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route
						path="/dash"
						element={authUser ? <Dashboard /> : <Navigate to="/" replace />}
					/>
					<Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all route */}
				</Routes>
			</ErrorBoundary>
			<Toaster />
		</div>
	);
}

export default App;