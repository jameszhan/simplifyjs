if (require.main === module) {
    require("./core.js");

    var a = {};
    var b = Object.beget(a);
    var c = Object.beget(b);
    var d = Object.beget(c);
    var e = Object.beget(d);
    var f = Object.beget(c);

    display(a, "a");
    display(b, "b");
    display(c, "c");
    display(d, "d");
    display(e, "e");
    display(f, "f");

    function display2(o, name){
        Object.traceObj(name, o);
        var proto = Object.getPrototypeOf(o);
        console.log("\nprint: ", name);
        var str = Object.objectName(o);
        do {
            str += " -> " + Object.objectName(proto);
            proto = Object.getPrototypeOf(proto);
        } while(proto);
        console.log(str);
    }

    function display(o, name){
        Object.traceObj(name, o);
        console.log("\nprint: ", name);
        var str = "", parents = Object.parents(o);
        str += parents.map(function(e){
            return Object.objectName(e);
        }).join(" -> ");
        console.log(str);
    }

    var Hello = function(){};
    var hello = new Hello();

    var arr = [];
    display(arr, "arr");

    var regexp = /.+/gi;
    display(regexp, "regexp");

    var date = new Date();
    display(date, "date");

    var func = function(){};
    display(func, "func");

    var str = new String("aaa");
    display(str, "str");

    var num = new Number("aaa");
    display(num, "num");


    Object.traceObj("Hello", Hello);
    Object.traceObj("Hello.prototype", Hello.prototype);
    Object.traceObj("hello", hello);

    display(Hello, "Hello");
    display(hello, "hello");
}







