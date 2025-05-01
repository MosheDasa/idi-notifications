const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const commonConfig = {
  mode: process.env.NODE_ENV || "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

const mainConfig = {
  ...commonConfig,
  target: "electron-main",
  entry: "./src/main.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};

const preloadConfig = {
  ...commonConfig,
  target: "electron-preload",
  entry: "./src/preload.ts",
  output: {
    filename: "preload.js",
    path: path.resolve(__dirname, "dist"),
  },
};

const rendererConfig = {
  ...commonConfig,
  target: "electron-renderer",
  entry: "./src/index.tsx",
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};

module.exports = [mainConfig, preloadConfig, rendererConfig];
