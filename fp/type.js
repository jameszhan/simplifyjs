if (require.main === module) {
    function mkPair(x, y) {
        return {
            left: function(){
                return x;
            },
            right: function(){
                return y;
            }
        };
    }

    var pair = mkPair(1, 2);
    console.log(pair.left());
    console.log(pair.right());

    function push(stack, x){
        return {
            top: function(){
                return x;
            },
            pop: function(){
                return stack;
            }
        }
    }
    function top(stack) {
        return stack.top();
    }
    function pop(stack) {
        return stack.pop();
    }

    var stack = push(null, 1);
    stack = push(stack, 2);
    stack = push(stack, 3);

    console.log(top(stack));
    stack =pop(stack);
    console.log(top(stack));
    stack = push(stack, 5);
    console.log(top(stack));
    stack = pop(stack);
    console.log(top(stack));
    stack = pop(stack);
    console.log(top(stack));
}