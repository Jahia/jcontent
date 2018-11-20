module.exports = {
	setupFiles: ['<rootDir>/jest.setup.js'],
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/target/',
		'<rootDir>/node/'
	],
	"moduleNameMapper": {
		"@jahia/react-material": "<rootDir>/node_modules/@jahia/react-material/lib/react-material.umd.js",
		"@jahia/icons": "<rootDir>/node_modules/@jahia/icons/lib/icons.umd.js",
		"@jahia/apollo-dx": "<rootDir>/node_modules/@jahia/apollo-dx/lib/apollo-dx.umd.js",
		"@jahia/i18next": "<rootDir>/node_modules/@jahia/i18next/lib/i18next.umd.js"
	}
};
