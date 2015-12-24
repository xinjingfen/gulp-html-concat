'use strict';

//var extend = require('node.extend');
var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

var PLUGIN_NAME = 'gulp-html-concat';

module.exports = function(fileName, deep, jsonSpace) {
    if (!fileName) {
        throw new PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Missing fileName parameter');
    }

    var buffer = [];
    var firstFile = null;

    deep = (deep !== undefined) ? deep : true;
    buffer.push(deep); // first argument

    function bufferContents(file) {
        if (file.isNull()) {
            return this.queue(file);
        }

        if (file.isStream()) {
            return this.emit('error', new PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Streaming not supported'));
        }

        if (!firstFile) {
            firstFile = file;
        }

        var jsonContent;

        try {
            //jsonContent = JSON.parse(file.contents.toString('utf8'));
            jsonContent = file.contents;
        } catch (e) {
            jsonContent = new Buffer();
            console.log('[' + gutil.colors.red('gulp-html-concat') + '] File "' + file.path + '" has errors and was skipped!');
        }

        buffer.push(jsonContent);
    }

    function endStream() {
        if (buffer.length === 1) {
            return this.emit('end');
        }
        var temp;
        buffer.shift()
        var finaBuffer = buffer.map(function(item,index,arr){
            if( index != 0){
                temp = item.toString().match(/<div class="file">[\s\S]*<\/body>/gi);
                if(temp){
                    return new Buffer(temp[0].replace("</body>",""));
                }else{
                    return new Buffer("")
                }
            }else{
                temp = item.toString().match(/[\s\S]*<\/body>/gi);
                if(temp){
                    return new Buffer(temp[0].replace("</body>",""));
                }else{
                    return new Buffer("")
                }
            }
        })
        finaBuffer = Buffer.concat(finaBuffer);

        var joinedPath = path.join(firstFile.base, fileName);
        var joinedFile = new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: joinedPath,
            //contents: new Buffer(JSON.stringify(joinedContents, null, jsonSpace))
            contents: finaBuffer
        });

        console.log(' Report file has been created: '.yellow.bold + joinedPath.cyan.bold);
        this.emit('data', joinedFile);
        this.emit('end');
    }

    return through(bufferContents, endStream);
};
