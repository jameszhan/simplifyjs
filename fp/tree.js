if (require.main === module) {

    function empty(){
        return null;
    }

    function singleton(e){
        return {
            car: function(){ return e; },
            cdr: function(){ return null; }
        };
    }

    function car(list){
        return list.car();
    }

    function cdr(list) {
        return list.cdr();
    }

    function concat(list1, list2){
        if (null == list1) return list2;
        if (null == list2) return list1;
        return {
            car: function(){ return car(list1) },
            cdr: function(){ return concat(cdr(list1), list2) }
        }
    }


    function mkBinTreeItr(node){
        return {
            car: function() {
                return null != node.left ? car(mkBinTreeItr(node.left)) : node;
            },
            cdr: function() {
                var left_it = (null == node.left ? null : mkBinTreeItr(node.left));
                var root_it = singleton(node);
                var right_it = (null == node.right ? null : mkBinTreeItr(node.right));
                var it = concat(concat(left_it, root_it), right_it);
                return cdr(it)
            }
        };
    }


    var tree = {
        value : 1,
        left : {
            value : 2,
            left : { value : 4, left : null, right : null },
            right : null
        },
        right : {
            value : 3,
            left : null,
            right : { value : 7, left : null, right : null }
        }
    };


    for (var it = mkBinTreeItr(tree); null != it; it = cdr(it)) {
        console.log(car(it).value)
    }


}