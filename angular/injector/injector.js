'use strict';

function createInjector(modulesToLoad) {
    var INSTANTIATING = {},
        providerSuffix = 'Provider',
        path = [],
        loadedModules = new HashMap(),
        providerCache = {
            $provide: {
                provider: supportObject(provider),
                factory: supportObject(factory),
                service: supportObject(service),
                value: supportObject(value),
                constant: supportObject(constant),
                decorator: decorator
            }
        },
        providerInjector = (providerCache.$injector =
            createInternalInjector(providerCache, function() {
                throw $injectorMinErr('unpr', "Unknown provider: {0}", path.join(' <- '));
            })),
        instanceCache = {},
        instanceInjector = (instanceCache.$injector =
            createInternalInjector(instanceCache, function(servicename) {
                var provider = providerInjector.get(servicename + providerSuffix);
                return instanceInjector.invoke(provider.$get, provider);
            }));


    forEach(loadModules(modulesToLoad), function(fn) { instanceInjector.invoke(fn || noop); });

    return instanceInjector;

    ////////////////////////////////////
    // $provider
    ////////////////////////////////////
    function supportObject(delegate) {
        return function(key, value) {
            if (isObject(key)) {
                forEach(key, reverseParams(delegate));
            } else {
                //return delegate(key, value);
                delegate(key, value);
            }
        };
    }

    function provider(name, provider_) {
        assertNotHasOwnProperty(name, 'service');
        if (isFunction(provider_) || isArray(provider_)) {
            provider_ = providerInjector.instantiate(provider_);
        }
        if (!provider_.$get) {
            throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
        }
        return providerCache[name + providerSuffix] = provider_;
    }

    function factory(name, factoryFn) { return provider(name, { $get: factoryFn }); }

    function service(name, constructor) {
        return factory(name, ['$injector', function($injector) {
            return $injector.instantiate(constructor);
        }]);
    }

    function value(name, val) { return factory(name, valueFn(val)); }

    function constant(name, value) {
        assertNotHasOwnProperty(name, 'constant');
        providerCache[name] = value;
        instanceCache[name] = value;
    }

    function decorator(serviceName, decorFn) {
        var origProvider = providerInjector.get(serviceName + providerSuffix),
            orig$get = origProvider.$get;

        origProvider.$get = function() {
            var origInstance = instanceInjector.invoke(orig$get, origProvider);
            return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
        };
    }

    ////////////////////////////////////
    // Module Loading
    ////////////////////////////////////
    function loadModules(modulesToLoad){
        var runBlocks = [], moduleFn, invokeQueue, i, ii;
        forEach(modulesToLoad, function(module) {
            if (loadedModules.get(module)) return;
            loadedModules.put(module, true);
            try {
                if (isString(module)) {
                    moduleFn = angularModule(module);
                    runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);

                    for(invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
                        var invokeArgs = invokeQueue[i],
                            provider = providerInjector.get(invokeArgs[0]);

                        provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                    }
                } else if (isFunction(module)) {
                    runBlocks.push(providerInjector.invoke(module));
                } else if (isArray(module)) {
                    runBlocks.push(providerInjector.invoke(module));
                } else {
                    assertArgFn(module, 'module');
                }
            } catch (e) {
                if (isArray(module)) {
                    module = module[module.length - 1];
                }
                if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
                    // Safari & FF's stack traces don't contain error.message content unlike those of Chrome and IE
                    // So if stack doesn't contain message, we create a new string that contains both.
                    // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
                    /* jshint -W022 */
                    e = e.message + '\n' + e.stack;
                }
                throw $injectorMinErr('modulerr', "Failed to instantiate module {0} due to:\n{1}",
                    module, e.stack || e.message || e);
            }
        });
        return runBlocks;
    }

    ////////////////////////////////////
    // internal Injector
    ////////////////////////////////////
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
}

if (require.main === module) {

    var g = require("../../global.js")
    g.extend(GLOBAL, g);

    var apis = require("../../apis.js")
    g.extend(GLOBAL, apis);

    var a = require("./annotate.js")
    g.extend(GLOBAL, a);

    var l = require("../loader.js");

    var $injectorMinErr = minErr('$injector');

    var angularModule = l.setupModuleLoader(GLOBAL);

    var modules = modules || [];
    var ngModule = angularModule('ng', [], function(){
        console.log("config ng");
    }).factory('f', function(){
        return 'F in ng';
    }).run(function(){
        console.log("Run ng");
    });

    modules.push("ng");
    modules.unshift(['$provide', function($provide) {
        $provide.constant('a', 'A');
        $provide.value('b', 'B');
        $provide.factory('c', function(b){
            return 'C(' + b + ')';
        });
        $provide.provider('d', function(){
            return {
                $get: function(c){
                   return 'D(' + c + ')';
                }
            }
        });
        $provide.service('e', function(d){
            this.value = "E(" + d + ")";
        });
    }]);

    modules.push(function($provide) {
        $provide.value({
            g: 'G'
        });
        $provide.decorator('f', function($delegate){
            return "Decorator[" + $delegate + "]";
        });
        $provide.provider({
            h: function(){
                this.$get = ['g', function(g){
                    return "h(" + g +  ")";
                }];
            }, i: function(){
                return {
                    $get: ['d', 'h', function(d, h){
                        return "h{" + d +  ", " + h +"}";
                    }]
                };
            }});
    });

    var injector = createInjector(modules);
    var func = function(a, b, c, d, e, f, g, h, i){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log(); },
        func2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', function(){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log();}],
        target = {name: 'james'},
        locals = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9};

    injector.invoke(func);
    injector.invoke(func2);

    injector.invoke(func, target);
    injector.invoke(func2, target);

    injector.invoke(func, target, locals);
    injector.invoke(func2, target, locals);


    var Hello = function(a, b, c, d, e, f, g, h){
        this.name = "Hello";
        console.log("arguments: [", [].join.apply(arguments, [", "]), "]");
        console.log("this: ", this);
        console.log();
    }

    var ret = injector.instantiate(Hello);
    console.log("ret: ", ret);

    var ret = injector.instantiate(Hello, locals);
    console.log("ret: ", ret);

    console.log();
    console.log(injector.get('a'));

    console.log(injector.annotate(Hello));

    console.log(injector.has("a"));
    console.log(injector.has("b"));
    console.log(injector.has("z"));
}

