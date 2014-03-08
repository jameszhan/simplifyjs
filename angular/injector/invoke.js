'use strict';

function invoke(fn, self, locals){
    var args = [],
        $inject = annotate(fn),
        length, i,
        key;

    for(i = 0, length = $inject.length; i < length; i++) {
        key = $inject[i];
        if (typeof key !== 'string') {
            throw $injectorMinErr('itkn', 'Incorrect injection token! Expected service name as string, got {0}', key);
        }
        args.push(
            locals && locals.hasOwnProperty(key) ? locals[key] : getService(key)
        );
    }

    if (!fn.$inject) {
        // this means that we must be an array.
        fn = fn[length];
    }

    // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
    // 看过clojure实现的同学是不是觉得这里很像，这里主要是基于性能考虑，默认最后一句就可以解决.
    switch (self ? -1 : args.length) {
        case  0: return fn();
        case  1: return fn(args[0]);
        case  2: return fn(args[0], args[1]);
        case  3: return fn(args[0], args[1], args[2]);
        case  4: return fn(args[0], args[1], args[2], args[3]);
        case  5: return fn(args[0], args[1], args[2], args[3], args[4]);
        case  6: return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
        case  7: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        case  8: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        case  9: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        case 10: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
        default: return fn.apply(self, args);
    }
}

if (require.main === module) {
    var g = require("../../global.js")
    g.extend(GLOBAL, g);

    var a = require("./annotate.js")
    g.extend(GLOBAL, a);

    var getService = function mockedService(serviceName) {
        return "Mocked Value";
    }

    var func = function(a, b, c){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log(); },
        target = {name: 'james'},
        locals = {a: 1, b: 2, c: 3};

    invoke(func);

    invoke(func, target);

    invoke(func, target, locals);

    invoke(function(){
        func.apply(this, arguments);
    }, target, locals);
}

