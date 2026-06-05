import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.test.js'],
        globals: false,
        coverage: {
            provider: 'v8',
            include: ['js/**/*.js'],
            exclude: ['js/constants.js']
        }
    }
});
