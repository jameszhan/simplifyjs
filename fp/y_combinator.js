if (require.main === module) {
    function Y(gen) {
        return (function(g) {
            return g(g);
        })(function(f) {
            return gen(function(args) {
                return f(f)(args);
            });
        });
    }

    var factorial = Y(function (fac) {
        return function (n) {
            return n <= 2 ? n : n * fac(n - 1);
        };
    });

    console.log(factorial(5));


    function y(gen) {
        return (function(g) {
            return g(g);
        })(function(f) {
            return function(args){
                return gen(f(f))(args);
            };
        });
    }

    var fact = y(function (fac) {
        return function (n) {
            return n <= 2 ? n : n * fac(n - 1);
        };
    });

    console.log(fact(5));
}