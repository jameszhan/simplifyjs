if (require.main === module) {

    var fac = function(f, n){
        return n <= 1 ? 1 : n * f(f, n - 1);
    };
    console.log(fac(fac, 5));

    // Currying it.
    var fac1 = function(f){
        return function(n) {
            return n <= 1 ? 1 : n * f(f)(n - 1);
        };
    };
    console.log(fac1(fac1)(5));

    // Pull f(f) out
    var fac2 = function(f) {
        return function(n) {
            var h = function(g){
                return n <= 1 ? 1 : n * g(n - 1);
            };
            return h(f(f));
        };
    };
    console.log(fac2(fac2)(5));

    // 可以看出h已经是fac函数的理想形式，不过它还包含自由变量n，没关系，我们可以把它先约束起来。
    var fac3 = function(f) {
        return function(n) {
            var h = function(g){
                return function(m){
                    return m <= 1 ? 1 : m * g(m - 1);
                };
            };
            return h(f(f))(n);
        };
    };
    console.log(fac3(fac3)(5));

    // 现在h中不包含任何自由变量，暂且把它移到外面来。
    var fac_gen = function(g){
        return function(m){
            return m <= 1 ? 1 : m * g(m - 1);
        };
    };
    var fac4 = function(f){
        return function(n) {
            return fac_gen(f(f))(n);
        };
    };
    console.log(fac4(fac4)(5));

    // 于是我们就得到了原始的fac_gen，也就是我们想要的不动点。这里，不动点是由fac4(fac4)得到的函数，因此我们可以写一个y函数来得它：
    var y = function(gen){
        return function(f){
            return function(n){
                return gen(f(f))(n);
            };
        };
    };
    var fac5 = y(fac_gen);
    console.log(fac5(fac5)(5));

    var fib_gen = function(f){
        return function(n){
            return n <= 2 ? 1 : f(n - 1) + f(n - 2);
        };
    };

    var i = 0;
    while (i++ < 10) {
        console.log("fib", i, y(fib_gen)(y(fib_gen))(i));
        console.log("fac", i, y(fac_gen)(y(fac_gen))(i));
    }

    // fac5(fac5)形式有点多余，我们可以更简练些。
    var y1 = function(gen) {
        var g = function(f) {
            return function(n){
                return gen(f(f))(n);
            };
        };
        return g(g);
    };

    console.log(y1(fac_gen)(5));

    // 更常规的写法
    var Y = function(gen){
        return (function(g){
            return g(g);
        })(function(f){
            return function(n){
                return gen(f(f))(n);
            };
        });
    };
    console.log(Y(fac_gen)(5));
    // Y() 将返回任何高阶函数的不动点
    console.log(Y(function(f){
        return function(n){
            return n <= 2 ? 1 : f(n - 1) + f(n - 2);
        };
    })(6));
}