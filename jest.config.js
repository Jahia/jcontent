const jestConfig = require('@jahia/test-framework').jestConfig;

jestConfig.moduleNameMapper['@jahia/moonstone'] = '@jahia/moonstone/dist/lib/main';

module.exports = jestConfig;
