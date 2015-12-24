# gulp-html-concat

## 项目介绍

组装多个html文档


## 安装

	var htmlConcat = require('gulp-html-concat');

	gulp.task("htmlconcat", function () {
		return gulp.src(["./report/*.html","!./report/js-report-index.html"])
			.pipe(htmlConcat("report-jshint-index.html"))
			.pipe(gulp.dest("./report/"))
	})
	

