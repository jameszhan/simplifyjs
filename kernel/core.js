(function(ns){
    'use strict';

    var lobby = {};

    if (typeof Object.objectId !== 'function') {
        Object.objectId = function(){
            var generateId = function(){
                var id = 0;
                return function(){
                    return id++;
                };
            }();
            return function(obj){
                if (obj != null) {
                    if (!obj.hasOwnProperty("__id")) {
                        obj.__id = generateId();
                    }
                    return obj.__id;
                } else {
                    return null;
                }
            };
        }();
    }

    if (typeof Object.beget !== 'function') {
        Object.beget = function(o){
            var F = function(){};
            F.prototype = o;
            return new F();
        };
    }

    if (typeof Object.objectName !== 'function') {
        Object.objectName = function(o){
            var id = Object.objectId(o);
            return lobby[id] || id;
        };
    }

    if (typeof Object.traceObj !== 'function') {
        Object.traceObj = function(name, obj){
            lobby[Object.objectId(obj)] = name;
        };
        Object.traceObj("lobby", lobby);
        Object.traceObj("Object", Object);
        Object.traceObj("Object.prototype", Object.prototype);
        Object.traceObj("Function", Function);
        Object.traceObj("Function.prototype", Function.prototype);
        Object.traceObj("Array", Array);
        Object.traceObj("Array.prototype", Array.prototype);
        Object.traceObj("RegExp", RegExp);
        Object.traceObj("RegExp.prototype", RegExp.prototype);
        Object.traceObj("String", String);
        Object.traceObj("String.prototype", String.prototype);
        Object.traceObj("Number", Number);
        Object.traceObj("Number.prototype", Number.prototype);
        Object.traceObj("Date", Date);
        Object.traceObj("Date.prototype", Date.prototype);
        Object.traceObj("Error", Error);
        Object.traceObj("Error.prototype", Error.prototype);
        Object.traceObj("Boolean", Boolean);
        Object.traceObj("Boolean.prototype", Boolean.prototype);
        Object.traceObj("Math", Math);
        Object.traceObj("Math.prototype", Math.prototype);
    }

    if (typeof Object.parents !== 'function') {
        Object.parents = function(obj){
            var parents = [];
            var parent = obj;
            do {
                parents.push(parent);
                parent = Object.getPrototypeOf(parent);
            } while(parent);
            return parents;
        };
    }

    ns.ls = function(){
        console.log(lobby);
    };

    ns.assertSame = function(actual, expect){
        var actualId = Object.objectId(actual), expectedId = Object.objectId(expect);
        if (actualId !== expectedId){
            throw new Error("expect: " + Object.objectName(expect) + ", but actual was: " + Object.objectName(actual));
        }
    };

})(GLOBAL);

