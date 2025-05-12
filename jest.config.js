const jestConfig = require('@jahia/test-framework').jestConfig;

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '@jahia/moonstone': '<rootDir>/jest-shims/@jahia/moonstone/dist/index.cjs',
        // '@jahia/moonstone': '<rootDir>/node_modules/@jahia/moonstone/dist/index.cjs',
    },
    modulePathIgnorePatterns: ['<rootDir>/tests']
};
