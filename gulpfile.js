"use strict";

// path

const appFolder = './app/';
const buildFolder = './dist/';

const path = {
  app: {
    html: [`${appFolder}*.html`, `!${appFolder}_*.html`, `!${appFolder}blocks/*.html`],
    css: `${appFolder}scss/main.scss`,
		js: [`${appFolder}js/main.js`, `!${appFolder}js/_*.js`],
		img: `${appFolder}images/**/**.{jpg,jpeg,png}`,
		svg: [`${appFolder}images/**/*.svg`, `!${appFolder}images/sprite/`],
		svgsprite: `${appFolder}images/sprite/*.svg`,
		resource: `${appFolder}resources/**/*.*`,
		fonts: `${appFolder}fonts/*.*`
  },

  build: {
    html: buildFolder,
    css: `${buildFolder}css/`,
		js: `${buildFolder}js/`,
		img: `${buildFolder}images/`,
		resource: `${buildFolder}resources/`,
		fonts: `${buildFolder}fonts/`
  },

  watch: {
    html: `${appFolder}**/*.html`,
    css: `${appFolder}scss/**/*.scss`,
		js: `${appFolder}js/**/*.js`,
		img: `${appFolder}images/**/*.{gif,webp,ico,avif,jpg,jpeg,png,svg}`,
		resource: `${appFolder}resources/**/*.*`
  },
  clean: buildFolder
}


// plugins

import { parallel, src, dest, series, watch } from 'gulp';

// html
import include from 'gulp-file-include';
import typograf from 'gulp-typograf';
import prettyHtml from 'gulp-pretty-html';
import htmlMin from 'gulp-htmlmin';
import gulpHtmlBemValidator from 'gulp-html-bem-validator';
import htmlhint from 'gulp-htmlhint';

// scss
import cleanCss from 'gulp-clean-css';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssComments from 'gulp-strip-css-comments';
import cssBeautify from 'gulp-cssbeautify';
import sortMedia from 'postcss-combine-media-query';
import postcss from 'gulp-postcss';
const sass = gulpSass(dartSass);

// js
import webpackStream from 'webpack-stream';
import uglify from "gulp-uglify-es";
import eslint from 'gulp-eslint';

// images
import svgSprite from 'gulp-svg-sprite';
import svgMin from 'gulp-svgmin';
import imageMin from 'gulp-imagemin';
import newer from 'gulp-newer';
import webp from 'gulp-webp';
import avif from 'gulp-avif';
import img_to_picture from "gulp_img_transform_to_picture";

// cache
import cache from 'gulp-cache';

// fonts
import fonter from 'gulp-fonter-fix';
import woff2 from 'gulp-ttf2woff2';

// others
import pathRoot from 'path';
import browserSync from 'browser-sync';
import gulpIf from 'gulp-if';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import del from 'del';
import gulpZip from 'gulp-zip';
import cheerio from 'gulp-cheerio';
import replace from 'gulp-replace';
import fs from 'fs';

const rootFolder = pathRoot.basename(pathRoot.resolve());

// production
const isProd = process.argv.includes('--build');
const isPrev = process.argv.includes('--prev');

// function

export const clean = () => {
  return del(path.clean)
};

export const cacheTask = () => {
  return cache.clearAll()
};

export const html = () => {
	const config_pic = {
		extensions: {
			png: true,
			jpg: true,
			jpeg: true
		}
	};
  return src(path.app.html)
  .pipe(plumber(notify.onError({
    title: "HTML",
    message: "Error: <%= error.message %>"
  })))
  .pipe(include({
		prefix: '@',
    basepath: '@file'
  }))
  .pipe(typograf({locale: ['ru', 'en-US']}))
	.pipe(replace(/#img\//g, 'images/'))
	.pipe(gulpIf(isProd, img_to_picture(config_pic)))
  .pipe(prettyHtml({indent_size: 2}))
	.pipe(htmlhint('.htmlhintrc'))
	.pipe(htmlhint.reporter())
  .pipe(dest(path.build.html))
	.pipe(gulpHtmlBemValidator())
  .pipe(gulpIf(isProd, htmlMin({
		collapseWhitespace: true,
    removeComments: true
  })))
  .pipe(gulpIf(isProd, rename({suffix: '.min'})))
  .pipe(dest(path.build.html))
  .pipe(browserSync.stream())
};

export const scss = () => {
  return src(path.app.css, {sourcemaps: !isProd})
  .pipe(plumber(notify.onError({
    title: "SCSS",
    message: "Error: <%= error.message %>",
  })))
  .pipe(sass({silenceDeprecations: ['legacy-js-api']}))
  .pipe(postcss([sortMedia({sort: 'desktop-first'})]))
  .pipe(autoprefixer({
    cascade: false,
    grid: true,
    overrideBrowserslist: ["last 5 versions"]
  }))
  .pipe(gulpIf(!isProd, cssBeautify({indent: '  '})))
  .pipe(gulpIf(isProd, cssComments()))
  .pipe(gulpIf(isProd, cleanCss({level: 2})))
	.pipe(replace(/#img\//g, '../images/'))
  .pipe(dest(path.build.css, {sourcemaps: '.'}))
  .pipe(browserSync.stream())
};

export const js = () => {
	return src(path.app.js)
	.pipe(plumber(notify.onError({
    title: "JS",
    message: "Error: <%= error.message %>"
  })))
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(webpackStream({
		mode: isProd ? 'production' : 'development',
		output: {
			filename: 'main.js'
		},
		module: {
  		rules: [{
      	test: /\.(?:js|mjs|cjs)$/,
      	exclude: /node_modules/,
      	use: {
        	loader: 'babel-loader',
        	options: {
          	presets: [['@babel/preset-env', { targets: "defaults" }]
  ]}}}]},
	devtool: !isProd ? 'source-map' : false})).on('error', function (err) {console.error('WEBPACK ERROR', err);this.emit('end');})
	.pipe(gulpIf(isProd, uglify.default()))
	.pipe(dest(path.build.js))
	.pipe(browserSync.stream())
};

export const fonts = () => {
  return src(path.app.fonts, {encoding: false})
	.pipe(plumber(notify.onError({
    title: "FONTS",
    message: "Error: <%= error.message %>"
  })))
  .pipe(fonter({formats: ['ttf']}))
  .pipe(woff2())
  .pipe(dest(path.build.fonts))
};

export const autoconnectfont = () => {
	let appfonts = "./app/scss/_fonts.scss";
	let fontWeights = {
		thin: 100,
		hairline: 100,
		extralight: 200,
		ultralight: 200,
		light: 300,
		regular: 400,
		medium: 500,
		semibold: 600,
		demibold: 600,
		bold: 700,
		extrabold: 800,
		ultrabold: 800,
		black: 900,
		heavy: 900,
		extrablack: 950,
		ultrablack: 950,
	};
	let fontStyles = {
		italic: "italic",
		oblique: "oblique",
		normal: "normal",
	};

	fs.readdir(path.build.fonts, function (err, fontsFiles) {
		if (err) {
			console.error(err);
			return;
		}

		if (fs.existsSync(appfonts)) {
			console.log(
				`Файл ${appfonts} уже создан. Чтобы обновить файл необходимо его удалить!`
			);
			return;
		}

		let fileContent = "@use 'mixins' as *;\n\n";
		for (var i = 0; i < fontsFiles.length; i++) {
			let fontFileName = fontsFiles[i].split(".")[0];
			let fontName = fontFileName.split(/[-]/)[0];
			let normalizedString = fontFileName.toLowerCase();

			let weight = Object.keys(fontWeights).reduce(
				(acc, weight) =>
					normalizedString.includes(weight) ? fontWeights[weight] : acc,
				undefined
			);

			let style = Object.keys(fontStyles).reduce(
				(acc, style) =>
					normalizedString.includes(style) ? fontStyles[style] : acc,
				"normal"
			);

			fileContent += `@include font-face("${fontName}", "${fontFileName}", ${weight}, ${style});\r\n`;
		}

		fs.writeFile(appfonts, fileContent, (err) => {
			if (err) {
				console.error(err);
			} else {
				console.log(`Файл ${appfonts} обновлен`);
			}
		});
	});
	return src(appFolder)
};

export const sprites = () => {
	return src(path.app.svgsprite, { encoding: false })
	.pipe(plumber(notify.onError({
    title: "SPRITE",
    message: "Error: <%= error.message %>"
  })))
		.pipe(svgMin({
				js2svg: {
					pretty: true
		},}))
		.pipe(cheerio({
      run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true
    },}))
		.pipe(replace("&gt;", ">"))
		.pipe(svgSprite({
				mode: {
					symbol: {
						sprite: "../sprite.svg"
		}}}))
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream());
};

export const images = () => {
  const img = src([path.app.img, ...path.app.svg], { encoding: false })
	.pipe(plumber(notify.onError({
		title: "IMAGES",
		message: "Error: <%= error.message %>"
	})))

  if (isProd) {
    return img
			.pipe(newer(path.build.img))
			.pipe(imageMin({
				quality: 75,
				optimizationLevel: 3,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				progressive: true
			}))
			.pipe(dest(path.build.img))
			.pipe(src(path.app.img, {encoding: false}))
      .pipe(newer(path.build.img))
      .pipe(avif({ quality: 50 }))
      .pipe(dest(path.build.img))

      .pipe(src(path.app.img, {encoding: false}))
      .pipe(newer(path.build.img))
      .pipe(webp({ quality: 75 }))
      .pipe(dest(path.build.img))

  } else {
    return img
			.pipe(imageMin({
				quality: 75,
				optimizationLevel: 3,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				progressive: true,
				}))
			.pipe(dest(path.build.img));
  }
};

export const imagesCopy = () => {
	return src(`${appFolder}images/**/*.{gif,webp,ico,avif}`, { encoding: false })
  .pipe(plumber(notify.onError({
    title: "IMAGES COPY",
    message: "Error: <%= error.message %>"
  })))
	.pipe(dest(path.build.img))
};

export const resources = () => {
	return src(path.app.resource, {encoding: false})
	.pipe(plumber(notify.onError({
		title: "RESOURCES",
		message: "Error: <%= error.message %>"
	})))
	.pipe(dest(path.build.resource))
};

export const zip = () => {
	return src(`${buildFolder}/**/*.*`, { encoding: false })
	.pipe(plumber(notify.onError({
		title: "ZIP",
		message: "Error: <%= error.message %>"
	})))
	.pipe(gulpZip(`${rootFolder}.zip`))
	.pipe(dest('./'))
};

export const watcher = () => {
  browserSync.init({server: {
      baseDir: buildFolder,
    },
    notify: false,
    port: 3000,
  });
  watch(path.watch.html, html);
  watch(path.watch.css, scss);
	watch(path.watch.js, js);
	watch(path.watch.img, sprites);
	watch(path.watch.img, images);
	watch(path.watch.img, imagesCopy);
	watch(path.watch.resource, resources);
};


// exports

const build = series(clean, parallel(html, js, sprites, images, imagesCopy, resources, fonts), autoconnectfont, scss, cacheTask);
const serve = series(watcher);
const go = series(build, watcher);

export default isProd ? build : isPrev ? serve : go;
