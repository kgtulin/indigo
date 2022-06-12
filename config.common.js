const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require("path");


module.exports = {
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/index.html")
		}),
		new MiniCssExtractPlugin({filename: "styles.css"})
	],

	entry: "./src/index.js",
	output: {
		path: path.join(__dirname, 'dist'),
		filename: "./main.js",
	},

	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.html$/i,
				loader: "html-loader",
				options: {
					// Disables attributes processing
					sources: false,
				},
			},

			{
				test: /\.css$/i,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							modules: true,
							importLoaders: 1,
						},
					},
					"postcss-loader",
				],
			},
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		extensions: ['.ts', '.js', '.css'],
	},

};
