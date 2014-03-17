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
        var str = "", i = 0, parents = Object.parents(o);
        for(; i < parents.length; i++) {
            if(i > 0) {
                str += " -> "
            }
            str += Object.objectName(parents[i]);
        }
        console.log(str);
    }

}







