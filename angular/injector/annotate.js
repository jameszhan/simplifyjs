'use strict';

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function annotate(fn) {
    var $inject,
        fnText,
        argDecl,
        last;

    if (typeof fn == 'function') {
        if (!($inject = fn.$inject)) {
            $inject = [];
            if (fn.length) {
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
                    arg.replace(FN_ARG, function(all, underscore, name){
                        $inject.push(name);
                    });
                });
            }
            fn.$inject = $inject;
        }
    } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
    } else {
        assertArgFn(fn, 'fn', true);
    }
    return $inject;
}

if (require.main === module) {
    var g = require("../../global.js")
    g.extend(GLOBAL, g);
    console.log("annotate(function(a, b, c)) = ", annotate(function(a, b, c){}));
    console.log("annotate(['a', 'b', 'c', function(a, b, c)]) = ", annotate(['a', 'b', 'c', function(a, b, c){}]));
}

exports.annotate = annotate;