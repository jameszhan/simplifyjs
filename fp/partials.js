(function(ns){
    var aps = Array.prototype.slice;

    function partial(fn /*, args...*/) {
        var args = aps.call(arguments, 1);
        return function() {
            return fn.apply(this, args.concat(aps.call(arguments)));
        };
    }

    function partialRight(fn /*, args...*/) {
        var args = aps.call(arguments, 1);
        return function() {
            return fn.apply(this, aps.call(arguments).concat(args));
        };
    }

    function curry(/* n,*/ fn /*, args...*/) {
        var n, orig_args = aps.call(arguments, 1);

        if (typeof fn === 'number') {
            n = fn;
            fn = orig_args.shift();
        } else {
            n = fn.length;
        }

        return function() {
            var args = orig_args.concat(aps.call(arguments));
            return args.length < n ? curry.apply(this, [n, fn].concat(args)) : fn.apply(this, args);
        };
    }

    ns.curry = curry;
    ns.partial = partial;
    ns.partialRight = partialRight;
})(GLOBAL);


if (require.main === module) {
    function func() {
        return arguments;
    }

    var func1 = partial(func, 3, 5, 7);
    var func2 = partial(func1, 6, 8, 1);
    var func3 = partial(func2, 9);

    console.log(func3());

    var add = curry(function(a, b, c) {
        return a + b + c;
    });
    var add1 = add(1);
    console.log(add1.toString());
    var add2 = add1(2);
    console.log(add2.toString());
    var add3 = add2(3);
    console.log(add3);

    /*
    var eq3 = partial(eq, 3);
    var eq3 = partialRight(eq, 3);
    console.log(eq3(3));
    console.log(eq3(5));
    */
}