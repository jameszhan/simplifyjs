if (require.main === module) {

    function counter(n) {
        return {
            get count(){return n++;},
            set count(m) {n = m;}
        }
    }

    var c = counter(3);
    console.log(c.count);
    console.log(c.count);
    c.count = 100;
    console.log(c.count);
    console.log(c.count);
    console.log(c.count);
}
