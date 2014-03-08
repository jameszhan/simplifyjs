'use strict';
var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;

var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};
var manualUppercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};

if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}


var slice             = [].slice,
    push              = [].push,
    toString          = Object.prototype.toString,
    globalMinErr      = minErr('global'),
    uid               = ['0', '0', '0'];

function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}


function reverseParams(iteratorFn) {
    return function(value, key) { iteratorFn(key, value); };
}

function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
}

function setHashKey(obj, h) {
    if (h) {
        obj.$$hashKey = h;
    }
    else {
        delete obj.$$hashKey;
    }
}

function extend(dst) {
    var h = dst.$$hashKey;
    forEach(arguments, function(obj){
        if (obj !== dst) {
            forEach(obj, function(value, key){
                dst[key] = value;
            });
        }
    });

    setHashKey(dst,h);
    return dst;
}

function int(str) {
    return parseInt(str, 10);
}


function inherit(parent, extra) {
    return extend(new (extend(function() {}, {prototype:parent}))(), extra);
}

function noop() {}
noop.$inject = [];

function identity($) {return $;}
identity.$inject = [];


function valueFn(value) {return function() {return value;};}

function isUndefined(value){return typeof value === 'undefined';}

function isDefined(value){return typeof value !== 'undefined';}

function isObject(value){return value != null && typeof value === 'object';}

function isString(value){return typeof value === 'string';}

function isNumber(value){return typeof value === 'number';}

function isDate(value){return toString.call(value) === '[object Date]';}

function isArray(value) {return toString.call(value) === '[object Array]';}

function isFunction(value){return typeof value === 'function';}

function isRegExp(value) {return toString.call(value) === '[object RegExp]';}

function isWindow(obj) {return obj && obj.document && obj.location && obj.alert && obj.setInterval;}

function isScope(obj) {return obj && obj.$evalAsync && obj.$watch;}

function isFile(obj) {return toString.call(obj) === '[object File]';}

function isBoolean(value) {return typeof value === 'boolean';}

var trim = (function() {
    if (!String.prototype.trim) {
        return function(value) {
            return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return isString(value) ? value.trim() : value;
    };
})();


function isElement(node) {
    return !!(node &&
        (node.nodeName  // we are a direct element
            || (node.prop && node.attr && node.find)));  // we have an on and find method part of jQuery API
}

function makeMap(str){
    var obj = {}, items = str.split(","), i;
    for ( i = 0; i < items.length; i++ )
        obj[ items[i] ] = true;
    return obj;
}

function map(obj, iterator, context) {
    var results = [];
    forEach(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
}

function size(obj, ownPropsOnly) {
    var count = 0, key;

    if (isArray(obj) || isString(obj)) {
        return obj.length;
    } else if (isObject(obj)){
        for (key in obj)
            if (!ownPropsOnly || obj.hasOwnProperty(key))
                count++;
    }

    return count;
}


function includes(array, obj) {
    return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}

function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
        array.splice(index, 1);
    return value;
}

function isLeafNode (node) {
    if (node) {
        switch (node.nodeName) {
            case "OPTION":
            case "PRE":
            case "TITLE":
                return true;
        }
    }
    return false;
}

function copy(source, destination){
    if (isWindow(source) || isScope(source)) {
        throw ngMinErr('cpws',
            "Can't copy! Making copies of Window or Scope instances is not supported.");
    }

    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, []);
            } else if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isRegExp(source)) {
                destination = new RegExp(source.source);
            } else if (isObject(source)) {
                destination = copy(source, {});
            }
        }
    } else {
        if (source === destination) throw ngMinErr('cpi',
            "Can't copy! Source and destination are identical.");
        if (isArray(source)) {
            destination.length = 0;
            for ( var i = 0; i < source.length; i++) {
                destination.push(copy(source[i]));
            }
        } else {
            var h = destination.$$hashKey;
            forEach(destination, function(value, key){
                delete destination[key];
            });
            for ( var key in source) {
                destination[key] = copy(source[key]);
            }
            setHashKey(destination,h);
        }
    }
    return destination;
}

function shallowCopy(src, dst) {
    dst = dst || {};

    for(var key in src) {
        // shallowCopy is only ever called by $compile nodeLinkFn, which has control over src
        // so we don't need to worry about using our custom hasOwnProperty here
        if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
            dst[key] = src[key];
        }
    }

    return dst;
}

function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
        if (t1 == 'object') {
            if (isArray(o1)) {
                if (!isArray(o2)) return false;
                if ((length = o1.length) == o2.length) {
                    for(key=0; key<length; key++) {
                        if (!equals(o1[key], o2[key])) return false;
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() == o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() == o2.toString();
            } else {
                if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                keySet = {};
                for(key in o1) {
                    if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                    if (!equals(o1[key], o2[key])) return false;
                    keySet[key] = true;
                }
                for(key in o2) {
                    if (!keySet.hasOwnProperty(key) &&
                        key.charAt(0) !== '$' &&
                        o2[key] !== undefined &&
                        !isFunction(o2[key])) return false;
                }
                return true;
            }
        }
    }
    return false;
}

function concat(array1, array2, index) {
    return array1.concat(slice.call(array2, index));
}

function sliceArgs(args, startIndex) {
    return slice.call(args, startIndex || 0);
}

/* jshint +W101 */
function bind(self, fn) {
    var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
    if (isFunction(fn) && !(fn instanceof RegExp)) {
        return curryArgs.length ? function() {
            return arguments.length ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0))) : fn.apply(self, curryArgs);
        } : function() {
            return arguments.length ? fn.apply(self, arguments) : fn.call(self);
        };
    } else {
        // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
        return fn;
    }
}


function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}

function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}

function fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
}


function toBoolean(value) {
    if (typeof value === 'function') {
        value = true;
    } else if (value && value.length !== 0) {
        var v = lowercase("" + value);
        value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
    } else {
        value = false;
    }
    return value;
}

function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch(e) {
        // Ignore any invalid uri component
    }
}

function parseKeyValue(/**string*/keyValue) {
    var obj = {}, key_value, key;
    forEach((keyValue || "").split('&'), function(keyValue){
        if ( keyValue ) {
            key_value = keyValue.split('=');
            key = tryDecodeURIComponent(key_value[0]);
            if ( isDefined(key) ) {
                var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                if (!obj[key]) {
                    obj[key] = val;
                } else if(isArray(obj[key])) {
                    obj[key].push(val);
                } else {
                    obj[key] = [obj[key],val];
                }
            }
        }
    });
    return obj;
}

function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function(value, key) {
        if (isArray(value)) {
            forEach(value, function(arrayValue) {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            });
        } else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
    });
    return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


var SNAKE_CASE_REGEXP = /[A-Z]/g;
function snake_case(name, separator){
    separator = separator || '_';
    return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
        return (pos ? separator : '') + letter.toLowerCase();
    });
}

function assertArg(arg, name, reason) {
    if (!arg) {
        throw globalMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
    }
    return arg;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
        arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
        (arg && typeof arg == 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
}

function assertNotHasOwnProperty(name, context) {
    if (name === 'hasOwnProperty') {
        throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
    }
}


function minErr(module) {
    return function () {
        var code = arguments[0],
            prefix = '[' + (module ? module + ':' : '') + code + '] ',
            template = arguments[1],
            templateArgs = arguments,
            stringify = function (obj) {
                if (typeof obj === 'function') {
                    return obj.toString().replace(/ \{[\s\S]*$/, '');
                } else if (typeof obj === 'undefined') {
                    return 'undefined';
                } else if (typeof obj !== 'string') {
                    return JSON.stringify(obj);
                }
                return obj;
            },
            message, i;

        message = prefix + template.replace(/\{\d+\}/g, function (match) {
            var index = +match.slice(1, -1), arg;

            if (index + 2 < templateArgs.length) {
                arg = templateArgs[index + 2];
                if (typeof arg === 'function') {
                    return arg.toString().replace(/ ?\{[\s\S]*$/, '');
                } else if (typeof arg === 'undefined') {
                    return 'undefined';
                } else if (typeof arg !== 'string') {
                    return toJson(arg);
                }
                return arg;
            }
            return match;
        });

        message = message + '\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/' +
            (module ? module + '/' : '') + code;
        for (i = 2; i < arguments.length; i++) {
            message = message + (i == 2 ? '?' : '&') + 'p' + (i-2) + '=' +
                encodeURIComponent(stringify(arguments[i]));
        }

        return new Error(message);
    };
}

extend(exports, {
    'copy': copy,
    'extend': extend,
    'equals': equals,
    'forEach': forEach,
    'reverseParams': reverseParams,
    'noop':noop,
    'bind':bind,
    'valueFn': valueFn,
    'toJson': toJson,
    'fromJson': fromJson,
    'identity':identity,
    'isUndefined': isUndefined,
    'isDefined': isDefined,
    'isString': isString,
    'isFunction': isFunction,
    'isObject': isObject,
    'isNumber': isNumber,
    'isElement': isElement,
    'isArray': isArray,
    'isDate': isDate,
    'lowercase': lowercase,
    'uppercase': uppercase,
    'nextUid': nextUid,
    'callbacks': {counter: 0},
    'minErr': minErr,
    'assertArgFn': assertArgFn,
    'assertArg': assertArg,
    'assertNotHasOwnProperty': assertNotHasOwnProperty
});

