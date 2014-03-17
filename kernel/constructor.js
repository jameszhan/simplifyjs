if (require.main === module) {
    require("./core.js");

    // 当改变constructor的prototype，对象的constructor也会相应地改变，
    // 对象的constructor一定等于其prototype的constructor。

    var Hello = function(){};
    var hello = new Hello();

    Hello.prototype = {};
    var hello2 = new Hello();

    function World(){}
    Hello.prototype = new World();
    var hello3 = new Hello();

    Object.traceObj("Hello", Hello);
    Object.traceObj("hello", hello);
    Object.traceObj("World", World);
    Object.traceObj("hello2", hello2);
    Object.traceObj("hello3", hello3);

    assertSame(hello.constructor, Hello);
    assertSame(hello2.constructor, Object);
    assertSame(hello3.constructor, World);

    var a = Object.beget(hello3);
    var b = Object.beget(a);
    assertSame(b.constructor, World);
    assertSame(a.constructor, World);

    ls();
}