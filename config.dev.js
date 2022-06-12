webpackCommon=require("./config.common.js")
const path = require("path");

module.exports = {

  ...webpackCommon,
  devtool: 'source-map',
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8080,
    watchContentBase: true,
    progress: true
  }
  
};
