function mergeFilesWebpack(options){
    if(typeof options !== 'object' && !options.filename) {
        throw new Error('Filename is mandatory');
    }
    this.filename = options.filename;
    this.chunksTest = options.chunksTest || options.filename;
};

mergeFilesWebpack.prototype.apply = function mergeFilesWebpackApply(compiler) {
    compiler.plugin('emit', (function (compilation, callback) {
        var assets = compilation.assets;
        var files = Object.keys(assets);
        var chunksTest = this.chunksTest;
        var styleFiles = files.filter(function(file) {
            return file.indexOf(chunksTest) > -1;
        });
        var firstFile = assets[styleFiles[0]];
        for(var i = 1; i < styleFiles.length; i++) {
            var thisFile = assets[styleFiles[i]];
            firstFile.children = firstFile.children.concat(thisFile.children);
        }
        assets[this.filename] = firstFile;
        callback();
    }).bind(this));
}

module.exports = mergeFilesWebpack;