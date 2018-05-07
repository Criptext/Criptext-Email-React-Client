/*
 * vim: ts=4:sw=4
 */

var util = (function() {
    'use strict';

    var StaticArrayBufferProto = new ArrayBuffer().__proto__;
    var StaticArrayBufferProto = new ArrayBuffer().__proto__;
    var StaticUint8ArrayProto = new Uint8Array().__proto__;

    function getString(thing) {
        if (thing === Object(thing)) {
            if (thing.__proto__ == StaticUint8ArrayProto)
                return String.fromCharCode.apply(null, thing);
            if (thing.__proto__ == StaticArrayBufferProto)
                return getString(new Uint8Array(thing));
            if (thing.__proto__ == StaticByteBufferProto)
                return thing.toString("binary");
        }
        return thing;
    }

    function getStringable(thing) {
        return (typeof thing == "string" || typeof thing == "number" || typeof thing == "boolean" ||
                (thing === Object(thing) &&
                    (thing.__proto__ == StaticArrayBufferProto ||
                    thing.__proto__ == StaticUint8ArrayProto ||
                    thing.__proto__ == StaticByteBufferProto)));
    }

    function ensureStringed(thing) {
        if (getStringable(thing))
            return getString(thing);
        else if (thing instanceof Array) {
            var res = [];
            for (var i = 0; i < thing.length; i++)
                res[i] = ensureStringed(thing[i]);
            return res;
        } else if (thing === Object(thing)) {
            var res = {};
            for (var key in thing)
                res[key] = ensureStringed(thing[key]);
            return res;
        } else if (thing === null) {
            return null;
        }
        throw new Error("unsure of how to jsonify object of type " + typeof thing);
    }

    return {
        toString: function(thing) {
            if (typeof thing == 'string') {
                return thing;
            }
            return new dcodeIO.ByteBuffer.wrap(thing).toString('binary');
        },
        toArrayBuffer: function(thing) {
            if (thing === undefined) {
                return undefined;
            }
            if (thing === Object(thing)) {
                if (thing.__proto__ == StaticArrayBufferProto) {
                    return thing;
                }
            }

            var str;
            if (typeof thing == "string") {
                str = thing;
            } else {
                throw new Error("Tried to convert a non-string of type " + typeof thing + " to an array buffer");
            }
            return new dcodeIO.ByteBuffer.wrap(thing, 'binary').toArrayBuffer();
        },
        isEqual: function(a, b) {
            // TODO: Special-case arraybuffers, etc
            if (a === undefined || b === undefined) {
                return false;
            }
            a = util.toString(a);
            b = util.toString(b);
            var maxLength = Math.max(a.length, b.length);
            if (maxLength < 5) {
                throw new Error("a/b compare too short");
            }
            return a.substring(0, Math.min(maxLength, a.length)) == b.substring(0, Math.min(maxLength, b.length));
        },
        equalArrayBuffers: function(ab1, ab2) {
            if (!(ab1 instanceof ArrayBuffer && ab2 instanceof ArrayBuffer)) {
                return false;
            }
            if (ab1.byteLength !== ab2.byteLength) {
                return false;
            }
            var result = 0;
            var ta1 = new Uint8Array(ab1);
            var ta2 = new Uint8Array(ab2);
            for (var i = 0; i < ab1.byteLength; ++i) {
                result = result | ta1[i] ^ ta2[i];
            }
            return result === 0;
        },
        toBase64: function(thing) {
            if (typeof thing == 'string') {
                return thing;
            }
            return new dcodeIO.ByteBuffer.wrap(thing).toBase64();
        },
        toArrayBufferFromBase64: function(thing) {
            if (thing === undefined) {
                return undefined;
            }
            if (thing === Object(thing)) {
                if (thing.__proto__ == StaticArrayBufferProto) {
                    return thing;
                }
            }

            var str;
            if (typeof thing == "string") {
                str = thing;
            } else {
                throw new Error("Tried to convert a non-string of type " + typeof thing + " to an array buffer");
            }
            return new dcodeIO.ByteBuffer.wrap(thing, 'base64').toBuffer();
        },
        jsonThing: function(thing) {
            return JSON.stringify(ensureStringed(thing));
        }
    };
})();
