import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(() => {
    const external = Object.keys(pkg.peerDependencies || {});

    return {
        plugins: [dts({ rollupTypes: true })],
        build: {
            copyPublicDir: false,
            lib: {
                entry: {
                    index: 'lib/index.ts',
                    main: 'lib/main.ts',
                    preload: 'lib/preload.ts',
                    render: 'lib/render.ts',
                },
                formats: ['es', 'cjs'] as any,
            },
            outDir: 'dist',
            emptyOutDir: true,
            minify: true,
            rollupOptions: {
                external,
            },
        },
    };
});
