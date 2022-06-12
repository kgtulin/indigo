webpackCommon=require("./config.common.js")
const path = require("path");

module.exports = {
  ...webpackCommon,
  mode:"production"
};
