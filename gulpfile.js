const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require('gulp-sass')(require('sass'));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const pug = require("gulp-pug");
// const htmlValidator = require('gulp-w3c-html-validator')
// const bemValidator = require('gulp-html-bem-validator')
// const htmlmin = require("gulp-htmlmin");
// const uglify = require("gulp-uglify");
const terser = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();
const concat = require('gulp-concat');


// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(rename("style.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

//минифицировать html
// const html = () => {
//   return gulp.src("source/*.html")
//     .pipe(htmlmin({ collapseWhitespace: true }))
//     .pipe(gulp.dest("build"));
// }

//pug2html
const pug2html = () => {
  return gulp.src("source/pages/*.pug")
    // .pipe(plumber())
    .pipe(pug({pretty: true}))
    // .pipe(htmlValidator())
    // .pipe(bemValidator())
    .pipe(gulp.dest("build"));
}

exports.pug2html = pug2html;


// Scripts

const scripts = () => {
  return gulp.src("source/js/main.js")
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts;


// const jsLibs = () => {
//   return gulp.src([
//       './node_modules/swiper/swiper-bundle.js'
//   ])
//       .pipe(concat('libs.min.js'))
//       .pipe(terser())
//       .pipe(gulp.dest("build/js"));
// }

// exports.jsLibs = jsLibs;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}

exports.sprite = sprite;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/img/*.ico",
    "source/img/**/*.{jpg,png,svg}",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = done => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/*.js", gulp.series(scripts));
  gulp.watch("source/img/**/*.{png,jpg,svg}", gulp.series(images));
  gulp.watch("source/pages/**/*.pug", gulp.series(pug2html, reload));
}

// Build

const build = gulp.series(
  clean,
  gulp.parallel(
    styles,
    pug2html,
    scripts,
    sprite,
    copy,
    images,
    createWebp
  ));

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  gulp.parallel(
    styles,
    pug2html,
    scripts,
    sprite,
    copy,
    // images,
    // createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
