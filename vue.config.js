module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/background.js",
      preload: "src/preload.js",
      builderOptions: {
        productName: "rto-model-manager",
        linux: {
          target: "AppImage",
          category: "Utility"
        },
        mac: {
          identity: null
        },
        extraResources: [
          {
            from: "./src/assets/",
            to: "assets",
            filter: ["**/*"]
          },
        ],
        directories: {
          buildResources: "build",
          output: "dist_electron"
        }
      }
    },
  }
};