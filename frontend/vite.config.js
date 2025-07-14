import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/api': 'http://localhost:5000'  // replace with your backend port
		}
	},
});
