fmd('module', ['global', 'env', 'cache', 'lang', 'event'], function(global, env, cache, lang, event){
    'use strict';

    var EMPTY_ID = '',
        EMPTY_DEPS = [],
        ANONYMOUS_PREFIX = '_!_fmd_anonymous_',
        UNDEFINED;

    var anonymousUid = 0;
    var modulesCache = cache.modules = {};

    var keyModules = {
        'require': function(mod){
            mod.require || Module.makeRequire(mod);
            mod.require || Module.makeRequire(mod);
            event.emit('makeRequire', mod.require, mod);
            return mod.require;
        },
        'exports': function(mod){
            return mod.exports;
        },
        'module': function(mod){
            mod.module = {
                id: mod.id,
                exports: mod.exports
            };
            return mod.module;
        }
    };

    var Module = function(id, deps, factory){
        var mod = this;
        mod.id = id;
        mod.deps = deps || [];
        mod.factory = factory;
        mod.exports = {};

        if (mod.unnamed()){
            id = ANONYMOUS_PREFIX + anonymousUid;
            anonymousUid++;
        }
        mod.uid = id;
    };


    Module.prototype = {
        unnamed: function(){
            return this.id === EMPTY_ID;
        },

        extract: function(){
            var mod = this,
                deps = mod.deps,
                list = [];

            if (lang.isArray(deps)){
                lang.forEach(deps, function(id){
                    var mid, hook;
                    if (hook = keyModules[id]){
                        mid = hook( mod );
                    } else {
                        mod.require || Module.makeRequire(mod);
                        mid = mod.require(id);
                    }

                    list.push(mid);
                } );
            }

            return list;
        },

        compile: function(){
            var mod = this;
            try {
                if (lang.isFunction(mod.factory)){
                    var deps = mod.extract(),
                        exports = mod.factory.apply(null, deps);

                    if (exports !== UNDEFINED){
                        mod.exports = exports;
                    } else {
                        mod.module && mod.module.exports && (mod.exports = mod.module.exports);
                    }

                    mod.module && (delete mod.module);

                } else if (mod.factory !== UNDEFINED) {
                    mod.exports = mod.factory;
                }

                event.emit('compiled', mod);
            } catch (ex){
                event.emit('compileFailed', ex, mod);
            }
        },

        autocompile: function(){
            this.unnamed() && this.compile();
        }
    };


    Module.get = function(id){
        return modulesCache[id];
    };

    Module.has = function(id, deep){
        if (keyModules[id]){
            return true;
        }

        var meta = {id: id};
        deep && event.emit('alias', meta);

        return modulesCache[meta.id] ? true : false;
    };

    Module.save = function( mod ){
        modulesCache[mod.uid] = mod;
        event.emit('saved', mod);
        mod.autocompile();
    };

    Module.require = function(id){
        var mod = Module.get(id);

        if (!mod){
            event.emit('requireFailed', {id: id});
            return null;
        }

        if (!mod.compiled){
            mod.compiled = true;
            mod.compile();
        }

        event.emit('required', mod);

        return mod.exports;
    };

    Module.makeRequire = function(mod){
        mod.require = function(id){
            var meta = {id: id};
            event.emit('relative', meta, mod);
            event.emit('alias', meta);

            return Module.require(meta.id);
        };
    };

    Module.define = function(id, deps, factory){
        var argsLength = arguments.length;

        if (argsLength === 1){
            factory = id;
            id = EMPTY_ID;
        } else if (argsLength === 2){
            factory = deps;
            deps = EMPTY_DEPS;
            if (!lang.isString(id)){
                deps = id;
                id = EMPTY_ID;
            }
        }

        if (Module.has(id, true)){
            event.emit('existed', {id: id});
            return null;
        }

        Module.save(new Module(id, deps, factory));
    };

        /* sign for FMD */
        Module.define.fmd = {};

        /* exports API to fmd */
        var originalDefine = global.define;

        env.noConflict = function(){
            global.define = originalDefine;
        };

        env.define = global.define = Module.define;


        return Module;

    } );
