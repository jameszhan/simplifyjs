require("./boot.js")

fmd('event', ['env','cache'], function(env, cache){
    'use strict';

    var eventsCache = cache.events = {},
        slice = [].slice;

    var event = {
        on: function(name, callback){
            var list = eventsCache[name] || (eventsCache[name] = []);
            list.push(callback);
        },

        emit: function(name){
            var args = slice.call(arguments, 1),
                list = eventsCache[name],
                fn, i = 0;

            if (list){
                while ((fn = list[i++])){
                    fn.apply(null, args);
                }
            }
        },

        off: function(name, callback){
            var list = eventsCache[name];
            if (list){
                if (callback){
                    for (var i = list.length - 1; i >= 0; i--){
                        (list[i] === callback ) && list.splice(i, 1);
                    }
                } else {
                    delete eventsCache[name];
                }
            }
        }
    };

    /* exports API to fmd */
    env.on = event.on;
    env.off = event.off;

    return event;
});
if (require.main === module) {
    fmd('test', ['event'], function(event){
        event.on('start', function(){
            console.log("Startup!");
        });
        event.emit('start');
    });

}


