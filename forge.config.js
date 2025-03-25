module.exports = {
    "plugins": [
      {
        "name": "@electron-forge/plugin-webpack",
        "config": {
          "mainConfig": "./webpack.main.config.js",
          "renderer": {
            "config": "./webpack.renderer.config.js",
            "entryPoints": [
              {
                "name": "main_window",
                "html": "./src/index.html",
                "js": "./src/renderer.ts",
                "preload": {
                  "js": "./src/preload.ts"
                }
              }
            ]
          }
        }
      }
    ]
}
