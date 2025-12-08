const {jestConfig} = require('@jahia/test-framework');

module.exports = {
    ...jestConfig,
    setupFiles: ['<rootDir>/src/javascript/setupTextEncoder.js'],
    setupFilesAfterEnv: ['<rootDir>/src/javascript/setupTests.js'],
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        'react-dnd': 'react-dnd-cjs',
        'react-dnd-html5-backend': 'react-dnd-html5-backend-cjs',
        'dnd-core': 'dnd-core-cjs'
    },
    modulePathIgnorePatterns: ['<rootDir>/tests'],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
        "node_modules/(?!(react-pdf|pdfjs-dist)/)"
    ]
};
