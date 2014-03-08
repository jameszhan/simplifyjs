if (require.main === module) {

    var Hello = function(){
        this.name = 'doHello';
        return {
            hello: 'world'
        };
    };

    var Hello2 = function(){
        this.name = 'doHello';
        this.hello = "world";
    };

    var h1 = new Hello();
    var h2 = new Hello2();

    console.log(h1.hello === 'world');
    console.log(h1.name === undefined);
    console.log(h2.name === 'doHello');
    console.log(h2.hello === 'doHello');
}
