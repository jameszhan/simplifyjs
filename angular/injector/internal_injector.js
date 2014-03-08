'use strict';

var INSTANTIATING = {},
    path = [],
    providerSuffix = 'Provider';


function createInternalInjector(cache, factory) {

    function getService(serviceName) {
        if (cache.hasOwnProperty(serviceName)) {
            if (cache[serviceName] === INSTANTIATING) {
                throw $injectorMinErr('cdep', 'Circular dependency found: {0}', path.join(' <- '));
            }
            return cache[serviceName];
        } else {
            try {
                path.unshift(serviceName);
                cache[serviceName] = INSTANTIATING;
                return cache[serviceName] = factory(serviceName);
            } finally {
                path.shift();
            }
        }
    }

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

    function instantiate(Type, locals) {
        var Constructor = function() {},
            instance, returnedValue;

        // Check if Type is annotated and use just the given function at n-1 as parameter
        // e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
        Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype;
        instance = new Constructor();
        returnedValue = invoke(Type, instance, locals);

        return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
    }

    return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        annotate: annotate,
        has: function(name) {
            return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
        }
    };
}

if (require.main === module) {
    var providerCache = {};

    var g = require("../../global.js")
    g.extend(GLOBAL, g);

    var a = require("./annotate.js")
    g.extend(GLOBAL, a);

    var injector = createInternalInjector({}, function(serviceName){
        return "Found: " + serviceName;
    });

    var func = function(a, b, c){
        console.log("arguments: [", [].join.call(arguments, ", "), "]");
        console.log("this: ", this);
        console.log();
    }

    var ret = injector.invoke(func, {'hello': 'world'}, {a: 1, b: 2, c: 3});
    console.log("ret:", ret);

    var ret = injector.invoke(func, {hello: 'world'}, ["a", "b", "c"]);
    console.log("ret:", ret);

    var ret = injector.invoke(func, {hello: 'world'});
    console.log("ret:", ret);

    var Hello = function(a, b, c){
        this.name = "Hello";
        console.log("arguments: [", [].join.apply(arguments, [", "]), "]");
        console.log("this: ", this);
        console.log();
    }

    var ret = injector.instantiate(Hello, {a: 1, b: 2, c: 3});
    console.log("ret:", ret);

    var ret = injector.instantiate(Hello);
    console.log("ret:", ret);

    console.log(injector.get('a'));

    console.log(injector.annotate(Hello));

    console.log(injector.has("a"));
    console.log(injector.has("b"));
    console.log(injector.has("g"));
}