function bootstrap(global){
    'use strict';

    function ensure(obj, name, factory) {
        return obj[name] || (obj[name] = factory());
    }

    var fmd = ensure(global, 'fmd', function(){
        var partsCache = {},
            parts = [];

        var require = function(id){
            return partsCache[id];
        }, fmd = function(id, deps, factory){
            if (partsCache[id]){
                return;
            }
            if (!factory){
                factory = deps;
                deps = [];
            }
            if ('function' === typeof factory){
                var args = [];
                for (var i = 0, l = deps.length; i < l; i++){
                    args.push(require(deps[i]));
                }
                factory = factory.apply(null, args);
            }
            partsCache[id] = factory || 1;
            parts.push(id);
        };

        fmd.version = '1.0.0';
        fmd.cache = {
            parts: parts
        };

        fmd('global', global);
        fmd('require', function(){
            return require;
        });

        fmd('env', function(){
            return fmd;
        });

        fmd('cache', function(){
            return fmd.cache;
        });

        return fmd;
    });

    ensure(fmd, 'ensure', function(){
        return ensure;
    });
}

bootstrap(GLOBAL);