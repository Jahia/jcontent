const jestConfig = require('@jahia/test-framework').jestConfig;

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '@jahia/moonstone': '<rootDir>/node_modules/@jahia/moonstone/dist/index.cjs',
    },
    modulePathIgnorePatterns: ['<rootDir>/tests']
};
