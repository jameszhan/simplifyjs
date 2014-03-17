if (require.main === module) {
    require("./core.js");

    display(Function);
    display(Object);
    display(Array);
    display(Number);
    display(Error);
    display(String);
    display(Date);
    display(RegExp);

    display(Function.prototype);
    display(Object.prototype);
    display(Array.prototype);
    display(Number.prototype);
    display(Error.prototype);
    display(String.prototype);
    display(Date.prototype);
    display(RegExp.prototype);


    function display(o){
        console.log(Object.parents(o).map(function(e){return Object.objectName(e);}).join(" -> "));
    }

}







