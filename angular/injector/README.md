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
createInternalInjector是invoke的增强版，实现了getService方法，加入了cache机制，并可以检测循环依赖，不过最终取值还需要依赖于外部传入的factory方法。[internal_injector.js](https://github.com/jameszhan/simplifyjs/blob/master/angular/injector/internal_injector.js)

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





