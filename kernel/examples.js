if (require.main === module) {
    require("./core.js");

    var Vehicle = {
        start: function(){
            console.log("Start " + Object.objectName(this));
        },
        stop: function(){
            console.log("Stop " + Object.objectName(this));
        }
    };

    var Car = Object.beget(Vehicle);
    Car.tweet = function(){
        console.log(Object.objectName(this) + " tweet");
    };

    var myCar = Object.beget(Car);
    Object.traceObj('myCar', myCar);
    myCar.start();
    myCar.tweet();
    myCar.stop();
}