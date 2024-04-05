const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const files = {
	scssPath: 'src/sass/**/*.scss',
	jsPath: 'src/**/*.js',
	demoCSS: 'demo/css',
	demoJS: 'demo/js',
	dist: 'dist',
};

function scssTask() {
	return src(files.scssPath, { sourcemaps: true }) // set source and turn on sourcemaps
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(dest(files.demoCSS, { sourcemaps: '.' }))
		.pipe(dest(files.dist, { sourcemaps: '.' })); // put final CSS in dist folder with sourcemap
}

function uglifyTask() {
	return src([files.jsPath])
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(dest(files.dist))
		.pipe(dest(files.demoJS))
		.pipe(dest(files.dist))
		.pipe(dest(files.demoJS));
}

function copyJS() {
	return src([files.jsPath]).pipe(dest(files.dist)).pipe(dest(files.demoJS));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
	watch(
		[files.scssPath, files.jsPath],
		{ interval: 1000, usePolling: true }, //Makes docker work
		series(parallel(scssTask, uglifyTask, copyJS))
	);
}

exports.default = parallel(scssTask, uglifyTask, copyJS, watchTask);
exports.build = parallel(scssTask, uglifyTask, copyJS);
exports.css = parallel(scssTask);
exports.js = parallel(uglifyTask);
