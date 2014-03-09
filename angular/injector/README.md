# 抽茧剥丝——AngularJS Injector 分析

##常用函数说明

在开始分析之前我们需要了解下一些基本扩展，详细定义查看[global.js](https://github.com/jameszhan/simplifyjs/blob/master/global.js)，有兴趣的朋友可以细看他们的实现，这里简单说明下我们分析中需要用到的函数。

对象类型的判断，包括**isUndefined**, **isDefined**, **isObject**, **isString**, **isNumber**, **isDate**, **isArray**, **isFunction**, **isRegExp**, **isBoolean**等

**forEach** 对each的扩展，可以处理多种不同类型的数据遍历，处理函数可以绑定到不同的context上进行处理。

~~~js

	var values = {name: 'misko', gender: 'male'};
	var log = [];
	forEach(values, function(value, key){
		this.push(key + ': ' + value);
	}, log);
	
	expect(log).toEqual(['name: misko', 'gender: male']);
~~~


**extend** 复制（多个）源对象属性到目标对象。

**minErr** 用于创建不同模块的错误类型

**assertArgFn** 判断当前参数是不是一个函数，否则抛出错误

**assertArg** 确保参数有定义，否则抛出错误

**assertNotHasOwnProperty** 确定当前参数不等于hasOwnProperty


##annotate函数
annotate用于解析函数定义，并剥离出其依赖的参数列表。[annotate.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/injector/annotate.js)

~~~js

expect(annotate(function(a, b, c){})).toEqual(['a', 'b', 'c']);
expect(annotate(['a', 'b', 'c', function(a, b, c){}]));

~~~

##invoke函数
invoke函数用于动态执行函数，并自动注入参数，如果locals定义，则优先从locals中取，否则从getService中取。[invoke.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/injector/invoke.js)

~~~js

    var getService = function mockedService(serviceName) {
        return "Mocked Value";
    }

    var func = function(a, b, c){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log(); },
        target = {name: 'james'},
        locals = {a: 1, b: 2, c: 3};

    invoke(func);
    //Outputs:
    //arguments: [ Mocked Value, Mocked Value, Mocked Value ]
	//this:  undefined

    invoke(func, target);
    //Outputs:
    //arguments: [ Mocked Value, Mocked Value, Mocked Value ]
	//this:  { name: 'james' }

    invoke(func, target, locals);
    //Outputs:
    //arguments: [ 1, 2, 3 ]
	//this:  { name: 'james' }

    invoke(function(){
        func.apply(this, arguments);
    }, target, locals);
    //Outputs:
    //arguments: [  ]
	//this:  { name: 'james' }
~~~


##createInternalInjector
createInternalInjector是invoke的增强版，实现了getService方法，加入了cache机制，并可以检测循环依赖，优先从cache中取值，如果cache中没有，则最终取值还需要依赖于外部传入的factory方法。[internal_injector.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/injector/internal_injector.js)

值得一提的是，instantiate方法是createInternalInjector另一个增强点，创建一个Type实例，并把Type函数绑定到该实例上执行，如果Type函数返回的是函数或者对象，则返回该结果，否则返回该实例。


~~~js

	var injector = createInternalInjector({}, function(serviceName){
        return "Found: " + serviceName;
    });

    var func = function(a, b, c){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log(); },
        target = {name: 'james'},
        locals = {a: 1, b: 2, c: 3};

    injector.invoke(func);
    //Outputs:
    //arguments: [ Found: a, Found: b, Found: c ]
	//this:  undefined

    injector.invoke(func, target);
    //Outputs:
    //arguments: [ Found: a, Found: b, Found: c ]
	//this:  { name: 'james' }

    injector.invoke(func, target, locals);
    //Outputs:
    //arguments: [ 1, 2, 3 ]
	//this:  { name: 'james' }

    var Hello = function(a, b, c){
        this.name = "Hello";
        console.log("arguments: [", [].join.apply(arguments, [", "]), "]");
        console.log("this: ", this);
    }

    var ret = injector.instantiate(Hello);
    //Outputs:
    //arguments: [ Found: a, Found: b, Found: c ]
	//this:  { name: 'Hello' }	
    console.log("ret:", ret); //Output: "ret: { name: 'Hello' }"    

    var ret = injector.instantiate(Hello, locals);
	//Outputs:
    //arguments: [ 1, 2, 3 ]
	//this:  { name: 'Hello' }
    console.log("ret:", ret); //Output: "ret: { name: 'Hello' }"

    console.log(injector.get('a')); // Output: "Found: a"

    console.log(injector.annotate(Hello)); //Output: "[ 'a', 'b', 'c' ]"

    console.log(injector.has("a")); //Output: true
    console.log(injector.has("b")); //Output: true
    console.log(injector.has("g")); //Output: false
    
~~~


##完整版injector实现
经过上述的铺垫，整个injector的实现已经呼之欲出了，injector创建了2个internalInjector，一个用于管理provider(providerInjector)，一个用于管理instance（instanceInjector），最终返回instanceInjector。[injector.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/injector/injector.js)

###providerInjector
创建providerInjector，factory总是返回失败，也就是说，当要使用某provider依赖时，必须先往providerCache中注入它。默认情况下，providerCache中已经添加了$provide，它含有provider，factory，service，value，constant，decorator实现，用于支持不同类型的provider创建。
####provider
provider的默认实现，value，factory，service都依赖于它。它用于创建一个provider实例，其必须包含一个$get方法，用于返回需要注入的实例。
####factory
根据传入的函数快速创建provider实例。
####service
根据传入的构造函数创建service实例，并通过factory创建provider实例。
####value
根据valueFn通过factory创建provider实例。
####constant
不创建provider，直接更新providerCache和instanceCache。
####decorator
创建provider的decorator。

###instanceInjector
要获取实例，先需要获取实例的provider，再调用instanceInjector调用provider.$get方法得到实例。

###loadModules

1. 如果当前module是function或者是array，则调用providerInjector.invoke执行它们。
2. 如果是module是string，则需要调用angularModule得到当前的module.[loader.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/loader.js)实现了angular.module方法。一般我们在加载string module之前的先需要调用angular.module方法初始化该模块。值得注意的是，angular.module在调用的时候，其中定义的方法都是延迟执行的，而要到createInjector时也就是loadModules时执行。


~~~js

	var l = require("../loader.js");
 	
    var angularModule = l.setupModuleLoader(GLOBAL);

	//请注意看以下不同的provider注入方式
    var modules = modules || [];
    var ngModule = angularModule('ng', [], function(){
        console.log("config ng");
    }).factory('f', function(){
        return 'F in ng';
    }).run(function(){
        console.log("Run ng");
    });

    modules.push("ng");
    modules.unshift(['$provide', function($provide) {
        $provide.constant('a', 'A');
        $provide.value('b', 'B');
        $provide.factory('c', function(b){
            return 'C(' + b + ')';
        });
        $provide.provider('d', function(){
            return {
                $get: function(c){
                   return 'D(' + c + ')';
                }
            }
        });
        $provide.service('e', function(d){
            this.value = "E(" + d + ")";
        });
    }]);

    modules.push(function($provide) {
        $provide.value({
            g: 'G'
        });
        $provide.decorator('f', function($delegate){
            return "Decorator[" + $delegate + "]";
        });
        $provide.provider({
            h: function(){
                this.$get = ['g', function(g){
                    return "h(" + g +  ")";
                }];
            }, i: function(){
                return {
                    $get: ['d', 'h', function(d, h){
                        return "h{" + d +  ", " + h +"}";
                    }]
                };
            }});
    });

    var injector = createInjector(modules);
    //Outputs:
    //config ng
	//Run ng
	
    var func = function(a, b, c, d, e, f, g, h, i){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log(); },
        func2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', function(){
            console.log("arguments: [", [].join.call(arguments, ", "), "]");
            console.log("this: ", this);
            console.log();}],
        target = {name: 'james'},
        locals = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9};

	//E 是service注入的，是一个对象，故显示为[object Object]
    injector.invoke(func);
    //Outputs:
    //arguments: [ A, B, C(B), D(C(B)), [object Object], Decorator[F in ng], G, h(G), h{D(C(B)), h(G)} ]
	//this:  undefined
	
    injector.invoke(func2);
    //Outputs:
    //arguments: [ A, B, C(B), D(C(B)), [object Object], Decorator[F in ng], G, h(G), h{D(C(B)), h(G)} ]
	//this:  undefined

    injector.invoke(func, target);
    //Outputs:
    //arguments: [ A, B, C(B), D(C(B)), [object Object], Decorator[F in ng], G, h(G), h{D(C(B)), h(G)} ]
	//this:  { name: 'james' }
	
    injector.invoke(func2, target);
    //Outputs:
    //arguments: [ A, B, C(B), D(C(B)), [object Object], Decorator[F in ng], G, h(G), h{D(C(B)), h(G)} ]
	//this:  { name: 'james' }

    injector.invoke(func, target, locals);
    //Outputs:
    //arguments: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	//this:  { name: 'james' }
	
    injector.invoke(func2, target, locals);
	//Outputs:
	//arguments: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
	//this:  { name: 'james' }

    var Hello = function(a, b, c, d, e, f, g, h){
        this.name = "Hello";
        console.log("arguments: [", [].join.apply(arguments, [", "]), "]");
        console.log("this: ", this);
        console.log();
    }

    var ret = injector.instantiate(Hello);
    //Outputs:
    //arguments: [ A, B, C(B), D(C(B)), [object Object], Decorator[F in ng], G, h(G) ]
	//this:  { name: 'Hello' }
    console.log("ret: " + ret); //Output: "ret:  { name: 'Hello' }"

    var ret = injector.instantiate(Hello, locals);
    //Outputs:
    //arguments: [ 1, 2, 3, 4, 5, 6, 7, 8 ]
	//this:  { name: 'Hello' }
    console.log("ret: " + ret); //Output: "ret:  { name: 'Hello' }"

    console.log(injector.get('a')); //Output: 'A'

    console.log(injector.annotate(Hello)); //Output: "[ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ]"

    console.log(injector.has("a")); //Output: true
    console.log(injector.has("b")); //Output: true
    console.log(injector.has("z")); //Output: false

~~~






