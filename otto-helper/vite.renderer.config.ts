import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html'),
				splash: path.resolve(__dirname, 'src/renderer/splash.html'),
			},
		},
	},
});
