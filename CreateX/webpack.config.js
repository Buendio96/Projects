const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//=================================================================
const mode = process.env.NODE_ENV || 'development';
const devMode = mode === 'development'
const prodMode = !devMode
const devtool = devMode ? 'source-map' : undefined;
//=================================================================
const fileName = ext => devMode ? `[name].${ext}` : `[contenthash].${ext}`;

const pages = ['about', 'services', 'work', 'news', 'contacts',];
const HTML_PLUGINS = () => {
	return pages.map((page) => new HtmlWebpackPlugin({
		template: path.resolve(__dirname, `src/pages/${page}.hbs`),
		filename: `${page}.html`,
		minify: prodMode,
		chunks: ['main', `${page}`],
		templateParameters: {
			'filename': `${page}`,
			'favicon': '/assets/icons/favicon.ico'
		}
	}))
};
//=================================================================
const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	}
	if (prodMode) {
		config.minimize = true
		config.minimizer = [
			new CssMinimizerPlugin(),
			new TerserPlugin({
				extractComments: false,
			})
		]
	}
	return config
};
const pattern = (folder) => {
	return {
		from: path.resolve(__dirname, `src/assets/${folder}`),
		to: path.resolve(__dirname, `dist/assets/${folder}`)
	}
}
//=================================================================
module.exports = {
	devtool,
	target: devMode ? "web" : "browserslist",
	mode: 'development',
	devServer: {
		port: 4300,
		open: true,
		hot: true,
		watchFiles: path.join(__dirname, 'src')
	},
	optimization: optimization(),
	entry: {
		main: path.resolve(__dirname, 'src/scripts/main.js'),
		homepageJS: path.resolve(__dirname, 'src/scripts/pages/homepage.js'),
		nandlebars: path.resolve(__dirname, 'src/scripts/pages/homepage.js'),
		news: path.resolve(__dirname, 'src/scripts/pages/news.js'),
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		filename: 'scripts/' + fileName('js'),
		assetModuleFilename: 'assets/[name]'
	},
	resolve: {
		extensions: [
			'.html', '.hbs', '.js', '.mjs', '.ts', '.json', '.css', '.scss', '.png', '.jpg',
		],
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@fonts': path.resolve(__dirname, 'src/assets/fonts'),
			'@images': path.resolve(__dirname, 'src/assets/images'),
			'@staticImages': path.resolve(__dirname, 'src/assets/static-iamges'),
			'@styles': path.resolve(__dirname, 'src/styles'),
			'@s-common': path.resolve(__dirname, 'src/styles/common'),
			'@s-modules': path.resolve(__dirname, 'src/styles/modules'),
			'@s-pages': path.resolve(__dirname, 'src/styles/pages'),
			'@js': path.resolve(__dirname, 'src/scripts'),
			'@js-modules': path.resolve(__dirname, 'src/scripts/modules'),
			'@js-templates': path.resolve(__dirname, 'src/scripts/templates'),
			'@js-api': path.resolve(__dirname, 'src/scripts/api'),
			'@js-store': path.resolve(__dirname, 'src/scripts/store'),
			'@libs': path.resolve(__dirname, 'src/libs'),
			'@hbs-templates': path.resolve(__dirname, 'src/pages/templates'),
		}
	},
	//=================================================================
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'src/createX.hbs'),
			filename: 'index.html',
			chunks: ['main', 'homepageJS'],
			minify: prodMode,
			templateParameters: {
				'filename': 'createX',
				'favicon': '/assets/icons/favicon.ico',
			}
		}),
		...HTML_PLUGINS(),
		new MiniCssExtractPlugin({
			filename: 'styles/' + fileName('css')
		}),
		new CopyWebpackPlugin({
			patterns: [
				pattern('icons'),
				pattern('vendors'),
				pattern('videos'),
				pattern('static-images'),
				pattern('static-images/portfolio'),
				pattern('static-images/opinion'),
			]
		}),
	],
	//=================================================================
	module: {
		rules: [{
			test: /\.(c|sa|sc)ss$/i,
			use: [
				devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
				'css-loader',
				{
					loader: 'postcss-loader',
					options: {
						postcssOptions: {
							plugins: [require('postcss-preset-env')]
						}
					}
				},
				'sass-loader',
			],
		}, {
			test: /\.hbs$/,
			loader: "handlebars-loader",
			options: {
				partialDirs: [path.join(__dirname, 'src/pages/templates')]
			}
		}, {
			test: /\.(?:js|mjs|cjs)$/i,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [[
						'@babel/preset-env',
						{
							targets: "defaults",
						}
					]],
					plugins: [
						'@babel/plugin-proposal-class-properties',
					]
				}
			}
		}, {
			test: /\.(woff|woff2|ttf)$/i,
			type: 'asset/resource',
			generator: {
				filename: `assets/fonts/${fileName('[ext]')}`
			}
		}, {
			test: /\.(jpe?g|png|webp|gif|svg)$/i,
			use: [{
				loader: 'image-webpack-loader',
				options: {
					mozjpeg: {
						progressive: true,
					},
					optipng: {
						enabled: false,
					},
					pngquant: {
						quality: [0.65, 0.90],
						speed: 4
					},
					gifsicle: {
						interlaced: false,
					},
					webp: {
						quality: 75
					}
				}
			}],
			type: 'asset/resource',
			generator: {
				filename: `assets/images/${fileName('[ext]')}`
			}
		}]
	}
};