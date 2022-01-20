const path = require('path'),
	autoprefixer = require('autoprefixer');

module.exports = {
	entry: {
		'index': './src/pages/index.js',
		'submit': './src/pages/submit.js'
	},
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'file-loader',
						options: {
			                name: "[name].css",
						},
					},
					{
						loader: 'extract-loader'
					},
					{
						loader: 'css-loader'
					},
					{
					loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									autoprefixer()
								]
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							// Prefer Dart Sass
							implementation: require('sass'),

							// See https://github.com/webpack-contrib/sass-loader/issues/804
							webpackImporter: false,
							sassOptions: {
								includePaths: ['./node_modules']
							}
						}
					}
				]
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: "defaults"
								}
							]
						]
					}
				}
			}
		]
	}
};
