const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ignore the backend folder so Metro bundler doesn't crash when backend files change
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  /backend\/.*/,
];

// Enable inline requires to speed up bundling and startup times
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
