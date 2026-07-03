import { defineConfig } from 'vite';
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const react = require('@vitejs/plugin-react');

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
