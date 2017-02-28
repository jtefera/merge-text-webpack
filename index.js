function mergeFilesWebpack(options){
    if(typeof options !== 'object' && !options.filename) {
        throw new Error('Filename is mandatory');
    }
    // The final name of your merged file. 
    // It can include a relative path before the filename.
    // mandatory
    this.filename = options.filename;
    // Used to check which files created by extract-text-webpack-plugin
    // should be merged.
    // if you have given the filename option on the extract-text-webpack-plugin 
    // the name [name].style.css, a good candidate for chuncksTest would be style.css
    // Can be a regular expresion. If not passed, the filename is used 
    this.test = options.test || options.filename;
    // By default setted to true, it tells to this plugin if you want to delete the files
    // created by the extract-text-webpack-plugin
    // if false, in your public directory you will have entry1.style.css, entry2.style.css and style.css
    // if true, you will only have the style.css that is the merged file created by this plugin
    this.deleteSourceFiles = (options.deleteSourceFiles !== undefined) 
                                ? options.deleteSourceFiles
                                : true;
};

mergeFilesWebpack.prototype.apply = function mergeFilesWebpackApply(compiler) {
    /*
        I write this as the webpack documentation is scarse for the things needed for this plugin.
        Webpack has a kind of event system to which plugins attach themself.
        To each plugin, webpack passes a reference to its compiler. 
        The compiler goes through different steps and each time a step 
        happens, Webpack sends the corresponding event.
        The way to hook to those events is through the plugin method below.
        There are many different events. The one of particular interest for this 
        plugin is the "emit" event.
        This is the last event before the files are created on their directory. 
        (There are other events after this one but are mainly for stats purposes)
        At this point, the extract-text-webpack-plugin plugin, has created those that
        would be the extracted files that we want to merge. They are saved under the assets object
        in the "compilation" object. Each entry into the assets object will be a file created.
        What this plugin will do is check first all the present entries to see which pass the test for the files 
        we want to merge (e.g. Files ending with "style.css"), create a new entry with the name given 
        in the filename option merging all the filtered entries, delete the entries from the assets object leaving
        only our new file and the files that didn´t pass the fitler.
    */
    compiler.plugin('emit', (function (compilation, callback) {
        var assets = compilation.assets;
        // array of file names e.g.  [entry1.js, entry1.style.css,...]
        var files = Object.keys(assets); 
        var test = this.test;
        var filteredFiles = files.filter(function(file) {
            return file.search(test) > -1;
        });
        if(filteredFiles.length === 0) {
            // No file passed our test.
            console.warn(
                'NO FILE PASSED THE TEST.', 
                'Check the example at https://github.com/jtefera/merge-files-webpack');
            callback();
            return;
        }
        // we will merge all the filtered files into the first one
        var firstFile = assets[filteredFiles[0]];
        for(var i = 1; i < filteredFiles.length; i++) {
            var thisFile = assets[filteredFiles[i]];
            // the files extracted by extract-text-webpack-plugin
            // have each line as an element of the children array
            firstFile.children = firstFile.children.concat(thisFile.children);
        }
        if(this.deleteSourceFiles) {
            for(var i = 0; i < filteredFiles.length; i++) {
                // by deleting those entries from the assets object,
                // we prevent them from being created on file
                delete assets[filteredFiles[i]];
            }
            // extract-text-webpack-plugin not only saves the files 
            // into the assets object but also saves the name of the files 
            // into the files array of every chunk (in this case, chunck will be every
            // entry file in your webpack)
            // this filenames will be used in the after-emit event to create a display that 
            // shows info of every file created. If you don´t delete those filenames, error!
            var entryName;
            for(entryName in compilation.entrypoints){
                if(compilation.entrypoints.hasOwnProperty(entryName)){
                    var entry = compilation.entrypoints[entryName];
                    for(var i = 0; i < filteredFiles.length; i++) {
                        for(var j = 0; j < entry.chunks.length; j++){
                            var idx = entry.chunks[j].files.indexOf(filteredFiles[i]);
                            if(idx > -1) {
                                entry.chunks[j].files.splice(idx, 1);
                            }
                        }
                    }
                }
            }
        }
        // Creating our file!!
        assets[this.filename] = firstFile;
        // The emit event is async so you need to call the callback to make 
        // webpack know that you have finished
        callback();
    }).bind(this));
}

module.exports = mergeFilesWebpack;