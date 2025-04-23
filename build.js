const { build } = require("electron-builder");

build({
  config: {
    appId: "com.idi.notifications",
    productName: "IDI Notifications",
    directories: {
      output: "release",
    },
    win: {
      target: "nsis",
      icon: "src/assets/icon.ico",
    },
    nsis: {
      oneClick: true,
      allowToChangeInstallationDirectory: false,
      createDesktopShortcut: false,
      createStartMenuShortcut: false,
      shortcutName: "IDI Notifications",
    },
    files: ["dist/**/*", "package.json"],
    extraResources: [
      {
        from: "src/assets",
        to: "assets",
      },
    ],
  },
})
  .then(() => {
    console.log("Build completed successfully!");
  })
  .catch((err) => {
    console.error("Build failed:", err);
  });
