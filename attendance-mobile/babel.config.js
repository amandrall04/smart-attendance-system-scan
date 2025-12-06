// attendance-mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for the Face Detector Worklets
      'react-native-worklets-core/plugin', 
      
      // Keep this if you are using Reanimated (usually required by navigation/vision camera)
      'react-native-reanimated/plugin', 
    ],
  };
};