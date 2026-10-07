var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/escape-html/index.js
var require_escape_html = __commonJS({
  "node_modules/escape-html/index.js"(exports, module) {
    "use strict";
    var matchHtmlRegExp = /["'&<>]/;
    module.exports = escapeHtml;
    function escapeHtml(string) {
      var str = "" + string;
      var match = matchHtmlRegExp.exec(str);
      if (!match) {
        return str;
      }
      var escape;
      var html = "";
      var index = 0;
      var lastIndex = 0;
      for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
            escape = "&quot;";
            break;
          case 38:
            escape = "&amp;";
            break;
          case 39:
            escape = "&#39;";
            break;
          case 60:
            escape = "&lt;";
            break;
          case 62:
            escape = "&gt;";
            break;
          default:
            continue;
        }
        if (lastIndex !== index) {
          html += str.substring(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escape;
      }
      return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    }
  }
});

// node_modules/tiny-inflate/index.js
var require_tiny_inflate = __commonJS({
  "node_modules/tiny-inflate/index.js"(exports, module) {
    var TINF_OK = 0;
    var TINF_DATA_ERROR = -3;
    function Tree() {
      this.table = new Uint16Array(16);
      this.trans = new Uint16Array(288);
    }
    function Data(source, dest) {
      this.source = source;
      this.sourceIndex = 0;
      this.tag = 0;
      this.bitcount = 0;
      this.dest = dest;
      this.destLen = 0;
      this.ltree = new Tree();
      this.dtree = new Tree();
    }
    var sltree = new Tree();
    var sdtree = new Tree();
    var length_bits = new Uint8Array(30);
    var length_base = new Uint16Array(30);
    var dist_bits = new Uint8Array(30);
    var dist_base = new Uint16Array(30);
    var clcidx = new Uint8Array([
      16,
      17,
      18,
      0,
      8,
      7,
      9,
      6,
      10,
      5,
      11,
      4,
      12,
      3,
      13,
      2,
      14,
      1,
      15
    ]);
    var code_tree = new Tree();
    var lengths = new Uint8Array(288 + 32);
    function tinf_build_bits_base(bits2, base, delta, first) {
      var i2, sum;
      for (i2 = 0; i2 < delta; ++i2) bits2[i2] = 0;
      for (i2 = 0; i2 < 30 - delta; ++i2) bits2[i2 + delta] = i2 / delta | 0;
      for (sum = first, i2 = 0; i2 < 30; ++i2) {
        base[i2] = sum;
        sum += 1 << bits2[i2];
      }
    }
    function tinf_build_fixed_trees(lt2, dt) {
      var i2;
      for (i2 = 0; i2 < 7; ++i2) lt2.table[i2] = 0;
      lt2.table[7] = 24;
      lt2.table[8] = 152;
      lt2.table[9] = 112;
      for (i2 = 0; i2 < 24; ++i2) lt2.trans[i2] = 256 + i2;
      for (i2 = 0; i2 < 144; ++i2) lt2.trans[24 + i2] = i2;
      for (i2 = 0; i2 < 8; ++i2) lt2.trans[24 + 144 + i2] = 280 + i2;
      for (i2 = 0; i2 < 112; ++i2) lt2.trans[24 + 144 + 8 + i2] = 144 + i2;
      for (i2 = 0; i2 < 5; ++i2) dt.table[i2] = 0;
      dt.table[5] = 32;
      for (i2 = 0; i2 < 32; ++i2) dt.trans[i2] = i2;
    }
    var offs = new Uint16Array(16);
    function tinf_build_tree(t, lengths2, off, num) {
      var i2, sum;
      for (i2 = 0; i2 < 16; ++i2) t.table[i2] = 0;
      for (i2 = 0; i2 < num; ++i2) t.table[lengths2[off + i2]]++;
      t.table[0] = 0;
      for (sum = 0, i2 = 0; i2 < 16; ++i2) {
        offs[i2] = sum;
        sum += t.table[i2];
      }
      for (i2 = 0; i2 < num; ++i2) {
        if (lengths2[off + i2]) t.trans[offs[lengths2[off + i2]]++] = i2;
      }
    }
    function tinf_getbit(d2) {
      if (!d2.bitcount--) {
        d2.tag = d2.source[d2.sourceIndex++];
        d2.bitcount = 7;
      }
      var bit = d2.tag & 1;
      d2.tag >>>= 1;
      return bit;
    }
    function tinf_read_bits(d2, num, base) {
      if (!num)
        return base;
      while (d2.bitcount < 24) {
        d2.tag |= d2.source[d2.sourceIndex++] << d2.bitcount;
        d2.bitcount += 8;
      }
      var val = d2.tag & 65535 >>> 16 - num;
      d2.tag >>>= num;
      d2.bitcount -= num;
      return val + base;
    }
    function tinf_decode_symbol(d2, t) {
      while (d2.bitcount < 24) {
        d2.tag |= d2.source[d2.sourceIndex++] << d2.bitcount;
        d2.bitcount += 8;
      }
      var sum = 0, cur = 0, len = 0;
      var tag = d2.tag;
      do {
        cur = 2 * cur + (tag & 1);
        tag >>>= 1;
        ++len;
        sum += t.table[len];
        cur -= t.table[len];
      } while (cur >= 0);
      d2.tag = tag;
      d2.bitcount -= len;
      return t.trans[sum + cur];
    }
    function tinf_decode_trees(d2, lt2, dt) {
      var hlit, hdist, hclen;
      var i2, num, length;
      hlit = tinf_read_bits(d2, 5, 257);
      hdist = tinf_read_bits(d2, 5, 1);
      hclen = tinf_read_bits(d2, 4, 4);
      for (i2 = 0; i2 < 19; ++i2) lengths[i2] = 0;
      for (i2 = 0; i2 < hclen; ++i2) {
        var clen = tinf_read_bits(d2, 3, 0);
        lengths[clcidx[i2]] = clen;
      }
      tinf_build_tree(code_tree, lengths, 0, 19);
      for (num = 0; num < hlit + hdist; ) {
        var sym = tinf_decode_symbol(d2, code_tree);
        switch (sym) {
          case 16:
            var prev = lengths[num - 1];
            for (length = tinf_read_bits(d2, 2, 3); length; --length) {
              lengths[num++] = prev;
            }
            break;
          case 17:
            for (length = tinf_read_bits(d2, 3, 3); length; --length) {
              lengths[num++] = 0;
            }
            break;
          case 18:
            for (length = tinf_read_bits(d2, 7, 11); length; --length) {
              lengths[num++] = 0;
            }
            break;
          default:
            lengths[num++] = sym;
            break;
        }
      }
      tinf_build_tree(lt2, lengths, 0, hlit);
      tinf_build_tree(dt, lengths, hlit, hdist);
    }
    function tinf_inflate_block_data(d2, lt2, dt) {
      while (1) {
        var sym = tinf_decode_symbol(d2, lt2);
        if (sym === 256) {
          return TINF_OK;
        }
        if (sym < 256) {
          d2.dest[d2.destLen++] = sym;
        } else {
          var length, dist, offs2;
          var i2;
          sym -= 257;
          length = tinf_read_bits(d2, length_bits[sym], length_base[sym]);
          dist = tinf_decode_symbol(d2, dt);
          offs2 = d2.destLen - tinf_read_bits(d2, dist_bits[dist], dist_base[dist]);
          for (i2 = offs2; i2 < offs2 + length; ++i2) {
            d2.dest[d2.destLen++] = d2.dest[i2];
          }
        }
      }
    }
    function tinf_inflate_uncompressed_block(d2) {
      var length, invlength;
      var i2;
      while (d2.bitcount > 8) {
        d2.sourceIndex--;
        d2.bitcount -= 8;
      }
      length = d2.source[d2.sourceIndex + 1];
      length = 256 * length + d2.source[d2.sourceIndex];
      invlength = d2.source[d2.sourceIndex + 3];
      invlength = 256 * invlength + d2.source[d2.sourceIndex + 2];
      if (length !== (~invlength & 65535))
        return TINF_DATA_ERROR;
      d2.sourceIndex += 4;
      for (i2 = length; i2; --i2)
        d2.dest[d2.destLen++] = d2.source[d2.sourceIndex++];
      d2.bitcount = 0;
      return TINF_OK;
    }
    function tinf_uncompress(source, dest) {
      var d2 = new Data(source, dest);
      var bfinal, btype, res;
      do {
        bfinal = tinf_getbit(d2);
        btype = tinf_read_bits(d2, 2, 0);
        switch (btype) {
          case 0:
            res = tinf_inflate_uncompressed_block(d2);
            break;
          case 1:
            res = tinf_inflate_block_data(d2, sltree, sdtree);
            break;
          case 2:
            tinf_decode_trees(d2, d2.ltree, d2.dtree);
            res = tinf_inflate_block_data(d2, d2.ltree, d2.dtree);
            break;
          default:
            res = TINF_DATA_ERROR;
        }
        if (res !== TINF_OK)
          throw new Error("Data error");
      } while (!bfinal);
      if (d2.destLen < d2.dest.length) {
        if (typeof d2.dest.slice === "function")
          return d2.dest.slice(0, d2.destLen);
        else
          return d2.dest.subarray(0, d2.destLen);
      }
      return d2.dest;
    }
    tinf_build_fixed_trees(sltree, sdtree);
    tinf_build_bits_base(length_bits, length_base, 4, 3);
    tinf_build_bits_base(dist_bits, dist_base, 2, 1);
    length_bits[28] = 0;
    length_base[28] = 258;
    module.exports = tinf_uncompress;
  }
});

// node_modules/unicode-trie/swap.js
var require_swap = __commonJS({
  "node_modules/unicode-trie/swap.js"(exports, module) {
    var isBigEndian = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
    var swap = (b, n, m2) => {
      let i2 = b[n];
      b[n] = b[m2];
      b[m2] = i2;
    };
    var swap32 = (array) => {
      const len = array.length;
      for (let i2 = 0; i2 < len; i2 += 4) {
        swap(array, i2, i2 + 3);
        swap(array, i2 + 1, i2 + 2);
      }
    };
    var swap32LE = (array) => {
      if (isBigEndian) {
        swap32(array);
      }
    };
    module.exports = {
      swap32LE
    };
  }
});

// node_modules/unicode-trie/index.js
var require_unicode_trie = __commonJS({
  "node_modules/unicode-trie/index.js"(exports, module) {
    var inflate = require_tiny_inflate();
    var { swap32LE } = require_swap();
    var SHIFT_1 = 6 + 5;
    var SHIFT_2 = 5;
    var SHIFT_1_2 = SHIFT_1 - SHIFT_2;
    var OMITTED_BMP_INDEX_1_LENGTH = 65536 >> SHIFT_1;
    var INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;
    var INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;
    var INDEX_SHIFT = 2;
    var DATA_BLOCK_LENGTH = 1 << SHIFT_2;
    var DATA_MASK = DATA_BLOCK_LENGTH - 1;
    var LSCP_INDEX_2_OFFSET = 65536 >> SHIFT_2;
    var LSCP_INDEX_2_LENGTH = 1024 >> SHIFT_2;
    var INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;
    var UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
    var UTF8_2B_INDEX_2_LENGTH = 2048 >> 6;
    var INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;
    var DATA_GRANULARITY = 1 << INDEX_SHIFT;
    var UnicodeTrie = class {
      constructor(data) {
        const isBuffer = typeof data.readUInt32BE === "function" && typeof data.slice === "function";
        if (isBuffer || data instanceof Uint8Array) {
          let uncompressedLength;
          if (isBuffer) {
            this.highStart = data.readUInt32LE(0);
            this.errorValue = data.readUInt32LE(4);
            uncompressedLength = data.readUInt32LE(8);
            data = data.slice(12);
          } else {
            const view = new DataView(data.buffer);
            this.highStart = view.getUint32(0, true);
            this.errorValue = view.getUint32(4, true);
            uncompressedLength = view.getUint32(8, true);
            data = data.subarray(12);
          }
          data = inflate(data, new Uint8Array(uncompressedLength));
          data = inflate(data, new Uint8Array(uncompressedLength));
          swap32LE(data);
          this.data = new Uint32Array(data.buffer);
        } else {
          ({ data: this.data, highStart: this.highStart, errorValue: this.errorValue } = data);
        }
      }
      get(codePoint) {
        let index;
        if (codePoint < 0 || codePoint > 1114111) {
          return this.errorValue;
        }
        if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
          index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
          return this.data[index];
        }
        if (codePoint <= 65535) {
          index = (this.data[LSCP_INDEX_2_OFFSET + (codePoint - 55296 >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
          return this.data[index];
        }
        if (codePoint < this.highStart) {
          index = this.data[INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> SHIFT_1)];
          index = this.data[index + (codePoint >> SHIFT_2 & INDEX_2_MASK)];
          index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
          return this.data[index];
        }
        return this.data[this.data.length - DATA_GRANULARITY];
      }
    };
    module.exports = UnicodeTrie;
  }
});

// node_modules/base64-js/lib/b64.js
var require_b64 = __commonJS({
  "node_modules/base64-js/lib/b64.js"(exports) {
    var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    (function(exports2) {
      "use strict";
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var PLUS = "+".charCodeAt(0);
      var SLASH = "/".charCodeAt(0);
      var NUMBER = "0".charCodeAt(0);
      var LOWER = "a".charCodeAt(0);
      var UPPER = "A".charCodeAt(0);
      var PLUS_URL_SAFE = "-".charCodeAt(0);
      var SLASH_URL_SAFE = "_".charCodeAt(0);
      function decode(elt) {
        var code = elt.charCodeAt(0);
        if (code === PLUS || code === PLUS_URL_SAFE)
          return 62;
        if (code === SLASH || code === SLASH_URL_SAFE)
          return 63;
        if (code < NUMBER)
          return -1;
        if (code < NUMBER + 10)
          return code - NUMBER + 26 + 26;
        if (code < UPPER + 26)
          return code - UPPER;
        if (code < LOWER + 26)
          return code - LOWER + 26;
      }
      function b64ToByteArray(b64) {
        var i2, j, l2, tmp, placeHolders, arr;
        if (b64.length % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var len = b64.length;
        placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
        arr = new Arr(b64.length * 3 / 4 - placeHolders);
        l2 = placeHolders > 0 ? b64.length - 4 : b64.length;
        var L = 0;
        function push(v2) {
          arr[L++] = v2;
        }
        for (i2 = 0, j = 0; i2 < l2; i2 += 4, j += 3) {
          tmp = decode(b64.charAt(i2)) << 18 | decode(b64.charAt(i2 + 1)) << 12 | decode(b64.charAt(i2 + 2)) << 6 | decode(b64.charAt(i2 + 3));
          push((tmp & 16711680) >> 16);
          push((tmp & 65280) >> 8);
          push(tmp & 255);
        }
        if (placeHolders === 2) {
          tmp = decode(b64.charAt(i2)) << 2 | decode(b64.charAt(i2 + 1)) >> 4;
          push(tmp & 255);
        } else if (placeHolders === 1) {
          tmp = decode(b64.charAt(i2)) << 10 | decode(b64.charAt(i2 + 1)) << 4 | decode(b64.charAt(i2 + 2)) >> 2;
          push(tmp >> 8 & 255);
          push(tmp & 255);
        }
        return arr;
      }
      function uint8ToBase64(uint8) {
        var i2, extraBytes = uint8.length % 3, output = "", temp, length;
        function encode(num) {
          return lookup.charAt(num);
        }
        function tripletToBase64(num) {
          return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63);
        }
        for (i2 = 0, length = uint8.length - extraBytes; i2 < length; i2 += 3) {
          temp = (uint8[i2] << 16) + (uint8[i2 + 1] << 8) + uint8[i2 + 2];
          output += tripletToBase64(temp);
        }
        switch (extraBytes) {
          case 1:
            temp = uint8[uint8.length - 1];
            output += encode(temp >> 2);
            output += encode(temp << 4 & 63);
            output += "==";
            break;
          case 2:
            temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
            output += encode(temp >> 10);
            output += encode(temp >> 4 & 63);
            output += encode(temp << 2 & 63);
            output += "=";
            break;
        }
        return output;
      }
      exports2.toByteArray = b64ToByteArray;
      exports2.fromByteArray = uint8ToBase64;
    })(typeof exports === "undefined" ? exports.base64js = {} : exports);
  }
});

// node_modules/postcss-value-parser/lib/parse.js
var require_parse = __commonJS({
  "node_modules/postcss-value-parser/lib/parse.js"(exports, module) {
    var openParentheses = "(".charCodeAt(0);
    var closeParentheses = ")".charCodeAt(0);
    var singleQuote = "'".charCodeAt(0);
    var doubleQuote = '"'.charCodeAt(0);
    var backslash = "\\".charCodeAt(0);
    var slash = "/".charCodeAt(0);
    var comma = ",".charCodeAt(0);
    var colon = ":".charCodeAt(0);
    var star = "*".charCodeAt(0);
    var uLower = "u".charCodeAt(0);
    var uUpper = "U".charCodeAt(0);
    var plus = "+".charCodeAt(0);
    var isUnicodeRange = /^[a-f0-9?-]+$/i;
    module.exports = function(input) {
      var tokens = [];
      var value = input;
      var next, quote, prev, token, escape, escapePos, whitespacePos, parenthesesOpenPos;
      var pos = 0;
      var code = value.charCodeAt(pos);
      var max2 = value.length;
      var stack = [{ nodes: tokens }];
      var balanced = 0;
      var parent;
      var name = "";
      var before = "";
      var after = "";
      while (pos < max2) {
        if (code <= 32) {
          next = pos;
          do {
            next += 1;
            code = value.charCodeAt(next);
          } while (code <= 32);
          token = value.slice(pos, next);
          prev = tokens[tokens.length - 1];
          if (code === closeParentheses && balanced) {
            after = token;
          } else if (prev && prev.type === "div") {
            prev.after = token;
            prev.sourceEndIndex += token.length;
          } else if (code === comma || code === colon || code === slash && value.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && parent.value !== "calc")) {
            before = token;
          } else {
            tokens.push({
              type: "space",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          }
          pos = next;
        } else if (code === singleQuote || code === doubleQuote) {
          next = pos;
          quote = code === singleQuote ? "'" : '"';
          token = {
            type: "string",
            sourceIndex: pos,
            quote
          };
          do {
            escape = false;
            next = value.indexOf(quote, next + 1);
            if (~next) {
              escapePos = next;
              while (value.charCodeAt(escapePos - 1) === backslash) {
                escapePos -= 1;
                escape = !escape;
              }
            } else {
              value += quote;
              next = value.length - 1;
              token.unclosed = true;
            }
          } while (escape);
          token.value = value.slice(pos + 1, next);
          token.sourceEndIndex = token.unclosed ? next : next + 1;
          tokens.push(token);
          pos = next + 1;
          code = value.charCodeAt(pos);
        } else if (code === slash && value.charCodeAt(pos + 1) === star) {
          next = value.indexOf("*/", pos);
          token = {
            type: "comment",
            sourceIndex: pos,
            sourceEndIndex: next + 2
          };
          if (next === -1) {
            token.unclosed = true;
            next = value.length;
            token.sourceEndIndex = next;
          }
          token.value = value.slice(pos + 2, next);
          tokens.push(token);
          pos = next + 2;
          code = value.charCodeAt(pos);
        } else if ((code === slash || code === star) && parent && parent.type === "function" && parent.value === "calc") {
          token = value[pos];
          tokens.push({
            type: "word",
            sourceIndex: pos - before.length,
            sourceEndIndex: pos + token.length,
            value: token
          });
          pos += 1;
          code = value.charCodeAt(pos);
        } else if (code === slash || code === comma || code === colon) {
          token = value[pos];
          tokens.push({
            type: "div",
            sourceIndex: pos - before.length,
            sourceEndIndex: pos + token.length,
            value: token,
            before,
            after: ""
          });
          before = "";
          pos += 1;
          code = value.charCodeAt(pos);
        } else if (openParentheses === code) {
          next = pos;
          do {
            next += 1;
            code = value.charCodeAt(next);
          } while (code <= 32);
          parenthesesOpenPos = pos;
          token = {
            type: "function",
            sourceIndex: pos - name.length,
            value: name,
            before: value.slice(parenthesesOpenPos + 1, next)
          };
          pos = next;
          if (name === "url" && code !== singleQuote && code !== doubleQuote) {
            next -= 1;
            do {
              escape = false;
              next = value.indexOf(")", next + 1);
              if (~next) {
                escapePos = next;
                while (value.charCodeAt(escapePos - 1) === backslash) {
                  escapePos -= 1;
                  escape = !escape;
                }
              } else {
                value += ")";
                next = value.length - 1;
                token.unclosed = true;
              }
            } while (escape);
            whitespacePos = next;
            do {
              whitespacePos -= 1;
              code = value.charCodeAt(whitespacePos);
            } while (code <= 32);
            if (parenthesesOpenPos < whitespacePos) {
              if (pos !== whitespacePos + 1) {
                token.nodes = [
                  {
                    type: "word",
                    sourceIndex: pos,
                    sourceEndIndex: whitespacePos + 1,
                    value: value.slice(pos, whitespacePos + 1)
                  }
                ];
              } else {
                token.nodes = [];
              }
              if (token.unclosed && whitespacePos + 1 !== next) {
                token.after = "";
                token.nodes.push({
                  type: "space",
                  sourceIndex: whitespacePos + 1,
                  sourceEndIndex: next,
                  value: value.slice(whitespacePos + 1, next)
                });
              } else {
                token.after = value.slice(whitespacePos + 1, next);
                token.sourceEndIndex = next;
              }
            } else {
              token.after = "";
              token.nodes = [];
            }
            pos = next + 1;
            token.sourceEndIndex = token.unclosed ? next : pos;
            code = value.charCodeAt(pos);
            tokens.push(token);
          } else {
            balanced += 1;
            token.after = "";
            token.sourceEndIndex = pos + 1;
            tokens.push(token);
            stack.push(token);
            tokens = token.nodes = [];
            parent = token;
          }
          name = "";
        } else if (closeParentheses === code && balanced) {
          pos += 1;
          code = value.charCodeAt(pos);
          parent.after = after;
          parent.sourceEndIndex += after.length;
          after = "";
          balanced -= 1;
          stack[stack.length - 1].sourceEndIndex = pos;
          stack.pop();
          parent = stack[balanced];
          tokens = parent.nodes;
        } else {
          next = pos;
          do {
            if (code === backslash) {
              next += 1;
            }
            next += 1;
            code = value.charCodeAt(next);
          } while (next < max2 && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && parent.value === "calc" || code === slash && parent.type === "function" && parent.value === "calc" || code === closeParentheses && balanced));
          token = value.slice(pos, next);
          if (openParentheses === code) {
            name = token;
          } else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) {
            tokens.push({
              type: "unicode-range",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          } else {
            tokens.push({
              type: "word",
              sourceIndex: pos,
              sourceEndIndex: next,
              value: token
            });
          }
          pos = next;
        }
      }
      for (pos = stack.length - 1; pos; pos -= 1) {
        stack[pos].unclosed = true;
        stack[pos].sourceEndIndex = value.length;
      }
      return stack[0].nodes;
    };
  }
});

// node_modules/postcss-value-parser/lib/walk.js
var require_walk = __commonJS({
  "node_modules/postcss-value-parser/lib/walk.js"(exports, module) {
    module.exports = function walk(nodes, cb, bubble) {
      var i2, max2, node, result;
      for (i2 = 0, max2 = nodes.length; i2 < max2; i2 += 1) {
        node = nodes[i2];
        if (!bubble) {
          result = cb(node, i2, nodes);
        }
        if (result !== false && node.type === "function" && Array.isArray(node.nodes)) {
          walk(node.nodes, cb, bubble);
        }
        if (bubble) {
          cb(node, i2, nodes);
        }
      }
    };
  }
});

// node_modules/postcss-value-parser/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/postcss-value-parser/lib/stringify.js"(exports, module) {
    function stringifyNode(node, custom) {
      var type = node.type;
      var value = node.value;
      var buf;
      var customResult;
      if (custom && (customResult = custom(node)) !== void 0) {
        return customResult;
      } else if (type === "word" || type === "space") {
        return value;
      } else if (type === "string") {
        buf = node.quote || "";
        return buf + value + (node.unclosed ? "" : buf);
      } else if (type === "comment") {
        return "/*" + value + (node.unclosed ? "" : "*/");
      } else if (type === "div") {
        return (node.before || "") + value + (node.after || "");
      } else if (Array.isArray(node.nodes)) {
        buf = stringify(node.nodes, custom);
        if (type !== "function") {
          return buf;
        }
        return value + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
      }
      return value;
    }
    function stringify(nodes, custom) {
      var result, i2;
      if (Array.isArray(nodes)) {
        result = "";
        for (i2 = nodes.length - 1; ~i2; i2 -= 1) {
          result = stringifyNode(nodes[i2], custom) + result;
        }
        return result;
      }
      return stringifyNode(nodes, custom);
    }
    module.exports = stringify;
  }
});

// node_modules/postcss-value-parser/lib/unit.js
var require_unit = __commonJS({
  "node_modules/postcss-value-parser/lib/unit.js"(exports, module) {
    var minus = "-".charCodeAt(0);
    var plus = "+".charCodeAt(0);
    var dot = ".".charCodeAt(0);
    var exp = "e".charCodeAt(0);
    var EXP = "E".charCodeAt(0);
    function likeNumber(value) {
      var code = value.charCodeAt(0);
      var nextCode;
      if (code === plus || code === minus) {
        nextCode = value.charCodeAt(1);
        if (nextCode >= 48 && nextCode <= 57) {
          return true;
        }
        var nextNextCode = value.charCodeAt(2);
        if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
          return true;
        }
        return false;
      }
      if (code === dot) {
        nextCode = value.charCodeAt(1);
        if (nextCode >= 48 && nextCode <= 57) {
          return true;
        }
        return false;
      }
      if (code >= 48 && code <= 57) {
        return true;
      }
      return false;
    }
    module.exports = function(value) {
      var pos = 0;
      var length = value.length;
      var code;
      var nextCode;
      var nextNextCode;
      if (length === 0 || !likeNumber(value)) {
        return false;
      }
      code = value.charCodeAt(pos);
      if (code === plus || code === minus) {
        pos++;
      }
      while (pos < length) {
        code = value.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
      code = value.charCodeAt(pos);
      nextCode = value.charCodeAt(pos + 1);
      if (code === dot && nextCode >= 48 && nextCode <= 57) {
        pos += 2;
        while (pos < length) {
          code = value.charCodeAt(pos);
          if (code < 48 || code > 57) {
            break;
          }
          pos += 1;
        }
      }
      code = value.charCodeAt(pos);
      nextCode = value.charCodeAt(pos + 1);
      nextNextCode = value.charCodeAt(pos + 2);
      if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
        pos += nextCode === plus || nextCode === minus ? 3 : 2;
        while (pos < length) {
          code = value.charCodeAt(pos);
          if (code < 48 || code > 57) {
            break;
          }
          pos += 1;
        }
      }
      return {
        number: value.slice(0, pos),
        unit: value.slice(pos)
      };
    };
  }
});

// node_modules/postcss-value-parser/lib/index.js
var require_lib = __commonJS({
  "node_modules/postcss-value-parser/lib/index.js"(exports, module) {
    var parse = require_parse();
    var walk = require_walk();
    var stringify = require_stringify();
    function ValueParser(value) {
      if (this instanceof ValueParser) {
        this.nodes = parse(value);
        return this;
      }
      return new ValueParser(value);
    }
    ValueParser.prototype.toString = function() {
      return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
    };
    ValueParser.prototype.walk = function(cb, bubble) {
      walk(this.nodes, cb, bubble);
      return this;
    };
    ValueParser.unit = require_unit();
    ValueParser.walk = walk;
    ValueParser.stringify = stringify;
    module.exports = ValueParser;
  }
});

// node_modules/camelize/index.js
var require_camelize = __commonJS({
  "node_modules/camelize/index.js"(exports, module) {
    "use strict";
    module.exports = function(obj) {
      if (typeof obj === "string") {
        return camelCase(obj);
      }
      return walk(obj);
    };
    function walk(obj) {
      if (!obj || typeof obj !== "object") {
        return obj;
      }
      if (isDate(obj) || isRegex(obj)) {
        return obj;
      }
      if (isArray(obj)) {
        return map(obj, walk);
      }
      return reduce(objectKeys(obj), function(acc, key) {
        var camel = camelCase(key);
        acc[camel] = walk(obj[key]);
        return acc;
      }, {});
    }
    function camelCase(str) {
      return str.replace(/[_.-](\w|$)/g, function(_, x3) {
        return x3.toUpperCase();
      });
    }
    var isArray = Array.isArray || function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
    var isDate = function(obj) {
      return Object.prototype.toString.call(obj) === "[object Date]";
    };
    var isRegex = function(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    };
    var has = Object.prototype.hasOwnProperty;
    var objectKeys = Object.keys || function(obj) {
      var keys = [];
      for (var key in obj) {
        if (has.call(obj, key)) {
          keys.push(key);
        }
      }
      return keys;
    };
    function map(xs2, f) {
      if (xs2.map) {
        return xs2.map(f);
      }
      var res = [];
      for (var i2 = 0; i2 < xs2.length; i2++) {
        res.push(f(xs2[i2], i2));
      }
      return res;
    }
    function reduce(xs2, f, acc) {
      if (xs2.reduce) {
        return xs2.reduce(f, acc);
      }
      for (var i2 = 0; i2 < xs2.length; i2++) {
        acc = f(acc, xs2[i2], i2);
      }
      return acc;
    }
  }
});

// node_modules/css-color-keywords/colors.json
var require_colors = __commonJS({
  "node_modules/css-color-keywords/colors.json"(exports, module) {
    module.exports = {
      black: "#000000",
      silver: "#c0c0c0",
      gray: "#808080",
      white: "#ffffff",
      maroon: "#800000",
      red: "#ff0000",
      purple: "#800080",
      fuchsia: "#ff00ff",
      green: "#008000",
      lime: "#00ff00",
      olive: "#808000",
      yellow: "#ffff00",
      navy: "#000080",
      blue: "#0000ff",
      teal: "#008080",
      aqua: "#00ffff",
      orange: "#ffa500",
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      blanchedalmond: "#ffebcd",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkgrey: "#a9a9a9",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkslategrey: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dimgrey: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      greenyellow: "#adff2f",
      grey: "#808080",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgray: "#d3d3d3",
      lightgreen: "#90ee90",
      lightgrey: "#d3d3d3",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightslategrey: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370db",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      oldlace: "#fdf5e6",
      olivedrab: "#6b8e23",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#db7093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      slategrey: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      whitesmoke: "#f5f5f5",
      yellowgreen: "#9acd32",
      rebeccapurple: "#663399"
    };
  }
});

// node_modules/css-color-keywords/index.js
var require_css_color_keywords = __commonJS({
  "node_modules/css-color-keywords/index.js"(exports, module) {
    "use strict";
    module.exports = require_colors();
  }
});

// node_modules/css-to-react-native/index.js
var require_css_to_react_native = __commonJS({
  "node_modules/css-to-react-native/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var parse = require_lib();
    var parse__default = _interopDefault(parse);
    var camelizeStyleName = _interopDefault(require_camelize());
    var cssColorKeywords = _interopDefault(require_css_color_keywords());
    var matchString = function matchString2(node) {
      if (node.type !== "string") return null;
      return node.value.replace(/\\([0-9a-f]{1,6})(?:\s|$)/gi, function(match, charCode) {
        return String.fromCharCode(parseInt(charCode, 16));
      }).replace(/\\/g, "");
    };
    var hexColorRe = /^(#(?:[0-9a-f]{3,4}){1,2})$/i;
    var cssFunctionNameRe = /^(rgba?|hsla?|hwb|lab|lch|gray|color)$/;
    var matchColor = function matchColor2(node) {
      if (node.type === "word" && (hexColorRe.test(node.value) || node.value in cssColorKeywords || node.value === "transparent")) {
        return node.value;
      } else if (node.type === "function" && cssFunctionNameRe.test(node.value)) {
        return parse.stringify(node);
      }
      return null;
    };
    var noneRe = /^(none)$/i;
    var autoRe = /^(auto)$/i;
    var identRe = /(^-?[_a-z][_a-z0-9-]*$)/i;
    var numberRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)$/i;
    var lengthRe = /^(0$|(?:[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?=px$))/i;
    var unsupportedUnitRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(ch|em|ex|rem|vh|vw|vmin|vmax|cm|mm|in|pc|pt))$/i;
    var angleRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:deg|rad))$/i;
    var percentRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?%)$/i;
    var noopToken = function noopToken2(predicate) {
      return function(node) {
        return predicate(node) ? "<token>" : null;
      };
    };
    var valueForTypeToken = function valueForTypeToken2(type) {
      return function(node) {
        return node.type === type ? node.value : null;
      };
    };
    var regExpToken = function regExpToken2(regExp, transform2) {
      if (transform2 === void 0) {
        transform2 = String;
      }
      return function(node) {
        if (node.type !== "word") return null;
        var match = node.value.match(regExp);
        if (match === null) return null;
        var value = transform2(match[1]);
        return value;
      };
    };
    var SPACE = noopToken(function(node) {
      return node.type === "space";
    });
    var SLASH = noopToken(function(node) {
      return node.type === "div" && node.value === "/";
    });
    var COMMA = noopToken(function(node) {
      return node.type === "div" && node.value === ",";
    });
    var WORD = valueForTypeToken("word");
    var NONE = regExpToken(noneRe);
    var AUTO = regExpToken(autoRe);
    var NUMBER = regExpToken(numberRe, Number);
    var LENGTH = regExpToken(lengthRe, Number);
    var UNSUPPORTED_LENGTH_UNIT = regExpToken(unsupportedUnitRe);
    var ANGLE = regExpToken(angleRe, function(angle) {
      return angle.toLowerCase();
    });
    var PERCENT = regExpToken(percentRe);
    var IDENT = regExpToken(identRe);
    var STRING = matchString;
    var COLOR = matchColor;
    var LINE = regExpToken(/^(none|underline|line-through)$/i);
    var aspectRatio = function aspectRatio2(tokenStream) {
      var aspectRatio3 = tokenStream.expect(NUMBER);
      if (tokenStream.hasTokens()) {
        tokenStream.expect(SLASH);
        aspectRatio3 /= tokenStream.expect(NUMBER);
      }
      return {
        aspectRatio: aspectRatio3
      };
    };
    var BORDER_STYLE = regExpToken(/^(solid|dashed|dotted)$/);
    var defaultBorderWidth = 1;
    var defaultBorderColor = "black";
    var defaultBorderStyle = "solid";
    var border = function border2(tokenStream) {
      var borderWidth2;
      var borderColor2;
      var borderStyle;
      if (tokenStream.matches(NONE)) {
        tokenStream.expectEmpty();
        return {
          borderWidth: 0,
          borderColor: "black",
          borderStyle: "solid"
        };
      }
      var partsParsed = 0;
      while (partsParsed < 3 && tokenStream.hasTokens()) {
        if (partsParsed !== 0) tokenStream.expect(SPACE);
        if (borderWidth2 === void 0 && tokenStream.matches(LENGTH, UNSUPPORTED_LENGTH_UNIT)) {
          borderWidth2 = tokenStream.lastValue;
        } else if (borderColor2 === void 0 && tokenStream.matches(COLOR)) {
          borderColor2 = tokenStream.lastValue;
        } else if (borderStyle === void 0 && tokenStream.matches(BORDER_STYLE)) {
          borderStyle = tokenStream.lastValue;
        } else {
          tokenStream["throw"]();
        }
        partsParsed += 1;
      }
      tokenStream.expectEmpty();
      if (borderWidth2 === void 0) borderWidth2 = defaultBorderWidth;
      if (borderColor2 === void 0) borderColor2 = defaultBorderColor;
      if (borderStyle === void 0) borderStyle = defaultBorderStyle;
      return {
        borderWidth: borderWidth2,
        borderColor: borderColor2,
        borderStyle
      };
    };
    var directionFactory = function directionFactory2(_ref) {
      var _ref$types = _ref.types, types = _ref$types === void 0 ? [LENGTH, UNSUPPORTED_LENGTH_UNIT, PERCENT] : _ref$types, _ref$directions = _ref.directions, directions = _ref$directions === void 0 ? ["Top", "Right", "Bottom", "Left"] : _ref$directions, _ref$prefix = _ref.prefix, prefix = _ref$prefix === void 0 ? "" : _ref$prefix, _ref$suffix = _ref.suffix, suffix = _ref$suffix === void 0 ? "" : _ref$suffix;
      return function(tokenStream) {
        var _ref2;
        var values = [];
        values.push(tokenStream.expect.apply(tokenStream, types));
        while (values.length < 4 && tokenStream.hasTokens()) {
          tokenStream.expect(SPACE);
          values.push(tokenStream.expect.apply(tokenStream, types));
        }
        tokenStream.expectEmpty();
        var top = values[0], _values$ = values[1], right = _values$ === void 0 ? top : _values$, _values$2 = values[2], bottom = _values$2 === void 0 ? top : _values$2, _values$3 = values[3], left = _values$3 === void 0 ? right : _values$3;
        var keyFor = function keyFor2(n) {
          return "" + prefix + directions[n] + suffix;
        };
        return _ref2 = {}, _ref2[keyFor(0)] = top, _ref2[keyFor(1)] = right, _ref2[keyFor(2)] = bottom, _ref2[keyFor(3)] = left, _ref2;
      };
    };
    var parseShadowOffset = function parseShadowOffset2(tokenStream) {
      var width = tokenStream.expect(LENGTH);
      var height = tokenStream.matches(SPACE) ? tokenStream.expect(LENGTH) : width;
      tokenStream.expectEmpty();
      return {
        width,
        height
      };
    };
    var parseShadow = function parseShadow2(tokenStream) {
      var offsetX;
      var offsetY;
      var radius;
      var color;
      if (tokenStream.matches(NONE)) {
        tokenStream.expectEmpty();
        return {
          offset: {
            width: 0,
            height: 0
          },
          radius: 0,
          color: "black"
        };
      }
      var didParseFirst = false;
      while (tokenStream.hasTokens()) {
        if (didParseFirst) tokenStream.expect(SPACE);
        if (offsetX === void 0 && tokenStream.matches(LENGTH, UNSUPPORTED_LENGTH_UNIT)) {
          offsetX = tokenStream.lastValue;
          tokenStream.expect(SPACE);
          offsetY = tokenStream.expect(LENGTH, UNSUPPORTED_LENGTH_UNIT);
          tokenStream.saveRewindPoint();
          if (tokenStream.matches(SPACE) && tokenStream.matches(LENGTH, UNSUPPORTED_LENGTH_UNIT)) {
            radius = tokenStream.lastValue;
          } else {
            tokenStream.rewind();
          }
        } else if (color === void 0 && tokenStream.matches(COLOR)) {
          color = tokenStream.lastValue;
        } else {
          tokenStream["throw"]();
        }
        didParseFirst = true;
      }
      if (offsetX === void 0) tokenStream["throw"]();
      return {
        offset: {
          width: offsetX,
          height: offsetY
        },
        radius: radius !== void 0 ? radius : 0,
        color: color !== void 0 ? color : "black"
      };
    };
    var boxShadow = function boxShadow2(tokenStream) {
      var _parseShadow = parseShadow(tokenStream), offset = _parseShadow.offset, radius = _parseShadow.radius, color = _parseShadow.color;
      return {
        shadowOffset: offset,
        shadowRadius: radius,
        shadowColor: color,
        shadowOpacity: 1
      };
    };
    var defaultFlexGrow = 1;
    var defaultFlexShrink = 1;
    var defaultFlexBasis = 0;
    var flex = function flex2(tokenStream) {
      var flexGrow;
      var flexShrink;
      var flexBasis;
      if (tokenStream.matches(NONE)) {
        tokenStream.expectEmpty();
        return {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "auto"
        };
      }
      tokenStream.saveRewindPoint();
      if (tokenStream.matches(AUTO) && !tokenStream.hasTokens()) {
        return {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: "auto"
        };
      }
      tokenStream.rewind();
      var partsParsed = 0;
      while (partsParsed < 2 && tokenStream.hasTokens()) {
        if (partsParsed !== 0) tokenStream.expect(SPACE);
        if (flexGrow === void 0 && tokenStream.matches(NUMBER)) {
          flexGrow = tokenStream.lastValue;
          tokenStream.saveRewindPoint();
          if (tokenStream.matches(SPACE) && tokenStream.matches(NUMBER)) {
            flexShrink = tokenStream.lastValue;
          } else {
            tokenStream.rewind();
          }
        } else if (flexBasis === void 0 && tokenStream.matches(LENGTH, UNSUPPORTED_LENGTH_UNIT, PERCENT)) {
          flexBasis = tokenStream.lastValue;
        } else if (flexBasis === void 0 && tokenStream.matches(AUTO)) {
          flexBasis = "auto";
        } else {
          tokenStream["throw"]();
        }
        partsParsed += 1;
      }
      tokenStream.expectEmpty();
      if (flexGrow === void 0) flexGrow = defaultFlexGrow;
      if (flexShrink === void 0) flexShrink = defaultFlexShrink;
      if (flexBasis === void 0) flexBasis = defaultFlexBasis;
      return {
        flexGrow,
        flexShrink,
        flexBasis
      };
    };
    var FLEX_WRAP = regExpToken(/(nowrap|wrap|wrap-reverse)/);
    var FLEX_DIRECTION = regExpToken(/(row|row-reverse|column|column-reverse)/);
    var defaultFlexWrap = "nowrap";
    var defaultFlexDirection = "row";
    var flexFlow = function flexFlow2(tokenStream) {
      var flexWrap;
      var flexDirection;
      var partsParsed = 0;
      while (partsParsed < 2 && tokenStream.hasTokens()) {
        if (partsParsed !== 0) tokenStream.expect(SPACE);
        if (flexWrap === void 0 && tokenStream.matches(FLEX_WRAP)) {
          flexWrap = tokenStream.lastValue;
        } else if (flexDirection === void 0 && tokenStream.matches(FLEX_DIRECTION)) {
          flexDirection = tokenStream.lastValue;
        } else {
          tokenStream["throw"]();
        }
        partsParsed += 1;
      }
      tokenStream.expectEmpty();
      if (flexWrap === void 0) flexWrap = defaultFlexWrap;
      if (flexDirection === void 0) flexDirection = defaultFlexDirection;
      return {
        flexWrap,
        flexDirection
      };
    };
    var fontFamily = function fontFamily2(tokenStream) {
      var fontFamily3;
      if (tokenStream.matches(STRING)) {
        fontFamily3 = tokenStream.lastValue;
      } else {
        fontFamily3 = tokenStream.expect(IDENT);
        while (tokenStream.hasTokens()) {
          tokenStream.expect(SPACE);
          var nextIdent = tokenStream.expect(IDENT);
          fontFamily3 += " " + nextIdent;
        }
      }
      tokenStream.expectEmpty();
      return {
        fontFamily: fontFamily3
      };
    };
    var NORMAL = regExpToken(/^(normal)$/);
    var STYLE = regExpToken(/^(italic)$/);
    var WEIGHT = regExpToken(/^([1-9]00|bold)$/);
    var VARIANT = regExpToken(/^(small-caps)$/);
    var defaultFontStyle = "normal";
    var defaultFontWeight = "normal";
    var defaultFontVariant = [];
    var font = function font2(tokenStream) {
      var fontStyle;
      var fontWeight2;
      var fontVariant2;
      var lineHeight;
      var numStyleWeightVariantMatched = 0;
      while (numStyleWeightVariantMatched < 3 && tokenStream.hasTokens()) {
        if (tokenStream.matches(NORMAL)) ;
        else if (fontStyle === void 0 && tokenStream.matches(STYLE)) {
          fontStyle = tokenStream.lastValue;
        } else if (fontWeight2 === void 0 && tokenStream.matches(WEIGHT)) {
          fontWeight2 = tokenStream.lastValue;
        } else if (fontVariant2 === void 0 && tokenStream.matches(VARIANT)) {
          fontVariant2 = [tokenStream.lastValue];
        } else {
          break;
        }
        tokenStream.expect(SPACE);
        numStyleWeightVariantMatched += 1;
      }
      var fontSize = tokenStream.expect(LENGTH, UNSUPPORTED_LENGTH_UNIT);
      if (tokenStream.matches(SLASH)) {
        lineHeight = tokenStream.expect(LENGTH, UNSUPPORTED_LENGTH_UNIT);
      }
      tokenStream.expect(SPACE);
      var _fontFamily = fontFamily(tokenStream), fontFamily$1 = _fontFamily.fontFamily;
      if (fontStyle === void 0) fontStyle = defaultFontStyle;
      if (fontWeight2 === void 0) fontWeight2 = defaultFontWeight;
      if (fontVariant2 === void 0) fontVariant2 = defaultFontVariant;
      var out = {
        fontStyle,
        fontWeight: fontWeight2,
        fontVariant: fontVariant2,
        fontSize,
        fontFamily: fontFamily$1
      };
      if (lineHeight !== void 0) out.lineHeight = lineHeight;
      return out;
    };
    var fontVariant = function fontVariant2(tokenStream) {
      var values = [tokenStream.expect(IDENT)];
      while (tokenStream.hasTokens()) {
        tokenStream.expect(SPACE);
        values.push(tokenStream.expect(IDENT));
      }
      return {
        fontVariant: values
      };
    };
    var ALIGN_CONTENT = regExpToken(/(flex-(?:start|end)|center|stretch|space-(?:between|around))/);
    var JUSTIFY_CONTENT = regExpToken(/(flex-(?:start|end)|center|space-(?:between|around|evenly))/);
    var placeContent = function placeContent2(tokenStream) {
      var alignContent = tokenStream.expect(ALIGN_CONTENT);
      var justifyContent;
      if (tokenStream.hasTokens()) {
        tokenStream.expect(SPACE);
        justifyContent = tokenStream.expect(JUSTIFY_CONTENT);
      } else {
        justifyContent = "stretch";
      }
      tokenStream.expectEmpty();
      return {
        alignContent,
        justifyContent
      };
    };
    var STYLE$1 = regExpToken(/^(solid|double|dotted|dashed)$/);
    var defaultTextDecorationLine = "none";
    var defaultTextDecorationStyle = "solid";
    var defaultTextDecorationColor = "black";
    var textDecoration = function textDecoration2(tokenStream) {
      var line;
      var style;
      var color;
      var didParseFirst = false;
      while (tokenStream.hasTokens()) {
        if (didParseFirst) tokenStream.expect(SPACE);
        if (line === void 0 && tokenStream.matches(LINE)) {
          var lines = [tokenStream.lastValue.toLowerCase()];
          tokenStream.saveRewindPoint();
          if (lines[0] !== "none" && tokenStream.matches(SPACE) && tokenStream.matches(LINE)) {
            lines.push(tokenStream.lastValue.toLowerCase());
            lines.sort().reverse();
          } else {
            tokenStream.rewind();
          }
          line = lines.join(" ");
        } else if (style === void 0 && tokenStream.matches(STYLE$1)) {
          style = tokenStream.lastValue;
        } else if (color === void 0 && tokenStream.matches(COLOR)) {
          color = tokenStream.lastValue;
        } else {
          tokenStream["throw"]();
        }
        didParseFirst = true;
      }
      return {
        textDecorationLine: line !== void 0 ? line : defaultTextDecorationLine,
        textDecorationColor: color !== void 0 ? color : defaultTextDecorationColor,
        textDecorationStyle: style !== void 0 ? style : defaultTextDecorationStyle
      };
    };
    var textDecorationLine = function textDecorationLine2(tokenStream) {
      var lines = [];
      var didParseFirst = false;
      while (tokenStream.hasTokens()) {
        if (didParseFirst) tokenStream.expect(SPACE);
        lines.push(tokenStream.expect(LINE).toLowerCase());
        didParseFirst = true;
      }
      lines.sort().reverse();
      return {
        textDecorationLine: lines.join(" ")
      };
    };
    var textShadow = function textShadow2(tokenStream) {
      var _parseShadow2 = parseShadow(tokenStream), offset = _parseShadow2.offset, radius = _parseShadow2.radius, color = _parseShadow2.color;
      return {
        textShadowOffset: offset,
        textShadowRadius: radius,
        textShadowColor: color
      };
    };
    var oneOfType = function oneOfType2(tokenType) {
      return function(functionStream) {
        var value = functionStream.expect(tokenType);
        functionStream.expectEmpty();
        return value;
      };
    };
    var singleNumber = oneOfType(NUMBER);
    var singleLength = oneOfType(LENGTH);
    var singleAngle = oneOfType(ANGLE);
    var xyTransformFactory = function xyTransformFactory2(tokenType) {
      return function(key, valueIfOmitted) {
        return function(functionStream) {
          var _ref3, _ref4;
          var x3 = functionStream.expect(tokenType);
          var y;
          if (functionStream.hasTokens()) {
            functionStream.expect(COMMA);
            y = functionStream.expect(tokenType);
          } else if (valueIfOmitted !== void 0) {
            y = valueIfOmitted;
          } else {
            return x3;
          }
          functionStream.expectEmpty();
          return [(_ref3 = {}, _ref3[key + "Y"] = y, _ref3), (_ref4 = {}, _ref4[key + "X"] = x3, _ref4)];
        };
      };
    };
    var xyNumber = xyTransformFactory(NUMBER);
    var xyLength = xyTransformFactory(LENGTH);
    var xyAngle = xyTransformFactory(ANGLE);
    var partTransforms = {
      perspective: singleNumber,
      scale: xyNumber("scale"),
      scaleX: singleNumber,
      scaleY: singleNumber,
      translate: xyLength("translate", 0),
      translateX: singleLength,
      translateY: singleLength,
      rotate: singleAngle,
      rotateX: singleAngle,
      rotateY: singleAngle,
      rotateZ: singleAngle,
      skewX: singleAngle,
      skewY: singleAngle,
      skew: xyAngle("skew", "0deg")
    };
    var transform = function transform2(tokenStream) {
      var transforms2 = [];
      var didParseFirst = false;
      while (tokenStream.hasTokens()) {
        if (didParseFirst) tokenStream.expect(SPACE);
        var functionStream = tokenStream.expectFunction();
        var functionName = functionStream.functionName;
        var transformedValues = partTransforms[functionName](functionStream);
        if (!Array.isArray(transformedValues)) {
          var _ref5;
          transformedValues = [(_ref5 = {}, _ref5[functionName] = transformedValues, _ref5)];
        }
        transforms2 = transformedValues.concat(transforms2);
        didParseFirst = true;
      }
      return {
        transform: transforms2
      };
    };
    var background = function background2(tokenStream) {
      return {
        backgroundColor: tokenStream.expect(COLOR)
      };
    };
    var borderColor = directionFactory({
      types: [COLOR],
      prefix: "border",
      suffix: "Color"
    });
    var borderRadius = directionFactory({
      directions: ["TopLeft", "TopRight", "BottomRight", "BottomLeft"],
      prefix: "border",
      suffix: "Radius"
    });
    var borderWidth = directionFactory({
      prefix: "border",
      suffix: "Width"
    });
    var margin = directionFactory({
      types: [LENGTH, UNSUPPORTED_LENGTH_UNIT, PERCENT, AUTO],
      prefix: "margin"
    });
    var padding = directionFactory({
      prefix: "padding"
    });
    var fontWeight = function fontWeight2(tokenStream) {
      return {
        fontWeight: tokenStream.expect(WORD)
        // Also match numbers as strings
      };
    };
    var shadowOffset = function shadowOffset2(tokenStream) {
      return {
        shadowOffset: parseShadowOffset(tokenStream)
      };
    };
    var textShadowOffset = function textShadowOffset2(tokenStream) {
      return {
        textShadowOffset: parseShadowOffset(tokenStream)
      };
    };
    var transforms = {
      aspectRatio,
      background,
      border,
      borderColor,
      borderRadius,
      borderWidth,
      boxShadow,
      flex,
      flexFlow,
      font,
      fontFamily,
      fontVariant,
      fontWeight,
      margin,
      padding,
      placeContent,
      shadowOffset,
      textShadow,
      textShadowOffset,
      textDecoration,
      textDecorationLine,
      transform
    };
    var propertiesWithoutUnits;
    if (process.env.NODE_ENV !== "production") {
      propertiesWithoutUnits = ["aspectRatio", "elevation", "flexGrow", "flexShrink", "opacity", "shadowOpacity", "zIndex"];
    }
    var devPropertiesWithUnitsRegExp = propertiesWithoutUnits != null ? new RegExp(propertiesWithoutUnits.join("|")) : null;
    var SYMBOL_MATCH = "SYMBOL_MATCH";
    var TokenStream = /* @__PURE__ */ (function() {
      function TokenStream2(nodes, parent) {
        this.index = 0;
        this.nodes = nodes;
        this.functionName = parent != null ? parent.value : null;
        this.lastValue = null;
        this.rewindIndex = -1;
      }
      var _proto = TokenStream2.prototype;
      _proto.hasTokens = function hasTokens() {
        return this.index <= this.nodes.length - 1;
      };
      _proto[SYMBOL_MATCH] = function() {
        if (!this.hasTokens()) return null;
        var node = this.nodes[this.index];
        for (var i2 = 0; i2 < arguments.length; i2 += 1) {
          var tokenDescriptor = i2 < 0 || arguments.length <= i2 ? void 0 : arguments[i2];
          var value = tokenDescriptor(node);
          if (value !== null) {
            this.index += 1;
            this.lastValue = value;
            return value;
          }
        }
        return null;
      };
      _proto.matches = function matches() {
        return this[SYMBOL_MATCH].apply(this, arguments) !== null;
      };
      _proto.expect = function expect() {
        var value = this[SYMBOL_MATCH].apply(this, arguments);
        return value !== null ? value : this["throw"]();
      };
      _proto.matchesFunction = function matchesFunction() {
        var node = this.nodes[this.index];
        if (node.type !== "function") return null;
        var value = new TokenStream2(node.nodes, node);
        this.index += 1;
        this.lastValue = null;
        return value;
      };
      _proto.expectFunction = function expectFunction() {
        var value = this.matchesFunction();
        return value !== null ? value : this["throw"]();
      };
      _proto.expectEmpty = function expectEmpty() {
        if (this.hasTokens()) this["throw"]();
      };
      _proto["throw"] = function _throw() {
        throw new Error("Unexpected token type: " + this.nodes[this.index].type);
      };
      _proto.saveRewindPoint = function saveRewindPoint() {
        this.rewindIndex = this.index;
      };
      _proto.rewind = function rewind() {
        if (this.rewindIndex === -1) throw new Error("Internal error");
        this.index = this.rewindIndex;
        this.lastValue = null;
      };
      return TokenStream2;
    })();
    var numberOrLengthRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?:px)?$/i;
    var numberOnlyRe = /^[+-]?(?:\d*\.\d*|[1-9]\d*)(?:e[+-]?\d+)?$/i;
    var boolRe = /^true|false$/i;
    var nullRe = /^null$/i;
    var undefinedRe = /^undefined$/i;
    var transformRawValue = function transformRawValue2(propName, value) {
      if (process.env.NODE_ENV !== "production") {
        var needsUnit = !devPropertiesWithUnitsRegExp.test(propName);
        var isNumberWithoutUnit = numberOnlyRe.test(value);
        if (needsUnit && isNumberWithoutUnit) {
          console.warn('Expected style "' + propName + ": " + value + '" to contain units');
        }
        if (!needsUnit && value !== "0" && !isNumberWithoutUnit) {
          console.warn('Expected style "' + propName + ": " + value + '" to be unitless');
        }
      }
      var numberMatch = value.match(numberOrLengthRe);
      if (numberMatch !== null) return Number(numberMatch[1]);
      var boolMatch = value.match(boolRe);
      if (boolMatch !== null) return boolMatch[0].toLowerCase() === "true";
      var nullMatch = value.match(nullRe);
      if (nullMatch !== null) return null;
      var undefinedMatch = value.match(undefinedRe);
      if (undefinedMatch !== null) return void 0;
      return value;
    };
    var baseTransformShorthandValue = function baseTransformShorthandValue2(propName, value) {
      var ast = parse__default(value);
      var tokenStream = new TokenStream(ast.nodes);
      return transforms[propName](tokenStream);
    };
    var transformShorthandValue = process.env.NODE_ENV === "production" ? baseTransformShorthandValue : function(propName, value) {
      try {
        return baseTransformShorthandValue(propName, value);
      } catch (e) {
        throw new Error('Failed to parse declaration "' + propName + ": " + value + '"');
      }
    };
    var getStylesForProperty = function getStylesForProperty2(propName, inputValue, allowShorthand) {
      var _ref6;
      var isRawValue = allowShorthand === false || !(propName in transforms);
      var value = inputValue.trim();
      var propValues = isRawValue ? (_ref6 = {}, _ref6[propName] = transformRawValue(propName, value), _ref6) : transformShorthandValue(propName, value);
      return propValues;
    };
    var getPropertyName = function getPropertyName2(propName) {
      var isCustomProp = /^--\w+/.test(propName);
      if (isCustomProp) {
        return propName;
      }
      return camelizeStyleName(propName);
    };
    var index = function index2(rules, shorthandBlacklist) {
      if (shorthandBlacklist === void 0) {
        shorthandBlacklist = [];
      }
      return rules.reduce(function(accum, rule) {
        var propertyName = getPropertyName(rule[0]);
        var value = rule[1];
        var allowShorthand = shorthandBlacklist.indexOf(propertyName) === -1;
        return Object.assign(accum, getStylesForProperty(propertyName, value, allowShorthand));
      }, {});
    };
    exports["default"] = index;
    exports.getPropertyName = getPropertyName;
    exports.getStylesForProperty = getStylesForProperty;
    exports.transformRawValue = transformRawValue;
  }
});

// node_modules/css-background-parser/index.js
var require_css_background_parser = __commonJS({
  "node_modules/css-background-parser/index.js"(exports, module) {
    (function(exports2) {
      function BackgroundList(backgrounds) {
        if (!(this instanceof BackgroundList)) {
          return new BackgroundList();
        }
        this.backgrounds = backgrounds || [];
      }
      BackgroundList.prototype.toString = function() {
        return this.backgrounds.join(", ");
      };
      function Background(props) {
        if (!(this instanceof Background)) {
          return new Background(props);
        }
        props = props || {};
        var bg2 = this;
        function defprop(name, defaultValue) {
          bg2[name] = name in props ? props[name] : defaultValue;
        }
        defprop("color", "");
        defprop("image", "none");
        defprop("attachment", "scroll");
        defprop("clip", "border-box");
        defprop("origin", "padding-box");
        defprop("position", "0% 0%");
        defprop("repeat", "repeat");
        defprop("size", "auto");
      }
      Background.prototype.toString = function() {
        var list = [
          this.image,
          this.repeat,
          this.attachment,
          this.position + " / " + this.size,
          this.origin,
          this.clip
        ];
        if (this.color) {
          list.unshift(this.color);
        }
        return list.join(" ");
      };
      exports2.BackgroundList = BackgroundList;
      exports2.Background = Background;
      function parseImages(cssText) {
        var images = [];
        var tokens = /[,\(\)]/;
        var parens = 0;
        var buffer = "";
        if (cssText == null) {
          return images;
        }
        while (cssText.length) {
          var match = tokens.exec(cssText);
          if (!match) {
            break;
          }
          var char = match[0];
          var ignoreChar = false;
          switch (char) {
            case ",":
              if (!parens) {
                images.push(buffer.trim());
                buffer = "";
                ignoreChar = true;
              }
              break;
            case "(":
              parens++;
              break;
            case ")":
              parens--;
              break;
          }
          var index = match.index + 1;
          buffer += cssText.slice(0, ignoreChar ? index - 1 : index);
          cssText = cssText.slice(index);
        }
        if (buffer.length || cssText.length) {
          images.push((buffer + cssText).trim());
        }
        return images;
      }
      function trim(str) {
        return str.trim();
      }
      function parseSimpleList(cssText) {
        return (cssText || "").split(",").map(trim);
      }
      exports2.parseElementStyle = function(styleObject) {
        var list = new BackgroundList();
        if (styleObject == null) {
          return list;
        }
        var bgImage = parseImages(styleObject.backgroundImage);
        var bgColor = styleObject.backgroundColor;
        var bgAttachment = parseSimpleList(styleObject.backgroundAttachment);
        var bgClip = parseSimpleList(styleObject.backgroundClip);
        var bgOrigin = parseSimpleList(styleObject.backgroundOrigin);
        var bgPosition = parseSimpleList(styleObject.backgroundPosition);
        var bgRepeat = parseSimpleList(styleObject.backgroundRepeat);
        var bgSize = parseSimpleList(styleObject.backgroundSize);
        var background;
        for (var i2 = 0, ii2 = bgImage.length; i2 < ii2; i2++) {
          background = new Background({
            image: bgImage[i2],
            attachment: bgAttachment[i2 % bgAttachment.length],
            clip: bgClip[i2 % bgClip.length],
            origin: bgOrigin[i2 % bgOrigin.length],
            position: bgPosition[i2 % bgPosition.length],
            repeat: bgRepeat[i2 % bgRepeat.length],
            size: bgSize[i2 % bgSize.length]
          });
          if (i2 === ii2 - 1) {
            background.color = bgColor;
          }
          list.backgrounds.push(background);
        }
        return list;
      };
    })((function(root) {
      if (typeof module !== "undefined" && module.exports !== void 0) return module.exports;
      return root.cssBgParser = {};
    })(exports));
  }
});

// node_modules/css-box-shadow/index.js
var require_css_box_shadow = __commonJS({
  "node_modules/css-box-shadow/index.js"(exports, module) {
    var VALUES_REG = /,(?![^\(]*\))/;
    var PARTS_REG = /\s(?![^(]*\))/;
    var LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;
    var parseValue = (str) => {
      const parts = str.split(PARTS_REG);
      const inset = parts.includes("inset");
      const last = parts.slice(-1)[0];
      const color = !isLength(last) ? last : void 0;
      const nums = parts.filter((n) => n !== "inset").filter((n) => n !== color).map(toNum);
      const [offsetX, offsetY, blurRadius, spreadRadius] = nums;
      return {
        inset,
        offsetX,
        offsetY,
        blurRadius,
        spreadRadius,
        color
      };
    };
    var stringifyValue = (obj) => {
      const {
        inset,
        offsetX = 0,
        offsetY = 0,
        blurRadius = 0,
        spreadRadius,
        color
      } = obj || {};
      return [
        inset ? "inset" : null,
        offsetX,
        offsetY,
        blurRadius,
        spreadRadius,
        color
      ].filter((v2) => v2 !== null && v2 !== void 0).map(toPx).map((s) => ("" + s).trim()).join(" ");
    };
    var isLength = (v2) => v2 === "0" || LENGTH_REG.test(v2);
    var toNum = (v2) => {
      if (!/px$/.test(v2) && v2 !== "0") return v2;
      const n = parseFloat(v2);
      return !isNaN(n) ? n : v2;
    };
    var toPx = (n) => typeof n === "number" && n !== 0 ? n + "px" : n;
    var parse = (str) => str.split(VALUES_REG).map((s) => s.trim()).map(parseValue);
    var stringify = (arr) => arr.map(stringifyValue).join(", ");
    module.exports = {
      parse,
      stringify
    };
  }
});

// node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/color-name/index.js"(exports, module) {
    "use strict";
    module.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/hex-rgb/index.js
var require_hex_rgb = __commonJS({
  "node_modules/hex-rgb/index.js"(exports, module) {
    "use strict";
    var hexCharacters = "a-f\\d";
    var match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`;
    var match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`;
    var nonHexChars = new RegExp(`[^#${hexCharacters}]`, "gi");
    var validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, "i");
    module.exports = (hex, options = {}) => {
      if (typeof hex !== "string" || nonHexChars.test(hex) || !validHexSize.test(hex)) {
        throw new TypeError("Expected a valid hex string");
      }
      hex = hex.replace(/^#/, "");
      let alphaFromHex = 1;
      if (hex.length === 8) {
        alphaFromHex = Number.parseInt(hex.slice(6, 8), 16) / 255;
        hex = hex.slice(0, 6);
      }
      if (hex.length === 4) {
        alphaFromHex = Number.parseInt(hex.slice(3, 4).repeat(2), 16) / 255;
        hex = hex.slice(0, 3);
      }
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const number = Number.parseInt(hex, 16);
      const red = number >> 16;
      const green = number >> 8 & 255;
      const blue = number & 255;
      const alpha = typeof options.alpha === "number" ? options.alpha : alphaFromHex;
      if (options.format === "array") {
        return [red, green, blue, alpha];
      }
      if (options.format === "css") {
        const alphaString = alpha === 1 ? "" : ` / ${Number((alpha * 100).toFixed(2))}%`;
        return `rgb(${red} ${green} ${blue}${alphaString})`;
      }
      return { red, green, blue, alpha };
    };
  }
});

// node_modules/parse-css-color/dist/index.cjs.js
var require_index_cjs = __commonJS({
  "node_modules/parse-css-color/dist/index.cjs.js"(exports, module) {
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var colorName = _interopDefault(require_color_name());
    var hex2Rgb = _interopDefault(require_hex_rgb());
    var pattern = /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/;
    var hexRe = new RegExp(pattern, "i");
    var float = "-?\\d*(?:\\.\\d+)";
    var number = `(${float}?)`;
    var percentage = `(${float}?%)`;
    var numberOrPercentage = `(${float}?%?)`;
    var pattern$1 = `^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*,
    \\s*${percentage}\\s*,
    \\s*${percentage}\\s*
    (?:,\\s*${numberOrPercentage}\\s*)?
  \\)
  $
`.replace(/\n|\s/g, "");
    var hsl3Re = new RegExp(pattern$1);
    var pattern$2 = `^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*
    \\s+${percentage}
    \\s+${percentage}
    \\s*(?:\\s*\\/\\s*${numberOrPercentage}\\s*)?
  \\)
  $
`.replace(/\n|\s/g, "");
    var hsl4Re = new RegExp(pattern$2);
    var pattern$3 = `^
  rgba?\\(
    \\s*${number}\\s*,
    \\s*${number}\\s*,
    \\s*${number}\\s*
    (?:,\\s*${numberOrPercentage}\\s*)?
  \\)
  $
`.replace(/\n|\s/g, "");
    var rgb3NumberRe = new RegExp(pattern$3);
    var pattern$4 = `^
  rgba?\\(
    \\s*${percentage}\\s*,
    \\s*${percentage}\\s*,
    \\s*${percentage}\\s*
    (?:,\\s*${numberOrPercentage}\\s*)?
  \\)
  $
`.replace(/\n|\s/g, "");
    var rgb3PercentageRe = new RegExp(pattern$4);
    var pattern$5 = `^
  rgba?\\(
    \\s*${number}
    \\s+${number}
    \\s+${number}
    \\s*(?:\\s*\\/\\s*${numberOrPercentage}\\s*)?
  \\)
$
`.replace(/\n|\s/g, "");
    var rgb4NumberRe = new RegExp(pattern$5);
    var pattern$6 = `^
  rgba?\\(
    \\s*${percentage}
    \\s+${percentage}
    \\s+${percentage}
    \\s*(?:\\s*\\/\\s*${numberOrPercentage}\\s*)?
  \\)
$
`.replace(/\n|\s/g, "");
    var rgb4PercentageRe = new RegExp(pattern$6);
    var pattern$7 = /^transparent$/;
    var transparentRe = new RegExp(pattern$7, "i");
    var clamp = (num, min, max2) => Math.min(Math.max(min, num), max2);
    var parseRGB = (num) => {
      let n = num;
      if (typeof n !== "number") n = n.endsWith("%") ? parseFloat(n) * 255 / 100 : parseFloat(n);
      return clamp(Math.round(n), 0, 255);
    };
    var parsePercentage = (percentage2) => clamp(parseFloat(percentage2), 0, 100);
    function parseAlpha(alpha) {
      let a = alpha;
      if (typeof a !== "number") a = a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a);
      return clamp(a, 0, 1);
    }
    function getHEX(hex) {
      const [r, g2, b, a] = hex2Rgb(hex, { format: "array" });
      return getRGB([null, ...[r, g2, b, a]]);
    }
    function getHSL([, h2, s, l2, a = 1]) {
      let hh = h2;
      if (hh.endsWith("turn")) {
        hh = parseFloat(hh) * 360 / 1;
      } else if (hh.endsWith("rad")) {
        hh = Math.round(parseFloat(hh) * 180 / Math.PI);
      } else {
        hh = parseFloat(hh);
      }
      return {
        type: "hsl",
        values: [hh, parsePercentage(s), parsePercentage(l2)],
        alpha: parseAlpha(a === null ? 1 : a)
      };
    }
    function getRGB([, r, g2, b, a = 1]) {
      return {
        type: "rgb",
        values: [r, g2, b].map(parseRGB),
        alpha: parseAlpha(a === null ? 1 : a)
      };
    }
    var parseCSSColor = (str) => {
      if (typeof str !== "string") return null;
      const hex = hexRe.exec(str);
      if (hex) return getHEX(hex[0]);
      const hsl = hsl4Re.exec(str) || hsl3Re.exec(str);
      if (hsl) return getHSL(hsl);
      const rgb = rgb4NumberRe.exec(str) || rgb4PercentageRe.exec(str) || rgb3NumberRe.exec(str) || rgb3PercentageRe.exec(str);
      if (rgb) return getRGB(rgb);
      if (transparentRe.exec(str)) return getRGB([null, 0, 0, 0, 0]);
      const cn2 = colorName[str.toLowerCase()];
      if (cn2) return getRGB([null, cn2[0], cn2[1], cn2[2], 1]);
      return null;
    };
    module.exports = parseCSSColor;
  }
});

// node_modules/@shuding/opentype.js/dist/opentype.js
var require_opentype = __commonJS({
  "node_modules/@shuding/opentype.js/dist/opentype.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = global || self, factory(global.opentype = {}));
    })(exports, (function(exports2) {
      "use strict";
      var u82 = Uint8Array, u162 = Uint16Array, u322 = Uint32Array;
      var fleb2 = new u82([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        5,
        0,
        /* unused */
        0,
        0,
        /* impossible */
        0
      ]);
      var fdeb2 = new u82([
        0,
        0,
        0,
        0,
        1,
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        8,
        8,
        9,
        9,
        10,
        10,
        11,
        11,
        12,
        12,
        13,
        13,
        /* unused */
        0,
        0
      ]);
      var clim2 = new u82([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var freb2 = function(eb, start) {
        var b = new u162(31);
        for (var i3 = 0; i3 < 31; ++i3) {
          b[i3] = start += 1 << eb[i3 - 1];
        }
        var r = new u322(b[30]);
        for (var i3 = 1; i3 < 30; ++i3) {
          for (var j = b[i3]; j < b[i3 + 1]; ++j) {
            r[j] = j - b[i3] << 5 | i3;
          }
        }
        return [b, r];
      };
      var _a3 = freb2(fleb2, 2), fl2 = _a3[0], revfl2 = _a3[1];
      fl2[28] = 258, revfl2[258] = 28;
      var _b2 = freb2(fdeb2, 0), fd2 = _b2[0];
      var rev2 = new u162(32768);
      for (var i2 = 0; i2 < 32768; ++i2) {
        var x3 = (i2 & 43690) >>> 1 | (i2 & 21845) << 1;
        x3 = (x3 & 52428) >>> 2 | (x3 & 13107) << 2;
        x3 = (x3 & 61680) >>> 4 | (x3 & 3855) << 4;
        rev2[i2] = ((x3 & 65280) >>> 8 | (x3 & 255) << 8) >>> 1;
      }
      var hMap2 = (function(cd, mb, r) {
        var s = cd.length;
        var i3 = 0;
        var l2 = new u162(mb);
        for (; i3 < s; ++i3) {
          if (cd[i3]) {
            ++l2[cd[i3] - 1];
          }
        }
        var le = new u162(mb);
        for (i3 = 0; i3 < mb; ++i3) {
          le[i3] = le[i3 - 1] + l2[i3 - 1] << 1;
        }
        var co;
        if (r) {
          co = new u162(1 << mb);
          var rvb = 15 - mb;
          for (i3 = 0; i3 < s; ++i3) {
            if (cd[i3]) {
              var sv = i3 << 4 | cd[i3];
              var r_1 = mb - cd[i3];
              var v2 = le[cd[i3] - 1]++ << r_1;
              for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
                co[rev2[v2] >>> rvb] = sv;
              }
            }
          }
        } else {
          co = new u162(s);
          for (i3 = 0; i3 < s; ++i3) {
            if (cd[i3]) {
              co[i3] = rev2[le[cd[i3] - 1]++] >>> 15 - cd[i3];
            }
          }
        }
        return co;
      });
      var flt2 = new u82(288);
      for (var i2 = 0; i2 < 144; ++i2) {
        flt2[i2] = 8;
      }
      for (var i2 = 144; i2 < 256; ++i2) {
        flt2[i2] = 9;
      }
      for (var i2 = 256; i2 < 280; ++i2) {
        flt2[i2] = 7;
      }
      for (var i2 = 280; i2 < 288; ++i2) {
        flt2[i2] = 8;
      }
      var fdt2 = new u82(32);
      for (var i2 = 0; i2 < 32; ++i2) {
        fdt2[i2] = 5;
      }
      var flrm2 = /* @__PURE__ */ hMap2(flt2, 9, 1);
      var fdrm2 = /* @__PURE__ */ hMap2(fdt2, 5, 1);
      var max2 = function(a) {
        var m2 = a[0];
        for (var i3 = 1; i3 < a.length; ++i3) {
          if (a[i3] > m2) {
            m2 = a[i3];
          }
        }
        return m2;
      };
      var bits2 = function(d2, p, m2) {
        var o = p / 8 | 0;
        return (d2[o] | d2[o + 1] << 8) >> (p & 7) & m2;
      };
      var bits162 = function(d2, p) {
        var o = p / 8 | 0;
        return (d2[o] | d2[o + 1] << 8 | d2[o + 2] << 16) >> (p & 7);
      };
      var shft2 = function(p) {
        return (p + 7) / 8 | 0;
      };
      var slc2 = function(v2, s, e) {
        if (s == null || s < 0) {
          s = 0;
        }
        if (e == null || e > v2.length) {
          e = v2.length;
        }
        var n = new (v2.BYTES_PER_ELEMENT == 2 ? u162 : v2.BYTES_PER_ELEMENT == 4 ? u322 : u82)(e - s);
        n.set(v2.subarray(s, e));
        return n;
      };
      var ec3 = [
        "unexpected EOF",
        "invalid block type",
        "invalid length/literal",
        "invalid distance",
        "stream finished",
        "no stream handler",
        ,
        "no callback",
        "invalid UTF-8 data",
        "extra field too long",
        "date not in range 1980-2099",
        "filename too long",
        "stream finishing",
        "invalid zip data"
        // determined by unknown compression method
      ];
      var err2 = function(ind, msg, nt) {
        var e = new Error(msg || ec3[ind]);
        e.code = ind;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(e, err2);
        }
        if (!nt) {
          throw e;
        }
        return e;
      };
      var inflt2 = function(dat, buf, st) {
        var sl2 = dat.length;
        if (!sl2 || st && st.f && !st.l) {
          return buf || new u82(0);
        }
        var noBuf = !buf || st;
        var noSt = !st || st.i;
        if (!st) {
          st = {};
        }
        if (!buf) {
          buf = new u82(sl2 * 3);
        }
        var cbuf = function(l3) {
          var bl2 = buf.length;
          if (l3 > bl2) {
            var nbuf = new u82(Math.max(bl2 * 2, l3));
            nbuf.set(buf);
            buf = nbuf;
          }
        };
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        var tbts = sl2 * 8;
        do {
          if (!lm) {
            final = bits2(dat, pos, 1);
            var type = bits2(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
              var s = shft2(pos) + 4, l2 = dat[s - 4] | dat[s - 3] << 8, t = s + l2;
              if (t > sl2) {
                if (noSt) {
                  err2(0);
                }
                break;
              }
              if (noBuf) {
                cbuf(bt + l2);
              }
              buf.set(dat.subarray(s, t), bt);
              st.b = bt += l2, st.p = pos = t * 8, st.f = final;
              continue;
            } else if (type == 1) {
              lm = flrm2, dm = fdrm2, lbt = 9, dbt = 5;
            } else if (type == 2) {
              var hLit = bits2(dat, pos, 31) + 257, hcLen = bits2(dat, pos + 10, 15) + 4;
              var tl2 = hLit + bits2(dat, pos + 5, 31) + 1;
              pos += 14;
              var ldt = new u82(tl2);
              var clt = new u82(19);
              for (var i3 = 0; i3 < hcLen; ++i3) {
                clt[clim2[i3]] = bits2(dat, pos + i3 * 3, 7);
              }
              pos += hcLen * 3;
              var clb = max2(clt), clbmsk = (1 << clb) - 1;
              var clm = hMap2(clt, clb, 1);
              for (var i3 = 0; i3 < tl2; ) {
                var r = clm[bits2(dat, pos, clbmsk)];
                pos += r & 15;
                var s = r >>> 4;
                if (s < 16) {
                  ldt[i3++] = s;
                } else {
                  var c2 = 0, n = 0;
                  if (s == 16) {
                    n = 3 + bits2(dat, pos, 3), pos += 2, c2 = ldt[i3 - 1];
                  } else if (s == 17) {
                    n = 3 + bits2(dat, pos, 7), pos += 3;
                  } else if (s == 18) {
                    n = 11 + bits2(dat, pos, 127), pos += 7;
                  }
                  while (n--) {
                    ldt[i3++] = c2;
                  }
                }
              }
              var lt2 = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
              lbt = max2(lt2);
              dbt = max2(dt);
              lm = hMap2(lt2, lbt, 1);
              dm = hMap2(dt, dbt, 1);
            } else {
              err2(1);
            }
            if (pos > tbts) {
              if (noSt) {
                err2(0);
              }
              break;
            }
          }
          if (noBuf) {
            cbuf(bt + 131072);
          }
          var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
          var lpos = pos;
          for (; ; lpos = pos) {
            var c2 = lm[bits162(dat, pos) & lms], sym = c2 >>> 4;
            pos += c2 & 15;
            if (pos > tbts) {
              if (noSt) {
                err2(0);
              }
              break;
            }
            if (!c2) {
              err2(2);
            }
            if (sym < 256) {
              buf[bt++] = sym;
            } else if (sym == 256) {
              lpos = pos, lm = null;
              break;
            } else {
              var add = sym - 254;
              if (sym > 264) {
                var i3 = sym - 257, b = fleb2[i3];
                add = bits2(dat, pos, (1 << b) - 1) + fl2[i3];
                pos += b;
              }
              var d2 = dm[bits162(dat, pos) & dms], dsym = d2 >>> 4;
              if (!d2) {
                err2(3);
              }
              pos += d2 & 15;
              var dt = fd2[dsym];
              if (dsym > 3) {
                var b = fdeb2[dsym];
                dt += bits162(dat, pos) & (1 << b) - 1, pos += b;
              }
              if (pos > tbts) {
                if (noSt) {
                  err2(0);
                }
                break;
              }
              if (noBuf) {
                cbuf(bt + 131072);
              }
              var end = bt + add;
              for (; bt < end; bt += 4) {
                buf[bt] = buf[bt - dt];
                buf[bt + 1] = buf[bt + 1 - dt];
                buf[bt + 2] = buf[bt + 2 - dt];
                buf[bt + 3] = buf[bt + 3 - dt];
              }
              bt = end;
            }
          }
          st.l = lm, st.p = lpos, st.b = bt, st.f = final;
          if (lm) {
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
          }
        } while (!final);
        return bt == buf.length ? buf : slc2(buf, 0, bt);
      };
      var et3 = /* @__PURE__ */ new u82(0);
      function inflateSync2(data, out) {
        return inflt2(data, out);
      }
      var td2 = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
      var tds2 = 0;
      try {
        td2.decode(et3, { stream: true });
        tds2 = 1;
      } catch (e) {
      }
      function Path() {
        this.commands = [];
        this.fill = "black";
        this.stroke = null;
        this.strokeWidth = 1;
      }
      Path.prototype.moveTo = function(x4, y) {
        this.commands.push({
          type: "M",
          x: x4,
          y
        });
      };
      Path.prototype.lineTo = function(x4, y) {
        this.commands.push({
          type: "L",
          x: x4,
          y
        });
      };
      Path.prototype.curveTo = Path.prototype.bezierCurveTo = function(x1, y1, x22, y2, x4, y) {
        this.commands.push({
          type: "C",
          x1,
          y1,
          x2: x22,
          y2,
          x: x4,
          y
        });
      };
      Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function(x1, y1, x4, y) {
        this.commands.push({
          type: "Q",
          x1,
          y1,
          x: x4,
          y
        });
      };
      Path.prototype.close = Path.prototype.closePath = function() {
        this.commands.push({
          type: "Z"
        });
      };
      Path.prototype.extend = function(pathOrCommands) {
        if (pathOrCommands.commands) {
          pathOrCommands = pathOrCommands.commands;
        }
        Array.prototype.push.apply(this.commands, pathOrCommands);
      };
      Path.prototype.toPathData = function(decimalPlaces) {
        decimalPlaces = decimalPlaces !== void 0 ? decimalPlaces : 2;
        function floatToString(v2) {
          if (Math.round(v2) === v2) {
            return "" + Math.round(v2);
          } else {
            return v2.toFixed(decimalPlaces);
          }
        }
        function packValues() {
          var arguments$1 = arguments;
          var s = "";
          for (var i4 = 0; i4 < arguments.length; i4 += 1) {
            var v2 = arguments$1[i4];
            if (v2 >= 0 && i4 > 0) {
              s += " ";
            }
            s += floatToString(v2);
          }
          return s;
        }
        var d2 = "";
        for (var i3 = 0; i3 < this.commands.length; i3 += 1) {
          var cmd = this.commands[i3];
          if (cmd.type === "M") {
            d2 += "M" + packValues(cmd.x, cmd.y);
          } else if (cmd.type === "L") {
            d2 += "L" + packValues(cmd.x, cmd.y);
          } else if (cmd.type === "C") {
            d2 += "C" + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
          } else if (cmd.type === "Q") {
            d2 += "Q" + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
          } else if (cmd.type === "Z") {
            d2 += "Z";
          }
        }
        return d2;
      };
      var cffStandardStrings = [
        ".notdef",
        "space",
        "exclam",
        "quotedbl",
        "numbersign",
        "dollar",
        "percent",
        "ampersand",
        "quoteright",
        "parenleft",
        "parenright",
        "asterisk",
        "plus",
        "comma",
        "hyphen",
        "period",
        "slash",
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "colon",
        "semicolon",
        "less",
        "equal",
        "greater",
        "question",
        "at",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "bracketleft",
        "backslash",
        "bracketright",
        "asciicircum",
        "underscore",
        "quoteleft",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "braceleft",
        "bar",
        "braceright",
        "asciitilde",
        "exclamdown",
        "cent",
        "sterling",
        "fraction",
        "yen",
        "florin",
        "section",
        "currency",
        "quotesingle",
        "quotedblleft",
        "guillemotleft",
        "guilsinglleft",
        "guilsinglright",
        "fi",
        "fl",
        "endash",
        "dagger",
        "daggerdbl",
        "periodcentered",
        "paragraph",
        "bullet",
        "quotesinglbase",
        "quotedblbase",
        "quotedblright",
        "guillemotright",
        "ellipsis",
        "perthousand",
        "questiondown",
        "grave",
        "acute",
        "circumflex",
        "tilde",
        "macron",
        "breve",
        "dotaccent",
        "dieresis",
        "ring",
        "cedilla",
        "hungarumlaut",
        "ogonek",
        "caron",
        "emdash",
        "AE",
        "ordfeminine",
        "Lslash",
        "Oslash",
        "OE",
        "ordmasculine",
        "ae",
        "dotlessi",
        "lslash",
        "oslash",
        "oe",
        "germandbls",
        "onesuperior",
        "logicalnot",
        "mu",
        "trademark",
        "Eth",
        "onehalf",
        "plusminus",
        "Thorn",
        "onequarter",
        "divide",
        "brokenbar",
        "degree",
        "thorn",
        "threequarters",
        "twosuperior",
        "registered",
        "minus",
        "eth",
        "multiply",
        "threesuperior",
        "copyright",
        "Aacute",
        "Acircumflex",
        "Adieresis",
        "Agrave",
        "Aring",
        "Atilde",
        "Ccedilla",
        "Eacute",
        "Ecircumflex",
        "Edieresis",
        "Egrave",
        "Iacute",
        "Icircumflex",
        "Idieresis",
        "Igrave",
        "Ntilde",
        "Oacute",
        "Ocircumflex",
        "Odieresis",
        "Ograve",
        "Otilde",
        "Scaron",
        "Uacute",
        "Ucircumflex",
        "Udieresis",
        "Ugrave",
        "Yacute",
        "Ydieresis",
        "Zcaron",
        "aacute",
        "acircumflex",
        "adieresis",
        "agrave",
        "aring",
        "atilde",
        "ccedilla",
        "eacute",
        "ecircumflex",
        "edieresis",
        "egrave",
        "iacute",
        "icircumflex",
        "idieresis",
        "igrave",
        "ntilde",
        "oacute",
        "ocircumflex",
        "odieresis",
        "ograve",
        "otilde",
        "scaron",
        "uacute",
        "ucircumflex",
        "udieresis",
        "ugrave",
        "yacute",
        "ydieresis",
        "zcaron",
        "exclamsmall",
        "Hungarumlautsmall",
        "dollaroldstyle",
        "dollarsuperior",
        "ampersandsmall",
        "Acutesmall",
        "parenleftsuperior",
        "parenrightsuperior",
        "266 ff",
        "onedotenleader",
        "zerooldstyle",
        "oneoldstyle",
        "twooldstyle",
        "threeoldstyle",
        "fouroldstyle",
        "fiveoldstyle",
        "sixoldstyle",
        "sevenoldstyle",
        "eightoldstyle",
        "nineoldstyle",
        "commasuperior",
        "threequartersemdash",
        "periodsuperior",
        "questionsmall",
        "asuperior",
        "bsuperior",
        "centsuperior",
        "dsuperior",
        "esuperior",
        "isuperior",
        "lsuperior",
        "msuperior",
        "nsuperior",
        "osuperior",
        "rsuperior",
        "ssuperior",
        "tsuperior",
        "ff",
        "ffi",
        "ffl",
        "parenleftinferior",
        "parenrightinferior",
        "Circumflexsmall",
        "hyphensuperior",
        "Gravesmall",
        "Asmall",
        "Bsmall",
        "Csmall",
        "Dsmall",
        "Esmall",
        "Fsmall",
        "Gsmall",
        "Hsmall",
        "Ismall",
        "Jsmall",
        "Ksmall",
        "Lsmall",
        "Msmall",
        "Nsmall",
        "Osmall",
        "Psmall",
        "Qsmall",
        "Rsmall",
        "Ssmall",
        "Tsmall",
        "Usmall",
        "Vsmall",
        "Wsmall",
        "Xsmall",
        "Ysmall",
        "Zsmall",
        "colonmonetary",
        "onefitted",
        "rupiah",
        "Tildesmall",
        "exclamdownsmall",
        "centoldstyle",
        "Lslashsmall",
        "Scaronsmall",
        "Zcaronsmall",
        "Dieresissmall",
        "Brevesmall",
        "Caronsmall",
        "Dotaccentsmall",
        "Macronsmall",
        "figuredash",
        "hypheninferior",
        "Ogoneksmall",
        "Ringsmall",
        "Cedillasmall",
        "questiondownsmall",
        "oneeighth",
        "threeeighths",
        "fiveeighths",
        "seveneighths",
        "onethird",
        "twothirds",
        "zerosuperior",
        "foursuperior",
        "fivesuperior",
        "sixsuperior",
        "sevensuperior",
        "eightsuperior",
        "ninesuperior",
        "zeroinferior",
        "oneinferior",
        "twoinferior",
        "threeinferior",
        "fourinferior",
        "fiveinferior",
        "sixinferior",
        "seveninferior",
        "eightinferior",
        "nineinferior",
        "centinferior",
        "dollarinferior",
        "periodinferior",
        "commainferior",
        "Agravesmall",
        "Aacutesmall",
        "Acircumflexsmall",
        "Atildesmall",
        "Adieresissmall",
        "Aringsmall",
        "AEsmall",
        "Ccedillasmall",
        "Egravesmall",
        "Eacutesmall",
        "Ecircumflexsmall",
        "Edieresissmall",
        "Igravesmall",
        "Iacutesmall",
        "Icircumflexsmall",
        "Idieresissmall",
        "Ethsmall",
        "Ntildesmall",
        "Ogravesmall",
        "Oacutesmall",
        "Ocircumflexsmall",
        "Otildesmall",
        "Odieresissmall",
        "OEsmall",
        "Oslashsmall",
        "Ugravesmall",
        "Uacutesmall",
        "Ucircumflexsmall",
        "Udieresissmall",
        "Yacutesmall",
        "Thornsmall",
        "Ydieresissmall",
        "001.000",
        "001.001",
        "001.002",
        "001.003",
        "Black",
        "Bold",
        "Book",
        "Light",
        "Medium",
        "Regular",
        "Roman",
        "Semibold"
      ];
      var cffStandardEncoding = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "space",
        "exclam",
        "quotedbl",
        "numbersign",
        "dollar",
        "percent",
        "ampersand",
        "quoteright",
        "parenleft",
        "parenright",
        "asterisk",
        "plus",
        "comma",
        "hyphen",
        "period",
        "slash",
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "colon",
        "semicolon",
        "less",
        "equal",
        "greater",
        "question",
        "at",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "bracketleft",
        "backslash",
        "bracketright",
        "asciicircum",
        "underscore",
        "quoteleft",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "braceleft",
        "bar",
        "braceright",
        "asciitilde",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "exclamdown",
        "cent",
        "sterling",
        "fraction",
        "yen",
        "florin",
        "section",
        "currency",
        "quotesingle",
        "quotedblleft",
        "guillemotleft",
        "guilsinglleft",
        "guilsinglright",
        "fi",
        "fl",
        "",
        "endash",
        "dagger",
        "daggerdbl",
        "periodcentered",
        "",
        "paragraph",
        "bullet",
        "quotesinglbase",
        "quotedblbase",
        "quotedblright",
        "guillemotright",
        "ellipsis",
        "perthousand",
        "",
        "questiondown",
        "",
        "grave",
        "acute",
        "circumflex",
        "tilde",
        "macron",
        "breve",
        "dotaccent",
        "dieresis",
        "",
        "ring",
        "cedilla",
        "",
        "hungarumlaut",
        "ogonek",
        "caron",
        "emdash",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "AE",
        "",
        "ordfeminine",
        "",
        "",
        "",
        "",
        "Lslash",
        "Oslash",
        "OE",
        "ordmasculine",
        "",
        "",
        "",
        "",
        "",
        "ae",
        "",
        "",
        "",
        "dotlessi",
        "",
        "",
        "lslash",
        "oslash",
        "oe",
        "germandbls"
      ];
      var cffExpertEncoding = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "space",
        "exclamsmall",
        "Hungarumlautsmall",
        "",
        "dollaroldstyle",
        "dollarsuperior",
        "ampersandsmall",
        "Acutesmall",
        "parenleftsuperior",
        "parenrightsuperior",
        "twodotenleader",
        "onedotenleader",
        "comma",
        "hyphen",
        "period",
        "fraction",
        "zerooldstyle",
        "oneoldstyle",
        "twooldstyle",
        "threeoldstyle",
        "fouroldstyle",
        "fiveoldstyle",
        "sixoldstyle",
        "sevenoldstyle",
        "eightoldstyle",
        "nineoldstyle",
        "colon",
        "semicolon",
        "commasuperior",
        "threequartersemdash",
        "periodsuperior",
        "questionsmall",
        "",
        "asuperior",
        "bsuperior",
        "centsuperior",
        "dsuperior",
        "esuperior",
        "",
        "",
        "isuperior",
        "",
        "",
        "lsuperior",
        "msuperior",
        "nsuperior",
        "osuperior",
        "",
        "",
        "rsuperior",
        "ssuperior",
        "tsuperior",
        "",
        "ff",
        "fi",
        "fl",
        "ffi",
        "ffl",
        "parenleftinferior",
        "",
        "parenrightinferior",
        "Circumflexsmall",
        "hyphensuperior",
        "Gravesmall",
        "Asmall",
        "Bsmall",
        "Csmall",
        "Dsmall",
        "Esmall",
        "Fsmall",
        "Gsmall",
        "Hsmall",
        "Ismall",
        "Jsmall",
        "Ksmall",
        "Lsmall",
        "Msmall",
        "Nsmall",
        "Osmall",
        "Psmall",
        "Qsmall",
        "Rsmall",
        "Ssmall",
        "Tsmall",
        "Usmall",
        "Vsmall",
        "Wsmall",
        "Xsmall",
        "Ysmall",
        "Zsmall",
        "colonmonetary",
        "onefitted",
        "rupiah",
        "Tildesmall",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "exclamdownsmall",
        "centoldstyle",
        "Lslashsmall",
        "",
        "",
        "Scaronsmall",
        "Zcaronsmall",
        "Dieresissmall",
        "Brevesmall",
        "Caronsmall",
        "",
        "Dotaccentsmall",
        "",
        "",
        "Macronsmall",
        "",
        "",
        "figuredash",
        "hypheninferior",
        "",
        "",
        "Ogoneksmall",
        "Ringsmall",
        "Cedillasmall",
        "",
        "",
        "",
        "onequarter",
        "onehalf",
        "threequarters",
        "questiondownsmall",
        "oneeighth",
        "threeeighths",
        "fiveeighths",
        "seveneighths",
        "onethird",
        "twothirds",
        "",
        "",
        "zerosuperior",
        "onesuperior",
        "twosuperior",
        "threesuperior",
        "foursuperior",
        "fivesuperior",
        "sixsuperior",
        "sevensuperior",
        "eightsuperior",
        "ninesuperior",
        "zeroinferior",
        "oneinferior",
        "twoinferior",
        "threeinferior",
        "fourinferior",
        "fiveinferior",
        "sixinferior",
        "seveninferior",
        "eightinferior",
        "nineinferior",
        "centinferior",
        "dollarinferior",
        "periodinferior",
        "commainferior",
        "Agravesmall",
        "Aacutesmall",
        "Acircumflexsmall",
        "Atildesmall",
        "Adieresissmall",
        "Aringsmall",
        "AEsmall",
        "Ccedillasmall",
        "Egravesmall",
        "Eacutesmall",
        "Ecircumflexsmall",
        "Edieresissmall",
        "Igravesmall",
        "Iacutesmall",
        "Icircumflexsmall",
        "Idieresissmall",
        "Ethsmall",
        "Ntildesmall",
        "Ogravesmall",
        "Oacutesmall",
        "Ocircumflexsmall",
        "Otildesmall",
        "Odieresissmall",
        "OEsmall",
        "Oslashsmall",
        "Ugravesmall",
        "Uacutesmall",
        "Ucircumflexsmall",
        "Udieresissmall",
        "Yacutesmall",
        "Thornsmall",
        "Ydieresissmall"
      ];
      function DefaultEncoding(font) {
        this.font = font;
      }
      DefaultEncoding.prototype.charToGlyphIndex = function(c2) {
        var code = c2.codePointAt(0);
        var glyphs = this.font.glyphs;
        if (glyphs) {
          for (var i3 = 0; i3 < glyphs.length; i3 += 1) {
            var glyph = glyphs.get(i3);
            for (var j = 0; j < glyph.unicodes.length; j += 1) {
              if (glyph.unicodes[j] === code) {
                return i3;
              }
            }
          }
        }
        return null;
      };
      function CmapEncoding(cmap2) {
        this.cmap = cmap2;
      }
      CmapEncoding.prototype.charToGlyphIndex = function(c2) {
        return this.cmap.glyphIndexMap[c2.codePointAt(0)] || 0;
      };
      function CffEncoding(encoding, charset) {
        this.encoding = encoding;
        this.charset = charset;
      }
      CffEncoding.prototype.charToGlyphIndex = function(s) {
        var code = s.codePointAt(0);
        var charName = this.encoding[code];
        return this.charset.indexOf(charName);
      };
      function addGlyphNamesAll(font) {
        var glyph;
        var glyphIndexMap = font.tables.cmap.glyphIndexMap;
        var charCodes = Object.keys(glyphIndexMap);
        for (var i3 = 0; i3 < charCodes.length; i3 += 1) {
          var c2 = charCodes[i3];
          var glyphIndex = glyphIndexMap[c2];
          glyph = font.glyphs.get(glyphIndex);
          glyph.addUnicode(parseInt(c2));
        }
      }
      function addGlyphNamesToUnicodeMap(font) {
        font._IndexToUnicodeMap = {};
        var glyphIndexMap = font.tables.cmap.glyphIndexMap;
        var charCodes = Object.keys(glyphIndexMap);
        for (var i3 = 0; i3 < charCodes.length; i3 += 1) {
          var c2 = charCodes[i3];
          var glyphIndex = glyphIndexMap[c2];
          if (font._IndexToUnicodeMap[glyphIndex] === void 0) {
            font._IndexToUnicodeMap[glyphIndex] = {
              unicodes: [parseInt(c2)]
            };
          } else {
            font._IndexToUnicodeMap[glyphIndex].unicodes.push(parseInt(c2));
          }
        }
      }
      function addGlyphNames(font, opt) {
        if (opt.lowMemory) {
          addGlyphNamesToUnicodeMap(font);
        } else {
          addGlyphNamesAll(font);
        }
      }
      function fail(message) {
        throw new Error(message);
      }
      function argument(predicate, message) {
        if (!predicate) {
          fail(message);
        }
      }
      var check = { fail, argument, assert: argument };
      function getPathDefinition(glyph, path) {
        var _path = path || new Path();
        return {
          configurable: true,
          get: function() {
            if (typeof _path === "function") {
              _path = _path();
            }
            return _path;
          },
          set: function(p) {
            _path = p;
          }
        };
      }
      function Glyph(options) {
        this.bindConstructorValues(options);
      }
      Glyph.prototype.bindConstructorValues = function(options) {
        this.index = options.index || 0;
        this.name = options.name || null;
        this.unicode = options.unicode || void 0;
        this.unicodes = options.unicodes || options.unicode !== void 0 ? [options.unicode] : [];
        if ("xMin" in options) {
          this.xMin = options.xMin;
        }
        if ("yMin" in options) {
          this.yMin = options.yMin;
        }
        if ("xMax" in options) {
          this.xMax = options.xMax;
        }
        if ("yMax" in options) {
          this.yMax = options.yMax;
        }
        if ("advanceWidth" in options) {
          this.advanceWidth = options.advanceWidth;
        }
        Object.defineProperty(this, "path", getPathDefinition(this, options.path));
      };
      Glyph.prototype.addUnicode = function(unicode) {
        if (this.unicodes.length === 0) {
          this.unicode = unicode;
        }
        this.unicodes.push(unicode);
      };
      Glyph.prototype.getPath = function(x4, y, fontSize, options, font) {
        x4 = x4 !== void 0 ? x4 : 0;
        y = y !== void 0 ? y : 0;
        fontSize = fontSize !== void 0 ? fontSize : 72;
        var commands;
        var hPoints;
        if (!options) {
          options = {};
        }
        var xScale = options.xScale;
        var yScale = options.yScale;
        if (options.hinting && font && font.hinting) {
          hPoints = this.path && font.hinting.exec(this, fontSize);
        }
        if (hPoints) {
          commands = font.hinting.getCommands(hPoints);
          x4 = Math.round(x4);
          y = Math.round(y);
          xScale = yScale = 1;
        } else {
          commands = this.path.commands;
          var scale = 1 / (this.path.unitsPerEm || 1e3) * fontSize;
          if (xScale === void 0) {
            xScale = scale;
          }
          if (yScale === void 0) {
            yScale = scale;
          }
        }
        var p = new Path();
        for (var i3 = 0; i3 < commands.length; i3 += 1) {
          var cmd = commands[i3];
          if (cmd.type === "M") {
            p.moveTo(x4 + cmd.x * xScale, y + -cmd.y * yScale);
          } else if (cmd.type === "L") {
            p.lineTo(x4 + cmd.x * xScale, y + -cmd.y * yScale);
          } else if (cmd.type === "Q") {
            p.quadraticCurveTo(
              x4 + cmd.x1 * xScale,
              y + -cmd.y1 * yScale,
              x4 + cmd.x * xScale,
              y + -cmd.y * yScale
            );
          } else if (cmd.type === "C") {
            p.curveTo(
              x4 + cmd.x1 * xScale,
              y + -cmd.y1 * yScale,
              x4 + cmd.x2 * xScale,
              y + -cmd.y2 * yScale,
              x4 + cmd.x * xScale,
              y + -cmd.y * yScale
            );
          } else if (cmd.type === "Z") {
            p.closePath();
          }
        }
        return p;
      };
      Glyph.prototype.getContours = function() {
        if (this.points === void 0) {
          return [];
        }
        var contours = [];
        var currentContour = [];
        for (var i3 = 0; i3 < this.points.length; i3 += 1) {
          var pt = this.points[i3];
          currentContour.push(pt);
          if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
          }
        }
        check.argument(
          currentContour.length === 0,
          "There are still points left in the current contour."
        );
        return contours;
      };
      Glyph.prototype.getMetrics = function() {
        var commands = this.path.commands;
        var xCoords = [];
        var yCoords = [];
        for (var i3 = 0; i3 < commands.length; i3 += 1) {
          var cmd = commands[i3];
          if (cmd.type !== "Z") {
            xCoords.push(cmd.x);
            yCoords.push(cmd.y);
          }
          if (cmd.type === "Q" || cmd.type === "C") {
            xCoords.push(cmd.x1);
            yCoords.push(cmd.y1);
          }
          if (cmd.type === "C") {
            xCoords.push(cmd.x2);
            yCoords.push(cmd.y2);
          }
        }
        var metrics = {
          xMin: Math.min.apply(null, xCoords),
          yMin: Math.min.apply(null, yCoords),
          xMax: Math.max.apply(null, xCoords),
          yMax: Math.max.apply(null, yCoords),
          leftSideBearing: this.leftSideBearing
        };
        if (!isFinite(metrics.xMin)) {
          metrics.xMin = 0;
        }
        if (!isFinite(metrics.xMax)) {
          metrics.xMax = this.advanceWidth;
        }
        if (!isFinite(metrics.yMin)) {
          metrics.yMin = 0;
        }
        if (!isFinite(metrics.yMax)) {
          metrics.yMax = 0;
        }
        metrics.rightSideBearing = this.advanceWidth - metrics.leftSideBearing - (metrics.xMax - metrics.xMin);
        return metrics;
      };
      function defineDependentProperty(glyph, externalName, internalName) {
        Object.defineProperty(glyph, externalName, {
          get: function() {
            glyph.path;
            return glyph[internalName];
          },
          set: function(newValue) {
            glyph[internalName] = newValue;
          },
          enumerable: true,
          configurable: true
        });
      }
      function GlyphSet(font, glyphs) {
        this.font = font;
        this.glyphs = {};
        if (Array.isArray(glyphs)) {
          for (var i3 = 0; i3 < glyphs.length; i3++) {
            var glyph = glyphs[i3];
            glyph.path.unitsPerEm = font.unitsPerEm;
            this.glyphs[i3] = glyph;
          }
        }
        this.length = glyphs && glyphs.length || 0;
      }
      GlyphSet.prototype.get = function(index) {
        if (this.glyphs[index] === void 0) {
          this.font._push(index);
          if (typeof this.glyphs[index] === "function") {
            this.glyphs[index] = this.glyphs[index]();
          }
          var glyph = this.glyphs[index];
          var unicodeObj = this.font._IndexToUnicodeMap[index];
          if (unicodeObj) {
            for (var j = 0; j < unicodeObj.unicodes.length; j++) {
              glyph.addUnicode(unicodeObj.unicodes[j]);
            }
          }
          this.glyphs[index].advanceWidth = this.font._hmtxTableData[index].advanceWidth;
          this.glyphs[index].leftSideBearing = this.font._hmtxTableData[index].leftSideBearing;
        } else {
          if (typeof this.glyphs[index] === "function") {
            this.glyphs[index] = this.glyphs[index]();
          }
        }
        return this.glyphs[index];
      };
      GlyphSet.prototype.push = function(index, loader) {
        this.glyphs[index] = loader;
        this.length++;
      };
      function glyphLoader(font, index) {
        return new Glyph({ index, font });
      }
      function ttfGlyphLoader(font, index, parseGlyph2, data, position, buildPath2) {
        return function() {
          var glyph = new Glyph({ index, font });
          glyph.path = function() {
            parseGlyph2(glyph, data, position);
            var path = buildPath2(font.glyphs, glyph);
            path.unitsPerEm = font.unitsPerEm;
            return path;
          };
          defineDependentProperty(glyph, "xMin", "_xMin");
          defineDependentProperty(glyph, "xMax", "_xMax");
          defineDependentProperty(glyph, "yMin", "_yMin");
          defineDependentProperty(glyph, "yMax", "_yMax");
          return glyph;
        };
      }
      function cffGlyphLoader(font, index, parseCFFCharstring2, charstring) {
        return function() {
          var glyph = new Glyph({ index, font });
          glyph.path = function() {
            var path = parseCFFCharstring2(font, glyph, charstring);
            path.unitsPerEm = font.unitsPerEm;
            return path;
          };
          return glyph;
        };
      }
      var glyphset = { GlyphSet, glyphLoader, ttfGlyphLoader, cffGlyphLoader };
      function searchTag(arr, tag) {
        var imin = 0;
        var imax = arr.length - 1;
        while (imin <= imax) {
          var imid = imin + imax >>> 1;
          var val = arr[imid].tag;
          if (val === tag) {
            return imid;
          } else if (val < tag) {
            imin = imid + 1;
          } else {
            imax = imid - 1;
          }
        }
        return -imin - 1;
      }
      function binSearch(arr, value) {
        var imin = 0;
        var imax = arr.length - 1;
        while (imin <= imax) {
          var imid = imin + imax >>> 1;
          var val = arr[imid];
          if (val === value) {
            return imid;
          } else if (val < value) {
            imin = imid + 1;
          } else {
            imax = imid - 1;
          }
        }
        return -imin - 1;
      }
      function searchRange(ranges, value) {
        var range;
        var imin = 0;
        var imax = ranges.length - 1;
        while (imin <= imax) {
          var imid = imin + imax >>> 1;
          range = ranges[imid];
          var start = range.start;
          if (start === value) {
            return range;
          } else if (start < value) {
            imin = imid + 1;
          } else {
            imax = imid - 1;
          }
        }
        if (imin > 0) {
          range = ranges[imin - 1];
          if (value > range.end) {
            return 0;
          }
          return range;
        }
      }
      function Layout(font, tableName) {
        this.font = font;
        this.tableName = tableName;
      }
      Layout.prototype = {
        /**
         * Binary search an object by "tag" property
         * @instance
         * @function searchTag
         * @memberof opentype.Layout
         * @param  {Array} arr
         * @param  {string} tag
         * @return {number}
         */
        searchTag,
        /**
         * Binary search in a list of numbers
         * @instance
         * @function binSearch
         * @memberof opentype.Layout
         * @param  {Array} arr
         * @param  {number} value
         * @return {number}
         */
        binSearch,
        /**
         * Get or create the Layout table (GSUB, GPOS etc).
         * @param  {boolean} create - Whether to create a new one.
         * @return {Object} The GSUB or GPOS table.
         */
        getTable: function(create) {
          var layout = this.font.tables[this.tableName];
          if (!layout && create) {
            layout = this.font.tables[this.tableName] = this.createDefaultTable();
          }
          return layout;
        },
        /**
         * Returns the best bet for a script name.
         * Returns 'DFLT' if it exists.
         * If not, returns 'latn' if it exists.
         * If neither exist, returns undefined.
         */
        getDefaultScriptName: function() {
          var layout = this.getTable();
          if (!layout) {
            return;
          }
          var hasLatn = false;
          for (var i3 = 0; i3 < layout.scripts.length; i3++) {
            var name = layout.scripts[i3].tag;
            if (name === "DFLT") {
              return name;
            }
            if (name === "latn") {
              hasLatn = true;
            }
          }
          if (hasLatn) {
            return "latn";
          }
        },
        /**
         * Returns all LangSysRecords in the given script.
         * @instance
         * @param {string} [script='DFLT']
         * @param {boolean} create - forces the creation of this script table if it doesn't exist.
         * @return {Object} An object with tag and script properties.
         */
        getScriptTable: function(script, create) {
          var layout = this.getTable(create);
          if (layout) {
            script = script || "DFLT";
            var scripts = layout.scripts;
            var pos = searchTag(layout.scripts, script);
            if (pos >= 0) {
              return scripts[pos].script;
            } else if (create) {
              var scr = {
                tag: script,
                script: {
                  defaultLangSys: {
                    reserved: 0,
                    reqFeatureIndex: 65535,
                    featureIndexes: []
                  },
                  langSysRecords: []
                }
              };
              scripts.splice(-1 - pos, 0, scr);
              return scr.script;
            }
          }
        },
        /**
         * Returns a language system table
         * @instance
         * @param {string} [script='DFLT']
         * @param {string} [language='dlft']
         * @param {boolean} create - forces the creation of this langSysTable if it doesn't exist.
         * @return {Object}
         */
        getLangSysTable: function(script, language, create) {
          var scriptTable = this.getScriptTable(script, create);
          if (scriptTable) {
            if (!language || language === "dflt" || language === "DFLT") {
              return scriptTable.defaultLangSys;
            }
            var pos = searchTag(scriptTable.langSysRecords, language);
            if (pos >= 0) {
              return scriptTable.langSysRecords[pos].langSys;
            } else if (create) {
              var langSysRecord = {
                tag: language,
                langSys: {
                  reserved: 0,
                  reqFeatureIndex: 65535,
                  featureIndexes: []
                }
              };
              scriptTable.langSysRecords.splice(-1 - pos, 0, langSysRecord);
              return langSysRecord.langSys;
            }
          }
        },
        /**
         * Get a specific feature table.
         * @instance
         * @param {string} [script='DFLT']
         * @param {string} [language='dlft']
         * @param {string} feature - One of the codes listed at https://www.microsoft.com/typography/OTSPEC/featurelist.htm
         * @param {boolean} create - forces the creation of the feature table if it doesn't exist.
         * @return {Object}
         */
        getFeatureTable: function(script, language, feature, create) {
          var langSysTable2 = this.getLangSysTable(script, language, create);
          if (langSysTable2) {
            var featureRecord;
            var featIndexes = langSysTable2.featureIndexes;
            var allFeatures = this.font.tables[this.tableName].features;
            for (var i3 = 0; i3 < featIndexes.length; i3++) {
              featureRecord = allFeatures[featIndexes[i3]];
              if (featureRecord.tag === feature) {
                return featureRecord.feature;
              }
            }
            if (create) {
              var index = allFeatures.length;
              check.assert(
                index === 0 || feature >= allFeatures[index - 1].tag,
                "Features must be added in alphabetical order."
              );
              featureRecord = {
                tag: feature,
                feature: { params: 0, lookupListIndexes: [] }
              };
              allFeatures.push(featureRecord);
              featIndexes.push(index);
              return featureRecord.feature;
            }
          }
        },
        /**
         * Get the lookup tables of a given type for a script/language/feature.
         * @instance
         * @param {string} [script='DFLT']
         * @param {string} [language='dlft']
         * @param {string} feature - 4-letter feature code
         * @param {number} lookupType - 1 to 9
         * @param {boolean} create - forces the creation of the lookup table if it doesn't exist, with no subtables.
         * @return {Object[]}
         */
        getLookupTables: function(script, language, feature, lookupType, create) {
          var featureTable = this.getFeatureTable(
            script,
            language,
            feature,
            create
          );
          var tables = [];
          if (featureTable) {
            var lookupTable;
            var lookupListIndexes = featureTable.lookupListIndexes;
            var allLookups = this.font.tables[this.tableName].lookups;
            for (var i3 = 0; i3 < lookupListIndexes.length; i3++) {
              lookupTable = allLookups[lookupListIndexes[i3]];
              if (lookupTable.lookupType === lookupType) {
                tables.push(lookupTable);
              }
            }
            if (tables.length === 0 && create) {
              lookupTable = {
                lookupType,
                lookupFlag: 0,
                subtables: [],
                markFilteringSet: void 0
              };
              var index = allLookups.length;
              allLookups.push(lookupTable);
              lookupListIndexes.push(index);
              return [lookupTable];
            }
          }
          return tables;
        },
        /**
         * Find a glyph in a class definition table
         * https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#class-definition-table
         * @param {object} classDefTable - an OpenType Layout class definition table
         * @param {number} glyphIndex - the index of the glyph to find
         * @returns {number} -1 if not found
         */
        getGlyphClass: function(classDefTable, glyphIndex) {
          switch (classDefTable.format) {
            case 1:
              if (classDefTable.startGlyph <= glyphIndex && glyphIndex < classDefTable.startGlyph + classDefTable.classes.length) {
                return classDefTable.classes[glyphIndex - classDefTable.startGlyph];
              }
              return 0;
            case 2:
              var range = searchRange(classDefTable.ranges, glyphIndex);
              return range ? range.classId : 0;
          }
        },
        /**
         * Find a glyph in a coverage table
         * https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-table
         * @param {object} coverageTable - an OpenType Layout coverage table
         * @param {number} glyphIndex - the index of the glyph to find
         * @returns {number} -1 if not found
         */
        getCoverageIndex: function(coverageTable, glyphIndex) {
          switch (coverageTable.format) {
            case 1:
              var index = binSearch(coverageTable.glyphs, glyphIndex);
              return index >= 0 ? index : -1;
            case 2:
              var range = searchRange(coverageTable.ranges, glyphIndex);
              return range ? range.index + glyphIndex - range.start : -1;
          }
        },
        /**
         * Returns the list of glyph indexes of a coverage table.
         * Format 1: the list is stored raw
         * Format 2: compact list as range records.
         * @instance
         * @param  {Object} coverageTable
         * @return {Array}
         */
        expandCoverage: function(coverageTable) {
          if (coverageTable.format === 1) {
            return coverageTable.glyphs;
          } else {
            var glyphs = [];
            var ranges = coverageTable.ranges;
            for (var i3 = 0; i3 < ranges.length; i3++) {
              var range = ranges[i3];
              var start = range.start;
              var end = range.end;
              for (var j = start; j <= end; j++) {
                glyphs.push(j);
              }
            }
            return glyphs;
          }
        }
      };
      function Position(font) {
        Layout.call(this, font, "gpos");
      }
      Position.prototype = Layout.prototype;
      Position.prototype.init = function() {
        var script = this.getDefaultScriptName();
        this.defaultKerningTables = this.getKerningTables(script);
      };
      Position.prototype.getKerningValue = function(kerningLookups, leftIndex, rightIndex) {
        for (var i3 = 0; i3 < kerningLookups.length; i3++) {
          var subtables = kerningLookups[i3].subtables;
          for (var j = 0; j < subtables.length; j++) {
            var subtable = subtables[j];
            var covIndex = this.getCoverageIndex(subtable.coverage, leftIndex);
            if (covIndex < 0) {
              continue;
            }
            switch (subtable.posFormat) {
              case 1:
                var pairSet = subtable.pairSets[covIndex];
                for (var k = 0; k < pairSet.length; k++) {
                  var pair = pairSet[k];
                  if (pair.secondGlyph === rightIndex) {
                    return pair.value1 && pair.value1.xAdvance || 0;
                  }
                }
                break;
              // left glyph found, not right glyph - try next subtable
              case 2:
                var class1 = this.getGlyphClass(subtable.classDef1, leftIndex);
                var class2 = this.getGlyphClass(subtable.classDef2, rightIndex);
                var pair$1 = subtable.classRecords[class1][class2];
                return pair$1.value1 && pair$1.value1.xAdvance || 0;
            }
          }
        }
        return 0;
      };
      Position.prototype.getKerningTables = function(script, language) {
        if (this.font.tables.gpos) {
          return this.getLookupTables(script, language, "kern", 2);
        }
      };
      function Substitution(font) {
        Layout.call(this, font, "gsub");
      }
      function arraysEqual(ar1, ar2) {
        var n = ar1.length;
        if (n !== ar2.length) {
          return false;
        }
        for (var i3 = 0; i3 < n; i3++) {
          if (ar1[i3] !== ar2[i3]) {
            return false;
          }
        }
        return true;
      }
      function getSubstFormat(lookupTable, format, defaultSubtable) {
        var subtables = lookupTable.subtables;
        for (var i3 = 0; i3 < subtables.length; i3++) {
          var subtable = subtables[i3];
          if (subtable.substFormat === format) {
            return subtable;
          }
        }
        if (defaultSubtable) {
          subtables.push(defaultSubtable);
          return defaultSubtable;
        }
        return void 0;
      }
      Substitution.prototype = Layout.prototype;
      Substitution.prototype.createDefaultTable = function() {
        return {
          version: 1,
          scripts: [
            {
              tag: "DFLT",
              script: {
                defaultLangSys: {
                  reserved: 0,
                  reqFeatureIndex: 65535,
                  featureIndexes: []
                },
                langSysRecords: []
              }
            }
          ],
          features: [],
          lookups: []
        };
      };
      Substitution.prototype.getSingle = function(feature, script, language) {
        var substitutions = [];
        var lookupTables = this.getLookupTables(script, language, feature, 1);
        for (var idx = 0; idx < lookupTables.length; idx++) {
          var subtables = lookupTables[idx].subtables;
          for (var i3 = 0; i3 < subtables.length; i3++) {
            var subtable = subtables[i3];
            var glyphs = this.expandCoverage(subtable.coverage);
            var j = void 0;
            if (subtable.substFormat === 1) {
              var delta = subtable.deltaGlyphId;
              for (j = 0; j < glyphs.length; j++) {
                var glyph = glyphs[j];
                substitutions.push({ sub: glyph, by: glyph + delta });
              }
            } else {
              var substitute = subtable.substitute;
              for (j = 0; j < glyphs.length; j++) {
                substitutions.push({ sub: glyphs[j], by: substitute[j] });
              }
            }
          }
        }
        return substitutions;
      };
      Substitution.prototype.getMultiple = function(feature, script, language) {
        var substitutions = [];
        var lookupTables = this.getLookupTables(script, language, feature, 2);
        for (var idx = 0; idx < lookupTables.length; idx++) {
          var subtables = lookupTables[idx].subtables;
          for (var i3 = 0; i3 < subtables.length; i3++) {
            var subtable = subtables[i3];
            var glyphs = this.expandCoverage(subtable.coverage);
            var j = void 0;
            for (j = 0; j < glyphs.length; j++) {
              var glyph = glyphs[j];
              var replacements = subtable.sequences[j];
              substitutions.push({ sub: glyph, by: replacements });
            }
          }
        }
        return substitutions;
      };
      Substitution.prototype.getAlternates = function(feature, script, language) {
        var alternates = [];
        var lookupTables = this.getLookupTables(script, language, feature, 3);
        for (var idx = 0; idx < lookupTables.length; idx++) {
          var subtables = lookupTables[idx].subtables;
          for (var i3 = 0; i3 < subtables.length; i3++) {
            var subtable = subtables[i3];
            var glyphs = this.expandCoverage(subtable.coverage);
            var alternateSets = subtable.alternateSets;
            for (var j = 0; j < glyphs.length; j++) {
              alternates.push({ sub: glyphs[j], by: alternateSets[j] });
            }
          }
        }
        return alternates;
      };
      Substitution.prototype.getLigatures = function(feature, script, language) {
        var ligatures = [];
        var lookupTables = this.getLookupTables(script, language, feature, 4);
        for (var idx = 0; idx < lookupTables.length; idx++) {
          var subtables = lookupTables[idx].subtables;
          for (var i3 = 0; i3 < subtables.length; i3++) {
            var subtable = subtables[i3];
            var glyphs = this.expandCoverage(subtable.coverage);
            var ligatureSets = subtable.ligatureSets;
            for (var j = 0; j < glyphs.length; j++) {
              var startGlyph = glyphs[j];
              var ligSet = ligatureSets[j];
              for (var k = 0; k < ligSet.length; k++) {
                var lig = ligSet[k];
                ligatures.push({
                  sub: [startGlyph].concat(lig.components),
                  by: lig.ligGlyph
                });
              }
            }
          }
        }
        return ligatures;
      };
      Substitution.prototype.addSingle = function(feature, substitution, script, language) {
        var lookupTable = this.getLookupTables(
          script,
          language,
          feature,
          1,
          true
        )[0];
        var subtable = getSubstFormat(lookupTable, 2, {
          // lookup type 1 subtable, format 2, coverage format 1
          substFormat: 2,
          coverage: { format: 1, glyphs: [] },
          substitute: []
        });
        check.assert(
          subtable.coverage.format === 1,
          "Single: unable to modify coverage table format " + subtable.coverage.format
        );
        var coverageGlyph = substitution.sub;
        var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
        if (pos < 0) {
          pos = -1 - pos;
          subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
          subtable.substitute.splice(pos, 0, 0);
        }
        subtable.substitute[pos] = substitution.by;
      };
      Substitution.prototype.addMultiple = function(feature, substitution, script, language) {
        check.assert(
          substitution.by instanceof Array && substitution.by.length > 1,
          'Multiple: "by" must be an array of two or more ids'
        );
        var lookupTable = this.getLookupTables(
          script,
          language,
          feature,
          2,
          true
        )[0];
        var subtable = getSubstFormat(lookupTable, 1, {
          // lookup type 2 subtable, format 1, coverage format 1
          substFormat: 1,
          coverage: { format: 1, glyphs: [] },
          sequences: []
        });
        check.assert(
          subtable.coverage.format === 1,
          "Multiple: unable to modify coverage table format " + subtable.coverage.format
        );
        var coverageGlyph = substitution.sub;
        var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
        if (pos < 0) {
          pos = -1 - pos;
          subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
          subtable.sequences.splice(pos, 0, 0);
        }
        subtable.sequences[pos] = substitution.by;
      };
      Substitution.prototype.addAlternate = function(feature, substitution, script, language) {
        var lookupTable = this.getLookupTables(
          script,
          language,
          feature,
          3,
          true
        )[0];
        var subtable = getSubstFormat(lookupTable, 1, {
          // lookup type 3 subtable, format 1, coverage format 1
          substFormat: 1,
          coverage: { format: 1, glyphs: [] },
          alternateSets: []
        });
        check.assert(
          subtable.coverage.format === 1,
          "Alternate: unable to modify coverage table format " + subtable.coverage.format
        );
        var coverageGlyph = substitution.sub;
        var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
        if (pos < 0) {
          pos = -1 - pos;
          subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
          subtable.alternateSets.splice(pos, 0, 0);
        }
        subtable.alternateSets[pos] = substitution.by;
      };
      Substitution.prototype.addLigature = function(feature, ligature, script, language) {
        var lookupTable = this.getLookupTables(
          script,
          language,
          feature,
          4,
          true
        )[0];
        var subtable = lookupTable.subtables[0];
        if (!subtable) {
          subtable = {
            // lookup type 4 subtable, format 1, coverage format 1
            substFormat: 1,
            coverage: { format: 1, glyphs: [] },
            ligatureSets: []
          };
          lookupTable.subtables[0] = subtable;
        }
        check.assert(
          subtable.coverage.format === 1,
          "Ligature: unable to modify coverage table format " + subtable.coverage.format
        );
        var coverageGlyph = ligature.sub[0];
        var ligComponents = ligature.sub.slice(1);
        var ligatureTable = {
          ligGlyph: ligature.by,
          components: ligComponents
        };
        var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
        if (pos >= 0) {
          var ligatureSet = subtable.ligatureSets[pos];
          for (var i3 = 0; i3 < ligatureSet.length; i3++) {
            if (arraysEqual(ligatureSet[i3].components, ligComponents)) {
              return;
            }
          }
          ligatureSet.push(ligatureTable);
        } else {
          pos = -1 - pos;
          subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
          subtable.ligatureSets.splice(pos, 0, [ligatureTable]);
        }
      };
      Substitution.prototype.getFeature = function(feature, script, language) {
        if (/ss\d\d/.test(feature)) {
          return this.getSingle(feature, script, language);
        }
        switch (feature) {
          case "aalt":
          case "salt":
            return this.getSingle(feature, script, language).concat(
              this.getAlternates(feature, script, language)
            );
          case "dlig":
          case "liga":
          case "rlig":
            return this.getLigatures(feature, script, language);
          case "ccmp":
            return this.getMultiple(feature, script, language).concat(
              this.getLigatures(feature, script, language)
            );
          case "stch":
            return this.getMultiple(feature, script, language);
        }
        return void 0;
      };
      Substitution.prototype.add = function(feature, sub, script, language) {
        if (/ss\d\d/.test(feature)) {
          return this.addSingle(feature, sub, script, language);
        }
        switch (feature) {
          case "aalt":
          case "salt":
            if (typeof sub.by === "number") {
              return this.addSingle(feature, sub, script, language);
            }
            return this.addAlternate(feature, sub, script, language);
          case "dlig":
          case "liga":
          case "rlig":
            return this.addLigature(feature, sub, script, language);
          case "ccmp":
            if (sub.by instanceof Array) {
              return this.addMultiple(feature, sub, script, language);
            }
            return this.addLigature(feature, sub, script, language);
        }
        return void 0;
      };
      function checkArgument(expression, message) {
        if (!expression) {
          throw message;
        }
      }
      function getByte(dataView, offset) {
        return dataView.getUint8(offset);
      }
      function getUShort(dataView, offset) {
        return dataView.getUint16(offset, false);
      }
      function getShort(dataView, offset) {
        return dataView.getInt16(offset, false);
      }
      function getULong(dataView, offset) {
        return dataView.getUint32(offset, false);
      }
      function getFixed(dataView, offset) {
        var decimal = dataView.getInt16(offset, false);
        var fraction = dataView.getUint16(offset + 2, false);
        return decimal + fraction / 65535;
      }
      function getTag(dataView, offset) {
        var tag = "";
        for (var i3 = offset; i3 < offset + 4; i3 += 1) {
          tag += String.fromCharCode(dataView.getInt8(i3));
        }
        return tag;
      }
      function getOffset(dataView, offset, offSize) {
        var v2 = 0;
        for (var i3 = 0; i3 < offSize; i3 += 1) {
          v2 <<= 8;
          v2 += dataView.getUint8(offset + i3);
        }
        return v2;
      }
      function getBytes(dataView, startOffset, endOffset) {
        var bytes = [];
        for (var i3 = startOffset; i3 < endOffset; i3 += 1) {
          bytes.push(dataView.getUint8(i3));
        }
        return bytes;
      }
      function bytesToString(bytes) {
        var s = "";
        for (var i3 = 0; i3 < bytes.length; i3 += 1) {
          s += String.fromCharCode(bytes[i3]);
        }
        return s;
      }
      var typeOffsets = {
        byte: 1,
        uShort: 2,
        short: 2,
        uLong: 4,
        fixed: 4,
        longDateTime: 8,
        tag: 4
      };
      function Parser(data, offset) {
        this.data = data;
        this.offset = offset;
        this.relativeOffset = 0;
      }
      Parser.prototype.parseByte = function() {
        var v2 = this.data.getUint8(this.offset + this.relativeOffset);
        this.relativeOffset += 1;
        return v2;
      };
      Parser.prototype.parseChar = function() {
        var v2 = this.data.getInt8(this.offset + this.relativeOffset);
        this.relativeOffset += 1;
        return v2;
      };
      Parser.prototype.parseCard8 = Parser.prototype.parseByte;
      Parser.prototype.parseUShort = function() {
        var v2 = this.data.getUint16(this.offset + this.relativeOffset);
        this.relativeOffset += 2;
        return v2;
      };
      Parser.prototype.parseCard16 = Parser.prototype.parseUShort;
      Parser.prototype.parseSID = Parser.prototype.parseUShort;
      Parser.prototype.parseOffset16 = Parser.prototype.parseUShort;
      Parser.prototype.parseShort = function() {
        var v2 = this.data.getInt16(this.offset + this.relativeOffset);
        this.relativeOffset += 2;
        return v2;
      };
      Parser.prototype.parseF2Dot14 = function() {
        var v2 = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
        this.relativeOffset += 2;
        return v2;
      };
      Parser.prototype.parseULong = function() {
        var v2 = getULong(this.data, this.offset + this.relativeOffset);
        this.relativeOffset += 4;
        return v2;
      };
      Parser.prototype.parseOffset32 = Parser.prototype.parseULong;
      Parser.prototype.parseFixed = function() {
        var v2 = getFixed(this.data, this.offset + this.relativeOffset);
        this.relativeOffset += 4;
        return v2;
      };
      Parser.prototype.parseString = function(length) {
        var dataView = this.data;
        var offset = this.offset + this.relativeOffset;
        var string = "";
        this.relativeOffset += length;
        for (var i3 = 0; i3 < length; i3++) {
          string += String.fromCharCode(dataView.getUint8(offset + i3));
        }
        return string;
      };
      Parser.prototype.parseTag = function() {
        return this.parseString(4);
      };
      Parser.prototype.parseLongDateTime = function() {
        var v2 = getULong(this.data, this.offset + this.relativeOffset + 4);
        v2 -= 2082844800;
        this.relativeOffset += 8;
        return v2;
      };
      Parser.prototype.parseVersion = function(minorBase) {
        var major = getUShort(this.data, this.offset + this.relativeOffset);
        var minor = getUShort(this.data, this.offset + this.relativeOffset + 2);
        this.relativeOffset += 4;
        if (minorBase === void 0) {
          minorBase = 4096;
        }
        return major + minor / minorBase / 10;
      };
      Parser.prototype.skip = function(type, amount) {
        if (amount === void 0) {
          amount = 1;
        }
        this.relativeOffset += typeOffsets[type] * amount;
      };
      Parser.prototype.parseULongList = function(count) {
        if (count === void 0) {
          count = this.parseULong();
        }
        var offsets = new Array(count);
        var dataView = this.data;
        var offset = this.offset + this.relativeOffset;
        for (var i3 = 0; i3 < count; i3++) {
          offsets[i3] = dataView.getUint32(offset);
          offset += 4;
        }
        this.relativeOffset += count * 4;
        return offsets;
      };
      Parser.prototype.parseOffset16List = Parser.prototype.parseUShortList = function(count) {
        if (count === void 0) {
          count = this.parseUShort();
        }
        var offsets = new Array(count);
        var dataView = this.data;
        var offset = this.offset + this.relativeOffset;
        for (var i3 = 0; i3 < count; i3++) {
          offsets[i3] = dataView.getUint16(offset);
          offset += 2;
        }
        this.relativeOffset += count * 2;
        return offsets;
      };
      Parser.prototype.parseShortList = function(count) {
        var list = new Array(count);
        var dataView = this.data;
        var offset = this.offset + this.relativeOffset;
        for (var i3 = 0; i3 < count; i3++) {
          list[i3] = dataView.getInt16(offset);
          offset += 2;
        }
        this.relativeOffset += count * 2;
        return list;
      };
      Parser.prototype.parseByteList = function(count) {
        var list = new Array(count);
        var dataView = this.data;
        var offset = this.offset + this.relativeOffset;
        for (var i3 = 0; i3 < count; i3++) {
          list[i3] = dataView.getUint8(offset++);
        }
        this.relativeOffset += count;
        return list;
      };
      Parser.prototype.parseList = function(count, itemCallback) {
        if (!itemCallback) {
          itemCallback = count;
          count = this.parseUShort();
        }
        var list = new Array(count);
        for (var i3 = 0; i3 < count; i3++) {
          list[i3] = itemCallback.call(this);
        }
        return list;
      };
      Parser.prototype.parseList32 = function(count, itemCallback) {
        if (!itemCallback) {
          itemCallback = count;
          count = this.parseULong();
        }
        var list = new Array(count);
        for (var i3 = 0; i3 < count; i3++) {
          list[i3] = itemCallback.call(this);
        }
        return list;
      };
      Parser.prototype.parseRecordList = function(count, recordDescription) {
        if (!recordDescription) {
          recordDescription = count;
          count = this.parseUShort();
        }
        var records = new Array(count);
        var fields = Object.keys(recordDescription);
        for (var i3 = 0; i3 < count; i3++) {
          var rec = {};
          for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = recordDescription[fieldName];
            rec[fieldName] = fieldType.call(this);
          }
          records[i3] = rec;
        }
        return records;
      };
      Parser.prototype.parseRecordList32 = function(count, recordDescription) {
        if (!recordDescription) {
          recordDescription = count;
          count = this.parseULong();
        }
        var records = new Array(count);
        var fields = Object.keys(recordDescription);
        for (var i3 = 0; i3 < count; i3++) {
          var rec = {};
          for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = recordDescription[fieldName];
            rec[fieldName] = fieldType.call(this);
          }
          records[i3] = rec;
        }
        return records;
      };
      Parser.prototype.parseStruct = function(description) {
        if (typeof description === "function") {
          return description.call(this);
        } else {
          var fields = Object.keys(description);
          var struct = {};
          for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = description[fieldName];
            struct[fieldName] = fieldType.call(this);
          }
          return struct;
        }
      };
      Parser.prototype.parseValueRecord = function(valueFormat) {
        if (valueFormat === void 0) {
          valueFormat = this.parseUShort();
        }
        if (valueFormat === 0) {
          return;
        }
        var valueRecord = {};
        if (valueFormat & 1) {
          valueRecord.xPlacement = this.parseShort();
        }
        if (valueFormat & 2) {
          valueRecord.yPlacement = this.parseShort();
        }
        if (valueFormat & 4) {
          valueRecord.xAdvance = this.parseShort();
        }
        if (valueFormat & 8) {
          valueRecord.yAdvance = this.parseShort();
        }
        if (valueFormat & 16) {
          valueRecord.xPlaDevice = void 0;
          this.parseShort();
        }
        if (valueFormat & 32) {
          valueRecord.yPlaDevice = void 0;
          this.parseShort();
        }
        if (valueFormat & 64) {
          valueRecord.xAdvDevice = void 0;
          this.parseShort();
        }
        if (valueFormat & 128) {
          valueRecord.yAdvDevice = void 0;
          this.parseShort();
        }
        return valueRecord;
      };
      Parser.prototype.parseValueRecordList = function() {
        var valueFormat = this.parseUShort();
        var valueCount = this.parseUShort();
        var values = new Array(valueCount);
        for (var i3 = 0; i3 < valueCount; i3++) {
          values[i3] = this.parseValueRecord(valueFormat);
        }
        return values;
      };
      Parser.prototype.parsePointer = function(description) {
        var structOffset = this.parseOffset16();
        if (structOffset > 0) {
          return new Parser(this.data, this.offset + structOffset).parseStruct(description);
        }
        return void 0;
      };
      Parser.prototype.parsePointer32 = function(description) {
        var structOffset = this.parseOffset32();
        if (structOffset > 0) {
          return new Parser(this.data, this.offset + structOffset).parseStruct(description);
        }
        return void 0;
      };
      Parser.prototype.parseListOfLists = function(itemCallback) {
        var offsets = this.parseOffset16List();
        var count = offsets.length;
        var relativeOffset = this.relativeOffset;
        var list = new Array(count);
        for (var i3 = 0; i3 < count; i3++) {
          var start = offsets[i3];
          if (start === 0) {
            list[i3] = void 0;
            continue;
          }
          this.relativeOffset = start;
          if (itemCallback) {
            var subOffsets = this.parseOffset16List();
            var subList = new Array(subOffsets.length);
            for (var j = 0; j < subOffsets.length; j++) {
              this.relativeOffset = start + subOffsets[j];
              subList[j] = itemCallback.call(this);
            }
            list[i3] = subList;
          } else {
            list[i3] = this.parseUShortList();
          }
        }
        this.relativeOffset = relativeOffset;
        return list;
      };
      Parser.prototype.parseCoverage = function() {
        var startOffset = this.offset + this.relativeOffset;
        var format = this.parseUShort();
        var count = this.parseUShort();
        if (format === 1) {
          return {
            format: 1,
            glyphs: this.parseUShortList(count)
          };
        } else if (format === 2) {
          var ranges = new Array(count);
          for (var i3 = 0; i3 < count; i3++) {
            ranges[i3] = {
              start: this.parseUShort(),
              end: this.parseUShort(),
              index: this.parseUShort()
            };
          }
          return {
            format: 2,
            ranges
          };
        }
        throw new Error("0x" + startOffset.toString(16) + ": Coverage format must be 1 or 2.");
      };
      Parser.prototype.parseClassDef = function() {
        var startOffset = this.offset + this.relativeOffset;
        var format = this.parseUShort();
        if (format === 1) {
          return {
            format: 1,
            startGlyph: this.parseUShort(),
            classes: this.parseUShortList()
          };
        } else if (format === 2) {
          return {
            format: 2,
            ranges: this.parseRecordList({
              start: Parser.uShort,
              end: Parser.uShort,
              classId: Parser.uShort
            })
          };
        }
        throw new Error("0x" + startOffset.toString(16) + ": ClassDef format must be 1 or 2.");
      };
      Parser.list = function(count, itemCallback) {
        return function() {
          return this.parseList(count, itemCallback);
        };
      };
      Parser.list32 = function(count, itemCallback) {
        return function() {
          return this.parseList32(count, itemCallback);
        };
      };
      Parser.recordList = function(count, recordDescription) {
        return function() {
          return this.parseRecordList(count, recordDescription);
        };
      };
      Parser.recordList32 = function(count, recordDescription) {
        return function() {
          return this.parseRecordList32(count, recordDescription);
        };
      };
      Parser.pointer = function(description) {
        return function() {
          return this.parsePointer(description);
        };
      };
      Parser.pointer32 = function(description) {
        return function() {
          return this.parsePointer32(description);
        };
      };
      Parser.tag = Parser.prototype.parseTag;
      Parser.byte = Parser.prototype.parseByte;
      Parser.uShort = Parser.offset16 = Parser.prototype.parseUShort;
      Parser.uShortList = Parser.prototype.parseUShortList;
      Parser.uLong = Parser.offset32 = Parser.prototype.parseULong;
      Parser.uLongList = Parser.prototype.parseULongList;
      Parser.struct = Parser.prototype.parseStruct;
      Parser.coverage = Parser.prototype.parseCoverage;
      Parser.classDef = Parser.prototype.parseClassDef;
      var langSysTable = {
        reserved: Parser.uShort,
        reqFeatureIndex: Parser.uShort,
        featureIndexes: Parser.uShortList
      };
      Parser.prototype.parseScriptList = function() {
        return this.parsePointer(Parser.recordList({
          tag: Parser.tag,
          script: Parser.pointer({
            defaultLangSys: Parser.pointer(langSysTable),
            langSysRecords: Parser.recordList({
              tag: Parser.tag,
              langSys: Parser.pointer(langSysTable)
            })
          })
        })) || [];
      };
      Parser.prototype.parseFeatureList = function() {
        return this.parsePointer(Parser.recordList({
          tag: Parser.tag,
          feature: Parser.pointer({
            featureParams: Parser.offset16,
            lookupListIndexes: Parser.uShortList
          })
        })) || [];
      };
      Parser.prototype.parseLookupList = function(lookupTableParsers) {
        return this.parsePointer(Parser.list(Parser.pointer(function() {
          var lookupType = this.parseUShort();
          check.argument(1 <= lookupType && lookupType <= 9, "GPOS/GSUB lookup type " + lookupType + " unknown.");
          var lookupFlag = this.parseUShort();
          var useMarkFilteringSet = lookupFlag & 16;
          return {
            lookupType,
            lookupFlag,
            subtables: this.parseList(Parser.pointer(lookupTableParsers[lookupType])),
            markFilteringSet: useMarkFilteringSet ? this.parseUShort() : void 0
          };
        }))) || [];
      };
      Parser.prototype.parseFeatureVariationsList = function() {
        return this.parsePointer32(function() {
          var majorVersion = this.parseUShort();
          var minorVersion = this.parseUShort();
          check.argument(majorVersion === 1 && minorVersion < 1, "GPOS/GSUB feature variations table unknown.");
          var featureVariations = this.parseRecordList32({
            conditionSetOffset: Parser.offset32,
            featureTableSubstitutionOffset: Parser.offset32
          });
          return featureVariations;
        }) || [];
      };
      var parse = {
        getByte,
        getCard8: getByte,
        getUShort,
        getCard16: getUShort,
        getShort,
        getULong,
        getFixed,
        getTag,
        getOffset,
        getBytes,
        bytesToString,
        Parser
      };
      function parseGlyphCoordinate(p, flag, previousValue, shortVectorBitMask, sameBitMask) {
        var v2;
        if ((flag & shortVectorBitMask) > 0) {
          v2 = p.parseByte();
          if ((flag & sameBitMask) === 0) {
            v2 = -v2;
          }
          v2 = previousValue + v2;
        } else {
          if ((flag & sameBitMask) > 0) {
            v2 = previousValue;
          } else {
            v2 = previousValue + p.parseShort();
          }
        }
        return v2;
      }
      function parseGlyph(glyph, data, start) {
        var p = new parse.Parser(data, start);
        glyph.numberOfContours = p.parseShort();
        glyph._xMin = p.parseShort();
        glyph._yMin = p.parseShort();
        glyph._xMax = p.parseShort();
        glyph._yMax = p.parseShort();
        var flags;
        var flag;
        if (glyph.numberOfContours > 0) {
          var endPointIndices = glyph.endPointIndices = [];
          for (var i3 = 0; i3 < glyph.numberOfContours; i3 += 1) {
            endPointIndices.push(p.parseUShort());
          }
          glyph.instructionLength = p.parseUShort();
          glyph.instructions = [];
          for (var i$1 = 0; i$1 < glyph.instructionLength; i$1 += 1) {
            glyph.instructions.push(p.parseByte());
          }
          var numberOfCoordinates = endPointIndices[endPointIndices.length - 1] + 1;
          flags = [];
          for (var i$2 = 0; i$2 < numberOfCoordinates; i$2 += 1) {
            flag = p.parseByte();
            flags.push(flag);
            if ((flag & 8) > 0) {
              var repeatCount = p.parseByte();
              for (var j = 0; j < repeatCount; j += 1) {
                flags.push(flag);
                i$2 += 1;
              }
            }
          }
          check.argument(flags.length === numberOfCoordinates, "Bad flags.");
          if (endPointIndices.length > 0) {
            var points = [];
            var point;
            if (numberOfCoordinates > 0) {
              for (var i$3 = 0; i$3 < numberOfCoordinates; i$3 += 1) {
                flag = flags[i$3];
                point = {};
                point.onCurve = !!(flag & 1);
                point.lastPointOfContour = endPointIndices.indexOf(i$3) >= 0;
                points.push(point);
              }
              var px = 0;
              for (var i$4 = 0; i$4 < numberOfCoordinates; i$4 += 1) {
                flag = flags[i$4];
                point = points[i$4];
                point.x = parseGlyphCoordinate(p, flag, px, 2, 16);
                px = point.x;
              }
              var py = 0;
              for (var i$5 = 0; i$5 < numberOfCoordinates; i$5 += 1) {
                flag = flags[i$5];
                point = points[i$5];
                point.y = parseGlyphCoordinate(p, flag, py, 4, 32);
                py = point.y;
              }
            }
            glyph.points = points;
          } else {
            glyph.points = [];
          }
        } else if (glyph.numberOfContours === 0) {
          glyph.points = [];
        } else {
          glyph.isComposite = true;
          glyph.points = [];
          glyph.components = [];
          var moreComponents = true;
          while (moreComponents) {
            flags = p.parseUShort();
            var component = {
              glyphIndex: p.parseUShort(),
              xScale: 1,
              scale01: 0,
              scale10: 0,
              yScale: 1,
              dx: 0,
              dy: 0
            };
            if ((flags & 1) > 0) {
              if ((flags & 2) > 0) {
                component.dx = p.parseShort();
                component.dy = p.parseShort();
              } else {
                component.matchedPoints = [p.parseUShort(), p.parseUShort()];
              }
            } else {
              if ((flags & 2) > 0) {
                component.dx = p.parseChar();
                component.dy = p.parseChar();
              } else {
                component.matchedPoints = [p.parseByte(), p.parseByte()];
              }
            }
            if ((flags & 8) > 0) {
              component.xScale = component.yScale = p.parseF2Dot14();
            } else if ((flags & 64) > 0) {
              component.xScale = p.parseF2Dot14();
              component.yScale = p.parseF2Dot14();
            } else if ((flags & 128) > 0) {
              component.xScale = p.parseF2Dot14();
              component.scale01 = p.parseF2Dot14();
              component.scale10 = p.parseF2Dot14();
              component.yScale = p.parseF2Dot14();
            }
            glyph.components.push(component);
            moreComponents = !!(flags & 32);
          }
          if (flags & 256) {
            glyph.instructionLength = p.parseUShort();
            glyph.instructions = [];
            for (var i$6 = 0; i$6 < glyph.instructionLength; i$6 += 1) {
              glyph.instructions.push(p.parseByte());
            }
          }
        }
      }
      function transformPoints(points, transform) {
        var newPoints = [];
        for (var i3 = 0; i3 < points.length; i3 += 1) {
          var pt = points[i3];
          var newPt = {
            x: transform.xScale * pt.x + transform.scale01 * pt.y + transform.dx,
            y: transform.scale10 * pt.x + transform.yScale * pt.y + transform.dy,
            onCurve: pt.onCurve,
            lastPointOfContour: pt.lastPointOfContour
          };
          newPoints.push(newPt);
        }
        return newPoints;
      }
      function getContours(points) {
        var contours = [];
        var currentContour = [];
        for (var i3 = 0; i3 < points.length; i3 += 1) {
          var pt = points[i3];
          currentContour.push(pt);
          if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
          }
        }
        check.argument(currentContour.length === 0, "There are still points left in the current contour.");
        return contours;
      }
      function getPath(points) {
        var p = new Path();
        if (!points) {
          return p;
        }
        var contours = getContours(points);
        for (var contourIndex = 0; contourIndex < contours.length; ++contourIndex) {
          var contour = contours[contourIndex];
          var prev = null;
          var curr = contour[contour.length - 1];
          var next = contour[0];
          if (curr.onCurve) {
            p.moveTo(curr.x, curr.y);
          } else {
            if (next.onCurve) {
              p.moveTo(next.x, next.y);
            } else {
              var start = { x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5 };
              p.moveTo(start.x, start.y);
            }
          }
          for (var i3 = 0; i3 < contour.length; ++i3) {
            prev = curr;
            curr = next;
            next = contour[(i3 + 1) % contour.length];
            if (curr.onCurve) {
              p.lineTo(curr.x, curr.y);
            } else {
              var prev2 = prev;
              var next2 = next;
              if (!prev.onCurve) {
                prev2 = { x: (curr.x + prev.x) * 0.5, y: (curr.y + prev.y) * 0.5 };
              }
              if (!next.onCurve) {
                next2 = { x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5 };
              }
              p.quadraticCurveTo(curr.x, curr.y, next2.x, next2.y);
            }
          }
          p.closePath();
        }
        return p;
      }
      function buildPath(glyphs, glyph) {
        if (glyph.isComposite) {
          for (var j = 0; j < glyph.components.length; j += 1) {
            var component = glyph.components[j];
            var componentGlyph = glyphs.get(component.glyphIndex);
            componentGlyph.getPath();
            if (componentGlyph.points) {
              var transformedPoints = void 0;
              if (component.matchedPoints === void 0) {
                transformedPoints = transformPoints(componentGlyph.points, component);
              } else {
                if (component.matchedPoints[0] > glyph.points.length - 1 || component.matchedPoints[1] > componentGlyph.points.length - 1) {
                  throw Error("Matched points out of range in " + glyph.name);
                }
                var firstPt = glyph.points[component.matchedPoints[0]];
                var secondPt = componentGlyph.points[component.matchedPoints[1]];
                var transform = {
                  xScale: component.xScale,
                  scale01: component.scale01,
                  scale10: component.scale10,
                  yScale: component.yScale,
                  dx: 0,
                  dy: 0
                };
                secondPt = transformPoints([secondPt], transform)[0];
                transform.dx = firstPt.x - secondPt.x;
                transform.dy = firstPt.y - secondPt.y;
                transformedPoints = transformPoints(componentGlyph.points, transform);
              }
              glyph.points = glyph.points.concat(transformedPoints);
            }
          }
        }
        return getPath(glyph.points);
      }
      function parseGlyfTableAll(data, start, loca2, font) {
        var glyphs = new glyphset.GlyphSet(font);
        for (var i3 = 0; i3 < loca2.length - 1; i3 += 1) {
          var offset = loca2[i3];
          var nextOffset = loca2[i3 + 1];
          if (offset !== nextOffset) {
            glyphs.push(i3, glyphset.ttfGlyphLoader(font, i3, parseGlyph, data, start + offset, buildPath));
          } else {
            glyphs.push(i3, glyphset.glyphLoader(font, i3));
          }
        }
        return glyphs;
      }
      function parseGlyfTableOnLowMemory(data, start, loca2, font) {
        var glyphs = new glyphset.GlyphSet(font);
        font._push = function(i3) {
          var offset = loca2[i3];
          var nextOffset = loca2[i3 + 1];
          if (offset !== nextOffset) {
            glyphs.push(i3, glyphset.ttfGlyphLoader(font, i3, parseGlyph, data, start + offset, buildPath));
          } else {
            glyphs.push(i3, glyphset.glyphLoader(font, i3));
          }
        };
        return glyphs;
      }
      function parseGlyfTable(data, start, loca2, font, opt) {
        if (opt.lowMemory) {
          return parseGlyfTableOnLowMemory(data, start, loca2, font);
        } else {
          return parseGlyfTableAll(data, start, loca2, font);
        }
      }
      var glyf = { getPath, parse: parseGlyfTable };
      var instructionTable;
      var exec;
      var execGlyph;
      var execComponent;
      function Hinting(font) {
        this.font = font;
        this.getCommands = function(hPoints) {
          return glyf.getPath(hPoints).commands;
        };
        this._fpgmState = this._prepState = void 0;
        this._errorState = 0;
      }
      function roundOff(v2) {
        return v2;
      }
      function roundToGrid(v2) {
        return Math.sign(v2) * Math.round(Math.abs(v2));
      }
      function roundToDoubleGrid(v2) {
        return Math.sign(v2) * Math.round(Math.abs(v2 * 2)) / 2;
      }
      function roundToHalfGrid(v2) {
        return Math.sign(v2) * (Math.round(Math.abs(v2) + 0.5) - 0.5);
      }
      function roundUpToGrid(v2) {
        return Math.sign(v2) * Math.ceil(Math.abs(v2));
      }
      function roundDownToGrid(v2) {
        return Math.sign(v2) * Math.floor(Math.abs(v2));
      }
      var roundSuper = function(v2) {
        var period = this.srPeriod;
        var phase = this.srPhase;
        var threshold = this.srThreshold;
        var sign = 1;
        if (v2 < 0) {
          v2 = -v2;
          sign = -1;
        }
        v2 += threshold - phase;
        v2 = Math.trunc(v2 / period) * period;
        v2 += phase;
        if (v2 < 0) {
          return phase * sign;
        }
        return v2 * sign;
      };
      var xUnitVector = {
        x: 1,
        y: 0,
        axis: "x",
        // Gets the projected distance between two points.
        // o1/o2 ... if true, respective original position is used.
        distance: function(p1, p2, o1, o2) {
          return (o1 ? p1.xo : p1.x) - (o2 ? p2.xo : p2.x);
        },
        // Moves point p so the moved position has the same relative
        // position to the moved positions of rp1 and rp2 than the
        // original positions had.
        //
        // See APPENDIX on INTERPOLATE at the bottom of this file.
        interpolate: function(p, rp1, rp2, pv) {
          var do1;
          var do2;
          var doa1;
          var doa2;
          var dm1;
          var dm2;
          var dt;
          if (!pv || pv === this) {
            do1 = p.xo - rp1.xo;
            do2 = p.xo - rp2.xo;
            dm1 = rp1.x - rp1.xo;
            dm2 = rp2.x - rp2.xo;
            doa1 = Math.abs(do1);
            doa2 = Math.abs(do2);
            dt = doa1 + doa2;
            if (dt === 0) {
              p.x = p.xo + (dm1 + dm2) / 2;
              return;
            }
            p.x = p.xo + (dm1 * doa2 + dm2 * doa1) / dt;
            return;
          }
          do1 = pv.distance(p, rp1, true, true);
          do2 = pv.distance(p, rp2, true, true);
          dm1 = pv.distance(rp1, rp1, false, true);
          dm2 = pv.distance(rp2, rp2, false, true);
          doa1 = Math.abs(do1);
          doa2 = Math.abs(do2);
          dt = doa1 + doa2;
          if (dt === 0) {
            xUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
            return;
          }
          xUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
        },
        // Slope of line normal to this
        normalSlope: Number.NEGATIVE_INFINITY,
        // Sets the point 'p' relative to point 'rp'
        // by the distance 'd'.
        //
        // See APPENDIX on SETRELATIVE at the bottom of this file.
        //
        // p   ... point to set
        // rp  ... reference point
        // d   ... distance on projection vector
        // pv  ... projection vector (undefined = this)
        // org ... if true, uses the original position of rp as reference.
        setRelative: function(p, rp2, d2, pv, org) {
          if (!pv || pv === this) {
            p.x = (org ? rp2.xo : rp2.x) + d2;
            return;
          }
          var rpx = org ? rp2.xo : rp2.x;
          var rpy = org ? rp2.yo : rp2.y;
          var rpdx = rpx + d2 * pv.x;
          var rpdy = rpy + d2 * pv.y;
          p.x = rpdx + (p.y - rpdy) / pv.normalSlope;
        },
        // Slope of vector line.
        slope: 0,
        // Touches the point p.
        touch: function(p) {
          p.xTouched = true;
        },
        // Tests if a point p is touched.
        touched: function(p) {
          return p.xTouched;
        },
        // Untouches the point p.
        untouch: function(p) {
          p.xTouched = false;
        }
      };
      var yUnitVector = {
        x: 0,
        y: 1,
        axis: "y",
        // Gets the projected distance between two points.
        // o1/o2 ... if true, respective original position is used.
        distance: function(p1, p2, o1, o2) {
          return (o1 ? p1.yo : p1.y) - (o2 ? p2.yo : p2.y);
        },
        // Moves point p so the moved position has the same relative
        // position to the moved positions of rp1 and rp2 than the
        // original positions had.
        //
        // See APPENDIX on INTERPOLATE at the bottom of this file.
        interpolate: function(p, rp1, rp2, pv) {
          var do1;
          var do2;
          var doa1;
          var doa2;
          var dm1;
          var dm2;
          var dt;
          if (!pv || pv === this) {
            do1 = p.yo - rp1.yo;
            do2 = p.yo - rp2.yo;
            dm1 = rp1.y - rp1.yo;
            dm2 = rp2.y - rp2.yo;
            doa1 = Math.abs(do1);
            doa2 = Math.abs(do2);
            dt = doa1 + doa2;
            if (dt === 0) {
              p.y = p.yo + (dm1 + dm2) / 2;
              return;
            }
            p.y = p.yo + (dm1 * doa2 + dm2 * doa1) / dt;
            return;
          }
          do1 = pv.distance(p, rp1, true, true);
          do2 = pv.distance(p, rp2, true, true);
          dm1 = pv.distance(rp1, rp1, false, true);
          dm2 = pv.distance(rp2, rp2, false, true);
          doa1 = Math.abs(do1);
          doa2 = Math.abs(do2);
          dt = doa1 + doa2;
          if (dt === 0) {
            yUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
            return;
          }
          yUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
        },
        // Slope of line normal to this.
        normalSlope: 0,
        // Sets the point 'p' relative to point 'rp'
        // by the distance 'd'
        //
        // See APPENDIX on SETRELATIVE at the bottom of this file.
        //
        // p   ... point to set
        // rp  ... reference point
        // d   ... distance on projection vector
        // pv  ... projection vector (undefined = this)
        // org ... if true, uses the original position of rp as reference.
        setRelative: function(p, rp2, d2, pv, org) {
          if (!pv || pv === this) {
            p.y = (org ? rp2.yo : rp2.y) + d2;
            return;
          }
          var rpx = org ? rp2.xo : rp2.x;
          var rpy = org ? rp2.yo : rp2.y;
          var rpdx = rpx + d2 * pv.x;
          var rpdy = rpy + d2 * pv.y;
          p.y = rpdy + pv.normalSlope * (p.x - rpdx);
        },
        // Slope of vector line.
        slope: Number.POSITIVE_INFINITY,
        // Touches the point p.
        touch: function(p) {
          p.yTouched = true;
        },
        // Tests if a point p is touched.
        touched: function(p) {
          return p.yTouched;
        },
        // Untouches the point p.
        untouch: function(p) {
          p.yTouched = false;
        }
      };
      Object.freeze(xUnitVector);
      Object.freeze(yUnitVector);
      function UnitVector(x4, y) {
        this.x = x4;
        this.y = y;
        this.axis = void 0;
        this.slope = y / x4;
        this.normalSlope = -x4 / y;
        Object.freeze(this);
      }
      UnitVector.prototype.distance = function(p1, p2, o1, o2) {
        return this.x * xUnitVector.distance(p1, p2, o1, o2) + this.y * yUnitVector.distance(p1, p2, o1, o2);
      };
      UnitVector.prototype.interpolate = function(p, rp1, rp2, pv) {
        var dm1;
        var dm2;
        var do1;
        var do2;
        var doa1;
        var doa2;
        var dt;
        do1 = pv.distance(p, rp1, true, true);
        do2 = pv.distance(p, rp2, true, true);
        dm1 = pv.distance(rp1, rp1, false, true);
        dm2 = pv.distance(rp2, rp2, false, true);
        doa1 = Math.abs(do1);
        doa2 = Math.abs(do2);
        dt = doa1 + doa2;
        if (dt === 0) {
          this.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
          return;
        }
        this.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
      };
      UnitVector.prototype.setRelative = function(p, rp2, d2, pv, org) {
        pv = pv || this;
        var rpx = org ? rp2.xo : rp2.x;
        var rpy = org ? rp2.yo : rp2.y;
        var rpdx = rpx + d2 * pv.x;
        var rpdy = rpy + d2 * pv.y;
        var pvns = pv.normalSlope;
        var fvs = this.slope;
        var px = p.x;
        var py = p.y;
        p.x = (fvs * px - pvns * rpdx + rpdy - py) / (fvs - pvns);
        p.y = fvs * (p.x - px) + py;
      };
      UnitVector.prototype.touch = function(p) {
        p.xTouched = true;
        p.yTouched = true;
      };
      function getUnitVector(x4, y) {
        var d2 = Math.sqrt(x4 * x4 + y * y);
        x4 /= d2;
        y /= d2;
        if (x4 === 1 && y === 0) {
          return xUnitVector;
        } else if (x4 === 0 && y === 1) {
          return yUnitVector;
        } else {
          return new UnitVector(x4, y);
        }
      }
      function HPoint(x4, y, lastPointOfContour, onCurve) {
        this.x = this.xo = Math.round(x4 * 64) / 64;
        this.y = this.yo = Math.round(y * 64) / 64;
        this.lastPointOfContour = lastPointOfContour;
        this.onCurve = onCurve;
        this.prevPointOnContour = void 0;
        this.nextPointOnContour = void 0;
        this.xTouched = false;
        this.yTouched = false;
        Object.preventExtensions(this);
      }
      HPoint.prototype.nextTouched = function(v2) {
        var p = this.nextPointOnContour;
        while (!v2.touched(p) && p !== this) {
          p = p.nextPointOnContour;
        }
        return p;
      };
      HPoint.prototype.prevTouched = function(v2) {
        var p = this.prevPointOnContour;
        while (!v2.touched(p) && p !== this) {
          p = p.prevPointOnContour;
        }
        return p;
      };
      var HPZero = Object.freeze(new HPoint(0, 0));
      var defaultState = {
        cvCutIn: 17 / 16,
        // control value cut in
        deltaBase: 9,
        deltaShift: 0.125,
        loop: 1,
        // loops some instructions
        minDis: 1,
        // minimum distance
        autoFlip: true
      };
      function State(env, prog) {
        this.env = env;
        this.stack = [];
        this.prog = prog;
        switch (env) {
          case "glyf":
            this.zp0 = this.zp1 = this.zp2 = 1;
            this.rp0 = this.rp1 = this.rp2 = 0;
          /* fall through */
          case "prep":
            this.fv = this.pv = this.dpv = xUnitVector;
            this.round = roundToGrid;
        }
      }
      Hinting.prototype.exec = function(glyph, ppem) {
        if (typeof ppem !== "number") {
          throw new Error("Point size is not a number!");
        }
        if (this._errorState > 2) {
          return;
        }
        var font = this.font;
        var prepState = this._prepState;
        if (!prepState || prepState.ppem !== ppem) {
          var fpgmState = this._fpgmState;
          if (!fpgmState) {
            State.prototype = defaultState;
            fpgmState = this._fpgmState = new State("fpgm", font.tables.fpgm);
            fpgmState.funcs = [];
            fpgmState.font = font;
            if (exports2.DEBUG) {
              console.log("---EXEC FPGM---");
              fpgmState.step = -1;
            }
            try {
              exec(fpgmState);
            } catch (e) {
              console.log("Hinting error in FPGM:" + e);
              this._errorState = 3;
              return;
            }
          }
          State.prototype = fpgmState;
          prepState = this._prepState = new State("prep", font.tables.prep);
          prepState.ppem = ppem;
          var oCvt = font.tables.cvt;
          if (oCvt) {
            var cvt = prepState.cvt = new Array(oCvt.length);
            var scale = ppem / font.unitsPerEm;
            for (var c2 = 0; c2 < oCvt.length; c2++) {
              cvt[c2] = oCvt[c2] * scale;
            }
          } else {
            prepState.cvt = [];
          }
          if (exports2.DEBUG) {
            console.log("---EXEC PREP---");
            prepState.step = -1;
          }
          try {
            exec(prepState);
          } catch (e) {
            if (this._errorState < 2) {
              console.log("Hinting error in PREP:" + e);
            }
            this._errorState = 2;
          }
        }
        if (this._errorState > 1) {
          return;
        }
        try {
          return execGlyph(glyph, prepState);
        } catch (e) {
          if (this._errorState < 1) {
            console.log("Hinting error:" + e);
            console.log("Note: further hinting errors are silenced");
          }
          this._errorState = 1;
          return void 0;
        }
      };
      execGlyph = function(glyph, prepState) {
        var xScale = prepState.ppem / prepState.font.unitsPerEm;
        var yScale = xScale;
        var components = glyph.components;
        var contours;
        var gZone;
        var state;
        State.prototype = prepState;
        if (!components) {
          state = new State("glyf", glyph.instructions);
          if (exports2.DEBUG) {
            console.log("---EXEC GLYPH---");
            state.step = -1;
          }
          execComponent(glyph, state, xScale, yScale);
          gZone = state.gZone;
        } else {
          var font = prepState.font;
          gZone = [];
          contours = [];
          for (var i3 = 0; i3 < components.length; i3++) {
            var c2 = components[i3];
            var cg2 = font.glyphs.get(c2.glyphIndex);
            state = new State("glyf", cg2.instructions);
            if (exports2.DEBUG) {
              console.log("---EXEC COMP " + i3 + "---");
              state.step = -1;
            }
            execComponent(cg2, state, xScale, yScale);
            var dx = Math.round(c2.dx * xScale);
            var dy = Math.round(c2.dy * yScale);
            var gz = state.gZone;
            var cc2 = state.contours;
            for (var pi2 = 0; pi2 < gz.length; pi2++) {
              var p = gz[pi2];
              p.xTouched = p.yTouched = false;
              p.xo = p.x = p.x + dx;
              p.yo = p.y = p.y + dy;
            }
            var gLen = gZone.length;
            gZone.push.apply(gZone, gz);
            for (var j = 0; j < cc2.length; j++) {
              contours.push(cc2[j] + gLen);
            }
          }
          if (glyph.instructions && !state.inhibitGridFit) {
            state = new State("glyf", glyph.instructions);
            state.gZone = state.z0 = state.z1 = state.z2 = gZone;
            state.contours = contours;
            gZone.push(
              new HPoint(0, 0),
              new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
            );
            if (exports2.DEBUG) {
              console.log("---EXEC COMPOSITE---");
              state.step = -1;
            }
            exec(state);
            gZone.length -= 2;
          }
        }
        return gZone;
      };
      execComponent = function(glyph, state, xScale, yScale) {
        var points = glyph.points || [];
        var pLen = points.length;
        var gZone = state.gZone = state.z0 = state.z1 = state.z2 = [];
        var contours = state.contours = [];
        var cp;
        for (var i3 = 0; i3 < pLen; i3++) {
          cp = points[i3];
          gZone[i3] = new HPoint(
            cp.x * xScale,
            cp.y * yScale,
            cp.lastPointOfContour,
            cp.onCurve
          );
        }
        var sp;
        var np;
        for (var i$1 = 0; i$1 < pLen; i$1++) {
          cp = gZone[i$1];
          if (!sp) {
            sp = cp;
            contours.push(i$1);
          }
          if (cp.lastPointOfContour) {
            cp.nextPointOnContour = sp;
            sp.prevPointOnContour = cp;
            sp = void 0;
          } else {
            np = gZone[i$1 + 1];
            cp.nextPointOnContour = np;
            np.prevPointOnContour = cp;
          }
        }
        if (state.inhibitGridFit) {
          return;
        }
        if (exports2.DEBUG) {
          console.log("PROCESSING GLYPH", state.stack);
          for (var i$2 = 0; i$2 < pLen; i$2++) {
            console.log(i$2, gZone[i$2].x, gZone[i$2].y);
          }
        }
        gZone.push(
          new HPoint(0, 0),
          new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
        );
        exec(state);
        gZone.length -= 2;
        if (exports2.DEBUG) {
          console.log("FINISHED GLYPH", state.stack);
          for (var i$3 = 0; i$3 < pLen; i$3++) {
            console.log(i$3, gZone[i$3].x, gZone[i$3].y);
          }
        }
      };
      exec = function(state) {
        var prog = state.prog;
        if (!prog) {
          return;
        }
        var pLen = prog.length;
        var ins;
        for (state.ip = 0; state.ip < pLen; state.ip++) {
          if (exports2.DEBUG) {
            state.step++;
          }
          ins = instructionTable[prog[state.ip]];
          if (!ins) {
            throw new Error(
              "unknown instruction: 0x" + Number(prog[state.ip]).toString(16)
            );
          }
          ins(state);
        }
      };
      function initTZone(state) {
        var tZone = state.tZone = new Array(state.gZone.length);
        for (var i3 = 0; i3 < tZone.length; i3++) {
          tZone[i3] = new HPoint(0, 0);
        }
      }
      function skip(state, handleElse) {
        var prog = state.prog;
        var ip = state.ip;
        var nesting = 1;
        var ins;
        do {
          ins = prog[++ip];
          if (ins === 88) {
            nesting++;
          } else if (ins === 89) {
            nesting--;
          } else if (ins === 64) {
            ip += prog[ip + 1] + 1;
          } else if (ins === 65) {
            ip += 2 * prog[ip + 1] + 1;
          } else if (ins >= 176 && ins <= 183) {
            ip += ins - 176 + 1;
          } else if (ins >= 184 && ins <= 191) {
            ip += (ins - 184 + 1) * 2;
          } else if (handleElse && nesting === 1 && ins === 27) {
            break;
          }
        } while (nesting > 0);
        state.ip = ip;
      }
      function SVTCA(v2, state) {
        if (exports2.DEBUG) {
          console.log(state.step, "SVTCA[" + v2.axis + "]");
        }
        state.fv = state.pv = state.dpv = v2;
      }
      function SPVTCA(v2, state) {
        if (exports2.DEBUG) {
          console.log(state.step, "SPVTCA[" + v2.axis + "]");
        }
        state.pv = state.dpv = v2;
      }
      function SFVTCA(v2, state) {
        if (exports2.DEBUG) {
          console.log(state.step, "SFVTCA[" + v2.axis + "]");
        }
        state.fv = v2;
      }
      function SPVTL(a, state) {
        var stack = state.stack;
        var p2i = stack.pop();
        var p1i = stack.pop();
        var p2 = state.z2[p2i];
        var p1 = state.z1[p1i];
        if (exports2.DEBUG) {
          console.log("SPVTL[" + a + "]", p2i, p1i);
        }
        var dx;
        var dy;
        if (!a) {
          dx = p1.x - p2.x;
          dy = p1.y - p2.y;
        } else {
          dx = p2.y - p1.y;
          dy = p1.x - p2.x;
        }
        state.pv = state.dpv = getUnitVector(dx, dy);
      }
      function SFVTL(a, state) {
        var stack = state.stack;
        var p2i = stack.pop();
        var p1i = stack.pop();
        var p2 = state.z2[p2i];
        var p1 = state.z1[p1i];
        if (exports2.DEBUG) {
          console.log("SFVTL[" + a + "]", p2i, p1i);
        }
        var dx;
        var dy;
        if (!a) {
          dx = p1.x - p2.x;
          dy = p1.y - p2.y;
        } else {
          dx = p2.y - p1.y;
          dy = p1.x - p2.x;
        }
        state.fv = getUnitVector(dx, dy);
      }
      function SPVFS(state) {
        var stack = state.stack;
        var y = stack.pop();
        var x4 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SPVFS[]", y, x4);
        }
        state.pv = state.dpv = getUnitVector(x4, y);
      }
      function SFVFS(state) {
        var stack = state.stack;
        var y = stack.pop();
        var x4 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SPVFS[]", y, x4);
        }
        state.fv = getUnitVector(x4, y);
      }
      function GPV(state) {
        var stack = state.stack;
        var pv = state.pv;
        if (exports2.DEBUG) {
          console.log(state.step, "GPV[]");
        }
        stack.push(pv.x * 16384);
        stack.push(pv.y * 16384);
      }
      function GFV(state) {
        var stack = state.stack;
        var fv = state.fv;
        if (exports2.DEBUG) {
          console.log(state.step, "GFV[]");
        }
        stack.push(fv.x * 16384);
        stack.push(fv.y * 16384);
      }
      function SFVTPV(state) {
        state.fv = state.pv;
        if (exports2.DEBUG) {
          console.log(state.step, "SFVTPV[]");
        }
      }
      function ISECT(state) {
        var stack = state.stack;
        var pa0i = stack.pop();
        var pa1i = stack.pop();
        var pb0i = stack.pop();
        var pb1i = stack.pop();
        var pi2 = stack.pop();
        var z0 = state.z0;
        var z1 = state.z1;
        var pa0 = z0[pa0i];
        var pa1 = z0[pa1i];
        var pb0 = z1[pb0i];
        var pb1 = z1[pb1i];
        var p = state.z2[pi2];
        if (exports2.DEBUG) {
          console.log("ISECT[], ", pa0i, pa1i, pb0i, pb1i, pi2);
        }
        var x1 = pa0.x;
        var y1 = pa0.y;
        var x22 = pa1.x;
        var y2 = pa1.y;
        var x32 = pb0.x;
        var y3 = pb0.y;
        var x4 = pb1.x;
        var y4 = pb1.y;
        var div = (x1 - x22) * (y3 - y4) - (y1 - y2) * (x32 - x4);
        var f1 = x1 * y2 - y1 * x22;
        var f2 = x32 * y4 - y3 * x4;
        p.x = (f1 * (x32 - x4) - f2 * (x1 - x22)) / div;
        p.y = (f1 * (y3 - y4) - f2 * (y1 - y2)) / div;
      }
      function SRP0(state) {
        state.rp0 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SRP0[]", state.rp0);
        }
      }
      function SRP1(state) {
        state.rp1 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SRP1[]", state.rp1);
        }
      }
      function SRP2(state) {
        state.rp2 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SRP2[]", state.rp2);
        }
      }
      function SZP0(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SZP0[]", n);
        }
        state.zp0 = n;
        switch (n) {
          case 0:
            if (!state.tZone) {
              initTZone(state);
            }
            state.z0 = state.tZone;
            break;
          case 1:
            state.z0 = state.gZone;
            break;
          default:
            throw new Error("Invalid zone pointer");
        }
      }
      function SZP1(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SZP1[]", n);
        }
        state.zp1 = n;
        switch (n) {
          case 0:
            if (!state.tZone) {
              initTZone(state);
            }
            state.z1 = state.tZone;
            break;
          case 1:
            state.z1 = state.gZone;
            break;
          default:
            throw new Error("Invalid zone pointer");
        }
      }
      function SZP2(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SZP2[]", n);
        }
        state.zp2 = n;
        switch (n) {
          case 0:
            if (!state.tZone) {
              initTZone(state);
            }
            state.z2 = state.tZone;
            break;
          case 1:
            state.z2 = state.gZone;
            break;
          default:
            throw new Error("Invalid zone pointer");
        }
      }
      function SZPS(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SZPS[]", n);
        }
        state.zp0 = state.zp1 = state.zp2 = n;
        switch (n) {
          case 0:
            if (!state.tZone) {
              initTZone(state);
            }
            state.z0 = state.z1 = state.z2 = state.tZone;
            break;
          case 1:
            state.z0 = state.z1 = state.z2 = state.gZone;
            break;
          default:
            throw new Error("Invalid zone pointer");
        }
      }
      function SLOOP(state) {
        state.loop = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SLOOP[]", state.loop);
        }
      }
      function RTG(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "RTG[]");
        }
        state.round = roundToGrid;
      }
      function RTHG(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "RTHG[]");
        }
        state.round = roundToHalfGrid;
      }
      function SMD(state) {
        var d2 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SMD[]", d2);
        }
        state.minDis = d2 / 64;
      }
      function ELSE(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "ELSE[]");
        }
        skip(state, false);
      }
      function JMPR(state) {
        var o = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "JMPR[]", o);
        }
        state.ip += o - 1;
      }
      function SCVTCI(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SCVTCI[]", n);
        }
        state.cvCutIn = n / 64;
      }
      function DUP(state) {
        var stack = state.stack;
        if (exports2.DEBUG) {
          console.log(state.step, "DUP[]");
        }
        stack.push(stack[stack.length - 1]);
      }
      function POP(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "POP[]");
        }
        state.stack.pop();
      }
      function CLEAR(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "CLEAR[]");
        }
        state.stack.length = 0;
      }
      function SWAP(state) {
        var stack = state.stack;
        var a = stack.pop();
        var b = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SWAP[]");
        }
        stack.push(a);
        stack.push(b);
      }
      function DEPTH(state) {
        var stack = state.stack;
        if (exports2.DEBUG) {
          console.log(state.step, "DEPTH[]");
        }
        stack.push(stack.length);
      }
      function LOOPCALL(state) {
        var stack = state.stack;
        var fn2 = stack.pop();
        var c2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "LOOPCALL[]", fn2, c2);
        }
        var cip = state.ip;
        var cprog = state.prog;
        state.prog = state.funcs[fn2];
        for (var i3 = 0; i3 < c2; i3++) {
          exec(state);
          if (exports2.DEBUG) {
            console.log(
              ++state.step,
              i3 + 1 < c2 ? "next loopcall" : "done loopcall",
              i3
            );
          }
        }
        state.ip = cip;
        state.prog = cprog;
      }
      function CALL(state) {
        var fn2 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "CALL[]", fn2);
        }
        var cip = state.ip;
        var cprog = state.prog;
        state.prog = state.funcs[fn2];
        exec(state);
        state.ip = cip;
        state.prog = cprog;
        if (exports2.DEBUG) {
          console.log(++state.step, "returning from", fn2);
        }
      }
      function CINDEX(state) {
        var stack = state.stack;
        var k = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "CINDEX[]", k);
        }
        stack.push(stack[stack.length - k]);
      }
      function MINDEX(state) {
        var stack = state.stack;
        var k = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "MINDEX[]", k);
        }
        stack.push(stack.splice(stack.length - k, 1)[0]);
      }
      function FDEF(state) {
        if (state.env !== "fpgm") {
          throw new Error("FDEF not allowed here");
        }
        var stack = state.stack;
        var prog = state.prog;
        var ip = state.ip;
        var fn2 = stack.pop();
        var ipBegin = ip;
        if (exports2.DEBUG) {
          console.log(state.step, "FDEF[]", fn2);
        }
        while (prog[++ip] !== 45) {
        }
        state.ip = ip;
        state.funcs[fn2] = prog.slice(ipBegin + 1, ip);
      }
      function MDAP(round, state) {
        var pi2 = state.stack.pop();
        var p = state.z0[pi2];
        var fv = state.fv;
        var pv = state.pv;
        if (exports2.DEBUG) {
          console.log(state.step, "MDAP[" + round + "]", pi2);
        }
        var d2 = pv.distance(p, HPZero);
        if (round) {
          d2 = state.round(d2);
        }
        fv.setRelative(p, HPZero, d2, pv);
        fv.touch(p);
        state.rp0 = state.rp1 = pi2;
      }
      function IUP(v2, state) {
        var z2 = state.z2;
        var pLen = z2.length - 2;
        var cp;
        var pp2;
        var np;
        if (exports2.DEBUG) {
          console.log(state.step, "IUP[" + v2.axis + "]");
        }
        for (var i3 = 0; i3 < pLen; i3++) {
          cp = z2[i3];
          if (v2.touched(cp)) {
            continue;
          }
          pp2 = cp.prevTouched(v2);
          if (pp2 === cp) {
            continue;
          }
          np = cp.nextTouched(v2);
          if (pp2 === np) {
            v2.setRelative(cp, cp, v2.distance(pp2, pp2, false, true), v2, true);
          }
          v2.interpolate(cp, pp2, np, v2);
        }
      }
      function SHP(a, state) {
        var stack = state.stack;
        var rpi = a ? state.rp1 : state.rp2;
        var rp2 = (a ? state.z0 : state.z1)[rpi];
        var fv = state.fv;
        var pv = state.pv;
        var loop = state.loop;
        var z2 = state.z2;
        while (loop--) {
          var pi2 = stack.pop();
          var p = z2[pi2];
          var d2 = pv.distance(rp2, rp2, false, true);
          fv.setRelative(p, p, d2, pv);
          fv.touch(p);
          if (exports2.DEBUG) {
            console.log(
              state.step,
              (state.loop > 1 ? "loop " + (state.loop - loop) + ": " : "") + "SHP[" + (a ? "rp1" : "rp2") + "]",
              pi2
            );
          }
        }
        state.loop = 1;
      }
      function SHC(a, state) {
        var stack = state.stack;
        var rpi = a ? state.rp1 : state.rp2;
        var rp2 = (a ? state.z0 : state.z1)[rpi];
        var fv = state.fv;
        var pv = state.pv;
        var ci2 = stack.pop();
        var sp = state.z2[state.contours[ci2]];
        var p = sp;
        if (exports2.DEBUG) {
          console.log(state.step, "SHC[" + a + "]", ci2);
        }
        var d2 = pv.distance(rp2, rp2, false, true);
        do {
          if (p !== rp2) {
            fv.setRelative(p, p, d2, pv);
          }
          p = p.nextPointOnContour;
        } while (p !== sp);
      }
      function SHZ(a, state) {
        var stack = state.stack;
        var rpi = a ? state.rp1 : state.rp2;
        var rp2 = (a ? state.z0 : state.z1)[rpi];
        var fv = state.fv;
        var pv = state.pv;
        var e = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SHZ[" + a + "]", e);
        }
        var z;
        switch (e) {
          case 0:
            z = state.tZone;
            break;
          case 1:
            z = state.gZone;
            break;
          default:
            throw new Error("Invalid zone");
        }
        var p;
        var d2 = pv.distance(rp2, rp2, false, true);
        var pLen = z.length - 2;
        for (var i3 = 0; i3 < pLen; i3++) {
          p = z[i3];
          fv.setRelative(p, p, d2, pv);
        }
      }
      function SHPIX(state) {
        var stack = state.stack;
        var loop = state.loop;
        var fv = state.fv;
        var d2 = stack.pop() / 64;
        var z2 = state.z2;
        while (loop--) {
          var pi2 = stack.pop();
          var p = z2[pi2];
          if (exports2.DEBUG) {
            console.log(
              state.step,
              (state.loop > 1 ? "loop " + (state.loop - loop) + ": " : "") + "SHPIX[]",
              pi2,
              d2
            );
          }
          fv.setRelative(p, p, d2);
          fv.touch(p);
        }
        state.loop = 1;
      }
      function IP(state) {
        var stack = state.stack;
        var rp1i = state.rp1;
        var rp2i = state.rp2;
        var loop = state.loop;
        var rp1 = state.z0[rp1i];
        var rp2 = state.z1[rp2i];
        var fv = state.fv;
        var pv = state.dpv;
        var z2 = state.z2;
        while (loop--) {
          var pi2 = stack.pop();
          var p = z2[pi2];
          if (exports2.DEBUG) {
            console.log(
              state.step,
              (state.loop > 1 ? "loop " + (state.loop - loop) + ": " : "") + "IP[]",
              pi2,
              rp1i,
              "<->",
              rp2i
            );
          }
          fv.interpolate(p, rp1, rp2, pv);
          fv.touch(p);
        }
        state.loop = 1;
      }
      function MSIRP(a, state) {
        var stack = state.stack;
        var d2 = stack.pop() / 64;
        var pi2 = stack.pop();
        var p = state.z1[pi2];
        var rp0 = state.z0[state.rp0];
        var fv = state.fv;
        var pv = state.pv;
        fv.setRelative(p, rp0, d2, pv);
        fv.touch(p);
        if (exports2.DEBUG) {
          console.log(state.step, "MSIRP[" + a + "]", d2, pi2);
        }
        state.rp1 = state.rp0;
        state.rp2 = pi2;
        if (a) {
          state.rp0 = pi2;
        }
      }
      function ALIGNRP(state) {
        var stack = state.stack;
        var rp0i = state.rp0;
        var rp0 = state.z0[rp0i];
        var loop = state.loop;
        var fv = state.fv;
        var pv = state.pv;
        var z1 = state.z1;
        while (loop--) {
          var pi2 = stack.pop();
          var p = z1[pi2];
          if (exports2.DEBUG) {
            console.log(
              state.step,
              (state.loop > 1 ? "loop " + (state.loop - loop) + ": " : "") + "ALIGNRP[]",
              pi2
            );
          }
          fv.setRelative(p, rp0, 0, pv);
          fv.touch(p);
        }
        state.loop = 1;
      }
      function RTDG(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "RTDG[]");
        }
        state.round = roundToDoubleGrid;
      }
      function MIAP(round, state) {
        var stack = state.stack;
        var n = stack.pop();
        var pi2 = stack.pop();
        var p = state.z0[pi2];
        var fv = state.fv;
        var pv = state.pv;
        var cv = state.cvt[n];
        if (exports2.DEBUG) {
          console.log(
            state.step,
            "MIAP[" + round + "]",
            n,
            "(",
            cv,
            ")",
            pi2
          );
        }
        var d2 = pv.distance(p, HPZero);
        if (round) {
          if (Math.abs(d2 - cv) < state.cvCutIn) {
            d2 = cv;
          }
          d2 = state.round(d2);
        }
        fv.setRelative(p, HPZero, d2, pv);
        if (state.zp0 === 0) {
          p.xo = p.x;
          p.yo = p.y;
        }
        fv.touch(p);
        state.rp0 = state.rp1 = pi2;
      }
      function NPUSHB(state) {
        var prog = state.prog;
        var ip = state.ip;
        var stack = state.stack;
        var n = prog[++ip];
        if (exports2.DEBUG) {
          console.log(state.step, "NPUSHB[]", n);
        }
        for (var i3 = 0; i3 < n; i3++) {
          stack.push(prog[++ip]);
        }
        state.ip = ip;
      }
      function NPUSHW(state) {
        var ip = state.ip;
        var prog = state.prog;
        var stack = state.stack;
        var n = prog[++ip];
        if (exports2.DEBUG) {
          console.log(state.step, "NPUSHW[]", n);
        }
        for (var i3 = 0; i3 < n; i3++) {
          var w2 = prog[++ip] << 8 | prog[++ip];
          if (w2 & 32768) {
            w2 = -((w2 ^ 65535) + 1);
          }
          stack.push(w2);
        }
        state.ip = ip;
      }
      function WS(state) {
        var stack = state.stack;
        var store = state.store;
        if (!store) {
          store = state.store = [];
        }
        var v2 = stack.pop();
        var l2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "WS", v2, l2);
        }
        store[l2] = v2;
      }
      function RS(state) {
        var stack = state.stack;
        var store = state.store;
        var l2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "RS", l2);
        }
        var v2 = store && store[l2] || 0;
        stack.push(v2);
      }
      function WCVTP(state) {
        var stack = state.stack;
        var v2 = stack.pop();
        var l2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "WCVTP", v2, l2);
        }
        state.cvt[l2] = v2 / 64;
      }
      function RCVT(state) {
        var stack = state.stack;
        var cvte = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "RCVT", cvte);
        }
        stack.push(state.cvt[cvte] * 64);
      }
      function GC(a, state) {
        var stack = state.stack;
        var pi2 = stack.pop();
        var p = state.z2[pi2];
        if (exports2.DEBUG) {
          console.log(state.step, "GC[" + a + "]", pi2);
        }
        stack.push(state.dpv.distance(p, HPZero, a, false) * 64);
      }
      function MD(a, state) {
        var stack = state.stack;
        var pi2 = stack.pop();
        var pi1 = stack.pop();
        var p2 = state.z1[pi2];
        var p1 = state.z0[pi1];
        var d2 = state.dpv.distance(p1, p2, a, a);
        if (exports2.DEBUG) {
          console.log(state.step, "MD[" + a + "]", pi2, pi1, "->", d2);
        }
        state.stack.push(Math.round(d2 * 64));
      }
      function MPPEM(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "MPPEM[]");
        }
        state.stack.push(state.ppem);
      }
      function FLIPON(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "FLIPON[]");
        }
        state.autoFlip = true;
      }
      function LT(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "LT[]", e2, e1);
        }
        stack.push(e1 < e2 ? 1 : 0);
      }
      function LTEQ(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "LTEQ[]", e2, e1);
        }
        stack.push(e1 <= e2 ? 1 : 0);
      }
      function GT(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "GT[]", e2, e1);
        }
        stack.push(e1 > e2 ? 1 : 0);
      }
      function GTEQ(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "GTEQ[]", e2, e1);
        }
        stack.push(e1 >= e2 ? 1 : 0);
      }
      function EQ(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "EQ[]", e2, e1);
        }
        stack.push(e2 === e1 ? 1 : 0);
      }
      function NEQ(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "NEQ[]", e2, e1);
        }
        stack.push(e2 !== e1 ? 1 : 0);
      }
      function ODD(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "ODD[]", n);
        }
        stack.push(Math.trunc(n) % 2 ? 1 : 0);
      }
      function EVEN(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "EVEN[]", n);
        }
        stack.push(Math.trunc(n) % 2 ? 0 : 1);
      }
      function IF(state) {
        var test = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "IF[]", test);
        }
        if (!test) {
          skip(state, true);
          if (exports2.DEBUG) {
            console.log(state.step, "EIF[]");
          }
        }
      }
      function EIF(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "EIF[]");
        }
      }
      function AND(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "AND[]", e2, e1);
        }
        stack.push(e2 && e1 ? 1 : 0);
      }
      function OR(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "OR[]", e2, e1);
        }
        stack.push(e2 || e1 ? 1 : 0);
      }
      function NOT(state) {
        var stack = state.stack;
        var e = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "NOT[]", e);
        }
        stack.push(e ? 0 : 1);
      }
      function DELTAP123(b, state) {
        var stack = state.stack;
        var n = stack.pop();
        var fv = state.fv;
        var pv = state.pv;
        var ppem = state.ppem;
        var base = state.deltaBase + (b - 1) * 16;
        var ds2 = state.deltaShift;
        var z0 = state.z0;
        if (exports2.DEBUG) {
          console.log(state.step, "DELTAP[" + b + "]", n, stack);
        }
        for (var i3 = 0; i3 < n; i3++) {
          var pi2 = stack.pop();
          var arg = stack.pop();
          var appem = base + ((arg & 240) >> 4);
          if (appem !== ppem) {
            continue;
          }
          var mag = (arg & 15) - 8;
          if (mag >= 0) {
            mag++;
          }
          if (exports2.DEBUG) {
            console.log(state.step, "DELTAPFIX", pi2, "by", mag * ds2);
          }
          var p = z0[pi2];
          fv.setRelative(p, p, mag * ds2, pv);
        }
      }
      function SDB(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SDB[]", n);
        }
        state.deltaBase = n;
      }
      function SDS(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SDS[]", n);
        }
        state.deltaShift = Math.pow(0.5, n);
      }
      function ADD(state) {
        var stack = state.stack;
        var n2 = stack.pop();
        var n1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "ADD[]", n2, n1);
        }
        stack.push(n1 + n2);
      }
      function SUB(state) {
        var stack = state.stack;
        var n2 = stack.pop();
        var n1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SUB[]", n2, n1);
        }
        stack.push(n1 - n2);
      }
      function DIV(state) {
        var stack = state.stack;
        var n2 = stack.pop();
        var n1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "DIV[]", n2, n1);
        }
        stack.push(n1 * 64 / n2);
      }
      function MUL(state) {
        var stack = state.stack;
        var n2 = stack.pop();
        var n1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "MUL[]", n2, n1);
        }
        stack.push(n1 * n2 / 64);
      }
      function ABS(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "ABS[]", n);
        }
        stack.push(Math.abs(n));
      }
      function NEG(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "NEG[]", n);
        }
        stack.push(-n);
      }
      function FLOOR(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "FLOOR[]", n);
        }
        stack.push(Math.floor(n / 64) * 64);
      }
      function CEILING(state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "CEILING[]", n);
        }
        stack.push(Math.ceil(n / 64) * 64);
      }
      function ROUND(dt, state) {
        var stack = state.stack;
        var n = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "ROUND[]");
        }
        stack.push(state.round(n / 64) * 64);
      }
      function WCVTF(state) {
        var stack = state.stack;
        var v2 = stack.pop();
        var l2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "WCVTF[]", v2, l2);
        }
        state.cvt[l2] = v2 * state.ppem / state.font.unitsPerEm;
      }
      function DELTAC123(b, state) {
        var stack = state.stack;
        var n = stack.pop();
        var ppem = state.ppem;
        var base = state.deltaBase + (b - 1) * 16;
        var ds2 = state.deltaShift;
        if (exports2.DEBUG) {
          console.log(state.step, "DELTAC[" + b + "]", n, stack);
        }
        for (var i3 = 0; i3 < n; i3++) {
          var c2 = stack.pop();
          var arg = stack.pop();
          var appem = base + ((arg & 240) >> 4);
          if (appem !== ppem) {
            continue;
          }
          var mag = (arg & 15) - 8;
          if (mag >= 0) {
            mag++;
          }
          var delta = mag * ds2;
          if (exports2.DEBUG) {
            console.log(state.step, "DELTACFIX", c2, "by", delta);
          }
          state.cvt[c2] += delta;
        }
      }
      function SROUND(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SROUND[]", n);
        }
        state.round = roundSuper;
        var period;
        switch (n & 192) {
          case 0:
            period = 0.5;
            break;
          case 64:
            period = 1;
            break;
          case 128:
            period = 2;
            break;
          default:
            throw new Error("invalid SROUND value");
        }
        state.srPeriod = period;
        switch (n & 48) {
          case 0:
            state.srPhase = 0;
            break;
          case 16:
            state.srPhase = 0.25 * period;
            break;
          case 32:
            state.srPhase = 0.5 * period;
            break;
          case 48:
            state.srPhase = 0.75 * period;
            break;
          default:
            throw new Error("invalid SROUND value");
        }
        n &= 15;
        if (n === 0) {
          state.srThreshold = 0;
        } else {
          state.srThreshold = (n / 8 - 0.5) * period;
        }
      }
      function S45ROUND(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "S45ROUND[]", n);
        }
        state.round = roundSuper;
        var period;
        switch (n & 192) {
          case 0:
            period = Math.sqrt(2) / 2;
            break;
          case 64:
            period = Math.sqrt(2);
            break;
          case 128:
            period = 2 * Math.sqrt(2);
            break;
          default:
            throw new Error("invalid S45ROUND value");
        }
        state.srPeriod = period;
        switch (n & 48) {
          case 0:
            state.srPhase = 0;
            break;
          case 16:
            state.srPhase = 0.25 * period;
            break;
          case 32:
            state.srPhase = 0.5 * period;
            break;
          case 48:
            state.srPhase = 0.75 * period;
            break;
          default:
            throw new Error("invalid S45ROUND value");
        }
        n &= 15;
        if (n === 0) {
          state.srThreshold = 0;
        } else {
          state.srThreshold = (n / 8 - 0.5) * period;
        }
      }
      function ROFF(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "ROFF[]");
        }
        state.round = roundOff;
      }
      function RUTG(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "RUTG[]");
        }
        state.round = roundUpToGrid;
      }
      function RDTG(state) {
        if (exports2.DEBUG) {
          console.log(state.step, "RDTG[]");
        }
        state.round = roundDownToGrid;
      }
      function SCANCTRL(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SCANCTRL[]", n);
        }
      }
      function SDPVTL(a, state) {
        var stack = state.stack;
        var p2i = stack.pop();
        var p1i = stack.pop();
        var p2 = state.z2[p2i];
        var p1 = state.z1[p1i];
        if (exports2.DEBUG) {
          console.log(state.step, "SDPVTL[" + a + "]", p2i, p1i);
        }
        var dx;
        var dy;
        if (!a) {
          dx = p1.x - p2.x;
          dy = p1.y - p2.y;
        } else {
          dx = p2.y - p1.y;
          dy = p1.x - p2.x;
        }
        state.dpv = getUnitVector(dx, dy);
      }
      function GETINFO(state) {
        var stack = state.stack;
        var sel = stack.pop();
        var r = 0;
        if (exports2.DEBUG) {
          console.log(state.step, "GETINFO[]", sel);
        }
        if (sel & 1) {
          r = 35;
        }
        if (sel & 32) {
          r |= 4096;
        }
        stack.push(r);
      }
      function ROLL(state) {
        var stack = state.stack;
        var a = stack.pop();
        var b = stack.pop();
        var c2 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "ROLL[]");
        }
        stack.push(b);
        stack.push(a);
        stack.push(c2);
      }
      function MAX(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "MAX[]", e2, e1);
        }
        stack.push(Math.max(e1, e2));
      }
      function MIN(state) {
        var stack = state.stack;
        var e2 = stack.pop();
        var e1 = stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "MIN[]", e2, e1);
        }
        stack.push(Math.min(e1, e2));
      }
      function SCANTYPE(state) {
        var n = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "SCANTYPE[]", n);
        }
      }
      function INSTCTRL(state) {
        var s = state.stack.pop();
        var v2 = state.stack.pop();
        if (exports2.DEBUG) {
          console.log(state.step, "INSTCTRL[]", s, v2);
        }
        switch (s) {
          case 1:
            state.inhibitGridFit = !!v2;
            return;
          case 2:
            state.ignoreCvt = !!v2;
            return;
          default:
            throw new Error("invalid INSTCTRL[] selector");
        }
      }
      function PUSHB(n, state) {
        var stack = state.stack;
        var prog = state.prog;
        var ip = state.ip;
        if (exports2.DEBUG) {
          console.log(state.step, "PUSHB[" + n + "]");
        }
        for (var i3 = 0; i3 < n; i3++) {
          stack.push(prog[++ip]);
        }
        state.ip = ip;
      }
      function PUSHW(n, state) {
        var ip = state.ip;
        var prog = state.prog;
        var stack = state.stack;
        if (exports2.DEBUG) {
          console.log(state.ip, "PUSHW[" + n + "]");
        }
        for (var i3 = 0; i3 < n; i3++) {
          var w2 = prog[++ip] << 8 | prog[++ip];
          if (w2 & 32768) {
            w2 = -((w2 ^ 65535) + 1);
          }
          stack.push(w2);
        }
        state.ip = ip;
      }
      function MDRP_MIRP(indirect, setRp0, keepD, ro, dt, state) {
        var stack = state.stack;
        var cvte = indirect && stack.pop();
        var pi2 = stack.pop();
        var rp0i = state.rp0;
        var rp2 = state.z0[rp0i];
        var p = state.z1[pi2];
        var md = state.minDis;
        var fv = state.fv;
        var pv = state.dpv;
        var od;
        var d2;
        var sign;
        var cv;
        d2 = od = pv.distance(p, rp2, true, true);
        sign = d2 >= 0 ? 1 : -1;
        d2 = Math.abs(d2);
        if (indirect) {
          cv = state.cvt[cvte];
          if (ro && Math.abs(d2 - cv) < state.cvCutIn) {
            d2 = cv;
          }
        }
        if (keepD && d2 < md) {
          d2 = md;
        }
        if (ro) {
          d2 = state.round(d2);
        }
        fv.setRelative(p, rp2, sign * d2, pv);
        fv.touch(p);
        if (exports2.DEBUG) {
          console.log(
            state.step,
            (indirect ? "MIRP[" : "MDRP[") + (setRp0 ? "M" : "m") + (keepD ? ">" : "_") + (ro ? "R" : "_") + (dt === 0 ? "Gr" : dt === 1 ? "Bl" : dt === 2 ? "Wh" : "") + "]",
            indirect ? cvte + "(" + state.cvt[cvte] + "," + cv + ")" : "",
            pi2,
            "(d =",
            od,
            "->",
            sign * d2,
            ")"
          );
        }
        state.rp1 = state.rp0;
        state.rp2 = pi2;
        if (setRp0) {
          state.rp0 = pi2;
        }
      }
      instructionTable = [
        /* 0x00 */
        SVTCA.bind(void 0, yUnitVector),
        /* 0x01 */
        SVTCA.bind(void 0, xUnitVector),
        /* 0x02 */
        SPVTCA.bind(void 0, yUnitVector),
        /* 0x03 */
        SPVTCA.bind(void 0, xUnitVector),
        /* 0x04 */
        SFVTCA.bind(void 0, yUnitVector),
        /* 0x05 */
        SFVTCA.bind(void 0, xUnitVector),
        /* 0x06 */
        SPVTL.bind(void 0, 0),
        /* 0x07 */
        SPVTL.bind(void 0, 1),
        /* 0x08 */
        SFVTL.bind(void 0, 0),
        /* 0x09 */
        SFVTL.bind(void 0, 1),
        /* 0x0A */
        SPVFS,
        /* 0x0B */
        SFVFS,
        /* 0x0C */
        GPV,
        /* 0x0D */
        GFV,
        /* 0x0E */
        SFVTPV,
        /* 0x0F */
        ISECT,
        /* 0x10 */
        SRP0,
        /* 0x11 */
        SRP1,
        /* 0x12 */
        SRP2,
        /* 0x13 */
        SZP0,
        /* 0x14 */
        SZP1,
        /* 0x15 */
        SZP2,
        /* 0x16 */
        SZPS,
        /* 0x17 */
        SLOOP,
        /* 0x18 */
        RTG,
        /* 0x19 */
        RTHG,
        /* 0x1A */
        SMD,
        /* 0x1B */
        ELSE,
        /* 0x1C */
        JMPR,
        /* 0x1D */
        SCVTCI,
        /* 0x1E */
        void 0,
        // TODO SSWCI
        /* 0x1F */
        void 0,
        // TODO SSW
        /* 0x20 */
        DUP,
        /* 0x21 */
        POP,
        /* 0x22 */
        CLEAR,
        /* 0x23 */
        SWAP,
        /* 0x24 */
        DEPTH,
        /* 0x25 */
        CINDEX,
        /* 0x26 */
        MINDEX,
        /* 0x27 */
        void 0,
        // TODO ALIGNPTS
        /* 0x28 */
        void 0,
        /* 0x29 */
        void 0,
        // TODO UTP
        /* 0x2A */
        LOOPCALL,
        /* 0x2B */
        CALL,
        /* 0x2C */
        FDEF,
        /* 0x2D */
        void 0,
        // ENDF (eaten by FDEF)
        /* 0x2E */
        MDAP.bind(void 0, 0),
        /* 0x2F */
        MDAP.bind(void 0, 1),
        /* 0x30 */
        IUP.bind(void 0, yUnitVector),
        /* 0x31 */
        IUP.bind(void 0, xUnitVector),
        /* 0x32 */
        SHP.bind(void 0, 0),
        /* 0x33 */
        SHP.bind(void 0, 1),
        /* 0x34 */
        SHC.bind(void 0, 0),
        /* 0x35 */
        SHC.bind(void 0, 1),
        /* 0x36 */
        SHZ.bind(void 0, 0),
        /* 0x37 */
        SHZ.bind(void 0, 1),
        /* 0x38 */
        SHPIX,
        /* 0x39 */
        IP,
        /* 0x3A */
        MSIRP.bind(void 0, 0),
        /* 0x3B */
        MSIRP.bind(void 0, 1),
        /* 0x3C */
        ALIGNRP,
        /* 0x3D */
        RTDG,
        /* 0x3E */
        MIAP.bind(void 0, 0),
        /* 0x3F */
        MIAP.bind(void 0, 1),
        /* 0x40 */
        NPUSHB,
        /* 0x41 */
        NPUSHW,
        /* 0x42 */
        WS,
        /* 0x43 */
        RS,
        /* 0x44 */
        WCVTP,
        /* 0x45 */
        RCVT,
        /* 0x46 */
        GC.bind(void 0, 0),
        /* 0x47 */
        GC.bind(void 0, 1),
        /* 0x48 */
        void 0,
        // TODO SCFS
        /* 0x49 */
        MD.bind(void 0, 0),
        /* 0x4A */
        MD.bind(void 0, 1),
        /* 0x4B */
        MPPEM,
        /* 0x4C */
        void 0,
        // TODO MPS
        /* 0x4D */
        FLIPON,
        /* 0x4E */
        void 0,
        // TODO FLIPOFF
        /* 0x4F */
        void 0,
        // TODO DEBUG
        /* 0x50 */
        LT,
        /* 0x51 */
        LTEQ,
        /* 0x52 */
        GT,
        /* 0x53 */
        GTEQ,
        /* 0x54 */
        EQ,
        /* 0x55 */
        NEQ,
        /* 0x56 */
        ODD,
        /* 0x57 */
        EVEN,
        /* 0x58 */
        IF,
        /* 0x59 */
        EIF,
        /* 0x5A */
        AND,
        /* 0x5B */
        OR,
        /* 0x5C */
        NOT,
        /* 0x5D */
        DELTAP123.bind(void 0, 1),
        /* 0x5E */
        SDB,
        /* 0x5F */
        SDS,
        /* 0x60 */
        ADD,
        /* 0x61 */
        SUB,
        /* 0x62 */
        DIV,
        /* 0x63 */
        MUL,
        /* 0x64 */
        ABS,
        /* 0x65 */
        NEG,
        /* 0x66 */
        FLOOR,
        /* 0x67 */
        CEILING,
        /* 0x68 */
        ROUND.bind(void 0, 0),
        /* 0x69 */
        ROUND.bind(void 0, 1),
        /* 0x6A */
        ROUND.bind(void 0, 2),
        /* 0x6B */
        ROUND.bind(void 0, 3),
        /* 0x6C */
        void 0,
        // TODO NROUND[ab]
        /* 0x6D */
        void 0,
        // TODO NROUND[ab]
        /* 0x6E */
        void 0,
        // TODO NROUND[ab]
        /* 0x6F */
        void 0,
        // TODO NROUND[ab]
        /* 0x70 */
        WCVTF,
        /* 0x71 */
        DELTAP123.bind(void 0, 2),
        /* 0x72 */
        DELTAP123.bind(void 0, 3),
        /* 0x73 */
        DELTAC123.bind(void 0, 1),
        /* 0x74 */
        DELTAC123.bind(void 0, 2),
        /* 0x75 */
        DELTAC123.bind(void 0, 3),
        /* 0x76 */
        SROUND,
        /* 0x77 */
        S45ROUND,
        /* 0x78 */
        void 0,
        // TODO JROT[]
        /* 0x79 */
        void 0,
        // TODO JROF[]
        /* 0x7A */
        ROFF,
        /* 0x7B */
        void 0,
        /* 0x7C */
        RUTG,
        /* 0x7D */
        RDTG,
        /* 0x7E */
        POP,
        // actually SANGW, supposed to do only a pop though
        /* 0x7F */
        POP,
        // actually AA, supposed to do only a pop though
        /* 0x80 */
        void 0,
        // TODO FLIPPT
        /* 0x81 */
        void 0,
        // TODO FLIPRGON
        /* 0x82 */
        void 0,
        // TODO FLIPRGOFF
        /* 0x83 */
        void 0,
        /* 0x84 */
        void 0,
        /* 0x85 */
        SCANCTRL,
        /* 0x86 */
        SDPVTL.bind(void 0, 0),
        /* 0x87 */
        SDPVTL.bind(void 0, 1),
        /* 0x88 */
        GETINFO,
        /* 0x89 */
        void 0,
        // TODO IDEF
        /* 0x8A */
        ROLL,
        /* 0x8B */
        MAX,
        /* 0x8C */
        MIN,
        /* 0x8D */
        SCANTYPE,
        /* 0x8E */
        INSTCTRL,
        /* 0x8F */
        void 0,
        /* 0x90 */
        void 0,
        /* 0x91 */
        void 0,
        /* 0x92 */
        void 0,
        /* 0x93 */
        void 0,
        /* 0x94 */
        void 0,
        /* 0x95 */
        void 0,
        /* 0x96 */
        void 0,
        /* 0x97 */
        void 0,
        /* 0x98 */
        void 0,
        /* 0x99 */
        void 0,
        /* 0x9A */
        void 0,
        /* 0x9B */
        void 0,
        /* 0x9C */
        void 0,
        /* 0x9D */
        void 0,
        /* 0x9E */
        void 0,
        /* 0x9F */
        void 0,
        /* 0xA0 */
        void 0,
        /* 0xA1 */
        void 0,
        /* 0xA2 */
        void 0,
        /* 0xA3 */
        void 0,
        /* 0xA4 */
        void 0,
        /* 0xA5 */
        void 0,
        /* 0xA6 */
        void 0,
        /* 0xA7 */
        void 0,
        /* 0xA8 */
        void 0,
        /* 0xA9 */
        void 0,
        /* 0xAA */
        void 0,
        /* 0xAB */
        void 0,
        /* 0xAC */
        void 0,
        /* 0xAD */
        void 0,
        /* 0xAE */
        void 0,
        /* 0xAF */
        void 0,
        /* 0xB0 */
        PUSHB.bind(void 0, 1),
        /* 0xB1 */
        PUSHB.bind(void 0, 2),
        /* 0xB2 */
        PUSHB.bind(void 0, 3),
        /* 0xB3 */
        PUSHB.bind(void 0, 4),
        /* 0xB4 */
        PUSHB.bind(void 0, 5),
        /* 0xB5 */
        PUSHB.bind(void 0, 6),
        /* 0xB6 */
        PUSHB.bind(void 0, 7),
        /* 0xB7 */
        PUSHB.bind(void 0, 8),
        /* 0xB8 */
        PUSHW.bind(void 0, 1),
        /* 0xB9 */
        PUSHW.bind(void 0, 2),
        /* 0xBA */
        PUSHW.bind(void 0, 3),
        /* 0xBB */
        PUSHW.bind(void 0, 4),
        /* 0xBC */
        PUSHW.bind(void 0, 5),
        /* 0xBD */
        PUSHW.bind(void 0, 6),
        /* 0xBE */
        PUSHW.bind(void 0, 7),
        /* 0xBF */
        PUSHW.bind(void 0, 8),
        /* 0xC0 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 0, 0),
        /* 0xC1 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 0, 1),
        /* 0xC2 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 0, 2),
        /* 0xC3 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 0, 3),
        /* 0xC4 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 1, 0),
        /* 0xC5 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 1, 1),
        /* 0xC6 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 1, 2),
        /* 0xC7 */
        MDRP_MIRP.bind(void 0, 0, 0, 0, 1, 3),
        /* 0xC8 */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 0, 0),
        /* 0xC9 */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 0, 1),
        /* 0xCA */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 0, 2),
        /* 0xCB */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 0, 3),
        /* 0xCC */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 1, 0),
        /* 0xCD */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 1, 1),
        /* 0xCE */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 1, 2),
        /* 0xCF */
        MDRP_MIRP.bind(void 0, 0, 0, 1, 1, 3),
        /* 0xD0 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 0, 0),
        /* 0xD1 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 0, 1),
        /* 0xD2 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 0, 2),
        /* 0xD3 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 0, 3),
        /* 0xD4 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 1, 0),
        /* 0xD5 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 1, 1),
        /* 0xD6 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 1, 2),
        /* 0xD7 */
        MDRP_MIRP.bind(void 0, 0, 1, 0, 1, 3),
        /* 0xD8 */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 0, 0),
        /* 0xD9 */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 0, 1),
        /* 0xDA */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 0, 2),
        /* 0xDB */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 0, 3),
        /* 0xDC */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 1, 0),
        /* 0xDD */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 1, 1),
        /* 0xDE */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 1, 2),
        /* 0xDF */
        MDRP_MIRP.bind(void 0, 0, 1, 1, 1, 3),
        /* 0xE0 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 0, 0),
        /* 0xE1 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 0, 1),
        /* 0xE2 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 0, 2),
        /* 0xE3 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 0, 3),
        /* 0xE4 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 1, 0),
        /* 0xE5 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 1, 1),
        /* 0xE6 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 1, 2),
        /* 0xE7 */
        MDRP_MIRP.bind(void 0, 1, 0, 0, 1, 3),
        /* 0xE8 */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 0, 0),
        /* 0xE9 */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 0, 1),
        /* 0xEA */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 0, 2),
        /* 0xEB */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 0, 3),
        /* 0xEC */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 1, 0),
        /* 0xED */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 1, 1),
        /* 0xEE */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 1, 2),
        /* 0xEF */
        MDRP_MIRP.bind(void 0, 1, 0, 1, 1, 3),
        /* 0xF0 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 0, 0),
        /* 0xF1 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 0, 1),
        /* 0xF2 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 0, 2),
        /* 0xF3 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 0, 3),
        /* 0xF4 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 1, 0),
        /* 0xF5 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 1, 1),
        /* 0xF6 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 1, 2),
        /* 0xF7 */
        MDRP_MIRP.bind(void 0, 1, 1, 0, 1, 3),
        /* 0xF8 */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 0, 0),
        /* 0xF9 */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 0, 1),
        /* 0xFA */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 0, 2),
        /* 0xFB */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 0, 3),
        /* 0xFC */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 1, 0),
        /* 0xFD */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 1, 1),
        /* 0xFE */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 1, 2),
        /* 0xFF */
        MDRP_MIRP.bind(void 0, 1, 1, 1, 1, 3)
      ];
      function Token(char) {
        this.char = char;
        this.state = {};
        this.activeState = null;
      }
      function ContextRange(startIndex, endOffset, contextName) {
        this.contextName = contextName;
        this.startIndex = startIndex;
        this.endOffset = endOffset;
      }
      function ContextChecker(contextName, checkStart, checkEnd) {
        this.contextName = contextName;
        this.openRange = null;
        this.ranges = [];
        this.checkStart = checkStart;
        this.checkEnd = checkEnd;
      }
      function ContextParams(context, currentIndex) {
        this.context = context;
        this.index = currentIndex;
        this.length = context.length;
        this.current = context[currentIndex];
        this.backtrack = context.slice(0, currentIndex);
        this.lookahead = context.slice(currentIndex + 1);
      }
      function Event(eventId) {
        this.eventId = eventId;
        this.subscribers = [];
      }
      function initializeCoreEvents(events) {
        var this$1 = this;
        var coreEvents = [
          "start",
          "end",
          "next",
          "newToken",
          "contextStart",
          "contextEnd",
          "insertToken",
          "removeToken",
          "removeRange",
          "replaceToken",
          "replaceRange",
          "composeRUD",
          "updateContextsRanges"
        ];
        coreEvents.forEach(function(eventId) {
          Object.defineProperty(this$1.events, eventId, {
            value: new Event(eventId)
          });
        });
        if (!!events) {
          coreEvents.forEach(function(eventId) {
            var event = events[eventId];
            if (typeof event === "function") {
              this$1.events[eventId].subscribe(event);
            }
          });
        }
        var requiresContextUpdate = [
          "insertToken",
          "removeToken",
          "removeRange",
          "replaceToken",
          "replaceRange",
          "composeRUD"
        ];
        requiresContextUpdate.forEach(function(eventId) {
          this$1.events[eventId].subscribe(
            this$1.updateContextsRanges
          );
        });
      }
      function Tokenizer(events) {
        this.tokens = [];
        this.registeredContexts = {};
        this.contextCheckers = [];
        this.events = {};
        this.registeredModifiers = [];
        initializeCoreEvents.call(this, events);
      }
      Token.prototype.setState = function(key, value) {
        this.state[key] = value;
        this.activeState = { key, value: this.state[key] };
        return this.activeState;
      };
      Token.prototype.getState = function(stateId) {
        return this.state[stateId] || null;
      };
      Tokenizer.prototype.inboundIndex = function(index) {
        return index >= 0 && index < this.tokens.length;
      };
      Tokenizer.prototype.composeRUD = function(RUDs) {
        var this$1 = this;
        var silent = true;
        var state = RUDs.map(function(RUD) {
          return this$1[RUD[0]].apply(this$1, RUD.slice(1).concat(silent));
        });
        var hasFAILObject = function(obj) {
          return typeof obj === "object" && obj.hasOwnProperty("FAIL");
        };
        if (state.every(hasFAILObject)) {
          return {
            FAIL: "composeRUD: one or more operations hasn't completed successfully",
            report: state.filter(hasFAILObject)
          };
        }
        this.dispatch("composeRUD", [state.filter(function(op) {
          return !hasFAILObject(op);
        })]);
      };
      Tokenizer.prototype.replaceRange = function(startIndex, offset, tokens, silent) {
        offset = offset !== null ? offset : this.tokens.length;
        var isTokenType = tokens.every(function(token) {
          return token instanceof Token;
        });
        if (!isNaN(startIndex) && this.inboundIndex(startIndex) && isTokenType) {
          var replaced = this.tokens.splice.apply(
            this.tokens,
            [startIndex, offset].concat(tokens)
          );
          if (!silent) {
            this.dispatch("replaceToken", [startIndex, offset, tokens]);
          }
          return [replaced, tokens];
        } else {
          return { FAIL: "replaceRange: invalid tokens or startIndex." };
        }
      };
      Tokenizer.prototype.replaceToken = function(index, token, silent) {
        if (!isNaN(index) && this.inboundIndex(index) && token instanceof Token) {
          var replaced = this.tokens.splice(index, 1, token);
          if (!silent) {
            this.dispatch("replaceToken", [index, token]);
          }
          return [replaced[0], token];
        } else {
          return { FAIL: "replaceToken: invalid token or index." };
        }
      };
      Tokenizer.prototype.removeRange = function(startIndex, offset, silent) {
        offset = !isNaN(offset) ? offset : this.tokens.length;
        var tokens = this.tokens.splice(startIndex, offset);
        if (!silent) {
          this.dispatch("removeRange", [tokens, startIndex, offset]);
        }
        return tokens;
      };
      Tokenizer.prototype.removeToken = function(index, silent) {
        if (!isNaN(index) && this.inboundIndex(index)) {
          var token = this.tokens.splice(index, 1);
          if (!silent) {
            this.dispatch("removeToken", [token, index]);
          }
          return token;
        } else {
          return { FAIL: "removeToken: invalid token index." };
        }
      };
      Tokenizer.prototype.insertToken = function(tokens, index, silent) {
        var tokenType = tokens.every(
          function(token) {
            return token instanceof Token;
          }
        );
        if (tokenType) {
          this.tokens.splice.apply(
            this.tokens,
            [index, 0].concat(tokens)
          );
          if (!silent) {
            this.dispatch("insertToken", [tokens, index]);
          }
          return tokens;
        } else {
          return { FAIL: "insertToken: invalid token(s)." };
        }
      };
      Tokenizer.prototype.registerModifier = function(modifierId, condition, modifier) {
        this.events.newToken.subscribe(function(token, contextParams) {
          var conditionParams = [token, contextParams];
          var canApplyModifier = condition === null || condition.apply(this, conditionParams) === true;
          var modifierParams = [token, contextParams];
          if (canApplyModifier) {
            var newStateValue = modifier.apply(this, modifierParams);
            token.setState(modifierId, newStateValue);
          }
        });
        this.registeredModifiers.push(modifierId);
      };
      Event.prototype.subscribe = function(eventHandler) {
        if (typeof eventHandler === "function") {
          return this.subscribers.push(eventHandler) - 1;
        } else {
          return { FAIL: "invalid '" + this.eventId + "' event handler" };
        }
      };
      Event.prototype.unsubscribe = function(subsId) {
        this.subscribers.splice(subsId, 1);
      };
      ContextParams.prototype.setCurrentIndex = function(index) {
        this.index = index;
        this.current = this.context[index];
        this.backtrack = this.context.slice(0, index);
        this.lookahead = this.context.slice(index + 1);
      };
      ContextParams.prototype.get = function(offset) {
        switch (true) {
          case offset === 0:
            return this.current;
          case (offset < 0 && Math.abs(offset) <= this.backtrack.length):
            return this.backtrack.slice(offset)[0];
          case (offset > 0 && offset <= this.lookahead.length):
            return this.lookahead[offset - 1];
          default:
            return null;
        }
      };
      Tokenizer.prototype.rangeToText = function(range) {
        if (range instanceof ContextRange) {
          return this.getRangeTokens(range).map(function(token) {
            return token.char;
          }).join("");
        }
      };
      Tokenizer.prototype.getText = function() {
        return this.tokens.map(function(token) {
          return token.char;
        }).join("");
      };
      Tokenizer.prototype.getContext = function(contextName) {
        var context = this.registeredContexts[contextName];
        return !!context ? context : null;
      };
      Tokenizer.prototype.on = function(eventName, eventHandler) {
        var event = this.events[eventName];
        if (!!event) {
          return event.subscribe(eventHandler);
        } else {
          return null;
        }
      };
      Tokenizer.prototype.dispatch = function(eventName, args) {
        var this$1 = this;
        var event = this.events[eventName];
        if (event instanceof Event) {
          event.subscribers.forEach(function(subscriber) {
            subscriber.apply(this$1, args || []);
          });
        }
      };
      Tokenizer.prototype.registerContextChecker = function(contextName, contextStartCheck, contextEndCheck) {
        if (!!this.getContext(contextName)) {
          return {
            FAIL: "context name '" + contextName + "' is already registered."
          };
        }
        if (typeof contextStartCheck !== "function") {
          return {
            FAIL: "missing context start check."
          };
        }
        if (typeof contextEndCheck !== "function") {
          return {
            FAIL: "missing context end check."
          };
        }
        var contextCheckers = new ContextChecker(
          contextName,
          contextStartCheck,
          contextEndCheck
        );
        this.registeredContexts[contextName] = contextCheckers;
        this.contextCheckers.push(contextCheckers);
        return contextCheckers;
      };
      Tokenizer.prototype.getRangeTokens = function(range) {
        var endIndex = range.startIndex + range.endOffset;
        return [].concat(
          this.tokens.slice(range.startIndex, endIndex)
        );
      };
      Tokenizer.prototype.getContextRanges = function(contextName) {
        var context = this.getContext(contextName);
        if (!!context) {
          return context.ranges;
        } else {
          return { FAIL: "context checker '" + contextName + "' is not registered." };
        }
      };
      Tokenizer.prototype.resetContextsRanges = function() {
        var registeredContexts = this.registeredContexts;
        for (var contextName in registeredContexts) {
          if (registeredContexts.hasOwnProperty(contextName)) {
            var context = registeredContexts[contextName];
            context.ranges = [];
          }
        }
      };
      Tokenizer.prototype.updateContextsRanges = function() {
        this.resetContextsRanges();
        var chars = this.tokens.map(function(token) {
          return token.char;
        });
        for (var i3 = 0; i3 < chars.length; i3++) {
          var contextParams = new ContextParams(chars, i3);
          this.runContextCheck(contextParams);
        }
        this.dispatch("updateContextsRanges", [this.registeredContexts]);
      };
      Tokenizer.prototype.setEndOffset = function(offset, contextName) {
        var startIndex = this.getContext(contextName).openRange.startIndex;
        var range = new ContextRange(startIndex, offset, contextName);
        var ranges = this.getContext(contextName).ranges;
        range.rangeId = contextName + "." + ranges.length;
        ranges.push(range);
        this.getContext(contextName).openRange = null;
        return range;
      };
      Tokenizer.prototype.runContextCheck = function(contextParams) {
        var this$1 = this;
        var index = contextParams.index;
        this.contextCheckers.forEach(function(contextChecker) {
          var contextName = contextChecker.contextName;
          var openRange = this$1.getContext(contextName).openRange;
          if (!openRange && contextChecker.checkStart(contextParams)) {
            openRange = new ContextRange(index, null, contextName);
            this$1.getContext(contextName).openRange = openRange;
            this$1.dispatch("contextStart", [contextName, index]);
          }
          if (!!openRange && contextChecker.checkEnd(contextParams)) {
            var offset = index - openRange.startIndex + 1;
            var range = this$1.setEndOffset(offset, contextName);
            this$1.dispatch("contextEnd", [contextName, range]);
          }
        });
      };
      Tokenizer.prototype.tokenize = function(text) {
        this.tokens = [];
        this.resetContextsRanges();
        var chars = Array.from(text);
        this.dispatch("start");
        for (var i3 = 0; i3 < chars.length; i3++) {
          var char = chars[i3];
          var contextParams = new ContextParams(chars, i3);
          this.dispatch("next", [contextParams]);
          this.runContextCheck(contextParams);
          var token = new Token(char);
          this.tokens.push(token);
          this.dispatch("newToken", [token, contextParams]);
        }
        this.dispatch("end", [this.tokens]);
        return this.tokens;
      };
      function isArabicChar(c2) {
        return /[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(c2);
      }
      function isIsolatedArabicChar(char) {
        return /[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(char);
      }
      function isTashkeelArabicChar(char) {
        return /[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(char);
      }
      function isLatinChar(c2) {
        return /[A-z]/.test(c2);
      }
      function isWhiteSpace(c2) {
        return /\s/.test(c2);
      }
      function FeatureQuery(font) {
        this.font = font;
        this.features = {};
      }
      function SubstitutionAction(action) {
        this.id = action.id;
        this.tag = action.tag;
        this.substitution = action.substitution;
      }
      function lookupCoverage(glyphIndex, coverage) {
        if (!glyphIndex) {
          return -1;
        }
        switch (coverage.format) {
          case 1:
            return coverage.glyphs.indexOf(glyphIndex);
          case 2:
            var ranges = coverage.ranges;
            for (var i3 = 0; i3 < ranges.length; i3++) {
              var range = ranges[i3];
              if (glyphIndex >= range.start && glyphIndex <= range.end) {
                var offset = glyphIndex - range.start;
                return range.index + offset;
              }
            }
            break;
          default:
            return -1;
        }
        return -1;
      }
      function singleSubstitutionFormat1(glyphIndex, subtable) {
        var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
        if (substituteIndex === -1) {
          return null;
        }
        return glyphIndex + subtable.deltaGlyphId;
      }
      function singleSubstitutionFormat2(glyphIndex, subtable) {
        var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
        if (substituteIndex === -1) {
          return null;
        }
        return subtable.substitute[substituteIndex];
      }
      function lookupCoverageList(coverageList, contextParams) {
        var lookupList = [];
        for (var i3 = 0; i3 < coverageList.length; i3++) {
          var coverage = coverageList[i3];
          var glyphIndex = contextParams.current;
          glyphIndex = Array.isArray(glyphIndex) ? glyphIndex[0] : glyphIndex;
          var lookupIndex = lookupCoverage(glyphIndex, coverage);
          if (lookupIndex !== -1) {
            lookupList.push(lookupIndex);
          }
        }
        if (lookupList.length !== coverageList.length) {
          return -1;
        }
        return lookupList;
      }
      function chainingSubstitutionFormat3(contextParams, subtable) {
        var lookupsCount = subtable.inputCoverage.length + subtable.lookaheadCoverage.length + subtable.backtrackCoverage.length;
        if (contextParams.context.length < lookupsCount) {
          return [];
        }
        var inputLookups = lookupCoverageList(
          subtable.inputCoverage,
          contextParams
        );
        if (inputLookups === -1) {
          return [];
        }
        var lookaheadOffset = subtable.inputCoverage.length - 1;
        if (contextParams.lookahead.length < subtable.lookaheadCoverage.length) {
          return [];
        }
        var lookaheadContext = contextParams.lookahead.slice(lookaheadOffset);
        while (lookaheadContext.length && isTashkeelArabicChar(lookaheadContext[0].char)) {
          lookaheadContext.shift();
        }
        var lookaheadParams = new ContextParams(lookaheadContext, 0);
        var lookaheadLookups = lookupCoverageList(
          subtable.lookaheadCoverage,
          lookaheadParams
        );
        var backtrackContext = [].concat(contextParams.backtrack);
        backtrackContext.reverse();
        while (backtrackContext.length && isTashkeelArabicChar(backtrackContext[0].char)) {
          backtrackContext.shift();
        }
        if (backtrackContext.length < subtable.backtrackCoverage.length) {
          return [];
        }
        var backtrackParams = new ContextParams(backtrackContext, 0);
        var backtrackLookups = lookupCoverageList(
          subtable.backtrackCoverage,
          backtrackParams
        );
        var contextRulesMatch = inputLookups.length === subtable.inputCoverage.length && lookaheadLookups.length === subtable.lookaheadCoverage.length && backtrackLookups.length === subtable.backtrackCoverage.length;
        var substitutions = [];
        if (contextRulesMatch) {
          for (var i3 = 0; i3 < subtable.lookupRecords.length; i3++) {
            var lookupRecord = subtable.lookupRecords[i3];
            var lookupListIndex = lookupRecord.lookupListIndex;
            var lookupTable = this.getLookupByIndex(lookupListIndex);
            for (var s = 0; s < lookupTable.subtables.length; s++) {
              var subtable$1 = lookupTable.subtables[s];
              var lookup = this.getLookupMethod(lookupTable, subtable$1);
              var substitutionType = this.getSubstitutionType(lookupTable, subtable$1);
              if (substitutionType === "12") {
                for (var n = 0; n < inputLookups.length; n++) {
                  var glyphIndex = contextParams.get(n);
                  var substitution = lookup(glyphIndex);
                  if (substitution) {
                    substitutions.push(substitution);
                  }
                }
              }
            }
          }
        }
        return substitutions;
      }
      function ligatureSubstitutionFormat1(contextParams, subtable) {
        var glyphIndex = contextParams.current;
        var ligSetIndex = lookupCoverage(glyphIndex, subtable.coverage);
        if (ligSetIndex === -1) {
          return null;
        }
        var ligature;
        var ligatureSet = subtable.ligatureSets[ligSetIndex];
        for (var s = 0; s < ligatureSet.length; s++) {
          ligature = ligatureSet[s];
          for (var l2 = 0; l2 < ligature.components.length; l2++) {
            var lookaheadItem = contextParams.lookahead[l2];
            var component = ligature.components[l2];
            if (lookaheadItem !== component) {
              break;
            }
            if (l2 === ligature.components.length - 1) {
              return ligature;
            }
          }
        }
        return null;
      }
      function decompositionSubstitutionFormat1(glyphIndex, subtable) {
        var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
        if (substituteIndex === -1) {
          return null;
        }
        return subtable.sequences[substituteIndex];
      }
      FeatureQuery.prototype.getDefaultScriptFeaturesIndexes = function() {
        var scripts = this.font.tables.gsub.scripts;
        for (var s = 0; s < scripts.length; s++) {
          var script = scripts[s];
          if (script.tag === "DFLT") {
            return script.script.defaultLangSys.featureIndexes;
          }
        }
        return [];
      };
      FeatureQuery.prototype.getScriptFeaturesIndexes = function(scriptTag) {
        var tables = this.font.tables;
        if (!tables.gsub) {
          return [];
        }
        if (!scriptTag) {
          return this.getDefaultScriptFeaturesIndexes();
        }
        var scripts = this.font.tables.gsub.scripts;
        for (var i3 = 0; i3 < scripts.length; i3++) {
          var script = scripts[i3];
          if (script.tag === scriptTag && script.script.defaultLangSys) {
            return script.script.defaultLangSys.featureIndexes;
          } else {
            var langSysRecords = script.langSysRecords;
            if (!!langSysRecords) {
              for (var j = 0; j < langSysRecords.length; j++) {
                var langSysRecord = langSysRecords[j];
                if (langSysRecord.tag === scriptTag) {
                  var langSys = langSysRecord.langSys;
                  return langSys.featureIndexes;
                }
              }
            }
          }
        }
        return this.getDefaultScriptFeaturesIndexes();
      };
      FeatureQuery.prototype.mapTagsToFeatures = function(features, scriptTag) {
        var tags = {};
        for (var i3 = 0; i3 < features.length; i3++) {
          var tag = features[i3].tag;
          var feature = features[i3].feature;
          tags[tag] = feature;
        }
        this.features[scriptTag].tags = tags;
      };
      FeatureQuery.prototype.getScriptFeatures = function(scriptTag) {
        var features = this.features[scriptTag];
        if (this.features.hasOwnProperty(scriptTag)) {
          return features;
        }
        var featuresIndexes = this.getScriptFeaturesIndexes(scriptTag);
        if (!featuresIndexes) {
          return null;
        }
        var gsub2 = this.font.tables.gsub;
        features = featuresIndexes.map(function(index) {
          return gsub2.features[index];
        });
        this.features[scriptTag] = features;
        this.mapTagsToFeatures(features, scriptTag);
        return features;
      };
      FeatureQuery.prototype.getSubstitutionType = function(lookupTable, subtable) {
        var lookupType = lookupTable.lookupType.toString();
        var substFormat = subtable.substFormat.toString();
        return lookupType + substFormat;
      };
      FeatureQuery.prototype.getLookupMethod = function(lookupTable, subtable) {
        var this$1 = this;
        var substitutionType = this.getSubstitutionType(lookupTable, subtable);
        switch (substitutionType) {
          case "11":
            return function(glyphIndex) {
              return singleSubstitutionFormat1.apply(
                this$1,
                [glyphIndex, subtable]
              );
            };
          case "12":
            return function(glyphIndex) {
              return singleSubstitutionFormat2.apply(
                this$1,
                [glyphIndex, subtable]
              );
            };
          case "63":
            return function(contextParams) {
              return chainingSubstitutionFormat3.apply(
                this$1,
                [contextParams, subtable]
              );
            };
          case "41":
            return function(contextParams) {
              return ligatureSubstitutionFormat1.apply(
                this$1,
                [contextParams, subtable]
              );
            };
          case "21":
            return function(glyphIndex) {
              return decompositionSubstitutionFormat1.apply(
                this$1,
                [glyphIndex, subtable]
              );
            };
          default:
            throw new Error(
              "lookupType: " + lookupTable.lookupType + " - substFormat: " + subtable.substFormat + " is not yet supported"
            );
        }
      };
      FeatureQuery.prototype.lookupFeature = function(query) {
        var contextParams = query.contextParams;
        var currentIndex = contextParams.index;
        var feature = this.getFeature({
          tag: query.tag,
          script: query.script
        });
        if (!feature) {
          return new Error(
            "font '" + this.font.names.fullName.en + "' doesn't support feature '" + query.tag + "' for script '" + query.script + "'."
          );
        }
        var lookups = this.getFeatureLookups(feature);
        var substitutions = [].concat(contextParams.context);
        for (var l2 = 0; l2 < lookups.length; l2++) {
          var lookupTable = lookups[l2];
          var subtables = this.getLookupSubtables(lookupTable);
          for (var s = 0; s < subtables.length; s++) {
            var subtable = subtables[s];
            var substType = this.getSubstitutionType(lookupTable, subtable);
            var lookup = this.getLookupMethod(lookupTable, subtable);
            var substitution = void 0;
            switch (substType) {
              case "11":
                substitution = lookup(contextParams.current);
                if (substitution) {
                  substitutions.splice(currentIndex, 1, new SubstitutionAction({
                    id: 11,
                    tag: query.tag,
                    substitution
                  }));
                }
                break;
              case "12":
                substitution = lookup(contextParams.current);
                if (substitution) {
                  substitutions.splice(currentIndex, 1, new SubstitutionAction({
                    id: 12,
                    tag: query.tag,
                    substitution
                  }));
                }
                break;
              case "63":
                substitution = lookup(contextParams);
                if (Array.isArray(substitution) && substitution.length) {
                  substitutions.splice(currentIndex, 1, new SubstitutionAction({
                    id: 63,
                    tag: query.tag,
                    substitution
                  }));
                }
                break;
              case "41":
                substitution = lookup(contextParams);
                if (substitution) {
                  substitutions.splice(currentIndex, 1, new SubstitutionAction({
                    id: 41,
                    tag: query.tag,
                    substitution
                  }));
                }
                break;
              case "21":
                substitution = lookup(contextParams.current);
                if (substitution) {
                  substitutions.splice(currentIndex, 1, new SubstitutionAction({
                    id: 21,
                    tag: query.tag,
                    substitution
                  }));
                }
                break;
            }
            contextParams = new ContextParams(substitutions, currentIndex);
            if (Array.isArray(substitution) && !substitution.length) {
              continue;
            }
            substitution = null;
          }
        }
        return substitutions.length ? substitutions : null;
      };
      FeatureQuery.prototype.supports = function(query) {
        if (!query.script) {
          return false;
        }
        this.getScriptFeatures(query.script);
        var supportedScript = this.features.hasOwnProperty(query.script);
        if (!query.tag) {
          return supportedScript;
        }
        var supportedFeature = this.features[query.script].some(function(feature) {
          return feature.tag === query.tag;
        });
        return supportedScript && supportedFeature;
      };
      FeatureQuery.prototype.getLookupSubtables = function(lookupTable) {
        return lookupTable.subtables || null;
      };
      FeatureQuery.prototype.getLookupByIndex = function(index) {
        var lookups = this.font.tables.gsub.lookups;
        return lookups[index] || null;
      };
      FeatureQuery.prototype.getFeatureLookups = function(feature) {
        return feature.lookupListIndexes.map(this.getLookupByIndex.bind(this));
      };
      FeatureQuery.prototype.getFeature = function getFeature(query) {
        if (!this.font) {
          return { FAIL: "No font was found" };
        }
        if (!this.features.hasOwnProperty(query.script)) {
          this.getScriptFeatures(query.script);
        }
        var scriptFeatures = this.features[query.script];
        if (!scriptFeatures) {
          return { FAIL: "No feature for script " + query.script };
        }
        if (!scriptFeatures.tags[query.tag]) {
          return null;
        }
        return this.features[query.script].tags[query.tag];
      };
      function arabicWordStartCheck(contextParams) {
        var char = contextParams.current;
        var prevChar = contextParams.get(-1);
        return (
          // ? arabic first char
          prevChar === null && isArabicChar(char) || // ? arabic char preceded with a non arabic char
          !isArabicChar(prevChar) && isArabicChar(char)
        );
      }
      function arabicWordEndCheck(contextParams) {
        var nextChar = contextParams.get(1);
        return (
          // ? last arabic char
          nextChar === null || // ? next char is not arabic
          !isArabicChar(nextChar)
        );
      }
      var arabicWordCheck = {
        startCheck: arabicWordStartCheck,
        endCheck: arabicWordEndCheck
      };
      function arabicSentenceStartCheck(contextParams) {
        var char = contextParams.current;
        var prevChar = contextParams.get(-1);
        return (
          // ? an arabic char preceded with a non arabic char
          (isArabicChar(char) || isTashkeelArabicChar(char)) && !isArabicChar(prevChar)
        );
      }
      function arabicSentenceEndCheck(contextParams) {
        var nextChar = contextParams.get(1);
        switch (true) {
          case nextChar === null:
            return true;
          case (!isArabicChar(nextChar) && !isTashkeelArabicChar(nextChar)):
            var nextIsWhitespace = isWhiteSpace(nextChar);
            if (!nextIsWhitespace) {
              return true;
            }
            if (nextIsWhitespace) {
              var arabicCharAhead = false;
              arabicCharAhead = contextParams.lookahead.some(
                function(c2) {
                  return isArabicChar(c2) || isTashkeelArabicChar(c2);
                }
              );
              if (!arabicCharAhead) {
                return true;
              }
            }
            break;
          default:
            return false;
        }
      }
      var arabicSentenceCheck = {
        startCheck: arabicSentenceStartCheck,
        endCheck: arabicSentenceEndCheck
      };
      function singleSubstitutionFormat1$1(action, tokens, index) {
        tokens[index].setState(action.tag, action.substitution);
      }
      function singleSubstitutionFormat2$1(action, tokens, index) {
        tokens[index].setState(action.tag, action.substitution);
      }
      function chainingSubstitutionFormat3$1(action, tokens, index) {
        action.substitution.forEach(function(subst, offset) {
          var token = tokens[index + offset];
          token.setState(action.tag, subst);
        });
      }
      function ligatureSubstitutionFormat1$1(action, tokens, index) {
        var token = tokens[index];
        token.setState(action.tag, action.substitution.ligGlyph);
        var compsCount = action.substitution.components.length;
        for (var i3 = 0; i3 < compsCount; i3++) {
          token = tokens[index + i3 + 1];
          token.setState("deleted", true);
        }
      }
      var SUBSTITUTIONS = {
        11: singleSubstitutionFormat1$1,
        12: singleSubstitutionFormat2$1,
        63: chainingSubstitutionFormat3$1,
        41: ligatureSubstitutionFormat1$1
      };
      function applySubstitution(action, tokens, index) {
        if (action instanceof SubstitutionAction && SUBSTITUTIONS[action.id]) {
          SUBSTITUTIONS[action.id](action, tokens, index);
        }
      }
      function willConnectPrev(charContextParams) {
        var backtrack = [].concat(charContextParams.backtrack);
        for (var i3 = backtrack.length - 1; i3 >= 0; i3--) {
          var prevChar = backtrack[i3];
          var isolated = isIsolatedArabicChar(prevChar);
          var tashkeel = isTashkeelArabicChar(prevChar);
          if (!isolated && !tashkeel) {
            return true;
          }
          if (isolated) {
            return false;
          }
        }
        return false;
      }
      function willConnectNext(charContextParams) {
        if (isIsolatedArabicChar(charContextParams.current)) {
          return false;
        }
        for (var i3 = 0; i3 < charContextParams.lookahead.length; i3++) {
          var nextChar = charContextParams.lookahead[i3];
          var tashkeel = isTashkeelArabicChar(nextChar);
          if (!tashkeel) {
            return true;
          }
        }
        return false;
      }
      function arabicPresentationForms(range) {
        var this$1 = this;
        var script = "arab";
        var tags = this.featuresTags[script];
        var tokens = this.tokenizer.getRangeTokens(range);
        if (tokens.length === 1) {
          return;
        }
        var contextParams = new ContextParams(
          tokens.map(
            function(token) {
              return token.getState("glyphIndex");
            }
          ),
          0
        );
        var charContextParams = new ContextParams(
          tokens.map(
            function(token) {
              return token.char;
            }
          ),
          0
        );
        tokens.forEach(function(token, index) {
          if (isTashkeelArabicChar(token.char)) {
            return;
          }
          contextParams.setCurrentIndex(index);
          charContextParams.setCurrentIndex(index);
          var CONNECT = 0;
          if (willConnectPrev(charContextParams)) {
            CONNECT |= 1;
          }
          if (willConnectNext(charContextParams)) {
            CONNECT |= 2;
          }
          var tag;
          switch (CONNECT) {
            case 1:
              tag = "fina";
              break;
            case 2:
              tag = "init";
              break;
            case 3:
              tag = "medi";
              break;
          }
          if (tags.indexOf(tag) === -1) {
            return;
          }
          var substitutions = this$1.query.lookupFeature({
            tag,
            script,
            contextParams
          });
          if (substitutions instanceof Error) {
            return console.info(substitutions.message);
          }
          substitutions.forEach(function(action, index2) {
            if (action instanceof SubstitutionAction) {
              applySubstitution(action, tokens, index2);
              contextParams.context[index2] = action.substitution;
            }
          });
        });
      }
      function getContextParams(tokens, index) {
        var context = tokens.map(function(token) {
          return token.activeState.value;
        });
        return new ContextParams(context, index || 0);
      }
      function arabicRequiredLigatures(range) {
        var this$1 = this;
        var script = "arab";
        var tokens = this.tokenizer.getRangeTokens(range);
        var contextParams = getContextParams(tokens);
        contextParams.context.forEach(function(glyphIndex, index) {
          contextParams.setCurrentIndex(index);
          var substitutions = this$1.query.lookupFeature({
            tag: "rlig",
            script,
            contextParams
          });
          if (substitutions.length) {
            substitutions.forEach(
              function(action) {
                return applySubstitution(action, tokens, index);
              }
            );
            contextParams = getContextParams(tokens);
          }
        });
      }
      function latinWordStartCheck(contextParams) {
        var char = contextParams.current;
        var prevChar = contextParams.get(-1);
        return (
          // ? latin first char
          prevChar === null && isLatinChar(char) || // ? latin char preceded with a non latin char
          !isLatinChar(prevChar) && isLatinChar(char)
        );
      }
      function latinWordEndCheck(contextParams) {
        var nextChar = contextParams.get(1);
        return (
          // ? last latin char
          nextChar === null || // ? next char is not latin
          !isLatinChar(nextChar)
        );
      }
      var latinWordCheck = {
        startCheck: latinWordStartCheck,
        endCheck: latinWordEndCheck
      };
      function getContextParams$1(tokens, index) {
        var context = tokens.map(function(token) {
          return token.activeState.value;
        });
        return new ContextParams(context, index || 0);
      }
      function latinLigature(range) {
        var this$1 = this;
        var script = "latn";
        var tokens = this.tokenizer.getRangeTokens(range);
        var contextParams = getContextParams$1(tokens);
        contextParams.context.forEach(function(glyphIndex, index) {
          contextParams.setCurrentIndex(index);
          var substitutions = this$1.query.lookupFeature({
            tag: "liga",
            script,
            contextParams
          });
          if (substitutions.length) {
            substitutions.forEach(
              function(action) {
                return applySubstitution(action, tokens, index);
              }
            );
            contextParams = getContextParams$1(tokens);
          }
        });
      }
      function Bidi(baseDir) {
        this.baseDir = baseDir || "ltr";
        this.tokenizer = new Tokenizer();
        this.featuresTags = {};
      }
      Bidi.prototype.setText = function(text) {
        this.text = text;
      };
      Bidi.prototype.contextChecks = {
        latinWordCheck,
        arabicWordCheck,
        arabicSentenceCheck
      };
      function registerContextChecker(checkId) {
        var check2 = this.contextChecks[checkId + "Check"];
        return this.tokenizer.registerContextChecker(
          checkId,
          check2.startCheck,
          check2.endCheck
        );
      }
      function tokenizeText() {
        registerContextChecker.call(this, "latinWord");
        registerContextChecker.call(this, "arabicWord");
        registerContextChecker.call(this, "arabicSentence");
        return this.tokenizer.tokenize(this.text);
      }
      function reverseArabicSentences() {
        var this$1 = this;
        var ranges = this.tokenizer.getContextRanges("arabicSentence");
        ranges.forEach(function(range) {
          var rangeTokens = this$1.tokenizer.getRangeTokens(range);
          this$1.tokenizer.replaceRange(
            range.startIndex,
            range.endOffset,
            rangeTokens.reverse()
          );
        });
      }
      Bidi.prototype.registerFeatures = function(script, tags) {
        var this$1 = this;
        var supportedTags = tags.filter(
          function(tag) {
            return this$1.query.supports({ script, tag });
          }
        );
        if (!this.featuresTags.hasOwnProperty(script)) {
          this.featuresTags[script] = supportedTags;
        } else {
          this.featuresTags[script] = this.featuresTags[script].concat(supportedTags);
        }
      };
      Bidi.prototype.applyFeatures = function(font, features) {
        if (!font) {
          throw new Error(
            "No valid font was provided to apply features"
          );
        }
        if (!this.query) {
          this.query = new FeatureQuery(font);
        }
        for (var f = 0; f < features.length; f++) {
          var feature = features[f];
          if (!this.query.supports({ script: feature.script })) {
            continue;
          }
          this.registerFeatures(feature.script, feature.tags);
        }
      };
      Bidi.prototype.registerModifier = function(modifierId, condition, modifier) {
        this.tokenizer.registerModifier(modifierId, condition, modifier);
      };
      function checkGlyphIndexStatus() {
        if (this.tokenizer.registeredModifiers.indexOf("glyphIndex") === -1) {
          throw new Error(
            "glyphIndex modifier is required to apply arabic presentation features."
          );
        }
      }
      function applyArabicPresentationForms() {
        var this$1 = this;
        var script = "arab";
        if (!this.featuresTags.hasOwnProperty(script)) {
          return;
        }
        checkGlyphIndexStatus.call(this);
        var ranges = this.tokenizer.getContextRanges("arabicWord");
        ranges.forEach(function(range) {
          arabicPresentationForms.call(this$1, range);
        });
      }
      function applyArabicRequireLigatures() {
        var this$1 = this;
        var script = "arab";
        if (!this.featuresTags.hasOwnProperty(script)) {
          return;
        }
        var tags = this.featuresTags[script];
        if (tags.indexOf("rlig") === -1) {
          return;
        }
        checkGlyphIndexStatus.call(this);
        var ranges = this.tokenizer.getContextRanges("arabicWord");
        ranges.forEach(function(range) {
          arabicRequiredLigatures.call(this$1, range);
        });
      }
      function applyLatinLigatures() {
        var this$1 = this;
        var script = "latn";
        if (!this.featuresTags.hasOwnProperty(script)) {
          return;
        }
        var tags = this.featuresTags[script];
        if (tags.indexOf("liga") === -1) {
          return;
        }
        checkGlyphIndexStatus.call(this);
        var ranges = this.tokenizer.getContextRanges("latinWord");
        ranges.forEach(function(range) {
          latinLigature.call(this$1, range);
        });
      }
      Bidi.prototype.checkContextReady = function(contextId) {
        return !!this.tokenizer.getContext(contextId);
      };
      Bidi.prototype.applyFeaturesToContexts = function() {
        if (this.checkContextReady("arabicWord")) {
          applyArabicPresentationForms.call(this);
          applyArabicRequireLigatures.call(this);
        }
        if (this.checkContextReady("latinWord")) {
          applyLatinLigatures.call(this);
        }
        if (this.checkContextReady("arabicSentence")) {
          reverseArabicSentences.call(this);
        }
      };
      Bidi.prototype.processText = function(text) {
        if (!this.text || this.text !== text) {
          this.setText(text);
          tokenizeText.call(this);
          this.applyFeaturesToContexts();
        }
      };
      Bidi.prototype.getBidiText = function(text) {
        this.processText(text);
        return this.tokenizer.getText();
      };
      Bidi.prototype.getTextGlyphs = function(text) {
        this.processText(text);
        var indexes = [];
        for (var i3 = 0; i3 < this.tokenizer.tokens.length; i3++) {
          var token = this.tokenizer.tokens[i3];
          if (token.state.deleted) {
            continue;
          }
          var index = token.activeState.value;
          indexes.push(Array.isArray(index) ? index[0] : index);
        }
        return indexes;
      };
      function Font(options) {
        options = options || {};
        options.tables = options.tables || {};
        if (!options.empty) {
          checkArgument(
            options.familyName,
            "When creating a new Font object, familyName is required."
          );
          checkArgument(
            options.styleName,
            "When creating a new Font object, styleName is required."
          );
          checkArgument(
            options.unitsPerEm,
            "When creating a new Font object, unitsPerEm is required."
          );
          checkArgument(
            options.ascender,
            "When creating a new Font object, ascender is required."
          );
          checkArgument(
            options.descender <= 0,
            "When creating a new Font object, negative descender value is required."
          );
          this.unitsPerEm = options.unitsPerEm || 1e3;
          this.ascender = options.ascender;
          this.descender = options.descender;
          this.createdTimestamp = options.createdTimestamp;
          this.tables = Object.assign(options.tables, {
            os2: Object.assign(
              {
                usWeightClass: options.weightClass || this.usWeightClasses.MEDIUM,
                usWidthClass: options.widthClass || this.usWidthClasses.MEDIUM,
                fsSelection: options.fsSelection || this.fsSelectionValues.REGULAR
              },
              options.tables.os2
            )
          });
        }
        this.supported = true;
        this.glyphs = new glyphset.GlyphSet(this, options.glyphs || []);
        this.encoding = new DefaultEncoding(this);
        this.position = new Position(this);
        this.substitution = new Substitution(this);
        this.tables = this.tables || {};
        this._push = null;
        this._hmtxTableData = {};
        Object.defineProperty(this, "hinting", {
          get: function() {
            if (this._hinting) {
              return this._hinting;
            }
            if (this.outlinesFormat === "truetype") {
              return this._hinting = new Hinting(this);
            }
          }
        });
      }
      Font.prototype.hasChar = function(c2) {
        return this.encoding.charToGlyphIndex(c2) !== null;
      };
      Font.prototype.charToGlyphIndex = function(s) {
        return this.encoding.charToGlyphIndex(s);
      };
      Font.prototype.charToGlyph = function(c2) {
        var glyphIndex = this.charToGlyphIndex(c2);
        var glyph = this.glyphs.get(glyphIndex);
        if (!glyph) {
          glyph = this.glyphs.get(0);
        }
        return glyph;
      };
      Font.prototype.updateFeatures = function(options) {
        return this.defaultRenderOptions.features.map(function(feature) {
          if (feature.script === "latn") {
            return {
              script: "latn",
              tags: feature.tags.filter(function(tag) {
                return options[tag];
              })
            };
          } else {
            return feature;
          }
        });
      };
      Font.prototype.stringToGlyphs = function(s, options) {
        var this$1 = this;
        var bidi = new Bidi();
        var charToGlyphIndexMod = function(token) {
          return this$1.charToGlyphIndex(token.char);
        };
        bidi.registerModifier("glyphIndex", null, charToGlyphIndexMod);
        var features = options ? this.updateFeatures(options.features) : this.defaultRenderOptions.features;
        bidi.applyFeatures(this, features);
        var indexes = bidi.getTextGlyphs(s);
        var length = indexes.length;
        var glyphs = new Array(length);
        var notdef = this.glyphs.get(0);
        for (var i3 = 0; i3 < length; i3 += 1) {
          glyphs[i3] = this.glyphs.get(indexes[i3]) || notdef;
        }
        return glyphs;
      };
      Font.prototype.getKerningValue = function(leftGlyph, rightGlyph) {
        leftGlyph = leftGlyph.index || leftGlyph;
        rightGlyph = rightGlyph.index || rightGlyph;
        var gposKerning = this.position.defaultKerningTables;
        if (gposKerning) {
          return this.position.getKerningValue(
            gposKerning,
            leftGlyph,
            rightGlyph
          );
        }
        return this.kerningPairs[leftGlyph + "," + rightGlyph] || 0;
      };
      Font.prototype.defaultRenderOptions = {
        kerning: true,
        features: [
          /**
           * these 4 features are required to render Arabic text properly
           * and shouldn't be turned off when rendering arabic text.
           */
          { script: "arab", tags: ["init", "medi", "fina", "rlig"] },
          { script: "latn", tags: ["liga", "rlig"] }
        ]
      };
      Font.prototype.forEachGlyph = function(text, x4, y, fontSize, options, callback) {
        x4 = x4 !== void 0 ? x4 : 0;
        y = y !== void 0 ? y : 0;
        fontSize = fontSize !== void 0 ? fontSize : 72;
        options = Object.assign({}, this.defaultRenderOptions, options);
        var fontScale = 1 / this.unitsPerEm * fontSize;
        var glyphs = this.stringToGlyphs(text, options);
        var kerningLookups;
        if (options.kerning) {
          var script = options.script || this.position.getDefaultScriptName();
          kerningLookups = this.position.getKerningTables(
            script,
            options.language
          );
        }
        for (var i3 = 0; i3 < glyphs.length; i3 += 1) {
          var glyph = glyphs[i3];
          callback.call(this, glyph, x4, y, fontSize, options);
          if (glyph.advanceWidth) {
            x4 += glyph.advanceWidth * fontScale;
          }
          if (options.kerning && i3 < glyphs.length - 1) {
            var kerningValue = kerningLookups ? this.position.getKerningValue(
              kerningLookups,
              glyph.index,
              glyphs[i3 + 1].index
            ) : this.getKerningValue(glyph, glyphs[i3 + 1]);
            x4 += kerningValue * fontScale;
          }
          if (options.letterSpacing) {
            x4 += options.letterSpacing * fontSize;
          } else if (options.tracking) {
            x4 += options.tracking / 1e3 * fontSize;
          }
        }
        return x4;
      };
      Font.prototype.getPath = function(text, x4, y, fontSize, options) {
        var fullPath = new Path();
        this.forEachGlyph(
          text,
          x4,
          y,
          fontSize,
          options,
          function(glyph, gX, gY, gFontSize) {
            var glyphPath = glyph.getPath(gX, gY, gFontSize, options, this);
            fullPath.extend(glyphPath);
          }
        );
        return fullPath;
      };
      Font.prototype.getPaths = function(text, x4, y, fontSize, options) {
        var glyphPaths = [];
        this.forEachGlyph(
          text,
          x4,
          y,
          fontSize,
          options,
          function(glyph, gX, gY, gFontSize) {
            var glyphPath = glyph.getPath(gX, gY, gFontSize, options, this);
            glyphPaths.push(glyphPath);
          }
        );
        return glyphPaths;
      };
      Font.prototype.getAdvanceWidth = function(text, fontSize, options) {
        return this.forEachGlyph(text, 0, 0, fontSize, options, function() {
        });
      };
      Font.prototype.fsSelectionValues = {
        ITALIC: 1,
        //1
        UNDERSCORE: 2,
        //2
        NEGATIVE: 4,
        //4
        OUTLINED: 8,
        //8
        STRIKEOUT: 16,
        //16
        BOLD: 32,
        //32
        REGULAR: 64,
        //64
        USER_TYPO_METRICS: 128,
        //128
        WWS: 256,
        //256
        OBLIQUE: 512
        //512
      };
      Font.prototype.usWidthClasses = {
        ULTRA_CONDENSED: 1,
        EXTRA_CONDENSED: 2,
        CONDENSED: 3,
        SEMI_CONDENSED: 4,
        MEDIUM: 5,
        SEMI_EXPANDED: 6,
        EXPANDED: 7,
        EXTRA_EXPANDED: 8,
        ULTRA_EXPANDED: 9
      };
      Font.prototype.usWeightClasses = {
        THIN: 100,
        EXTRA_LIGHT: 200,
        LIGHT: 300,
        NORMAL: 400,
        MEDIUM: 500,
        SEMI_BOLD: 600,
        BOLD: 700,
        EXTRA_BOLD: 800,
        BLACK: 900
      };
      function parseCmapTableFormat12(cmap2, p) {
        p.parseUShort();
        cmap2.length = p.parseULong();
        cmap2.language = p.parseULong();
        var groupCount;
        cmap2.groupCount = groupCount = p.parseULong();
        cmap2.glyphIndexMap = {};
        for (var i3 = 0; i3 < groupCount; i3 += 1) {
          var startCharCode = p.parseULong();
          var endCharCode = p.parseULong();
          var startGlyphId = p.parseULong();
          for (var c2 = startCharCode; c2 <= endCharCode; c2 += 1) {
            cmap2.glyphIndexMap[c2] = startGlyphId;
            startGlyphId++;
          }
        }
      }
      function parseCmapTableFormat4(cmap2, p, data, start, offset) {
        cmap2.length = p.parseUShort();
        cmap2.language = p.parseUShort();
        var segCount;
        cmap2.segCount = segCount = p.parseUShort() >> 1;
        p.skip("uShort", 3);
        cmap2.glyphIndexMap = {};
        var endCountParser = new parse.Parser(data, start + offset + 14);
        var startCountParser = new parse.Parser(
          data,
          start + offset + 16 + segCount * 2
        );
        var idDeltaParser = new parse.Parser(
          data,
          start + offset + 16 + segCount * 4
        );
        var idRangeOffsetParser = new parse.Parser(
          data,
          start + offset + 16 + segCount * 6
        );
        var glyphIndexOffset = start + offset + 16 + segCount * 8;
        for (var i3 = 0; i3 < segCount - 1; i3 += 1) {
          var glyphIndex = void 0;
          var endCount = endCountParser.parseUShort();
          var startCount = startCountParser.parseUShort();
          var idDelta = idDeltaParser.parseShort();
          var idRangeOffset = idRangeOffsetParser.parseUShort();
          for (var c2 = startCount; c2 <= endCount; c2 += 1) {
            if (idRangeOffset !== 0) {
              glyphIndexOffset = idRangeOffsetParser.offset + idRangeOffsetParser.relativeOffset - 2;
              glyphIndexOffset += idRangeOffset;
              glyphIndexOffset += (c2 - startCount) * 2;
              glyphIndex = parse.getUShort(data, glyphIndexOffset);
              if (glyphIndex !== 0) {
                glyphIndex = glyphIndex + idDelta & 65535;
              }
            } else {
              glyphIndex = c2 + idDelta & 65535;
            }
            cmap2.glyphIndexMap[c2] = glyphIndex;
          }
        }
      }
      function parseCmapTable(data, start) {
        var cmap2 = {};
        cmap2.version = parse.getUShort(data, start);
        check.argument(cmap2.version === 0, "cmap table version should be 0.");
        cmap2.numTables = parse.getUShort(data, start + 2);
        var offset = -1;
        for (var i3 = cmap2.numTables - 1; i3 >= 0; i3 -= 1) {
          var platformId = parse.getUShort(data, start + 4 + i3 * 8);
          var encodingId = parse.getUShort(data, start + 4 + i3 * 8 + 2);
          if (platformId === 3 && (encodingId === 0 || encodingId === 1 || encodingId === 10) || platformId === 0 && (encodingId === 0 || encodingId === 1 || encodingId === 2 || encodingId === 3 || encodingId === 4)) {
            offset = parse.getULong(data, start + 4 + i3 * 8 + 4);
            break;
          }
        }
        if (offset === -1) {
          throw new Error("No valid cmap sub-tables found.");
        }
        var p = new parse.Parser(data, start + offset);
        cmap2.format = p.parseUShort();
        if (cmap2.format === 12) {
          parseCmapTableFormat12(cmap2, p);
        } else if (cmap2.format === 4) {
          parseCmapTableFormat4(cmap2, p, data, start, offset);
        } else {
          throw new Error(
            "Only format 4 and 12 cmap tables are supported (found format " + cmap2.format + ")."
          );
        }
        return cmap2;
      }
      var cmap = { parse: parseCmapTable };
      function calcCFFSubroutineBias(subrs) {
        var bias;
        if (subrs.length < 1240) {
          bias = 107;
        } else if (subrs.length < 33900) {
          bias = 1131;
        } else {
          bias = 32768;
        }
        return bias;
      }
      function parseCFFIndex(data, start, conversionFn) {
        var offsets = [];
        var objects = [];
        var count = parse.getCard16(data, start);
        var objectOffset;
        var endOffset;
        if (count !== 0) {
          var offsetSize = parse.getByte(data, start + 2);
          objectOffset = start + (count + 1) * offsetSize + 2;
          var pos = start + 3;
          for (var i3 = 0; i3 < count + 1; i3 += 1) {
            offsets.push(parse.getOffset(data, pos, offsetSize));
            pos += offsetSize;
          }
          endOffset = objectOffset + offsets[count];
        } else {
          endOffset = start + 2;
        }
        for (var i$1 = 0; i$1 < offsets.length - 1; i$1 += 1) {
          var value = parse.getBytes(
            data,
            objectOffset + offsets[i$1],
            objectOffset + offsets[i$1 + 1]
          );
          if (conversionFn) {
            value = conversionFn(value);
          }
          objects.push(value);
        }
        return { objects, startOffset: start, endOffset };
      }
      function parseCFFIndexLowMemory(data, start) {
        var offsets = [];
        var count = parse.getCard16(data, start);
        var objectOffset;
        var endOffset;
        if (count !== 0) {
          var offsetSize = parse.getByte(data, start + 2);
          objectOffset = start + (count + 1) * offsetSize + 2;
          var pos = start + 3;
          for (var i3 = 0; i3 < count + 1; i3 += 1) {
            offsets.push(parse.getOffset(data, pos, offsetSize));
            pos += offsetSize;
          }
          endOffset = objectOffset + offsets[count];
        } else {
          endOffset = start + 2;
        }
        return { offsets, startOffset: start, endOffset };
      }
      function getCffIndexObject(i3, offsets, data, start, conversionFn) {
        var count = parse.getCard16(data, start);
        var objectOffset = 0;
        if (count !== 0) {
          var offsetSize = parse.getByte(data, start + 2);
          objectOffset = start + (count + 1) * offsetSize + 2;
        }
        var value = parse.getBytes(
          data,
          objectOffset + offsets[i3],
          objectOffset + offsets[i3 + 1]
        );
        if (conversionFn) {
          value = conversionFn(value);
        }
        return value;
      }
      function parseFloatOperand(parser) {
        var s = "";
        var eof = 15;
        var lookup = [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "E",
          "E-",
          null,
          "-"
        ];
        while (true) {
          var b = parser.parseByte();
          var n1 = b >> 4;
          var n2 = b & 15;
          if (n1 === eof) {
            break;
          }
          s += lookup[n1];
          if (n2 === eof) {
            break;
          }
          s += lookup[n2];
        }
        return parseFloat(s);
      }
      function parseOperand(parser, b0) {
        var b1;
        var b2;
        var b3;
        var b4;
        if (b0 === 28) {
          b1 = parser.parseByte();
          b2 = parser.parseByte();
          return b1 << 8 | b2;
        }
        if (b0 === 29) {
          b1 = parser.parseByte();
          b2 = parser.parseByte();
          b3 = parser.parseByte();
          b4 = parser.parseByte();
          return b1 << 24 | b2 << 16 | b3 << 8 | b4;
        }
        if (b0 === 30) {
          return parseFloatOperand(parser);
        }
        if (b0 >= 32 && b0 <= 246) {
          return b0 - 139;
        }
        if (b0 >= 247 && b0 <= 250) {
          b1 = parser.parseByte();
          return (b0 - 247) * 256 + b1 + 108;
        }
        if (b0 >= 251 && b0 <= 254) {
          b1 = parser.parseByte();
          return -(b0 - 251) * 256 - b1 - 108;
        }
        throw new Error("Invalid b0 " + b0);
      }
      function entriesToObject(entries) {
        var o = {};
        for (var i3 = 0; i3 < entries.length; i3 += 1) {
          var key = entries[i3][0];
          var values = entries[i3][1];
          var value = void 0;
          if (values.length === 1) {
            value = values[0];
          } else {
            value = values;
          }
          if (o.hasOwnProperty(key) && !isNaN(o[key])) {
            throw new Error("Object " + o + " already has key " + key);
          }
          o[key] = value;
        }
        return o;
      }
      function parseCFFDict(data, start, size) {
        start = start !== void 0 ? start : 0;
        var parser = new parse.Parser(data, start);
        var entries = [];
        var operands = [];
        size = size !== void 0 ? size : data.length;
        while (parser.relativeOffset < size) {
          var op = parser.parseByte();
          if (op <= 21) {
            if (op === 12) {
              op = 1200 + parser.parseByte();
            }
            entries.push([op, operands]);
            operands = [];
          } else {
            operands.push(parseOperand(parser, op));
          }
        }
        return entriesToObject(entries);
      }
      function getCFFString(strings, index) {
        if (index <= 390) {
          index = cffStandardStrings[index];
        } else {
          index = strings[index - 391];
        }
        return index;
      }
      function interpretDict(dict, meta2, strings) {
        var newDict = {};
        var value;
        for (var i3 = 0; i3 < meta2.length; i3 += 1) {
          var m2 = meta2[i3];
          if (Array.isArray(m2.type)) {
            var values = [];
            values.length = m2.type.length;
            for (var j = 0; j < m2.type.length; j++) {
              value = dict[m2.op] !== void 0 ? dict[m2.op][j] : void 0;
              if (value === void 0) {
                value = m2.value !== void 0 && m2.value[j] !== void 0 ? m2.value[j] : null;
              }
              if (m2.type[j] === "SID") {
                value = getCFFString(strings, value);
              }
              values[j] = value;
            }
            newDict[m2.name] = values;
          } else {
            value = dict[m2.op];
            if (value === void 0) {
              value = m2.value !== void 0 ? m2.value : null;
            }
            if (m2.type === "SID") {
              value = getCFFString(strings, value);
            }
            newDict[m2.name] = value;
          }
        }
        return newDict;
      }
      function parseCFFHeader(data, start) {
        var header = {};
        header.formatMajor = parse.getCard8(data, start);
        header.formatMinor = parse.getCard8(data, start + 1);
        header.size = parse.getCard8(data, start + 2);
        header.offsetSize = parse.getCard8(data, start + 3);
        header.startOffset = start;
        header.endOffset = start + 4;
        return header;
      }
      var TOP_DICT_META = [
        { name: "version", op: 0, type: "SID" },
        { name: "notice", op: 1, type: "SID" },
        { name: "copyright", op: 1200, type: "SID" },
        { name: "fullName", op: 2, type: "SID" },
        { name: "familyName", op: 3, type: "SID" },
        { name: "weight", op: 4, type: "SID" },
        { name: "isFixedPitch", op: 1201, type: "number", value: 0 },
        { name: "italicAngle", op: 1202, type: "number", value: 0 },
        { name: "underlinePosition", op: 1203, type: "number", value: -100 },
        { name: "underlineThickness", op: 1204, type: "number", value: 50 },
        { name: "paintType", op: 1205, type: "number", value: 0 },
        { name: "charstringType", op: 1206, type: "number", value: 2 },
        {
          name: "fontMatrix",
          op: 1207,
          type: ["real", "real", "real", "real", "real", "real"],
          value: [1e-3, 0, 0, 1e-3, 0, 0]
        },
        { name: "uniqueId", op: 13, type: "number" },
        {
          name: "fontBBox",
          op: 5,
          type: ["number", "number", "number", "number"],
          value: [0, 0, 0, 0]
        },
        { name: "strokeWidth", op: 1208, type: "number", value: 0 },
        { name: "xuid", op: 14, type: [], value: null },
        { name: "charset", op: 15, type: "offset", value: 0 },
        { name: "encoding", op: 16, type: "offset", value: 0 },
        { name: "charStrings", op: 17, type: "offset", value: 0 },
        { name: "private", op: 18, type: ["number", "offset"], value: [0, 0] },
        { name: "ros", op: 1230, type: ["SID", "SID", "number"] },
        { name: "cidFontVersion", op: 1231, type: "number", value: 0 },
        { name: "cidFontRevision", op: 1232, type: "number", value: 0 },
        { name: "cidFontType", op: 1233, type: "number", value: 0 },
        { name: "cidCount", op: 1234, type: "number", value: 8720 },
        { name: "uidBase", op: 1235, type: "number" },
        { name: "fdArray", op: 1236, type: "offset" },
        { name: "fdSelect", op: 1237, type: "offset" },
        { name: "fontName", op: 1238, type: "SID" }
      ];
      var PRIVATE_DICT_META = [
        { name: "subrs", op: 19, type: "offset", value: 0 },
        { name: "defaultWidthX", op: 20, type: "number", value: 0 },
        { name: "nominalWidthX", op: 21, type: "number", value: 0 }
      ];
      function parseCFFTopDict(data, strings) {
        var dict = parseCFFDict(data, 0, data.byteLength);
        return interpretDict(dict, TOP_DICT_META, strings);
      }
      function parseCFFPrivateDict(data, start, size, strings) {
        var dict = parseCFFDict(data, start, size);
        return interpretDict(dict, PRIVATE_DICT_META, strings);
      }
      function gatherCFFTopDicts(data, start, cffIndex, strings) {
        var topDictArray = [];
        for (var iTopDict = 0; iTopDict < cffIndex.length; iTopDict += 1) {
          var topDictData = new DataView(
            new Uint8Array(cffIndex[iTopDict]).buffer
          );
          var topDict = parseCFFTopDict(topDictData, strings);
          topDict._subrs = [];
          topDict._subrsBias = 0;
          topDict._defaultWidthX = 0;
          topDict._nominalWidthX = 0;
          var privateSize = topDict.private[0];
          var privateOffset = topDict.private[1];
          if (privateSize !== 0 && privateOffset !== 0) {
            var privateDict = parseCFFPrivateDict(
              data,
              privateOffset + start,
              privateSize,
              strings
            );
            topDict._defaultWidthX = privateDict.defaultWidthX;
            topDict._nominalWidthX = privateDict.nominalWidthX;
            if (privateDict.subrs !== 0) {
              var subrOffset = privateOffset + privateDict.subrs;
              var subrIndex = parseCFFIndex(data, subrOffset + start);
              topDict._subrs = subrIndex.objects;
              topDict._subrsBias = calcCFFSubroutineBias(topDict._subrs);
            }
            topDict._privateDict = privateDict;
          }
          topDictArray.push(topDict);
        }
        return topDictArray;
      }
      function parseCFFCharset(data, start, nGlyphs, strings) {
        var sid;
        var count;
        var parser = new parse.Parser(data, start);
        nGlyphs -= 1;
        var charset = [".notdef"];
        var format = parser.parseCard8();
        if (format === 0) {
          for (var i3 = 0; i3 < nGlyphs; i3 += 1) {
            sid = parser.parseSID();
            charset.push(getCFFString(strings, sid));
          }
        } else if (format === 1) {
          while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard8();
            for (var i$1 = 0; i$1 <= count; i$1 += 1) {
              charset.push(getCFFString(strings, sid));
              sid += 1;
            }
          }
        } else if (format === 2) {
          while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard16();
            for (var i$2 = 0; i$2 <= count; i$2 += 1) {
              charset.push(getCFFString(strings, sid));
              sid += 1;
            }
          }
        } else {
          throw new Error("Unknown charset format " + format);
        }
        return charset;
      }
      function parseCFFEncoding(data, start, charset) {
        var code;
        var enc = {};
        var parser = new parse.Parser(data, start);
        var format = parser.parseCard8();
        if (format === 0) {
          var nCodes = parser.parseCard8();
          for (var i3 = 0; i3 < nCodes; i3 += 1) {
            code = parser.parseCard8();
            enc[code] = i3;
          }
        } else if (format === 1) {
          var nRanges = parser.parseCard8();
          code = 1;
          for (var i$1 = 0; i$1 < nRanges; i$1 += 1) {
            var first = parser.parseCard8();
            var nLeft = parser.parseCard8();
            for (var j = first; j <= first + nLeft; j += 1) {
              enc[j] = code;
              code += 1;
            }
          }
        } else {
          throw new Error("Unknown encoding format " + format);
        }
        return new CffEncoding(enc, charset);
      }
      function parseCFFCharstring(font, glyph, code) {
        var c1x;
        var c1y;
        var c2x;
        var c2y;
        var p = new Path();
        var stack = [];
        var nStems = 0;
        var haveWidth = false;
        var open = false;
        var x4 = 0;
        var y = 0;
        var subrs;
        var subrsBias;
        var defaultWidthX;
        var nominalWidthX;
        if (font.isCIDFont) {
          var fdIndex = font.tables.cff.topDict._fdSelect[glyph.index];
          var fdDict = font.tables.cff.topDict._fdArray[fdIndex];
          subrs = fdDict._subrs;
          subrsBias = fdDict._subrsBias;
          defaultWidthX = fdDict._defaultWidthX;
          nominalWidthX = fdDict._nominalWidthX;
        } else {
          subrs = font.tables.cff.topDict._subrs;
          subrsBias = font.tables.cff.topDict._subrsBias;
          defaultWidthX = font.tables.cff.topDict._defaultWidthX;
          nominalWidthX = font.tables.cff.topDict._nominalWidthX;
        }
        var width = defaultWidthX;
        function newContour(x5, y2) {
          if (open) {
            p.closePath();
          }
          p.moveTo(x5, y2);
          open = true;
        }
        function parseStems() {
          var hasWidthArg;
          hasWidthArg = stack.length % 2 !== 0;
          if (hasWidthArg && !haveWidth) {
            width = stack.shift() + nominalWidthX;
          }
          nStems += stack.length >> 1;
          stack.length = 0;
          haveWidth = true;
        }
        function parse2(code2) {
          var b1;
          var b2;
          var b3;
          var b4;
          var codeIndex;
          var subrCode;
          var jpx;
          var jpy;
          var c3x;
          var c3y;
          var c4x;
          var c4y;
          var i3 = 0;
          while (i3 < code2.length) {
            var v2 = code2[i3];
            i3 += 1;
            switch (v2) {
              case 1:
                parseStems();
                break;
              case 3:
                parseStems();
                break;
              case 4:
                if (stack.length > 1 && !haveWidth) {
                  width = stack.shift() + nominalWidthX;
                  haveWidth = true;
                }
                y += stack.pop();
                newContour(x4, y);
                break;
              case 5:
                while (stack.length > 0) {
                  x4 += stack.shift();
                  y += stack.shift();
                  p.lineTo(x4, y);
                }
                break;
              case 6:
                while (stack.length > 0) {
                  x4 += stack.shift();
                  p.lineTo(x4, y);
                  if (stack.length === 0) {
                    break;
                  }
                  y += stack.shift();
                  p.lineTo(x4, y);
                }
                break;
              case 7:
                while (stack.length > 0) {
                  y += stack.shift();
                  p.lineTo(x4, y);
                  if (stack.length === 0) {
                    break;
                  }
                  x4 += stack.shift();
                  p.lineTo(x4, y);
                }
                break;
              case 8:
                while (stack.length > 0) {
                  c1x = x4 + stack.shift();
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x + stack.shift();
                  y = c2y + stack.shift();
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                break;
              case 10:
                codeIndex = stack.pop() + subrsBias;
                subrCode = subrs[codeIndex];
                if (subrCode) {
                  parse2(subrCode);
                }
                break;
              case 11:
                return;
              case 12:
                v2 = code2[i3];
                i3 += 1;
                switch (v2) {
                  case 35:
                    c1x = x4 + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y + stack.shift();
                    c3x = jpx + stack.shift();
                    c3y = jpy + stack.shift();
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    x4 = c4x + stack.shift();
                    y = c4y + stack.shift();
                    stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    p.curveTo(c3x, c3y, c4x, c4y, x4, y);
                    break;
                  case 34:
                    c1x = x4 + stack.shift();
                    c1y = y;
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y;
                    c3x = jpx + stack.shift();
                    c3y = c2y;
                    c4x = c3x + stack.shift();
                    c4y = y;
                    x4 = c4x + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    p.curveTo(c3x, c3y, c4x, c4y, x4, y);
                    break;
                  case 36:
                    c1x = x4 + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y;
                    c3x = jpx + stack.shift();
                    c3y = c2y;
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    x4 = c4x + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    p.curveTo(c3x, c3y, c4x, c4y, x4, y);
                    break;
                  case 37:
                    c1x = x4 + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y + stack.shift();
                    c3x = jpx + stack.shift();
                    c3y = jpy + stack.shift();
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    if (Math.abs(c4x - x4) > Math.abs(c4y - y)) {
                      x4 = c4x + stack.shift();
                    } else {
                      y = c4y + stack.shift();
                    }
                    p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    p.curveTo(c3x, c3y, c4x, c4y, x4, y);
                    break;
                  default:
                    console.log(
                      "Glyph " + glyph.index + ": unknown operator 1200" + v2
                    );
                    stack.length = 0;
                }
                break;
              case 14:
                if (stack.length > 0 && !haveWidth) {
                  width = stack.shift() + nominalWidthX;
                  haveWidth = true;
                }
                if (open) {
                  p.closePath();
                  open = false;
                }
                break;
              case 18:
                parseStems();
                break;
              case 19:
              // hintmask
              case 20:
                parseStems();
                i3 += nStems + 7 >> 3;
                break;
              case 21:
                if (stack.length > 2 && !haveWidth) {
                  width = stack.shift() + nominalWidthX;
                  haveWidth = true;
                }
                y += stack.pop();
                x4 += stack.pop();
                newContour(x4, y);
                break;
              case 22:
                if (stack.length > 1 && !haveWidth) {
                  width = stack.shift() + nominalWidthX;
                  haveWidth = true;
                }
                x4 += stack.pop();
                newContour(x4, y);
                break;
              case 23:
                parseStems();
                break;
              case 24:
                while (stack.length > 2) {
                  c1x = x4 + stack.shift();
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x + stack.shift();
                  y = c2y + stack.shift();
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                x4 += stack.shift();
                y += stack.shift();
                p.lineTo(x4, y);
                break;
              case 25:
                while (stack.length > 6) {
                  x4 += stack.shift();
                  y += stack.shift();
                  p.lineTo(x4, y);
                }
                c1x = x4 + stack.shift();
                c1y = y + stack.shift();
                c2x = c1x + stack.shift();
                c2y = c1y + stack.shift();
                x4 = c2x + stack.shift();
                y = c2y + stack.shift();
                p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                break;
              case 26:
                if (stack.length % 2) {
                  x4 += stack.shift();
                }
                while (stack.length > 0) {
                  c1x = x4;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x;
                  y = c2y + stack.shift();
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                break;
              case 27:
                if (stack.length % 2) {
                  y += stack.shift();
                }
                while (stack.length > 0) {
                  c1x = x4 + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x + stack.shift();
                  y = c2y;
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                break;
              case 28:
                b1 = code2[i3];
                b2 = code2[i3 + 1];
                stack.push((b1 << 24 | b2 << 16) >> 16);
                i3 += 2;
                break;
              case 29:
                codeIndex = stack.pop() + font.gsubrsBias;
                subrCode = font.gsubrs[codeIndex];
                if (subrCode) {
                  parse2(subrCode);
                }
                break;
              case 30:
                while (stack.length > 0) {
                  c1x = x4;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x + stack.shift();
                  y = c2y + (stack.length === 1 ? stack.shift() : 0);
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                  if (stack.length === 0) {
                    break;
                  }
                  c1x = x4 + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  y = c2y + stack.shift();
                  x4 = c2x + (stack.length === 1 ? stack.shift() : 0);
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                break;
              case 31:
                while (stack.length > 0) {
                  c1x = x4 + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  y = c2y + stack.shift();
                  x4 = c2x + (stack.length === 1 ? stack.shift() : 0);
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                  if (stack.length === 0) {
                    break;
                  }
                  c1x = x4;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x4 = c2x + stack.shift();
                  y = c2y + (stack.length === 1 ? stack.shift() : 0);
                  p.curveTo(c1x, c1y, c2x, c2y, x4, y);
                }
                break;
              default:
                if (v2 < 32) {
                  console.log(
                    "Glyph " + glyph.index + ": unknown operator " + v2
                  );
                } else if (v2 < 247) {
                  stack.push(v2 - 139);
                } else if (v2 < 251) {
                  b1 = code2[i3];
                  i3 += 1;
                  stack.push((v2 - 247) * 256 + b1 + 108);
                } else if (v2 < 255) {
                  b1 = code2[i3];
                  i3 += 1;
                  stack.push(-(v2 - 251) * 256 - b1 - 108);
                } else {
                  b1 = code2[i3];
                  b2 = code2[i3 + 1];
                  b3 = code2[i3 + 2];
                  b4 = code2[i3 + 3];
                  i3 += 4;
                  stack.push(
                    (b1 << 24 | b2 << 16 | b3 << 8 | b4) / 65536
                  );
                }
            }
          }
        }
        parse2(code);
        glyph.advanceWidth = width;
        return p;
      }
      function parseCFFFDSelect(data, start, nGlyphs, fdArrayCount) {
        var fdSelect = [];
        var fdIndex;
        var parser = new parse.Parser(data, start);
        var format = parser.parseCard8();
        if (format === 0) {
          for (var iGid = 0; iGid < nGlyphs; iGid++) {
            fdIndex = parser.parseCard8();
            if (fdIndex >= fdArrayCount) {
              throw new Error(
                "CFF table CID Font FDSelect has bad FD index value " + fdIndex + " (FD count " + fdArrayCount + ")"
              );
            }
            fdSelect.push(fdIndex);
          }
        } else if (format === 3) {
          var nRanges = parser.parseCard16();
          var first = parser.parseCard16();
          if (first !== 0) {
            throw new Error(
              "CFF Table CID Font FDSelect format 3 range has bad initial GID " + first
            );
          }
          var next;
          for (var iRange = 0; iRange < nRanges; iRange++) {
            fdIndex = parser.parseCard8();
            next = parser.parseCard16();
            if (fdIndex >= fdArrayCount) {
              throw new Error(
                "CFF table CID Font FDSelect has bad FD index value " + fdIndex + " (FD count " + fdArrayCount + ")"
              );
            }
            if (next > nGlyphs) {
              throw new Error(
                "CFF Table CID Font FDSelect format 3 range has bad GID " + next
              );
            }
            for (; first < next; first++) {
              fdSelect.push(fdIndex);
            }
            first = next;
          }
          if (next !== nGlyphs) {
            throw new Error(
              "CFF Table CID Font FDSelect format 3 range has bad final GID " + next
            );
          }
        } else {
          throw new Error(
            "CFF Table CID Font FDSelect table has unsupported format " + format
          );
        }
        return fdSelect;
      }
      function parseCFFTable(data, start, font, opt) {
        font.tables.cff = {};
        var header = parseCFFHeader(data, start);
        var nameIndex = parseCFFIndex(
          data,
          header.endOffset,
          parse.bytesToString
        );
        var topDictIndex = parseCFFIndex(data, nameIndex.endOffset);
        var stringIndex = parseCFFIndex(
          data,
          topDictIndex.endOffset,
          parse.bytesToString
        );
        var globalSubrIndex = parseCFFIndex(data, stringIndex.endOffset);
        font.gsubrs = globalSubrIndex.objects;
        font.gsubrsBias = calcCFFSubroutineBias(font.gsubrs);
        var topDictArray = gatherCFFTopDicts(
          data,
          start,
          topDictIndex.objects,
          stringIndex.objects
        );
        if (topDictArray.length !== 1) {
          throw new Error(
            "CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = " + topDictArray.length
          );
        }
        var topDict = topDictArray[0];
        font.tables.cff.topDict = topDict;
        if (topDict._privateDict) {
          font.defaultWidthX = topDict._privateDict.defaultWidthX;
          font.nominalWidthX = topDict._privateDict.nominalWidthX;
        }
        if (topDict.ros[0] !== void 0 && topDict.ros[1] !== void 0) {
          font.isCIDFont = true;
        }
        if (font.isCIDFont) {
          var fdArrayOffset = topDict.fdArray;
          var fdSelectOffset = topDict.fdSelect;
          if (fdArrayOffset === 0 || fdSelectOffset === 0) {
            throw new Error(
              "Font is marked as a CID font, but FDArray and/or FDSelect information is missing"
            );
          }
          fdArrayOffset += start;
          var fdArrayIndex = parseCFFIndex(data, fdArrayOffset);
          var fdArray = gatherCFFTopDicts(
            data,
            start,
            fdArrayIndex.objects,
            stringIndex.objects
          );
          topDict._fdArray = fdArray;
          fdSelectOffset += start;
          topDict._fdSelect = parseCFFFDSelect(
            data,
            fdSelectOffset,
            font.numGlyphs,
            fdArray.length
          );
        }
        var privateDictOffset = start + topDict.private[1];
        var privateDict = parseCFFPrivateDict(
          data,
          privateDictOffset,
          topDict.private[0],
          stringIndex.objects
        );
        font.defaultWidthX = privateDict.defaultWidthX;
        font.nominalWidthX = privateDict.nominalWidthX;
        if (privateDict.subrs !== 0) {
          var subrOffset = privateDictOffset + privateDict.subrs;
          var subrIndex = parseCFFIndex(data, subrOffset);
          font.subrs = subrIndex.objects;
          font.subrsBias = calcCFFSubroutineBias(font.subrs);
        } else {
          font.subrs = [];
          font.subrsBias = 0;
        }
        var charStringsIndex;
        if (opt.lowMemory) {
          charStringsIndex = parseCFFIndexLowMemory(
            data,
            start + topDict.charStrings
          );
          font.nGlyphs = charStringsIndex.offsets.length;
        } else {
          charStringsIndex = parseCFFIndex(data, start + topDict.charStrings);
          font.nGlyphs = charStringsIndex.objects.length;
        }
        var charset = parseCFFCharset(
          data,
          start + topDict.charset,
          font.nGlyphs,
          stringIndex.objects
        );
        if (topDict.encoding === 0) {
          font.cffEncoding = new CffEncoding(cffStandardEncoding, charset);
        } else if (topDict.encoding === 1) {
          font.cffEncoding = new CffEncoding(cffExpertEncoding, charset);
        } else {
          font.cffEncoding = parseCFFEncoding(
            data,
            start + topDict.encoding,
            charset
          );
        }
        font.encoding = font.encoding || font.cffEncoding;
        font.glyphs = new glyphset.GlyphSet(font);
        if (opt.lowMemory) {
          font._push = function(i4) {
            var charString2 = getCffIndexObject(
              i4,
              charStringsIndex.offsets,
              data,
              start + topDict.charStrings
            );
            font.glyphs.push(
              i4,
              glyphset.cffGlyphLoader(font, i4, parseCFFCharstring, charString2)
            );
          };
        } else {
          for (var i3 = 0; i3 < font.nGlyphs; i3 += 1) {
            var charString = charStringsIndex.objects[i3];
            font.glyphs.push(
              i3,
              glyphset.cffGlyphLoader(font, i3, parseCFFCharstring, charString)
            );
          }
        }
      }
      var cff = { parse: parseCFFTable };
      function parseFvarAxis(data, start, names) {
        var axis = {};
        var p = new parse.Parser(data, start);
        axis.tag = p.parseTag();
        axis.minValue = p.parseFixed();
        axis.defaultValue = p.parseFixed();
        axis.maxValue = p.parseFixed();
        p.skip("uShort", 1);
        axis.name = names[p.parseUShort()] || {};
        return axis;
      }
      function parseFvarInstance(data, start, axes, names) {
        var inst = {};
        var p = new parse.Parser(data, start);
        inst.name = names[p.parseUShort()] || {};
        p.skip("uShort", 1);
        inst.coordinates = {};
        for (var i3 = 0; i3 < axes.length; ++i3) {
          inst.coordinates[axes[i3].tag] = p.parseFixed();
        }
        return inst;
      }
      function parseFvarTable(data, start, names) {
        var p = new parse.Parser(data, start);
        var tableVersion = p.parseULong();
        check.argument(
          tableVersion === 65536,
          "Unsupported fvar table version."
        );
        var offsetToData = p.parseOffset16();
        p.skip("uShort", 1);
        var axisCount = p.parseUShort();
        var axisSize = p.parseUShort();
        var instanceCount = p.parseUShort();
        var instanceSize = p.parseUShort();
        var axes = [];
        for (var i3 = 0; i3 < axisCount; i3++) {
          axes.push(
            parseFvarAxis(data, start + offsetToData + i3 * axisSize, names)
          );
        }
        var instances = [];
        var instanceStart = start + offsetToData + axisCount * axisSize;
        for (var j = 0; j < instanceCount; j++) {
          instances.push(
            parseFvarInstance(
              data,
              instanceStart + j * instanceSize,
              axes,
              names
            )
          );
        }
        return { axes, instances };
      }
      var fvar = { parse: parseFvarTable };
      var attachList = function() {
        return {
          coverage: this.parsePointer(Parser.coverage),
          attachPoints: this.parseList(Parser.pointer(Parser.uShortList))
        };
      };
      var caretValue = function() {
        var format = this.parseUShort();
        check.argument(
          format === 1 || format === 2 || format === 3,
          "Unsupported CaretValue table version."
        );
        if (format === 1) {
          return { coordinate: this.parseShort() };
        } else if (format === 2) {
          return { pointindex: this.parseShort() };
        } else if (format === 3) {
          return { coordinate: this.parseShort() };
        }
      };
      var ligGlyph = function() {
        return this.parseList(Parser.pointer(caretValue));
      };
      var ligCaretList = function() {
        return {
          coverage: this.parsePointer(Parser.coverage),
          ligGlyphs: this.parseList(Parser.pointer(ligGlyph))
        };
      };
      var markGlyphSets = function() {
        this.parseUShort();
        return this.parseList(Parser.pointer(Parser.coverage));
      };
      function parseGDEFTable(data, start) {
        start = start || 0;
        var p = new Parser(data, start);
        var tableVersion = p.parseVersion(1);
        check.argument(
          tableVersion === 1 || tableVersion === 1.2 || tableVersion === 1.3,
          "Unsupported GDEF table version."
        );
        var gdef2 = {
          version: tableVersion,
          classDef: p.parsePointer(Parser.classDef),
          attachList: p.parsePointer(attachList),
          ligCaretList: p.parsePointer(ligCaretList),
          markAttachClassDef: p.parsePointer(Parser.classDef)
        };
        if (tableVersion >= 1.2) {
          gdef2.markGlyphSets = p.parsePointer(markGlyphSets);
        }
        return gdef2;
      }
      var gdef = { parse: parseGDEFTable };
      var subtableParsers = new Array(10);
      subtableParsers[1] = function parseLookup1() {
        var start = this.offset + this.relativeOffset;
        var posformat = this.parseUShort();
        if (posformat === 1) {
          return {
            posFormat: 1,
            coverage: this.parsePointer(Parser.coverage),
            value: this.parseValueRecord()
          };
        } else if (posformat === 2) {
          return {
            posFormat: 2,
            coverage: this.parsePointer(Parser.coverage),
            values: this.parseValueRecordList()
          };
        }
        check.assert(
          false,
          "0x" + start.toString(16) + ": GPOS lookup type 1 format must be 1 or 2."
        );
      };
      subtableParsers[2] = function parseLookup2() {
        var start = this.offset + this.relativeOffset;
        var posFormat = this.parseUShort();
        check.assert(
          posFormat === 1 || posFormat === 2,
          "0x" + start.toString(16) + ": GPOS lookup type 2 format must be 1 or 2."
        );
        var coverage = this.parsePointer(Parser.coverage);
        var valueFormat1 = this.parseUShort();
        var valueFormat2 = this.parseUShort();
        if (posFormat === 1) {
          return {
            posFormat,
            coverage,
            valueFormat1,
            valueFormat2,
            pairSets: this.parseList(
              Parser.pointer(
                Parser.list(function() {
                  return {
                    // pairValueRecord
                    secondGlyph: this.parseUShort(),
                    value1: this.parseValueRecord(valueFormat1),
                    value2: this.parseValueRecord(valueFormat2)
                  };
                })
              )
            )
          };
        } else if (posFormat === 2) {
          var classDef1 = this.parsePointer(Parser.classDef);
          var classDef2 = this.parsePointer(Parser.classDef);
          var class1Count = this.parseUShort();
          var class2Count = this.parseUShort();
          return {
            // Class Pair Adjustment
            posFormat,
            coverage,
            valueFormat1,
            valueFormat2,
            classDef1,
            classDef2,
            class1Count,
            class2Count,
            classRecords: this.parseList(
              class1Count,
              Parser.list(class2Count, function() {
                return {
                  value1: this.parseValueRecord(valueFormat1),
                  value2: this.parseValueRecord(valueFormat2)
                };
              })
            )
          };
        }
      };
      subtableParsers[3] = function parseLookup3() {
        return { error: "GPOS Lookup 3 not supported" };
      };
      subtableParsers[4] = function parseLookup4() {
        return { error: "GPOS Lookup 4 not supported" };
      };
      subtableParsers[5] = function parseLookup5() {
        return { error: "GPOS Lookup 5 not supported" };
      };
      subtableParsers[6] = function parseLookup6() {
        return { error: "GPOS Lookup 6 not supported" };
      };
      subtableParsers[7] = function parseLookup7() {
        return { error: "GPOS Lookup 7 not supported" };
      };
      subtableParsers[8] = function parseLookup8() {
        return { error: "GPOS Lookup 8 not supported" };
      };
      subtableParsers[9] = function parseLookup9() {
        return { error: "GPOS Lookup 9 not supported" };
      };
      function parseGposTable(data, start) {
        start = start || 0;
        var p = new Parser(data, start);
        var tableVersion = p.parseVersion(1);
        check.argument(
          tableVersion === 1 || tableVersion === 1.1,
          "Unsupported GPOS table version " + tableVersion
        );
        if (tableVersion === 1) {
          return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers)
          };
        } else {
          return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers),
            variations: p.parseFeatureVariationsList()
          };
        }
      }
      var gpos = { parse: parseGposTable };
      var subtableParsers$1 = new Array(9);
      subtableParsers$1[1] = function parseLookup1() {
        var start = this.offset + this.relativeOffset;
        var substFormat = this.parseUShort();
        if (substFormat === 1) {
          return {
            substFormat: 1,
            coverage: this.parsePointer(Parser.coverage),
            deltaGlyphId: this.parseUShort()
          };
        } else if (substFormat === 2) {
          return {
            substFormat: 2,
            coverage: this.parsePointer(Parser.coverage),
            substitute: this.parseOffset16List()
          };
        }
        check.assert(
          false,
          "0x" + start.toString(16) + ": lookup type 1 format must be 1 or 2."
        );
      };
      subtableParsers$1[2] = function parseLookup2() {
        var substFormat = this.parseUShort();
        check.argument(
          substFormat === 1,
          "GSUB Multiple Substitution Subtable identifier-format must be 1"
        );
        return {
          substFormat,
          coverage: this.parsePointer(Parser.coverage),
          sequences: this.parseListOfLists()
        };
      };
      subtableParsers$1[3] = function parseLookup3() {
        var substFormat = this.parseUShort();
        check.argument(
          substFormat === 1,
          "GSUB Alternate Substitution Subtable identifier-format must be 1"
        );
        return {
          substFormat,
          coverage: this.parsePointer(Parser.coverage),
          alternateSets: this.parseListOfLists()
        };
      };
      subtableParsers$1[4] = function parseLookup4() {
        var substFormat = this.parseUShort();
        check.argument(
          substFormat === 1,
          "GSUB ligature table identifier-format must be 1"
        );
        return {
          substFormat,
          coverage: this.parsePointer(Parser.coverage),
          ligatureSets: this.parseListOfLists(function() {
            return {
              ligGlyph: this.parseUShort(),
              components: this.parseUShortList(this.parseUShort() - 1)
            };
          })
        };
      };
      var lookupRecordDesc = {
        sequenceIndex: Parser.uShort,
        lookupListIndex: Parser.uShort
      };
      subtableParsers$1[5] = function parseLookup5() {
        var start = this.offset + this.relativeOffset;
        var substFormat = this.parseUShort();
        if (substFormat === 1) {
          return {
            substFormat,
            coverage: this.parsePointer(Parser.coverage),
            ruleSets: this.parseListOfLists(function() {
              var glyphCount2 = this.parseUShort();
              var substCount2 = this.parseUShort();
              return {
                input: this.parseUShortList(glyphCount2 - 1),
                lookupRecords: this.parseRecordList(
                  substCount2,
                  lookupRecordDesc
                )
              };
            })
          };
        } else if (substFormat === 2) {
          return {
            substFormat,
            coverage: this.parsePointer(Parser.coverage),
            classDef: this.parsePointer(Parser.classDef),
            classSets: this.parseListOfLists(function() {
              var glyphCount2 = this.parseUShort();
              var substCount2 = this.parseUShort();
              return {
                classes: this.parseUShortList(glyphCount2 - 1),
                lookupRecords: this.parseRecordList(
                  substCount2,
                  lookupRecordDesc
                )
              };
            })
          };
        } else if (substFormat === 3) {
          var glyphCount = this.parseUShort();
          var substCount = this.parseUShort();
          return {
            substFormat,
            coverages: this.parseList(
              glyphCount,
              Parser.pointer(Parser.coverage)
            ),
            lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
          };
        }
        check.assert(
          false,
          "0x" + start.toString(16) + ": lookup type 5 format must be 1, 2 or 3."
        );
      };
      subtableParsers$1[6] = function parseLookup6() {
        var start = this.offset + this.relativeOffset;
        var substFormat = this.parseUShort();
        if (substFormat === 1) {
          return {
            substFormat: 1,
            coverage: this.parsePointer(Parser.coverage),
            chainRuleSets: this.parseListOfLists(function() {
              return {
                backtrack: this.parseUShortList(),
                input: this.parseUShortList(this.parseShort() - 1),
                lookahead: this.parseUShortList(),
                lookupRecords: this.parseRecordList(lookupRecordDesc)
              };
            })
          };
        } else if (substFormat === 2) {
          return {
            substFormat: 2,
            coverage: this.parsePointer(Parser.coverage),
            backtrackClassDef: this.parsePointer(Parser.classDef),
            inputClassDef: this.parsePointer(Parser.classDef),
            lookaheadClassDef: this.parsePointer(Parser.classDef),
            chainClassSet: this.parseListOfLists(function() {
              return {
                backtrack: this.parseUShortList(),
                input: this.parseUShortList(this.parseShort() - 1),
                lookahead: this.parseUShortList(),
                lookupRecords: this.parseRecordList(lookupRecordDesc)
              };
            })
          };
        } else if (substFormat === 3) {
          return {
            substFormat: 3,
            backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            inputCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            lookupRecords: this.parseRecordList(lookupRecordDesc)
          };
        }
        check.assert(
          false,
          "0x" + start.toString(16) + ": lookup type 6 format must be 1, 2 or 3."
        );
      };
      subtableParsers$1[7] = function parseLookup7() {
        var substFormat = this.parseUShort();
        check.argument(
          substFormat === 1,
          "GSUB Extension Substitution subtable identifier-format must be 1"
        );
        var extensionLookupType = this.parseUShort();
        var extensionParser = new Parser(
          this.data,
          this.offset + this.parseULong()
        );
        return {
          substFormat: 1,
          lookupType: extensionLookupType,
          extension: subtableParsers$1[extensionLookupType].call(extensionParser)
        };
      };
      subtableParsers$1[8] = function parseLookup8() {
        var substFormat = this.parseUShort();
        check.argument(
          substFormat === 1,
          "GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1"
        );
        return {
          substFormat,
          coverage: this.parsePointer(Parser.coverage),
          backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
          lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
          substitutes: this.parseUShortList()
        };
      };
      function parseGsubTable(data, start) {
        start = start || 0;
        var p = new Parser(data, start);
        var tableVersion = p.parseVersion(1);
        check.argument(
          tableVersion === 1 || tableVersion === 1.1,
          "Unsupported GSUB table version."
        );
        if (tableVersion === 1) {
          return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers$1)
          };
        } else {
          return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers$1),
            variations: p.parseFeatureVariationsList()
          };
        }
      }
      var gsub = { parse: parseGsubTable };
      function parseHeadTable(data, start) {
        var head2 = {};
        var p = new parse.Parser(data, start);
        head2.version = p.parseVersion();
        head2.fontRevision = Math.round(p.parseFixed() * 1e3) / 1e3;
        head2.checkSumAdjustment = p.parseULong();
        head2.magicNumber = p.parseULong();
        check.argument(
          head2.magicNumber === 1594834165,
          "Font header has wrong magic number."
        );
        head2.flags = p.parseUShort();
        head2.unitsPerEm = p.parseUShort();
        head2.created = p.parseLongDateTime();
        head2.modified = p.parseLongDateTime();
        head2.xMin = p.parseShort();
        head2.yMin = p.parseShort();
        head2.xMax = p.parseShort();
        head2.yMax = p.parseShort();
        head2.macStyle = p.parseUShort();
        head2.lowestRecPPEM = p.parseUShort();
        head2.fontDirectionHint = p.parseShort();
        head2.indexToLocFormat = p.parseShort();
        head2.glyphDataFormat = p.parseShort();
        return head2;
      }
      var head = { parse: parseHeadTable };
      function parseHheaTable(data, start) {
        var hhea2 = {};
        var p = new parse.Parser(data, start);
        hhea2.version = p.parseVersion();
        hhea2.ascender = p.parseShort();
        hhea2.descender = p.parseShort();
        hhea2.lineGap = p.parseShort();
        hhea2.advanceWidthMax = p.parseUShort();
        hhea2.minLeftSideBearing = p.parseShort();
        hhea2.minRightSideBearing = p.parseShort();
        hhea2.xMaxExtent = p.parseShort();
        hhea2.caretSlopeRise = p.parseShort();
        hhea2.caretSlopeRun = p.parseShort();
        hhea2.caretOffset = p.parseShort();
        p.relativeOffset += 8;
        hhea2.metricDataFormat = p.parseShort();
        hhea2.numberOfHMetrics = p.parseUShort();
        return hhea2;
      }
      var hhea = { parse: parseHheaTable };
      function parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs) {
        var advanceWidth;
        var leftSideBearing;
        var p = new parse.Parser(data, start);
        for (var i3 = 0; i3 < numGlyphs; i3 += 1) {
          if (i3 < numMetrics) {
            advanceWidth = p.parseUShort();
            leftSideBearing = p.parseShort();
          }
          var glyph = glyphs.get(i3);
          glyph.advanceWidth = advanceWidth;
          glyph.leftSideBearing = leftSideBearing;
        }
      }
      function parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs) {
        font._hmtxTableData = {};
        var advanceWidth;
        var leftSideBearing;
        var p = new parse.Parser(data, start);
        for (var i3 = 0; i3 < numGlyphs; i3 += 1) {
          if (i3 < numMetrics) {
            advanceWidth = p.parseUShort();
            leftSideBearing = p.parseShort();
          }
          font._hmtxTableData[i3] = {
            advanceWidth,
            leftSideBearing
          };
        }
      }
      function parseHmtxTable(font, data, start, numMetrics, numGlyphs, glyphs, opt) {
        if (opt.lowMemory) {
          parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs);
        } else {
          parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs);
        }
      }
      var hmtx = { parse: parseHmtxTable };
      function parseWindowsKernTable(p) {
        var pairs = {};
        p.skip("uShort");
        var subtableVersion = p.parseUShort();
        check.argument(subtableVersion === 0, "Unsupported kern sub-table version.");
        p.skip("uShort", 2);
        var nPairs = p.parseUShort();
        p.skip("uShort", 3);
        for (var i3 = 0; i3 < nPairs; i3 += 1) {
          var leftIndex = p.parseUShort();
          var rightIndex = p.parseUShort();
          var value = p.parseShort();
          pairs[leftIndex + "," + rightIndex] = value;
        }
        return pairs;
      }
      function parseMacKernTable(p) {
        var pairs = {};
        p.skip("uShort");
        var nTables = p.parseULong();
        if (nTables > 1) {
          console.warn("Only the first kern subtable is supported.");
        }
        p.skip("uLong");
        var coverage = p.parseUShort();
        var subtableVersion = coverage & 255;
        p.skip("uShort");
        if (subtableVersion === 0) {
          var nPairs = p.parseUShort();
          p.skip("uShort", 3);
          for (var i3 = 0; i3 < nPairs; i3 += 1) {
            var leftIndex = p.parseUShort();
            var rightIndex = p.parseUShort();
            var value = p.parseShort();
            pairs[leftIndex + "," + rightIndex] = value;
          }
        }
        return pairs;
      }
      function parseKernTable(data, start) {
        var p = new parse.Parser(data, start);
        var tableVersion = p.parseUShort();
        if (tableVersion === 0) {
          return parseWindowsKernTable(p);
        } else if (tableVersion === 1) {
          return parseMacKernTable(p);
        } else {
          throw new Error("Unsupported kern table version (" + tableVersion + ").");
        }
      }
      var kern = { parse: parseKernTable };
      function parseLtagTable(data, start) {
        var p = new parse.Parser(data, start);
        var tableVersion = p.parseULong();
        check.argument(tableVersion === 1, "Unsupported ltag table version.");
        p.skip("uLong", 1);
        var numTags = p.parseULong();
        var tags = [];
        for (var i3 = 0; i3 < numTags; i3++) {
          var tag = "";
          var offset = start + p.parseUShort();
          var length = p.parseUShort();
          for (var j = offset; j < offset + length; ++j) {
            tag += String.fromCharCode(data.getInt8(j));
          }
          tags.push(tag);
        }
        return tags;
      }
      var ltag = { parse: parseLtagTable };
      function parseLocaTable(data, start, numGlyphs, shortVersion) {
        var p = new parse.Parser(data, start);
        var parseFn = shortVersion ? p.parseUShort : p.parseULong;
        var glyphOffsets = [];
        for (var i3 = 0; i3 < numGlyphs + 1; i3 += 1) {
          var glyphOffset = parseFn.call(p);
          if (shortVersion) {
            glyphOffset *= 2;
          }
          glyphOffsets.push(glyphOffset);
        }
        return glyphOffsets;
      }
      var loca = { parse: parseLocaTable };
      function parseMaxpTable(data, start) {
        var maxp2 = {};
        var p = new parse.Parser(data, start);
        maxp2.version = p.parseVersion();
        maxp2.numGlyphs = p.parseUShort();
        if (maxp2.version === 1) {
          maxp2.maxPoints = p.parseUShort();
          maxp2.maxContours = p.parseUShort();
          maxp2.maxCompositePoints = p.parseUShort();
          maxp2.maxCompositeContours = p.parseUShort();
          maxp2.maxZones = p.parseUShort();
          maxp2.maxTwilightPoints = p.parseUShort();
          maxp2.maxStorage = p.parseUShort();
          maxp2.maxFunctionDefs = p.parseUShort();
          maxp2.maxInstructionDefs = p.parseUShort();
          maxp2.maxStackElements = p.parseUShort();
          maxp2.maxSizeOfInstructions = p.parseUShort();
          maxp2.maxComponentElements = p.parseUShort();
          maxp2.maxComponentDepth = p.parseUShort();
        }
        return maxp2;
      }
      var maxp = { parse: parseMaxpTable };
      function parseOS2Table(data, start) {
        var os22 = {};
        var p = new parse.Parser(data, start);
        os22.version = p.parseUShort();
        os22.xAvgCharWidth = p.parseShort();
        os22.usWeightClass = p.parseUShort();
        os22.usWidthClass = p.parseUShort();
        os22.fsType = p.parseUShort();
        os22.ySubscriptXSize = p.parseShort();
        os22.ySubscriptYSize = p.parseShort();
        os22.ySubscriptXOffset = p.parseShort();
        os22.ySubscriptYOffset = p.parseShort();
        os22.ySuperscriptXSize = p.parseShort();
        os22.ySuperscriptYSize = p.parseShort();
        os22.ySuperscriptXOffset = p.parseShort();
        os22.ySuperscriptYOffset = p.parseShort();
        os22.yStrikeoutSize = p.parseShort();
        os22.yStrikeoutPosition = p.parseShort();
        os22.sFamilyClass = p.parseShort();
        os22.panose = [];
        for (var i3 = 0; i3 < 10; i3++) {
          os22.panose[i3] = p.parseByte();
        }
        os22.ulUnicodeRange1 = p.parseULong();
        os22.ulUnicodeRange2 = p.parseULong();
        os22.ulUnicodeRange3 = p.parseULong();
        os22.ulUnicodeRange4 = p.parseULong();
        os22.achVendID = String.fromCharCode(
          p.parseByte(),
          p.parseByte(),
          p.parseByte(),
          p.parseByte()
        );
        os22.fsSelection = p.parseUShort();
        os22.usFirstCharIndex = p.parseUShort();
        os22.usLastCharIndex = p.parseUShort();
        os22.sTypoAscender = p.parseShort();
        os22.sTypoDescender = p.parseShort();
        os22.sTypoLineGap = p.parseShort();
        os22.usWinAscent = p.parseUShort();
        os22.usWinDescent = p.parseUShort();
        if (os22.version >= 1) {
          os22.ulCodePageRange1 = p.parseULong();
          os22.ulCodePageRange2 = p.parseULong();
        }
        if (os22.version >= 2) {
          os22.sxHeight = p.parseShort();
          os22.sCapHeight = p.parseShort();
          os22.usDefaultChar = p.parseUShort();
          os22.usBreakChar = p.parseUShort();
          os22.usMaxContent = p.parseUShort();
        }
        return os22;
      }
      var os2 = { parse: parseOS2Table };
      function parsePostTable(data, start) {
        var post2 = {};
        var p = new parse.Parser(data, start);
        post2.version = p.parseVersion();
        post2.italicAngle = p.parseFixed();
        post2.underlinePosition = p.parseShort();
        post2.underlineThickness = p.parseShort();
        post2.isFixedPitch = p.parseULong();
        post2.minMemType42 = p.parseULong();
        post2.maxMemType42 = p.parseULong();
        post2.minMemType1 = p.parseULong();
        post2.maxMemType1 = p.parseULong();
        post2.names = [];
        switch (post2.version) {
          case 1:
            break;
          case 2:
            post2.numberOfGlyphs = p.parseUShort();
            post2.glyphNameIndex = new Array(post2.numberOfGlyphs);
            for (var i3 = 0; i3 < post2.numberOfGlyphs; i3++) {
              post2.glyphNameIndex[i3] = p.parseUShort();
            }
            break;
          case 2.5:
            post2.numberOfGlyphs = p.parseUShort();
            post2.offset = new Array(post2.numberOfGlyphs);
            for (var i$1 = 0; i$1 < post2.numberOfGlyphs; i$1++) {
              post2.offset[i$1] = p.parseChar();
            }
            break;
        }
        return post2;
      }
      var post = { parse: parsePostTable };
      var decode = {};
      decode.UTF8 = function(data, offset, numBytes) {
        var codePoints = [];
        var numChars = numBytes;
        for (var j = 0; j < numChars; j++, offset += 1) {
          codePoints[j] = data.getUint8(offset);
        }
        return String.fromCharCode.apply(null, codePoints);
      };
      decode.UTF16 = function(data, offset, numBytes) {
        var codePoints = [];
        var numChars = numBytes / 2;
        for (var j = 0; j < numChars; j++, offset += 2) {
          codePoints[j] = data.getUint16(offset);
        }
        return String.fromCharCode.apply(null, codePoints);
      };
      var eightBitMacEncodings = {
        "x-mac-croatian": (
          // Python: 'mac_croatian'
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\u2020\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\u0160\u2122\xB4\xA8\u2260\u017D\xD8\u221E\xB1\u2264\u2265\u2206\xB5\u2202\u2211\u220F\u0161\u222B\xAA\xBA\u03A9\u017E\xF8\xBF\xA1\xAC\u221A\u0192\u2248\u0106\xAB\u010C\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u0110\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\uF8FF\xA9\u2044\u20AC\u2039\u203A\xC6\xBB\u2013\xB7\u201A\u201E\u2030\xC2\u0107\xC1\u010D\xC8\xCD\xCE\xCF\xCC\xD3\xD4\u0111\xD2\xDA\xDB\xD9\u0131\u02C6\u02DC\xAF\u03C0\xCB\u02DA\xB8\xCA\xE6\u02C7"
        ),
        "x-mac-cyrillic": (
          // Python: 'mac_cyrillic'
          "\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F\u2020\xB0\u0490\xA3\xA7\u2022\xB6\u0406\xAE\xA9\u2122\u0402\u0452\u2260\u0403\u0453\u221E\xB1\u2264\u2265\u0456\xB5\u0491\u0408\u0404\u0454\u0407\u0457\u0409\u0459\u040A\u045A\u0458\u0405\xAC\u221A\u0192\u2248\u2206\xAB\xBB\u2026\xA0\u040B\u045B\u040C\u045C\u0455\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u201E\u040E\u045E\u040F\u045F\u2116\u0401\u0451\u044F\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044A\u044B\u044C\u044D\u044E"
        ),
        "x-mac-gaelic": (
          // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/GAELIC.TXT
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\u2020\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\xB4\xA8\u2260\xC6\xD8\u1E02\xB1\u2264\u2265\u1E03\u010A\u010B\u1E0A\u1E0B\u1E1E\u1E1F\u0120\u0121\u1E40\xE6\xF8\u1E41\u1E56\u1E57\u027C\u0192\u017F\u1E60\xAB\xBB\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u2013\u2014\u201C\u201D\u2018\u2019\u1E61\u1E9B\xFF\u0178\u1E6A\u20AC\u2039\u203A\u0176\u0177\u1E6B\xB7\u1EF2\u1EF3\u204A\xC2\xCA\xC1\xCB\xC8\xCD\xCE\xCF\xCC\xD3\xD4\u2663\xD2\xDA\xDB\xD9\u0131\xDD\xFD\u0174\u0175\u1E84\u1E85\u1E80\u1E81\u1E82\u1E83"
        ),
        "x-mac-greek": (
          // Python: 'mac_greek'
          "\xC4\xB9\xB2\xC9\xB3\xD6\xDC\u0385\xE0\xE2\xE4\u0384\xA8\xE7\xE9\xE8\xEA\xEB\xA3\u2122\xEE\xEF\u2022\xBD\u2030\xF4\xF6\xA6\u20AC\xF9\xFB\xFC\u2020\u0393\u0394\u0398\u039B\u039E\u03A0\xDF\xAE\xA9\u03A3\u03AA\xA7\u2260\xB0\xB7\u0391\xB1\u2264\u2265\xA5\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u03A6\u03AB\u03A8\u03A9\u03AC\u039D\xAC\u039F\u03A1\u2248\u03A4\xAB\xBB\u2026\xA0\u03A5\u03A7\u0386\u0388\u0153\u2013\u2015\u201C\u201D\u2018\u2019\xF7\u0389\u038A\u038C\u038E\u03AD\u03AE\u03AF\u03CC\u038F\u03CD\u03B1\u03B2\u03C8\u03B4\u03B5\u03C6\u03B3\u03B7\u03B9\u03BE\u03BA\u03BB\u03BC\u03BD\u03BF\u03C0\u03CE\u03C1\u03C3\u03C4\u03B8\u03C9\u03C2\u03C7\u03C5\u03B6\u03CA\u03CB\u0390\u03B0\xAD"
        ),
        "x-mac-icelandic": (
          // Python: 'mac_iceland'
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\xDD\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\xB4\xA8\u2260\xC6\xD8\u221E\xB1\u2264\u2265\xA5\xB5\u2202\u2211\u220F\u03C0\u222B\xAA\xBA\u03A9\xE6\xF8\xBF\xA1\xAC\u221A\u0192\u2248\u2206\xAB\xBB\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\xFF\u0178\u2044\u20AC\xD0\xF0\xDE\xFE\xFD\xB7\u201A\u201E\u2030\xC2\xCA\xC1\xCB\xC8\xCD\xCE\xCF\xCC\xD3\xD4\uF8FF\xD2\xDA\xDB\xD9\u0131\u02C6\u02DC\xAF\u02D8\u02D9\u02DA\xB8\u02DD\u02DB\u02C7"
        ),
        "x-mac-inuit": (
          // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/INUIT.TXT
          "\u1403\u1404\u1405\u1406\u140A\u140B\u1431\u1432\u1433\u1434\u1438\u1439\u1449\u144E\u144F\u1450\u1451\u1455\u1456\u1466\u146D\u146E\u146F\u1470\u1472\u1473\u1483\u148B\u148C\u148D\u148E\u1490\u1491\xB0\u14A1\u14A5\u14A6\u2022\xB6\u14A7\xAE\xA9\u2122\u14A8\u14AA\u14AB\u14BB\u14C2\u14C3\u14C4\u14C5\u14C7\u14C8\u14D0\u14EF\u14F0\u14F1\u14F2\u14F4\u14F5\u1505\u14D5\u14D6\u14D7\u14D8\u14DA\u14DB\u14EA\u1528\u1529\u152A\u152B\u152D\u2026\xA0\u152E\u153E\u1555\u1556\u1557\u2013\u2014\u201C\u201D\u2018\u2019\u1558\u1559\u155A\u155D\u1546\u1547\u1548\u1549\u154B\u154C\u1550\u157F\u1580\u1581\u1582\u1583\u1584\u1585\u158F\u1590\u1591\u1592\u1593\u1594\u1595\u1671\u1672\u1673\u1674\u1675\u1676\u1596\u15A0\u15A1\u15A2\u15A3\u15A4\u15A5\u15A6\u157C\u0141\u0142"
        ),
        "x-mac-ce": (
          // Python: 'mac_latin2'
          "\xC4\u0100\u0101\xC9\u0104\xD6\xDC\xE1\u0105\u010C\xE4\u010D\u0106\u0107\xE9\u0179\u017A\u010E\xED\u010F\u0112\u0113\u0116\xF3\u0117\xF4\xF6\xF5\xFA\u011A\u011B\xFC\u2020\xB0\u0118\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\u0119\xA8\u2260\u0123\u012E\u012F\u012A\u2264\u2265\u012B\u0136\u2202\u2211\u0142\u013B\u013C\u013D\u013E\u0139\u013A\u0145\u0146\u0143\xAC\u221A\u0144\u0147\u2206\xAB\xBB\u2026\xA0\u0148\u0150\xD5\u0151\u014C\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\u014D\u0154\u0155\u0158\u2039\u203A\u0159\u0156\u0157\u0160\u201A\u201E\u0161\u015A\u015B\xC1\u0164\u0165\xCD\u017D\u017E\u016A\xD3\xD4\u016B\u016E\xDA\u016F\u0170\u0171\u0172\u0173\xDD\xFD\u0137\u017B\u0141\u017C\u0122\u02C7"
        ),
        macintosh: (
          // Python: 'mac_roman'
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\u2020\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\xB4\xA8\u2260\xC6\xD8\u221E\xB1\u2264\u2265\xA5\xB5\u2202\u2211\u220F\u03C0\u222B\xAA\xBA\u03A9\xE6\xF8\xBF\xA1\xAC\u221A\u0192\u2248\u2206\xAB\xBB\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\xFF\u0178\u2044\u20AC\u2039\u203A\uFB01\uFB02\u2021\xB7\u201A\u201E\u2030\xC2\xCA\xC1\xCB\xC8\xCD\xCE\xCF\xCC\xD3\xD4\uF8FF\xD2\xDA\xDB\xD9\u0131\u02C6\u02DC\xAF\u02D8\u02D9\u02DA\xB8\u02DD\u02DB\u02C7"
        ),
        "x-mac-romanian": (
          // Python: 'mac_romanian'
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\u2020\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\xB4\xA8\u2260\u0102\u0218\u221E\xB1\u2264\u2265\xA5\xB5\u2202\u2211\u220F\u03C0\u222B\xAA\xBA\u03A9\u0103\u0219\xBF\xA1\xAC\u221A\u0192\u2248\u2206\xAB\xBB\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\xFF\u0178\u2044\u20AC\u2039\u203A\u021A\u021B\u2021\xB7\u201A\u201E\u2030\xC2\xCA\xC1\xCB\xC8\xCD\xCE\xCF\xCC\xD3\xD4\uF8FF\xD2\xDA\xDB\xD9\u0131\u02C6\u02DC\xAF\u02D8\u02D9\u02DA\xB8\u02DD\u02DB\u02C7"
        ),
        "x-mac-turkish": (
          // Python: 'mac_turkish'
          "\xC4\xC5\xC7\xC9\xD1\xD6\xDC\xE1\xE0\xE2\xE4\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\u2020\xB0\xA2\xA3\xA7\u2022\xB6\xDF\xAE\xA9\u2122\xB4\xA8\u2260\xC6\xD8\u221E\xB1\u2264\u2265\xA5\xB5\u2202\u2211\u220F\u03C0\u222B\xAA\xBA\u03A9\xE6\xF8\xBF\xA1\xAC\u221A\u0192\u2248\u2206\xAB\xBB\u2026\xA0\xC0\xC3\xD5\u0152\u0153\u2013\u2014\u201C\u201D\u2018\u2019\xF7\u25CA\xFF\u0178\u011E\u011F\u0130\u0131\u015E\u015F\u2021\xB7\u201A\u201E\u2030\xC2\xCA\xC1\xCB\xC8\xCD\xCE\xCF\xCC\xD3\xD4\uF8FF\xD2\xDA\xDB\xD9\uF8A0\u02C6\u02DC\xAF\u02D8\u02D9\u02DA\xB8\u02DD\u02DB\u02C7"
        )
      };
      decode.MACSTRING = function(dataView, offset, dataLength, encoding) {
        var table = eightBitMacEncodings[encoding];
        if (table === void 0) {
          return void 0;
        }
        var result = "";
        for (var i3 = 0; i3 < dataLength; i3++) {
          var c2 = dataView.getUint8(offset + i3);
          if (c2 <= 127) {
            result += String.fromCharCode(c2);
          } else {
            result += table[c2 & 127];
          }
        }
        return result;
      };
      function parseMetaTable(data, start) {
        var p = new parse.Parser(data, start);
        var tableVersion = p.parseULong();
        check.argument(tableVersion === 1, "Unsupported META table version.");
        p.parseULong();
        p.parseULong();
        var numDataMaps = p.parseULong();
        var tags = {};
        for (var i3 = 0; i3 < numDataMaps; i3++) {
          var tag = p.parseTag();
          var dataOffset = p.parseULong();
          var dataLength = p.parseULong();
          var text = decode.UTF8(data, start + dataOffset, dataLength);
          tags[tag] = text;
        }
        return tags;
      }
      var meta = { parse: parseMetaTable };
      function parseOpenTypeTableEntries(data, numTables) {
        var tableEntries = [];
        var p = 12;
        for (var i3 = 0; i3 < numTables; i3 += 1) {
          var tag = parse.getTag(data, p);
          var checksum = parse.getULong(data, p + 4);
          var offset = parse.getULong(data, p + 8);
          var length = parse.getULong(data, p + 12);
          tableEntries.push({
            tag,
            checksum,
            offset,
            length,
            compression: false
          });
          p += 16;
        }
        return tableEntries;
      }
      function parseWOFFTableEntries(data, numTables) {
        var tableEntries = [];
        var p = 44;
        for (var i3 = 0; i3 < numTables; i3 += 1) {
          var tag = parse.getTag(data, p);
          var offset = parse.getULong(data, p + 4);
          var compLength = parse.getULong(data, p + 8);
          var origLength = parse.getULong(data, p + 12);
          var compression = void 0;
          if (compLength < origLength) {
            compression = "WOFF";
          } else {
            compression = false;
          }
          tableEntries.push({
            tag,
            offset,
            compression,
            compressedLength: compLength,
            length: origLength
          });
          p += 20;
        }
        return tableEntries;
      }
      function uncompressTable(data, tableEntry) {
        if (tableEntry.compression === "WOFF") {
          var inBuffer = new Uint8Array(
            data.buffer,
            tableEntry.offset + 2,
            tableEntry.compressedLength - 2
          );
          var outBuffer = new Uint8Array(tableEntry.length);
          inflateSync2(inBuffer, outBuffer);
          if (outBuffer.byteLength !== tableEntry.length) {
            throw new Error(
              "Decompression error: " + tableEntry.tag + " decompressed length doesn't match recorded length"
            );
          }
          var view = new DataView(outBuffer.buffer, 0);
          return { data: view, offset: 0 };
        } else {
          return { data, offset: tableEntry.offset };
        }
      }
      function parseBuffer(buffer, opt) {
        opt = opt === void 0 || opt === null ? {} : opt;
        var indexToLocFormat;
        var font = new Font({ empty: true });
        var data = new DataView(buffer, 0);
        var numTables;
        var tableEntries = [];
        var signature = parse.getTag(data, 0);
        if (signature === String.fromCharCode(0, 1, 0, 0) || signature === "true" || signature === "typ1") {
          font.outlinesFormat = "truetype";
          numTables = parse.getUShort(data, 4);
          tableEntries = parseOpenTypeTableEntries(data, numTables);
        } else if (signature === "OTTO") {
          font.outlinesFormat = "cff";
          numTables = parse.getUShort(data, 4);
          tableEntries = parseOpenTypeTableEntries(data, numTables);
        } else if (signature === "wOFF") {
          var flavor = parse.getTag(data, 4);
          if (flavor === String.fromCharCode(0, 1, 0, 0)) {
            font.outlinesFormat = "truetype";
          } else if (flavor === "OTTO") {
            font.outlinesFormat = "cff";
          } else {
            throw new Error("Unsupported OpenType flavor " + signature);
          }
          numTables = parse.getUShort(data, 12);
          tableEntries = parseWOFFTableEntries(data, numTables);
        } else {
          throw new Error("Unsupported OpenType signature " + signature);
        }
        var cffTableEntry;
        var fvarTableEntry;
        var glyfTableEntry;
        var gdefTableEntry;
        var gposTableEntry;
        var gsubTableEntry;
        var hmtxTableEntry;
        var kernTableEntry;
        var locaTableEntry;
        var metaTableEntry;
        var p;
        for (var i3 = 0; i3 < numTables; i3 += 1) {
          var tableEntry = tableEntries[i3];
          var table = void 0;
          switch (tableEntry.tag) {
            case "cmap":
              table = uncompressTable(data, tableEntry);
              font.tables.cmap = cmap.parse(table.data, table.offset);
              font.encoding = new CmapEncoding(font.tables.cmap);
              break;
            case "cvt ":
              table = uncompressTable(data, tableEntry);
              p = new parse.Parser(table.data, table.offset);
              font.tables.cvt = p.parseShortList(tableEntry.length / 2);
              break;
            case "fvar":
              fvarTableEntry = tableEntry;
              break;
            case "fpgm":
              table = uncompressTable(data, tableEntry);
              p = new parse.Parser(table.data, table.offset);
              font.tables.fpgm = p.parseByteList(tableEntry.length);
              break;
            case "head":
              table = uncompressTable(data, tableEntry);
              font.tables.head = head.parse(table.data, table.offset);
              font.unitsPerEm = font.tables.head.unitsPerEm;
              indexToLocFormat = font.tables.head.indexToLocFormat;
              break;
            case "hhea":
              table = uncompressTable(data, tableEntry);
              font.tables.hhea = hhea.parse(table.data, table.offset);
              font.ascender = font.tables.hhea.ascender;
              font.descender = font.tables.hhea.descender;
              font.numberOfHMetrics = font.tables.hhea.numberOfHMetrics;
              break;
            case "hmtx":
              hmtxTableEntry = tableEntry;
              break;
            case "ltag":
              table = uncompressTable(data, tableEntry);
              ltagTable = ltag.parse(table.data, table.offset);
              break;
            case "maxp":
              table = uncompressTable(data, tableEntry);
              font.tables.maxp = maxp.parse(table.data, table.offset);
              font.numGlyphs = font.tables.maxp.numGlyphs;
              break;
            case "OS/2":
              table = uncompressTable(data, tableEntry);
              font.tables.os2 = os2.parse(table.data, table.offset);
              break;
            case "post":
              table = uncompressTable(data, tableEntry);
              font.tables.post = post.parse(table.data, table.offset);
              break;
            case "prep":
              table = uncompressTable(data, tableEntry);
              p = new parse.Parser(table.data, table.offset);
              font.tables.prep = p.parseByteList(tableEntry.length);
              break;
            case "glyf":
              glyfTableEntry = tableEntry;
              break;
            case "loca":
              locaTableEntry = tableEntry;
              break;
            case "CFF ":
              cffTableEntry = tableEntry;
              break;
            case "kern":
              kernTableEntry = tableEntry;
              break;
            case "GDEF":
              gdefTableEntry = tableEntry;
              break;
            case "GPOS":
              gposTableEntry = tableEntry;
              break;
            case "GSUB":
              gsubTableEntry = tableEntry;
              break;
            case "meta":
              metaTableEntry = tableEntry;
              break;
          }
        }
        if (glyfTableEntry && locaTableEntry) {
          var shortVersion = indexToLocFormat === 0;
          var locaTable = uncompressTable(data, locaTableEntry);
          var locaOffsets = loca.parse(
            locaTable.data,
            locaTable.offset,
            font.numGlyphs,
            shortVersion
          );
          var glyfTable = uncompressTable(data, glyfTableEntry);
          font.glyphs = glyf.parse(
            glyfTable.data,
            glyfTable.offset,
            locaOffsets,
            font,
            opt
          );
        } else if (cffTableEntry) {
          var cffTable = uncompressTable(data, cffTableEntry);
          cff.parse(cffTable.data, cffTable.offset, font, opt);
        } else {
          throw new Error("Font doesn't contain TrueType or CFF outlines.");
        }
        var hmtxTable = uncompressTable(data, hmtxTableEntry);
        hmtx.parse(
          font,
          hmtxTable.data,
          hmtxTable.offset,
          font.numberOfHMetrics,
          font.numGlyphs,
          font.glyphs,
          opt
        );
        addGlyphNames(font, opt);
        if (kernTableEntry) {
          var kernTable = uncompressTable(data, kernTableEntry);
          font.kerningPairs = kern.parse(kernTable.data, kernTable.offset);
        } else {
          font.kerningPairs = {};
        }
        if (gdefTableEntry) {
          var gdefTable = uncompressTable(data, gdefTableEntry);
          font.tables.gdef = gdef.parse(gdefTable.data, gdefTable.offset);
        }
        if (gposTableEntry) {
          var gposTable = uncompressTable(data, gposTableEntry);
          font.tables.gpos = gpos.parse(gposTable.data, gposTable.offset);
          font.position.init();
        }
        if (gsubTableEntry) {
          var gsubTable = uncompressTable(data, gsubTableEntry);
          font.tables.gsub = gsub.parse(gsubTable.data, gsubTable.offset);
        }
        if (fvarTableEntry) {
          var fvarTable = uncompressTable(data, fvarTableEntry);
          font.tables.fvar = fvar.parse(
            fvarTable.data,
            fvarTable.offset,
            font.names
          );
        }
        if (metaTableEntry) {
          var metaTable = uncompressTable(data, metaTableEntry);
          font.tables.meta = meta.parse(metaTable.data, metaTable.offset);
          font.metas = font.tables.meta;
        }
        return font;
      }
      function load() {
      }
      function loadSync() {
      }
      var opentype = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        Font,
        Glyph,
        Path,
        _parse: parse,
        parse: parseBuffer,
        load,
        loadSync
      });
      exports2.Font = Font;
      exports2.Glyph = Glyph;
      exports2.Path = Path;
      exports2._parse = parse;
      exports2.default = opentype;
      exports2.load = load;
      exports2.loadSync = loadSync;
      exports2.parse = parseBuffer;
      Object.defineProperty(exports2, "__esModule", { value: true });
    }));
  }
});

// packages/api/dist/services/carousel-render.js
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// node_modules/satori/dist/index.js
var import_escape_html = __toESM(require_escape_html(), 1);

// node_modules/linebreak/dist/module.mjs
var import_unicode_trie = __toESM(require_unicode_trie(), 1);
var import_base64_js = __toESM(require_b64(), 1);
var $557adaaeb0c7885f$exports = {};
var $1627905f8be2ef3f$export$fb4028874a74450 = 5;
var $1627905f8be2ef3f$export$1bb1140fe1358b00 = 12;
var $1627905f8be2ef3f$export$f3e416a182673355 = 13;
var $1627905f8be2ef3f$export$24aa617c849a894a = 16;
var $1627905f8be2ef3f$export$a73c4d14459b698d = 17;
var $1627905f8be2ef3f$export$9e5d732f3676a9ba = 22;
var $1627905f8be2ef3f$export$1dff41d5c0caca01 = 28;
var $1627905f8be2ef3f$export$30a74a373318dec6 = 31;
var $1627905f8be2ef3f$export$d710c5f50fc7496a = 33;
var $1627905f8be2ef3f$export$66498d28055820a9 = 34;
var $1627905f8be2ef3f$export$eb6c6d0b7c8826f2 = 35;
var $1627905f8be2ef3f$export$de92be486109a1df = 36;
var $1627905f8be2ef3f$export$606cfc2a8896c91f = 37;
var $1627905f8be2ef3f$export$e51d3c675bb0140d = 38;
var $1627905f8be2ef3f$export$da51c6332ad11d7b = 39;
var $1627905f8be2ef3f$export$bea437c40441867d = 40;
var $1627905f8be2ef3f$export$c4c7eecbfed13dc9 = 41;
var $1627905f8be2ef3f$export$98e1f8a379849661 = 42;
var $32627af916ac1b00$export$98f50d781a474745 = 0;
var $32627af916ac1b00$export$12ee1f8f5315ca7e = 1;
var $32627af916ac1b00$export$e4965ce242860454 = 2;
var $32627af916ac1b00$export$8f14048969dcd45e = 3;
var $32627af916ac1b00$export$133eb141bf58aff4 = 4;
var $32627af916ac1b00$export$5bdb8ccbf5c57afc = [
  //OP   , CL    , CP    , QU    , GL    , NS    , EX    , SY    , IS    , PR    , PO    , NU    , AL    , HL    , ID    , IN    , HY    , BA    , BB    , B2    , ZW    , CM    , WJ    , H2    , H3    , JL    , JV    , JT    , RI    , EB    , EM    , ZWJ   , CB
  [
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$8f14048969dcd45e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ],
  [
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$e4965ce242860454,
    $32627af916ac1b00$export$133eb141bf58aff4,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$98f50d781a474745,
    $32627af916ac1b00$export$12ee1f8f5315ca7e,
    $32627af916ac1b00$export$98f50d781a474745
  ]
  // CB
];
var $557adaaeb0c7885f$var$data = import_base64_js.default.toByteArray("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");
var $557adaaeb0c7885f$var$classTrie = new import_unicode_trie.default($557adaaeb0c7885f$var$data);
var $557adaaeb0c7885f$var$mapClass = function(c2) {
  switch (c2) {
    case $1627905f8be2ef3f$export$d710c5f50fc7496a:
      return $1627905f8be2ef3f$export$1bb1140fe1358b00;
    case $1627905f8be2ef3f$export$da51c6332ad11d7b:
    case $1627905f8be2ef3f$export$bea437c40441867d:
    case $1627905f8be2ef3f$export$98e1f8a379849661:
      return $1627905f8be2ef3f$export$1bb1140fe1358b00;
    case $1627905f8be2ef3f$export$eb6c6d0b7c8826f2:
      return $1627905f8be2ef3f$export$fb4028874a74450;
    default:
      return c2;
  }
};
var $557adaaeb0c7885f$var$mapFirst = function(c2) {
  switch (c2) {
    case $1627905f8be2ef3f$export$606cfc2a8896c91f:
    case $1627905f8be2ef3f$export$e51d3c675bb0140d:
      return $1627905f8be2ef3f$export$66498d28055820a9;
    case $1627905f8be2ef3f$export$c4c7eecbfed13dc9:
      return $1627905f8be2ef3f$export$9e5d732f3676a9ba;
    default:
      return c2;
  }
};
var $557adaaeb0c7885f$var$Break = class {
  constructor(position, required = false) {
    this.position = position;
    this.required = required;
  }
};
var $557adaaeb0c7885f$var$LineBreaker = class {
  nextCodePoint() {
    const code = this.string.charCodeAt(this.pos++);
    const next = this.string.charCodeAt(this.pos);
    if (55296 <= code && code <= 56319 && 56320 <= next && next <= 57343) {
      this.pos++;
      return (code - 55296) * 1024 + (next - 56320) + 65536;
    }
    return code;
  }
  nextCharClass() {
    return $557adaaeb0c7885f$var$mapClass($557adaaeb0c7885f$var$classTrie.get(this.nextCodePoint()));
  }
  getSimpleBreak() {
    switch (this.nextClass) {
      case $1627905f8be2ef3f$export$c4c7eecbfed13dc9:
        return false;
      case $1627905f8be2ef3f$export$66498d28055820a9:
      case $1627905f8be2ef3f$export$606cfc2a8896c91f:
      case $1627905f8be2ef3f$export$e51d3c675bb0140d:
        this.curClass = $1627905f8be2ef3f$export$66498d28055820a9;
        return false;
      case $1627905f8be2ef3f$export$de92be486109a1df:
        this.curClass = $1627905f8be2ef3f$export$de92be486109a1df;
        return false;
    }
    return null;
  }
  getPairTableBreak(lastClass) {
    let shouldBreak = false;
    switch ($32627af916ac1b00$export$5bdb8ccbf5c57afc[this.curClass][this.nextClass]) {
      case $32627af916ac1b00$export$98f50d781a474745:
        shouldBreak = true;
        break;
      case $32627af916ac1b00$export$12ee1f8f5315ca7e:
        shouldBreak = lastClass === $1627905f8be2ef3f$export$c4c7eecbfed13dc9;
        break;
      case $32627af916ac1b00$export$e4965ce242860454:
        shouldBreak = lastClass === $1627905f8be2ef3f$export$c4c7eecbfed13dc9;
        if (!shouldBreak) {
          shouldBreak = false;
          return shouldBreak;
        }
        break;
      case $32627af916ac1b00$export$8f14048969dcd45e:
        if (lastClass !== $1627905f8be2ef3f$export$c4c7eecbfed13dc9) return shouldBreak;
        break;
      case $32627af916ac1b00$export$133eb141bf58aff4:
        break;
    }
    if (this.LB8a) shouldBreak = false;
    if (this.LB21a && (this.curClass === $1627905f8be2ef3f$export$24aa617c849a894a || this.curClass === $1627905f8be2ef3f$export$a73c4d14459b698d)) {
      shouldBreak = false;
      this.LB21a = false;
    } else this.LB21a = this.curClass === $1627905f8be2ef3f$export$f3e416a182673355;
    if (this.curClass === $1627905f8be2ef3f$export$1dff41d5c0caca01) {
      this.LB30a++;
      if (this.LB30a == 2 && this.nextClass === $1627905f8be2ef3f$export$1dff41d5c0caca01) {
        shouldBreak = true;
        this.LB30a = 0;
      }
    } else this.LB30a = 0;
    this.curClass = this.nextClass;
    return shouldBreak;
  }
  nextBreak() {
    if (this.curClass == null) {
      let firstClass = this.nextCharClass();
      this.curClass = $557adaaeb0c7885f$var$mapFirst(firstClass);
      this.nextClass = firstClass;
      this.LB8a = firstClass === $1627905f8be2ef3f$export$30a74a373318dec6;
      this.LB30a = 0;
    }
    while (this.pos < this.string.length) {
      this.lastPos = this.pos;
      const lastClass = this.nextClass;
      this.nextClass = this.nextCharClass();
      if (this.curClass === $1627905f8be2ef3f$export$66498d28055820a9 || this.curClass === $1627905f8be2ef3f$export$de92be486109a1df && this.nextClass !== $1627905f8be2ef3f$export$606cfc2a8896c91f) {
        this.curClass = $557adaaeb0c7885f$var$mapFirst($557adaaeb0c7885f$var$mapClass(this.nextClass));
        return new $557adaaeb0c7885f$var$Break(this.lastPos, true);
      }
      let shouldBreak = this.getSimpleBreak();
      if (shouldBreak === null) shouldBreak = this.getPairTableBreak(lastClass);
      this.LB8a = this.nextClass === $1627905f8be2ef3f$export$30a74a373318dec6;
      if (shouldBreak) return new $557adaaeb0c7885f$var$Break(this.lastPos);
    }
    if (this.lastPos < this.string.length) {
      this.lastPos = this.string.length;
      return new $557adaaeb0c7885f$var$Break(this.string.length);
    }
    return null;
  }
  constructor(string) {
    this.string = string;
    this.pos = 0;
    this.lastPos = 0;
    this.curClass = null;
    this.nextClass = null;
    this.LB8a = false;
    this.LB21a = false;
    this.LB30a = 0;
  }
};
$557adaaeb0c7885f$exports = $557adaaeb0c7885f$var$LineBreaker;

// node_modules/satori/dist/index.js
var import_css_to_react_native = __toESM(require_css_to_react_native(), 1);
var import_css_background_parser = __toESM(require_css_background_parser(), 1);
var import_css_box_shadow = __toESM(require_css_box_shadow(), 1);
var import_parse_css_color = __toESM(require_index_cjs(), 1);
var import_postcss_value_parser = __toESM(require_lib(), 1);
var import_css_to_react_native2 = __toESM(require_css_to_react_native(), 1);
var import_parse_css_color2 = __toESM(require_index_cjs(), 1);
var import_postcss_value_parser2 = __toESM(require_lib(), 1);
var import_postcss_value_parser3 = __toESM(require_lib(), 1);
var import_escape_html2 = __toESM(require_escape_html(), 1);
var import_parse_css_color3 = __toESM(require_index_cjs(), 1);

// node_modules/css-gradient-parser/dist/index.js
function c(e, o = ",") {
  let t = [], n = 0, i2 = 0;
  o = new RegExp(o);
  for (let r = 0; r < e.length; r++) e[r] === "(" ? i2++ : e[r] === ")" && i2--, i2 === 0 && o.test(e[r]) && (t.push(e.slice(n, r).trim()), n = r + 1);
  return t.push(e.slice(n).trim()), t;
}
function g(e) {
  let o = [];
  for (let t = 0, n = e.length; t < n; ) {
    let [i2, r] = c(e[t], /\s+/);
    m(e[t + 1]) ? (o.push({ color: i2, offset: l(r), hint: l(e[t + 1]) }), t += 2) : (o.push({ color: i2, offset: l(r) }), t++);
  }
  return o;
}
var u = /^(-?\d+\.?\d*)(%|vw|vh|px|em|rem|deg|rad|grad|turn|ch|vmin|vmax)?$/;
function m(e) {
  return u.test(e);
}
function l(e) {
  if (!e) return;
  let [, o, t] = e.trim().match(u) || [];
  return { value: o, unit: t ?? "px" };
}
function P(e) {
  if (!/^(repeating-)?linear-gradient/.test(e)) throw new SyntaxError(`could not find syntax for this item: ${e}`);
  let [, o, t] = e.match(/(repeating-)?linear-gradient\((.+)\)/), n = { orientation: { type: "directional", value: "bottom" }, repeating: !!o, stops: [] }, i2 = c(t), r = x(i2[0]);
  return r && (n.orientation = r, i2.shift()), { ...n, stops: g(i2) };
}
function x(e) {
  return e.startsWith("to ") ? { type: "directional", value: e.replace("to ", "") } : ["turn", "deg", "grad", "rad"].some((o) => e.endsWith(o)) ? { type: "angular", value: l(e) } : null;
}
var v = /* @__PURE__ */ new Set(["closest-corner", "closest-side", "farthest-corner", "farthest-side"]);
var w = /* @__PURE__ */ new Set(["center", "left", "top", "right", "bottom"]);
function d(e) {
  return v.has(e);
}
function h(e) {
  return w.has(e);
}
function R(e) {
  let o = Array(2).fill("");
  for (let t = 0; t < 2; t++) e[t] ? o[t] = e[t] : o[t] = "center";
  return o;
}
function K(e) {
  if (!/(repeating-)?radial-gradient/.test(e)) throw new SyntaxError(`could not find syntax for this item: ${e}`);
  let [, o, t] = e.match(/(repeating-)?radial-gradient\((.+)\)/), n = { shape: "ellipse", repeating: !!o, size: [{ type: "keyword", value: "farthest-corner" }], position: { x: { type: "keyword", value: "center" }, y: { type: "keyword", value: "center" } }, stops: [] }, i2 = c(t);
  if (S(i2[0])) return { ...n, stops: g(i2) };
  let r = i2[0].split("at").map((f) => f.trim()), p = ((r[0] || "").match(/(circle|ellipse)/) || [])[1], a = (r[0] || "").match(/(-?\d+\.?\d*(vw|vh|px|em|rem|%|rad|grad|turn|deg)?|closest-corner|closest-side|farthest-corner|farthest-side)/g) || [], s = R((r[1] || "").split(" "));
  return p ? n.shape = p : a.length === 1 && !d(a[0]) ? n.shape = "circle" : n.shape = "ellipse", a.length === 0 && a.push("farthest-corner"), n.size = a.map((f) => d(f) ? { type: "keyword", value: f } : { type: "length", value: l(f) }), n.position.x = h(s[0]) ? { type: "keyword", value: s[0] } : { type: "length", value: l(s[0]) }, n.position.y = h(s[1]) ? { type: "keyword", value: s[1] } : { type: "length", value: l(s[1]) }, (p || a.length > 0 || r[1]) && i2.shift(), { ...n, stops: g(i2) };
}
function S(e) {
  return /(circle|ellipse|at)/.test(e) ? false : /^(rgba?|hwb|hsl|lab|lch|oklab|color|#|[a-zA-Z]+)/.test(e);
}

// node_modules/satori/dist/index.js
var import_parse_css_color4 = __toESM(require_index_cjs(), 1);
var import_parse_css_color5 = __toESM(require_index_cjs(), 1);
var import_css_to_react_native3 = __toESM(require_css_to_react_native(), 1);
var import_opentype = __toESM(require_opentype(), 1);

// node_modules/satori/node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var Worker;
try {
  Worker = require2("worker_threads").Worker;
} catch (e) {
}
var u8 = Uint8Array;
var u16 = Uint16Array;
var u32 = Uint32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new u32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r[j] = j - b[i2] << 5 | i2;
    }
  }
  return [b, r];
};
var _a = freb(fleb, 2);
var fl = _a[0];
var revfl = _a[1];
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b[0];
var revfd = _b[1];
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x2 = (i & 43690) >>> 1 | (i & 21845) << 1;
  x2 = (x2 & 52428) >>> 2 | (x2 & 13107) << 2;
  x2 = (x2 & 61680) >>> 4 | (x2 & 3855) << 4;
  rev[i] = ((x2 & 65280) >>> 8 | (x2 & 255) << 8) >>> 1;
}
var x2;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l2 = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l2[cd[i2] - 1];
  }
  var le = new u16(mb);
  for (i2 = 0; i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l2[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v2 = le[cd[i2] - 1]++ << r_1;
        for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
          co[rev[v2] >>> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le[cd[i2] - 1]++] >>> 15 - cd[i2];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m2 = a[0];
  for (var i2 = 1; i2 < a.length; ++i2) {
    if (a[i2] > m2)
      m2 = a[i2];
  }
  return m2;
};
var bits = function(d2, p, m2) {
  var o = p / 8 | 0;
  return (d2[o] | d2[o + 1] << 8) >> (p & 7) & m2;
};
var bits16 = function(d2, p) {
  var o = p / 8 | 0;
  return (d2[o] | d2[o + 1] << 8 | d2[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v2, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v2.length)
    e = v2.length;
  var n = new (v2.BYTES_PER_ELEMENT == 2 ? u16 : v2.BYTES_PER_ELEMENT == 4 ? u32 : u8)(e - s);
  n.set(v2.subarray(s, e));
  return n;
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, buf, st) {
  var sl2 = dat.length;
  if (!sl2 || st && st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf || st;
  var noSt = !st || st.i;
  if (!st)
    st = {};
  if (!buf)
    buf = new u8(sl2 * 3);
  var cbuf = function(l3) {
    var bl2 = buf.length;
    if (l3 > bl2) {
      var nbuf = new u8(Math.max(bl2 * 2, l3));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl2 * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l2 = dat[s - 4] | dat[s - 3] << 8, t = s + l2;
        if (t > sl2) {
          if (noSt)
            err(0);
          break;
        }
        if (noBuf)
          cbuf(bt + l2);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l2, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl2 = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl2);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl2; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >>> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c2 = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c2 = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c2;
          }
        }
        var lt2 = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt2);
        dbt = max(dt);
        lm = hMap(lt2, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (noBuf)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c2 = lm[bits16(dat, pos) & lms], sym = c2 >>> 4;
      pos += c2 & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c2)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d2 = dm[bits16(dat, pos) & dms], dsym = d2 >>> 4;
        if (!d2)
          err(3);
        pos += d2 & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (noBuf)
          cbuf(bt + 131072);
        var end = bt + add;
        for (; bt < end; bt += 4) {
          buf[bt] = buf[bt - dt];
          buf[bt + 1] = buf[bt + 1 - dt];
          buf[bt + 2] = buf[bt + 2 - dt];
          buf[bt + 3] = buf[bt + 3 - dt];
        }
        bt = end;
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt == buf.length ? buf : slc(buf, 0, bt);
};
var et = /* @__PURE__ */ new u8(0);
function inflateSync(data, out) {
  return inflt(data, out);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}

// node_modules/satori/dist/index.js
import df from "harfbuzzjs";
var Cl = Object.create;
var Zr = Object.defineProperty;
var dl = Object.getOwnPropertyDescriptor;
var pl = Object.getOwnPropertyNames;
var hl = Object.getPrototypeOf;
var ml = Object.prototype.hasOwnProperty;
var It = (A, e) => () => (A && (e = A(A = 0)), e);
var W = (A, e) => () => (e || A((e = { exports: {} }).exports, e), e.exports);
var jr = (A, e) => {
  for (var t in e) Zr(A, t, { get: e[t], enumerable: true });
};
var Ps = (A, e, t, r) => {
  if (e && typeof e == "object" || typeof e == "function") for (let n of pl(e)) !ml.call(A, n) && n !== t && Zr(A, n, { get: () => e[n], enumerable: !(r = dl(e, n)) || r.enumerable });
  return A;
};
var yl = (A, e, t) => (t = A != null ? Cl(hl(A)) : {}, Ps(e || !A || !A.__esModule ? Zr(t, "default", { value: A, enumerable: true }) : t, A));
var $r = (A) => Ps(Zr({}, "__esModule", { value: true }), A);
var Je;
var sa;
var aa;
var jt;
var ii;
var Ke;
var vt;
var Tl;
var tn;
var oi;
var Rt;
var Ft;
var si;
var ga;
var ai;
var gi;
var be;
var ui;
var Pl;
var ua;
var rn = It(() => {
  Je = (function(A) {
    return A[A.Auto = 0] = "Auto", A[A.FlexStart = 1] = "FlexStart", A[A.Center = 2] = "Center", A[A.FlexEnd = 3] = "FlexEnd", A[A.Stretch = 4] = "Stretch", A[A.Baseline = 5] = "Baseline", A[A.SpaceBetween = 6] = "SpaceBetween", A[A.SpaceAround = 7] = "SpaceAround", A[A.SpaceEvenly = 8] = "SpaceEvenly", A;
  })({}), sa = (function(A) {
    return A[A.BorderBox = 0] = "BorderBox", A[A.ContentBox = 1] = "ContentBox", A;
  })({}), aa = (function(A) {
    return A[A.Width = 0] = "Width", A[A.Height = 1] = "Height", A;
  })({}), jt = (function(A) {
    return A[A.Inherit = 0] = "Inherit", A[A.LTR = 1] = "LTR", A[A.RTL = 2] = "RTL", A;
  })({}), ii = (function(A) {
    return A[A.Flex = 0] = "Flex", A[A.None = 1] = "None", A[A.Contents = 2] = "Contents", A;
  })({}), Ke = (function(A) {
    return A[A.Left = 0] = "Left", A[A.Top = 1] = "Top", A[A.Right = 2] = "Right", A[A.Bottom = 3] = "Bottom", A[A.Start = 4] = "Start", A[A.End = 5] = "End", A[A.Horizontal = 6] = "Horizontal", A[A.Vertical = 7] = "Vertical", A[A.All = 8] = "All", A;
  })({}), vt = (function(A) {
    return A[A.None = 0] = "None", A[A.StretchFlexBasis = 1] = "StretchFlexBasis", A[A.AbsolutePositionWithoutInsetsExcludesPadding = 2] = "AbsolutePositionWithoutInsetsExcludesPadding", A[A.AbsolutePercentAgainstInnerSize = 4] = "AbsolutePercentAgainstInnerSize", A[A.All = 2147483647] = "All", A[A.Classic = 2147483646] = "Classic", A;
  })({}), Tl = (function(A) {
    return A[A.WebFlexBasis = 0] = "WebFlexBasis", A;
  })({}), tn = (function(A) {
    return A[A.Column = 0] = "Column", A[A.ColumnReverse = 1] = "ColumnReverse", A[A.Row = 2] = "Row", A[A.RowReverse = 3] = "RowReverse", A;
  })({}), oi = (function(A) {
    return A[A.Column = 0] = "Column", A[A.Row = 1] = "Row", A[A.All = 2] = "All", A;
  })({}), Rt = (function(A) {
    return A[A.FlexStart = 0] = "FlexStart", A[A.Center = 1] = "Center", A[A.FlexEnd = 2] = "FlexEnd", A[A.SpaceBetween = 3] = "SpaceBetween", A[A.SpaceAround = 4] = "SpaceAround", A[A.SpaceEvenly = 5] = "SpaceEvenly", A;
  })({}), Ft = (function(A) {
    return A[A.Error = 0] = "Error", A[A.Warn = 1] = "Warn", A[A.Info = 2] = "Info", A[A.Debug = 3] = "Debug", A[A.Verbose = 4] = "Verbose", A[A.Fatal = 5] = "Fatal", A;
  })({}), si = (function(A) {
    return A[A.Undefined = 0] = "Undefined", A[A.Exactly = 1] = "Exactly", A[A.AtMost = 2] = "AtMost", A;
  })({}), ga = (function(A) {
    return A[A.Default = 0] = "Default", A[A.Text = 1] = "Text", A;
  })({}), ai = (function(A) {
    return A[A.Visible = 0] = "Visible", A[A.Hidden = 1] = "Hidden", A[A.Scroll = 2] = "Scroll", A;
  })({}), gi = (function(A) {
    return A[A.Static = 0] = "Static", A[A.Relative = 1] = "Relative", A[A.Absolute = 2] = "Absolute", A;
  })({}), be = (function(A) {
    return A[A.Undefined = 0] = "Undefined", A[A.Point = 1] = "Point", A[A.Percent = 2] = "Percent", A[A.Auto = 3] = "Auto", A;
  })({}), ui = (function(A) {
    return A[A.NoWrap = 0] = "NoWrap", A[A.Wrap = 1] = "Wrap", A[A.WrapReverse = 2] = "WrapReverse", A;
  })({}), Pl = { ALIGN_AUTO: Je.Auto, ALIGN_FLEX_START: Je.FlexStart, ALIGN_CENTER: Je.Center, ALIGN_FLEX_END: Je.FlexEnd, ALIGN_STRETCH: Je.Stretch, ALIGN_BASELINE: Je.Baseline, ALIGN_SPACE_BETWEEN: Je.SpaceBetween, ALIGN_SPACE_AROUND: Je.SpaceAround, ALIGN_SPACE_EVENLY: Je.SpaceEvenly, BOX_SIZING_BORDER_BOX: sa.BorderBox, BOX_SIZING_CONTENT_BOX: sa.ContentBox, DIMENSION_WIDTH: aa.Width, DIMENSION_HEIGHT: aa.Height, DIRECTION_INHERIT: jt.Inherit, DIRECTION_LTR: jt.LTR, DIRECTION_RTL: jt.RTL, DISPLAY_FLEX: ii.Flex, DISPLAY_NONE: ii.None, DISPLAY_CONTENTS: ii.Contents, EDGE_LEFT: Ke.Left, EDGE_TOP: Ke.Top, EDGE_RIGHT: Ke.Right, EDGE_BOTTOM: Ke.Bottom, EDGE_START: Ke.Start, EDGE_END: Ke.End, EDGE_HORIZONTAL: Ke.Horizontal, EDGE_VERTICAL: Ke.Vertical, EDGE_ALL: Ke.All, ERRATA_NONE: vt.None, ERRATA_STRETCH_FLEX_BASIS: vt.StretchFlexBasis, ERRATA_ABSOLUTE_POSITION_WITHOUT_INSETS_EXCLUDES_PADDING: vt.AbsolutePositionWithoutInsetsExcludesPadding, ERRATA_ABSOLUTE_PERCENT_AGAINST_INNER_SIZE: vt.AbsolutePercentAgainstInnerSize, ERRATA_ALL: vt.All, ERRATA_CLASSIC: vt.Classic, EXPERIMENTAL_FEATURE_WEB_FLEX_BASIS: Tl.WebFlexBasis, FLEX_DIRECTION_COLUMN: tn.Column, FLEX_DIRECTION_COLUMN_REVERSE: tn.ColumnReverse, FLEX_DIRECTION_ROW: tn.Row, FLEX_DIRECTION_ROW_REVERSE: tn.RowReverse, GUTTER_COLUMN: oi.Column, GUTTER_ROW: oi.Row, GUTTER_ALL: oi.All, JUSTIFY_FLEX_START: Rt.FlexStart, JUSTIFY_CENTER: Rt.Center, JUSTIFY_FLEX_END: Rt.FlexEnd, JUSTIFY_SPACE_BETWEEN: Rt.SpaceBetween, JUSTIFY_SPACE_AROUND: Rt.SpaceAround, JUSTIFY_SPACE_EVENLY: Rt.SpaceEvenly, LOG_LEVEL_ERROR: Ft.Error, LOG_LEVEL_WARN: Ft.Warn, LOG_LEVEL_INFO: Ft.Info, LOG_LEVEL_DEBUG: Ft.Debug, LOG_LEVEL_VERBOSE: Ft.Verbose, LOG_LEVEL_FATAL: Ft.Fatal, MEASURE_MODE_UNDEFINED: si.Undefined, MEASURE_MODE_EXACTLY: si.Exactly, MEASURE_MODE_AT_MOST: si.AtMost, NODE_TYPE_DEFAULT: ga.Default, NODE_TYPE_TEXT: ga.Text, OVERFLOW_VISIBLE: ai.Visible, OVERFLOW_HIDDEN: ai.Hidden, OVERFLOW_SCROLL: ai.Scroll, POSITION_TYPE_STATIC: gi.Static, POSITION_TYPE_RELATIVE: gi.Relative, POSITION_TYPE_ABSOLUTE: gi.Absolute, UNIT_UNDEFINED: be.Undefined, UNIT_POINT: be.Point, UNIT_PERCENT: be.Percent, UNIT_AUTO: be.Auto, WRAP_NO_WRAP: ui.NoWrap, WRAP_WRAP: ui.Wrap, WRAP_WRAP_REVERSE: ui.WrapReverse }, ua = Pl;
});
function Ii(A) {
  function e(n, i2, o) {
    let s = n[i2];
    n[i2] = function() {
      for (var a = arguments.length, g2 = new Array(a), u2 = 0; u2 < a; u2++) g2[u2] = arguments[u2];
      return o.call(this, s, ...g2);
    };
  }
  for (let n of ["setPosition", "setMargin", "setFlexBasis", "setWidth", "setHeight", "setMinWidth", "setMinHeight", "setMaxWidth", "setMaxHeight", "setPadding", "setGap"]) {
    let i2 = { [be.Point]: A.Node.prototype[n], [be.Percent]: A.Node.prototype[`${n}Percent`], [be.Auto]: A.Node.prototype[`${n}Auto`] };
    e(A.Node.prototype, n, function(o) {
      for (var s = arguments.length, a = new Array(s > 1 ? s - 1 : 0), g2 = 1; g2 < s; g2++) a[g2 - 1] = arguments[g2];
      let u2 = a.pop(), I, B;
      if (u2 === "auto") I = be.Auto, B = void 0;
      else if (typeof u2 == "object") I = u2.unit, B = u2.valueOf();
      else if (I = typeof u2 == "string" && u2.endsWith("%") ? be.Percent : be.Point, B = parseFloat(u2), u2 !== void 0 && !Number.isNaN(u2) && Number.isNaN(B)) throw new Error(`Invalid value ${u2} for ${n}`);
      if (!i2[I]) throw new Error(`Failed to execute "${n}": Unsupported unit '${u2}'`);
      return B !== void 0 ? i2[I].call(this, ...a, B) : i2[I].call(this, ...a);
    });
  }
  function t(n) {
    return A.MeasureCallback.implement({ measure: function() {
      let { width: i2, height: o } = n(...arguments);
      return { width: i2 ?? NaN, height: o ?? NaN };
    } });
  }
  e(A.Node.prototype, "setMeasureFunc", function(n, i2) {
    return i2 ? n.call(this, t(i2)) : this.unsetMeasureFunc();
  });
  function r(n) {
    return A.DirtiedCallback.implement({ dirtied: n });
  }
  return e(A.Node.prototype, "setDirtiedFunc", function(n, i2) {
    n.call(this, r(i2));
  }), e(A.Config.prototype, "free", function() {
    A.Config.destroy(this);
  }), e(A.Node, "create", (n, i2) => i2 ? A.Node.createWithConfig(i2) : A.Node.createDefault()), e(A.Node.prototype, "free", function() {
    A.Node.destroy(this);
  }), e(A.Node.prototype, "freeRecursive", function() {
    for (let n = 0, i2 = this.getChildCount(); n < i2; ++n) this.getChild(0).freeRecursive();
    this.free();
  }), e(A.Node.prototype, "calculateLayout", function(n) {
    let i2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : NaN, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : NaN, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : jt.LTR;
    return n.call(this, i2, o, s);
  }), { Config: A.Config, Node: A.Node, ...ua };
}
var Ia = It(() => {
  rn();
  rn();
});
var la = {};
jr(la, { default: () => Jl });
var _l;
var Jl;
var ca = It(() => {
  _l = (() => {
    var A = import.meta.url;
    return function(e) {
      e = e || {};
      var t;
      t || (t = typeof e < "u" ? e : {});
      var r, n;
      t.ready = new Promise(function(l2, c2) {
        r = l2, n = c2;
      });
      var i2 = Object.assign({}, t), o = "";
      typeof document < "u" && document.currentScript && (o = document.currentScript.src), A && (o = A), o.indexOf("blob:") !== 0 ? o = o.substr(0, o.replace(/[?#].*/, "").lastIndexOf("/") + 1) : o = "";
      var s = t.print || console.log.bind(console), a = t.printErr || console.warn.bind(console);
      Object.assign(t, i2), i2 = null;
      var g2;
      t.wasmBinary && (g2 = t.wasmBinary);
      var u2 = t.noExitRuntime || true;
      typeof WebAssembly != "object" && MA("no native wasm support detected");
      var I, B = false;
      function f(l2, c2, Q) {
        Q = c2 + Q;
        for (var d2 = ""; !(c2 >= Q); ) {
          var y = l2[c2++];
          if (!y) break;
          if (y & 128) {
            var k = l2[c2++] & 63;
            if ((y & 224) == 192) d2 += String.fromCharCode((y & 31) << 6 | k);
            else {
              var N = l2[c2++] & 63;
              y = (y & 240) == 224 ? (y & 15) << 12 | k << 6 | N : (y & 7) << 18 | k << 12 | N << 6 | l2[c2++] & 63, 65536 > y ? d2 += String.fromCharCode(y) : (y -= 65536, d2 += String.fromCharCode(55296 | y >> 10, 56320 | y & 1023));
            }
          } else d2 += String.fromCharCode(y);
        }
        return d2;
      }
      var E, C, p, m2, x3, w2, b, D, h2;
      function v2() {
        var l2 = I.buffer;
        E = l2, t.HEAP8 = C = new Int8Array(l2), t.HEAP16 = m2 = new Int16Array(l2), t.HEAP32 = w2 = new Int32Array(l2), t.HEAPU8 = p = new Uint8Array(l2), t.HEAPU16 = x3 = new Uint16Array(l2), t.HEAPU32 = b = new Uint32Array(l2), t.HEAPF32 = D = new Float32Array(l2), t.HEAPF64 = h2 = new Float64Array(l2);
      }
      var F, K2 = [], _ = [], AA = [];
      function EA() {
        var l2 = t.preRun.shift();
        K2.unshift(l2);
      }
      var iA = 0, lA = null, re = null;
      function MA(l2) {
        throw t.onAbort && t.onAbort(l2), l2 = "Aborted(" + l2 + ")", a(l2), B = true, l2 = new WebAssembly.RuntimeError(l2 + ". Build with -sASSERTIONS for more info."), n(l2), l2;
      }
      function ne(l2) {
        return l2.startsWith("data:application/octet-stream;base64,");
      }
      var kA;
      if (kA = "data:application/octet-stream;base64,AGFzbQEAAAABugM3YAF/AGACf38AYAF/AX9gA39/fwBgAn98AGACf38Bf2ADf39/AX9gBH9/f30BfWADf398AGAAAGAEf39/fwBgAX8BfGACf38BfGAFf39/f38Bf2AAAX9gA39/fwF9YAZ/f31/fX8AYAV/f39/fwBgAn9/AX1gBX9/f319AX1gAX8BfWADf35/AX5gB39/f39/f38AYAZ/f39/f38AYAR/f39/AX9gBn9/f319fQF9YAR/f31/AGADf399AX1gBn98f39/fwF/YAR/fHx/AGACf30AYAh/f39/f39/fwBgDX9/f39/f39/f39/f38AYAp/f39/f39/f39/AGAFf39/f38BfGAEfHx/fwF9YA1/fX1/f399fX9/f39/AX9gB39/f319f38AYAJ+fwF/YAN/fX0BfWABfAF8YAN/fHwAYAR/f319AGAHf39/fX19fQF9YA1/fX99f31/fX19fX1/AX9gC39/f39/f399fX19AX9gCH9/f39/f319AGAEf39+fgBgB39/f39/f38Bf2ACfH8BfGAFf398fH8AYAN/f38BfGAEf39/fABgA39/fQBgBn9/fX99fwF/ArUBHgFhAWEAHwFhAWIAAwFhAWMACQFhAWQAFgFhAWUAEQFhAWYAIAFhAWcAAAFhAWgAIQFhAWkAAwFhAWoAAAFhAWsAFwFhAWwACgFhAW0ABQFhAW4AAwFhAW8AAQFhAXAAFwFhAXEABgFhAXIAAAFhAXMAIgFhAXQACgFhAXUADQFhAXYAFgFhAXcAAgFhAXgAAwFhAXkAGAFhAXoAAgFhAUEAAQFhAUIAEQFhAUMAAQFhAUQAAAOiAqACAgMSBwcACRkDAAoRBgYKEwAPDxMBBiMTCgcHGgMUASQFJRQHAwMKCgMmAQYYDxobFAAKBw8KBwMDAgkCAAAFGwACBwIHBgIDAQMIDAABKAkHBQURACkZASoAAAIrLAIALQcHBy4HLwkFCgMCMA0xAgMJAgACAQYKAQIBBQEACQIFAQEABQAODQ0GFQIBHBUGAgkCEAAAAAUyDzMMBQYINAUCAwUODg41AgMCAgIDBgICNgIBDAwMAQsLCwsLCx0CAAIAAAABABABBQICAQMCEgMMCwEBAQEBAQsLAQICAwICAgICAgIDAgIICAEICAgEBAQEBAQEBAQABAQABAQEBAAEBAQBAQEICAEBAQEBAQEBCAgBAQEAAg4CAgUBAR4DBAcBcAHUAdQBBQcBAYACgIACBg0CfwFBkMQEC38BQQALByQIAUUCAAFGAG0BRwCwAQFIAK8BAUkAYQFKAQABSwAjAUwApgEJjQMBAEEBC9MBqwGqAaUB5QHiAZwB0AFazwHOAVlZWpsBmgGZAc0BzAHLAcoBWpgByQFZWVqbAZoBmQHIAccBxgGjAZcBpAGWAaMBvQKVAbwCxQG7Ajq6Ajq5ApQBuAI+twI+xAFqwwFqwgFqaWjBAcABvwGhAZcBtgK+AbUClgGhAbQCmAGzAjqxAjqwAr0BrwKuAq0CrAKrAqoCqAKnAqYCpQKkAqMCogKhArwBoAKfAp4CnQKcApsCmgKZApgClwKWApUClAKTApICkQKQAo8CjgKyAo0CjAKLAooCiAKHAqkChQI+hAK7AYMCggKBAoAC/gH9AfwB+QG6AfgBuQH3AfYB9QH0AfMB8gHxAYYC8AHvAbgB+wH6Ae4B7QG3AesBlQHqATrpAT7oAT7nAZQB0QE67AE+iQLmATrkAeMBOuEB4AHfAT7eAd0B3AG2AdsB2gHZAdgB1wHWAdUBtQHUAdMB0gH/AWloaWiPAZABsgGxAZEBhQGSAbQBswGRAa4BrQGsAakBqAGnAYUBCtj+A6ACMwEBfyAAQQEgABshAAJAA0AgABBhIgENAUGIxAAoAgAiAQRAIAERCQAMAQsLEAIACyABC+0BAgJ9A39DAADAfyEEAkACQAJAAkAgAkEHcSIGDgUCAQEBAAELQQMhBQwBCyAGQQFrQQJPDQEgAkHw/wNxQQR2IQcCfSACQQhxBEAgASAHEJ4BvgwBC0EAIAdB/w9xIgFrIAEgAsFBAEgbsgshAyAGQQFGBEAgAyADXA0BQwAAwH8gAyADQwAAgH9bIANDAACA/1tyIgEbIQQgAUUhBQwBCyADIANcDQBBAEECIANDAACAf1sgA0MAAID/W3IiARshBUMAAMB/IAMgARshBAsgACAFOgAEIAAgBDgCAA8LQfQNQakYQTpB+RYQCwALZwIBfQF/QwAAwH8hAgJAAkACQCABQQdxDgQCAAABAAtBxBJBqRhByQBBuhIQCwALIAFB8P8DcUEEdiEDIAFBCHEEQCAAIAMQngG+DwtBACADQf8PcSIAayAAIAHBQQBIG7IhAgsgAgt4AgF/AX0jAEEQayIEJAAgBEEIaiAAQQMgAkECR0EBdCABQf4BcUECRxsgAhAoQwAAwH8hBQJAAkACQCAELQAMQQFrDgIAAQILIAQqAgghBQwBCyAEKgIIIAOUQwrXIzyUIQULIARBEGokACAFQwAAAAAgBSAFWxsLeAIBfwF9IwBBEGsiBCQAIARBCGogAEEBIAJBAkZBAXQgAUH+AXFBAkcbIAIQKEMAAMB/IQUCQAJAAkAgBC0ADEEBaw4CAAECCyAEKgIIIQUMAQsgBCoCCCADlEMK1yM8lCEFCyAEQRBqJAAgBUMAAAAAIAUgBVsbC8wCAQV/IAAEQCAAQQRrIgEoAgAiBSEDIAEhAiAAQQhrKAIAIgAgAEF+cSIERwRAIAEgBGsiAigCBCIAIAIoAgg2AgggAigCCCAANgIEIAQgBWohAwsgASAFaiIEKAIAIgEgASAEakEEaygCAEcEQCAEKAIEIgAgBCgCCDYCCCAEKAIIIAA2AgQgASADaiEDCyACIAM2AgAgA0F8cSACakEEayADQQFyNgIAIAICfyACKAIAQQhrIgFB/wBNBEAgAUEDdkEBawwBCyABQR0gAWciAGt2QQRzIABBAnRrQe4AaiABQf8fTQ0AGkE/IAFBHiAAa3ZBAnMgAEEBdGtBxwBqIgAgAEE/TxsLIgFBBHQiAEHgMmo2AgQgAiAAQegyaiIAKAIANgIIIAAgAjYCACACKAIIIAI2AgRB6DpB6DopAwBCASABrYaENwMACwsOAEHYMigCABEJABBYAAunAQIBfQJ/IABBFGoiByACIAFBAkkiCCAEIAUQNSEGAkAgByACIAggBCAFEC0iBEMAAAAAYCADIARecQ0AIAZDAAAAAGBFBEAgAyEEDAELIAYgAyADIAZdGyEECyAAQRRqIgAgASACIAUQOCAAIAEgAhAwkiAAIAEgAiAFEDcgACABIAIQL5KSIgMgBCADIAReGyADIAQgBCAEXBsgBCAEWyADIANbcRsLvwEBA38gAC0AAEEgcUUEQAJAIAEhAwJAIAIgACIBKAIQIgAEfyAABSABEJ0BDQEgASgCEAsgASgCFCIFa0sEQCABIAMgAiABKAIkEQYAGgwCCwJAIAEoAlBBAEgNACACIQADQCAAIgRFDQEgAyAEQQFrIgBqLQAAQQpHDQALIAEgAyAEIAEoAiQRBgAgBEkNASADIARqIQMgAiAEayECIAEoAhQhBQsgBSADIAIQKxogASABKAIUIAJqNgIUCwsLCwYAIAAQIwtQAAJAAkACQAJAAkAgAg4EBAABAgMLIAAgASABQQxqEEMPCyAAIAEgAUEMaiADEEQPCyAAIAEgAUEMahBCDwsQJAALIAAgASABQQxqIAMQRQttAQF/IwBBgAJrIgUkACAEQYDABHEgAiADTHJFBEAgBSABQf8BcSACIANrIgNBgAIgA0GAAkkiARsQKhogAUUEQANAIAAgBUGAAhAmIANBgAJrIgNB/wFLDQALCyAAIAUgAxAmCyAFQYACaiQAC/ICAgJ/AX4CQCACRQ0AIAAgAToAACAAIAJqIgNBAWsgAToAACACQQNJDQAgACABOgACIAAgAToAASADQQNrIAE6AAAgA0ECayABOgAAIAJBB0kNACAAIAE6AAMgA0EEayABOgAAIAJBCUkNACAAQQAgAGtBA3EiBGoiAyABQf8BcUGBgoQIbCIBNgIAIAMgAiAEa0F8cSIEaiICQQRrIAE2AgAgBEEJSQ0AIAMgATYCCCADIAE2AgQgAkEIayABNgIAIAJBDGsgATYCACAEQRlJDQAgAyABNgIYIAMgATYCFCADIAE2AhAgAyABNgIMIAJBEGsgATYCACACQRRrIAE2AgAgAkEYayABNgIAIAJBHGsgATYCACAEIANBBHFBGHIiBGsiAkEgSQ0AIAGtQoGAgIAQfiEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkEgayICQR9LDQALCyAAC4AEAQN/IAJBgARPBEAgACABIAIQFyAADwsgACACaiEDAkAgACABc0EDcUUEQAJAIABBA3FFBEAgACECDAELIAJFBEAgACECDAELIAAhAgNAIAIgAS0AADoAACABQQFqIQEgAkEBaiICQQNxRQ0BIAIgA0kNAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgACADQQRrIgRLBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAtIAQF/IwBBEGsiBCQAIAQgAzYCDAJAIABFBEBBAEEAIAEgAiAEKAIMEHEMAQsgACgC9AMgACABIAIgBCgCDBBxCyAEQRBqJAALkwECAX0BfyMAQRBrIgYkACAGQQhqIABB6ABqIAAgAkEBdGovAWIQH0MAAMB/IQUCQAJAAkAgBi0ADEEBaw4CAAECCyAGKgIIIQUMAQsgBioCCCADlEMK1yM8lCEFCyAALQADQRB0QYCAwABxBEAgBSAAIAEgAiAEEFQiA0MAAAAAIAMgA1sbkiEFCyAGQRBqJAAgBQu1AQECfyAAKAIEQQFqIgEgACgCACICKALsAyACKALoAyICa0ECdU8EQANAIAAoAggiAUUEQCAAQQA2AgggAEIANwIADwsgACABKAIENgIAIAAgASgCCDYCBCAAIAEoAgA2AgggARAjIAAoAgRBAWoiASAAKAIAIgIoAuwDIAIoAugDIgJrQQJ1Tw0ACwsgACABNgIEIAIgAUECdGooAgAtABdBEHRBgIAwcUGAgCBGBEAgABB9CwuBAQIBfwF9IwBBEGsiAyQAIANBCGogAEEDIAJBAkdBAXQgAUH+AXFBAkcbIAIQU0MAAMB/IQQCQAJAAkAgAy0ADEEBaw4CAAECCyADKgIIIQQMAQsgAyoCCEMAAAAAlEMK1yM8lCEECyADQRBqJAAgBEMAAAAAl0MAAAAAIAQgBFsbC4EBAgF/AX0jAEEQayIDJAAgA0EIaiAAQQEgAkECRkEBdCABQf4BcUECRxsgAhBTQwAAwH8hBAJAAkACQCADLQAMQQFrDgIAAQILIAMqAgghBAwBCyADKgIIQwAAAACUQwrXIzyUIQQLIANBEGokACAEQwAAAACXQwAAAAAgBCAEWxsLeAICfQF/IAAgAkEDdGoiByoC+AMhBkMAAMB/IQUCQAJAAkAgBy0A/ANBAWsOAgABAgsgBiEFDAELIAYgA5RDCtcjPJQhBQsgAC0AF0EQdEGAgMAAcQR9IAUgAEEUaiABIAIgBBBUIgNDAAAAACADIANbG5IFIAULC1EBAX8CQCABKALoAyICIAEoAuwDRwRAIABCADcCBCAAIAE2AgAgAigCAC0AF0EQdEGAgDBxQYCAIEcNASAAEH0PCyAAQgA3AgAgAEEANgIICwvoAgECfwJAIAAgAUYNACABIAAgAmoiBGtBACACQQF0a00EQCAAIAEgAhArDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkEBayECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkEBayICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQQRrIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkEBayICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AA0AgAyABKAIANgIAIAFBBGohASADQQRqIQMgAkEEayICQQNLDQALCyACRQ0AA0AgAyABLQAAOgAAIANBAWohAyABQQFqIQEgAkEBayICDQALCyAAC5QCAgF8AX8CQCAAIAGiIgAQbCIERAAAAAAAAPA/oCAEIAREAAAAAAAAAABjGyIEIARiIgUgBJlELUMc6+I2Gj9jRXJFBEAgACAEoSEADAELIAUgBEQAAAAAAADwv6CZRC1DHOviNho/Y0VyRQRAIAAgBKFEAAAAAAAA8D+gIQAMAQsgACAEoSEAIAIEQCAARAAAAAAAAPA/oCEADAELIAMNACAAAnxEAAAAAAAAAAAgBQ0AGkQAAAAAAADwPyAERAAAAAAAAOA/ZA0AGkQAAAAAAADwP0QAAAAAAAAAACAERAAAAAAAAOC/oJlELUMc6+I2Gj9jGwugIQALIAAgAGIgASABYnIEQEMAAMB/DwsgACABo7YLkwECAX0BfyMAQRBrIgYkACAGQQhqIABB6ABqIAAgAkEBdGovAV4QH0MAAMB/IQUCQAJAAkAgBi0ADEEBaw4CAAECCyAGKgIIIQUMAQsgBioCCCADlEMK1yM8lCEFCyAALQADQRB0QYCAwABxBEAgBSAAIAEgAiAEEFQiA0MAAAAAIAMgA1sbkiEFCyAGQRBqJAAgBQtQAAJAAkACQAJAAkAgAg4EBAABAgMLIAAgASABQR5qEEMPCyAAIAEgAUEeaiADEEQPCyAAIAEgAUEeahBCDwsQJAALIAAgASABQR5qIAMQRQt+AgF/AX0jAEEQayIEJAAgBEEIaiAAQQMgAkECR0EBdCABQf4BcUECRxsgAhBQQwAAwH8hBQJAAkACQCAELQAMQQFrDgIAAQILIAQqAgghBQwBCyAEKgIIIAOUQwrXIzyUIQULIARBEGokACAFQwAAAACXQwAAAAAgBSAFWxsLfgIBfwF9IwBBEGsiBCQAIARBCGogAEEBIAJBAkZBAXQgAUH+AXFBAkcbIAIQUEMAAMB/IQUCQAJAAkAgBC0ADEEBaw4CAAECCyAEKgIIIQUMAQsgBCoCCCADlEMK1yM8lCEFCyAEQRBqJAAgBUMAAAAAl0MAAAAAIAUgBVsbC08AAkACQAJAIANB/wFxIgMOBAACAgECCyABIAEvAABB+P8DcTsAAA8LIAEgAS8AAEH4/wNxQQRyOwAADwsgACABIAJBAUECIANBAUYbEEwLNwEBfyABIAAoAgQiA0EBdWohASAAKAIAIQAgASACIANBAXEEfyABKAIAIABqKAIABSAACxEBAAtiAgJ9An8CQCAAKALkA0UNACAAQfwAaiIDIABBGmoiBC8BABAgIgIgAlwEQCADIABBGGoiBC8BABAgIgIgAlwNASADIAAvARgQIEMAAAAAXkUNAQsgAyAELwEAECAhAQsgAQtfAQN/IAEEQEEMEB4iAyABKQIENwIEIAMhAiABKAIAIgEEQCADIQQDQEEMEB4iAiABKQIENwIEIAQgAjYCACACIQQgASgCACIBDQALCyACIAAoAgA2AgAgACADNgIACwvXawMtfxx9AX4CfwJAIAAtAABBBHEEQCAAKAKgASAMRw0BCyAAKAKkASAAKAL0AygCDEcNAEEAIAAtAKgBIANGDQEaCyAAQoCAgPyLgIDAv383AoADIABCgYCAgBA3AvgCIABCgICA/IuAgMC/fzcC8AIgAEEANgKsAUEBCyErAkACQAJAAkAgACgCCARAIABBFGoiDkECQQEgBhAiIT4gDkECQQEgBhAhITwgDkEAQQEgBhAiITsgDkEAQQEgBhAhIUAgBCABIAUgAiAAKAL4AiAAQfACaiIOKgIAIAAoAvwCIAAqAvQCIAAqAoADIAAqAoQDID4gPJIiPiA7IECSIjwgACgC9AMiEBB7DQEgACgCrAEiEUUNAyAAQbABaiETA0AgBCABIAUgAiATIB1BGGxqIg4oAgggDioCACAOKAIMIA4qAgQgDioCECAOKgIUID4gPCAQEHsNAiAdQQFqIh0gEUcNAAsMAgsgCEUEQCAAKAKsASITRQ0CIABBsAFqIRADQAJAAkAgECAdQRhsIhFqIg4qAgAiPiA+XCABIAFcckUEQCA+IAGTi0MXt9E4XQ0BDAILIAEgAVsgPiA+W3INAQsCQCAQIBFqIhEqAgQiPiA+XCACIAJcckUEQCA+IAKTi0MXt9E4XQ0BDAILIAIgAlsgPiA+W3INAQsgESgCCCAERw0AIBEoAgwgBUYNAwsgEyAdQQFqIh1HDQALDAILAkAgAEHwAmoiDioCACI+ID5cIAEgAVxyRQRAID4gAZOLQxe30ThdDQEMBAsgASABWyA+ID5bcg0DCyAOQQAgACgC/AIgBUYbQQAgACgC+AIgBEYbQQACfyACIAJcIg4gACoC9AIiPiA+XHJFBEAgPiACk4tDF7fROF0MAQtBACA+ID5bDQAaIA4LGyEOCyAORSArcgRAIA4hHQwCCyAAIA4qAhA4ApQDIAAgDioCFDgCmAMgCkEMQRAgCBtqIgMgAygCAEEBajYCACAOIR0MAgtBACEdCyAGIUAgByFHIAtBAWohIiMAQaABayINJAACQAJAIARBAUYgASABW3JFBEAgDUGqCzYCICAAQQVB2CUgDUEgahAsDAELIAVBAUYgAiACW3JFBEAgDUHZCjYCECAAQQVB2CUgDUEQahAsDAELIApBAEEEIAgbaiILIAsoAgBBAWo2AgAgACAALQCIA0H8AXEgAC0AFEEDcSILIANBASADGyIsIAsbIg9BA3FyOgCIAyAAQawDaiIQIA9BAUdBA3QiC2ogAEEUaiIUQQNBAiAPQQJGGyIRIA8gQBAiIgY4AgAgECAPQQFGQQN0Ig5qIBQgESAPIEAQISIHOAIAIAAgFEEAIA8gQBAiIjw4ArADIAAgFEEAIA8gQBAhIjs4ArgDIABBvANqIhAgC2ogFCARIA8QMDgCACAOIBBqIBQgESAPEC84AgAgACAUQQAgDxAwOALAAyAAIBRBACAPEC84AsgDIAsgAEHMA2oiC2ogFCARIA8gQBA4OAIAIAsgDmogFCARIA8gQBA3OAIAIAAgFEEAIA8gQBA4OALQAyAAIBRBACAPIEAQNyI6OALYAyAGIAeSIT4gPCA7kiE8AkACQCAAKAIIIgsEQEMAAMB/IAEgPpMgBEEBRhshBkMAAMB/IAIgPJMgBUEBRhshPiAAAn0gBCAFckUEQCAAIABBAiAPIAYgQCBAECU4ApQDIABBACAPID4gRyBAECUMAQsgBEEDTyAFQQNPcg0EIA1BiAFqIAAgBiAGIAAqAswDIAAqAtQDkiAAKgK8A5IgACoCxAOSIjyTIgdDAAAAACAHQwAAAABeGyAGIAZcG0GBgAggBEEDdEH4//8HcXZB/wFxID4gPiAAKgLQAyA6kiAAKgLAA5IgACoCyAOSIjuTIgdDAAAAACAHQwAAAABeGyA+ID5cG0GBgAggBUEDdEH4//8HcXZB/wFxIAsREAAgDSoCjAEiPUMAAAAAYCANKgKIASIHQwAAAABgcUUEQCANID27OQMIIA0gB7s5AwAgAEEBQdwdIA0QLCANKgKMASIHQwAAAAAgB0MAAAAAXhshPSANKgKIASIHQwAAAAAgB0MAAAAAXhshBwsgCiAKKAIUQQFqNgIUIAogCUECdGoiCSAJKAIYQQFqNgIYIAAgAEECIA8gPCAHkiAGIARBAWtBAkkbIEAgQBAlOAKUAyAAQQAgDyA7ID2SID4gBUEBa0ECSRsgRyBAECULOAKYAwwBCwJAIAAoAuADRQRAIAAoAuwDIAAoAugDa0ECdSELDAELIA1BiAFqIAAQMgJAIA0oAogBRQRAQQAhCyANKAKMAUUNAQsgDUGAAWohEEEAIQsDQCANQQA2AoABIA0gDSkDiAE3A3ggECANKAKQARA8IA1BiAFqEC4gDSgCgAEiCQRAA0AgCSgCACEOIAkQJyAOIgkNAAsLIAtBAWohCyANQQA2AoABIA0oAowBIA0oAogBcg0ACwsgDSgCkAEiCUUNAANAIAkoAgAhDiAJECcgDiIJDQALCyALRQRAIAAgAEECIA8gBEEBa0EBSwR9IAEgPpMFIAAqAswDIAAqAtQDkiAAKgK8A5IgACoCxAOSCyBAIEAQJTgClAMgACAAQQAgDyAFQQFrQQFLBH0gAiA8kwUgACoC0AMgACoC2AOSIAAqAsADkiAAKgLIA5ILIEcgQBAlOAKYAwwBCwJAIAgNACAFQQJGIAIgPJMiBiAGW3EgBkMAAAAAX3EgBCAFckUgBEECRiABID6TIgdDAAAAAF9xcnJFDQAgACAAQQIgD0MAAAAAQwAAAAAgByAHQwAAAABdGyAHIARBAkYbIAcgB1wbIEAgQBAlOAKUAyAAIABBACAPQwAAAABDAAAAACAGIAZDAAAAAF0bIAYgBUECRhsgBiAGXBsgRyBAECU4ApgDDAELIAAQTyAAIAAtAIgDQfsBcToAiAMgABBeQQMhEyAALQAUQQJ2QQNxIQkCQAJAIA9BAkcNAAJAIAlBAmsOAgIAAQtBAiETDAELIAkhEwsgAC8AFSEnIBQgEyAPIEAQOCEGIBQgEyAPEDAhByAUIBMgDyBAEDchOyAUIBMgDxAvITpBACEQIBQgEUEAIBNBAkkbIhYgDyBAEDghPyAUIBYgDxAwIT0gFCAWIA8gQBA3IUEgFCAWIA8QLyFEIBQgFiAPIEAQYCFCIBQgFiAPEEshQyAAIA9BACABID6TIlAgBiAHkiA7IDqSkiJKID8gPZIgQSBEkpIiRiATQQFLIhkbIEAgQBB6ITsgACAPQQEgAiA8kyJRIEYgSiAZGyBHIEAQeiFFAkACQCAEIAUgGRsiHA0AIA1BiAFqIAAQMgJAAkAgDSgCiAEiDiANKAKMASIJckUNAANAIA4oAuwDIA4oAugDIg5rQQJ1IAlNDQQCQCAOIAlBAnRqKAIAIgkQeUUNACAQDQIgCRA7IgYgBlsgBotDF7fROF1xDQIgCRBAIgYgBlwEQCAJIRAMAQsgCSEQIAaLQxe30ThdDQILIA1BiAFqEC4gDSgCjAEiCSANKAKIASIOcg0ACwwBC0EAIRALIA0oApABIglFDQADQCAJKAIAIQ4gCRAnIA4iCQ0ACwsgDUGIAWogABAyIA0oAowBIQkCQCANKAKIASIORQRAQwAAAAAhPSAJRQ0BCyBFIEVcIiMgBUEAR3IhKCA7IDtcIiQgBEEAR3IhKUMAAAAAIT0DQCAOKALsAyAOKALoAyIOa0ECdSAJTQ0CIA4gCUECdGooAgAiDhB4AkAgDi8AFSAOLQAXQRB0ciIJQYCAMHFBgIAQRgRAIA4QdyAOIA4tAAAiCUEBciIOQfsBcSAOIAlBBHEbOgAADAELIAgEfyAOIA4tABRBA3EiCSAPIAkbIDsgRRB2IA4vABUgDi0AF0EQdHIFIAkLQYDgAHFBgMAARg0AIA5BFGohEQJAIA4gEEYEQCAQQQA2ApwBIBAgDDYCmAFDAAAAACEHDAELIBQtAABBAnZBA3EhCQJAAkAgD0ECRw0AQQMhEgJAIAlBAmsOAgIAAQtBAiESDAELIAkhEgsgDUGAgID+BzYCaCANQYCAgP4HNgJQIA1B+ABqIA5B/ABqIhcgDi8BHhAfIDsgRSASQQFLIh4bIT4CQAJAAkACQCANLQB8IgkOBAABAQABCwJAIBcgDi8BGBAgIgYgBlwNACAXIA4vARgQIEMAAAAAXkUNACAOKAL0Ay0ACEEBcSIJDQBDAADAf0MAAAAAIAkbIQcMAgtDAADAfyEGDAILIA0qAnghB0MAAMB/IQYCQCAJQQFrDgIBAAILIAcgPpRDCtcjPJQhBgwBCyAHIQYLIA4tABdBEHRBgIDAAHEEQCAGIBEgD0GBAiASQQN0dkEBcSA7EFQiBkMAAAAAIAYgBlsbkiEGCyAOKgL4AyEHQQAhH0EAIRgCQAJAAkAgDi0A/ANBAWsOAgEAAgsgOyAHlEMK1yM8lCEHCyAHIAdcDQAgB0MAAAAAYCEYCyAOKgKABCEHAkACQAJAIA4tAIQEQQFrDgIBAAILIEUgB5RDCtcjPJQhBwsgByAHXA0AIAdDAAAAAGAhHwsCQCAOAn0gBiAGXCIJID4gPlxyRQRAIA4qApwBIgcgB1sEQCAOKAL0Ay0AEEEBcUUNAyAOKAKYASAMRg0DCyARIBIgDyA7EDggESASIA8QMJIgESASIA8gOxA3IBEgEiAPEC+SkiIHIAYgBiAHXRsgByAGIAkbIAYgBlsgByAHW3EbDAELIBggHnEEQCARQQIgDyA7EDggEUECIA8QMJIgEUECIA8gOxA3IBFBAiAPEC+SkiIHIA4gD0EAIDsgOxAxIgYgBiAHXRsgByAGIAYgBlwbIAYgBlsgByAHW3EbDAELIB4gH0VyRQRAIBFBACAPIDsQOCARQQAgDxAwkiARQQAgDyA7EDcgEUEAIA8QL5KSIgcgDiAPQQEgRSA7EDEiBiAGIAddGyAHIAYgBiAGXBsgBiAGWyAHIAdbcRsMAQtBASEaIA1BATYCZCANQQE2AnggEUECQQEgOxAiIBFBAkEBIDsQIZIhPiARQQBBASA7ECIhPCARQQBBASA7ECEhOkMAAMB/IQdBASEVQwAAwH8hBiAYBEAgDiAPQQAgOyA7EDEhBiANQQA2AnggDSA+IAaSIgY4AmhBACEVCyA8IDqSITwgHwRAIA4gD0EBIEUgOxAxIQcgDUEANgJkIA0gPCAHkiIHOAJQQQAhGgsCQAJAAkAgAC0AF0EQdEGAgAxxQYCACEYiCSASQQJJIiBxRQRAIAkgJHINAiAGIAZcDQEMAgsgJCAGIAZbcg0CC0ECIRUgDUECNgJ4IA0gOzgCaCA7IQYLAkAgIEEBIAkbBEAgCSAjcg0CIAcgB1wNAQwCCyAjIAcgB1tyDQELQQIhGiANQQI2AmQgDSBFOAJQIEUhBwsCQCAXIA4vAXoQICI6IDpcDQACfyAVIB5yRQRAIBcgDi8BehAgIQcgDUEANgJkIA0gPCAGID6TIAeVkjgCUEEADAELIBogIHINASAXIA4vAXoQICEGIA1BADYCeCANIAYgByA8k5QgPpI4AmhBAAshGkEAIRULIA4vABZBD3EiCUUEQCAALQAVQQR2IQkLAkAgFUUgCUEFRiAeciAYIClyIAlBBEdycnINACANQQA2AnggDSA7OAJoIBcgDi8BehAgIgYgBlwNAEEAIRogFyAOLwF6ECAhBiANQQA2AmQgDSA7ID6TIAaVOAJQCyAOLwAWQQ9xIhhFBEAgAC0AFUEEdiEYCwJAICAgKHIgH3IgGEEFRnIgGkUgGEEER3JyDQAgDUEANgJkIA0gRTgCUCAXIA4vAXoQICIGIAZcDQAgFyAOLwF6ECAhBiANQQA2AnggDSAGIEUgPJOUOAJoCyAOIA9BAiA7IDsgDUH4AGogDUHoAGoQPyAOIA9BACBFIDsgDUHkAGogDUHQAGoQPyAOIA0qAmggDSoCUCAPIA0oAnggDSgCZCA7IEVBAEEFIAogIiAMED0aIA4gEkECdEH8JWooAgBBAnRqKgKUAyEGIBEgEiAPIDsQOCARIBIgDxAwkiARIBIgDyA7EDcgESASIA8QL5KSIgcgBiAGIAddGyAHIAYgBiAGXBsgBiAGWyAHIAdbcRsLIgc4ApwBCyAOIAw2ApgBCyA9IAcgESATQQEgOxAiIBEgE0EBIDsQIZKSkiE9CyANQYgBahAuIA0oAowBIgkgDSgCiAEiDnINAAsLIA0oApABIgkEQANAIAkoAgAhDiAJECcgDiIJDQALCyA7IEUgGRshByA9QwAAAACSIQYgC0ECTwRAIBQgEyAHEE0gC0EBa7OUIAaSIQYLIEIgQ5IhPiAFIAQgGRshGiBHIEAgGRshTSBAIEcgGRshSSANQdAAaiAAEDJBACAcIAYgB14iCxsgHCAcQQJGGyAcICdBgIADcSIfGyEeIBQgFiBFIDsgGRsiRBBNIU8gDSgCVCIRIA0oAlAiCXIEQEEBQQIgRCBEXCIpGyEtIAtFIBxBAUZyIS4gE0ECSSEZIABB8gBqIS8gAEH8AGohMCATQQJ0IgtB7CVqITEgC0HcJWohMiAWQQJ0Ig5B7CVqIRwgDkHcJWohICALQfwlaiEkIA5B/CVqISMgGkEARyIzIAhyITQgGkUiNSAIQQFzcSE2IBogH3JFITcgDUHwAGohOCANQYABaiEnQYECIBNBA3R2Qf8BcSEoIBpBAWtBAkkhOQNAIA1BADYCgAEgDUIANwN4AkAgACgC7AMiCyAAKALoAyIORg0AIAsgDmsiC0EASA0DIA1BiAFqIAtBAnVBACAnEEohECANKAKMASANKAJ8IA0oAngiC2siDmsgCyAOEDMhDiANIA0oAngiCzYCjAEgDSAONgJ4IA0pA5ABIVYgDSANKAJ8Ig42ApABIA0oAoABIRIgDSBWNwJ8IA0gEjYClAEgECALNgIAIAsgDkcEQCANIA4gCyAOa0EDakF8cWo2ApABCyALRQ0AIAsQJwsgFC0AACIOQQJ2QQNxIQsCQAJAIA5BA3EiDiAsIA4bIhJBAkcNAEEDIRACQCALQQJrDgICAAELQQIhEAwBCyALIRALIAAvABUhCyAUIBAgBxBNIT8CQCAJIBFyRQRAQwAAAAAhQ0EAIRFDAAAAACFCQwAAAAAhQUEAIRUMAQsgC0GAgANxISUgEEECSSEYIBBBAnQiC0HsJWohISALQdwlaiEqQQAhFUMAAAAAIUEgESEOQwAAAAAhQkMAAAAAIUNBACEXQwAAAAAhPQNAIAkoAuwDIAkoAugDIglrQQJ1IA5NDQQCQCAJIA5BAnRqKAIAIgkvABUgCS0AF0EQdHIiC0GAgDBxQYCAEEYgC0GA4ABxQYDAAEZyDQAgDUGIAWoiESAJQRRqIgsgKigCACADECggDS0AjAEhJiARIAsgISgCACADECggDS0AjAEhESAJIBs2AtwDIBUgJkEDRmohFSARQQNGIREgCyAQQQEgOxAiIUsgCyAQQQEgOxAhIU4gCSAXIAkgFxsiF0YhJiAJKgKcASE8IAsgEiAYIEkgQBA1IToCQCALIBIgGCBJIEAQLSIGQwAAAABgIAYgPF1xDQAgOkMAAAAAYEUEQCA8IQYMAQsgOiA8IDogPF4bIQYLIBEgFWohFQJAICVFQwAAAAAgPyAmGyI8IEsgTpIiOiA9IAaSkpIgB15Fcg0AIA0oAnggDSgCfEYNACAOIREMAwsgCRB5BEAgQiAJEDuSIUIgQyAJEEAgCSoCnAGUkyFDCyBBIDwgOiAGkpIiBpIhQSA9IAaSIT0gDSgCfCILIA0oAoABRwRAIAsgCTYCACANIAtBBGo2AnwMAQsgCyANKAJ4ayILQQJ1IhFBAWoiDkGAgICABE8NBSANQYgBakH/////AyALQQF1IiYgDiAOICZJGyALQfz///8HTxsgESAnEEohDiANKAKQASAJNgIAIA0gDSgCkAFBBGo2ApABIA0oAowBIA0oAnwgDSgCeCIJayILayAJIAsQMyELIA0gDSgCeCIJNgKMASANIAs2AnggDSkDkAEhViANIA0oAnwiCzYCkAEgDSgCgAEhESANIFY3AnwgDSARNgKUASAOIAk2AgAgCSALRwRAIA0gCyAJIAtrQQNqQXxxajYCkAELIAlFDQAgCRAnCyANQQA2AnAgDSANKQNQNwNoIDggDSgCWBA8IA1B0ABqEC4gDSgCcCIJBEADQCAJKAIAIQsgCRAnIAsiCQ0ACwtBACERIA1BADYCcCANKAJUIg4gDSgCUCIJcg0ACwtDAACAPyBCIEJDAACAP10bIEIgQkMAAAAAXhshPCANKAJ8IRcgDSgCeCEJAn0CQAJ9AkACQAJAIB5FDQAgFCAPQQAgQCBAEDUhBiAUIA9BACBAIEAQLSE6IBQgD0EBIEcgQBA1IT8gFCAPQQEgRyBAEC0hPSAGID8gE0EBSyILGyBKkyIGIAZbIAYgQV5xDQEgOiA9IAsbIEqTIgYgBlsgBiBBXXENASAAKAL0Ay0AFEEBcQ0AIEEgPEMAAAAAWw0DGiAAEDsiBiAGXA0CIEEgABA7QwAAAABbDQMaDAILIAchBgsgBiAGWw0CIAYhBwsgBwshBiBBjEMAAAAAIEFDAAAAAF0bIT8gBgwBCyAGIEGTIT8gBgshByA2RQRAAkAgCSAXRgRAQwAAAAAhQQwBC0MAAIA/IEMgQ0MAAIA/XRsgQyBDQwAAAABeGyE9QwAAAAAhQSAJIQ4DQCAOKAIAIgsqApwBITogC0EUaiIQIA8gGSBJIEAQNSFCAkAgECAPIBkgSSBAEC0iBkMAAAAAYCAGIDpdcQ0AIEJDAAAAAGBFBEAgOiEGDAELIEIgOiA6IEJdGyEGCwJAID9DAAAAAF0EQCAGIAsQQIyUIjpDAAAAAF4gOkMAAAAAXXJFDQEgCyATIA8gPyA9lSA6lCAGkiJCIAcgOxAlITogQiBCXCA6IDpcciA6IEJbcg0BIEEgOiAGk5IhQSALEEAgCyoCnAGUID2SIT0MAQsgP0MAAAAAXkUNACALEDsiQkMAAAAAXiBCQwAAAABdckUNACALIBMgDyA/IDyVIEKUIAaSIkMgByA7ECUhOiBDIENcIDogOlxyIDogQ1tyDQAgPCBCkyE8IEEgOiAGk5IhQQsgDkEEaiIOIBdHDQALID8gQZMiQiA9lSFLIEIgPJUhTiAALwAVQYCAA3FFIC5yISVDAAAAACFBIAkhCwNAIAsoAgAiDioCnAEhPCAOQRRqIhggDyAZIEkgQBA1IToCQCAYIA8gGSBJIEAQLSIGQwAAAABgIAYgPF1xDQAgOkMAAAAAYEUEQCA8IQYMAQsgOiA8IDogPF4bIQYLAn0gDiATIA8CfSBCQwAAAABdBEAgBiAGIA4QQIyUIjxDAAAAAFsNAhogBiA8kiA9QwAAAABbDQEaIEsgPJQgBpIMAQsgBiBCQwAAAABeRQ0BGiAGIA4QOyI8QwAAAABeIDxDAAAAAF1yRQ0BGiBOIDyUIAaSCyAHIDsQJQshQyAYIBNBASA7ECIhPCAYIBNBASA7ECEhOiAYIBZBASA7ECIhUiAYIBZBASA7ECEhUyANIEMgPCA6kiJUkiJVOAJoIA1BADYCYCBSIFOSITwCQCAOQfwAaiIQIA4vAXoQICI6IDpbBEAgECAOLwF6ECAhOiANQQA2AmQgDSA8IFUgVJMiPCA6lCA8IDqVIBkbkjgCeAwBCyAjKAIAIRACQCApDQAgDiAQQQN0aiIhKgL4AyE6QQAhEgJAAkACQCAhLQD8A0EBaw4CAQACCyBEIDqUQwrXIzyUIToLIDogOlwNACA6QwAAAABgIRILICUgNSASQQFzcXFFDQAgDi8AFkEPcSISBH8gEgUgAC0AFUEEdgtBBEcNACANQYgBaiAYICAoAgAgDxAoIA0tAIwBQQNGDQAgDUGIAWogGCAcKAIAIA8QKCANLQCMAUEDRg0AIA1BADYCZCANIEQ4AngMAQsgDkH4A2oiEiAQQQN0aiIQKgIAIToCQAJAAkACQCAQLQAEQQFrDgIBAAILIEQgOpRDCtcjPJQhOgsgOkMAAAAAYA0BCyANIC02AmQgDSBEOAJ4DAELAkACfwJAAkACQCAWQQJrDgICAAELIDwgDiAPQQAgRCA7EDGSITpBAAwCC0EBIRAgDSA8IA4gD0EBIEQgOxAxkiI6OAJ4IBNBAU0NDAwCCyA8IA4gD0EAIEQgOxAxkiE6QQALIRAgDSA6OAJ4CyANIDMgEiAQQQN0ajEABEIghkKAgICAIFFxIDogOlxyNgJkCyAOIA8gEyAHIDsgDUHgAGogDUHoAGoQPyAOIA8gFiBEIDsgDUHkAGogDUH4AGoQPyAOICMoAgBBA3RqIhAqAvgDIToCQAJAAkACQCAQLQD8A0EBaw4CAQACCyBEIDqUQwrXIzyUIToLQQEhECA6QwAAAABgDQELQQEhECAOLwAWQQ9xIhIEfyASBSAALQAVQQR2C0EERw0AIA1BiAFqIBggICgCACAPECggDS0AjAFBA0YNACANQYgBaiAYIBwoAgAgDxAoIA0tAIwBQQNGIRALIA4gDSoCaCI8IA0qAngiOiATQQFLIhIbIDogPCASGyAALQCIA0EDcSANKAJgIhggDSgCZCIhIBIbICEgGCASGyA7IEUgCCAQcSIQQQRBByAQGyAKICIgDBA9GiBBIEMgBpOSIUEgAAJ/IAAtAIgDIhBBBHFFBEBBACAOLQCIA0EEcUUNARoLQQQLIBBB+wFxcjoAiAMgC0EEaiILIBdHDQALCyA/IEGTIT8LIAAgAC0AiAMiC0H7AXFBBCA/QwAAAABdQQJ0IAtBBHFBAnYbcjoAiAMgFCATIA8gQBBgIBQgEyAPEEuSITogFCATIA8gQBB/IBQgEyAPEFKSIUsgFCATIAcQTSFCAn8CQAJ9ID9DAAAAAF5FIB5BAkdyRQRAIA1BiAFqIDAgLyAkKAIAQQF0ai8BABAfAkAgDS0AjAEEQCAUIA8gKCBJIEAQNSIGIAZbDQELQwAAAAAMAgtDAAAAACAUIA8gKCBJIEAQNSA6kyBLkyAHID+TkyI/QwAAAABeRQ0BGgsgP0MAAAAAYEUNASA/CyE8IBQtAABBBHZBB3EMAQsgPyE8IBQtAABBBHZBB3EiC0EAIAtBA2tBA08bCyELQwAAAAAhBgJAAkAgFQ0AQwAAAAAhPQJAAkACQAJAAkAgC0EBaw4FAAECBAMGCyA8QwAAAD+UIT0MBQsgPCE9DAQLIBcgCWsiC0EFSQ0CIEIgPCALQQJ1QQFrs5WSIUIMAgsgQiA8IBcgCWtBAnVBAWqzlSI9kiFCDAILIDxDAAAAP5QgFyAJa0ECdbOVIj0gPZIgQpIhQgwBC0MAAAAAIT0LIDogPZIhPSAAEHwhEgJAIAkgF0YiGARAQwAAAAAhP0MAAAAAIToMAQsgF0EEayElIDwgFbOVIU4gMigCACEhQwAAAAAhOkMAAAAAIT8gCSELA0AgDUGIAWogCygCACIOQRRqIhAgISAPECggPUMAAACAIE5DAAAAgCA8QwAAAABeGyJBIA0tAIwBQQNHG5IhPSAIBEACfwJAAkACQAJAIBNBAWsOAwECAwALQQEhFSAOQaADagwDC0EDIRUgDkGoA2oMAgtBACEVIA5BnANqDAELQQIhFSAOQaQDagshKiAOIBVBAnRqICoqAgAgPZI4ApwDCyAlKAIAIRUgDUGIAWogECAxKAIAIA8QKCA9QwAAAIAgQiAOIBVGG5JDAAAAgCBBIA0tAIwBQQNHG5IhPQJAIDRFBEAgPSAQIBNBASA7ECIgECATQQEgOxAhkiAOKgKcAZKSIT0gRCEGDAELIA4gEyA7EF0gPZIhPSASBEAgDhBOIUEgEEEAIA8gOxBBIUMgDioCmAMgEEEAQQEgOxAiIBBBAEEBIDsQIZKSIEEgQ5IiQZMiQyA/ID8gQ10bIEMgPyA/ID9cGyA/ID9bIEMgQ1txGyE/IEEgOiA6IEFdGyBBIDogOiA6XBsgOiA6WyBBIEFbcRshOgwBCyAOIBYgOxBdIkEgBiAGIEFdGyBBIAYgBiAGXBsgBiAGWyBBIEFbcRshBgsgC0EEaiILIBdHDQALCyA/IDqSIAYgEhshQQJ9IDkEQCAAIBYgDyBGIEGSIE0gQBAlIEaTDAELIEQgQSA3GyFBIEQLIT8gH0UEQCAAIBYgDyBGIEGSIE0gQBAlIEaTIUELIEsgPZIhPAJAIAhFDQAgCSELIBgNAANAIAsoAgAiFS8AFkEPcSIORQRAIAAtABVBBHYhDgsCQAJAAkACQCAOQQRrDgIAAQILIA1BiAFqIBVBFGoiECAgKAIAIA8QKEEEIQ4gDS0AjAFBA0YNASANQYgBaiAQIBwoAgAgDxAoIA0tAIwBQQNGDQEgFSAjKAIAQQN0aiIOKgL4AyE9AkACQAJAIA4tAPwDQQFrDgIBAAILIEQgPZRDCtcjPJQhPQsgPiEGID1DAAAAAGANAwsgFSAkKAIAQQJ0aioClAMhBiANIBVB/ABqIg4gFS8BehAgIjogOlsEfSAQIBZBASA7ECIgECAWQQEgOxAhkiAGIA4gFS8BehAgIjqUIAYgOpUgGRuSBSBBCzgCeCANIAYgECATQQEgOxAiIBAgE0EBIDsQIZKSOAKIASANQQA2AmggDUEANgJkIBUgDyATIAcgOyANQegAaiANQYgBahA/IBUgDyAWIEQgOyANQeQAaiANQfgAahA/IA0qAngiOiANKgKIASI9IBNBAUsiGCIOGyEGIB9BAEcgAC8AFUEPcUEER3EiECAZcSA9IDogDhsiOiA6XHIhDiAVIDogBiAPIA4gECAYcSAGIAZcciA7IEVBAUECIAogIiAMED0aID4hBgwCC0EFQQEgFC0AAEEIcRshDgsgFSAWIDsQXSEGIA1BiAFqIBVBFGoiECAgKAIAIhggDxAoID8gBpMhOgJAIA0tAIwBQQNHBEAgHCgCACESDAELIA1BiAFqIBAgHCgCACISIA8QKCANLQCMAUEDRw0AID4gOkMAAAA/lCIGQwAAAAAgBkMAAAAAXhuSIQYMAQsgDUGIAWogECASIA8QKCA+IQYgDS0AjAFBA0YNACANQYgBaiAQIBggDxAoIA0tAIwBQQNGBEAgPiA6QwAAAAAgOkMAAAAAXhuSIQYMAQsCQAJAIA5BAWsOAgIAAQsgPiA6QwAAAD+UkiEGDAELID4gOpIhBgsCfwJAAkACQAJAIBZBAWsOAwECAwALQQEhECAVQaADagwDC0EDIRAgFUGoA2oMAgtBACEQIBVBnANqDAELQQIhECAVQaQDagshDiAVIBBBAnRqIAYgTCAOKgIAkpI4ApwDIAtBBGoiCyAXRw0ACwsgCQRAIAkQJwsgPCBIIDwgSF4bIDwgSCBIIEhcGyBIIEhbIDwgPFtxGyFIIEwgT0MAAAAAIBsbIEGSkiFMIBtBAWohGyANKAJQIgkgEXINAAsLAkAgCEUNACAfRQRAIAAQfEUNAQsgACAWIA8CfSBGIESSIBpFDQAaIAAgFkECdEH8JWooAgBBA3RqIgkqAvgDIQYCQAJAAkAgCS0A/ANBAWsOAgEAAgsgTSAGlEMK1yM8lCEGCyAGQwAAAABgRQ0AIAAgD0GBAiAWQQN0dkEBcSBNIEAQMQwBCyBGIEySCyBHIEAQJSEGQwAAAAAhPCAALwAVQQ9xIQkCQAJAAkACQAJAAkACQAJAAkAgBiBGkyBMkyIGQwAAAABgRQRAQwAAAAAhQyAJQQJrDgICAQcLQwAAAAAhQyAJQQJrDgcBAAUGBAIDBgsgPiAGkiE+DAULID4gBkMAAAA/lJIhPgwECyAGIBuzIjqVITwgPiAGIDogOpKVkiE+DAMLID4gBiAbQQFqs5UiPJIhPgwCCyAbQQJJBEAMAgsgDUGIAWogABAyIAYgG0EBa7OVITwMAgsgBiAbs5UhQwsgDUGIAWogABAyIBtFDQELIBZBAnQiCUHcJWohECAJQfwlaiERIA1BOGohGCANQcgAaiEZIA1B8ABqIRUgDUGQAWohHCANQYABaiEfQQAhEgNAIA1BADYCgAEgDSANKQOIATcDeCAfIA0oApABEDwgDUEANgJwIA0gDSkDeCJWNwNoIBUgDSgCgAEiCxA8IA0oAmwhCQJAAkAgDSgCaCIOBEBDAAAAACE6QwAAAAAhP0MAAAAAIQYMAQtDAAAAACE6QwAAAAAhP0MAAAAAIQYgCUUNAQsDQCAOKALsAyAOKALoAyIOa0ECdSAJTQ0FAkAgDiAJQQJ0aigCACIJLwAVIAktABdBEHRyIhdBgIAwcUGAgBBGIBdBgOAAcUGAwABGcg0AIAkoAtwDIBJHDQIgCUEUaiEOIAkgESgCAEECdGoqApQDIj1DAAAAAGAEfyA9IA4gFkEBIDsQIiAOIBZBASA7ECGSkiI9IAYgBiA9XRsgPSAGIAYgBlwbIAYgBlsgPSA9W3EbIQYgCS0AFgUgF0EIdgtBD3EiFwR/IBcFIAAtABVBBHYLQQVHDQAgFC0AAEEIcUUNACAJEE4gDkEAIA8gOxBBkiI9ID8gPSA/XhsgPSA/ID8gP1wbID8gP1sgPSA9W3EbIj8gCSoCmAMgDkEAQQEgOxAiIA5BAEEBIDsQIZKSID2TIj0gOiA6ID1dGyA9IDogOiA6XBsgOiA6WyA9ID1bcRsiOpIiPSAGIAYgPV0bID0gBiAGIAZcGyAGIAZbID0gPVtxGyEGCyANQQA2AkggDSANKQNoNwNAIBkgDSgCcBA8IA1B6ABqEC4gDSgCSCIJBEADQCAJKAIAIQ4gCRAnIA4iCQ0ACwsgDUEANgJIIA0oAmwiCSANKAJoIg5yDQALCyANIA0pA2g3A4gBIBwgDSgCcBB1IA0gVjcDaCAVIAsQdSA+IE9DAAAAACASG5IhPiBDIAaSIT0gDSgCbCEJAkAgDSgCaCIOIA0oAogBRgRAIAkgDSgCjAFGDQELID4gP5IhQiA+ID2SIUsgPCA9kiEGA0AgDigC7AMgDigC6AMiDmtBAnUgCU0NBQJAIA4gCUECdGooAgAiCS8AFSAJLQAXQRB0ciIXQYCAMHFBgIAQRiAXQYDgAHFBgMAARnINACAJQRRqIQ4CQAJAAkACQAJAAkAgF0EIdkEPcSIXBH8gFwUgAC0AFUEEdgtBAWsOBQEDAgQABgsgFC0AAEEIcQ0ECyAOIBYgDyA7EFEhOiAJIBAoAgBBAnRqID4gOpI4ApwDDAQLIA4gFiAPIDsQYiE/AkACQAJAAkAgFkECaw4CAgABCyAJKgKUAyE6QQIhDgwCC0EBIQ4gCSoCmAMhOgJAIBYOAgIADwtBAyEODAELIAkqApQDITpBACEOCyAJIA5BAnRqIEsgP5MgOpM4ApwDDAMLAkACQAJAAkAgFkECaw4CAgABCyAJKgKUAyE/QQIhDgwCC0EBIQ4gCSoCmAMhPwJAIBYOAgIADgtBAyEODAELIAkqApQDIT9BACEOCyAJIA5BAnRqID4gPSA/k0MAAAA/lJI4ApwDDAILIA4gFiAPIDsQQSE6IAkgECgCAEECdGogPiA6kjgCnAMgCSARKAIAQQN0aiIXKgL4AyE/AkACQAJAIBctAPwDQQFrDgIBAAILIEQgP5RDCtcjPJQhPwsgP0MAAAAAYA0CCwJAAkACfSATQQFNBEAgCSoCmAMgDiAWQQEgOxAiIA4gFkEBIDsQIZKSITogBgwBCyAGITogCSoClAMgDiATQQEgOxAiIA4gE0EBIDsQIZKSCyI/ID9cIAkqApQDIkEgQVxyRQRAID8gQZOLQxe30ThdDQEMAgsgPyA/WyBBIEFbcg0BCyAJKgKYAyJBIEFcIg4gOiA6XHJFBEAgOiBBk4tDF7fROF1FDQEMAwsgOiA6Ww0AIA4NAgsgCSA/IDogD0EAQQAgOyBFQQFBAyAKICIgDBA9GgwBCyAJIEIgCRBOkyAOQQAgDyBEEFGSOAKgAwsgDUEANgI4IA0gDSkDaDcDMCAYIA0oAnAQPCANQegAahAuIA0oAjgiCQRAA0AgCSgCACEOIAkQJyAOIgkNAAsLIA1BADYCOCANKAJsIQkgDSgCaCIOIA0oAogBRw0AIAkgDSgCjAFHDQALCyANKAJwIgkEQANAIAkoAgAhDiAJECcgDiIJDQALCyALBEADQCALKAIAIQkgCxAnIAkiCw0ACwsgPCA+kiA9kiE+IBJBAWoiEiAbRw0ACwsgDSgCkAEiCUUNAANAIAkoAgAhCyAJECcgCyIJDQALCyAAQZQDaiIQIABBAiAPIFAgQCBAECU4AgAgAEGYA2oiESAAQQAgDyBRIEcgQBAlOAIAAkAgEEGBAiATQQN0dkEBcUECdGoCfQJAIB5BAUcEQCAALQAXQQNxIglBAkYgHkECR3INAQsgACATIA8gSCBJIEAQJQwBCyAeQQJHIAlBAkdyDQEgSiAAIA8gEyBIIEkgQBB0Ij4gSiAHkiIGIAYgPl4bID4gBiAGIAZcGyAGIAZbID4gPltxGyIGIAYgSl0bIEogBiAGIAZcGyAGIAZbIEogSltxGws4AgALAkAgEEGBAiAWQQN0dkEBcUECdGoCfQJAIBpBAUcEQCAaQQJHIgkgAC0AF0EDcSILQQJGcg0BCyAAIBYgDyBGIEySIE0gQBAlDAELIAkgC0ECR3INASBGIAAgDyAWIEYgTJIgTSBAEHQiByBGIESSIgYgBiAHXhsgByAGIAYgBlwbIAYgBlsgByAHW3EbIgYgBiBGXRsgRiAGIAYgBlwbIAYgBlsgRiBGW3EbCzgCAAsCQCAIRQ0AAkAgAC8AFUGAgANxQYCAAkcNACANQYgBaiAAEDIDQCANKAKMASIJIA0oAogBIgtyRQRAIA0oApABIglFDQIDQCAJKAIAIQsgCRAnIAsiCQ0ACwwCCyALKALsAyALKALoAyILa0ECdSAJTQ0DIAsgCUECdGooAgAiCS8AFUGA4ABxQYDAAEcEQCAJAn8CQAJAAkAgFkECaw4CAAECCyAJQZQDaiEOIBAqAgAgCSoCnAOTIQZBAAwCCyAJQZQDaiEOIBAqAgAgCSoCpAOTIQZBAgwBCyARKgIAIQYCQAJAIBYOAgABCgsgCUGYA2ohDiAGIAkqAqADkyEGQQEMAQsgCUGYA2ohDiAGIAkqAqgDkyEGQQMLQQJ0aiAGIA4qAgCTOAKcAwsgDUGIAWoQLgwACwALAkAgEyAWckEBcUUNACAWQQFxIRQgE0EBcSEVIA1BiAFqIAAQMgNAIA0oAowBIgkgDSgCiAEiC3JFBEAgDSgCkAEiCUUNAgNAIAkoAgAhCyAJECcgCyIJDQALDAILIAsoAuwDIAsoAugDIgtrQQJ1IAlNDQMCQCALIAlBAnRqKAIAIgkvABUgCS0AF0EQdHIiC0GAgDBxQYCAEEYgC0GA4ABxQYDAAEZyDQAgFQRAAn8CfwJAAkACQCATQQFrDgMAAQINCyAJQZgDaiEOIAlBqANqIQtBASESIBEMAwsgCUGUA2ohDkECIRIgCUGcA2oMAQsgCUGUA2ohDkEAIRIgCUGkA2oLIQsgEAshGyAJIBJBAnRqIBsqAgAgDioCAJMgCyoCAJM4ApwDCyAURQ0AAn8CfwJAAkACQCAWQQFrDgMAAQIMCyAJQZgDaiELIAlBqANqIRJBASEXIBEMAwsgCUGUA2ohCyAJQZwDaiESQQIMAQsgCUGUA2ohCyAJQaQDaiESQQALIRcgEAshDiAJIBdBAnRqIA4qAgAgCyoCAJMgEioCAJM4ApwDCyANQYgBahAuDAALAAsgAC8AFUGA4ABxICJBAUZyRQRAIAAtAABBCHFFDQELIAAgACAeIAQgE0EBSxsgDyAKICIgDEMAAAAAQwAAAAAgOyBFEH4aCyANKAJYIglFDQIDQCAJKAIAIQsgCRAnIAsiCQ0ACwwCCxACAAsgABBeCyANQaABaiQADAELECQACyAAIAM6AKgBIAAgACgC9AMoAgw2AqQBIB0NACAKIAooAggiAyAAKAKsASIOQQFqIgkgAyAJSxs2AgggDkEIRgRAIABBADYCrAFBACEOCyAIBH8gAEHwAmoFIAAgDkEBajYCrAEgACAOQRhsakGwAWoLIgMgBTYCDCADIAQ2AgggAyACOAIEIAMgATgCACADIAAqApQDOAIQIAMgACoCmAM4AhRBACEdCyAIBEAgACAAKQKUAzcCjAMgACAALQAAIgNBAXIiBEH7AXEgBCADQQRxGzoAAAsgACAMNgKgASArIB1Fcgs1AQF/IAEgACgCBCICQQF1aiEBIAAoAgAhACABIAJBAXEEfyABKAIAIABqKAIABSAACxECAAt9ACAAQRRqIgAgAUGBAiACQQN0dkH/AXEgAyAEEC0gACACQQEgBBAiIAAgAkEBIAQQIZKSIQQCQAJAAkACQCAFKAIADgMAAQADCyAGKgIAIgMgAyAEIAMgBF0bIAQgBFwbIQQMAQsgBCAEXA0BIAVBAjYCAAsgBiAEOAIACwuMAQIBfwF9IAAoAuQDRQRAQwAAAAAPCyAAQfwAaiIBIAAvARwQICICIAJbBEAgASAALwEcECAPCwJAIAAoAvQDLQAIQQFxDQAgASAALwEYECAiAiACXA0AIAEgAC8BGBAgQwAAAABdRQ0AIAEgAC8BGBAgjA8LQwAAgD9DAAAAACAAKAL0Ay0ACEEBcRsLcAIBfwF9IwBBEGsiBCQAIARBCGogACABQQJ0QdwlaigCACACEChDAADAfyEFAkACQAJAIAQtAAxBAWsOAgABAgsgBCoCCCEFDAELIAQqAgggA5RDCtcjPJQhBQsgBEEQaiQAIAVDAAAAACAFIAVbGwtHAQF/IAIvAAYiA0EHcQRAIAAgAUHoAGogAxAfDwsgAUHoAGohASACLwAOIgNBB3EEQCAAIAEgAxAfDwsgACABIAIvABAQHwtHAQF/IAIvAAIiA0EHcQRAIAAgAUHoAGogAxAfDwsgAUHoAGohASACLwAOIgNBB3EEQCAAIAEgAxAfDwsgACABIAIvABAQHwt7AAJAAkACQAJAIANBAWsOAgABAgsgAi8ACiIDQQdxRQ0BDAILIAIvAAgiA0EHcUUNAAwBCyACLwAEIgNBB3EEQAwBCyABQegAaiEBIAIvAAwiA0EHcQRAIAAgASADEB8PCyAAIAEgAi8AEBAfDwsgACABQegAaiADEB8LewACQAJAAkACQCADQQFrDgIAAQILIAIvAAgiA0EHcUUNAQwCCyACLwAKIgNBB3FFDQAMAQsgAi8AACIDQQdxBEAMAQsgAUHoAGohASACLwAMIgNBB3EEQCAAIAEgAxAfDwsgACABIAIvABAQHw8LIAAgAUHoAGogAxAfC84BAgN/An0jAEEQayIDJABBASEEIANBCGogAEH8AGoiBSAAIAFBAXRqQe4AaiIBLwEAEB8CQAJAIAMqAggiByACKgIAIgZcBEAgByAHWwRAIAItAAQhAgwCCyAGIAZcIQQLIAItAAQhAiAERQ0AIAMtAAwgAkH/AXFGDQELIAUgASAGIAIQOQNAIAAtAAAiAUEEcQ0BIAAgAUEEcjoAACAAKAIQIgEEQCAAIAERAAALIABBgICA/gc2ApwBIAAoAuQDIgANAAsLIANBEGokAAuFAQIDfwF+AkAgAEKAgICAEFQEQCAAIQUMAQsDQCABQQFrIgEgAEIKgCIFQvYBfiAAfKdBMHI6AAAgAEL/////nwFWIQIgBSEAIAINAAsLIAWnIgIEQANAIAFBAWsiASACQQpuIgNB9gFsIAJqQTByOgAAIAJBCUshBCADIQIgBA0ACwsgAQs3AQJ/QQQQHiICIAE2AgBBBBAeIgMgATYCAEHBOyAAQeI7QfooQb8BIAJB4jtB/ihBwAEgAxAHCw8AIAAgASACQQFBAhCLAQteAQF/IABBADYCDCAAIAM2AhACQCABBEAgAUGAgICABE8NASABQQJ0EB4hBAsgACAENgIAIAAgBCACQQJ0aiICNgIIIAAgBCABQQJ0ajYCDCAAIAI2AgQgAA8LEFgAC3kCAX8BfSMAQRBrIgMkACADQQhqIAAgAUECdEHcJWooAgAgAhBTQwAAwH8hBAJAAkACQCADLQAMQQFrDgIAAQILIAMqAgghBAwBCyADKgIIQwAAAACUQwrXIzyUIQQLIANBEGokACAEQwAAAACXQwAAAAAgBCAEWxsLnAoBC38jAEEQayIIJAAgASABLwAAQXhxIANyIgM7AAACQAJAAkACQAJAAkACQAJAAkACQCADQQhxBEAgA0H//wNxIgZBBHYhBCAGQT9NBH8gACAEQQJ0akEEagUgBEEEayIEIAAoAhgiACgCBCAAKAIAIgBrQQJ1Tw0CIAAgBEECdGoLIAI4AgAMCgsCfyACi0MAAABPXQRAIAKoDAELQYCAgIB4CyIEQf8PakH+H0sgBLIgAlxyRQRAIANBD3FBACAEa0GAEHIgBCACQwAAAABdG0EEdHIhAwwKCyAAIAAvAQAiC0EBajsBACALQYAgTw0DIAtBA00EQCAAIAtBAnRqIAI4AgQMCQsgACgCGCIDRQRAQRgQHiIDQgA3AgAgA0IANwIQIANCADcCCCAAIAM2AhgLAkAgAygCBCIEIAMoAghHBEAgBCACOAIAIAMgBEEEajYCBAwBCyAEIAMoAgAiB2siBEECdSIJQQFqIgZBgICAgARPDQECf0H/////AyAEQQF1IgUgBiAFIAZLGyAEQfz///8HTxsiBkUEQEEAIQUgCQwBCyAGQYCAgIAETw0GIAZBAnQQHiEFIAMoAgQgAygCACIHayIEQQJ1CyEKIAUgCUECdGoiCSACOAIAIAkgCkECdGsgByAEEDMhByADIAUgBkECdGo2AgggAyAJQQRqNgIEIAMoAgAhBCADIAc2AgAgBEUNACAEECMLIAAoAhgiBigCECIDIAYoAhQiAEEFdEcNByADQQFqQQBIDQAgA0H+////A0sNASADIABBBnQiACADQWBxQSBqIgQgACAESxsiAE8NByAAQQBODQILEAIAC0H/////ByEAIANB/////wdPDQULIAhBADYCCCAIQgA3AwAgCCAAEJ8BIAYoAgwhBCAIIAgoAgQiByAGKAIQIgBBH3FqIABBYHFqIgM2AgQgB0UEQCADQQFrIQUMAwsgA0EBayIFIAdBAWtzQR9LDQIgCCgCACEKDAMLQZUlQeEXQSJB3BcQCwALEFgACyAIKAIAIgogBUEFdkEAIANBIU8bQQJ0akEANgIACyAKIAdBA3ZB/P///wFxaiEDAkAgB0EfcSIHRQRAIABBAEwNASAAQSBtIQUgAEEfakE/TwRAIAMgBCAFQQJ0EDMaCyAAIAVBBXRrIgBBAEwNASADIAVBAnQiBWoiAyADKAIAQX9BICAAa3YiAEF/c3EgBCAFaigCACAAcXI2AgAMAQsgAEEATA0AQX8gB3QhDEEgIAdrIQkgAEEgTgRAIAxBf3MhDSADKAIAIQUDQCADIAUgDXEgBCgCACIFIAd0cjYCACADIAMoAgQgDHEgBSAJdnIiBTYCBCAEQQRqIQQgA0EEaiEDIABBP0shDiAAQSBrIQAgDg0ACyAAQQBMDQELIAMgAygCAEF/IAkgCSAAIAAgCUobIgVrdiAMcUF/c3EgBCgCAEF/QSAgAGt2cSIEIAd0cjYCACAAIAVrIgBBAEwNACADIAUgB2pBA3ZB/P///wFxaiIDIAMoAgBBf0EgIABrdkF/c3EgBCAFdnI2AgALIAYoAgwhACAGIAo2AgwgBiAIKAIEIgM2AhAgBiAIKAIINgIUIABFDQAgABAjIAYoAhAhAwsgBiADQQFqNgIQIAYoAgwgA0EDdkH8////AXFqIgAgACgCAEF+IAN3cTYCACABLwAAIQMLIANBB3EgC0EEdHJBCHIhAwsgASADOwAAIAhBEGokAAuPAQIBfwF9IwBBEGsiAyQAIANBCGogAEHoAGogAEHUAEHWACABQf4BcUECRhtqLwEAIgEgAC8BWCABQQdxGxAfQwAAwH8hBAJAAkACQCADLQAMQQFrDgIAAQILIAMqAgghBAwBCyADKgIIIAKUQwrXIzyUIQQLIANBEGokACAEQwAAAACXQwAAAAAgBCAEWxsL2AICBH8BfSMAQSBrIgMkAAJAIAAoAgwiAQRAIAAgACoClAMgACoCmAMgAREnACIFIAVbDQEgA0GqHjYCACAAQQVB2CUgAxAsECQACyADQRBqIAAQMgJAIAMoAhAiAiADKAIUIgFyRQ0AAkADQCABIAIoAuwDIAIoAugDIgJrQQJ1SQRAIAIgAUECdGooAgAiASgC3AMNAyABLwAVIAEtABdBEHRyIgJBgOAAcUGAwABHBEAgAkEIdkEPcSICBH8gAgUgAC0AFUEEdgtBBUYEQCAALQAUQQhxDQQLIAEtAABBAnENAyAEIAEgBBshBAsgA0EQahAuIAMoAhQiASADKAIQIgJyDQEMAwsLEAIACyABIQQLIAMoAhgiAQRAA0AgASgCACECIAEQIyACIgENAAsLIARFBEAgACoCmAMhBQwBCyAEEE4gBCoCoAOSIQULIANBIGokACAFC6EDAQh/AkAgACgC6AMiBSAAKALsAyIHRwRAA0AgACAFKAIAIgIoAuQDRwRAAkAgACgC9AMoAgAiAQRAIAIgACAGIAERBgAiAQ0BC0GIBBAeIgEgAigCEDYCECABIAIpAgg3AgggASACKQIANwIAIAFBFGogAkEUakHoABArGiABQgA3AoABIAFB/ABqIgNBADsBACABQgA3AogBIAFCADcCkAEgAyACQfwAahCgASABQZgBaiACQZgBakHQAhArGiABQQA2AvADIAFCADcC6AMgAigC7AMiAyACKALoAyIERwRAIAMgBGsiBEEASA0FIAEgBBAeIgM2AuwDIAEgAzYC6AMgASADIARqNgLwAyACKALoAyIEIAIoAuwDIghHBEADQCADIAQoAgA2AgAgA0EEaiEDIARBBGoiBCAIRw0ACwsgASADNgLsAwsgASACKQL0AzcC9AMgASACKAKEBDYChAQgASACKQL8AzcC/AMgAUEANgLkAwsgBSABNgIAIAEgADYC5AMLIAZBAWohBiAFQQRqIgUgB0cNAAsLDwsQAgALUAACQAJAAkACQAJAIAIOBAQAAQIDCyAAIAEgAUEwahBDDwsgACABIAFBMGogAxBEDwsgACABIAFBMGoQQg8LECQACyAAIAEgAUEwaiADEEULcAIBfwF9IwBBEGsiBCQAIARBCGogACABQQJ0QdwlaigCACACEDZDAADAfyEFAkACQAJAIAQtAAxBAWsOAgABAgsgBCoCCCEFDAELIAQqAgggA5RDCtcjPJQhBQsgBEEQaiQAIAVDAAAAACAFIAVbGwt5AgF/AX0jAEEQayIDJAAgA0EIaiAAIAFBAnRB7CVqKAIAIAIQU0MAAMB/IQQCQAJAAkAgAy0ADEEBaw4CAAECCyADKgIIIQQMAQsgAyoCCEMAAAAAlEMK1yM8lCEECyADQRBqJAAgBEMAAAAAl0MAAAAAIAQgBFsbC1QAAkACQAJAAkACQCACDgQEAAECAwsgACABIAFBwgBqEEMPCyAAIAEgAUHCAGogAxBEDwsgACABIAFBwgBqEEIPCxAkAAsgACABIAFBwgBqIAMQRQsvACAAIAJFQQF0IgIgASADEGAgACACIAEQS5IgACACIAEgAxB/IAAgAiABEFKSkgvOAQIDfwJ9IwBBEGsiAyQAQQEhBCADQQhqIABB/ABqIgUgACABQQF0akH2AGoiAS8BABAfAkACQCADKgIIIgcgAioCACIGXARAIAcgB1sEQCACLQAEIQIMAgsgBiAGXCEECyACLQAEIQIgBEUNACADLQAMIAJB/wFxRg0BCyAFIAEgBiACEDkDQCAALQAAIgFBBHENASAAIAFBBHI6AAAgACgCECIBBEAgACABEQAACyAAQYCAgP4HNgKcASAAKALkAyIADQALCyADQRBqJAALzgECA38CfSMAQRBrIgMk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AWsOAgABAgsgBCoCCCEFDAELIAQqAgggA5RDCtcjPJQhBQsgBEEQaiQAIAVDAAAAACAFIAVbGwscACAAIAFBCCACpyACQiCIpyADpyADQiCIpxAVCwUAEFgACzkAIABFBEBBAA8LAn8gAUGAf3FBgL8DRiABQf8ATXJFBEBB/DtBGTYCAEF/DAELIAAgAToAAEEBCwvEAgACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCABQQlrDhIACgsMCgsCAwQFDAsMDAoLBwgJCyACIAIoAgAiAUEEajYCACAAIAEoAgA2AgAPCwALIAIgAigCACIBQQRqNgIAIAAgATIBADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATMBADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATAAADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATEAADcDAA8LAAsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsgACACIAMRAQALDwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMAC84BAgN/An0jAEEQayIDJABBASEEIANBCGogAEH8AGoiBSAAIAFBAXRqQegAaiIBLwEAEB8CQAJAIAMqAggiByACKgIAIgZcBEAgByAHWwRAIAItAAQhAgwCCyAGIAZcIQQLIAItAAQhAiAERQ0AIAMtAAwgAkH/AXFGDQELIAUgASAGIAIQOQNAIAAtAAAiAUEEcQ0BIAAgAUEEcjoAACAAKAIQIgEEQCAAIAERAAALIABBgICA/gc2ApwBIAAoAuQDIgANAAsLIANBEGokAAtdAQR/IAAoAgAhAgNAIAIsAAAiAxBXBEBBfyEEIAAgAkEBaiICNgIAIAFBzJmz5gBNBH9BfyADQTBrIgMgAUEKbCIEaiADIARB/////wdzShsFIAQLIQEMAQsLIAELrhQCEn8BfiMAQdAAayIIJAAgCCABNgJMIAhBN2ohFyAIQThqIRQCQAJAAkACQANAIAEhDSAHIA5B/////wdzSg0BIAcgDmohDgJAAkACQCANIgctAAAiCQRAA0ACQAJAIAlB/wFxIgFFBEAgByEBDAELIAFBJUcNASAH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IQEgAEIANwIEIAAgATYCACABIAA2AgQgAkEQaiQAIAALGwEBfyAABEAgACgCACIBBEAgARAjCyAAECMLC0kBAn9BBBAeIQFBIBAeIgBBADYCHCAAQoCAgICAgIDAPzcCFCAAQgA3AgwgAEEAOgAIIABBAzYCBCAAQQA2AgAgASAANgIAIAELIAAgAkEFR0EAIAIbRQRAQbgwIAMgBBBJDwsgAyAEEHALIgEBfiABIAKtIAOtQiCGhCAEIAARFQAiBUIgiKckASAFpwuoAQEFfyAAKAJUIgMoAgAhBSADKAIEIgQgACgCFCAAKAIcIgdrIgYgBCAGSRsiBgRAIAUgByAGECsaIAMgAygCACAGaiIFNgIAIAMgAygCBCAGayIENgIECyAEIAIgAiAESxsiBARAIAUgASAEECsaIAMgAygCACAEaiIFNgIAIAMgAygCBCAEazYCBAsgBUEAOgAAIAAgACgCLCIBNgIcIAAgATYCFCACCwQAQgALBABBAAuKBQIGfgJ/IAEgASgCAEEHakF4cSIBQRBqNgIAIAAhCSABKQMAIQMgASkDCCEGIwBBIGsiCCQAAkAgBkL///////////8AgyIEQoCAgICAgMCAPH0gBEKAgICAgIDA/8MAfVQEQCAGQgSGIANCPIiEIQQgA0L//////////w+DIgNCgYCAgICAgIAIWgRAIARCgYCAgICAgIDAAHwhAgwCCyAEQoCAgICAgICAQH0hAiADQoCAgICAgICACFINASACIARCAYN8IQIMAQsgA1AgBEKAgICAgIDA//8AVCAEQoCAgICAgMD//wBRG0UEQCAGQgSGIANCPIiEQv////////8Dg0KAgICAgICA/P8AhCECDAELQoCAgICAgID4/wAhAiAEQv///////7//wwBWDQBCACECIARCMIinIgBBkfcASQ0AIAMhAiAGQv///////z+DQoCAgICAgMAAhCIFIQcCQCAAQYH3AGsiAUHAAHEEQCACIAFBQGqthiEHQgAhAgwBCyABRQ0AIAcgAa0iBIYgAkHAACABa62IhCEHIAIgBIYhAgsgCCACNwMQIAggBzcDGAJAQYH4ACAAayIAQcAAcQRAIAUgAEFAaq2IIQNCACEFDAELIABFDQAgBUHAACAAa62GIAMgAK0iAoiEIQMgBSACiCEFCyAIIAM3AwAgCCAF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ASAAKAIAIQAgASACQQFxBH8gASgCACAAaigCAAUgAAsRCwALYQECfyMAQRBrIgIkACABIAAoAgQiA0EBdWohASAAKAIAIQAgAiABIANBAXEEfyABKAIAIABqKAIABSAACxEBAEEQEB4iACACKQMINwMIIAAgAikDADcDACACQRBqJAAgAAtjAQJ/IwBBEGsiAyQAIAEgACgCBCIEQQF1aiEBIAAoAgAhACADIAEgAiAEQQFxBH8gASgCACAAaigCAAUgAAsRAwBBEBAeIgAgAykDCDcDCCAAIAMpAwA3AwAgA0EQaiQAIAALNwEBfyABIAAoAgQiA0EBdWohASAAKAIAIQAgASACIANBAXEEfyABKAIAIABqKAIABSAACxEEAAs5AQF/IAEgACgCBCIEQQF1aiEBIAAoAgAhACABIAIgAyAEQQFxBH8gASgCACAAaigCAAUgAAsRCAALCQAgASAAEQIACwUAQcM7Cw8AIAEgACgCAGogAjYCAAsNACABIAAoAgBqKAIACxgBAX9BEBAeIgBCADcDCCAAQQA2AgAgAAsYAQF/QRAQHiIAQgA3AwAgAEIANwMIIAALDABBMBAeQQBBMBAqCzcBAX8gASAAKAIEIgNBAXVqIQEgACgCACEAIAEgAiADQQFxBH8gASgCACAAaigCAAUgAAsRHgALBQBBvjsLIQAgACABKAIAIAEgASwAC0EASBtBuzsgAigCABAQNgIACyoBAX9BDBAeIgFBADoABCABIAAoAgA2AgggAEEANgIAIAFB2Cc2AgAgAQsFAEG7OwsFAEG4OwshACAAIAEoAgAgASABLAALQQBIG0GkOyACKAIAEBA2AgAL2AEBBH8jAEEgayIDJAAgASgCACIEQfD///8HSQRAAkACQCAEQQtPBEAgBEEPckEBaiIFEB4hBiADIAVBgICAgHhyNgIQIAMgBjYCCCADIAQ2AgwgBCAGaiEFDAELIAMgBDoAEyADQQhqIgYgBGohBSAERQ0BCyAGIAFBBGogBBArGgsgBUEAOgAAIAMgAjYCACADQRhqIANBCGogAyAAEQMAIAMoAhgQHSADKAIYIgAQBiADKAIAEAYgAywAE0EASARAIAMoAggQIwsgA0EgaiQAIAAPCxACAAsqAQF/QQwQHiIBQQA6AAQgASAAKAIANgIIIABBADYCACABQeAmNgIA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AkEIaiAIIAYQHyACIAcgAC8AABAfQQEhAyACKgIIIgogAioCACILXAR/IAogClsNAyALIAtcBSADC0UNAiACLQAMIAItAARHDQILIABBAmohAEEBIQMgBCEGQQEhBCAGRQ0ACyABLwB6IgBBB3FFBEAgBS0AekEHcUUNAgsgCCAAECAiCiAHIAUvAHoQICILWw0BIAogClsNACALIAtcDQELIAFBFGogBUEUakHoABArGiABQfwAaiAFQfwAahCgAQNAIAEtAAAiAEEEcQ0BIAEgAEEEcjoAACABKAIQIgAEQCABIAARAAALIAFBgICA/gc2ApwBIAEoAuQDIgENAAsLIAJBEGokAAvGAwEEfyMAQaAEayICJAAgACgCBCEBIABBADYCBCABBEAgASABKAIAKAIEEQAACyAAKAIIIQEgAEEANgIIIAEEQCABIAEoAgAoAgQRAAALAkAgACgCACIAKALoAyAAKALsA0YEQCAAKALkAw0BIAAgAkEYaiAAKAL0AxBcIgEpAgA3AgAgACABKAIQNgIQIAAgASkCCDcCCCAAQRRqIAFBFGpB6AAQKxogACABKQKMATcCjAEgACABKQKEATcChAEgACABKQJ8NwJ8IAEoApQBIQQgAUEANgKUASAAKAKUASEDIAAgBDYClAEgAwRAIAMQWwsgAEGYAWogAUGYAWpB0AIQKxogACgC6AMiAwRAIAAgAzYC7AMgAxAjCyAAIAEoAugDNgLoAyAAIAEoAuwDNgLsAyAAIAEoAvADNgLwAyABQQA2AvADIAFCADcC6AMgACABKQL8AzcC/AMgACABKQL0AzcC9AMgACABKAKEBDYChAQgASgClAEhACABQQA2ApQBIAAEQCAAEFsLIAJBoARqJAAPCyACQfAcNgIQIABBBUHYJSACQRBqECwQJAALIAJB5hE2AgAgAEEFQdglIAIQLBAkAAsLAEEMEB4gABCiAQsLAEEMEB5BABCiAQsNACAAKAIALQAIQQFxCwoAIAAoAgAoAhQLGQAgAUH/AXEEQBACAAsgACgCACgCEEEBcQsYACAAKAIAIgAgAC0ACEH+AXEgAXI6AAgLJgAgASAAKAIAIgAoAhRHBEAgACABNgIUIAAgACgCDEEBajYCDAsLkgEBAn8jAEEQayICJAAgACgCACEAIAFDAAAAAGAEQCABIAAqAhhcBEAgACABOAIYIAAgACgCDEEBajYCDAsgAkEQaiQADwsgAkGIFDYCACMAQRBrIgMkACADIAI2AgwCQCAARQRAQbgwQdglIAIQSRoMAQsgAEEAQQVB2CUgAiAAKAIEEQ0AGgsgA0EQaiQAECQACz8AIAFB/wFxRQRAIAIgACgCACIAKAIQIgFBAXFHBEAgACABQX5xIAJyNgIQIAAgACgCDEEBajYCDAsPCxACAAsL4CYjAEGACAuBHk9ubHkgbGVhZiBub2RlcyB3aXRoIGN1c3RvbSBtZWFzdXJlIGZ1bmN0aW9ucyBzaG91bGQgbWFudWFsbHkgbWFyayB0aGVtc2VsdmVzIGFzIGRpcnR5AGlzRGlydHkAbWFya0RpcnR5AGRlc3Ryb3kAc2V0RGlzcGxheQBnZXREaXNwbGF5AHNldEZsZXgALSsgICAwWDB4AC0wWCswWCAwWC0weCsweCAweABzZXRGbGV4R3JvdwBnZXRGbGV4R3JvdwBzZXRPdmVyZmxvdwBnZXRPdmVyZmxvdwBoYXNOZXdMYXlvdXQAY2FsY3VsYXRlTGF5b3V0AGdldENvbXB1dGVkTGF5b3V0AHVuc2lnbmVkIHNob3J0AGdldENoaWxkQ291bnQAdW5zaWduZWQgaW50AHNldEp1c3RpZnlDb250ZW50AGdldEp1c3RpZnlDb250ZW50AGF2YWlsYWJsZUhlaWdodCBpcyBpbmRlZmluaXRlIHNvIGhlaWdodFNpemluZ01vZGUgbXVzdCBiZSBTaXppbmdNb2RlOjpNYXhDb250ZW50AGF2YWlsYWJsZVdpZHRoIGlzIGluZGVmaW5pdGUgc28gd2lkdGhTaXppbmdNb2RlIG11c3QgYmUgU2l6aW5nTW9kZTo6TWF4Q29udGVudABzZXRBbGlnbkNvbnRlbnQAZ2V0QWxpZ25Db250ZW50AGdldFBhcmVudABpbXBsZW1lbnQAc2V0TWF4SGVpZ2h0UGVyY2VudABzZXRIZWlnaHRQZXJjZW50AHNldE1pbkhlaWdodFBlcmNlbnQAc2V0RmxleEJhc2lzUGVyY2VudABzZXRHYXBQZXJjZW50AHNldFBvc2l0aW9uUGVyY2VudABzZXRNYXJnaW5QZXJjZW50AHNldE1heFdpZHRoUGVyY2VudABzZXRXaWR0aFBlcmNlbnQAc2V0TWluV2lkdGhQZXJjZW50AHNldFBhZGRpbmdQZXJjZW50AGhhbmRsZS50eXBlKCkgPT0gU3R5bGVWYWx1ZUhhbmRsZTo6VHlwZTo6UG9pbnQgfHwgaGFuZGxlLnR5cGUoKSA9PSBTdHlsZVZhbHVlSGFuZGxlOjpUeXBlOjpQZXJjZW50AGNyZWF0ZURlZmF1bHQAdW5pdAByaWdodABoZWlnaHQAc2V0TWF4SGVpZ2h0AGdldE1heEhlaWdodABzZXRIZWlnaHQAZ2V0SGVpZ2h0AHNldE1pbkhlaWdodABnZXRNaW5IZWlnaHQAZ2V0Q29tcHV0ZWRIZWlnaHQAZ2V0Q29tcHV0ZWRSaWdodABsZWZ0AGdldENvbXB1dGVkTGVmdAByZXNldABfX2Rlc3RydWN0AGZsb2F0AHVpbnQ2NF90AHVzZVdlYkRlZmF1bHRzAHNldFVzZVdlYkRlZmF1bHRzAHNldEFsaWduSXRlbXMAZ2V0QWxpZ25JdGVtcwBzZXRGbGV4QmFzaXMAZ2V0RmxleEJhc2lzAENhbm5vdCBnZXQgbGF5b3V0IHByb3BlcnRpZXMgb2YgbXVsdGktZWRnZSBzaG9ydGhhbmRzAHNldFBvaW50U2NhbGVGYWN0b3IATWVhc3VyZUNhbGxiYWNrV3JhcHBlcgBEaXJ0aWVkQ2FsbGJhY2tXcmFwcGVyAENhbm5vdCByZXNldCBhIG5vZGUgc3RpbGwgYXR0YWNoZWQgdG8gYSBvd25lcgBzZXRCb3JkZXIAZ2V0Qm9yZGVyAGdldENvbXB1dGVkQm9yZGVyAGdldE51bWJlcgBoYW5kbGUudHlwZSgpID09IFN0eWxlVmFsdWVIYW5kbGU6OlR5cGU6Ok51bWJlcgB1bnNpZ25lZCBjaGFyAHRvcABnZXRDb21wdXRlZFRvcABzZXRGbGV4V3JhcABnZXRGbGV4V3JhcABzZXRHYXAAZ2V0R2FwACVwAHNldEhlaWdodEF1dG8Ac2V0RmxleEJhc2lzQXV0bwBzZXRQb3NpdGlvbkF1dG8Ac2V0TWFyZ2luQXV0bwBzZXRXaWR0aEF1dG8AU2NhbGUgZmFjdG9yIHNob3VsZCBub3QgYmUgbGVzcyB0aGFuIHplcm8Ac2V0QXNwZWN0UmF0aW8AZ2V0QXNwZWN0UmF0aW8Ac2V0UG9zaXRpb24AZ2V0UG9zaXRpb24Abm90aWZ5T25EZXN0cnVjdGlvbgBzZXRGbGV4RGlyZWN0aW9uAGdldEZsZXhEaXJlY3Rpb24Ac2V0RGlyZWN0aW9uAGdldERpcmVjdGlvbgBzZXRNYXJnaW4AZ2V0TWFyZ2luAGdldENvbXB1dGVkTWFyZ2luAG1hcmtMYXlvdXRTZWVuAG5hbgBib3R0b20AZ2V0Q29tcHV0ZWRCb3R0b20AYm9vbABlbXNjcmlwdGVuOjp2YWwAc2V0RmxleFNocmluawBnZXRGbGV4U2hyaW5rAHNldEFsd2F5c0Zvcm1zQ29udGFpbmluZ0Jsb2NrAE1lYXN1cmVDYWxsYmFjawBEaXJ0aWVkQ2FsbGJhY2sAZ2V0TGVuZ3RoAHdpZHRoAHNldE1heFdpZHRoAGdldE1heFdpZHRoAHNldFdpZHRoAGdldFdpZHRoAHNldE1pbldpZHRoAGdldE1pbldpZHRoAGdldENvbXB1dGVkV2lkdGgAcHVzaAAvaG9tZS9ydW5uZXIvd29yay95b2dhL3lvZ2EvamF2YXNjcmlwdC8uLi95b2dhL3N0eWxlL1NtYWxsVmFsdWVCdWZmZXIuaAAvaG9tZS9ydW5uZXIvd29yay95b2dhL3lvZ2EvamF2YXNjcmlwdC8uLi95b2dhL3N0eWxlL1N0eWxlVmFsdWVQb29sLmgAdW5zaWduZWQgbG9uZwBzZXRCb3hTaXppbmcAZ2V0Qm94U2l6aW5nAHN0ZDo6d3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBzZXRQYWRkaW5nAGdldFBhZGRpbmcAZ2V0Q29tcHV0ZWRQYWRkaW5nAFRyaWVkIHRvIGNvbnN0cnVjdCBZR05vZGUgd2l0aCBudWxsIGNvbmZpZwBBdHRlbXB0aW5nIHRvIGNvbnN0cnVjdCBOb2RlIHdpdGggbnVsbCBjb25maWcAY3JlYXRlV2l0aENvbmZpZwBpbmYAc2V0QWxpZ25TZWxmAGdldEFsaWduU2VsZgBTaXplAHZhbHVlAFZhbHVlAGNyZWF0ZQBtZWFzdXJlAHNldFBvc2l0aW9uVHlwZQBnZXRQb3NpdGlvblR5cGUAaXNSZWZlcmVuY2VCYXNlbGluZQBzZXRJc1JlZmVyZW5jZUJhc2VsaW5lAGNvcHlTdHlsZQBkb3VibGUATm9kZQBleHRlbmQAaW5zZXJ0Q2hpbGQAZ2V0Q2hpbGQAcmVtb3ZlQ2hpbGQAdm9pZABzZXRFeHBlcmltZW50YWxGZWF0dXJlRW5hYmxlZABpc0V4cGVyaW1lbnRhbEZlYXR1cmVFbmFibGVkAGRpcnRpZWQAQ2Fubm90IHJlc2V0IGEgbm9kZSB3aGljaCBzdGlsbCBoYXMgY2hpbGRyZW4gYXR0YWNoZWQAdW5zZXRNZWFzdXJlRnVuYwB1bnNldERpcnRpZWRGdW5jAHNldEVycmF0YQBnZXRFcnJhdGEATWVhc3VyZSBmdW5jdGlvbiByZXR1cm5lZCBhbiBpbnZhbGlkIGRpbWVuc2lvbiB0byBZb2dhOiBbd2lkdGg9JWYsIGhlaWdodD0lZl0ARXhwZWN0IGN1c3RvbSBiYXNlbGluZSBmdW5jdGlvbiB0byBub3QgcmV0dXJuIE5hTgBOQU4ASU5GAGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4Ac3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVk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", !ne(kA)) {
        var Z = kA;
        kA = t.locateFile ? t.locateFile(Z, o) : o + Z;
      }
      function eA() {
        var l2 = kA;
        try {
          if (l2 == kA && g2) return new Uint8Array(g2);
          if (ne(l2)) try {
            var c2 = El(l2.slice(37)), Q = new Uint8Array(c2.length);
            for (l2 = 0; l2 < c2.length; ++l2) Q[l2] = c2.charCodeAt(l2);
            var d2 = Q;
          } catch {
            throw Error("Converting base64 string to bytes failed.");
          }
          else d2 = void 0;
          var y = d2;
          if (y) return y;
          throw "both async and sync fetching of the wasm failed";
        } catch (k) {
          MA(k);
        }
      }
      function YA() {
        return g2 || typeof fetch != "function" ? Promise.resolve().then(function() {
          return eA();
        }) : fetch(kA, { credentials: "same-origin" }).then(function(l2) {
          if (!l2.ok) throw "failed to load wasm binary file at '" + kA + "'";
          return l2.arrayBuffer();
        }).catch(function() {
          return eA();
        });
      }
      function FA(l2) {
        for (; 0 < l2.length; ) l2.shift()(t);
      }
      function LA(l2) {
        if (l2 === void 0) return "_unknown";
        l2 = l2.replace(/[^a-zA-Z0-9_]/g, "$");
        var c2 = l2.charCodeAt(0);
        return 48 <= c2 && 57 >= c2 ? "_" + l2 : l2;
      }
      function QA(l2, c2) {
        return l2 = LA(l2), function() {
          return c2.apply(this, arguments);
        };
      }
      var GA = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }], HA = [];
      function gA(l2) {
        var c2 = Error, Q = QA(l2, function(d2) {
          this.name = l2, this.message = d2, d2 = Error(d2).stack, d2 !== void 0 && (this.stack = this.toString() + `
` + d2.replace(/^Error(:[^\n]*)?\n/, ""));
        });
        return Q.prototype = Object.create(c2.prototype), Q.prototype.constructor = Q, Q.prototype.toString = function() {
          return this.message === void 0 ? this.name : this.name + ": " + this.message;
        }, Q;
      }
      var uA = void 0;
      function J(l2) {
        throw new uA(l2);
      }
      var SA = (l2) => (l2 || J("Cannot use deleted val. handle = " + l2), GA[l2].value), CA = (l2) => {
        switch (l2) {
          case void 0:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default:
            var c2 = HA.length ? HA.pop() : GA.length;
            return GA[c2] = { ga: 1, value: l2 }, c2;
        }
      }, vA = void 0, NA = void 0;
      function cA(l2) {
        for (var c2 = ""; p[l2]; ) c2 += NA[p[l2++]];
        return c2;
      }
      var TA = [];
      function OA() {
        for (; TA.length; ) {
          var l2 = TA.pop();
          l2.M.$ = false, l2.delete();
        }
      }
      var Y = void 0, oA = {};
      function xe(l2, c2) {
        for (c2 === void 0 && J("ptr should not be undefined"); l2.R; ) c2 = l2.ba(c2), l2 = l2.R;
        return c2;
      }
      var ke = {};
      function Yt(l2) {
        l2 = Us(l2);
        var c2 = cA(l2);
        return He(l2), c2;
      }
      function ot(l2, c2) {
        var Q = ke[l2];
        return Q === void 0 && J(c2 + " has unknown type " + Yt(l2)), Q;
      }
      function wt() {
      }
      var Dt = false;
      function st(l2) {
        --l2.count.value, l2.count.value === 0 && (l2.T ? l2.U.W(l2.T) : l2.P.N.W(l2.O));
      }
      function ve(l2, c2, Q) {
        return c2 === Q ? l2 : Q.R === void 0 ? null : (l2 = ve(l2, c2, Q.R), l2 === null ? null : Q.na(l2));
      }
      var pe = {};
      function ae(l2, c2) {
        return c2 = xe(l2, c2), oA[c2];
      }
      var at = void 0;
      function qA(l2) {
        throw new at(l2);
      }
      function he(l2, c2) {
        return c2.P && c2.O || qA("makeClassHandle requires ptr and ptrType"), !!c2.U != !!c2.T && qA("Both smartPtrType and smartPtr must be specified"), c2.count = { value: 1 }, me(Object.create(l2, { M: { value: c2 } }));
      }
      function me(l2) {
        return typeof FinalizationRegistry > "u" ? (me = (c2) => c2, l2) : (Dt = new FinalizationRegistry((c2) => {
          st(c2.M);
        }), me = (c2) => {
          var Q = c2.M;
          return Q.T && Dt.register(c2, { M: Q }, c2), c2;
        }, wt = (c2) => {
          Dt.unregister(c2);
        }, me(l2));
      }
      var gt = {};
      function ze(l2) {
        for (; l2.length; ) {
          var c2 = l2.pop();
          l2.pop()(c2);
        }
      }
      function XA(l2) {
        return this.fromWireType(w2[l2 >> 2]);
      }
      var ge = {}, ie = {};
      function ye(l2, c2, Q) {
        function d2(M) {
          M = Q(M), M.length !== l2.length && qA("Mismatched type converter count");
          for (var U = 0; U < l2.length; ++U) X(l2[U], M[U]);
        }
        l2.forEach(function(M) {
          ie[M] = c2;
        });
        var y = Array(c2.length), k = [], N = 0;
        c2.forEach((M, U) => {
          ke.hasOwnProperty(M) ? y[U] = ke[M] : (k.push(M), ge.hasOwnProperty(M) || (ge[M] = []), ge[M].push(() => {
            y[U] = ke[M], ++N, N === k.length && d2(y);
          }));
        }), k.length === 0 && d2(y);
      }
      function z(l2) {
        switch (l2) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError("Unknown type size: " + l2);
        }
      }
      function X(l2, c2, Q = {}) {
        if (!("argPackAdvance" in c2)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
        var d2 = c2.name;
        if (l2 || J('type "' + d2 + '" must have a positive integer typeid pointer'), ke.hasOwnProperty(l2)) {
          if (Q.ua) return;
          J("Cannot register type '" + d2 + "' twice");
        }
        ke[l2] = c2, delete ie[l2], ge.hasOwnProperty(l2) && (c2 = ge[l2], delete ge[l2], c2.forEach((y) => y()));
      }
      function fA(l2) {
        J(l2.M.P.N.name + " instance already deleted");
      }
      function j() {
      }
      function mA(l2, c2, Q) {
        if (l2[c2].S === void 0) {
          var d2 = l2[c2];
          l2[c2] = function() {
            return l2[c2].S.hasOwnProperty(arguments.length) || J("Function '" + Q + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + l2[c2].S + ")!"), l2[c2].S[arguments.length].apply(this, arguments);
          }, l2[c2].S = [], l2[c2].S[d2.Z] = d2;
        }
      }
      function IA(l2, c2) {
        t.hasOwnProperty(l2) ? (J("Cannot register public name '" + l2 + "' twice"), mA(t, l2, l2), t.hasOwnProperty(void 0) && J("Cannot register multiple overloads of a function with the same number of arguments (undefined)!"), t[l2].S[void 0] = c2) : t[l2] = c2;
      }
      function yA(l2, c2, Q, d2, y, k, N, M) {
        this.name = l2, this.constructor = c2, this.X = Q, this.W = d2, this.R = y, this.pa = k, this.ba = N, this.na = M, this.ja = [];
      }
      function tA(l2, c2, Q) {
        for (; c2 !== Q; ) c2.ba || J("Expected null or instance of " + Q.name + ", got an instance of " + c2.name), l2 = c2.ba(l2), c2 = c2.R;
        return l2;
      }
      function rA(l2, c2) {
        return c2 === null ? (this.ea && J("null is not a valid " + this.name), 0) : (c2.M || J('Cannot pass "' + jA(c2) + '" as a ' + this.name), c2.M.O || J("Cannot pass deleted object as a pointer of type " + this.name), tA(c2.M.O, c2.M.P.N, this.N));
      }
      function ue(l2, c2) {
        if (c2 === null) {
          if (this.ea && J("null is not a valid " + this.name), this.da) {
            var Q = this.fa();
            return l2 !== null && l2.push(this.W, Q), Q;
          }
          return 0;
        }
        if (c2.M || J('Cannot pass "' + jA(c2) + '" as a ' + this.name), c2.M.O || J("Cannot pass deleted object as a pointer of type " + this.name), !this.ca && c2.M.P.ca && J("Cannot convert argument of type " + (c2.M.U ? c2.M.U.name : c2.M.P.name) + " to parameter type " + this.name), Q = tA(c2.M.O, c2.M.P.N, this.N), this.da) switch (c2.M.T === void 0 && J("Passing raw pointer to smart pointer is illegal"), this.Ba) {
          case 0:
            c2.M.U === this ? Q = c2.M.T : J("Cannot convert argument of type " + (c2.M.U ? c2.M.U.name : c2.M.P.name) + " to parameter type " + this.name);
            break;
          case 1:
            Q = c2.M.T;
            break;
          case 2:
            if (c2.M.U === this) Q = c2.M.T;
            else {
              var d2 = c2.clone();
              Q = this.xa(Q, CA(function() {
                d2.delete();
              })), l2 !== null && l2.push(this.W, Q);
            }
            break;
          default:
            J("Unsupporting sharing policy");
        }
        return Q;
      }
      function $(l2, c2) {
        return c2 === null ? (this.ea && J("null is not a valid " + this.name), 0) : (c2.M || J('Cannot pass "' + jA(c2) + '" as a ' + this.name), c2.M.O || J("Cannot pass deleted object as a pointer of type " + this.name), c2.M.P.ca && J("Cannot convert argument of type " + c2.M.P.name + " to parameter type " + this.name), tA(c2.M.O, c2.M.P.N, this.N));
      }
      function PA(l2, c2, Q, d2) {
        this.name = l2, this.N = c2, this.ea = Q, this.ca = d2, this.da = false, this.W = this.xa = this.fa = this.ka = this.Ba = this.wa = void 0, c2.R !== void 0 ? this.toWireType = ue : (this.toWireType = d2 ? rA : $, this.V = null);
      }
      function VA(l2, c2) {
        t.hasOwnProperty(l2) || qA("Replacing nonexistant public symbol"), t[l2] = c2, t[l2].Z = void 0;
      }
      function qt(l2, c2) {
        var Q = [];
        return function() {
          if (Q.length = 0, Object.assign(Q, arguments), l2.includes("j")) {
            var d2 = t["dynCall_" + l2];
            d2 = Q && Q.length ? d2.apply(null, [c2].concat(Q)) : d2.call(null, c2);
          } else d2 = F.get(c2).apply(null, Q);
          return d2;
        };
      }
      function RA(l2, c2) {
        l2 = cA(l2);
        var Q = l2.includes("j") ? qt(l2, c2) : F.get(c2);
        return typeof Q != "function" && J("unknown function pointer with signature " + l2 + ": " + c2), Q;
      }
      var ut = void 0;
      function WA(l2, c2) {
        function Q(k) {
          y[k] || ke[k] || (ie[k] ? ie[k].forEach(Q) : (d2.push(k), y[k] = true));
        }
        var d2 = [], y = {};
        throw c2.forEach(Q), new ut(l2 + ": " + d2.map(Yt).join([", "]));
      }
      function Ue(l2, c2, Q, d2, y) {
        var k = c2.length;
        2 > k && J("argTypes array size mismatch! Must at least get return value and 'this' types!");
        var N = c2[1] !== null && Q !== null, M = false;
        for (Q = 1; Q < c2.length; ++Q) if (c2[Q] !== null && c2[Q].V === void 0) {
          M = true;
          break;
        }
        var U = c2[0].name !== "void", G = k - 2, O = Array(G), q = [], nA = [];
        return function() {
          if (arguments.length !== G && J("function " + l2 + " called with " + arguments.length + " arguments, expected " + G + " args!"), nA.length = 0, q.length = N ? 2 : 1, q[0] = y, N) {
            var UA = c2[1].toWireType(nA, this);
            q[1] = UA;
          }
          for (var BA = 0; BA < G; ++BA) O[BA] = c2[BA + 2].toWireType(nA, arguments[BA]), q.push(O[BA]);
          if (BA = d2.apply(null, q), M) ze(nA);
          else for (var oe = N ? 1 : 2; oe < c2.length; oe++) {
            var De = oe === 1 ? UA : O[oe - 2];
            c2[oe].V !== null && c2[oe].V(De);
          }
          return UA = U ? c2[0].fromWireType(BA) : void 0, UA;
        };
      }
      function wA(l2, c2) {
        for (var Q = [], d2 = 0; d2 < l2; d2++) Q.push(b[c2 + 4 * d2 >> 2]);
        return Q;
      }
      function xA(l2) {
        4 < l2 && --GA[l2].ga === 0 && (GA[l2] = void 0, HA.push(l2));
      }
      function jA(l2) {
        if (l2 === null) return "null";
        var c2 = typeof l2;
        return c2 === "object" || c2 === "array" || c2 === "function" ? l2.toString() : "" + l2;
      }
      function $A(l2, c2) {
        switch (c2) {
          case 2:
            return function(Q) {
              return this.fromWireType(D[Q >> 2]);
            };
          case 3:
            return function(Q) {
              return this.fromWireType(h2[Q >> 3]);
            };
          default:
            throw new TypeError("Unknown float type: " + l2);
        }
      }
      function Ie(l2, c2, Q) {
        switch (c2) {
          case 0:
            return Q ? function(d2) {
              return C[d2];
            } : function(d2) {
              return p[d2];
            };
          case 1:
            return Q ? function(d2) {
              return m2[d2 >> 1];
            } : function(d2) {
              return x3[d2 >> 1];
            };
          case 2:
            return Q ? function(d2) {
              return w2[d2 >> 2];
            } : function(d2) {
              return b[d2 >> 2];
            };
          default:
            throw new TypeError("Unknown integer type: " + l2);
        }
      }
      function we(l2, c2) {
        for (var Q = "", d2 = 0; !(d2 >= c2 / 2); ++d2) {
          var y = m2[l2 + 2 * d2 >> 1];
          if (y == 0) break;
          Q += String.fromCharCode(y);
        }
        return Q;
      }
      function zA(l2, c2, Q) {
        if (Q === void 0 && (Q = 2147483647), 2 > Q) return 0;
        Q -= 2;
        var d2 = c2;
        Q = Q < 2 * l2.length ? Q / 2 : l2.length;
        for (var y = 0; y < Q; ++y) m2[c2 >> 1] = l2.charCodeAt(y), c2 += 2;
        return m2[c2 >> 1] = 0, c2 - d2;
      }
      function le(l2) {
        return 2 * l2.length;
      }
      function Xt(l2, c2) {
        for (var Q = 0, d2 = ""; !(Q >= c2 / 4); ) {
          var y = w2[l2 + 4 * Q >> 2];
          if (y == 0) break;
          ++Q, 65536 <= y ? (y -= 65536, d2 += String.fromCharCode(55296 | y >> 10, 56320 | y & 1023)) : d2 += String.fromCharCode(y);
        }
        return d2;
      }
      function bt(l2, c2, Q) {
        if (Q === void 0 && (Q = 2147483647), 4 > Q) return 0;
        var d2 = c2;
        Q = d2 + Q - 4;
        for (var y = 0; y < l2.length; ++y) {
          var k = l2.charCodeAt(y);
          if (55296 <= k && 57343 >= k) {
            var N = l2.charCodeAt(++y);
            k = 65536 + ((k & 1023) << 10) | N & 1023;
          }
          if (w2[c2 >> 2] = k, c2 += 4, c2 + 4 > Q) break;
        }
        return w2[c2 >> 2] = 0, c2 - d2;
      }
      function Yr(l2) {
        for (var c2 = 0, Q = 0; Q < l2.length; ++Q) {
          var d2 = l2.charCodeAt(Q);
          55296 <= d2 && 57343 >= d2 && ++Q, c2 += 4;
        }
        return c2;
      }
      var qr = {};
      function Vt(l2) {
        var c2 = qr[l2];
        return c2 === void 0 ? cA(l2) : c2;
      }
      var Xr = [];
      function cl(l2) {
        var c2 = Xr.length;
        return Xr.push(l2), c2;
      }
      function fl2(l2, c2) {
        for (var Q = Array(l2), d2 = 0; d2 < l2; ++d2) Q[d2] = ot(b[c2 + 4 * d2 >> 2], "parameter " + d2);
        return Q;
      }
      var Ls = [], Bl = [null, [], []];
      uA = t.BindingError = gA("BindingError"), t.count_emval_handles = function() {
        for (var l2 = 0, c2 = 5; c2 < GA.length; ++c2) GA[c2] !== void 0 && ++l2;
        return l2;
      }, t.get_first_emval = function() {
        for (var l2 = 5; l2 < GA.length; ++l2) if (GA[l2] !== void 0) return GA[l2];
        return null;
      }, vA = t.PureVirtualError = gA("PureVirtualError");
      for (var Gs = Array(256), Vr = 0; 256 > Vr; ++Vr) Gs[Vr] = String.fromCharCode(Vr);
      NA = Gs, t.getInheritedInstanceCount = function() {
        return Object.keys(oA).length;
      }, t.getLiveInheritedInstances = function() {
        var l2 = [], c2;
        for (c2 in oA) oA.hasOwnProperty(c2) && l2.push(oA[c2]);
        return l2;
      }, t.flushPendingDeletes = OA, t.setDelayFunction = function(l2) {
        Y = l2, TA.length && Y && Y(OA);
      }, at = t.InternalError = gA("InternalError"), j.prototype.isAliasOf = function(l2) {
        if (!(this instanceof j && l2 instanceof j)) return false;
        var c2 = this.M.P.N, Q = this.M.O, d2 = l2.M.P.N;
        for (l2 = l2.M.O; c2.R; ) Q = c2.ba(Q), c2 = c2.R;
        for (; d2.R; ) l2 = d2.ba(l2), d2 = d2.R;
        return c2 === d2 && Q === l2;
      }, j.prototype.clone = function() {
        if (this.M.O || fA(this), this.M.aa) return this.M.count.value += 1, this;
        var l2 = me, c2 = Object, Q = c2.create, d2 = Object.getPrototypeOf(this), y = this.M;
        return l2 = l2(Q.call(c2, d2, { M: { value: { count: y.count, $: y.$, aa: y.aa, O: y.O, P: y.P, T: y.T, U: y.U } } })), l2.M.count.value += 1, l2.M.$ = false, l2;
      }, j.prototype.delete = function() {
        this.M.O || fA(this), this.M.$ && !this.M.aa && J("Object already scheduled for deletion"), wt(this), st(this.M), this.M.aa || (this.M.T = void 0, this.M.O = void 0);
      }, j.prototype.isDeleted = function() {
        return !this.M.O;
      }, j.prototype.deleteLater = function() {
        return this.M.O || fA(this), this.M.$ && !this.M.aa && J("Object already scheduled for deletion"), TA.push(this), TA.length === 1 && Y && Y(OA), this.M.$ = true, this;
      }, PA.prototype.qa = function(l2) {
        return this.ka && (l2 = this.ka(l2)), l2;
      }, PA.prototype.ha = function(l2) {
        this.W && this.W(l2);
      }, PA.prototype.argPackAdvance = 8, PA.prototype.readValueFromPointer = XA, PA.prototype.deleteObject = function(l2) {
        l2 !== null && l2.delete();
      }, PA.prototype.fromWireType = function(l2) {
        function c2() {
          return this.da ? he(this.N.X, { P: this.wa, O: Q, U: this, T: l2 }) : he(this.N.X, { P: this, O: l2 });
        }
        var Q = this.qa(l2);
        if (!Q) return this.ha(l2), null;
        var d2 = ae(this.N, Q);
        if (d2 !== void 0) return d2.M.count.value === 0 ? (d2.M.O = Q, d2.M.T = l2, d2.clone()) : (d2 = d2.clone(), this.ha(l2), d2);
        if (d2 = this.N.pa(Q), d2 = pe[d2], !d2) return c2.call(this);
        d2 = this.ca ? d2.la : d2.pointerType;
        var y = ve(Q, this.N, d2.N);
        return y === null ? c2.call(this) : this.da ? he(d2.N.X, { P: d2, O: y, U: this, T: l2 }) : he(d2.N.X, { P: d2, O: y });
      }, ut = t.UnboundTypeError = gA("UnboundTypeError");
      var El = typeof atob == "function" ? atob : function(l2) {
        var c2 = "", Q = 0;
        l2 = l2.replace(/[^A-Za-z0-9\+\/=]/g, "");
        do {
          var d2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(l2.charAt(Q++)), y = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(l2.charAt(Q++)), k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(l2.charAt(Q++)), N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(l2.charAt(Q++));
          d2 = d2 << 2 | y >> 4, y = (y & 15) << 4 | k >> 2;
          var M = (k & 3) << 6 | N;
          c2 += String.fromCharCode(d2), k !== 64 && (c2 += String.fromCharCode(y)), N !== 64 && (c2 += String.fromCharCode(M));
        } while (Q < l2.length);
        return c2;
      }, Ql = { l: function(l2, c2, Q, d2) {
        MA("Assertion failed: " + (l2 ? f(p, l2) : "") + ", at: " + [c2 ? c2 ? f(p, c2) : "" : "unknown filename", Q, d2 ? d2 ? f(p, d2) : "" : "unknown function"]);
      }, q: function(l2, c2, Q) {
        l2 = cA(l2), c2 = ot(c2, "wrapper"), Q = SA(Q);
        var d2 = [].slice, y = c2.N, k = y.X, N = y.R.X, M = y.R.constructor;
        l2 = QA(l2, function() {
          y.R.ja.forEach(function(G) {
            if (this[G] === N[G]) throw new vA("Pure virtual function " + G + " must be implemented in JavaScript");
          }.bind(this)), Object.defineProperty(this, "__parent", { value: k }), this.__construct.apply(this, d2.call(arguments));
        }), k.__construct = function() {
          this === k && J("Pass correct 'this' to __construct");
          var G = M.implement.apply(void 0, [this].concat(d2.call(arguments)));
          wt(G);
          var O = G.M;
          G.notifyOnDestruction(), O.aa = true, Object.defineProperties(this, { M: { value: O } }), me(this), G = O.O, G = xe(y, G), oA.hasOwnProperty(G) ? J("Tried to register registered instance: " + G) : oA[G] = this;
        }, k.__destruct = function() {
          this === k && J("Pass correct 'this' to __destruct"), wt(this);
          var G = this.M.O;
          G = xe(y, G), oA.hasOwnProperty(G) ? delete oA[G] : J("Tried to unregister unregistered instance: " + G);
        }, l2.prototype = Object.create(k);
        for (var U in Q) l2.prototype[U] = Q[U];
        return CA(l2);
      }, j: function(l2) {
        var c2 = gt[l2];
        delete gt[l2];
        var Q = c2.fa, d2 = c2.W, y = c2.ia, k = y.map((N) => N.ta).concat(y.map((N) => N.za));
        ye([l2], k, (N) => {
          var M = {};
          return y.forEach((U, G) => {
            var O = N[G], q = U.ra, nA = U.sa, UA = N[G + y.length], BA = U.ya, oe = U.Aa;
            M[U.oa] = { read: (De) => O.fromWireType(q(nA, De)), write: (De, zt) => {
              var Oe = [];
              BA(oe, De, UA.toWireType(Oe, zt)), ze(Oe);
            } };
          }), [{ name: c2.name, fromWireType: function(U) {
            var G = {}, O;
            for (O in M) G[O] = M[O].read(U);
            return d2(U), G;
          }, toWireType: function(U, G) {
            for (var O in M) if (!(O in G)) throw new TypeError('Missing field:  "' + O + '"');
            var q = Q();
            for (O in M) M[O].write(q, G[O]);
            return U !== null && U.push(d2, q), q;
          }, argPackAdvance: 8, readValueFromPointer: XA, V: d2 }];
        });
      }, v: function() {
      }, B: function(l2, c2, Q, d2, y) {
        var k = z(Q);
        c2 = cA(c2), X(l2, { name: c2, fromWireType: function(N) {
          return !!N;
        }, toWireType: function(N, M) {
          return M ? d2 : y;
        }, argPackAdvance: 8, readValueFromPointer: function(N) {
          if (Q === 1) var M = C;
          else if (Q === 2) M = m2;
          else if (Q === 4) M = w2;
          else throw new TypeError("Unknown boolean type size: " + c2);
          return this.fromWireType(M[N >> k]);
        }, V: null });
      }, f: function(l2, c2, Q, d2, y, k, N, M, U, G, O, q, nA) {
        O = cA(O), k = RA(y, k), M && (M = RA(N, M)), G && (G = RA(U, G)), nA = RA(q, nA);
        var UA = LA(O);
        IA(UA, function() {
          WA("Cannot construct " + O + " due to unbound types", [d2]);
        }), ye([l2, c2, Q], d2 ? [d2] : [], function(BA) {
          if (BA = BA[0], d2) var oe = BA.N, De = oe.X;
          else De = j.prototype;
          BA = QA(UA, function() {
            if (Object.getPrototypeOf(this) !== zt) throw new uA("Use 'new' to construct " + O);
            if (Oe.Y === void 0) throw new uA(O + " has no accessible constructor");
            var Ts = Oe.Y[arguments.length];
            if (Ts === void 0) throw new uA("Tried to invoke ctor of " + O + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(Oe.Y).toString() + ") parameters instead!");
            return Ts.apply(this, arguments);
          });
          var zt = Object.create(De, { constructor: { value: BA } });
          BA.prototype = zt;
          var Oe = new yA(O, BA, zt, nA, oe, k, M, G);
          oe = new PA(O, Oe, true, false), De = new PA(O + "*", Oe, false, false);
          var Os = new PA(O + " const*", Oe, false, true);
          return pe[l2] = { pointerType: De, la: Os }, VA(UA, BA), [oe, De, Os];
        });
      }, d: function(l2, c2, Q, d2, y, k, N) {
        var M = wA(Q, d2);
        c2 = cA(c2), k = RA(y, k), ye([], [l2], function(U) {
          function G() {
            WA("Cannot call " + O + " due to unbound types", M);
          }
          U = U[0];
          var O = U.name + "." + c2;
          c2.startsWith("@@") && (c2 = Symbol[c2.substring(2)]);
          var q = U.N.constructor;
          return q[c2] === void 0 ? (G.Z = Q - 1, q[c2] = G) : (mA(q, c2, O), q[c2].S[Q - 1] = G), ye([], M, function(nA) {
            return nA = Ue(O, [nA[0], null].concat(nA.slice(1)), null, k, N), q[c2].S === void 0 ? (nA.Z = Q - 1, q[c2] = nA) : q[c2].S[Q - 1] = nA, [];
          }), [];
        });
      }, p: function(l2, c2, Q, d2, y, k) {
        0 < c2 || MA();
        var N = wA(c2, Q);
        y = RA(d2, y), ye([], [l2], function(M) {
          M = M[0];
          var U = "constructor " + M.name;
          if (M.N.Y === void 0 && (M.N.Y = []), M.N.Y[c2 - 1] !== void 0) throw new uA("Cannot register multiple constructors with identical number of parameters (" + (c2 - 1) + ") for class '" + M.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          return M.N.Y[c2 - 1] = () => {
            WA("Cannot construct " + M.name + " due to unbound types", N);
          }, ye([], N, function(G) {
            return G.splice(1, 0, null), M.N.Y[c2 - 1] = Ue(U, G, null, y, k), [];
          }), [];
        });
      }, a: function(l2, c2, Q, d2, y, k, N, M) {
        var U = wA(Q, d2);
        c2 = cA(c2), k = RA(y, k), ye([], [l2], function(G) {
          function O() {
            WA("Cannot call " + q + " due to unbound types", U);
          }
          G = G[0];
          var q = G.name + "." + c2;
          c2.startsWith("@@") && (c2 = Symbol[c2.substring(2)]), M && G.N.ja.push(c2);
          var nA = G.N.X, UA = nA[c2];
          return UA === void 0 || UA.S === void 0 && UA.className !== G.name && UA.Z === Q - 2 ? (O.Z = Q - 2, O.className = G.name, nA[c2] = O) : (mA(nA, c2, q), nA[c2].S[Q - 2] = O), ye([], U, function(BA) {
            return BA = Ue(q, BA, G, k, N), nA[c2].S === void 0 ? (BA.Z = Q - 2, nA[c2] = BA) : nA[c2].S[Q - 2] = BA, [];
          }), [];
        });
      }, A: function(l2, c2) {
        c2 = cA(c2), X(l2, { name: c2, fromWireType: function(Q) {
          var d2 = SA(Q);
          return xA(Q), d2;
        }, toWireType: function(Q, d2) {
          return CA(d2);
        }, argPackAdvance: 8, readValueFromPointer: XA, V: null });
      }, n: function(l2, c2, Q) {
        Q = z(Q), c2 = cA(c2), X(l2, { name: c2, fromWireType: function(d2) {
          return d2;
        }, toWireType: function(d2, y) {
          return y;
        }, argPackAdvance: 8, readValueFromPointer: $A(c2, Q), V: null });
      }, e: function(l2, c2, Q, d2, y) {
        c2 = cA(c2), y === -1 && (y = 4294967295), y = z(Q);
        var k = (M) => M;
        if (d2 === 0) {
          var N = 32 - 8 * Q;
          k = (M) => M << N >>> N;
        }
        Q = c2.includes("unsigned") ? function(M, U) {
          return U >>> 0;
        } : function(M, U) {
          return U;
        }, X(l2, { name: c2, fromWireType: k, toWireType: Q, argPackAdvance: 8, readValueFromPointer: Ie(c2, y, d2 !== 0), V: null });
      }, b: function(l2, c2, Q) {
        function d2(k) {
          k >>= 2;
          var N = b;
          return new y(E, N[k + 1], N[k]);
        }
        var y = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][c2];
        Q = cA(Q), X(l2, { name: Q, fromWireType: d2, argPackAdvance: 8, readValueFromPointer: d2 }, { ua: true });
      }, o: function(l2, c2) {
        c2 = cA(c2);
        var Q = c2 === "std::string";
        X(l2, { name: c2, fromWireType: function(d2) {
          var y = b[d2 >> 2], k = d2 + 4;
          if (Q) for (var N = k, M = 0; M <= y; ++M) {
            var U = k + M;
            if (M == y || p[U] == 0) {
              if (N = N ? f(p, N, U - N) : "", G === void 0) var G = N;
              else G += String.fromCharCode(0), G += N;
              N = U + 1;
            }
          }
          else {
            for (G = Array(y), M = 0; M < y; ++M) G[M] = String.fromCharCode(p[k + M]);
            G = G.join("");
          }
          return He(d2), G;
        }, toWireType: function(d2, y) {
          y instanceof ArrayBuffer && (y = new Uint8Array(y));
          var k, N = typeof y == "string";
          if (N || y instanceof Uint8Array || y instanceof Uint8ClampedArray || y instanceof Int8Array || J("Cannot pass non-string to std::string"), Q && N) {
            var M = 0;
            for (k = 0; k < y.length; ++k) {
              var U = y.charCodeAt(k);
              127 >= U ? M++ : 2047 >= U ? M += 2 : 55296 <= U && 57343 >= U ? (M += 4, ++k) : M += 3;
            }
            k = M;
          } else k = y.length;
          if (M = $n(4 + k + 1), U = M + 4, b[M >> 2] = k, Q && N) {
            if (N = U, U = k + 1, k = p, 0 < U) {
              U = N + U - 1;
              for (var G = 0; G < y.length; ++G) {
                var O = y.charCodeAt(G);
                if (55296 <= O && 57343 >= O) {
                  var q = y.charCodeAt(++G);
                  O = 65536 + ((O & 1023) << 10) | q & 1023;
                }
                if (127 >= O) {
                  if (N >= U) break;
                  k[N++] = O;
                } else {
                  if (2047 >= O) {
                    if (N + 1 >= U) break;
                    k[N++] = 192 | O >> 6;
                  } else {
                    if (65535 >= O) {
                      if (N + 2 >= U) break;
                      k[N++] = 224 | O >> 12;
                    } else {
                      if (N + 3 >= U) break;
                      k[N++] = 240 | O >> 18, k[N++] = 128 | O >> 12 & 63;
                    }
                    k[N++] = 128 | O >> 6 & 63;
                  }
                  k[N++] = 128 | O & 63;
                }
              }
              k[N] = 0;
            }
          } else if (N) for (N = 0; N < k; ++N) G = y.charCodeAt(N), 255 < G && (He(U), J("String has UTF-16 code units that do not fit in 8 bits")), p[U + N] = G;
          else for (N = 0; N < k; ++N) p[U + N] = y[N];
          return d2 !== null && d2.push(He, M), M;
        }, argPackAdvance: 8, readValueFromPointer: XA, V: function(d2) {
          He(d2);
        } });
      }, i: function(l2, c2, Q) {
        if (Q = cA(Q), c2 === 2) var d2 = we, y = zA, k = le, N = () => x3, M = 1;
        else c2 === 4 && (d2 = Xt, y = bt, k = Yr, N = () => b, M = 2);
        X(l2, { name: Q, fromWireType: function(U) {
          for (var G = b[U >> 2], O = N(), q, nA = U + 4, UA = 0; UA <= G; ++UA) {
            var BA = U + 4 + UA * c2;
            (UA == G || O[BA >> M] == 0) && (nA = d2(nA, BA - nA), q === void 0 ? q = nA : (q += String.fromCharCode(0), q += nA), nA = BA + c2);
          }
          return He(U), q;
        }, toWireType: function(U, G) {
          typeof G != "string" && J("Cannot pass non-string to C++ string type " + Q);
          var O = k(G), q = $n(4 + O + c2);
          return b[q >> 2] = O >> M, y(G, q + 4, O + c2), U !== null && U.push(He, q), q;
        }, argPackAdvance: 8, readValueFromPointer: XA, V: function(U) {
          He(U);
        } });
      }, k: function(l2, c2, Q, d2, y, k) {
        gt[l2] = { name: cA(c2), fa: RA(Q, d2), W: RA(y, k), ia: [] };
      }, h: function(l2, c2, Q, d2, y, k, N, M, U, G) {
        gt[l2].ia.push({ oa: cA(c2), ta: Q, ra: RA(d2, y), sa: k, za: N, ya: RA(M, U), Aa: G });
      }, C: function(l2, c2) {
        c2 = cA(c2), X(l2, { va: true, name: c2, argPackAdvance: 0, fromWireType: function() {
        }, toWireType: function() {
        } });
      }, s: function(l2, c2, Q, d2, y) {
        l2 = Xr[l2], c2 = SA(c2), Q = Vt(Q);
        var k = [];
        return b[d2 >> 2] = CA(k), l2(c2, Q, k, y);
      }, t: function(l2, c2, Q, d2) {
        l2 = Xr[l2], c2 = SA(c2), Q = Vt(Q), l2(c2, Q, null, d2);
      }, g: xA, m: function(l2, c2) {
        var Q = fl2(l2, c2), d2 = Q[0];
        c2 = d2.name + "_$" + Q.slice(1).map(function(N) {
          return N.name;
        }).join("_") + "$";
        var y = Ls[c2];
        if (y !== void 0) return y;
        var k = Array(l2 - 1);
        return y = cl((N, M, U, G) => {
          for (var O = 0, q = 0; q < l2 - 1; ++q) k[q] = Q[q + 1].readValueFromPointer(G + O), O += Q[q + 1].argPackAdvance;
          for (N = N[M].apply(N, k), q = 0; q < l2 - 1; ++q) Q[q + 1].ma && Q[q + 1].ma(k[q]);
          if (!d2.va) return d2.toWireType(U, N);
        }), Ls[c2] = y;
      }, D: function(l2) {
        4 < l2 && (GA[l2].ga += 1);
      }, r: function(l2) {
        var c2 = SA(l2);
        ze(c2), xA(l2);
      }, c: function() {
        MA("");
      }, x: function(l2, c2, Q) {
        p.copyWithin(l2, c2, c2 + Q);
      }, w: function(l2) {
        var c2 = p.length;
        if (l2 >>>= 0, 2147483648 < l2) return false;
        for (var Q = 1; 4 >= Q; Q *= 2) {
          var d2 = c2 * (1 + 0.2 / Q);
          d2 = Math.min(d2, l2 + 100663296);
          var y = Math;
          d2 = Math.max(l2, d2), y = y.min.call(y, 2147483648, d2 + (65536 - d2 % 65536) % 65536);
          A: {
            try {
              I.grow(y - E.byteLength + 65535 >>> 16), v2();
              var k = 1;
              break A;
            } catch {
            }
            k = void 0;
          }
          if (k) return true;
        }
        return false;
      }, z: function() {
        return 52;
      }, u: function() {
        return 70;
      }, y: function(l2, c2, Q, d2) {
        for (var y = 0, k = 0; k < Q; k++) {
          var N = b[c2 >> 2], M = b[c2 + 4 >> 2];
          c2 += 8;
          for (var U = 0; U < M; U++) {
            var G = p[N + U], O = Bl[l2];
            G === 0 || G === 10 ? ((l2 === 1 ? s : a)(f(O, 0)), O.length = 0) : O.push(G);
          }
          y += M;
        }
        return b[d2 >> 2] = y, 0;
      } };
      (function() {
        function l2(y) {
          t.asm = y.exports, I = t.asm.E, v2(), F = t.asm.J, _.unshift(t.asm.F), iA--, t.monitorRunDependencies && t.monitorRunDependencies(iA), iA == 0 && (lA !== null && (clearInterval(lA), lA = null), re && (y = re, re = null, y()));
        }
        function c2(y) {
          l2(y.instance);
        }
        function Q(y) {
          return YA().then(function(k) {
            return WebAssembly.instantiate(k, d2);
          }).then(function(k) {
            return k;
          }).then(y, function(k) {
            a("failed to asynchronously prepare wasm: " + k), MA(k);
          });
        }
        var d2 = { a: Ql };
        if (iA++, t.monitorRunDependencies && t.monitorRunDependencies(iA), t.instantiateWasm) try {
          return t.instantiateWasm(d2, l2);
        } catch (y) {
          a("Module.instantiateWasm callback failed with error: " + y), n(y);
        }
        return (function() {
          return g2 || typeof WebAssembly.instantiateStreaming != "function" || ne(kA) || typeof fetch != "function" ? Q(c2) : fetch(kA, { credentials: "same-origin" }).then(function(y) {
            return WebAssembly.instantiateStreaming(y, d2).then(c2, function(k) {
              return a("wasm streaming compile failed: " + k), a("falling back to ArrayBuffer instantiation"), Q(c2);
            });
          });
        })().catch(n), {};
      })(), t.___wasm_call_ctors = function() {
        return (t.___wasm_call_ctors = t.asm.F).apply(null, arguments);
      };
      var Us = t.___getTypeName = function() {
        return (Us = t.___getTypeName = t.asm.G).apply(null, arguments);
      };
      t.__embind_initialize_bindings = function() {
        return (t.__embind_initialize_bindings = t.asm.H).apply(null, arguments);
      };
      var $n = t._malloc = function() {
        return ($n = t._malloc = t.asm.I).apply(null, arguments);
      }, He = t._free = function() {
        return (He = t._free = t.asm.K).apply(null, arguments);
      };
      t.dynCall_jiji = function() {
        return (t.dynCall_jiji = t.asm.L).apply(null, arguments);
      };
      var zr;
      re = function l2() {
        zr || Hs(), zr || (re = l2);
      };
      function Hs() {
        function l2() {
          if (!zr && (zr = true, t.calledRun = true, !B)) {
            if (FA(_), r(t), t.onRuntimeInitialized && t.onRuntimeInitialized(), t.postRun) for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; ) {
              var c2 = t.postRun.shift();
              AA.unshift(c2);
            }
            FA(AA);
          }
        }
        if (!(0 < iA)) {
          if (t.preRun) for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; ) EA();
          FA(K2), 0 < iA || (t.setStatus ? (t.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
              t.setStatus("");
            }, 1), l2();
          }, 1)) : l2());
        }
      }
      if (t.preInit) for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); 0 < t.preInit.length; ) t.preInit.pop()();
      return Hs(), e.ready;
    };
  })(), Jl = _l;
});
async function fa(A) {
  let { default: e } = await Promise.resolve().then(() => (ca(), la));
  return Ii(await e(A));
}
var Ba = It(() => {
  Ia();
  rn();
});
var li = {};
jr(li, { getYoga: () => Wl });
function Wl() {
  return Kl;
}
var Kl;
var ci = It(() => {
  Ba();
  Kl = fa();
});
var qi = W((Yi) => {
  "use strict";
  Object.defineProperty(Yi, "__esModule", { value: true });
  Object.defineProperty(Yi, "default", { enumerable: true, get: () => Rf });
  function Rf(A) {
    if (A = `${A}`, A === "0") return "0";
    if (/^[+-]?(\d+|\d*\.\d+)(e[+-]?\d+)?(%|\w+)?$/.test(A)) return A.replace(/^[+-]?/, (e) => e === "-" ? "" : "-");
    if (A.includes("var(") || A.includes("calc(")) return `calc(${A} * -1)`;
  }
});
var Rg = W((Xi) => {
  "use strict";
  Object.defineProperty(Xi, "__esModule", { value: true });
  Object.defineProperty(Xi, "default", { enumerable: true, get: () => Ff });
  var Ff = ["preflight", "container", "accessibility", "pointerEvents", "visibility", "position", "inset", "isolation", "zIndex", "order", "gridColumn", "gridColumnStart", "gridColumnEnd", "gridRow", "gridRowStart", "gridRowEnd", "float", "clear", "margin", "boxSizing", "display", "aspectRatio", "height", "maxHeight", "minHeight", "width", "minWidth", "maxWidth", "flex", "flexShrink", "flexGrow", "flexBasis", "tableLayout", "borderCollapse", "borderSpacing", "transformOrigin", "translate", "rotate", "skew", "scale", "transform", "animation", "cursor", "touchAction", "userSelect", "resize", "scrollSnapType", "scrollSnapAlign", "scrollSnapStop", "scrollMargin", "scrollPadding", "listStylePosition", "listStyleType", "appearance", "columns", "breakBefore", "breakInside", "breakAfter", "gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateColumns", "gridTemplateRows", "flexDirection", "flexWrap", "placeContent", "placeItems", "alignContent", "alignItems", "justifyContent", "justifyItems", "gap", "space", "divideWidth", "divideStyle", "divideColor", "divideOpacity", "placeSelf", "alignSelf", "justifySelf", "overflow", "overscrollBehavior", "scrollBehavior", "textOverflow", "whitespace", "wordBreak", "borderRadius", "borderWidth", "borderStyle", "borderColor", "borderOpacity", "backgroundColor", "backgroundOpacity", "backgroundImage", "gradientColorStops", "boxDecorationBreak", "backgroundSize", "backgroundAttachment", "backgroundClip", "backgroundPosition", "backgroundRepeat", "backgroundOrigin", "fill", "stroke", "strokeWidth", "objectFit", "objectPosition", "padding", "textAlign", "textIndent", "verticalAlign", "fontFamily", "fontSize", "fontWeight", "textTransform", "fontStyle", "fontVariantNumeric", "lineHeight", "letterSpacing", "textColor", "textOpacity", "textDecoration", "textDecorationColor", "textDecorationStyle", "textDecorationThickness", "textUnderlineOffset", "fontSmoothing", "placeholderColor", "placeholderOpacity", "caretColor", "accentColor", "opacity", "backgroundBlendMode", "mixBlendMode", "boxShadow", "boxShadowColor", "outlineStyle", "outlineWidth", "outlineOffset", "outlineColor", "ringWidth", "ringColor", "ringOpacity", "ringOffsetWidth", "ringOffsetColor", "blur", "brightness", "contrast", "dropShadow", "grayscale", "hueRotate", "invert", "saturate", "sepia", "filter", "backdropBlur", "backdropBrightness", "backdropContrast", "backdropGrayscale", "backdropHueRotate", "backdropInvert", "backdropOpacity", "backdropSaturate", "backdropSepia", "backdropFilter", "transitionProperty", "transitionDelay", "transitionDuration", "transitionTimingFunction", "willChange", "content"];
});
var Fg = W((Vi) => {
  "use strict";
  Object.defineProperty(Vi, "__esModule", { value: true });
  Object.defineProperty(Vi, "default", { enumerable: true, get: () => Nf });
  function Nf(A, e) {
    return A === void 0 ? e : Array.isArray(A) ? A : [...new Set(e.filter((r) => A !== false && A[r] !== false).concat(Object.keys(A).filter((r) => A[r] !== false)))];
  }
});
var zi = W((Iy, Ng) => {
  Ng.exports = { content: [], presets: [], darkMode: "media", theme: { screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }, colors: ({ colors: A }) => ({ inherit: A.inherit, current: A.current, transparent: A.transparent, black: A.black, white: A.white, slate: A.slate, gray: A.gray, zinc: A.zinc, neutral: A.neutral, stone: A.stone, red: A.red, orange: A.orange, amber: A.amber, yellow: A.yellow, lime: A.lime, green: A.green, emerald: A.emerald, teal: A.teal, cyan: A.cyan, sky: A.sky, blue: A.blue, indigo: A.indigo, violet: A.violet, purple: A.purple, fuchsia: A.fuchsia, pink: A.pink, rose: A.rose }), columns: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", "3xs": "16rem", "2xs": "18rem", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem" }, spacing: { px: "1px", 0: "0px", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem", 2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem", 11: "2.75rem", 12: "3rem", 14: "3.5rem", 16: "4rem", 20: "5rem", 24: "6rem", 28: "7rem", 32: "8rem", 36: "9rem", 40: "10rem", 44: "11rem", 48: "12rem", 52: "13rem", 56: "14rem", 60: "15rem", 64: "16rem", 72: "18rem", 80: "20rem", 96: "24rem" }, animation: { none: "none", spin: "spin 1s linear infinite", ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite", pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", bounce: "bounce 1s infinite" }, aspectRatio: { auto: "auto", square: "1 / 1", video: "16 / 9" }, backdropBlur: ({ theme: A }) => A("blur"), backdropBrightness: ({ theme: A }) => A("brightness"), backdropContrast: ({ theme: A }) => A("contrast"), backdropGrayscale: ({ theme: A }) => A("grayscale"), backdropHueRotate: ({ theme: A }) => A("hueRotate"), backdropInvert: ({ theme: A }) => A("invert"), backdropOpacity: ({ theme: A }) => A("opacity"), backdropSaturate: ({ theme: A }) => A("saturate"), backdropSepia: ({ theme: A }) => A("sepia"), backgroundColor: ({ theme: A }) => A("colors"), backgroundImage: { none: "none", "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))", "gradient-to-tr": "linear-gradient(to top right, var(--tw-gradient-stops))", "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))", "gradient-to-br": "linear-gradient(to bottom right, var(--tw-gradient-stops))", "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))", "gradient-to-bl": "linear-gradient(to bottom left, var(--tw-gradient-stops))", "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))", "gradient-to-tl": "linear-gradient(to top left, var(--tw-gradient-stops))" }, backgroundOpacity: ({ theme: A }) => A("opacity"), backgroundPosition: { bottom: "bottom", center: "center", left: "left", "left-bottom": "left bottom", "left-top": "left top", right: "right", "right-bottom": "right bottom", "right-top": "right top", top: "top" }, backgroundSize: { auto: "auto", cover: "cover", contain: "contain" }, blur: { 0: "0", none: "0", sm: "4px", DEFAULT: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "40px", "3xl": "64px" }, brightness: { 0: "0", 50: ".5", 75: ".75", 90: ".9", 95: ".95", 100: "1", 105: "1.05", 110: "1.1", 125: "1.25", 150: "1.5", 200: "2" }, borderColor: ({ theme: A }) => ({ ...A("colors"), DEFAULT: A("colors.gray.200", "currentColor") }), borderOpacity: ({ theme: A }) => A("opacity"), borderRadius: { none: "0px", sm: "0.125rem", DEFAULT: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem", full: "9999px" }, borderSpacing: ({ theme: A }) => ({ ...A("spacing") }), borderWidth: { DEFAULT: "1px", 0: "0px", 2: "2px", 4: "4px", 8: "8px" }, boxShadow: { sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)", inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)", none: "none" }, boxShadowColor: ({ theme: A }) => A("colors"), caretColor: ({ theme: A }) => A("colors"), accentColor: ({ theme: A }) => ({ ...A("colors"), auto: "auto" }), contrast: { 0: "0", 50: ".5", 75: ".75", 100: "1", 125: "1.25", 150: "1.5", 200: "2" }, container: {}, content: { none: "none" }, cursor: { auto: "auto", default: "default", pointer: "pointer", wait: "wait", text: "text", move: "move", help: "help", "not-allowed": "not-allowed", none: "none", "context-menu": "context-menu", progress: "progress", cell: "cell", crosshair: "crosshair", "vertical-text": "vertical-text", alias: "alias", copy: "copy", "no-drop": "no-drop", grab: "grab", grabbing: "grabbing", "all-scroll": "all-scroll", "col-resize": "col-resize", "row-resize": "row-resize", "n-resize": "n-resize", "e-resize": "e-resize", "s-resize": "s-resize", "w-resize": "w-resize", "ne-resize": "ne-resize", "nw-resize": "nw-resize", "se-resize": "se-resize", "sw-resize": "sw-resize", "ew-resize": "ew-resize", "ns-resize": "ns-resize", "nesw-resize": "nesw-resize", "nwse-resize": "nwse-resize", "zoom-in": "zoom-in", "zoom-out": "zoom-out" }, divideColor: ({ theme: A }) => A("borderColor"), divideOpacity: ({ theme: A }) => A("borderOpacity"), divideWidth: ({ theme: A }) => A("borderWidth"), dropShadow: { sm: "0 1px 1px rgb(0 0 0 / 0.05)", DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.1)", "0 1px 1px rgb(0 0 0 / 0.06)"], md: ["0 4px 3px rgb(0 0 0 / 0.07)", "0 2px 2px rgb(0 0 0 / 0.06)"], lg: ["0 10px 8px rgb(0 0 0 / 0.04)", "0 4px 3px rgb(0 0 0 / 0.1)"], xl: ["0 20px 13px rgb(0 0 0 / 0.03)", "0 8px 5px rgb(0 0 0 / 0.08)"], "2xl": "0 25px 25px rgb(0 0 0 / 0.15)", none: "0 0 #0000" }, fill: ({ theme: A }) => A("colors"), grayscale: { 0: "0", DEFAULT: "100%" }, hueRotate: { 0: "0deg", 15: "15deg", 30: "30deg", 60: "60deg", 90: "90deg", 180: "180deg" }, invert: { 0: "0", DEFAULT: "100%" }, flex: { 1: "1 1 0%", auto: "1 1 auto", initial: "0 1 auto", none: "none" }, flexBasis: ({ theme: A }) => ({ auto: "auto", ...A("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", "1/12": "8.333333%", "2/12": "16.666667%", "3/12": "25%", "4/12": "33.333333%", "5/12": "41.666667%", "6/12": "50%", "7/12": "58.333333%", "8/12": "66.666667%", "9/12": "75%", "10/12": "83.333333%", "11/12": "91.666667%", full: "100%" }), flexGrow: { 0: "0", DEFAULT: "1" }, flexShrink: { 0: "0", DEFAULT: "1" }, fontFamily: { sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", '"Noto Sans"', "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'], serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"], mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"] }, fontSize: { xs: ["0.75rem", { lineHeight: "1rem" }], sm: ["0.875rem", { lineHeight: "1.25rem" }], base: ["1rem", { lineHeight: "1.5rem" }], lg: ["1.125rem", { lineHeight: "1.75rem" }], xl: ["1.25rem", { lineHeight: "1.75rem" }], "2xl": ["1.5rem", { lineHeight: "2rem" }], "3xl": ["1.875rem", { lineHeight: "2.25rem" }], "4xl": ["2.25rem", { lineHeight: "2.5rem" }], "5xl": ["3rem", { lineHeight: "1" }], "6xl": ["3.75rem", { lineHeight: "1" }], "7xl": ["4.5rem", { lineHeight: "1" }], "8xl": ["6rem", { lineHeight: "1" }], "9xl": ["8rem", { lineHeight: "1" }] }, fontWeight: { thin: "100", extralight: "200", light: "300", normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900" }, gap: ({ theme: A }) => A("spacing"), gradientColorStops: ({ theme: A }) => A("colors"), gridAutoColumns: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0, 1fr)" }, gridAutoRows: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0, 1fr)" }, gridColumn: { auto: "auto", "span-1": "span 1 / span 1", "span-2": "span 2 / span 2", "span-3": "span 3 / span 3", "span-4": "span 4 / span 4", "span-5": "span 5 / span 5", "span-6": "span 6 / span 6", "span-7": "span 7 / span 7", "span-8": "span 8 / span 8", "span-9": "span 9 / span 9", "span-10": "span 10 / span 10", "span-11": "span 11 / span 11", "span-12": "span 12 / span 12", "span-full": "1 / -1" }, gridColumnEnd: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridColumnStart: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridRow: { auto: "auto", "span-1": "span 1 / span 1", "span-2": "span 2 / span 2", "span-3": "span 3 / span 3", "span-4": "span 4 / span 4", "span-5": "span 5 / span 5", "span-6": "span 6 / span 6", "span-full": "1 / -1" }, gridRowStart: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7" }, gridRowEnd: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7" }, gridTemplateColumns: { none: "none", 1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))", 3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))", 5: "repeat(5, minmax(0, 1fr))", 6: "repeat(6, minmax(0, 1fr))", 7: "repeat(7, minmax(0, 1fr))", 8: "repeat(8, minmax(0, 1fr))", 9: "repeat(9, minmax(0, 1fr))", 10: "repeat(10, minmax(0, 1fr))", 11: "repeat(11, minmax(0, 1fr))", 12: "repeat(12, minmax(0, 1fr))" }, gridTemplateRows: { none: "none", 1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))", 3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))", 5: "repeat(5, minmax(0, 1fr))", 6: "repeat(6, minmax(0, 1fr))" }, height: ({ theme: A }) => ({ auto: "auto", ...A("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", full: "100%", screen: "100vh", min: "min-content", max: "max-content", fit: "fit-content" }), inset: ({ theme: A }) => ({ auto: "auto", ...A("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", full: "100%" }), keyframes: { spin: { to: { transform: "rotate(360deg)" } }, ping: { "75%, 100%": { transform: "scale(2)", opacity: "0" } }, pulse: { "50%": { opacity: ".5" } }, bounce: { "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" }, "50%": { transform: "none", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" } } }, letterSpacing: { tighter: "-0.05em", tight: "-0.025em", normal: "0em", wide: "0.025em", wider: "0.05em", widest: "0.1em" }, lineHeight: { none: "1", tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2", 3: ".75rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem" }, listStyleType: { none: "none", disc: "disc", decimal: "decimal" }, margin: ({ theme: A }) => ({ auto: "auto", ...A("spacing") }), maxHeight: ({ theme: A }) => ({ ...A("spacing"), full: "100%", screen: "100vh", min: "min-content", max: "max-content", fit: "fit-content" }), maxWidth: ({ theme: A, breakpoints: e }) => ({ none: "none", 0: "0rem", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem", full: "100%", min: "min-content", max: "max-content", fit: "fit-content", prose: "65ch", ...e(A("screens")) }), minHeight: { 0: "0px", full: "100%", screen: "100vh", min: "min-content", max: "max-content", fit: "fit-content" }, minWidth: { 0: "0px", full: "100%", min: "min-content", max: "max-content", fit: "fit-content" }, objectPosition: { bottom: "bottom", center: "center", left: "left", "left-bottom": "left bottom", "left-top": "left top", right: "right", "right-bottom": "right bottom", "right-top": "right top", top: "top" }, opacity: { 0: "0", 5: "0.05", 10: "0.1", 20: "0.2", 25: "0.25", 30: "0.3", 40: "0.4", 50: "0.5", 60: "0.6", 70: "0.7", 75: "0.75", 80: "0.8", 90: "0.9", 95: "0.95", 100: "1" }, order: { first: "-9999", last: "9999", none: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12" }, padding: ({ theme: A }) => A("spacing"), placeholderColor: ({ theme: A }) => A("colors"), placeholderOpacity: ({ theme: A }) => A("opacity"), outlineColor: ({ theme: A }) => A("colors"), outlineOffset: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, outlineWidth: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, ringColor: ({ theme: A }) => ({ DEFAULT: A("colors.blue.500", "#3b82f6"), ...A("colors") }), ringOffsetColor: ({ theme: A }) => A("colors"), ringOffsetWidth: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, ringOpacity: ({ theme: A }) => ({ DEFAULT: "0.5", ...A("opacity") }), ringWidth: { DEFAULT: "3px", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, rotate: { 0: "0deg", 1: "1deg", 2: "2deg", 3: "3deg", 6: "6deg", 12: "12deg", 45: "45deg", 90: "90deg", 180: "180deg" }, saturate: { 0: "0", 50: ".5", 100: "1", 150: "1.5", 200: "2" }, scale: { 0: "0", 50: ".5", 75: ".75", 90: ".9", 95: ".95", 100: "1", 105: "1.05", 110: "1.1", 125: "1.25", 150: "1.5" }, scrollMargin: ({ theme: A }) => ({ ...A("spacing") }), scrollPadding: ({ theme: A }) => A("spacing"), sepia: { 0: "0", DEFAULT: "100%" }, skew: { 0: "0deg", 1: "1deg", 2: "2deg", 3: "3deg", 6: "6deg", 12: "12deg" }, space: ({ theme: A }) => ({ ...A("spacing") }), stroke: ({ theme: A }) => A("colors"), strokeWidth: { 0: "0", 1: "1", 2: "2" }, textColor: ({ theme: A }) => A("colors"), textDecorationColor: ({ theme: A }) => A("colors"), textDecorationThickness: { auto: "auto", "from-font": "from-font", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, textUnderlineOffset: { auto: "auto", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, textIndent: ({ theme: A }) => ({ ...A("spacing") }), textOpacity: ({ theme: A }) => A("opacity"), transformOrigin: { center: "center", top: "top", "top-right": "top right", right: "right", "bottom-right": "bottom right", bottom: "bottom", "bottom-left": "bottom left", left: "left", "top-left": "top left" }, transitionDelay: { 75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms", 300: "300ms", 500: "500ms", 700: "700ms", 1e3: "1000ms" }, transitionDuration: { DEFAULT: "150ms", 75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms", 300: "300ms", 500: "500ms", 700: "700ms", 1e3: "1000ms" }, transitionProperty: { none: "none", all: "all", DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter", colors: "color, background-color, border-color, text-decoration-color, fill, stroke", opacity: "opacity", shadow: "box-shadow", transform: "transform" }, transitionTimingFunction: { DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)", linear: "linear", in: "cubic-bezier(0.4, 0, 1, 1)", out: "cubic-bezier(0, 0, 0.2, 1)", "in-out": "cubic-bezier(0.4, 0, 0.2, 1)" }, translate: ({ theme: A }) => ({ ...A("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", full: "100%" }), width: ({ theme: A }) => ({ auto: "auto", ...A("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", "1/12": "8.333333%", "2/12": "16.666667%", "3/12": "25%", "4/12": "33.333333%", "5/12": "41.666667%", "6/12": "50%", "7/12": "58.333333%", "8/12": "66.666667%", "9/12": "75%", "10/12": "83.333333%", "11/12": "91.666667%", full: "100%", screen: "100vw", min: "min-content", max: "max-content", fit: "fit-content" }), willChange: { auto: "auto", scroll: "scroll-position", contents: "contents", transform: "transform" }, zIndex: { auto: "auto", 0: "0", 10: "10", 20: "20", 30: "30", 40: "40", 50: "50" } }, variantOrder: ["first", "last", "odd", "even", "visited", "checked", "empty", "read-only", "group-hover", "group-focus", "focus-within", "hover", "focus", "focus-visible", "active", "disabled"], plugins: [] };
});
var Nn = {};
jr(Nn, { default: () => Mf });
var Mf;
var Mn = It(() => {
  Mf = { info(A, e) {
    console.info(...Array.isArray(A) ? [A] : [e, A]);
  }, warn(A, e) {
    console.warn(...Array.isArray(A) ? [A] : [e, A]);
  }, risk(A, e) {
    console.error(...Array.isArray(A) ? [A] : [e, A]);
  } };
});
var Mg = W((Zi) => {
  "use strict";
  Object.defineProperty(Zi, "__esModule", { value: true });
  Object.defineProperty(Zi, "default", { enumerable: true, get: () => Uf });
  var Lf = Gf((Mn(), $r(Nn)));
  function Gf(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function ur({ version: A, from: e, to: t }) {
    Lf.default.warn(`${e}-color-renamed`, [`As of Tailwind CSS ${A}, \`${e}\` has been renamed to \`${t}\`.`, "Update your configuration file to silence this warning."]);
  }
  var Uf = { inherit: "inherit", current: "currentColor", transparent: "transparent", black: "#000", white: "#fff", slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" }, gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827" }, zinc: { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b" }, neutral: { 50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3", 500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717" }, stone: { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917" }, red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d" }, orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12" }, amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" }, yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047", 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12" }, lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314" }, green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d" }, emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" }, teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a" }, cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63" }, sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e" }, blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" }, indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" }, violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" }, purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87" }, fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75" }, pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843" }, rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337" }, get lightBlue() {
    return ur({ version: "v2.2", from: "lightBlue", to: "sky" }), this.sky;
  }, get warmGray() {
    return ur({ version: "v3.0", from: "warmGray", to: "stone" }), this.stone;
  }, get trueGray() {
    return ur({ version: "v3.0", from: "trueGray", to: "neutral" }), this.neutral;
  }, get coolGray() {
    return ur({ version: "v3.0", from: "coolGray", to: "gray" }), this.gray;
  }, get blueGray() {
    return ur({ version: "v3.0", from: "blueGray", to: "slate" }), this.slate;
  } };
});
var Lg = W((ji) => {
  "use strict";
  Object.defineProperty(ji, "__esModule", { value: true });
  Object.defineProperty(ji, "defaults", { enumerable: true, get: () => Hf });
  function Hf(A, ...e) {
    for (let n of e) {
      for (let i2 in n) {
        var t;
        !(A == null || (t = A.hasOwnProperty) === null || t === void 0) && t.call(A, i2) || (A[i2] = n[i2]);
      }
      for (let i2 of Object.getOwnPropertySymbols(n)) {
        var r;
        !(A == null || (r = A.hasOwnProperty) === null || r === void 0) && r.call(A, i2) || (A[i2] = n[i2]);
      }
    }
    return A;
  }
});
var Gg = W(($i) => {
  "use strict";
  Object.defineProperty($i, "__esModule", { value: true });
  Object.defineProperty($i, "toPath", { enumerable: true, get: () => Of });
  function Of(A) {
    if (Array.isArray(A)) return A;
    let e = A.split("[").length - 1, t = A.split("]").length - 1;
    if (e !== t) throw new Error(`Path is invalid. Has unbalanced brackets: ${A}`);
    return A.split(/\.(?![^\[]*\])|[\[\]]/g).filter(Boolean);
  }
});
var Hg = W((Ao) => {
  "use strict";
  Object.defineProperty(Ao, "__esModule", { value: true });
  Object.defineProperty(Ao, "normalizeConfig", { enumerable: true, get: () => Pf });
  var Ir = Tf((Mn(), $r(Nn)));
  function Ug(A) {
    if (typeof WeakMap != "function") return null;
    var e = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
    return (Ug = function(r) {
      return r ? t : e;
    })(A);
  }
  function Tf(A, e) {
    if (!e && A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var t = Ug(e);
    if (t && t.has(A)) return t.get(A);
    var r = {}, n = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var i2 in A) if (i2 !== "default" && Object.prototype.hasOwnProperty.call(A, i2)) {
      var o = n ? Object.getOwnPropertyDescriptor(A, i2) : null;
      o && (o.get || o.set) ? Object.defineProperty(r, i2, o) : r[i2] = A[i2];
    }
    return r.default = A, t && t.set(A, r), r;
  }
  function Pf(A) {
    if ((() => {
      if (A.purge || !A.content || !Array.isArray(A.content) && !(typeof A.content == "object" && A.content !== null)) return false;
      if (Array.isArray(A.content)) return A.content.every((r) => typeof r == "string" ? true : !(typeof (r == null ? void 0 : r.raw) != "string" || r != null && r.extension && typeof (r == null ? void 0 : r.extension) != "string"));
      if (typeof A.content == "object" && A.content !== null) {
        if (Object.keys(A.content).some((r) => !["files", "extract", "transform"].includes(r))) return false;
        if (Array.isArray(A.content.files)) {
          if (!A.content.files.every((r) => typeof r == "string" ? true : !(typeof (r == null ? void 0 : r.raw) != "string" || r != null && r.extension && typeof (r == null ? void 0 : r.extension) != "string"))) return false;
          if (typeof A.content.extract == "object") {
            for (let r of Object.values(A.content.extract)) if (typeof r != "function") return false;
          } else if (!(A.content.extract === void 0 || typeof A.content.extract == "function")) return false;
          if (typeof A.content.transform == "object") {
            for (let r of Object.values(A.content.transform)) if (typeof r != "function") return false;
          } else if (!(A.content.transform === void 0 || typeof A.content.transform == "function")) return false;
        }
        return true;
      }
      return false;
    })() || Ir.default.warn("purge-deprecation", ["The `purge`/`content` options have changed in Tailwind CSS v3.0.", "Update your configuration file to eliminate this warning.", "https://tailwindcss.com/docs/upgrade-guide#configure-content-sources"]), A.safelist = (() => {
      var r;
      let { content: n, purge: i2, safelist: o } = A;
      return Array.isArray(o) ? o : Array.isArray(n == null ? void 0 : n.safelist) ? n.safelist : Array.isArray(i2 == null ? void 0 : i2.safelist) ? i2.safelist : Array.isArray(i2 == null || (r = i2.options) === null || r === void 0 ? void 0 : r.safelist) ? i2.options.safelist : [];
    })(), typeof A.prefix == "function") Ir.default.warn("prefix-function", ["As of Tailwind CSS v3.0, `prefix` cannot be a function.", "Update `prefix` in your configuration to be a string to eliminate this warning.", "https://tailwindcss.com/docs/upgrade-guide#prefix-cannot-be-a-function"]), A.prefix = "";
    else {
      var t;
      A.prefix = (t = A.prefix) !== null && t !== void 0 ? t : "";
    }
    A.content = { files: (() => {
      let { content: r, purge: n } = A;
      return Array.isArray(n) ? n : Array.isArray(n == null ? void 0 : n.content) ? n.content : Array.isArray(r) ? r : Array.isArray(r == null ? void 0 : r.content) ? r.content : Array.isArray(r == null ? void 0 : r.files) ? r.files : [];
    })(), extract: (() => {
      let r = (() => {
        var o, s, a, g2, u2, I, B, f, E, C;
        return !((o = A.purge) === null || o === void 0) && o.extract ? A.purge.extract : !((s = A.content) === null || s === void 0) && s.extract ? A.content.extract : !((a = A.purge) === null || a === void 0 || (g2 = a.extract) === null || g2 === void 0) && g2.DEFAULT ? A.purge.extract.DEFAULT : !((u2 = A.content) === null || u2 === void 0 || (I = u2.extract) === null || I === void 0) && I.DEFAULT ? A.content.extract.DEFAULT : !((B = A.purge) === null || B === void 0 || (f = B.options) === null || f === void 0) && f.extractors ? A.purge.options.extractors : !((E = A.content) === null || E === void 0 || (C = E.options) === null || C === void 0) && C.extractors ? A.content.options.extractors : {};
      })(), n = {}, i2 = (() => {
        var o, s, a, g2;
        if (!((o = A.purge) === null || o === void 0 || (s = o.options) === null || s === void 0) && s.defaultExtractor) return A.purge.options.defaultExtractor;
        if (!((a = A.content) === null || a === void 0 || (g2 = a.options) === null || g2 === void 0) && g2.defaultExtractor) return A.content.options.defaultExtractor;
      })();
      if (i2 !== void 0 && (n.DEFAULT = i2), typeof r == "function") n.DEFAULT = r;
      else if (Array.isArray(r)) for (let { extensions: o, extractor: s } of r ?? []) for (let a of o) n[a] = s;
      else typeof r == "object" && r !== null && Object.assign(n, r);
      return n;
    })(), transform: (() => {
      let r = (() => {
        var i2, o, s, a, g2, u2;
        return !((i2 = A.purge) === null || i2 === void 0) && i2.transform ? A.purge.transform : !((o = A.content) === null || o === void 0) && o.transform ? A.content.transform : !((s = A.purge) === null || s === void 0 || (a = s.transform) === null || a === void 0) && a.DEFAULT ? A.purge.transform.DEFAULT : !((g2 = A.content) === null || g2 === void 0 || (u2 = g2.transform) === null || u2 === void 0) && u2.DEFAULT ? A.content.transform.DEFAULT : {};
      })(), n = {};
      return typeof r == "function" && (n.DEFAULT = r), typeof r == "object" && r !== null && Object.assign(n, r), n;
    })() };
    for (let r of A.content.files) if (typeof r == "string" && /{([^,]*?)}/g.test(r)) {
      Ir.default.warn("invalid-glob-braces", [`The glob pattern ${(0, Ir.dim)(r)} in your Tailwind CSS configuration is invalid.`, `Update it to ${(0, Ir.dim)(r.replace(/{([^,]*?)}/g, "$1"))} to silence this warning.`]);
      break;
    }
    return A;
  }
});
var Og = W((eo) => {
  "use strict";
  Object.defineProperty(eo, "__esModule", { value: true });
  Object.defineProperty(eo, "default", { enumerable: true, get: () => _f });
  function _f(A) {
    if (Object.prototype.toString.call(A) !== "[object Object]") return false;
    let e = Object.getPrototypeOf(A);
    return e === null || e === Object.prototype;
  }
});
var Tg = W((ro) => {
  "use strict";
  Object.defineProperty(ro, "__esModule", { value: true });
  Object.defineProperty(ro, "cloneDeep", { enumerable: true, get: () => to });
  function to(A) {
    return Array.isArray(A) ? A.map((e) => to(e)) : typeof A == "object" && A !== null ? Object.fromEntries(Object.entries(A).map(([e, t]) => [e, to(t)])) : A;
  }
});
var no = W((Ln, Pg) => {
  "use strict";
  Ln.__esModule = true;
  Ln.default = Wf;
  function Jf(A) {
    for (var e = A.toLowerCase(), t = "", r = false, n = 0; n < 6 && e[n] !== void 0; n++) {
      var i2 = e.charCodeAt(n), o = i2 >= 97 && i2 <= 102 || i2 >= 48 && i2 <= 57;
      if (r = i2 === 32, !o) break;
      t += e[n];
    }
    if (t.length !== 0) {
      var s = parseInt(t, 16), a = s >= 55296 && s <= 57343;
      return a || s === 0 || s > 1114111 ? ["\uFFFD", t.length + (r ? 1 : 0)] : [String.fromCodePoint(s), t.length + (r ? 1 : 0)];
    }
  }
  var Kf = /\\/;
  function Wf(A) {
    var e = Kf.test(A);
    if (!e) return A;
    for (var t = "", r = 0; r < A.length; r++) {
      if (A[r] === "\\") {
        var n = Jf(A.slice(r + 1, r + 7));
        if (n !== void 0) {
          t += n[0], r += n[1];
          continue;
        }
        if (A[r + 1] === "\\") {
          t += "\\", r++;
          continue;
        }
        A.length === r + 1 && (t += A[r]);
        continue;
      }
      t += A[r];
    }
    return t;
  }
  Pg.exports = Ln.default;
});
var Jg = W((Gn, _g) => {
  "use strict";
  Gn.__esModule = true;
  Gn.default = Yf;
  function Yf(A) {
    for (var e = arguments.length, t = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++) t[r - 1] = arguments[r];
    for (; t.length > 0; ) {
      var n = t.shift();
      if (!A[n]) return;
      A = A[n];
    }
    return A;
  }
  _g.exports = Gn.default;
});
var Wg = W((Un, Kg) => {
  "use strict";
  Un.__esModule = true;
  Un.default = qf;
  function qf(A) {
    for (var e = arguments.length, t = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++) t[r - 1] = arguments[r];
    for (; t.length > 0; ) {
      var n = t.shift();
      A[n] || (A[n] = {}), A = A[n];
    }
  }
  Kg.exports = Un.default;
});
var qg = W((Hn, Yg) => {
  "use strict";
  Hn.__esModule = true;
  Hn.default = Xf;
  function Xf(A) {
    for (var e = "", t = A.indexOf("/*"), r = 0; t >= 0; ) {
      e = e + A.slice(r, t);
      var n = A.indexOf("*/", t + 2);
      if (n < 0) return e;
      r = n + 2, t = A.indexOf("/*", r);
    }
    return e = e + A.slice(r), e;
  }
  Yg.exports = Hn.default;
});
var lr = W((Me) => {
  "use strict";
  Me.__esModule = true;
  Me.stripComments = Me.ensureObject = Me.getProp = Me.unesc = void 0;
  var Vf = On(no());
  Me.unesc = Vf.default;
  var zf = On(Jg());
  Me.getProp = zf.default;
  var Zf = On(Wg());
  Me.ensureObject = Zf.default;
  var jf = On(qg());
  Me.stripComments = jf.default;
  function On(A) {
    return A && A.__esModule ? A : { default: A };
  }
});
var qe = W((cr, zg) => {
  "use strict";
  cr.__esModule = true;
  cr.default = void 0;
  var Xg = lr();
  function Vg(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function $f(A, e, t) {
    return e && Vg(A.prototype, e), t && Vg(A, t), A;
  }
  var AB = function A(e, t) {
    if (typeof e != "object" || e === null) return e;
    var r = new e.constructor();
    for (var n in e) if (e.hasOwnProperty(n)) {
      var i2 = e[n], o = typeof i2;
      n === "parent" && o === "object" ? t && (r[n] = t) : i2 instanceof Array ? r[n] = i2.map(function(s) {
        return A(s, r);
      }) : r[n] = A(i2, r);
    }
    return r;
  }, eB = (function() {
    function A(t) {
      t === void 0 && (t = {}), Object.assign(this, t), this.spaces = this.spaces || {}, this.spaces.before = this.spaces.before || "", this.spaces.after = this.spaces.after || "";
    }
    var e = A.prototype;
    return e.remove = function() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }, e.replaceWith = function() {
      if (this.parent) {
        for (var r in arguments) this.parent.insertBefore(this, arguments[r]);
        this.remove();
      }
      return this;
    }, e.next = function() {
      return this.parent.at(this.parent.index(this) + 1);
    }, e.prev = function() {
      return this.parent.at(this.parent.index(this) - 1);
    }, e.clone = function(r) {
      r === void 0 && (r = {});
      var n = AB(this);
      for (var i2 in r) n[i2] = r[i2];
      return n;
    }, e.appendToPropertyAndEscape = function(r, n, i2) {
      this.raws || (this.raws = {});
      var o = this[r], s = this.raws[r];
      this[r] = o + n, s || i2 !== n ? this.raws[r] = (s || o) + i2 : delete this.raws[r];
    }, e.setPropertyAndEscape = function(r, n, i2) {
      this.raws || (this.raws = {}), this[r] = n, this.raws[r] = i2;
    }, e.setPropertyWithoutEscape = function(r, n) {
      this[r] = n, this.raws && delete this.raws[r];
    }, e.isAtPosition = function(r, n) {
      if (this.source && this.source.start && this.source.end) return !(this.source.start.line > r || this.source.end.line < r || this.source.start.line === r && this.source.start.column > n || this.source.end.line === r && this.source.end.column < n);
    }, e.stringifyProperty = function(r) {
      return this.raws && this.raws[r] || this[r];
    }, e.valueToString = function() {
      return String(this.stringifyProperty("value"));
    }, e.toString = function() {
      return [this.rawSpaceBefore, this.valueToString(), this.rawSpaceAfter].join("");
    }, $f(A, [{ key: "rawSpaceBefore", get: function() {
      var r = this.raws && this.raws.spaces && this.raws.spaces.before;
      return r === void 0 && (r = this.spaces && this.spaces.before), r || "";
    }, set: function(r) {
      (0, Xg.ensureObject)(this, "raws", "spaces"), this.raws.spaces.before = r;
    } }, { key: "rawSpaceAfter", get: function() {
      var r = this.raws && this.raws.spaces && this.raws.spaces.after;
      return r === void 0 && (r = this.spaces.after), r || "";
    }, set: function(r) {
      (0, Xg.ensureObject)(this, "raws", "spaces"), this.raws.spaces.after = r;
    } }]), A;
  })();
  cr.default = eB;
  zg.exports = cr.default;
});
var KA = W((pA) => {
  "use strict";
  pA.__esModule = true;
  pA.UNIVERSAL = pA.ATTRIBUTE = pA.CLASS = pA.COMBINATOR = pA.COMMENT = pA.ID = pA.NESTING = pA.PSEUDO = pA.ROOT = pA.SELECTOR = pA.STRING = pA.TAG = void 0;
  var tB = "tag";
  pA.TAG = tB;
  var rB = "string";
  pA.STRING = rB;
  var nB = "selector";
  pA.SELECTOR = nB;
  var iB = "root";
  pA.ROOT = iB;
  var oB = "pseudo";
  pA.PSEUDO = oB;
  var sB = "nesting";
  pA.NESTING = sB;
  var aB = "id";
  pA.ID = aB;
  var gB = "comment";
  pA.COMMENT = gB;
  var uB = "combinator";
  pA.COMBINATOR = uB;
  var IB = "class";
  pA.CLASS = IB;
  var lB = "attribute";
  pA.ATTRIBUTE = lB;
  var cB = "universal";
  pA.UNIVERSAL = cB;
});
var Tn = W((fr, Au) => {
  "use strict";
  fr.__esModule = true;
  fr.default = void 0;
  var fB = EB(qe()), Xe = BB(KA());
  function $g() {
    if (typeof WeakMap != "function") return null;
    var A = /* @__PURE__ */ new WeakMap();
    return $g = function() {
      return A;
    }, A;
  }
  function BB(A) {
    if (A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var e = $g();
    if (e && e.has(A)) return e.get(A);
    var t = {}, r = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var n in A) if (Object.prototype.hasOwnProperty.call(A, n)) {
      var i2 = r ? Object.getOwnPropertyDescriptor(A, n) : null;
      i2 && (i2.get || i2.set) ? Object.defineProperty(t, n, i2) : t[n] = A[n];
    }
    return t.default = A, e && e.set(A, t), t;
  }
  function EB(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function QB(A, e) {
    var t;
    if (typeof Symbol > "u" || A[Symbol.iterator] == null) {
      if (Array.isArray(A) || (t = CB(A)) || e && A && typeof A.length == "number") {
        t && (A = t);
        var r = 0;
        return function() {
          return r >= A.length ? { done: true } : { done: false, value: A[r++] };
        };
      }
      throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
    }
    return t = A[Symbol.iterator](), t.next.bind(t);
  }
  function CB(A, e) {
    if (A) {
      if (typeof A == "string") return Zg(A, e);
      var t = Object.prototype.toString.call(A).slice(8, -1);
      if (t === "Object" && A.constructor && (t = A.constructor.name), t === "Map" || t === "Set") return Array.from(A);
      if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return Zg(A, e);
    }
  }
  function Zg(A, e) {
    (e == null || e > A.length) && (e = A.length);
    for (var t = 0, r = new Array(e); t < e; t++) r[t] = A[t];
    return r;
  }
  function jg(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function dB(A, e, t) {
    return e && jg(A.prototype, e), t && jg(A, t), A;
  }
  function pB(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, io(A, e);
  }
  function io(A, e) {
    return io = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, io(A, e);
  }
  var hB = (function(A) {
    pB(e, A);
    function e(r) {
      var n;
      return n = A.call(this, r) || this, n.nodes || (n.nodes = []), n;
    }
    var t = e.prototype;
    return t.append = function(n) {
      return n.parent = this, this.nodes.push(n), this;
    }, t.prepend = function(n) {
      return n.parent = this, this.nodes.unshift(n), this;
    }, t.at = function(n) {
      return this.nodes[n];
    }, t.index = function(n) {
      return typeof n == "number" ? n : this.nodes.indexOf(n);
    }, t.removeChild = function(n) {
      n = this.index(n), this.at(n).parent = void 0, this.nodes.splice(n, 1);
      var i2;
      for (var o in this.indexes) i2 = this.indexes[o], i2 >= n && (this.indexes[o] = i2 - 1);
      return this;
    }, t.removeAll = function() {
      for (var n = QB(this.nodes), i2; !(i2 = n()).done; ) {
        var o = i2.value;
        o.parent = void 0;
      }
      return this.nodes = [], this;
    }, t.empty = function() {
      return this.removeAll();
    }, t.insertAfter = function(n, i2) {
      i2.parent = this;
      var o = this.index(n);
      this.nodes.splice(o + 1, 0, i2), i2.parent = this;
      var s;
      for (var a in this.indexes) s = this.indexes[a], o <= s && (this.indexes[a] = s + 1);
      return this;
    }, t.insertBefore = function(n, i2) {
      i2.parent = this;
      var o = this.index(n);
      this.nodes.splice(o, 0, i2), i2.parent = this;
      var s;
      for (var a in this.indexes) s = this.indexes[a], s <= o && (this.indexes[a] = s + 1);
      return this;
    }, t._findChildAtPosition = function(n, i2) {
      var o = void 0;
      return this.each(function(s) {
        if (s.atPosition) {
          var a = s.atPosition(n, i2);
          if (a) return o = a, false;
        } else if (s.isAtPosition(n, i2)) return o = s, false;
      }), o;
    }, t.atPosition = function(n, i2) {
      if (this.isAtPosition(n, i2)) return this._findChildAtPosition(n, i2) || this;
    }, t._inferEndPosition = function() {
      this.last && this.last.source && this.last.source.end && (this.source = this.source || {}, this.source.end = this.source.end || {}, Object.assign(this.source.end, this.last.source.end));
    }, t.each = function(n) {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach++;
      var i2 = this.lastEach;
      if (this.indexes[i2] = 0, !!this.length) {
        for (var o, s; this.indexes[i2] < this.length && (o = this.indexes[i2], s = n(this.at(o), o), s !== false); ) this.indexes[i2] += 1;
        if (delete this.indexes[i2], s === false) return false;
      }
    }, t.walk = function(n) {
      return this.each(function(i2, o) {
        var s = n(i2, o);
        if (s !== false && i2.length && (s = i2.walk(n)), s === false) return false;
      });
    }, t.walkAttributes = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.ATTRIBUTE) return n.call(i2, o);
      });
    }, t.walkClasses = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.CLASS) return n.call(i2, o);
      });
    }, t.walkCombinators = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.COMBINATOR) return n.call(i2, o);
      });
    }, t.walkComments = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.COMMENT) return n.call(i2, o);
      });
    }, t.walkIds = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.ID) return n.call(i2, o);
      });
    }, t.walkNesting = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.NESTING) return n.call(i2, o);
      });
    }, t.walkPseudos = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.PSEUDO) return n.call(i2, o);
      });
    }, t.walkTags = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.TAG) return n.call(i2, o);
      });
    }, t.walkUniversals = function(n) {
      var i2 = this;
      return this.walk(function(o) {
        if (o.type === Xe.UNIVERSAL) return n.call(i2, o);
      });
    }, t.split = function(n) {
      var i2 = this, o = [];
      return this.reduce(function(s, a, g2) {
        var u2 = n.call(i2, a);
        return o.push(a), u2 ? (s.push(o), o = []) : g2 === i2.length - 1 && s.push(o), s;
      }, []);
    }, t.map = function(n) {
      return this.nodes.map(n);
    }, t.reduce = function(n, i2) {
      return this.nodes.reduce(n, i2);
    }, t.every = function(n) {
      return this.nodes.every(n);
    }, t.some = function(n) {
      return this.nodes.some(n);
    }, t.filter = function(n) {
      return this.nodes.filter(n);
    }, t.sort = function(n) {
      return this.nodes.sort(n);
    }, t.toString = function() {
      return this.map(String).join("");
    }, dB(e, [{ key: "first", get: function() {
      return this.at(0);
    } }, { key: "last", get: function() {
      return this.at(this.length - 1);
    } }, { key: "length", get: function() {
      return this.nodes.length;
    } }]), e;
  })(fB.default);
  fr.default = hB;
  Au.exports = fr.default;
});
var so = W((Br, tu) => {
  "use strict";
  Br.__esModule = true;
  Br.default = void 0;
  var mB = wB(Tn()), yB = KA();
  function wB(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function eu(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function DB(A, e, t) {
    return e && eu(A.prototype, e), t && eu(A, t), A;
  }
  function bB(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, oo(A, e);
  }
  function oo(A, e) {
    return oo = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, oo(A, e);
  }
  var SB = (function(A) {
    bB(e, A);
    function e(r) {
      var n;
      return n = A.call(this, r) || this, n.type = yB.ROOT, n;
    }
    var t = e.prototype;
    return t.toString = function() {
      var n = this.reduce(function(i2, o) {
        return i2.push(String(o)), i2;
      }, []).join(",");
      return this.trailingComma ? n + "," : n;
    }, t.error = function(n, i2) {
      return this._error ? this._error(n, i2) : new Error(n);
    }, DB(e, [{ key: "errorGenerator", set: function(n) {
      this._error = n;
    } }]), e;
  })(mB.default);
  Br.default = SB;
  tu.exports = Br.default;
});
var go = W((Er, ru) => {
  "use strict";
  Er.__esModule = true;
  Er.default = void 0;
  var xB = vB(Tn()), kB = KA();
  function vB(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function RB(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, ao(A, e);
  }
  function ao(A, e) {
    return ao = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, ao(A, e);
  }
  var FB = (function(A) {
    RB(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = kB.SELECTOR, r;
    }
    return e;
  })(xB.default);
  Er.default = FB;
  ru.exports = Er.default;
});
var Pn = W((py, nu) => {
  "use strict";
  var NB = {}, MB = NB.hasOwnProperty, LB = function(e, t) {
    if (!e) return t;
    var r = {};
    for (var n in t) r[n] = MB.call(e, n) ? e[n] : t[n];
    return r;
  }, GB = /[ -,\.\/:-@\[-\^`\{-~]/, UB = /[ -,\.\/:-@\[\]\^`\{-~]/, HB = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g, uo = function A(e, t) {
    t = LB(t, A.options), t.quotes != "single" && t.quotes != "double" && (t.quotes = "single");
    for (var r = t.quotes == "double" ? '"' : "'", n = t.isIdentifier, i2 = e.charAt(0), o = "", s = 0, a = e.length; s < a; ) {
      var g2 = e.charAt(s++), u2 = g2.charCodeAt(), I = void 0;
      if (u2 < 32 || u2 > 126) {
        if (u2 >= 55296 && u2 <= 56319 && s < a) {
          var B = e.charCodeAt(s++);
          (B & 64512) == 56320 ? u2 = ((u2 & 1023) << 10) + (B & 1023) + 65536 : s--;
        }
        I = "\\" + u2.toString(16).toUpperCase() + " ";
      } else t.escapeEverything ? GB.test(g2) ? I = "\\" + g2 : I = "\\" + u2.toString(16).toUpperCase() + " " : /[\t\n\f\r\x0B]/.test(g2) ? I = "\\" + u2.toString(16).toUpperCase() + " " : g2 == "\\" || !n && (g2 == '"' && r == g2 || g2 == "'" && r == g2) || n && UB.test(g2) ? I = "\\" + g2 : I = g2;
      o += I;
    }
    return n && (/^-[-\d]/.test(o) ? o = "\\-" + o.slice(1) : /\d/.test(i2) && (o = "\\3" + i2 + " " + o.slice(1))), o = o.replace(HB, function(f, E, C) {
      return E && E.length % 2 ? f : (E || "") + C;
    }), !n && t.wrap ? r + o + r : o;
  };
  uo.options = { escapeEverything: false, isIdentifier: false, quotes: "single", wrap: false };
  uo.version = "3.0.0";
  nu.exports = uo;
});
var lo = W((Qr, su) => {
  "use strict";
  Qr.__esModule = true;
  Qr.default = void 0;
  var OB = ou(Pn()), TB = lr(), PB = ou(qe()), _B = KA();
  function ou(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function iu(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function JB(A, e, t) {
    return e && iu(A.prototype, e), t && iu(A, t), A;
  }
  function KB(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Io(A, e);
  }
  function Io(A, e) {
    return Io = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Io(A, e);
  }
  var WB = (function(A) {
    KB(e, A);
    function e(r) {
      var n;
      return n = A.call(this, r) || this, n.type = _B.CLASS, n._constructed = true, n;
    }
    var t = e.prototype;
    return t.valueToString = function() {
      return "." + A.prototype.valueToString.call(this);
    }, JB(e, [{ key: "value", get: function() {
      return this._value;
    }, set: function(n) {
      if (this._constructed) {
        var i2 = (0, OB.default)(n, { isIdentifier: true });
        i2 !== n ? ((0, TB.ensureObject)(this, "raws"), this.raws.value = i2) : this.raws && delete this.raws.value;
      }
      this._value = n;
    } }]), e;
  })(PB.default);
  Qr.default = WB;
  su.exports = Qr.default;
});
var fo = W((Cr, au) => {
  "use strict";
  Cr.__esModule = true;
  Cr.default = void 0;
  var YB = XB(qe()), qB = KA();
  function XB(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function VB(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, co(A, e);
  }
  function co(A, e) {
    return co = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, co(A, e);
  }
  var zB = (function(A) {
    VB(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = qB.COMMENT, r;
    }
    return e;
  })(YB.default);
  Cr.default = zB;
  au.exports = Cr.default;
});
var Eo = W((dr, gu) => {
  "use strict";
  dr.__esModule = true;
  dr.default = void 0;
  var ZB = $B(qe()), jB = KA();
  function $B(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function AE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Bo(A, e);
  }
  function Bo(A, e) {
    return Bo = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Bo(A, e);
  }
  var eE = (function(A) {
    AE(e, A);
    function e(r) {
      var n;
      return n = A.call(this, r) || this, n.type = jB.ID, n;
    }
    var t = e.prototype;
    return t.valueToString = function() {
      return "#" + A.prototype.valueToString.call(this);
    }, e;
  })(ZB.default);
  dr.default = eE;
  gu.exports = dr.default;
});
var _n = W((pr, lu) => {
  "use strict";
  pr.__esModule = true;
  pr.default = void 0;
  var tE = Iu(Pn()), rE = lr(), nE = Iu(qe());
  function Iu(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function uu(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function iE(A, e, t) {
    return e && uu(A.prototype, e), t && uu(A, t), A;
  }
  function oE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Qo(A, e);
  }
  function Qo(A, e) {
    return Qo = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Qo(A, e);
  }
  var sE = (function(A) {
    oE(e, A);
    function e() {
      return A.apply(this, arguments) || this;
    }
    var t = e.prototype;
    return t.qualifiedName = function(n) {
      return this.namespace ? this.namespaceString + "|" + n : n;
    }, t.valueToString = function() {
      return this.qualifiedName(A.prototype.valueToString.call(this));
    }, iE(e, [{ key: "namespace", get: function() {
      return this._namespace;
    }, set: function(n) {
      if (n === true || n === "*" || n === "&") {
        this._namespace = n, this.raws && delete this.raws.namespace;
        return;
      }
      var i2 = (0, tE.default)(n, { isIdentifier: true });
      this._namespace = n, i2 !== n ? ((0, rE.ensureObject)(this, "raws"), this.raws.namespace = i2) : this.raws && delete this.raws.namespace;
    } }, { key: "ns", get: function() {
      return this._namespace;
    }, set: function(n) {
      this.namespace = n;
    } }, { key: "namespaceString", get: function() {
      if (this.namespace) {
        var n = this.stringifyProperty("namespace");
        return n === true ? "" : n;
      } else return "";
    } }]), e;
  })(nE.default);
  pr.default = sE;
  lu.exports = pr.default;
});
var po = W((hr, cu) => {
  "use strict";
  hr.__esModule = true;
  hr.default = void 0;
  var aE = uE(_n()), gE = KA();
  function uE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function IE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Co(A, e);
  }
  function Co(A, e) {
    return Co = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Co(A, e);
  }
  var lE = (function(A) {
    IE(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = gE.TAG, r;
    }
    return e;
  })(aE.default);
  hr.default = lE;
  cu.exports = hr.default;
});
var mo = W((mr, fu) => {
  "use strict";
  mr.__esModule = true;
  mr.default = void 0;
  var cE = BE(qe()), fE = KA();
  function BE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function EE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, ho(A, e);
  }
  function ho(A, e) {
    return ho = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, ho(A, e);
  }
  var QE = (function(A) {
    EE(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = fE.STRING, r;
    }
    return e;
  })(cE.default);
  mr.default = QE;
  fu.exports = mr.default;
});
var wo = W((yr, Bu) => {
  "use strict";
  yr.__esModule = true;
  yr.default = void 0;
  var CE = pE(Tn()), dE = KA();
  function pE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function hE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, yo(A, e);
  }
  function yo(A, e) {
    return yo = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, yo(A, e);
  }
  var mE = (function(A) {
    hE(e, A);
    function e(r) {
      var n;
      return n = A.call(this, r) || this, n.type = dE.PSEUDO, n;
    }
    var t = e.prototype;
    return t.toString = function() {
      var n = this.length ? "(" + this.map(String).join(",") + ")" : "";
      return [this.rawSpaceBefore, this.stringifyProperty("value"), n, this.rawSpaceAfter].join("");
    }, e;
  })(CE.default);
  yr.default = mE;
  Bu.exports = yr.default;
});
var Qu = W((hy, Eu) => {
  Eu.exports = function(e, t) {
    return function(...r) {
      return console.warn(t), e(...r);
    };
  };
});
var vo = W((br) => {
  "use strict";
  br.__esModule = true;
  br.unescapeValue = ko;
  br.default = void 0;
  var wr = xo(Pn()), yE = xo(no()), wE = xo(_n()), DE = KA(), Do;
  function xo(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function Cu(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function bE(A, e, t) {
    return e && Cu(A.prototype, e), t && Cu(A, t), A;
  }
  function SE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, So(A, e);
  }
  function So(A, e) {
    return So = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, So(A, e);
  }
  var Dr = Qu(), xE = /^('|")([^]*)\1$/, kE = Dr(function() {
  }, "Assigning an attribute a value containing characters that might need to be escaped is deprecated. Call attribute.setValue() instead."), vE = Dr(function() {
  }, "Assigning attr.quoted is deprecated and has no effect. Assign to attr.quoteMark instead."), RE = Dr(function() {
  }, "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");
  function ko(A) {
    var e = false, t = null, r = A, n = r.match(xE);
    return n && (t = n[1], r = n[2]), r = (0, yE.default)(r), r !== A && (e = true), { deprecatedUsage: e, unescaped: r, quoteMark: t };
  }
  function FE(A) {
    if (A.quoteMark !== void 0 || A.value === void 0) return A;
    RE();
    var e = ko(A.value), t = e.quoteMark, r = e.unescaped;
    return A.raws || (A.raws = {}), A.raws.value === void 0 && (A.raws.value = A.value), A.value = r, A.quoteMark = t, A;
  }
  var Jn = (function(A) {
    SE(e, A);
    function e(r) {
      var n;
      return r === void 0 && (r = {}), n = A.call(this, FE(r)) || this, n.type = DE.ATTRIBUTE, n.raws = n.raws || {}, Object.defineProperty(n.raws, "unquoted", { get: Dr(function() {
        return n.value;
      }, "attr.raws.unquoted is deprecated. Call attr.value instead."), set: Dr(function() {
        return n.value;
      }, "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now.") }), n._constructed = true, n;
    }
    var t = e.prototype;
    return t.getQuotedValue = function(n) {
      n === void 0 && (n = {});
      var i2 = this._determineQuoteMark(n), o = bo[i2], s = (0, wr.default)(this._value, o);
      return s;
    }, t._determineQuoteMark = function(n) {
      return n.smart ? this.smartQuoteMark(n) : this.preferredQuoteMark(n);
    }, t.setValue = function(n, i2) {
      i2 === void 0 && (i2 = {}), this._value = n, this._quoteMark = this._determineQuoteMark(i2), this._syncRawValue();
    }, t.smartQuoteMark = function(n) {
      var i2 = this.value, o = i2.replace(/[^']/g, "").length, s = i2.replace(/[^"]/g, "").length;
      if (o + s === 0) {
        var a = (0, wr.default)(i2, { isIdentifier: true });
        if (a === i2) return e.NO_QUOTE;
        var g2 = this.preferredQuoteMark(n);
        if (g2 === e.NO_QUOTE) {
          var u2 = this.quoteMark || n.quoteMark || e.DOUBLE_QUOTE, I = bo[u2], B = (0, wr.default)(i2, I);
          if (B.length < a.length) return u2;
        }
        return g2;
      } else return s === o ? this.preferredQuoteMark(n) : s < o ? e.DOUBLE_QUOTE : e.SINGLE_QUOTE;
    }, t.preferredQuoteMark = function(n) {
      var i2 = n.preferCurrentQuoteMark ? this.quoteMark : n.quoteMark;
      return i2 === void 0 && (i2 = n.preferCurrentQuoteMark ? n.quoteMark : this.quoteMark), i2 === void 0 && (i2 = e.DOUBLE_QUOTE), i2;
    }, t._syncRawValue = function() {
      var n = (0, wr.default)(this._value, bo[this.quoteMark]);
      n === this._value ? this.raws && delete this.raws.value : this.raws.value = n;
    }, t._handleEscapes = function(n, i2) {
      if (this._constructed) {
        var o = (0, wr.default)(i2, { isIdentifier: true });
        o !== i2 ? this.raws[n] = o : delete this.raws[n];
      }
    }, t._spacesFor = function(n) {
      var i2 = { before: "", after: "" }, o = this.spaces[n] || {}, s = this.raws.spaces && this.raws.spaces[n] || {};
      return Object.assign(i2, o, s);
    }, t._stringFor = function(n, i2, o) {
      i2 === void 0 && (i2 = n), o === void 0 && (o = du);
      var s = this._spacesFor(i2);
      return o(this.stringifyProperty(n), s);
    }, t.offsetOf = function(n) {
      var i2 = 1, o = this._spacesFor("attribute");
      if (i2 += o.before.length, n === "namespace" || n === "ns") return this.namespace ? i2 : -1;
      if (n === "attributeNS" || (i2 += this.namespaceString.length, this.namespace && (i2 += 1), n === "attribute")) return i2;
      i2 += this.stringifyProperty("attribute").length, i2 += o.after.length;
      var s = this._spacesFor("operator");
      i2 += s.before.length;
      var a = this.stringifyProperty("operator");
      if (n === "operator") return a ? i2 : -1;
      i2 += a.length, i2 += s.after.length;
      var g2 = this._spacesFor("value");
      i2 += g2.before.length;
      var u2 = this.stringifyProperty("value");
      if (n === "value") return u2 ? i2 : -1;
      i2 += u2.length, i2 += g2.after.length;
      var I = this._spacesFor("insensitive");
      return i2 += I.before.length, n === "insensitive" && this.insensitive ? i2 : -1;
    }, t.toString = function() {
      var n = this, i2 = [this.rawSpaceBefore, "["];
      return i2.push(this._stringFor("qualifiedAttribute", "attribute")), this.operator && (this.value || this.value === "") && (i2.push(this._stringFor("operator")), i2.push(this._stringFor("value")), i2.push(this._stringFor("insensitiveFlag", "insensitive", function(o, s) {
        return o.length > 0 && !n.quoted && s.before.length === 0 && !(n.spaces.value && n.spaces.value.after) && (s.before = " "), du(o, s);
      }))), i2.push("]"), i2.push(this.rawSpaceAfter), i2.join("");
    }, bE(e, [{ key: "quoted", get: function() {
      var n = this.quoteMark;
      return n === "'" || n === '"';
    }, set: function(n) {
      vE();
    } }, { key: "quoteMark", get: function() {
      return this._quoteMark;
    }, set: function(n) {
      if (!this._constructed) {
        this._quoteMark = n;
        return;
      }
      this._quoteMark !== n && (this._quoteMark = n, this._syncRawValue());
    } }, { key: "qualifiedAttribute", get: function() {
      return this.qualifiedName(this.raws.attribute || this.attribute);
    } }, { key: "insensitiveFlag", get: function() {
      return this.insensitive ? "i" : "";
    } }, { key: "value", get: function() {
      return this._value;
    }, set: function(n) {
      if (this._constructed) {
        var i2 = ko(n), o = i2.deprecatedUsage, s = i2.unescaped, a = i2.quoteMark;
        if (o && kE(), s === this._value && a === this._quoteMark) return;
        this._value = s, this._quoteMark = a, this._syncRawValue();
      } else this._value = n;
    } }, { key: "attribute", get: function() {
      return this._attribute;
    }, set: function(n) {
      this._handleEscapes("attribute", n), this._attribute = n;
    } }]), e;
  })(wE.default);
  br.default = Jn;
  Jn.NO_QUOTE = null;
  Jn.SINGLE_QUOTE = "'";
  Jn.DOUBLE_QUOTE = '"';
  var bo = (Do = { "'": { quotes: "single", wrap: true }, '"': { quotes: "double", wrap: true } }, Do[null] = { isIdentifier: true }, Do);
  function du(A, e) {
    return "" + e.before + A + e.after;
  }
});
var Fo = W((Sr, pu) => {
  "use strict";
  Sr.__esModule = true;
  Sr.default = void 0;
  var NE = LE(_n()), ME = KA();
  function LE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function GE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Ro(A, e);
  }
  function Ro(A, e) {
    return Ro = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Ro(A, e);
  }
  var UE = (function(A) {
    GE(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = ME.UNIVERSAL, r.value = "*", r;
    }
    return e;
  })(NE.default);
  Sr.default = UE;
  pu.exports = Sr.default;
});
var Mo = W((xr, hu) => {
  "use strict";
  xr.__esModule = true;
  xr.default = void 0;
  var HE = TE(qe()), OE = KA();
  function TE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function PE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, No(A, e);
  }
  function No(A, e) {
    return No = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, No(A, e);
  }
  var _E = (function(A) {
    PE(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = OE.COMBINATOR, r;
    }
    return e;
  })(HE.default);
  xr.default = _E;
  hu.exports = xr.default;
});
var Go = W((kr, mu) => {
  "use strict";
  kr.__esModule = true;
  kr.default = void 0;
  var JE = WE(qe()), KE = KA();
  function WE(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function YE(A, e) {
    A.prototype = Object.create(e.prototype), A.prototype.constructor = A, Lo(A, e);
  }
  function Lo(A, e) {
    return Lo = Object.setPrototypeOf || function(r, n) {
      return r.__proto__ = n, r;
    }, Lo(A, e);
  }
  var qE = (function(A) {
    YE(e, A);
    function e(t) {
      var r;
      return r = A.call(this, t) || this, r.type = KE.NESTING, r.value = "&", r;
    }
    return e;
  })(JE.default);
  kr.default = qE;
  mu.exports = kr.default;
});
var wu = W((Kn, yu) => {
  "use strict";
  Kn.__esModule = true;
  Kn.default = XE;
  function XE(A) {
    return A.sort(function(e, t) {
      return e - t;
    });
  }
  yu.exports = Kn.default;
});
var Uo = W((P2) => {
  "use strict";
  P2.__esModule = true;
  P2.combinator = P2.word = P2.comment = P2.str = P2.tab = P2.newline = P2.feed = P2.cr = P2.backslash = P2.bang = P2.slash = P2.doubleQuote = P2.singleQuote = P2.space = P2.greaterThan = P2.pipe = P2.equals = P2.plus = P2.caret = P2.tilde = P2.dollar = P2.closeSquare = P2.openSquare = P2.closeParenthesis = P2.openParenthesis = P2.semicolon = P2.colon = P2.comma = P2.at = P2.asterisk = P2.ampersand = void 0;
  var VE = 38;
  P2.ampersand = VE;
  var zE = 42;
  P2.asterisk = zE;
  var ZE = 64;
  P2.at = ZE;
  var jE = 44;
  P2.comma = jE;
  var $E = 58;
  P2.colon = $E;
  var AQ = 59;
  P2.semicolon = AQ;
  var eQ = 40;
  P2.openParenthesis = eQ;
  var tQ = 41;
  P2.closeParenthesis = tQ;
  var rQ = 91;
  P2.openSquare = rQ;
  var nQ = 93;
  P2.closeSquare = nQ;
  var iQ = 36;
  P2.dollar = iQ;
  var oQ = 126;
  P2.tilde = oQ;
  var sQ = 94;
  P2.caret = sQ;
  var aQ = 43;
  P2.plus = aQ;
  var gQ = 61;
  P2.equals = gQ;
  var uQ = 124;
  P2.pipe = uQ;
  var IQ = 62;
  P2.greaterThan = IQ;
  var lQ = 32;
  P2.space = lQ;
  var Du = 39;
  P2.singleQuote = Du;
  var cQ = 34;
  P2.doubleQuote = cQ;
  var fQ = 47;
  P2.slash = fQ;
  var BQ = 33;
  P2.bang = BQ;
  var EQ = 92;
  P2.backslash = EQ;
  var QQ = 13;
  P2.cr = QQ;
  var CQ = 12;
  P2.feed = CQ;
  var dQ = 10;
  P2.newline = dQ;
  var pQ = 9;
  P2.tab = pQ;
  var hQ = Du;
  P2.str = hQ;
  var mQ = -1;
  P2.comment = mQ;
  var yQ = -2;
  P2.word = yQ;
  var wQ = -3;
  P2.combinator = wQ;
});
var xu = W((vr) => {
  "use strict";
  vr.__esModule = true;
  vr.default = RQ;
  vr.FIELDS = void 0;
  var H = DQ(Uo()), Tt, dA;
  function Su() {
    if (typeof WeakMap != "function") return null;
    var A = /* @__PURE__ */ new WeakMap();
    return Su = function() {
      return A;
    }, A;
  }
  function DQ(A) {
    if (A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var e = Su();
    if (e && e.has(A)) return e.get(A);
    var t = {}, r = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var n in A) if (Object.prototype.hasOwnProperty.call(A, n)) {
      var i2 = r ? Object.getOwnPropertyDescriptor(A, n) : null;
      i2 && (i2.get || i2.set) ? Object.defineProperty(t, n, i2) : t[n] = A[n];
    }
    return t.default = A, e && e.set(A, t), t;
  }
  var bQ = (Tt = {}, Tt[H.tab] = true, Tt[H.newline] = true, Tt[H.cr] = true, Tt[H.feed] = true, Tt), SQ = (dA = {}, dA[H.space] = true, dA[H.tab] = true, dA[H.newline] = true, dA[H.cr] = true, dA[H.feed] = true, dA[H.ampersand] = true, dA[H.asterisk] = true, dA[H.bang] = true, dA[H.comma] = true, dA[H.colon] = true, dA[H.semicolon] = true, dA[H.openParenthesis] = true, dA[H.closeParenthesis] = true, dA[H.openSquare] = true, dA[H.closeSquare] = true, dA[H.singleQuote] = true, dA[H.doubleQuote] = true, dA[H.plus] = true, dA[H.pipe] = true, dA[H.tilde] = true, dA[H.greaterThan] = true, dA[H.equals] = true, dA[H.dollar] = true, dA[H.caret] = true, dA[H.slash] = true, dA), Ho = {}, bu = "0123456789abcdefABCDEF";
  for (Wn = 0; Wn < bu.length; Wn++) Ho[bu.charCodeAt(Wn)] = true;
  var Wn;
  function xQ(A, e) {
    var t = e, r;
    do {
      if (r = A.charCodeAt(t), SQ[r]) return t - 1;
      r === H.backslash ? t = kQ(A, t) + 1 : t++;
    } while (t < A.length);
    return t - 1;
  }
  function kQ(A, e) {
    var t = e, r = A.charCodeAt(t + 1);
    if (!bQ[r]) if (Ho[r]) {
      var n = 0;
      do
        t++, n++, r = A.charCodeAt(t + 1);
      while (Ho[r] && n < 6);
      n < 6 && r === H.space && t++;
    } else t++;
    return t;
  }
  var vQ = { TYPE: 0, START_LINE: 1, START_COL: 2, END_LINE: 3, END_COL: 4, START_POS: 5, END_POS: 6 };
  vr.FIELDS = vQ;
  function RQ(A) {
    var e = [], t = A.css.valueOf(), r = t, n = r.length, i2 = -1, o = 1, s = 0, a = 0, g2, u2, I, B, f, E, C, p, m2, x3, w2, b, D;
    function h2(v2, F) {
      if (A.safe) t += F, m2 = t.length - 1;
      else throw A.error("Unclosed " + v2, o, s - i2, s);
    }
    for (; s < n; ) {
      switch (g2 = t.charCodeAt(s), g2 === H.newline && (i2 = s, o += 1), g2) {
        case H.space:
        case H.tab:
        case H.newline:
        case H.cr:
        case H.feed:
          m2 = s;
          do
            m2 += 1, g2 = t.charCodeAt(m2), g2 === H.newline && (i2 = m2, o += 1);
          while (g2 === H.space || g2 === H.newline || g2 === H.tab || g2 === H.cr || g2 === H.feed);
          D = H.space, B = o, I = m2 - i2 - 1, a = m2;
          break;
        case H.plus:
        case H.greaterThan:
        case H.tilde:
        case H.pipe:
          m2 = s;
          do
            m2 += 1, g2 = t.charCodeAt(m2);
          while (g2 === H.plus || g2 === H.greaterThan || g2 === H.tilde || g2 === H.pipe);
          D = H.combinator, B = o, I = s - i2, a = m2;
          break;
        case H.asterisk:
        case H.ampersand:
        case H.bang:
        case H.comma:
        case H.equals:
        case H.dollar:
        case H.caret:
        case H.openSquare:
        case H.closeSquare:
        case H.colon:
        case H.semicolon:
        case H.openParenthesis:
        case H.closeParenthesis:
          m2 = s, D = g2, B = o, I = s - i2, a = m2 + 1;
          break;
        case H.singleQuote:
        case H.doubleQuote:
          b = g2 === H.singleQuote ? "'" : '"', m2 = s;
          do
            for (f = false, m2 = t.indexOf(b, m2 + 1), m2 === -1 && h2("quote", b), E = m2; t.charCodeAt(E - 1) === H.backslash; ) E -= 1, f = !f;
          while (f);
          D = H.str, B = o, I = s - i2, a = m2 + 1;
          break;
        default:
          g2 === H.slash && t.charCodeAt(s + 1) === H.asterisk ? (m2 = t.indexOf("*/", s + 2) + 1, m2 === 0 && h2("comment", "*/"), u2 = t.slice(s, m2 + 1), p = u2.split(`
`), C = p.length - 1, C > 0 ? (x3 = o + C, w2 = m2 - p[C].length) : (x3 = o, w2 = i2), D = H.comment, o = x3, B = x3, I = m2 - w2) : g2 === H.slash ? (m2 = s, D = g2, B = o, I = s - i2, a = m2 + 1) : (m2 = xQ(t, s), D = H.word, B = o, I = m2 - i2), a = m2 + 1;
          break;
      }
      e.push([D, o, s - i2, B, I, s, a]), w2 && (i2 = w2, w2 = null), s = a;
    }
    return e;
  }
});
var Gu = W((Rr, Lu) => {
  "use strict";
  Rr.__esModule = true;
  Rr.default = void 0;
  var FQ = Be(so()), Oo = Be(go()), NQ = Be(lo()), ku = Be(fo()), MQ = Be(Eo()), LQ = Be(po()), To = Be(mo()), GQ = Be(wo()), vu = Yn(vo()), UQ = Be(Fo()), Po = Be(Mo()), HQ = Be(Go()), OQ = Be(wu()), L = Yn(xu()), T = Yn(Uo()), TQ = Yn(KA()), DA = lr(), Ct, _o;
  function Mu() {
    if (typeof WeakMap != "function") return null;
    var A = /* @__PURE__ */ new WeakMap();
    return Mu = function() {
      return A;
    }, A;
  }
  function Yn(A) {
    if (A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var e = Mu();
    if (e && e.has(A)) return e.get(A);
    var t = {}, r = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var n in A) if (Object.prototype.hasOwnProperty.call(A, n)) {
      var i2 = r ? Object.getOwnPropertyDescriptor(A, n) : null;
      i2 && (i2.get || i2.set) ? Object.defineProperty(t, n, i2) : t[n] = A[n];
    }
    return t.default = A, e && e.set(A, t), t;
  }
  function Be(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function Ru(A, e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      r.enumerable = r.enumerable || false, r.configurable = true, "value" in r && (r.writable = true), Object.defineProperty(A, r.key, r);
    }
  }
  function PQ(A, e, t) {
    return e && Ru(A.prototype, e), t && Ru(A, t), A;
  }
  var Wo = (Ct = {}, Ct[T.space] = true, Ct[T.cr] = true, Ct[T.feed] = true, Ct[T.newline] = true, Ct[T.tab] = true, Ct), _Q = Object.assign({}, Wo, (_o = {}, _o[T.comment] = true, _o));
  function Fu(A) {
    return { line: A[L.FIELDS.START_LINE], column: A[L.FIELDS.START_COL] };
  }
  function Nu(A) {
    return { line: A[L.FIELDS.END_LINE], column: A[L.FIELDS.END_COL] };
  }
  function dt(A, e, t, r) {
    return { start: { line: A, column: e }, end: { line: t, column: r } };
  }
  function Pt(A) {
    return dt(A[L.FIELDS.START_LINE], A[L.FIELDS.START_COL], A[L.FIELDS.END_LINE], A[L.FIELDS.END_COL]);
  }
  function Jo(A, e) {
    if (A) return dt(A[L.FIELDS.START_LINE], A[L.FIELDS.START_COL], e[L.FIELDS.END_LINE], e[L.FIELDS.END_COL]);
  }
  function _t(A, e) {
    var t = A[e];
    if (typeof t == "string") return t.indexOf("\\") !== -1 && ((0, DA.ensureObject)(A, "raws"), A[e] = (0, DA.unesc)(t), A.raws[e] === void 0 && (A.raws[e] = t)), A;
  }
  function Ko(A, e) {
    for (var t = -1, r = []; (t = A.indexOf(e, t + 1)) !== -1; ) r.push(t);
    return r;
  }
  function JQ() {
    var A = Array.prototype.concat.apply([], arguments);
    return A.filter(function(e, t) {
      return t === A.indexOf(e);
    });
  }
  var KQ = (function() {
    function A(t, r) {
      r === void 0 && (r = {}), this.rule = t, this.options = Object.assign({ lossy: false, safe: false }, r), this.position = 0, this.css = typeof this.rule == "string" ? this.rule : this.rule.selector, this.tokens = (0, L.default)({ css: this.css, error: this._errorGenerator(), safe: this.options.safe });
      var n = Jo(this.tokens[0], this.tokens[this.tokens.length - 1]);
      this.root = new FQ.default({ source: n }), this.root.errorGenerator = this._errorGenerator();
      var i2 = new Oo.default({ source: { start: { line: 1, column: 1 } } });
      this.root.append(i2), this.current = i2, this.loop();
    }
    var e = A.prototype;
    return e._errorGenerator = function() {
      var r = this;
      return function(n, i2) {
        return typeof r.rule == "string" ? new Error(n) : r.rule.error(n, i2);
      };
    }, e.attribute = function() {
      var r = [], n = this.currToken;
      for (this.position++; this.position < this.tokens.length && this.currToken[L.FIELDS.TYPE] !== T.closeSquare; ) r.push(this.currToken), this.position++;
      if (this.currToken[L.FIELDS.TYPE] !== T.closeSquare) return this.expected("closing square bracket", this.currToken[L.FIELDS.START_POS]);
      var i2 = r.length, o = { source: dt(n[1], n[2], this.currToken[3], this.currToken[4]), sourceIndex: n[L.FIELDS.START_POS] };
      if (i2 === 1 && !~[T.word].indexOf(r[0][L.FIELDS.TYPE])) return this.expected("attribute", r[0][L.FIELDS.START_POS]);
      for (var s = 0, a = "", g2 = "", u2 = null, I = false; s < i2; ) {
        var B = r[s], f = this.content(B), E = r[s + 1];
        switch (B[L.FIELDS.TYPE]) {
          case T.space:
            if (I = true, this.options.lossy) break;
            if (u2) {
              (0, DA.ensureObject)(o, "spaces", u2);
              var C = o.spaces[u2].after || "";
              o.spaces[u2].after = C + f;
              var p = (0, DA.getProp)(o, "raws", "spaces", u2, "after") || null;
              p && (o.raws.spaces[u2].after = p + f);
            } else a = a + f, g2 = g2 + f;
            break;
          case T.asterisk:
            if (E[L.FIELDS.TYPE] === T.equals) o.operator = f, u2 = "operator";
            else if ((!o.namespace || u2 === "namespace" && !I) && E) {
              a && ((0, DA.ensureObject)(o, "spaces", "attribute"), o.spaces.attribute.before = a, a = ""), g2 && ((0, DA.ensureObject)(o, "raws", "spaces", "attribute"), o.raws.spaces.attribute.before = a, g2 = ""), o.namespace = (o.namespace || "") + f;
              var m2 = (0, DA.getProp)(o, "raws", "namespace") || null;
              m2 && (o.raws.namespace += f), u2 = "namespace";
            }
            I = false;
            break;
          case T.dollar:
            if (u2 === "value") {
              var x3 = (0, DA.getProp)(o, "raws", "value");
              o.value += "$", x3 && (o.raws.value = x3 + "$");
              break;
            }
          case T.caret:
            E[L.FIELDS.TYPE] === T.equals && (o.operator = f, u2 = "operator"), I = false;
            break;
          case T.combinator:
            if (f === "~" && E[L.FIELDS.TYPE] === T.equals && (o.operator = f, u2 = "operator"), f !== "|") {
              I = false;
              break;
            }
            E[L.FIELDS.TYPE] === T.equals ? (o.operator = f, u2 = "operator") : !o.namespace && !o.attribute && (o.namespace = true), I = false;
            break;
          case T.word:
            if (E && this.content(E) === "|" && r[s + 2] && r[s + 2][L.FIELDS.TYPE] !== T.equals && !o.operator && !o.namespace) o.namespace = f, u2 = "namespace";
            else if (!o.attribute || u2 === "attribute" && !I) {
              a && ((0, DA.ensureObject)(o, "spaces", "attribute"), o.spaces.attribute.before = a, a = ""), g2 && ((0, DA.ensureObject)(o, "raws", "spaces", "attribute"), o.raws.spaces.attribute.before = g2, g2 = ""), o.attribute = (o.attribute || "") + f;
              var w2 = (0, DA.getProp)(o, "raws", "attribute") || null;
              w2 && (o.raws.attribute += f), u2 = "attribute";
            } else if (!o.value && o.value !== "" || u2 === "value" && !I) {
              var b = (0, DA.unesc)(f), D = (0, DA.getProp)(o, "raws", "value") || "", h2 = o.value || "";
              o.value = h2 + b, o.quoteMark = null, (b !== f || D) && ((0, DA.ensureObject)(o, "raws"), o.raws.value = (D || h2) + f), u2 = "value";
            } else {
              var v2 = f === "i" || f === "I";
              (o.value || o.value === "") && (o.quoteMark || I) ? (o.insensitive = v2, (!v2 || f === "I") && ((0, DA.ensureObject)(o, "raws"), o.raws.insensitiveFlag = f), u2 = "insensitive", a && ((0, DA.ensureObject)(o, "spaces", "insensitive"), o.spaces.insensitive.before = a, a = ""), g2 && ((0, DA.ensureObject)(o, "raws", "spaces", "insensitive"), o.raws.spaces.insensitive.before = g2, g2 = "")) : (o.value || o.value === "") && (u2 = "value", o.value += f, o.raws.value && (o.raws.value += f));
            }
            I = false;
            break;
          case T.str:
            if (!o.attribute || !o.operator) return this.error("Expected an attribute followed by an operator preceding the string.", { index: B[L.FIELDS.START_POS] });
            var F = (0, vu.unescapeValue)(f), K2 = F.unescaped, _ = F.quoteMark;
            o.value = K2, o.quoteMark = _, u2 = "value", (0, DA.ensureObject)(o, "raws"), o.raws.value = f, I = false;
            break;
          case T.equals:
            if (!o.attribute) return this.expected("attribute", B[L.FIELDS.START_POS], f);
            if (o.value) return this.error('Unexpected "=" found; an operator was already defined.', { index: B[L.FIELDS.START_POS] });
            o.operator = o.operator ? o.operator + f : f, u2 = "operator", I = false;
            break;
          case T.comment:
            if (u2) if (I || E && E[L.FIELDS.TYPE] === T.space || u2 === "insensitive") {
              var AA = (0, DA.getProp)(o, "spaces", u2, "after") || "", EA = (0, DA.getProp)(o, "raws", "spaces", u2, "after") || AA;
              (0, DA.ensureObject)(o, "raws", "spaces", u2), o.raws.spaces[u2].after = EA + f;
            } else {
              var iA = o[u2] || "", lA = (0, DA.getProp)(o, "raws", u2) || iA;
              (0, DA.ensureObject)(o, "raws"), o.raws[u2] = lA + f;
            }
            else g2 = g2 + f;
            break;
          default:
            return this.error('Unexpected "' + f + '" found.', { index: B[L.FIELDS.START_POS] });
        }
        s++;
      }
      _t(o, "attribute"), _t(o, "namespace"), this.newNode(new vu.default(o)), this.position++;
    }, e.parseWhitespaceEquivalentTokens = function(r) {
      r < 0 && (r = this.tokens.length);
      var n = this.position, i2 = [], o = "", s = void 0;
      do
        if (Wo[this.currToken[L.FIELDS.TYPE]]) this.options.lossy || (o += this.content());
        else if (this.currToken[L.FIELDS.TYPE] === T.comment) {
          var a = {};
          o && (a.before = o, o = ""), s = new ku.default({ value: this.content(), source: Pt(this.currToken), sourceIndex: this.currToken[L.FIELDS.START_POS], spaces: a }), i2.push(s);
        }
      while (++this.position < r);
      if (o) {
        if (s) s.spaces.after = o;
        else if (!this.options.lossy) {
          var g2 = this.tokens[n], u2 = this.tokens[this.position - 1];
          i2.push(new To.default({ value: "", source: dt(g2[L.FIELDS.START_LINE], g2[L.FIELDS.START_COL], u2[L.FIELDS.END_LINE], u2[L.FIELDS.END_COL]), sourceIndex: g2[L.FIELDS.START_POS], spaces: { before: o, after: "" } }));
        }
      }
      return i2;
    }, e.convertWhitespaceNodesToSpace = function(r, n) {
      var i2 = this;
      n === void 0 && (n = false);
      var o = "", s = "";
      r.forEach(function(g2) {
        var u2 = i2.lossySpace(g2.spaces.before, n), I = i2.lossySpace(g2.rawSpaceBefore, n);
        o += u2 + i2.lossySpace(g2.spaces.after, n && u2.length === 0), s += u2 + g2.value + i2.lossySpace(g2.rawSpaceAfter, n && I.length === 0);
      }), s === o && (s = void 0);
      var a = { space: o, rawSpace: s };
      return a;
    }, e.isNamedCombinator = function(r) {
      return r === void 0 && (r = this.position), this.tokens[r + 0] && this.tokens[r + 0][L.FIELDS.TYPE] === T.slash && this.tokens[r + 1] && this.tokens[r + 1][L.FIELDS.TYPE] === T.word && this.tokens[r + 2] && this.tokens[r + 2][L.FIELDS.TYPE] === T.slash;
    }, e.namedCombinator = function() {
      if (this.isNamedCombinator()) {
        var r = this.content(this.tokens[this.position + 1]), n = (0, DA.unesc)(r).toLowerCase(), i2 = {};
        n !== r && (i2.value = "/" + r + "/");
        var o = new Po.default({ value: "/" + n + "/", source: dt(this.currToken[L.FIELDS.START_LINE], this.currToken[L.FIELDS.START_COL], this.tokens[this.position + 2][L.FIELDS.END_LINE], this.tokens[this.position + 2][L.FIELDS.END_COL]), sourceIndex: this.currToken[L.FIELDS.START_POS], raws: i2 });
        return this.position = this.position + 3, o;
      } else this.unexpected();
    }, e.combinator = function() {
      var r = this;
      if (this.content() === "|") return this.namespace();
      var n = this.locateNextMeaningfulToken(this.position);
      if (n < 0 || this.tokens[n][L.FIELDS.TYPE] === T.comma) {
        var i2 = this.parseWhitespaceEquivalentTokens(n);
        if (i2.length > 0) {
          var o = this.current.last;
          if (o) {
            var s = this.convertWhitespaceNodesToSpace(i2), a = s.space, g2 = s.rawSpace;
            g2 !== void 0 && (o.rawSpaceAfter += g2), o.spaces.after += a;
          } else i2.forEach(function(D) {
            return r.newNode(D);
          });
        }
        return;
      }
      var u2 = this.currToken, I = void 0;
      n > this.position && (I = this.parseWhitespaceEquivalentTokens(n));
      var B;
      if (this.isNamedCombinator() ? B = this.namedCombinator() : this.currToken[L.FIELDS.TYPE] === T.combinator ? (B = new Po.default({ value: this.content(), source: Pt(this.currToken), sourceIndex: this.currToken[L.FIELDS.START_POS] }), this.position++) : Wo[this.currToken[L.FIELDS.TYPE]] || I || this.unexpected(), B) {
        if (I) {
          var f = this.convertWhitespaceNodesToSpace(I), E = f.space, C = f.rawSpace;
          B.spaces.before = E, B.rawSpaceBefore = C;
        }
      } else {
        var p = this.convertWhitespaceNodesToSpace(I, true), m2 = p.space, x3 = p.rawSpace;
        x3 || (x3 = m2);
        var w2 = {}, b = { spaces: {} };
        m2.endsWith(" ") && x3.endsWith(" ") ? (w2.before = m2.slice(0, m2.length - 1), b.spaces.before = x3.slice(0, x3.length - 1)) : m2.startsWith(" ") && x3.startsWith(" ") ? (w2.after = m2.slice(1), b.spaces.after = x3.slice(1)) : b.value = x3, B = new Po.default({ value: " ", source: Jo(u2, this.tokens[this.position - 1]), sourceIndex: u2[L.FIELDS.START_POS], spaces: w2, raws: b });
      }
      return this.currToken && this.currToken[L.FIELDS.TYPE] === T.space && (B.spaces.after = this.optionalSpace(this.content()), this.position++), this.newNode(B);
    }, e.comma = function() {
      if (this.position === this.tokens.length - 1) {
        this.root.trailingComma = true, this.position++;
        return;
      }
      this.current._inferEndPosition();
      var r = new Oo.default({ source: { start: Fu(this.tokens[this.position + 1]) } });
      this.current.parent.append(r), this.current = r, this.position++;
    }, e.comment = function() {
      var r = this.currToken;
      this.newNode(new ku.default({ value: this.content(), source: Pt(r), sourceIndex: r[L.FIELDS.START_POS] })), this.position++;
    }, e.error = function(r, n) {
      throw this.root.error(r, n);
    }, e.missingBackslash = function() {
      return this.error("Expected a backslash preceding the semicolon.", { index: this.currToken[L.FIELDS.START_POS] });
    }, e.missingParenthesis = function() {
      return this.expected("opening parenthesis", this.currToken[L.FIELDS.START_POS]);
    }, e.missingSquareBracket = function() {
      return this.expected("opening square bracket", this.currToken[L.FIELDS.START_POS]);
    }, e.unexpected = function() {
      return this.error("Unexpected '" + this.content() + "'. Escaping special characters with \\ may help.", this.currToken[L.FIELDS.START_POS]);
    }, e.namespace = function() {
      var r = this.prevToken && this.content(this.prevToken) || true;
      if (this.nextToken[L.FIELDS.TYPE] === T.word) return this.position++, this.word(r);
      if (this.nextToken[L.FIELDS.TYPE] === T.asterisk) return this.position++, this.universal(r);
    }, e.nesting = function() {
      if (this.nextToken) {
        var r = this.content(this.nextToken);
        if (r === "|") {
          this.position++;
          return;
        }
      }
      var n = this.currToken;
      this.newNode(new HQ.default({ value: this.content(), source: Pt(n), sourceIndex: n[L.FIELDS.START_POS] })), this.position++;
    }, e.parentheses = function() {
      var r = this.current.last, n = 1;
      if (this.position++, r && r.type === TQ.PSEUDO) {
        var i2 = new Oo.default({ source: { start: Fu(this.tokens[this.position - 1]) } }), o = this.current;
        for (r.append(i2), this.current = i2; this.position < this.tokens.length && n; ) this.currToken[L.FIELDS.TYPE] === T.openParenthesis && n++, this.currToken[L.FIELDS.TYPE] === T.closeParenthesis && n--, n ? this.parse() : (this.current.source.end = Nu(this.currToken), this.current.parent.source.end = Nu(this.currToken), this.position++);
        this.current = o;
      } else {
        for (var s = this.currToken, a = "(", g2; this.position < this.tokens.length && n; ) this.currToken[L.FIELDS.TYPE] === T.openParenthesis && n++, this.currToken[L.FIELDS.TYPE] === T.closeParenthesis && n--, g2 = this.currToken, a += this.parseParenthesisToken(this.currToken), this.position++;
        r ? r.appendToPropertyAndEscape("value", a, a) : this.newNode(new To.default({ value: a, source: dt(s[L.FIELDS.START_LINE], s[L.FIELDS.START_COL], g2[L.FIELDS.END_LINE], g2[L.FIELDS.END_COL]), sourceIndex: s[L.FIELDS.START_POS] }));
      }
      if (n) return this.expected("closing parenthesis", this.currToken[L.FIELDS.START_POS]);
    }, e.pseudo = function() {
      for (var r = this, n = "", i2 = this.currToken; this.currToken && this.currToken[L.FIELDS.TYPE] === T.colon; ) n += this.content(), this.position++;
      if (!this.currToken) return this.expected(["pseudo-class", "pseudo-element"], this.position - 1);
      if (this.currToken[L.FIELDS.TYPE] === T.word) this.splitWord(false, function(o, s) {
        n += o, r.newNode(new GQ.default({ value: n, source: Jo(i2, r.currToken), sourceIndex: i2[L.FIELDS.START_POS] })), s > 1 && r.nextToken && r.nextToken[L.FIELDS.TYPE] === T.openParenthesis && r.error("Misplaced parenthesis.", { index: r.nextToken[L.FIELDS.START_POS] });
      });
      else return this.expected(["pseudo-class", "pseudo-element"], this.currToken[L.FIELDS.START_POS]);
    }, e.space = function() {
      var r = this.content();
      this.position === 0 || this.prevToken[L.FIELDS.TYPE] === T.comma || this.prevToken[L.FIELDS.TYPE] === T.openParenthesis || this.current.nodes.every(function(n) {
        return n.type === "comment";
      }) ? (this.spaces = this.optionalSpace(r), this.position++) : this.position === this.tokens.length - 1 || this.nextToken[L.FIELDS.TYPE] === T.comma || this.nextToken[L.FIELDS.TYPE] === T.closeParenthesis ? (this.current.last.spaces.after = this.optionalSpace(r), this.position++) : this.combinator();
    }, e.string = function() {
      var r = this.currToken;
      this.newNode(new To.default({ value: this.content(), source: Pt(r), sourceIndex: r[L.FIELDS.START_POS] })), this.position++;
    }, e.universal = function(r) {
      var n = this.nextToken;
      if (n && this.content(n) === "|") return this.position++, this.namespace();
      var i2 = this.currToken;
      this.newNode(new UQ.default({ value: this.content(), source: Pt(i2), sourceIndex: i2[L.FIELDS.START_POS] }), r), this.position++;
    }, e.splitWord = function(r, n) {
      for (var i2 = this, o = this.nextToken, s = this.content(); o && ~[T.dollar, T.caret, T.equals, T.word].indexOf(o[L.FIELDS.TYPE]); ) {
        this.position++;
        var a = this.content();
        if (s += a, a.lastIndexOf("\\") === a.length - 1) {
          var g2 = this.nextToken;
          g2 && g2[L.FIELDS.TYPE] === T.space && (s += this.requiredSpace(this.content(g2)), this.position++);
        }
        o = this.nextToken;
      }
      var u2 = Ko(s, ".").filter(function(E) {
        var C = s[E - 1] === "\\", p = /^\d+\.\d+%$/.test(s);
        return !C && !p;
      }), I = Ko(s, "#").filter(function(E) {
        return s[E - 1] !== "\\";
      }), B = Ko(s, "#{");
      B.length && (I = I.filter(function(E) {
        return !~B.indexOf(E);
      }));
      var f = (0, OQ.default)(JQ([0].concat(u2, I)));
      f.forEach(function(E, C) {
        var p = f[C + 1] || s.length, m2 = s.slice(E, p);
        if (C === 0 && n) return n.call(i2, m2, f.length);
        var x3, w2 = i2.currToken, b = w2[L.FIELDS.START_POS] + f[C], D = dt(w2[1], w2[2] + E, w2[3], w2[2] + (p - 1));
        if (~u2.indexOf(E)) {
          var h2 = { value: m2.slice(1), source: D, sourceIndex: b };
          x3 = new NQ.default(_t(h2, "value"));
        } else if (~I.indexOf(E)) {
          var v2 = { value: m2.slice(1), source: D, sourceIndex: b };
          x3 = new MQ.default(_t(v2, "value"));
        } else {
          var F = { value: m2, source: D, sourceIndex: b };
          _t(F, "value"), x3 = new LQ.default(F);
        }
        i2.newNode(x3, r), r = null;
      }), this.position++;
    }, e.word = function(r) {
      var n = this.nextToken;
      return n && this.content(n) === "|" ? (this.position++, this.namespace()) : this.splitWord(r);
    }, e.loop = function() {
      for (; this.position < this.tokens.length; ) this.parse(true);
      return this.current._inferEndPosition(), this.root;
    }, e.parse = function(r) {
      switch (this.currToken[L.FIELDS.TYPE]) {
        case T.space:
          this.space();
          break;
        case T.comment:
          this.comment();
          break;
        case T.openParenthesis:
          this.parentheses();
          break;
        case T.closeParenthesis:
          r && this.missingParenthesis();
          break;
        case T.openSquare:
          this.attribute();
          break;
        case T.dollar:
        case T.caret:
        case T.equals:
        case T.word:
          this.word();
          break;
        case T.colon:
          this.pseudo();
          break;
        case T.comma:
          this.comma();
          break;
        case T.asterisk:
          this.universal();
          break;
        case T.ampersand:
          this.nesting();
          break;
        case T.slash:
        case T.combinator:
          this.combinator();
          break;
        case T.str:
          this.string();
          break;
        case T.closeSquare:
          this.missingSquareBracket();
        case T.semicolon:
          this.missingBackslash();
        default:
          this.unexpected();
      }
    }, e.expected = function(r, n, i2) {
      if (Array.isArray(r)) {
        var o = r.pop();
        r = r.join(", ") + " or " + o;
      }
      var s = /^[aeiou]/.test(r[0]) ? "an" : "a";
      return i2 ? this.error("Expected " + s + " " + r + ', found "' + i2 + '" instead.', { index: n }) : this.error("Expected " + s + " " + r + ".", { index: n });
    }, e.requiredSpace = function(r) {
      return this.options.lossy ? " " : r;
    }, e.optionalSpace = function(r) {
      return this.options.lossy ? "" : r;
    }, e.lossySpace = function(r, n) {
      return this.options.lossy ? n ? " " : "" : r;
    }, e.parseParenthesisToken = function(r) {
      var n = this.content(r);
      return r[L.FIELDS.TYPE] === T.space ? this.requiredSpace(n) : n;
    }, e.newNode = function(r, n) {
      return n && (/^ +$/.test(n) && (this.options.lossy || (this.spaces = (this.spaces || "") + n), n = true), r.namespace = n, _t(r, "namespace")), this.spaces && (r.spaces.before = this.spaces, this.spaces = ""), this.current.append(r);
    }, e.content = function(r) {
      return r === void 0 && (r = this.currToken), this.css.slice(r[L.FIELDS.START_POS], r[L.FIELDS.END_POS]);
    }, e.locateNextMeaningfulToken = function(r) {
      r === void 0 && (r = this.position + 1);
      for (var n = r; n < this.tokens.length; ) if (_Q[this.tokens[n][L.FIELDS.TYPE]]) {
        n++;
        continue;
      } else return n;
      return -1;
    }, PQ(A, [{ key: "currToken", get: function() {
      return this.tokens[this.position];
    } }, { key: "nextToken", get: function() {
      return this.tokens[this.position + 1];
    } }, { key: "prevToken", get: function() {
      return this.tokens[this.position - 1];
    } }]), A;
  })();
  Rr.default = KQ;
  Lu.exports = Rr.default;
});
var Hu = W((Fr, Uu) => {
  "use strict";
  Fr.__esModule = true;
  Fr.default = void 0;
  var WQ = YQ(Gu());
  function YQ(A) {
    return A && A.__esModule ? A : { default: A };
  }
  var qQ = (function() {
    function A(t, r) {
      this.func = t || function() {
      }, this.funcRes = null, this.options = r;
    }
    var e = A.prototype;
    return e._shouldUpdateSelector = function(r, n) {
      n === void 0 && (n = {});
      var i2 = Object.assign({}, this.options, n);
      return i2.updateSelector === false ? false : typeof r != "string";
    }, e._isLossy = function(r) {
      r === void 0 && (r = {});
      var n = Object.assign({}, this.options, r);
      return n.lossless === false;
    }, e._root = function(r, n) {
      n === void 0 && (n = {});
      var i2 = new WQ.default(r, this._parseOptions(n));
      return i2.root;
    }, e._parseOptions = function(r) {
      return { lossy: this._isLossy(r) };
    }, e._run = function(r, n) {
      var i2 = this;
      return n === void 0 && (n = {}), new Promise(function(o, s) {
        try {
          var a = i2._root(r, n);
          Promise.resolve(i2.func(a)).then(function(g2) {
            var u2 = void 0;
            return i2._shouldUpdateSelector(r, n) && (u2 = a.toString(), r.selector = u2), { transform: g2, root: a, string: u2 };
          }).then(o, s);
        } catch (g2) {
          s(g2);
          return;
        }
      });
    }, e._runSync = function(r, n) {
      n === void 0 && (n = {});
      var i2 = this._root(r, n), o = this.func(i2);
      if (o && typeof o.then == "function") throw new Error("Selector processor returned a promise to a synchronous call.");
      var s = void 0;
      return n.updateSelector && typeof r != "string" && (s = i2.toString(), r.selector = s), { transform: o, root: i2, string: s };
    }, e.ast = function(r, n) {
      return this._run(r, n).then(function(i2) {
        return i2.root;
      });
    }, e.astSync = function(r, n) {
      return this._runSync(r, n).root;
    }, e.transform = function(r, n) {
      return this._run(r, n).then(function(i2) {
        return i2.transform;
      });
    }, e.transformSync = function(r, n) {
      return this._runSync(r, n).transform;
    }, e.process = function(r, n) {
      return this._run(r, n).then(function(i2) {
        return i2.string || i2.root.toString();
      });
    }, e.processSync = function(r, n) {
      var i2 = this._runSync(r, n);
      return i2.string || i2.root.toString();
    }, A;
  })();
  Fr.default = qQ;
  Uu.exports = Fr.default;
});
var Ou = W((hA) => {
  "use strict";
  hA.__esModule = true;
  hA.universal = hA.tag = hA.string = hA.selector = hA.root = hA.pseudo = hA.nesting = hA.id = hA.comment = hA.combinator = hA.className = hA.attribute = void 0;
  var XQ = Ee(vo()), VQ = Ee(lo()), zQ = Ee(Mo()), ZQ = Ee(fo()), jQ = Ee(Eo()), $Q = Ee(Go()), AC = Ee(wo()), eC = Ee(so()), tC = Ee(go()), rC = Ee(mo()), nC = Ee(po()), iC = Ee(Fo());
  function Ee(A) {
    return A && A.__esModule ? A : { default: A };
  }
  var oC = function(e) {
    return new XQ.default(e);
  };
  hA.attribute = oC;
  var sC = function(e) {
    return new VQ.default(e);
  };
  hA.className = sC;
  var aC = function(e) {
    return new zQ.default(e);
  };
  hA.combinator = aC;
  var gC = function(e) {
    return new ZQ.default(e);
  };
  hA.comment = gC;
  var uC = function(e) {
    return new jQ.default(e);
  };
  hA.id = uC;
  var IC = function(e) {
    return new $Q.default(e);
  };
  hA.nesting = IC;
  var lC = function(e) {
    return new AC.default(e);
  };
  hA.pseudo = lC;
  var cC = function(e) {
    return new eC.default(e);
  };
  hA.root = cC;
  var fC = function(e) {
    return new tC.default(e);
  };
  hA.selector = fC;
  var BC = function(e) {
    return new rC.default(e);
  };
  hA.string = BC;
  var EC = function(e) {
    return new nC.default(e);
  };
  hA.tag = EC;
  var QC = function(e) {
    return new iC.default(e);
  };
  hA.universal = QC;
});
var Ju = W((sA) => {
  "use strict";
  sA.__esModule = true;
  sA.isNode = Yo;
  sA.isPseudoElement = _u;
  sA.isPseudoClass = xC;
  sA.isContainer = kC;
  sA.isNamespace = vC;
  sA.isUniversal = sA.isTag = sA.isString = sA.isSelector = sA.isRoot = sA.isPseudo = sA.isNesting = sA.isIdentifier = sA.isComment = sA.isCombinator = sA.isClassName = sA.isAttribute = void 0;
  var bA = KA(), Ae, CC = (Ae = {}, Ae[bA.ATTRIBUTE] = true, Ae[bA.CLASS] = true, Ae[bA.COMBINATOR] = true, Ae[bA.COMMENT] = true, Ae[bA.ID] = true, Ae[bA.NESTING] = true, Ae[bA.PSEUDO] = true, Ae[bA.ROOT] = true, Ae[bA.SELECTOR] = true, Ae[bA.STRING] = true, Ae[bA.TAG] = true, Ae[bA.UNIVERSAL] = true, Ae);
  function Yo(A) {
    return typeof A == "object" && CC[A.type];
  }
  function Qe(A, e) {
    return Yo(e) && e.type === A;
  }
  var Tu = Qe.bind(null, bA.ATTRIBUTE);
  sA.isAttribute = Tu;
  var dC = Qe.bind(null, bA.CLASS);
  sA.isClassName = dC;
  var pC = Qe.bind(null, bA.COMBINATOR);
  sA.isCombinator = pC;
  var hC = Qe.bind(null, bA.COMMENT);
  sA.isComment = hC;
  var mC = Qe.bind(null, bA.ID);
  sA.isIdentifier = mC;
  var yC = Qe.bind(null, bA.NESTING);
  sA.isNesting = yC;
  var qo = Qe.bind(null, bA.PSEUDO);
  sA.isPseudo = qo;
  var wC = Qe.bind(null, bA.ROOT);
  sA.isRoot = wC;
  var DC = Qe.bind(null, bA.SELECTOR);
  sA.isSelector = DC;
  var bC = Qe.bind(null, bA.STRING);
  sA.isString = bC;
  var Pu = Qe.bind(null, bA.TAG);
  sA.isTag = Pu;
  var SC = Qe.bind(null, bA.UNIVERSAL);
  sA.isUniversal = SC;
  function _u(A) {
    return qo(A) && A.value && (A.value.startsWith("::") || A.value.toLowerCase() === ":before" || A.value.toLowerCase() === ":after" || A.value.toLowerCase() === ":first-letter" || A.value.toLowerCase() === ":first-line");
  }
  function xC(A) {
    return qo(A) && !_u(A);
  }
  function kC(A) {
    return !!(Yo(A) && A.walk);
  }
  function vC(A) {
    return Tu(A) || Pu(A);
  }
});
var Ku = W((Se) => {
  "use strict";
  Se.__esModule = true;
  var Xo = KA();
  Object.keys(Xo).forEach(function(A) {
    A === "default" || A === "__esModule" || A in Se && Se[A] === Xo[A] || (Se[A] = Xo[A]);
  });
  var Vo = Ou();
  Object.keys(Vo).forEach(function(A) {
    A === "default" || A === "__esModule" || A in Se && Se[A] === Vo[A] || (Se[A] = Vo[A]);
  });
  var zo = Ju();
  Object.keys(zo).forEach(function(A) {
    A === "default" || A === "__esModule" || A in Se && Se[A] === zo[A] || (Se[A] = zo[A]);
  });
});
var qu = W((Nr, Yu) => {
  "use strict";
  Nr.__esModule = true;
  Nr.default = void 0;
  var RC = MC(Hu()), FC = NC(Ku());
  function Wu() {
    if (typeof WeakMap != "function") return null;
    var A = /* @__PURE__ */ new WeakMap();
    return Wu = function() {
      return A;
    }, A;
  }
  function NC(A) {
    if (A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var e = Wu();
    if (e && e.has(A)) return e.get(A);
    var t = {}, r = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var n in A) if (Object.prototype.hasOwnProperty.call(A, n)) {
      var i2 = r ? Object.getOwnPropertyDescriptor(A, n) : null;
      i2 && (i2.get || i2.set) ? Object.defineProperty(t, n, i2) : t[n] = A[n];
    }
    return t.default = A, e && e.set(A, t), t;
  }
  function MC(A) {
    return A && A.__esModule ? A : { default: A };
  }
  var Zo = function(e) {
    return new RC.default(e);
  };
  Object.assign(Zo, FC);
  delete Zo.__esModule;
  var LC = Zo;
  Nr.default = LC;
  Yu.exports = Nr.default;
});
var Xu = W((jo) => {
  "use strict";
  Object.defineProperty(jo, "__esModule", { value: true });
  Object.defineProperty(jo, "default", { enumerable: true, get: () => GC });
  function GC(A) {
    return A.replace(/\\,/g, "\\2c ");
  }
});
var zu = W((ky, Vu) => {
  "use strict";
  Vu.exports = { aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255], aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220], bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205], blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42], burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0], chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237], cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255], darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11], darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169], darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139], darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209], darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255], dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255], firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34], fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255], gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128], honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92], indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140], lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0], lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128], lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193], lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250], lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222], lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50], linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0], mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238], mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133], midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225], moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128], oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35], orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214], palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238], palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185], peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221], powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153], red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225], saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96], seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45], silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205], slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250], springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140], teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71], turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179], white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0], yellowgreen: [154, 205, 50] };
});
var As = W(($o) => {
  "use strict";
  Object.defineProperty($o, "__esModule", { value: true });
  function UC(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  UC($o, { parseColor: () => JC, formatColor: () => KC });
  var Zu = HC(zu());
  function HC(A) {
    return A && A.__esModule ? A : { default: A };
  }
  var OC = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i, TC = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i, tt = /(?:\d+|\d*\.\d+)%?/, qn = /(?:\s*,\s*|\s+)/, ju = /\s*[,/]\s*/, rt = /var\(--(?:[^ )]*?)\)/, PC = new RegExp(`^(rgb)a?\\(\\s*(${tt.source}|${rt.source})(?:${qn.source}(${tt.source}|${rt.source}))?(?:${qn.source}(${tt.source}|${rt.source}))?(?:${ju.source}(${tt.source}|${rt.source}))?\\s*\\)$`), _C = new RegExp(`^(hsl)a?\\(\\s*((?:${tt.source})(?:deg|rad|grad|turn)?|${rt.source})(?:${qn.source}(${tt.source}|${rt.source}))?(?:${qn.source}(${tt.source}|${rt.source}))?(?:${ju.source}(${tt.source}|${rt.source}))?\\s*\\)$`);
  function JC(A, { loose: e = false } = {}) {
    var t, r;
    if (typeof A != "string") return null;
    if (A = A.trim(), A === "transparent") return { mode: "rgb", color: ["0", "0", "0"], alpha: "0" };
    if (A in Zu.default) return { mode: "rgb", color: Zu.default[A].map((a) => a.toString()) };
    let n = A.replace(TC, (a, g2, u2, I, B) => ["#", g2, g2, u2, u2, I, I, B ? B + B : ""].join("")).match(OC);
    if (n !== null) return { mode: "rgb", color: [parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16)].map((a) => a.toString()), alpha: n[4] ? (parseInt(n[4], 16) / 255).toString() : void 0 };
    var i2;
    let o = (i2 = A.match(PC)) !== null && i2 !== void 0 ? i2 : A.match(_C);
    if (o === null) return null;
    let s = [o[2], o[3], o[4]].filter(Boolean).map((a) => a.toString());
    return !e && s.length !== 3 || s.length < 3 && !s.some((a) => /^var\(.*?\)$/.test(a)) ? null : { mode: o[1], color: s, alpha: (t = o[5]) === null || t === void 0 || (r = t.toString) === null || r === void 0 ? void 0 : r.call(t) };
  }
  function KC({ mode: A, color: e, alpha: t }) {
    let r = t !== void 0;
    return `${A}(${e.join(" ")}${r ? ` / ${t}` : ""})`;
  }
});
var ts = W((es) => {
  "use strict";
  Object.defineProperty(es, "__esModule", { value: true });
  function WC(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  WC(es, { withAlphaValue: () => YC, default: () => qC });
  var Xn = As();
  function YC(A, e, t) {
    if (typeof A == "function") return A({ opacityValue: e });
    let r = (0, Xn.parseColor)(A, { loose: true });
    return r === null ? t : (0, Xn.formatColor)({ ...r, alpha: e });
  }
  function qC({ color: A, property: e, variable: t }) {
    let r = [].concat(e);
    if (typeof A == "function") return { [t]: "1", ...Object.fromEntries(r.map((i2) => [i2, A({ opacityVariable: t, opacityValue: `var(${t})` })])) };
    let n = (0, Xn.parseColor)(A);
    return n === null ? Object.fromEntries(r.map((i2) => [i2, A])) : n.alpha !== void 0 ? Object.fromEntries(r.map((i2) => [i2, A])) : { [t]: "1", ...Object.fromEntries(r.map((i2) => [i2, (0, Xn.formatColor)({ ...n, alpha: `var(${t})` })])) };
  }
});
var rI = W((rs) => {
  "use strict";
  Object.defineProperty(rs, "__esModule", { value: true });
  function XC(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  XC(rs, { pattern: () => zC, withoutCapturing: () => AI, any: () => eI, optional: () => ZC, zeroOrMore: () => jC, nestedBrackets: () => tI, escape: () => pt });
  var $u = /[\\^$.*+?()[\]{}|]/g, VC = RegExp($u.source);
  function Mr(A) {
    return A = Array.isArray(A) ? A : [A], A = A.map((e) => e instanceof RegExp ? e.source : e), A.join("");
  }
  function zC(A) {
    return new RegExp(Mr(A), "g");
  }
  function AI(A) {
    return new RegExp(`(?:${Mr(A)})`, "g");
  }
  function eI(A) {
    return `(?:${A.map(Mr).join("|")})`;
  }
  function ZC(A) {
    return `(?:${Mr(A)})?`;
  }
  function jC(A) {
    return `(?:${Mr(A)})*`;
  }
  function tI(A, e, t = 1) {
    return AI([pt(A), /[^\s]*/, t === 1 ? `[^${pt(A)}${pt(e)}s]*` : eI([`[^${pt(A)}${pt(e)}s]*`, tI(A, e, t - 1)]), /[^\s]*/, pt(e)]);
  }
  function pt(A) {
    return A && VC.test(A) ? A.replace($u, "\\$&") : A || "";
  }
});
var iI = W((ns) => {
  "use strict";
  Object.defineProperty(ns, "__esModule", { value: true });
  Object.defineProperty(ns, "splitAtTopLevelOnly", { enumerable: true, get: () => ed });
  var $C = Ad(rI());
  function nI(A) {
    if (typeof WeakMap != "function") return null;
    var e = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
    return (nI = function(r) {
      return r ? t : e;
    })(A);
  }
  function Ad(A, e) {
    if (!e && A && A.__esModule) return A;
    if (A === null || typeof A != "object" && typeof A != "function") return { default: A };
    var t = nI(e);
    if (t && t.has(A)) return t.get(A);
    var r = {}, n = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var i2 in A) if (i2 !== "default" && Object.prototype.hasOwnProperty.call(A, i2)) {
      var o = n ? Object.getOwnPropertyDescriptor(A, i2) : null;
      o && (o.get || o.set) ? Object.defineProperty(r, i2, o) : r[i2] = A[i2];
    }
    return r.default = A, t && t.set(A, r), r;
  }
  function* ed(A, e) {
    let t = new RegExp(`[(){}\\[\\]${$C.escape(e)}]`, "g"), r = 0, n = 0, i2 = false, o = 0, s = 0, a = e.length;
    for (let g2 of A.matchAll(t)) {
      let u2 = g2[0] === e[o], I = o === a - 1, B = u2 && I;
      g2[0] === "(" && r++, g2[0] === ")" && r--, g2[0] === "[" && r++, g2[0] === "]" && r--, g2[0] === "{" && r++, g2[0] === "}" && r--, u2 && r === 0 && (s === 0 && (s = g2.index), o++), B && r === 0 && (i2 = true, yield A.substring(n, s), n = s + a), o === a && (o = 0, s = 0);
    }
    i2 ? yield A.substring(n) : yield A;
  }
});
var sI = W((is) => {
  "use strict";
  Object.defineProperty(is, "__esModule", { value: true });
  function td2(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  td2(is, { parseBoxShadowValue: () => od, formatBoxShadowValue: () => sd });
  var rd = iI(), nd = /* @__PURE__ */ new Set(["inset", "inherit", "initial", "revert", "unset"]), id = /\ +(?![^(]*\))/g, oI = /^-?(\d+|\.\d+)(.*?)$/g;
  function od(A) {
    return Array.from((0, rd.splitAtTopLevelOnly)(A, ",")).map((t) => {
      let r = t.trim(), n = { raw: r }, i2 = r.split(id), o = /* @__PURE__ */ new Set();
      for (let s of i2) oI.lastIndex = 0, !o.has("KEYWORD") && nd.has(s) ? (n.keyword = s, o.add("KEYWORD")) : oI.test(s) ? o.has("X") ? o.has("Y") ? o.has("BLUR") ? o.has("SPREAD") || (n.spread = s, o.add("SPREAD")) : (n.blur = s, o.add("BLUR")) : (n.y = s, o.add("Y")) : (n.x = s, o.add("X")) : n.color ? (n.unknown || (n.unknown = []), n.unknown.push(s)) : n.color = s;
      return n.valid = n.x !== void 0 && n.y !== void 0, n;
    });
  }
  function sd(A) {
    return A.map((e) => e.valid ? [e.keyword, e.x, e.y, e.blur, e.spread, e.color].filter(Boolean).join(" ") : e.raw).join(", ");
  }
});
var fI = W((ss) => {
  "use strict";
  Object.defineProperty(ss, "__esModule", { value: true });
  function ad(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  ad(ss, { normalize: () => nt, url: () => uI, number: () => Id, percentage: () => II, length: () => lI, lineWidth: () => fd2, shadow: () => Bd, color: () => Ed, image: () => Qd, gradient: () => cI, position: () => pd, familyName: () => hd, genericName: () => yd, absoluteSize: () => Dd, relativeSize: () => Sd });
  var gd = As(), ud = sI(), os = ["min", "max", "clamp", "calc"], gI = /,(?![^(]*\))/g, Vn = /_(?![^(]*\))/g;
  function nt(A, e = true) {
    return A.includes("url(") ? A.split(/(url\(.*?\))/g).filter(Boolean).map((t) => /^url\(.*?\)$/.test(t) ? t : nt(t, false)).join("") : (A = A.replace(/([^\\])_+/g, (t, r) => r + " ".repeat(t.length - 1)).replace(/^_/g, " ").replace(/\\_/g, "_"), e && (A = A.trim()), A = A.replace(/(calc|min|max|clamp)\(.+\)/g, (t) => t.replace(/(-?\d*\.?\d(?!\b-.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, "$1 $2 ")), A);
  }
  function uI(A) {
    return A.startsWith("url(");
  }
  function Id(A) {
    return !isNaN(Number(A)) || os.some((e) => new RegExp(`^${e}\\(.+?`).test(A));
  }
  function II(A) {
    return A.split(Vn).every((e) => /%$/g.test(e) || os.some((t) => new RegExp(`^${t}\\(.+?%`).test(e)));
  }
  var ld = ["cm", "mm", "Q", "in", "pc", "pt", "px", "em", "ex", "ch", "rem", "lh", "vw", "vh", "vmin", "vmax"], aI = `(?:${ld.join("|")})`;
  function lI(A) {
    return A.split(Vn).every((e) => e === "0" || new RegExp(`${aI}$`).test(e) || os.some((t) => new RegExp(`^${t}\\(.+?${aI}`).test(e)));
  }
  var cd = /* @__PURE__ */ new Set(["thin", "medium", "thick"]);
  function fd2(A) {
    return cd.has(A);
  }
  function Bd(A) {
    let e = (0, ud.parseBoxShadowValue)(nt(A));
    for (let t of e) if (!t.valid) return false;
    return true;
  }
  function Ed(A) {
    let e = 0;
    return A.split(Vn).every((r) => (r = nt(r), r.startsWith("var(") ? true : (0, gd.parseColor)(r, { loose: true }) !== null ? (e++, true) : false)) ? e > 0 : false;
  }
  function Qd(A) {
    let e = 0;
    return A.split(gI).every((r) => (r = nt(r), r.startsWith("var(") ? true : uI(r) || cI(r) || ["element(", "image(", "cross-fade(", "image-set("].some((n) => r.startsWith(n)) ? (e++, true) : false)) ? e > 0 : false;
  }
  var Cd = /* @__PURE__ */ new Set(["linear-gradient", "radial-gradient", "repeating-linear-gradient", "repeating-radial-gradient", "conic-gradient"]);
  function cI(A) {
    A = nt(A);
    for (let e of Cd) if (A.startsWith(`${e}(`)) return true;
    return false;
  }
  var dd = /* @__PURE__ */ new Set(["center", "top", "right", "bottom", "left"]);
  function pd(A) {
    let e = 0;
    return A.split(Vn).every((r) => (r = nt(r), r.startsWith("var(") ? true : dd.has(r) || lI(r) || II(r) ? (e++, true) : false)) ? e > 0 : false;
  }
  function hd(A) {
    let e = 0;
    return A.split(gI).every((r) => (r = nt(r), r.startsWith("var(") ? true : r.includes(" ") && !/(['"])([^"']+)\1/g.test(r) || /^\d/g.test(r) ? false : (e++, true))) ? e > 0 : false;
  }
  var md = /* @__PURE__ */ new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "math", "emoji", "fangsong"]);
  function yd(A) {
    return md.has(A);
  }
  var wd = /* @__PURE__ */ new Set(["xx-small", "x-small", "small", "medium", "large", "x-large", "x-large", "xxx-large"]);
  function Dd(A) {
    return wd.has(A);
  }
  var bd = /* @__PURE__ */ new Set(["larger", "smaller"]);
  function Sd(A) {
    return bd.has(A);
  }
});
var mI = W((us) => {
  "use strict";
  Object.defineProperty(us, "__esModule", { value: true });
  function xd(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  xd(us, { updateAllClasses: () => Rd, asValue: () => Gr, parseColorFormat: () => as, asColor: () => dI, asLookupValue: () => pI, coerceValue: () => Ld });
  var kd = gs(qu()), vd = gs(Xu()), BI = ts(), ee = fI(), EI = gs(qi());
  function gs(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function Rd(A, e) {
    return (0, kd.default)((n) => {
      n.walkClasses((i2) => {
        let o = e(i2.value);
        i2.value = o, i2.raws && i2.raws.value && (i2.raws.value = (0, vd.default)(i2.raws.value));
      });
    }).processSync(A);
  }
  function CI(A, e) {
    if (!Lr(A)) return;
    let t = A.slice(1, -1);
    if (e(t)) return (0, ee.normalize)(t);
  }
  function Fd(A, e = {}, t) {
    let r = e[A];
    if (r !== void 0) return (0, EI.default)(r);
    if (Lr(A)) {
      let n = CI(A, t);
      return n === void 0 ? void 0 : (0, EI.default)(n);
    }
  }
  function Gr(A, e = {}, { validate: t = () => true } = {}) {
    var r;
    let n = (r = e.values) === null || r === void 0 ? void 0 : r[A];
    return n !== void 0 ? n : e.supportsNegativeValues && A.startsWith("-") ? Fd(A.slice(1), e.values, t) : CI(A, t);
  }
  function Lr(A) {
    return A.startsWith("[") && A.endsWith("]");
  }
  function Nd(A) {
    let e = A.lastIndexOf("/");
    return e === -1 || e === A.length - 1 ? [A] : [A.slice(0, e), A.slice(e + 1)];
  }
  function as(A) {
    if (typeof A == "string" && A.includes("<alpha-value>")) {
      let e = A;
      return ({ opacityValue: t = 1 }) => e.replace("<alpha-value>", t);
    }
    return A;
  }
  function dI(A, e = {}, { tailwindConfig: t = {} } = {}) {
    var r;
    if (((r = e.values) === null || r === void 0 ? void 0 : r[A]) !== void 0) {
      var n;
      return as((n = e.values) === null || n === void 0 ? void 0 : n[A]);
    }
    let [i2, o] = Nd(A);
    if (o !== void 0) {
      var s, a, g2, u2;
      let I = (u2 = (s = e.values) === null || s === void 0 ? void 0 : s[i2]) !== null && u2 !== void 0 ? u2 : Lr(i2) ? i2.slice(1, -1) : void 0;
      return I === void 0 ? void 0 : (I = as(I), Lr(o) ? (0, BI.withAlphaValue)(I, o.slice(1, -1)) : ((a = t.theme) === null || a === void 0 || (g2 = a.opacity) === null || g2 === void 0 ? void 0 : g2[o]) === void 0 ? void 0 : (0, BI.withAlphaValue)(I, t.theme.opacity[o]));
    }
    return Gr(A, e, { validate: ee.color });
  }
  function pI(A, e = {}) {
    var t;
    return (t = e.values) === null || t === void 0 ? void 0 : t[A];
  }
  function Ce(A) {
    return (e, t) => Gr(e, t, { validate: A });
  }
  var hI = { any: Gr, color: dI, url: Ce(ee.url), image: Ce(ee.image), length: Ce(ee.length), percentage: Ce(ee.percentage), position: Ce(ee.position), lookup: pI, "generic-name": Ce(ee.genericName), "family-name": Ce(ee.familyName), number: Ce(ee.number), "line-width": Ce(ee.lineWidth), "absolute-size": Ce(ee.absoluteSize), "relative-size": Ce(ee.relativeSize), shadow: Ce(ee.shadow) }, QI = Object.keys(hI);
  function Md(A, e) {
    let t = A.indexOf(e);
    return t === -1 ? [void 0, A] : [A.slice(0, t), A.slice(t + 1)];
  }
  function Ld(A, e, t, r) {
    if (Lr(e)) {
      let n = e.slice(1, -1), [i2, o] = Md(n, ":");
      if (!/^[\w-_]+$/g.test(i2)) o = n;
      else if (i2 !== void 0 && !QI.includes(i2)) return [];
      if (o.length > 0 && QI.includes(i2)) return [Gr(`[${o}]`, t), i2];
    }
    for (let n of [].concat(A)) {
      let i2 = hI[n](e, t, { tailwindConfig: r });
      if (i2 !== void 0) return [i2, n];
    }
    return [];
  }
});
var yI = W((Is) => {
  "use strict";
  Object.defineProperty(Is, "__esModule", { value: true });
  Object.defineProperty(Is, "default", { enumerable: true, get: () => Gd });
  function Gd(A) {
    return typeof A == "function" ? A({}) : A;
  }
});
var xI = W((cs) => {
  "use strict";
  Object.defineProperty(cs, "__esModule", { value: true });
  Object.defineProperty(cs, "default", { enumerable: true, get: () => tp });
  var Ud = ht(qi()), Hd = ht(Rg()), Od = ht(Fg()), Td = ht(zi()), Pd = ht(Mg()), bI = Lg(), wI = Gg(), _d = Hg(), Jd = ht(Og()), Kd = Tg(), Wd = mI(), Yd = ts(), qd = ht(yI());
  function ht(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function Jt(A) {
    return typeof A == "function";
  }
  function Ur(A) {
    return typeof A == "object" && A !== null;
  }
  function Hr(A, ...e) {
    let t = e.pop();
    for (let r of e) for (let n in r) {
      let i2 = t(A[n], r[n]);
      i2 === void 0 ? Ur(A[n]) && Ur(r[n]) ? A[n] = Hr(A[n], r[n], t) : A[n] = r[n] : A[n] = i2;
    }
    return A;
  }
  var ls = { colors: Pd.default, negative(A) {
    return Object.keys(A).filter((e) => A[e] !== "0").reduce((e, t) => {
      let r = (0, Ud.default)(A[t]);
      return r !== void 0 && (e[`-${t}`] = r), e;
    }, {});
  }, breakpoints(A) {
    return Object.keys(A).filter((e) => typeof A[e] == "string").reduce((e, t) => ({ ...e, [`screen-${t}`]: A[t] }), {});
  } };
  function Xd(A, ...e) {
    return Jt(A) ? A(...e) : A;
  }
  function Vd(A) {
    return A.reduce((e, { extend: t }) => Hr(e, t, (r, n) => r === void 0 ? [n] : Array.isArray(r) ? [n, ...r] : [n, r]), {});
  }
  function zd(A) {
    return { ...A.reduce((e, t) => (0, bI.defaults)(e, t), {}), extend: Vd(A) };
  }
  function DI(A, e) {
    if (Array.isArray(A) && Ur(A[0])) return A.concat(e);
    if (Array.isArray(e) && Ur(e[0]) && Ur(A)) return [A, ...e];
    if (Array.isArray(e)) return e;
  }
  function Zd({ extend: A, ...e }) {
    return Hr(e, A, (t, r) => !Jt(t) && !r.some(Jt) ? Hr({}, t, ...r, DI) : (n, i2) => Hr({}, ...[t, ...r].map((o) => Xd(o, n, i2)), DI));
  }
  function* jd(A) {
    let e = (0, wI.toPath)(A);
    if (e.length === 0 || (yield e, Array.isArray(A))) return;
    let t = /^(.*?)\s*\/\s*([^/]+)$/, r = A.match(t);
    if (r !== null) {
      let [, n, i2] = r, o = (0, wI.toPath)(n);
      o.alpha = i2, yield o;
    }
  }
  function $d(A) {
    let e = (t, r) => {
      for (let n of jd(t)) {
        let i2 = 0, o = A;
        for (; o != null && i2 < n.length; ) o = o[n[i2++]], o = Jt(o) && (n.alpha === void 0 || i2 <= n.length - 1) ? o(e, ls) : o;
        if (o !== void 0) {
          if (n.alpha !== void 0) {
            let s = (0, Wd.parseColorFormat)(o);
            return (0, Yd.withAlphaValue)(s, n.alpha, (0, qd.default)(s));
          }
          return (0, Jd.default)(o) ? (0, Kd.cloneDeep)(o) : o;
        }
      }
      return r;
    };
    return Object.assign(e, { theme: e, ...ls }), Object.keys(A).reduce((t, r) => (t[r] = Jt(A[r]) ? A[r](e, ls) : A[r], t), {});
  }
  function SI(A) {
    let e = [];
    return A.forEach((t) => {
      e = [...e, t];
      var r;
      let n = (r = t == null ? void 0 : t.plugins) !== null && r !== void 0 ? r : [];
      n.length !== 0 && n.forEach((i2) => {
        i2.__isOptionsFunction && (i2 = i2());
        var o;
        e = [...e, ...SI([(o = i2 == null ? void 0 : i2.config) !== null && o !== void 0 ? o : {}])];
      });
    }), e;
  }
  function Ap(A) {
    return [...A].reduceRight((t, r) => Jt(r) ? r({ corePlugins: t }) : (0, Od.default)(r, t), Hd.default);
  }
  function ep(A) {
    return [...A].reduceRight((t, r) => [...t, ...r], []);
  }
  function tp(A) {
    let e = [...SI(A), { prefix: "", important: false, separator: ":", variantOrder: Td.default.variantOrder }];
    var t, r;
    return (0, _d.normalizeConfig)((0, bI.defaults)({ theme: $d(Zd(zd(e.map((n) => (t = n == null ? void 0 : n.theme) !== null && t !== void 0 ? t : {})))), corePlugins: Ap(e.map((n) => n.corePlugins)), plugins: ep(A.map((n) => (r = n == null ? void 0 : n.plugins) !== null && r !== void 0 ? r : [])) }, ...e));
  }
});
var kI = {};
jr(kI, { default: () => rp });
var rp;
var vI = It(() => {
  rp = { yellow: (A) => A };
});
var MI = W((fs) => {
  "use strict";
  Object.defineProperty(fs, "__esModule", { value: true });
  function np(A, e) {
    for (var t in e) Object.defineProperty(A, t, { enumerable: true, get: e[t] });
  }
  np(fs, { flagEnabled: () => sp, issueFlagNotices: () => ap, default: () => gp });
  var ip = NI((vI(), $r(kI))), op = NI((Mn(), $r(Nn)));
  function NI(A) {
    return A && A.__esModule ? A : { default: A };
  }
  var RI = { optimizeUniversalDefaults: false }, Or = { future: ["hoverOnlyWhenSupported", "respectDefaultRingColorOpacity"], experimental: ["optimizeUniversalDefaults", "matchVariant"] };
  function sp(A, e) {
    if (Or.future.includes(e)) {
      var t, r, n;
      return A.future === "all" || ((n = (r = A == null || (t = A.future) === null || t === void 0 ? void 0 : t[e]) !== null && r !== void 0 ? r : RI[e]) !== null && n !== void 0 ? n : false);
    }
    if (Or.experimental.includes(e)) {
      var i2, o, s;
      return A.experimental === "all" || ((s = (o = A == null || (i2 = A.experimental) === null || i2 === void 0 ? void 0 : i2[e]) !== null && o !== void 0 ? o : RI[e]) !== null && s !== void 0 ? s : false);
    }
    return false;
  }
  function FI(A) {
    if (A.experimental === "all") return Or.experimental;
    var e;
    return Object.keys((e = A == null ? void 0 : A.experimental) !== null && e !== void 0 ? e : {}).filter((t) => Or.experimental.includes(t) && A.experimental[t]);
  }
  function ap(A) {
    if (process.env.JEST_WORKER_ID === void 0 && FI(A).length > 0) {
      let e = FI(A).map((t) => ip.default.yellow(t)).join(", ");
      op.default.warn("experimental-flags-enabled", [`You have enabled experimental features: ${e}`, "Experimental features in Tailwind CSS are not covered by semver, may introduce breaking changes, and can change at any time."]);
    }
  }
  var gp = Or;
});
var GI = W((Bs) => {
  "use strict";
  Object.defineProperty(Bs, "__esModule", { value: true });
  Object.defineProperty(Bs, "default", { enumerable: true, get: () => LI });
  var up = lp(zi()), Ip = MI();
  function lp(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function LI(A) {
    var e;
    let t = ((e = A == null ? void 0 : A.presets) !== null && e !== void 0 ? e : [up.default]).slice().reverse().flatMap((i2) => LI(typeof i2 == "function" ? i2() : i2)), r = { respectDefaultRingColorOpacity: { theme: { ringColor: { DEFAULT: "#3b82f67f" } } } }, n = Object.keys(r).filter((i2) => (0, Ip.flagEnabled)(A, i2)).map((i2) => r[i2]);
    return [A, ...n, ...t];
  }
});
var HI = W((Es) => {
  "use strict";
  Object.defineProperty(Es, "__esModule", { value: true });
  Object.defineProperty(Es, "default", { enumerable: true, get: () => Bp });
  var cp = UI(xI()), fp = UI(GI());
  function UI(A) {
    return A && A.__esModule ? A : { default: A };
  }
  function Bp(...A) {
    let [, ...e] = (0, fp.default)(A[0]);
    return (0, cp.default)([...A, ...e]);
  }
});
var TI = W((_y, OI) => {
  var Qs = HI();
  OI.exports = (Qs.__esModule ? Qs : { default: Qs }).default;
});
var Zt = (A, e) => () => (e || A((e = { exports: {} }).exports, e), e.exports);
var wl = Zt((A, e) => {
  e.exports = ["em", "ex", "ch", "rem", "vh", "vw", "vmin", "vmax", "px", "mm", "cm", "in", "pt", "pc", "mozmm"];
});
var Dl = Zt((A, e) => {
  e.exports = ["deg", "grad", "rad", "turn"];
});
var bl = Zt((A, e) => {
  e.exports = ["dpi", "dpcm", "dppx"];
});
var Sl = Zt((A, e) => {
  e.exports = ["Hz", "kHz"];
});
var xl = Zt((A, e) => {
  e.exports = ["s", "ms"];
});
var kl = wl();
var _s = Dl();
var Js = bl();
var Ks = Sl();
var Ws = xl();
function ei(A) {
  if (/\.\D?$/.test(A)) throw new Error("The dot should be followed by a number");
  if (/^[+-]{2}/.test(A)) throw new Error("Only one leading +/- is allowed");
  if (vl(A) > 1) throw new Error("Only one dot is allowed");
  if (/%$/.test(A)) {
    this.type = "percentage", this.value = Ai(A), this.unit = "%";
    return;
  }
  var e = Fl(A);
  if (!e) {
    this.type = "number", this.value = Ai(A);
    return;
  }
  this.type = Ml(e), this.value = Ai(A.substr(0, A.length - e.length)), this.unit = e;
}
ei.prototype.valueOf = function() {
  return this.value;
};
ei.prototype.toString = function() {
  return this.value + (this.unit || "");
};
function se(A) {
  return new ei(A);
}
function vl(A) {
  var e = A.match(/\./g);
  return e ? e.length : 0;
}
function Ai(A) {
  var e = parseFloat(A);
  if (isNaN(e)) throw new Error("Invalid number: " + A);
  return e;
}
var Rl = [].concat(_s, Ks, kl, Js, Ws);
function Fl(A) {
  var e = A.match(/\D+$/), t = e && e[0];
  if (t && Rl.indexOf(t) === -1) throw new Error("Invalid unit: " + t);
  return t;
}
var Nl = Object.assign(An(_s, "angle"), An(Ks, "frequency"), An(Js, "resolution"), An(Ws, "time"));
function An(A, e) {
  return Object.fromEntries(A.map((t) => [t, e]));
}
function Ml(A) {
  return Nl[A] || "length";
}
function xt(A) {
  let e = typeof A;
  return !(e === "number" || e === "bigint" || e === "string" || e === "boolean");
}
function Vs(A) {
  return /^class\s/.test(A.toString());
}
function ni(A) {
  return A && A.$$typeof === /* @__PURE__ */ Symbol.for("react.forward_ref");
}
function zs(A) {
  return typeof A == "function" || ni(A);
}
function Zs(A) {
  return "dangerouslySetInnerHTML" in A;
}
function js(A) {
  let e = typeof A > "u" ? [] : [].concat(A).flat(1 / 0), t = [];
  for (let r = 0; r < e.length; r++) {
    let n = e[r];
    typeof n > "u" || typeof n == "boolean" || n === null || (typeof n == "number" && (n = String(n)), typeof n == "string" && t.length && typeof t[t.length - 1] == "string" ? t[t.length - 1] += n : t.push(n));
  }
  return t;
}
function V(A, e, t, r, n = false) {
  if (typeof A == "number") return A;
  try {
    if (A = A.trim(), /[ /\(,]/.test(A)) return;
    if (A === String(+A)) return +A;
    let i2 = new se(A);
    if (i2.type === "length") switch (i2.unit) {
      case "em":
        return i2.value * e;
      case "rem":
        return i2.value * 16;
      case "vw":
        return ~~(i2.value * r._viewportWidth / 100);
      case "vh":
        return ~~(i2.value * r._viewportHeight / 100);
      default:
        return i2.value;
    }
    else {
      if (i2.type === "angle") return Te(A);
      if (i2.type === "percentage" && n) return i2.value / 100 * t;
    }
  } catch {
  }
}
function Te(A) {
  let e = new se(A);
  switch (e.unit) {
    case "deg":
      return e.value;
    case "rad":
      return e.value * 180 / Math.PI;
    case "turn":
      return e.value * 360;
    case "grad":
      return 0.9 * e.value;
  }
}
function ZA(A, e, t, r) {
  let n = e[A];
  if (typeof n > "u") {
    if (r && typeof A < "u") throw new Error(`Invalid value for CSS property "${r}". Allowed values: ${Object.keys(e).map((i2) => `"${i2}"`).join(" | ")}. Received: "${A}".`);
    n = t;
  }
  return n;
}
var ti;
var ri;
var $s = [32, 160, 4961, 65792, 65793, 4153, 4241, 10].map((A) => String.fromCodePoint(A));
var St = /* @__PURE__ */ new Map();
var Gl = 500;
function _A(A, e, t) {
  let r = `${e}:${t || ""}:${A}`;
  if (St.has(r)) return St.get(r);
  if (!ti || !ri) {
    if (!(typeof Intl < "u" && "Segmenter" in Intl)) throw new Error("Intl.Segmenter does not exist, please use import a polyfill.");
    ti = new Intl.Segmenter(t, { granularity: "word" }), ri = new Intl.Segmenter(t, { granularity: "grapheme" });
  }
  let n;
  if (e === "grapheme") n = [...ri.segment(A)].map((i2) => i2.segment);
  else {
    let i2 = [...ti.segment(A)].map((a) => a.segment), o = [], s = 0;
    for (; s < i2.length; ) {
      let a = i2[s];
      if (a == "\xA0") {
        let g2 = s === 0 ? "" : o.pop(), u2 = s === i2.length - 1 ? "" : i2[s + 1];
        o.push(g2 + "\xA0" + u2), s += 2;
      } else o.push(a), s++;
    }
    n = o;
  }
  if (St.size >= Gl) {
    let i2 = St.keys().next().value;
    St.delete(i2);
  }
  return St.set(r, n), n;
}
function R2(A, e, t) {
  qs(A, "element");
  let r = "";
  for (let [n, i2] of Object.entries(e)) typeof i2 < "u" && (qs(n, "attribute"), r += ` ${n}="${Ol(i2)}"`);
  return t ? `<${A}${r}>${t}</${A}>` : `<${A}${r}/>`;
}
var Aa = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var Ul = Aa + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var Hl = new RegExp("^[" + Aa + "][" + Ul + "]*$", "u");
var Ys = /* @__PURE__ */ new Set();
function qs(A, e) {
  if (!Ys.has(A)) {
    if (!Hl.test(A)) throw new Error(`Invalid XML ${e} name: ${JSON.stringify(A)}`);
    Ys.add(A);
  }
}
function Ol(A) {
  return typeof A == "number" || typeof A == "bigint" || typeof A == "boolean" ? "" + A : (0, import_escape_html.default)(String(A));
}
function ea(A) {
  return (0, import_escape_html.default)(String(A));
}
function ta(A = 20) {
  let e = /* @__PURE__ */ new Map();
  function t(i2) {
    let o = e.get(i2);
    if (o !== void 0) return e.delete(i2), e.set(i2, o), o;
  }
  function r(i2, o) {
    if (e.has(i2)) e.delete(i2);
    else if (e.size >= A) {
      let s = e.keys().next().value;
      e.delete(s);
    }
    e.set(i2, o);
  }
  function n() {
    e.clear();
  }
  return { set: r, get: t, clear: n };
}
function kt(A) {
  return A ? A.split(/[, ]/).filter(Boolean).map(Number) : null;
}
function en(A) {
  return typeof A == "string";
}
function ra(A) {
  return typeof A == "number";
}
function na(A) {
  return typeof A > "u";
}
function Pe(A, e) {
  if (typeof A == "number") return A;
  if (A.endsWith("%")) {
    let t = parseFloat(A.slice(0, -1));
    if (isNaN(t)) {
      console.warn(`Invalid value "${A}"${typeof e == "string" ? ` for "${e}"` : ""}. Expected a percentage value (e.g., "50%").`);
      return;
    }
    return `${t}%`;
  }
  console.warn(`Invalid value "${A}"${typeof e == "string" ? ` for "${e}"` : ""}. Expected a number or a percentage value (e.g., "50%").`);
}
function Ze(A, e) {
  if (typeof A == "number") return A;
  if (A === "auto") return "auto";
  if (A.endsWith("%")) {
    let t = parseFloat(A.slice(0, -1));
    if (isNaN(t)) {
      console.warn(`Invalid value "${A}"${typeof e == "string" ? ` for "${e}"` : ""}. Expected a percentage value (e.g., "50%").`);
      return;
    }
    return `${t}%`;
  }
  console.warn(`Invalid value "${A}"${typeof e == "string" ? ` for "${e}"` : ""}. Expected a number, "auto", or a percentage value (e.g., "50%").`);
}
function ia(A, e) {
  if (e === "break-all") return { words: _A(A, "grapheme"), requiredBreaks: [] };
  if (e === "keep-all") return { words: _A(A, "word"), requiredBreaks: [] };
  let t = new $557adaaeb0c7885f$exports(A), r = 0, n = t.nextBreak(), i2 = [], o = [false];
  for (; n; ) {
    let s = A.slice(r, n.position);
    i2.push(s), n.required ? o.push(true) : o.push(false), r = n.position, n = t.nextBreak();
  }
  return { words: i2, requiredBreaks: o };
}
var oa = (A) => A.replaceAll(/([A-Z])/g, (e, t) => `-${t.toLowerCase()}`);
function _e(A, e = ",") {
  let t = [], r = 0, n = 0;
  e = new RegExp(e);
  for (let i2 = 0; i2 < A.length; i2++) A[i2] === "(" ? n++ : A[i2] === ")" && n--, n === 0 && e.test(A[i2]) && (t.push(A.slice(r, i2).trim()), r = i2 + 1);
  return t.push(A.slice(r).trim()), t;
}
function je() {
  return Promise.resolve().then(() => (ci(), li)).then((A) => A.getYoga());
}
Promise.resolve().then(() => ci());
var Ea = /* @__PURE__ */ Symbol.for("react.fragment");
var on = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
var ql = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function fi(A) {
  let e = A.split(".").map((i2) => Number.parseInt(i2, 10));
  if (e.length !== 4 || e.some((i2) => !Number.isInteger(i2) || i2 < 0 || i2 > 255)) return true;
  let [t, r, n] = e;
  return t === 0 || t === 10 || t === 100 && r >= 64 && r <= 127 || t === 127 || t === 169 && r === 254 || t === 172 && r >= 16 && r <= 31 || t === 192 && r === 0 && n === 0 || t === 192 && r === 168 || t === 198 && (r === 18 || r === 19) || t >= 224;
}
function Xl(A) {
  let e = A, t = e.indexOf("%");
  t !== -1 && (e = e.slice(0, t));
  let r = e.split("::");
  if (r.length > 2) return null;
  let n = (o) => {
    if (o === "") return [];
    let s = [], a = o.split(":");
    for (let g2 = 0; g2 < a.length; g2++) {
      let u2 = a[g2];
      if (u2.includes(".")) {
        if (g2 !== a.length - 1 || !on.test(u2)) return null;
        let [I, B, f, E] = u2.split(".").map((C) => Number.parseInt(C, 10));
        if ([I, B, f, E].some((C) => !Number.isInteger(C) || C < 0 || C > 255)) return null;
        s.push(I << 8 | B, f << 8 | E);
        continue;
      }
      if (!/^[0-9a-f]{1,4}$/.test(u2)) return null;
      s.push(Number.parseInt(u2, 16));
    }
    return s;
  }, i2 = n(r[0]);
  if (i2 === null) return null;
  if (r.length === 2) {
    let o = n(r[1]);
    if (o === null) return null;
    let s = 8 - i2.length - o.length;
    return s < 0 ? null : [...i2, ...new Array(s).fill(0), ...o];
  }
  return i2.length === 8 ? i2 : null;
}
function Vl(A) {
  let e = (s) => A.slice(0, s).every((a) => a === 0);
  if (!(e(6) || e(5) && A[5] === 65535 || e(4) && A[4] === 65535 && A[5] === 0 || A[0] === 100 && A[1] === 65435 && A[2] === 0 && A[3] === 0 && A[4] === 0 && A[5] === 0 || A[0] === 100 && A[1] === 65435 && A[2] === 1)) return null;
  let r = A[6] >> 8 & 255, n = A[6] & 255, i2 = A[7] >> 8 & 255, o = A[7] & 255;
  return `${r}.${n}.${i2}.${o}`;
}
function Ca(A) {
  let e = Xl(A);
  if (e === null) return true;
  let t = Vl(e);
  return t ? fi(t) : !!(e.every((r) => r === 0) || e.slice(0, 7).every((r) => r === 0) && e[7] === 1 || (e[0] & 65024) === 64512 || (e[0] & 65472) === 65152 || (e[0] & 65472) === 65216 || (e[0] & 65280) === 65280 || e[0] === 8193 && e[1] === 3512);
}
function zl(A) {
  let e = A.toLowerCase().replace(/^\[|\]$/g, "");
  return on.test(e) ? fi(e) : e.includes(":") ? Ca(e) : true;
}
function da(A) {
  let e;
  try {
    e = new URL(A);
  } catch {
    return null;
  }
  if (e.protocol !== "http:" && e.protocol !== "https:") return null;
  let t = e.hostname.toLowerCase().replace(/\.+$/, "");
  return t.startsWith("[") && t.endsWith("]") && (t = t.slice(1, -1)), t ? { url: e, host: t } : null;
}
function Zl(A) {
  let e = da(A);
  if (!e) return true;
  let { host: t } = e;
  return t === "localhost" || t.endsWith(".localhost") || t === "local" || t.endsWith(".local") || t === "internal" || t.endsWith(".internal") ? true : on.test(t) ? fi(t) : t.includes(":") ? Ca(t) : false;
}
function nn(A) {
  return new Error(`Image source resolves to a blocked address (SSRF protection): ${A}`);
}
function jl(A) {
  if (Zl(A)) throw nn(A);
}
var Nt;
async function $l() {
  if (Nt !== void 0) return Nt;
  if (typeof window < "u") return Nt = null, null;
  try {
    let e = await new Function("s", "return import(s)")("node:dns/promises");
    return Nt = (t, r) => e.lookup(t, r), Nt;
  } catch {
    return Nt = null, null;
  }
}
async function Ac(A, e) {
  jl(A);
  let t = da(A);
  if (!t) throw nn(A);
  let { host: r } = t;
  if (on.test(r) || r.includes(":")) return;
  let n = e && "lookup" in e ? e.lookup : await $l();
  if (!n) return;
  let i2;
  try {
    i2 = await n(r, { all: true });
  } catch {
    throw new Error(`Can't resolve image host: ${A}`);
  }
  if (i2.length === 0) throw new Error(`Can't resolve image host: ${A}`);
  for (let { address: o } of i2) if (zl(o)) throw nn(A);
}
async function Qa(A) {
  try {
    A.body && typeof A.body.cancel == "function" ? await A.body.cancel() : typeof A.arrayBuffer == "function" && await A.arrayBuffer();
  } catch {
  }
}
async function pa(A, e) {
  let t = (e == null ? void 0 : e.fetch) ?? globalThis.fetch, r = A;
  for (let n = 0; n <= 10; n++) {
    await Ac(r, e);
    let i2 = await t(r, { redirect: "manual" });
    if (i2.type === "opaqueredirect") throw await Qa(i2), nn(r);
    let o = i2.headers.get("location");
    if (ql.has(i2.status) && o) {
      await Qa(i2), r = new URL(o, r).href;
      continue;
    }
    return i2;
  }
  throw new Error(`Image source redirected too many times (SSRF protection): ${A}`);
}
var ec2 = "image/avif";
var sn = "image/webp";
var an = "image/apng";
var gn = "image/png";
var un = "image/jpeg";
var In = "image/gif";
var Bi = "image/svg+xml";
function ya(A) {
  let e = new DataView(A), t = 4, r = e.byteLength;
  for (; t < r; ) {
    let n = e.getUint16(t, false);
    if (n > r) throw new TypeError("Invalid JPEG");
    let i2 = e.getUint8(n + 1 + t);
    if (i2 === 192 || i2 === 193 || i2 === 194) return [e.getUint16(n + 7 + t, false), e.getUint16(n + 5 + t, false)];
    t += n + 2;
  }
  throw new TypeError("Invalid JPEG");
}
function wa(A) {
  let e = new DataView(A), t = new Uint8Array(A);
  if (e.byteLength < 20 || e.getUint32(0) !== 1380533830 || e.getUint32(8) !== 1464156752) throw new TypeError("Invalid WebP");
  let r = e.getUint32(4, true) + 8;
  if (r < 20 || r > e.byteLength) throw new TypeError("Invalid WebP");
  let n = 12;
  for (; n + 8 <= r; ) {
    let i2 = e.getUint32(n), o = e.getUint32(n + 4, true), s = n + 8, a = s + o;
    if (a > r) throw new TypeError("Invalid WebP");
    if (i2 === 1448097824) {
      if (o < 10 || t[s + 3] !== 157 || t[s + 4] !== 1 || t[s + 5] !== 42) throw new TypeError("Invalid WebP");
      let g2 = e.getUint16(s + 6, true) & 16383, u2 = e.getUint16(s + 8, true) & 16383;
      if (!g2 || !u2) throw new TypeError("Invalid WebP");
      return [g2, u2];
    }
    if (i2 === 1448097868) {
      if (o < 5 || t[s] !== 47) throw new TypeError("Invalid WebP");
      let g2 = e.getUint32(s + 1, true);
      return [(g2 & 16383) + 1, (g2 >>> 14 & 16383) + 1];
    }
    if (i2 === 1448097880) {
      if (o < 10) throw new TypeError("Invalid WebP");
      return [t[s + 4] + (t[s + 5] << 8) + (t[s + 6] << 16) + 1, t[s + 7] + (t[s + 8] << 8) + (t[s + 9] << 16) + 1];
    }
    n = a + o % 2;
  }
  throw new TypeError("Invalid WebP");
}
function Da(A) {
  let e = new Uint8Array(A.slice(6, 10));
  return [e[0] | e[1] << 8, e[2] | e[3] << 8];
}
function ba(A) {
  let e = new DataView(A);
  return [e.getUint16(18, false), e.getUint16(22, false)];
}
var Re = ta(500);
var $t = /* @__PURE__ */ new Map();
var tc = [gn, an, un, In, Bi, sn];
var rc = /<svg[^>]*>/i;
var nc = /viewBox=['"]([^'"]+)['"]/;
var ic = /width=['"](\d*\.?\d+)['"]/;
var oc = /height=['"](\d*\.?\d+)['"]/;
function sc(A) {
  let e = new Uint8Array(A), t = 32768, r = "";
  for (let n = 0; n < e.length; n += t) {
    let i2 = e.subarray(n, Math.min(n + t, e.length));
    r += String.fromCharCode(...i2);
  }
  return btoa(r);
}
function ac(A) {
  let e = atob(A), t = e.length, r = new Uint8Array(t);
  for (let n = 0; n < t; n++) r[n] = e.charCodeAt(n);
  return r.buffer;
}
function ha(A, e) {
  let t = e.match(rc);
  if (!t) throw new Error(`Failed to parse SVG from ${A}`);
  let r = t[0], n = nc.exec(r), i2 = ic.exec(r), o = oc.exec(r), s = n ? kt(n[1]) : null;
  if (!s && (!i2 || !o)) throw new Error(`Failed to parse SVG from ${A}: missing "viewBox"`);
  let a = s ? [s[2], s[3]] : [+i2[1], +o[1]], g2 = a[0] / a[1];
  return i2 && o ? [+i2[1], +o[1]] : i2 ? [+i2[1], +i2[1] / g2] : o ? [+o[1] * g2, +o[1]] : [a[0], a[1]];
}
function ma(A) {
  let e, t = gc(new Uint8Array(A));
  switch (t) {
    case gn:
    case an:
      e = ba(A);
      break;
    case In:
      e = Da(A);
      break;
    case un:
      e = ya(A);
      break;
    case sn:
      e = wa(A);
      break;
  }
  if (!tc.includes(t)) throw new Error(`Unsupported image type: ${t || "unknown"}`);
  return [`data:${t};base64,${sc(A)}`, e];
}
async function Mt(A) {
  if (!A) throw new Error("Image source is not provided.");
  if (typeof A == "object") {
    let [i2, o] = ma(A);
    return [i2, ...o];
  }
  if ((A.startsWith('"') && A.endsWith('"') || A.startsWith("'") && A.endsWith("'")) && (A = A.slice(1, -1)), typeof window > "u" && !A.startsWith("http") && !A.startsWith("data:")) throw new Error(`Image source must be an absolute URL: ${A}`);
  if (A.startsWith("data:")) {
    let i2;
    try {
      i2 = /data:(?<imageType>[a-z/+]+)(;[^;=]+=[^;=]+)*?(;(?<encodingType>[^;,]+))?,(?<dataString>.*)/g.exec(A).groups;
    } catch {
      return console.warn("Image data URI resolved without size:" + A), [A];
    }
    let { imageType: o, encodingType: s, dataString: a } = i2;
    if (o === Bi) {
      let g2 = s === "base64" ? atob(a) : decodeURIComponent(a.replace(/ /g, "%20")), u2 = s === "base64" ? A : `data:image/svg+xml;base64,${btoa(g2)}`, I = ha(A, g2);
      return Re.set(A, [u2, ...I]), [u2, ...I];
    } else if (s === "base64") {
      let g2, u2 = ac(a);
      switch (o) {
        case gn:
        case an:
          g2 = ba(u2);
          break;
        case In:
          g2 = Da(u2);
          break;
        case un:
          g2 = ya(u2);
          break;
        case sn:
          g2 = wa(u2);
          break;
      }
      return Re.set(A, [A, ...g2]), [A, ...g2];
    } else return console.warn("Image data URI resolved without size:" + A), Re.set(A, [A]), [A];
  }
  if (!globalThis.fetch) throw new Error("`fetch` is required to be polyfilled to load images.");
  if ($t.has(A)) return $t.get(A);
  let e = Re.get(A);
  if (e) return e;
  let t = A, n = (typeof window > "u" ? () => pa(t) : () => fetch(t))().then((i2) => {
    let o = i2.headers.get("content-type");
    return o === "image/svg+xml" || o === "application/svg+xml" ? i2.text() : i2.arrayBuffer();
  }).then((i2) => {
    if (typeof i2 == "string") try {
      let a = `data:image/svg+xml;base64,${btoa(i2)}`, g2 = ha(t, i2);
      return [a, ...g2];
    } catch (a) {
      throw new Error(`Failed to parse SVG image: ${a.message}`);
    }
    let [o, s] = ma(i2);
    return [o, ...s];
  }).then((i2) => (Re.set(t, i2), i2)).catch((i2) => {
    if (i2 instanceof Error && i2.message.includes("SSRF protection")) throw i2;
    return console.error(`Can't load image ${t}: ` + i2.message), Re.set(t, []), [];
  });
  return $t.set(t, n), n;
}
function gc(A) {
  return [255, 216, 255].every((e, t) => A[t] === e) ? un : [137, 80, 78, 71, 13, 10, 26, 10].every((e, t) => A[t] === e) ? uc(A) ? an : gn : [71, 73, 70, 56].every((e, t) => A[t] === e) ? In : [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80].every((e, t) => !e || A[t] === e) ? sn : [60, 63, 120, 109, 108].every((e, t) => A[t] === e) ? Bi : [0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102].every((e, t) => !e || A[t] === e) ? ec2 : null;
}
function uc(A) {
  let e = new DataView(A.buffer), t, r, n = 8, i2 = false;
  for (; !i2 && t !== "IEND" && n < A.length; ) {
    r = e.getUint32(n);
    let o = A.subarray(n + 4, n + 8);
    t = String.fromCharCode(...o), i2 = t === "acTL", n += 12 + r;
  }
  return i2;
}
var Sa = { accentHeight: "accent-height", alignmentBaseline: "alignment-baseline", arabicForm: "arabic-form", baselineShift: "baseline-shift", capHeight: "cap-height", clipPath: "clip-path", clipRule: "clip-rule", colorInterpolation: "color-interpolation", colorInterpolationFilters: "color-interpolation-filters", colorProfile: "color-profile", colorRendering: "color-rendering", dominantBaseline: "dominant-baseline", enableBackground: "enable-background", fillOpacity: "fill-opacity", fillRule: "fill-rule", floodColor: "flood-color", floodOpacity: "flood-opacity", fontFamily: "font-family", fontSize: "font-size", fontSizeAdjust: "font-size-adjust", fontStretch: "font-stretch", fontStyle: "font-style", fontVariant: "font-variant", fontWeight: "font-weight", glyphName: "glyph-name", glyphOrientationHorizontal: "glyph-orientation-horizontal", glyphOrientationVertical: "glyph-orientation-vertical", horizAdvX: "horiz-adv-x", horizOriginX: "horiz-origin-x", href: "href", imageRendering: "image-rendering", letterSpacing: "letter-spacing", lightingColor: "lighting-color", markerEnd: "marker-end", markerMid: "marker-mid", markerStart: "marker-start", overlinePosition: "overline-position", overlineThickness: "overline-thickness", paintOrder: "paint-order", panose1: "panose-1", pointerEvents: "pointer-events", renderingIntent: "rendering-intent", shapeRendering: "shape-rendering", stopColor: "stop-color", stopOpacity: "stop-opacity", strikethroughPosition: "strikethrough-position", strikethroughThickness: "strikethrough-thickness", strokeDasharray: "stroke-dasharray", strokeDashoffset: "stroke-dashoffset", strokeLinecap: "stroke-linecap", strokeLinejoin: "stroke-linejoin", strokeMiterlimit: "stroke-miterlimit", strokeOpacity: "stroke-opacity", strokeWidth: "stroke-width", textAnchor: "text-anchor", textDecoration: "text-decoration", textRendering: "text-rendering", underlinePosition: "underline-position", underlineThickness: "underline-thickness", unicodeBidi: "unicode-bidi", unicodeRange: "unicode-range", unitsPerEm: "units-per-em", vAlphabetic: "v-alphabetic", vHanging: "v-hanging", vIdeographic: "v-ideographic", vMathematical: "v-mathematical", vectorEffect: "vector-effect", vertAdvY: "vert-adv-y", vertOriginX: "vert-origin-x", vertOriginY: "vert-origin-y", wordSpacing: "word-spacing", writingMode: "writing-mode", xHeight: "x-height", xlinkActuate: "xlink:actuate", xlinkArcrole: "xlink:arcrole", xlinkHref: "xlink:href", xlinkRole: "xlink:role", xlinkShow: "xlink:show", xlinkTitle: "xlink:title", xlinkType: "xlink:type", xmlBase: "xml:base", xmlLang: "xml:lang", xmlSpace: "xml:space", xmlnsXlink: "xmlns:xlink" };
var Ic = /[\r\n%#()<>?[\\\]^`{|}"'&]/g;
function ln(A, e) {
  if (!A) return "";
  if (Array.isArray(A)) return A.map((a) => ln(a, e)).join("");
  if (typeof A != "object") return ea(A);
  let t = A.type;
  if (t === "text") throw new Error("<text> nodes are not currently supported, please convert them to <path>");
  let { children: r, style: n, ...i2 } = A.props || {}, o = (n == null ? void 0 : n.color) || e;
  if (t === Ea) return ln(r, o);
  if (typeof t != "string") throw new Error("Only intrinsic elements are supported inside <svg>");
  let s = {};
  for (let [a, g2] of Object.entries(i2)) {
    let u2 = g2;
    typeof u2 == "string" && u2.toLowerCase() === "currentcolor" && (u2 = o), (a === "href" || a === "xlinkHref") && t === "image" && (u2 = Re.get(u2)[0]);
    let I = Sa[a] || a;
    s[I] = u2;
  }
  return n && (s.style = Object.entries(n).map(([a, g2]) => `${oa(a)}:${g2}`).join(";")), R2(t, s, ln(r, o));
}
async function xa(A) {
  let e = /* @__PURE__ */ new Set(), t = (r) => {
    if (r && xt(r)) {
      if (Array.isArray(r)) {
        r.forEach((n) => t(n));
        return;
      } else if (typeof r == "object") if (r.type === "image") {
        let n = r.props.href || r.props.xlinkHref;
        n && (e.has(n) || e.add(n));
      } else r.type === "img" && (e.has(r.props.src) || e.add(r.props.src));
      Array.isArray(r.props.children) ? r.props.children.map((n) => t(n)) : t(r.props.children);
    }
  };
  return t(A), Promise.all(Array.from(e).map((r) => Mt(r)));
}
async function ka(A, e) {
  let { viewBox: t, viewbox: r, width: n, height: i2, className: o, style: s, children: a, ...g2 } = A.props || {};
  t ||= r, g2.xmlns = "http://www.w3.org/2000/svg";
  let u2 = (s == null ? void 0 : s.color) || e, I = kt(t), B = I ? I[3] / I[2] : null;
  n = n || B && i2 ? i2 / B : null, i2 = i2 || B && n ? n * B : null, g2.width = n, g2.height = i2, t && (g2.viewBox = t);
  let f = {};
  for (let [C, p] of Object.entries(g2)) {
    let m2 = Sa[C] || C;
    f[m2] = typeof p == "string" && p.toLowerCase() === "currentcolor" ? u2 : p;
  }
  return `data:image/svg+xml;utf8,${R2("svg", f, ln(a, u2)).replace(Ic, encodeURIComponent)}`;
}
var ce = "flex";
var va = { p: { display: ce, marginTop: "1em", marginBottom: "1em" }, div: { display: ce }, blockquote: { display: ce, marginTop: "1em", marginBottom: "1em", marginLeft: 40, marginRight: 40 }, center: { display: ce, textAlign: "center" }, hr: { display: ce, marginTop: "0.5em", marginBottom: "0.5em", marginLeft: "auto", marginRight: "auto", borderWidth: 1, borderStyle: "solid" }, h1: { display: ce, fontSize: "2em", marginTop: "0.67em", marginBottom: "0.67em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, h2: { display: ce, fontSize: "1.5em", marginTop: "0.83em", marginBottom: "0.83em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, h3: { display: ce, fontSize: "1.17em", marginTop: "1em", marginBottom: "1em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, h4: { display: ce, marginTop: "1.33em", marginBottom: "1.33em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, h5: { display: ce, fontSize: "0.83em", marginTop: "1.67em", marginBottom: "1.67em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, h6: { display: ce, fontSize: "0.67em", marginTop: "2.33em", marginBottom: "2.33em", marginLeft: 0, marginRight: 0, fontWeight: "bold" }, u: { textDecoration: "underline" }, strong: { fontWeight: "bold" }, b: { fontWeight: "bold" }, i: { fontStyle: "italic" }, em: { fontStyle: "italic" }, code: { fontFamily: "monospace" }, kbd: { fontFamily: "monospace" }, pre: { display: ce, fontFamily: "monospace", whiteSpace: "pre", marginTop: "1em", marginBottom: "1em" }, mark: { backgroundColor: "yellow", color: "black" }, big: { fontSize: "larger" }, small: { fontSize: "smaller" }, s: { textDecoration: "line-through" } };
var lc = /* @__PURE__ */ new Set(["color", "font", "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontFeatureSettings", "letterSpacing", "lineHeight", "textAlign", "textIndent", "textTransform", "textShadowOffset", "textShadowColor", "textShadowRadius", "WebkitTextStrokeWidth", "WebkitTextStrokeColor", "textDecorationLine", "textDecorationStyle", "textDecorationColor", "textDecorationSkipInk", "whiteSpace", "transform", "wordBreak", "tabSize", "opacity", "filter", "_viewportWidth", "_viewportHeight", "_inheritedClipPathId", "_inheritedMaskId", "_inheritedBackgroundClipTextPath", "_inheritedBackgroundClipTextHasBackground"]);
function Ei(A) {
  let e = {};
  for (let t in A) (lc.has(t) || t.startsWith("--")) && (e[t] = A[t]);
  return e;
}
function Ra(A, e) {
  try {
    let t = new se(A);
    switch (t.unit) {
      case "px":
        return { absolute: t.value };
      case "em":
        return { absolute: t.value * e };
      case "rem":
        return { absolute: t.value * 16 };
      case "%":
        return { relative: t.value };
      default:
        return {};
    }
  } catch {
    return {};
  }
}
function Qi(A, e, t) {
  switch (A) {
    case "top":
      return { yRelative: 0 };
    case "left":
      return { xRelative: 0 };
    case "right":
      return { xRelative: 100 };
    case "bottom":
      return { yRelative: 100 };
    case "center":
      return {};
    default: {
      let r = Ra(A, e);
      return r.absolute ? { [t ? "xAbsolute" : "yAbsolute"]: r.absolute } : r.relative ? { [t ? "xRelative" : "yRelative"]: r.relative } : {};
    }
  }
}
function cn(A, e) {
  if (typeof A == "number") return { xAbsolute: A };
  let t;
  try {
    t = (0, import_postcss_value_parser.default)(A).nodes.filter((r) => r.type === "word").map((r) => r.value);
  } catch {
    return {};
  }
  if (t.length === 1) return Qi(t[0], e, true);
  if (t.length === 2 || t.length === 3) {
    let r = t.length === 3 ? Ra(t.pop(), e) : {};
    if (r.relative !== void 0) return {};
    let n = r.absolute ? { zAbsolute: r.absolute } : {};
    return (t[0] === "top" || t[0] === "bottom" || t[1] === "left" || t[1] === "right") && t.reverse(), { ...Qi(t[0], e, true), ...Qi(t[1], e, false), ...n };
  } else return {};
}
function Ar(A, e) {
  let t = (0, import_css_to_react_native2.getPropertyName)(`mask-${e}`);
  return A[t] || A[`WebkitM${t.substring(1)}`];
}
function Fa(A) {
  let e = A.maskImage || A.WebkitMaskImage, t = { position: Ar(A, "position") || "0% 0%", size: Ar(A, "size") || "100% 100%", repeat: Ar(A, "repeat") || "repeat", origin: Ar(A, "origin") || "border-box", clip: Ar(A, "origin") || "border-box" };
  return _e(e).filter((n) => n && n !== "none").reverse().map((n) => ({ image: n, ...t }));
}
var Bc = { round: 1, squircle: 2, square: 1 / 0, bevel: 0, scoop: -1, notch: -1 / 0 };
function Ci(A) {
  let e = A.trim().toLowerCase(), t = Bc[e];
  if (typeof t < "u") return t;
  let r = e.match(/^superellipse\(\s*(-?infinity|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?)\s*\)$/);
  if (!r) throw new Error('Invalid corner shape value: "' + A + '".');
  if (r[1] === "infinity") return 1 / 0;
  if (r[1] === "-infinity") return -1 / 0;
  let n = Number(r[1]);
  if (!Number.isFinite(n)) throw new Error('Invalid corner shape value: "' + A + '".');
  return n;
}
function fn(A, e = 4) {
  let t = A.match(/superellipse\([^)]*\)|[^\s]+/gi) || [];
  if (t.length < 1 || t.length > e) throw new Error('Invalid corner shape value: "' + A + '".');
  for (let r of t) Ci(r);
  return t;
}
var Na = { brightness: 1, contrast: 1, grayscale: 1, invert: 1, opacity: 1, saturate: 1, sepia: 1 };
function Ma(A, e, t = "black") {
  if (A === "none") return [];
  if (typeof A != "string") throw new Error('Invalid `backdropFilter` value: "' + A + '".');
  let r = _e(A, /\s/).filter(Boolean);
  if (!r.length) throw new Error('Invalid `backdropFilter` value: "' + A + '".');
  return r.map((n) => {
    let i2 = n.match(/^([a-z-]+)\((.*)\)$/i);
    if (!i2) throw new Error("Invalid filter function in `backdropFilter`.");
    let o = i2[1].toLowerCase(), s = i2[2].trim();
    if (o === "blur") {
      let a = s ? Bn(s, e, "blur()") : 0;
      if (a < 0) throw new Error("Invalid `blur()` radius in `backdropFilter`.");
      return { type: "blur", value: a };
    }
    if (o === "hue-rotate") {
      let a = s === "0" || !s ? 0 : Te(s);
      if (typeof a > "u") throw new Error("Invalid `hue-rotate()` angle in `backdropFilter`.");
      return { type: "hue-rotate", value: a };
    }
    if (o === "drop-shadow") return Qc(s, e, t);
    if (o in Na) {
      let a = o, g2 = s ? Cc(s, `${a}()`) : Na[a], u2 = ["grayscale", "invert", "opacity", "sepia"].includes(a) ? Math.min(g2, 1) : g2;
      return { type: a, value: u2 };
    }
    throw new Error(`Unsupported \`${o}()\` in \`backdropFilter\`.`);
  });
}
function Qc(A, e, t) {
  let r = _e(A, /\s/).filter(Boolean), n = t, i2 = [];
  for (let g2 of r) (0, import_parse_css_color2.default)(g2) ? n = g2 : i2.push(g2);
  if (i2.length < 2 || i2.length > 3) throw new Error("Invalid `drop-shadow()` value in `backdropFilter`.");
  let o = Bn(i2[0], e, "drop-shadow()"), s = Bn(i2[1], e, "drop-shadow()"), a = i2[2] ? Bn(i2[2], e, "drop-shadow()") : 0;
  if (a < 0) throw new Error("Invalid `drop-shadow()` blur radius in `backdropFilter`.");
  return { type: "drop-shadow", offsetX: o, offsetY: s, blurRadius: a, color: n };
}
function Bn(A, e, t) {
  let r = V(A, e.fontSize, 0, e);
  if (typeof r > "u") throw new Error(`Invalid length \`${A}\` in \`${t}\` for \`backdropFilter\`.`);
  return r;
}
function Cc(A, e) {
  let t = A.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/), r = t ? Number(t[1]) / 100 : Number(A);
  if (!Number.isFinite(r) || r < 0) throw new Error(`Invalid amount \`${A}\` in \`${e}\` for \`backdropFilter\`.`);
  return r;
}
var di = "length";
var Lt = "lengthOrPercentage";
var Fe = "number";
var $e = "scale";
var We = "angle";
var pi = {};
for (let [A, e, t] of [["matrix", 6, [Fe, Fe, Fe, Fe, Fe, Fe]], ["matrix3d", 16, Array(16).fill(Fe)], ["translate", 1, [Lt, Lt]], ["translateX", 1, [Lt]], ["translateY", 1, [Lt]], ["translateZ", 1, [di]], ["translate3d", 3, [Lt, Lt, di]], ["scale", 1, [$e, $e]], ["scaleX", 1, [$e]], ["scaleY", 1, [$e]], ["scaleZ", 1, [$e]], ["scale3d", 3, [$e, $e, $e]], ["rotate", 1, [We]], ["rotateX", 1, [We]], ["rotateY", 1, [We]], ["rotateZ", 1, [We]], ["rotate3d", 4, [Fe, Fe, Fe, We]], ["skew", 1, [We, We]], ["skewX", 1, [We]], ["skewY", 1, [We]], ["perspective", 1, [di]]]) pi[A.toLowerCase()] = [A, e, t];
function hi(A) {
  let e = [], t = (0, import_postcss_value_parser2.default)(A).nodes.filter((r) => r.type !== "space" && r.type !== "comment");
  if (t.length === 1 && t[0].type === "word" && t[0].value.toLowerCase() === "none") return e;
  for (let r of t) {
    let n = r.type === "function" ? pi[r.value.toLowerCase()] : void 0;
    if (!n) throw new Error(`Invalid transform function: "${import_postcss_value_parser2.default.stringify(r)}".`);
    let [i2, o, s] = n, a = [], g2 = true;
    for (let u2 of r.nodes) if (!(u2.type === "space" || u2.type === "comment")) if (u2.type === "div" && u2.value === "," && !g2) g2 = true;
    else if (u2.type === "word" && g2) a.push(u2.value), g2 = false;
    else throw new Error(`Invalid arguments in transform function "${import_postcss_value_parser2.default.stringify(r)}".`);
    if (a.length < o || a.length > s.length) throw new Error(`Invalid number of arguments in transform function "${import_postcss_value_parser2.default.stringify(r)}".`);
    e.push({ name: i2, args: a });
  }
  return e;
}
function dc(A, e, t) {
  let r;
  try {
    r = new se(A);
  } catch {
    return;
  }
  switch (e) {
    case "number":
      return r.type === "number" ? r.value : void 0;
    case "scale":
      return r.type === "number" ? r.value : r.type === "percentage" ? r.value / 100 : void 0;
    case "angle":
      return r.type === "angle" ? Te(A) : r.type === "number" && r.value === 0 ? 0 : void 0;
    case "lengthOrPercentage":
      if (r.type === "percentage") return A;
    case "length":
      return r.type === "length" ? t(A) : r.type === "number" && r.value === 0 ? 0 : void 0;
  }
}
function La(A, e) {
  return A.map(({ name: t, args: r }) => {
    let [, , n] = pi[t.toLowerCase()];
    return { name: t, args: r.map((i2, o) => {
      if (typeof i2 == "number") return i2;
      if (t === "perspective" && i2.toLowerCase() === "none") return 1 / 0;
      let s = dc(i2.toLowerCase(), n[o], e);
      if (s === void 0) throw new Error(`Invalid value "${i2}" in transform function ${t}().`);
      return s;
    }) };
  });
}
function Ua(A) {
  let e = {}, t = {};
  for (let r in A) r.startsWith("--") ? e[r] = String(A[r]) : t[r] = A[r];
  return { variables: e, remainingStyle: t };
}
function Ha(A, e) {
  return { ...A, ...e };
}
function tr(A, e, t = /* @__PURE__ */ new Set()) {
  if (typeof A != "string" || !A.includes("var(")) return A;
  try {
    let r = (0, import_postcss_value_parser3.default)(A), n = false;
    if (r.walk((i2) => {
      if (i2.type === "function" && i2.value === "var") {
        n = true;
        let o = pc(i2);
        if (!o) return;
        let { varName: s, fallback: a } = o;
        if (t.has(s)) {
          console.warn(`Circular reference detected for CSS variable: ${s}`), a !== void 0 ? er(i2, a) : er(i2, "initial");
          return;
        }
        let g2 = e[s];
        if (g2 !== void 0) {
          let u2 = new Set(t);
          u2.add(s);
          let I = tr(g2, e, u2);
          er(i2, String(I));
        } else if (a !== void 0) {
          let u2 = tr(a, e, t);
          er(i2, String(u2));
        } else er(i2, "initial");
      }
    }), n) return r.toString();
  } catch {
    console.warn(`Failed to parse CSS value for variable resolution: ${A}`);
  }
  return A;
}
function pc(A) {
  if (!A.nodes || A.nodes.length === 0) return null;
  let e, t = -1;
  for (let n = 0; n < A.nodes.length; n++) {
    let i2 = A.nodes[n];
    if (i2.type === "word" && !e) e = i2;
    else if (i2.type === "div" && i2.value === ",") {
      t = n;
      break;
    }
  }
  if (!e || e.type !== "word") return null;
  let r = e.value.trim();
  if (t !== -1 && t < A.nodes.length - 1) {
    let n = A.nodes.slice(t + 1), i2 = import_postcss_value_parser3.default.stringify(n).trim();
    return { varName: r, fallback: i2 };
  }
  return { varName: r };
}
function er(A, e) {
  A.type = "word", A.value = e, delete A.nodes;
}
var Dc = /* @__PURE__ */ new Set(["flex", "flexGrow", "flexShrink", "flexBasis", "fontWeight", "lineHeight", "opacity", "scale", "scaleX", "scaleY"]);
var bc = /* @__PURE__ */ new Set(["lineHeight"]);
function Sc(A, e, t, r) {
  return A === "textDecoration" && !t.includes(e.textDecorationColor) && (e.textDecorationColor = r), e;
}
function ct(A, e) {
  let t = Number(e);
  return isNaN(t) ? e : Dc.has(A) ? bc.has(A) ? t : String(e) : t + "px";
}
function xc(A, e, t, r) {
  if (A === "zIndex") return console.warn("`z-index` is currently not supported."), { [A]: e };
  if (A === "lineHeight") return { lineHeight: ct(A, e) };
  if (A === "fontFamily") return { fontFamily: e.split(",").map((i2) => i2.trim().replace(/(^['"])|(['"]$)/g, "").toLocaleLowerCase()) };
  if (A === "borderRadius") {
    if (typeof e != "string" || !e.includes("/")) return;
    let [i2, o] = e.split("/"), s = (0, import_css_to_react_native.getStylesForProperty)(A, i2, true), a = (0, import_css_to_react_native.getStylesForProperty)(A, o, true);
    for (let g2 in s) a[g2] = ct(A, s[g2]) + " " + ct(A, a[g2]);
    return a;
  }
  if (A === "cornerShape") {
    if (typeof e != "string") throw new Error('Invalid `cornerShape` value: "' + e + '".');
    let i2 = fn(e), o = i2[0], s = i2[1] || o, a = i2[2] || o, g2 = i2[3] || s;
    return { cornerTopLeftShape: o, cornerTopRightShape: s, cornerBottomRightShape: a, cornerBottomLeftShape: g2 };
  }
  if (/^corner(TopLeft|TopRight|BottomRight|BottomLeft)Shape$/.test(A)) {
    if (typeof e != "string" || fn(e, 1).length !== 1) throw new Error("Invalid `" + A + '` value: "' + e + '".');
    return { [A]: e };
  }
  let n = A.match(/^corner(Top|Right|Bottom|Left)Shape$/);
  if (n) {
    if (typeof e != "string") throw new Error("Invalid `" + A + '` value: "' + e + '".');
    let i2 = fn(e, 2), o = i2[0], s = i2[1] || o, a = { Top: ["cornerTopLeftShape", "cornerTopRightShape"], Right: ["cornerTopRightShape", "cornerBottomRightShape"], Bottom: ["cornerBottomLeftShape", "cornerBottomRightShape"], Left: ["cornerTopLeftShape", "cornerBottomLeftShape"] }[n[1]];
    return { [a[0]]: o, [a[1]]: s };
  }
  if (/^border(Top|Right|Bottom|Left)?$/.test(A)) {
    let i2 = (0, import_css_to_react_native.getStylesForProperty)("border", e, true);
    i2.borderWidth === 1 && !String(e).includes("1px") && (i2.borderWidth = 3), i2.borderColor === "black" && !String(e).includes("black") && (i2.borderColor = t);
    let o = { Width: ct(A + "Width", i2.borderWidth), Style: ZA(i2.borderStyle, { solid: "solid", dashed: "dashed" }, "solid", A + "Style"), Color: i2.borderColor }, s = {};
    for (let a of A === "border" ? ["Top", "Right", "Bottom", "Left"] : [A.slice(6)]) for (let g2 in o) s["border" + a + g2] = o[g2];
    return s;
  }
  if (A === "boxShadow") {
    if (!e) throw new Error('Invalid `boxShadow` value: "' + e + '".');
    return { [A]: typeof e == "string" ? (0, import_css_box_shadow.parse)(e) : e };
  }
  if (A === "backdropFilter" || A === "WebkitBackdropFilter") return { _backdropFilters: Ma(e, r, t) };
  if (A === "transform") {
    if (typeof e != "string") throw new Error("Invalid `transform` value.");
    return { transform: hi(e) };
  }
  if (A === "background") return e = e.toString().trim(), /^(linear-gradient|radial-gradient|url|repeating-linear-gradient|repeating-radial-gradient)\(/.test(e) ? (0, import_css_to_react_native.getStylesForProperty)("backgroundImage", e, true) : (0, import_css_to_react_native.getStylesForProperty)("background", e, true);
  if (A === "textShadow") {
    e = e.toString().trim();
    let i2 = {}, o = _e(e);
    for (let s of o) {
      let a = (0, import_css_to_react_native.getStylesForProperty)("textShadow", s, true);
      for (let g2 in a) i2[g2] ? i2[g2].push(a[g2]) : i2[g2] = [a[g2]];
    }
    return i2;
  }
  if (A === "WebkitTextStroke") {
    e = e.toString().trim();
    let i2 = e.split(" ");
    if (i2.length !== 2) throw new Error("Invalid `WebkitTextStroke` value.");
    return { WebkitTextStrokeWidth: ct(A, i2[0]), WebkitTextStrokeColor: ct(A, i2[1]) };
  }
  if (A === "textDecorationSkipInk") {
    let i2 = e.toString().trim().toLowerCase();
    if (!["auto", "none", "all"].includes(i2)) throw new Error("Invalid `textDecorationSkipInk` value.");
    return { textDecorationSkipInk: i2 };
  }
}
function Oa(A) {
  return A === "transform" ? " `calc()` is not supported in transform functions." : "";
}
var Ta = /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\.\d]+)\)/;
function _a2(A) {
  if (typeof A == "string" && Ta.test(A.trim())) return A.trim().replace(Ta, (e, t, r, n, i2) => `rgba(${t}, ${r}, ${n}, ${i2})`);
  if (typeof A == "object" && A !== null) {
    for (let e in A) A[e] = _a2(A[e]);
    return A;
  }
  return A;
}
function Qn(A, e) {
  let t = {}, r = {};
  for (let a in e) a.startsWith("--") && (r[a] = String(e[a]));
  let n = {}, i2 = A;
  if (A) {
    let { variables: a, remainingStyle: g2 } = Ua(A);
    n = a, i2 = g2;
  }
  let o = Ha(r, n);
  for (let a in o) t[a] = o[a];
  if (i2) {
    let a = i2.color ? tr(i2.color, o) : void 0, g2 = vc(a, e.color);
    t.color = g2;
    for (let u2 in i2) {
      if (u2.startsWith("_")) throw new Error(`Invalid style property: ${JSON.stringify(u2)}`);
      if (u2 === "color") continue;
      let I = (0, import_css_to_react_native.getPropertyName)(u2), B = tr(i2[u2], o), f = Fc(B, g2);
      try {
        let E = xc(I, f, g2, e) || Sc(I, (0, import_css_to_react_native.getStylesForProperty)(I, ct(I, f), true), f, g2);
        Object.assign(t, E);
      } catch (E) {
        throw new Error(E.message + (E.message.includes(f) ? `
  ` + Oa(I) : `
  in CSS rule \`${I}: ${f}\`.${Oa(I)}`));
      }
    }
  }
  if (t.backgroundImage) {
    let { backgrounds: a } = (0, import_css_background_parser.parseElementStyle)(t);
    t.backgroundImage = a;
  }
  (t.maskImage || t.WebkitMaskImage) && (t.maskImage = Fa(t));
  let s = kc(t.fontSize, e.fontSize);
  typeof t.fontSize < "u" && (t.fontSize = s), t.transformOrigin && (t.transformOrigin = cn(t.transformOrigin, s)), t.perspectiveOrigin && (t.perspectiveOrigin = cn(t.perspectiveOrigin, s));
  for (let a in t) {
    let g2 = t[a];
    if (a === "lineHeight") typeof g2 == "string" && g2 !== "normal" && (g2 = t[a] = V(g2, s, s, e, true) / s);
    else {
      if (typeof g2 == "string") {
        let u2 = V(g2, s, s, e);
        typeof u2 < "u" && (t[a] = u2), g2 = t[a];
      }
      if (typeof g2 == "string" || typeof g2 == "object") {
        let u2 = _a2(g2);
        u2 && (t[a] = u2), g2 = t[a];
      }
    }
    if (a === "opacity" && typeof g2 == "number" && (t.opacity = g2 * e.opacity), a === "transform" && (t.transform = La(g2, (u2) => V(u2, s, s, e))), a === "textShadowRadius") {
      let u2 = g2;
      t.textShadowRadius = u2.map((I) => V(I, s, 0, e, false));
    }
    if (a === "textShadowOffset") {
      let u2 = g2;
      t.textShadowOffset = u2.map(({ height: I, width: B }) => ({ height: V(I, s, 0, e, false), width: V(B, s, 0, e, false) }));
    }
  }
  return t;
}
function kc(A, e) {
  if (typeof A == "number") return A;
  try {
    let t = new se(A);
    switch (t.unit) {
      case "em":
        return t.value * e;
      case "rem":
        return t.value * 16;
    }
  } catch {
    return e;
  }
}
function Pa(A) {
  if (A.startsWith("hsl")) {
    let e = (0, import_parse_css_color.default)(A), [t, r, n] = e.values;
    return `hsl(${[t, `${r}%`, `${n}%`].concat(e.alpha === 1 ? [] : [e.alpha]).join(",")})`;
  }
  return A;
}
function vc(A, e) {
  return A && A.toLowerCase() !== "currentcolor" ? Pa(A) : Pa(e);
}
function Rc(A, e) {
  return A.replace(/currentcolor/gi, e);
}
function Fc(A, e) {
  return en(A) && (A = Rc(A, e)), A;
}
function Nc(A, e, t, r, n, i2) {
  let o = r / t, s = (e.borderLeftWidth || 0) + (e.borderRightWidth || 0) + (e.paddingLeft || 0) + (e.paddingRight || 0), a = (e.borderTopWidth || 0) + (e.borderBottomWidth || 0) + (e.paddingTop || 0) + (e.paddingBottom || 0), g2 = e.width || n, u2 = e.height || i2, I = typeof g2 == "number" && typeof u2 == "number";
  I && (g2 = g2 - s, u2 = u2 - a), g2 === void 0 && u2 === void 0 ? (g2 = "100%", A.setAspectRatio(1 / o)) : g2 === void 0 ? typeof u2 == "number" ? g2 = u2 / o : A.setAspectRatio(1 / o) : u2 === void 0 && (typeof g2 == "number" ? u2 = g2 * o : A.setAspectRatio(1 / o)), e.width = I ? g2 + s : g2, e.height = I ? u2 + a : u2, e.__naturalWidth = t, e.__naturalHeight = r;
}
async function mi(A, e, t, r, n, i2) {
  var a;
  let o = await je(), s = Object.assign({}, t, Qn(va[e], t), Qn(r, t));
  if (e === "img") {
    let [g2, u2, I] = await Mt(n.src);
    if (u2 === void 0 && I === void 0) {
      if (n.width === void 0 || n.height === void 0) throw new Error("Image size cannot be determined. Please provide the width and height of the image.");
      u2 = parseInt(n.width), I = parseInt(n.height);
    }
    Nc(A, s, u2, I, n.width, n.height), s.__src = g2;
  }
  if (await ((a = i2 == null ? void 0 : i2[e]) == null ? void 0 : a.call(i2, A, s, n)), e === "svg") {
    let g2 = n.viewBox || n.viewbox, u2 = kt(g2), I = u2 ? u2[3] / u2[2] : null, { width: B, height: f } = n;
    typeof B > "u" && f ? I == null ? B = 0 : typeof f == "string" && f.endsWith("%") ? B = parseInt(f) / I + "%" : (f = V(f, t.fontSize, 1, t), B = f / I) : typeof f > "u" && B ? I == null ? B = 0 : typeof B == "string" && B.endsWith("%") ? f = parseInt(B) * I + "%" : (B = V(B, t.fontSize, 1, t), f = B * I) : (typeof B < "u" && (B = V(B, t.fontSize, 1, t) || B), typeof f < "u" && (f = V(f, t.fontSize, 1, t) || f), B ||= u2 == null ? void 0 : u2[2], f ||= u2 == null ? void 0 : u2[3]), !s.width && B && (s.width = B), !s.height && f && (s.height = f);
  }
  return A.setDisplay(ZA(s.display, { flex: o.DISPLAY_FLEX, block: o.DISPLAY_FLEX, contents: o.DISPLAY_CONTENTS, none: o.DISPLAY_NONE, "-webkit-box": o.DISPLAY_FLEX }, o.DISPLAY_FLEX, "display")), A.setAlignContent(ZA(s.alignContent, { stretch: o.ALIGN_STRETCH, center: o.ALIGN_CENTER, "flex-start": o.ALIGN_FLEX_START, "flex-end": o.ALIGN_FLEX_END, "space-between": o.ALIGN_SPACE_BETWEEN, "space-around": o.ALIGN_SPACE_AROUND, baseline: o.ALIGN_BASELINE, normal: o.ALIGN_AUTO }, o.ALIGN_AUTO, "alignContent")), A.setAlignItems(ZA(s.alignItems, { stretch: o.ALIGN_STRETCH, center: o.ALIGN_CENTER, "flex-start": o.ALIGN_FLEX_START, "flex-end": o.ALIGN_FLEX_END, baseline: o.ALIGN_BASELINE, normal: o.ALIGN_AUTO }, o.ALIGN_STRETCH, "alignItems")), A.setAlignSelf(ZA(s.alignSelf, { stretch: o.ALIGN_STRETCH, center: o.ALIGN_CENTER, "flex-start": o.ALIGN_FLEX_START, "flex-end": o.ALIGN_FLEX_END, baseline: o.ALIGN_BASELINE, normal: o.ALIGN_AUTO }, o.ALIGN_AUTO, "alignSelf")), A.setJustifyContent(ZA(s.justifyContent, { center: o.JUSTIFY_CENTER, "flex-start": o.JUSTIFY_FLEX_START, "flex-end": o.JUSTIFY_FLEX_END, "space-between": o.JUSTIFY_SPACE_BETWEEN, "space-around": o.JUSTIFY_SPACE_AROUND }, o.JUSTIFY_FLEX_START, "justifyContent")), A.setFlexDirection(ZA(s.flexDirection, { row: o.FLEX_DIRECTION_ROW, column: o.FLEX_DIRECTION_COLUMN, "row-reverse": o.FLEX_DIRECTION_ROW_REVERSE, "column-reverse": o.FLEX_DIRECTION_COLUMN_REVERSE }, o.FLEX_DIRECTION_ROW, "flexDirection")), A.setFlexWrap(ZA(s.flexWrap, { wrap: o.WRAP_WRAP, nowrap: o.WRAP_NO_WRAP, "wrap-reverse": o.WRAP_WRAP_REVERSE }, o.WRAP_NO_WRAP, "flexWrap")), typeof s.gap < "u" && A.setGap(o.GUTTER_ALL, s.gap), typeof s.rowGap < "u" && A.setGap(o.GUTTER_ROW, s.rowGap), typeof s.columnGap < "u" && A.setGap(o.GUTTER_COLUMN, s.columnGap), typeof s.flexBasis < "u" && A.setFlexBasis(Ze(s.flexBasis, "flexBasis")), A.setFlexGrow(typeof s.flexGrow > "u" ? 0 : s.flexGrow), A.setFlexShrink(typeof s.flexShrink > "u" ? 0 : s.flexShrink), typeof s.maxHeight < "u" && A.setMaxHeight(Pe(s.maxHeight, "maxHeight")), typeof s.maxWidth < "u" && A.setMaxWidth(Pe(s.maxWidth, "maxWidth")), typeof s.minHeight < "u" && A.setMinHeight(Pe(s.minHeight, "minHeight")), typeof s.minWidth < "u" && A.setMinWidth(Pe(s.minWidth, "minWidth")), A.setOverflow(ZA(s.overflow, { visible: o.OVERFLOW_VISIBLE, hidden: o.OVERFLOW_HIDDEN }, o.OVERFLOW_VISIBLE, "overflow")), A.setMargin(o.EDGE_TOP, Ze(s.marginTop || 0)), A.setMargin(o.EDGE_BOTTOM, Ze(s.marginBottom || 0)), A.setMargin(o.EDGE_LEFT, Ze(s.marginLeft || 0)), A.setMargin(o.EDGE_RIGHT, Ze(s.marginRight || 0)), A.setBorder(o.EDGE_TOP, s.borderTopWidth || 0), A.setBorder(o.EDGE_BOTTOM, s.borderBottomWidth || 0), A.setBorder(o.EDGE_LEFT, s.borderLeftWidth || 0), A.setBorder(o.EDGE_RIGHT, s.borderRightWidth || 0), A.setPadding(o.EDGE_TOP, s.paddingTop || 0), A.setPadding(o.EDGE_BOTTOM, s.paddingBottom || 0), A.setPadding(o.EDGE_LEFT, s.paddingLeft || 0), A.setPadding(o.EDGE_RIGHT, s.paddingRight || 0), A.setBoxSizing(ZA(s.boxSizing, { "border-box": o.BOX_SIZING_BORDER_BOX, "content-box": o.BOX_SIZING_CONTENT_BOX }, o.BOX_SIZING_BORDER_BOX, "boxSizing")), A.setPositionType(ZA(s.position, { absolute: o.POSITION_TYPE_ABSOLUTE, relative: o.POSITION_TYPE_RELATIVE, static: o.POSITION_TYPE_STATIC }, o.POSITION_TYPE_RELATIVE, "position")), typeof s.top < "u" && A.setPosition(o.EDGE_TOP, Pe(s.top, "top")), typeof s.bottom < "u" && A.setPosition(o.EDGE_BOTTOM, Pe(s.bottom, "bottom")), typeof s.left < "u" && A.setPosition(o.EDGE_LEFT, Pe(s.left, "left")), typeof s.right < "u" && A.setPosition(o.EDGE_RIGHT, Pe(s.right, "right")), typeof s.height < "u" ? A.setHeight(Ze(s.height, "height")) : A.setHeightAuto(), typeof s.width < "u" ? A.setWidth(Ze(s.width, "width")) : A.setWidthAuto(), [s, Ei(s)];
}
var Ut = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var Mc = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
function ft(A, e) {
  let t = new Array(16);
  for (let r = 0; r < 4; r++) for (let n = 0; n < 4; n++) t[r * 4 + n] = A[n] * e[r * 4] + A[4 + n] * e[r * 4 + 1] + A[8 + n] * e[r * 4 + 2] + A[12 + n] * e[r * 4 + 3];
  return t;
}
function Bt(A, e, t) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, A, e, t, 1];
}
function rr(A, e, t) {
  return [A, 0, 0, 0, 0, e, 0, 0, 0, 0, t, 0, 0, 0, 0, 1];
}
function Cn(A, e, t, r) {
  let n = Math.hypot(A, e, t);
  if (!n) return Ut;
  A /= n, e /= n, t /= n;
  let i2 = r * Math.PI / 180, o = Math.cos(i2), s = Math.sin(i2), a = 1 - o;
  return [a * A * A + o, a * A * e + s * t, a * A * t - s * e, 0, a * A * e - s * t, a * e * e + o, a * e * t + s * A, 0, a * A * t + s * e, a * e * t - s * A, a * t * t + o, 0, 0, 0, 0, 1];
}
function yi(A, e) {
  let t = Math.tan(A * Math.PI / 180);
  return [1, Math.tan(e * Math.PI / 180), 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function Ka(A) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / Math.max(A, 1), 0, 0, 0, 1];
}
function Lc({ name: A, args: e }, t, r) {
  let n = (g2, u2) => typeof g2 == "string" ? parseFloat(g2) / 100 * u2 : g2 ?? 0, [i2, o, s, a] = e;
  switch (A) {
    case "matrix": {
      let [, , , , g2, u2] = e;
      return [i2, o, 0, 0, s, a, 0, 0, 0, 0, 1, 0, g2, u2, 0, 1];
    }
    case "matrix3d":
      return e;
    case "translate":
      return Bt(n(i2, t), n(o, r), 0);
    case "translateX":
      return Bt(n(i2, t), 0, 0);
    case "translateY":
      return Bt(0, n(i2, r), 0);
    case "translateZ":
      return Bt(0, 0, i2);
    case "translate3d":
      return Bt(n(i2, t), n(o, r), s);
    case "scale":
      return rr(i2, o ?? i2, 1);
    case "scaleX":
      return rr(i2, 1, 1);
    case "scaleY":
      return rr(1, i2, 1);
    case "scaleZ":
      return rr(1, 1, i2);
    case "scale3d":
      return rr(i2, o, s);
    case "rotate":
    case "rotateZ":
      return Cn(0, 0, 1, i2);
    case "rotateX":
      return Cn(1, 0, 0, i2);
    case "rotateY":
      return Cn(0, 1, 0, i2);
    case "rotate3d":
      return Cn(i2, o, s, a);
    case "skew":
      return yi(i2, o ?? 0);
    case "skewX":
      return yi(i2, 0);
    case "skewY":
      return yi(0, i2);
    case "perspective":
      return Ka(i2);
    default:
      throw new Error(`Invalid transform function: "${A}".`);
  }
}
function Ja(A, { left: e, top: t, width: r, height: n }, i2) {
  let o = e + ((i2 == null ? void 0 : i2.xAbsolute) ?? ((i2 == null ? void 0 : i2.xRelative) ?? 50) * r / 100), s = t + ((i2 == null ? void 0 : i2.yAbsolute) ?? ((i2 == null ? void 0 : i2.yRelative) ?? 50) * n / 100), a = (i2 == null ? void 0 : i2.zAbsolute) ?? 0;
  return ft(Bt(o, s, a), ft(A, Bt(-o, -s, -a)));
}
var dn = { world: Ut, base: Ut, local: Ut, preserve3d: false };
function Gt(A, e, t) {
  return A[3] * e + A[7] * t + A[15];
}
function Wa({ functions: A, box: e, origin: t, parent: r, preserve3d: n, perspectiveDistance: i2, perspectiveOrigin: o, canProject: s }) {
  let a = Ut;
  for (let b of A) a = ft(a, Lc(b, e.width, e.height));
  a = Ja(a, e, t), r.perspective && (a = ft(r.perspective, a));
  let g2 = r.preserve3d ? r.base : ft(r.world, Mc), u2 = r.preserve3d ? ft(r.local, a) : a, I = ft(g2, u2), { left: B, top: f, width: E, height: C } = e, p = [Gt(I, B, f), Gt(I, B + E, f), Gt(I, B, f + C), Gt(I, B + E, f + C)], m2 = Gt(I, B + E / 2, f + C / 2), x3 = p.every((b) => Math.abs(b - m2) < 1e-6), w2;
  if (!x3 && s) w2 = I, I = Ut;
  else if (I[3] || I[7] || I[15] !== 1) {
    let b = B + E / 2, D = f + C / 2, h2 = (I[0] * b + I[4] * D + I[12]) / m2, v2 = (I[1] * b + I[5] * D + I[13]) / m2, F = (I[0] - h2 * I[3]) / m2, K2 = (I[4] - h2 * I[7]) / m2, _ = (I[1] - v2 * I[3]) / m2, AA = (I[5] - v2 * I[7]) / m2;
    I = [...I], I[0] = F, I[1] = _, I[4] = K2, I[5] = AA, I[12] = h2 - F * b - K2 * D, I[13] = v2 - _ * b - AA * D, I[3] = I[7] = 0, I[15] = 1;
  }
  return { world: I, base: g2, local: u2, preserve3d: n, perspective: i2 !== void 0 ? Ja(Ka(i2), e, o) : void 0, projection: w2, behindViewer: p.every((b) => b <= 0) };
}
function Ya(A, e, t) {
  let r = A.local;
  return (r[2] * e + r[6] * t + r[14]) / Gt(r, e, t);
}
function qa(A) {
  return A[0] * (A[4] * A[8] - A[5] * A[7]) - A[1] * (A[3] * A[8] - A[5] * A[6]) + A[2] * (A[3] * A[7] - A[4] * A[6]);
}
function Gc(A) {
  let e = 0;
  for (let t = 0; t < 4; t++) {
    let r = [];
    for (let n = 0; n < 4; n++) n !== t && r.push(A[n * 4 + 1], A[n * 4 + 2], A[n * 4 + 3]);
    e += (t % 2 ? -1 : 1) * A[t * 4] * qa(r);
  }
  return e;
}
function Xa(A) {
  let e = A.local, t = Gc(e);
  return t ? qa([e[0], e[1], e[3], e[4], e[5], e[7], e[12], e[13], e[15]]) / t < 0 : false;
}
function Uc(A) {
  let e = A[15];
  return `matrix(${[A[0], A[1], A[4], A[5], A[12], A[13]].map((t) => +(t / e).toFixed(6)).join(",")})`;
}
function nr(A, e, t, r) {
  let n = e.__state;
  return Uc((n ?? dn).world);
}
function za({ left: A, top: e, width: t, height: r, isInheritingTransform: n }, i2) {
  let o = "", s = 1;
  return i2.transform && (o = nr({ left: A, top: e, width: t, height: r }, i2.transform, n, i2.transformOrigin)), i2.opacity !== void 0 && (s = +i2.opacity), { matrix: o, opacity: s };
}
function wi({ id: A, content: e, filter: t, left: r, top: n, width: i2, height: o, matrix: s, opacity: a, image: g2, clipPathId: u2, debug: I, shape: B, decorationShape: f }, E) {
  let C = "";
  if (I && (C = R2("rect", { x: r, y: n - o, width: i2, height: o, fill: "transparent", stroke: "#575eff", "stroke-width": 1, transform: s || void 0, "clip-path": u2 ? `url(#${u2})` : void 0 })), g2) {
    let x3 = { href: g2, x: r, y: n, width: i2, height: o, transform: s || void 0, "clip-path": u2 ? `url(#${u2})` : void 0, style: E.filter ? `filter:${E.filter}` : void 0 }, w2 = R2("image", { ...x3, opacity: a !== 1 ? a : void 0 }) + (f || "");
    return [(t ? t + R2("g", { filter: `url(#satori_s-${A})` }, w2) : w2) + C, ""];
  }
  let p = { x: r, y: n, width: i2, height: o, "font-weight": E.fontWeight, "font-style": E.fontStyle, "font-size": E.fontSize, "font-family": E.fontFamily, "letter-spacing": E.letterSpacing || void 0, transform: s || void 0, "clip-path": u2 ? `url(#${u2})` : void 0, style: E.filter ? `filter:${E.filter}` : void 0, "stroke-width": E.WebkitTextStrokeWidth ? `${E.WebkitTextStrokeWidth}px` : void 0, stroke: E.WebkitTextStrokeWidth ? E.WebkitTextStrokeColor : void 0, "stroke-linejoin": E.WebkitTextStrokeWidth ? "round" : void 0, "paint-order": E.WebkitTextStrokeWidth ? "stroke" : void 0 }, m2 = R2("text", { ...p, fill: E.color, opacity: a !== 1 ? a : void 0 }, (0, import_escape_html2.default)(e)) + (f || "");
  return [(t ? t + R2("g", { filter: `url(#satori_s-${A})` }, m2) : m2) + C, B ? R2("text", p, (0, import_escape_html2.default)(e)) : ""];
}
function Hc(A, e, t) {
  return A.replace(/([MA])([0-9.-]+),([0-9.-]+)/g, function(r, n, i2, o) {
    return n + (parseFloat(i2) + e) + "," + (parseFloat(o) + t);
  });
}
var pn = 1.1;
function Za({ id: A, width: e, height: t }, r, n = false) {
  if (!r.shadowColor || !r.shadowOffset || typeof r.shadowRadius > "u") return "";
  let i2 = r.shadowColor.length, o = "", s = "", a = 0, g2 = e, u2 = 0, I = t;
  for (let B = 0; B < i2; B++) {
    let f = r.shadowRadius[B] * r.shadowRadius[B] / 4;
    if (a = Math.min(r.shadowOffset[B].width - f, a), g2 = Math.max(r.shadowOffset[B].width + f + e, g2), u2 = Math.min(r.shadowOffset[B].height - f, u2), I = Math.max(r.shadowOffset[B].height + f + t, I), n) {
      let E = `satori_s-${A}-result-${B}`;
      o += R2("feGaussianBlur", { in: "SourceAlpha", stdDeviation: r.shadowRadius[B] / 2, result: `${E}-blur` }) + R2("feOffset", { in: `${E}-blur`, dx: r.shadowOffset[B].width, dy: r.shadowOffset[B].height, result: `${E}-offset` }) + R2("feFlood", { "flood-color": r.shadowColor[B], "flood-opacity": 1, result: `${E}-color` }) + R2("feComposite", { in: `${E}-color`, in2: `${E}-offset`, operator: "in", result: i2 > 1 ? E : void 0 });
    } else o += R2("feDropShadow", { dx: r.shadowOffset[B].width, dy: r.shadowOffset[B].height, stdDeviation: r.shadowRadius[B] / 2, "flood-color": r.shadowColor[B], "flood-opacity": 1, ...i2 > 1 ? { in: "SourceGraphic", result: `satori_s-${A}-result-${B}` } : {} });
    i2 > 1 && (s = R2("feMergeNode", { in: `satori_s-${A}-result-${B}` }) + s);
  }
  return R2("filter", { id: `satori_s-${A}`, x: (a / e * 100 * pn).toFixed(2) + "%", y: (u2 / t * 100 * pn).toFixed(2) + "%", width: ((g2 - a) / e * 100 * pn).toFixed(2) + "%", height: ((I - u2) / t * 100 * pn).toFixed(2) + "%" }, o + (s ? R2("feMerge", {}, s) : ""));
}
function ja({ width: A, height: e, shape: t, opacity: r, id: n }, i2) {
  if (!i2.boxShadow) return null;
  let o = "", s = "";
  for (let a = i2.boxShadow.length - 1; a >= 0; a--) {
    let g2 = "", u2 = i2.boxShadow[a];
    u2.spreadRadius && u2.inset && (u2.spreadRadius = -u2.spreadRadius);
    let I = u2.blurRadius * u2.blurRadius / 4 + (u2.spreadRadius || 0), B = Math.min(-I - (u2.inset ? u2.offsetX : 0), 0), f = Math.max(I + A - (u2.inset ? u2.offsetX : 0), A), E = Math.min(-I - (u2.inset ? u2.offsetY : 0), 0), C = Math.max(I + e - (u2.inset ? u2.offsetY : 0), e), p = `satori_s-${n}-${a}`, m2 = `satori_ms-${n}-${a}`, x3 = u2.spreadRadius ? t.replace('stroke-width="0"', `stroke-width="${u2.spreadRadius * 2}"`) : t;
    g2 += R2("mask", { id: m2, maskUnits: "userSpaceOnUse" }, R2("rect", { x: 0, y: 0, width: i2._viewportWidth || "100%", height: i2._viewportHeight || "100%", fill: u2.inset ? "#000" : "#fff" }) + x3.replace('fill="#fff"', u2.inset ? 'fill="#fff"' : 'fill="#000"').replace('stroke="#fff"', ""));
    let w2 = x3.replace(/d="([^"]+)"/, (b, D) => 'd="' + Hc(D, u2.offsetX, u2.offsetY) + '"').replace(/x="([^"]+)"/, (b, D) => 'x="' + (parseFloat(D) + u2.offsetX) + '"').replace(/y="([^"]+)"/, (b, D) => 'y="' + (parseFloat(D) + u2.offsetY) + '"');
    u2.spreadRadius && u2.spreadRadius < 0 && (g2 += R2("mask", { id: m2 + "-neg", maskUnits: "userSpaceOnUse" }, w2.replace('stroke="#fff"', 'stroke="#000"').replace(/stroke-width="[^"]+"/, `stroke-width="${-u2.spreadRadius * 2}"`))), u2.spreadRadius && u2.spreadRadius < 0 && (w2 = R2("g", { mask: `url(#${m2}-neg)` }, w2)), g2 += R2("defs", {}, R2("filter", { id: p, x: `${B / A * 100}%`, y: `${E / e * 100}%`, width: `${(f - B) / A * 100}%`, height: `${(C - E) / e * 100}%` }, R2("feGaussianBlur", { stdDeviation: u2.blurRadius / 2, result: "b" }) + R2("feFlood", { "flood-color": u2.color, in: "SourceGraphic", result: "f" }) + R2("feComposite", { in: "f", in2: "b", operator: u2.inset ? "out" : "in" }))) + R2("g", { mask: `url(#${m2})`, filter: `url(#${p})`, opacity: r }, w2), u2.inset ? s += g2 : o += g2;
  }
  return [o, s];
}
function Oc(A, e, t, r, n, i2) {
  let o = n / 2, s = Math.max(o, n * 1.25), a = [];
  for (let I of t) {
    if (I.y2 < i2 + o || I.y1 > r + o) continue;
    let B = Math.max(A, I.x1 - s), f = Math.min(e, I.x2 + s);
    if (B >= f) continue;
    if (a.length === 0) {
      a.push([B, f]);
      continue;
    }
    let E = a[a.length - 1];
    B <= E[1] ? E[1] = Math.max(E[1], f) : a.push([B, f]);
  }
  if (!a.length) return [[A, e]];
  let g2 = [], u2 = A;
  for (let [I, B] of a) if (I > u2 && g2.push([u2, I]), u2 = Math.max(u2, B), u2 >= e) break;
  return u2 < e && g2.push([u2, e]), g2;
}
function Di({ width: A, left: e, top: t, ascender: r, clipPathId: n, matrix: i2, glyphBoxes: o }, s) {
  let { textDecorationColor: a, textDecorationStyle: g2, textDecorationLine: u2, textDecorationSkipInk: I, fontSize: B, color: f } = s;
  if (!u2 || u2 === "none") return "";
  let E = Math.max(1, B * 0.1), C = u2 === "line-through" ? t + r * 0.7 : u2 === "underline" ? t + r * 1.1 : t, p = g2 === "dashed" ? `${E * 1.2} ${E * 2}` : g2 === "dotted" ? `0 ${E * 2}` : void 0, m2 = u2 === "underline" && (I || "auto") !== "none" && (o == null ? void 0 : o.length), x3 = t + r, w2 = m2 ? Oc(e, e + A, o, C, E, x3) : [[e, e + A]], b = g2 === "double" ? w2.map(([h2, v2]) => R2("line", { x1: h2, y1: C + E + 1, x2: v2, y2: C + E + 1, stroke: a || f, "stroke-width": E, "stroke-dasharray": p, "stroke-linecap": g2 === "dotted" ? "round" : "square", transform: i2 })).join("") : "", D = w2.map(([h2, v2]) => R2("line", { x1: h2, y1: C, x2: v2, y2: C, stroke: a || f, "stroke-width": E, "stroke-dasharray": p, "stroke-linecap": g2 === "dotted" ? "round" : "square", transform: i2 })).join("") + b;
  return n ? R2("g", { "clip-path": `url(#${n})` }, D) : D;
}
function bi(A) {
  return A = A.replace("U+", "0x"), String.fromCodePoint(Number(A));
}
var Et = bi("U+0020");
var Si = bi("U+0009");
var Ht = bi("U+2026");
function $a(A, e, t) {
  let { fontSize: r, letterSpacing: n, fontFeatureSettings: i2 } = t, o = /* @__PURE__ */ new Map();
  function s(I) {
    let B = o.get(I);
    return B === void 0 && (B = A.measure(I, { fontSize: r, letterSpacing: n, fontFeatureSettings: i2 }), o.set(I, B)), B;
  }
  function a(I) {
    return s(I);
  }
  function g2(I) {
    let B = 0, f = "", E = () => {
      f && (B += s(f), f = "");
    };
    for (let C of I) e(C) ? (E(), B += r) : f += C;
    return E(), B;
  }
  function u2(I) {
    return g2(_A(I, "grapheme"));
  }
  return { measureGrapheme: a, measureGraphemeArray: g2, measureText: u2 };
}
function Ag(A, e, t) {
  let { textTransform: r, whiteSpace: n, wordBreak: i2 } = e;
  A = Tc(A, r, t);
  let { content: o, shouldCollapseTabsAndSpaces: s, allowSoftWrap: a } = Jc(A, n), { words: g2, requiredBreaks: u2, allowBreakWord: I } = _c(o, i2), [B, f] = Pc(e, a);
  return { words: g2, requiredBreaks: u2, allowSoftWrap: a, allowBreakWord: I, processedContent: o, shouldCollapseTabsAndSpaces: s, lineLimit: B, blockEllipsis: f };
}
function Tc(A, e, t) {
  return e === "uppercase" ? A = A.toLocaleUpperCase(t) : e === "lowercase" ? A = A.toLocaleLowerCase(t) : e === "capitalize" && (A = _A(A, "word", t).map((r) => _A(r, "grapheme", t).map((n, i2) => i2 === 0 ? n.toLocaleUpperCase(t) : n).join("")).join("")), A;
}
function Pc(A, e) {
  let { textOverflow: t, lineClamp: r, WebkitLineClamp: n, WebkitBoxOrient: i2, overflow: o, display: s } = A;
  if (s === "block" && r) {
    let [a, g2 = Ht] = Kc(r);
    if (a) return [a, g2];
  }
  return t === "ellipsis" && s === "-webkit-box" && i2 === "vertical" && ra(n) && n > 0 ? [n, Ht] : t === "ellipsis" && o === "hidden" && !e ? [1, Ht] : [1 / 0];
}
function _c(A, e) {
  let t = ["break-all", "break-word"].includes(e), { words: r, requiredBreaks: n } = ia(A, e);
  return { words: r, requiredBreaks: n, allowBreakWord: t };
}
function Jc(A, e) {
  let t = ["pre", "pre-wrap", "pre-line"].includes(e), r = ["normal", "nowrap", "pre-line"].includes(e), n = !["pre", "nowrap"].includes(e);
  return t || (A = A.replace(/\n/g, Et)), r && (A = A.replace(/([ ]|\t)+/g, Et).replace(/^[ ]|[ ]$/g, "")), { content: A, shouldCollapseTabsAndSpaces: r, allowSoftWrap: n };
}
function Kc(A) {
  if (typeof A == "number") return [A];
  let e = /^(\d+)\s*"(.*)"$/, t = /^(\d+)\s*'(.*)'$/, r = e.exec(A), n = t.exec(A);
  if (r) {
    let i2 = +r[1], o = r[2];
    return [i2, o];
  } else if (n) {
    let i2 = +n[1], o = n[2];
    return [i2, o];
  }
  return [];
}
var Wc = /* @__PURE__ */ new Set([Si]);
function Yc(A) {
  return Wc.has(A);
}
function xi(A) {
  if (A === "transparent") return true;
  let e = (0, import_parse_css_color3.default)(A);
  return e ? e.alpha === 0 : false;
}
function eg(A) {
  if (!A) return false;
  let e = (0, import_parse_css_color3.default)(A);
  if (!e) return false;
  let [t, r, n, i2] = e.values;
  return t === 255 && r === 255 && n === 255 && (i2 === void 0 || i2 === 1);
}
async function* ki(A, e) {
  let t = await je(), { parentStyle: r, inheritedStyle: n, parent: i2, font: o, id: s, isInheritingTransform: a, debug: g2, embedFont: u2, graphemeImages: I, locale: B, canLoadAdditionalAssets: f } = e, { textAlign: E, textIndent: C = 0, lineHeight: p, textWrap: m2, fontSize: x3, filter: w2, tabSize: b = 8, letterSpacing: D, fontFeatureSettings: h2, _inheritedBackgroundClipTextPath: v2, _inheritedBackgroundClipTextHasBackground: F, flexShrink: K2 } = r, { words: _, requiredBreaks: AA, allowSoftWrap: EA, allowBreakWord: iA, processedContent: lA, shouldCollapseTabsAndSpaces: re, lineLimit: MA, blockEllipsis: ne } = Ag(A, r, B), kA = qc(t, E);
  i2.insertChild(kA, i2.getChildCount()), na(K2) && i2.setFlexShrink(1);
  let Z = o.getEngine(x3, p, r, B), eA = f ? _A(lA, "grapheme").filter((z) => !Yc(z) && !Z.has(z)) : [];
  yield eA.map((z) => ({ word: z, locale: B })), eA.length && (Z = o.getEngine(x3, p, r, B));
  function YA(z) {
    return !!(I && Object.prototype.hasOwnProperty.call(I, z) && I[z]);
  }
  let { measureGrapheme: FA, measureGraphemeArray: LA, measureText: QA } = $a(Z, YA, { fontSize: x3, letterSpacing: D, fontFeatureSettings: h2 }), GA = en(b) ? V(b, x3, 1, r) : FA(Et) * b, HA = (z, X) => {
    if (z.length === 0) return { originWidth: 0, endingSpacesWidth: 0, text: z };
    let { index: fA, tabCount: j } = Xc(z), mA = 0;
    if (j > 0) {
      let yA = z.slice(0, fA), tA = z.slice(fA + j), rA = QA(yA), ue = rA + X;
      mA = (GA === 0 ? rA : (Math.floor(ue / GA) + j) * GA) + QA(tA);
    } else mA = QA(z);
    let IA = z.trimEnd() === z ? mA : QA(z.trimEnd());
    return { originWidth: mA, endingSpacesWidth: mA - IA, text: z };
  }, gA = [], uA = [], J = [], SA = [], CA = [];
  function vA(z) {
    let X = 0, fA = 0, j = -1, mA = 0, IA = 0, yA = 0, tA = 0;
    gA = [], J = [0], SA = [], CA = [];
    let rA = 0, ue = 0;
    for (; rA < _.length && X < MA; ) {
      let $ = _[rA], PA = AA[rA], VA = 0, { originWidth: qt, endingSpacesWidth: RA, text: ut } = HA($, IA);
      $ = ut, VA = qt;
      let WA = RA;
      PA && yA === 0 && (yA = Z.height($));
      let Ue = E === "justify", wA = rA && IA + VA > z + WA && EA;
      if (iA && VA > z && (!IA || wA || PA)) {
        let $A = _A($, "grapheme");
        _.splice(rA, 1, ...$A), IA > 0 && (gA.push(IA - ue), uA.push(tA), X++, mA += yA, IA = 0, yA = 0, tA = 0, J.push(1), j = -1), ue = WA;
        continue;
      }
      if (PA || wA) re && $ === Et && (VA = 0), gA.push(IA - ue), uA.push(tA), X++, mA += yA, IA = VA, yA = VA ? Math.round(Z.height($)) : 0, tA = VA ? Math.round(Z.baseline($)) : 0, J.push(1), j = -1, PA || (fA = Math.max(fA, z));
      else {
        IA += VA;
        let $A = Math.round(Z.height($));
        $A > yA && (yA = $A, tA = Math.round(Z.baseline($))), Ue && J[J.length - 1]++;
      }
      Ue && j++, fA = Math.max(fA, IA);
      let jA = IA - VA;
      if (VA === 0) CA.push({ y: mA, x: jA, width: 0, line: X, lineIndex: j, isImage: false });
      else {
        let $A = _A($, "word");
        for (let Ie = 0; Ie < $A.length; Ie++) {
          let we = $A[Ie], zA = 0, le = false;
          YA(we) ? (zA = x3, le = true) : !u2 && we.length > 1 ? zA = QA(we) : zA = FA(we), SA.push(we), CA.push({ y: mA, x: jA, width: zA, line: X, lineIndex: j, isImage: le }), jA += zA, Ie < $A.length - 1 && D > 0 && (jA += D);
        }
      }
      rA++, ue = WA;
    }
    return IA && (X < MA && (mA += yA), X++, gA.push(IA), uA.push(tA)), { width: fA, height: mA };
  }
  let NA = { width: 0, height: 0 };
  kA.setMeasureFunc((z) => {
    let { width: X, height: fA } = vA(z);
    if (m2 === "balance") {
      let mA = X / 2, IA = X, yA = X;
      for (; mA + 1 < IA; ) {
        yA = (mA + IA) / 2;
        let { height: rA } = vA(yA);
        rA > fA ? mA = yA : IA = yA;
      }
      vA(IA);
      let tA = Math.ceil(IA);
      return NA = { width: tA, height: fA }, { width: tA, height: fA };
    }
    if (m2 === "pretty" && gA[gA.length - 1] < X / 3) {
      let yA = X * 0.9, tA = vA(yA);
      if (tA.height <= fA * 1.3) return NA = { width: X, height: tA.height }, { width: X, height: tA.height };
    }
    let j = Math.ceil(X);
    return NA = { width: j, height: fA }, { width: j, height: fA };
  });
  let [cA, TA] = yield, OA = "", Y = "", oA = n._inheritedClipPathId, xe = n._inheritedMaskId, { left: ke, top: Yt, width: ot, height: wt } = kA.getComputedLayout(), Dt = typeof C == "string" ? V(C, x3, ot, r, true) || 0 : C, st = i2.getComputedWidth() - i2.getComputedPadding(t.EDGE_LEFT) - i2.getComputedPadding(t.EDGE_RIGHT) - i2.getComputedBorder(t.EDGE_LEFT) - i2.getComputedBorder(t.EDGE_RIGHT), ve = cA + ke, pe = TA + Yt, { matrix: ae, opacity: at } = za({ left: ke, top: Yt, width: ot, height: wt, isInheritingTransform: a }, r), qA = "";
  if (r.textShadowOffset) {
    let { textShadowColor: z, textShadowOffset: X, textShadowRadius: fA } = r;
    qA = Za({ width: NA.width, height: NA.height, id: s }, { shadowColor: z, shadowOffset: X, shadowRadius: fA }, xi(r.color) || F && eg(r.color)), qA = R2("defs", {}, qA);
  }
  let he = "", me = "", gt = "", ze = -1, XA = {}, ge = {}, ie = null, ye = 0;
  for (let z = 0; z < SA.length; z++) {
    let X = CA[z], fA = CA[z + 1];
    if (!X) continue;
    let j = SA[z], mA = null, IA = false, yA = I && Object.prototype.hasOwnProperty.call(I, j) ? I[j] : null, tA = X.y, rA = X.x, ue = X.width, $ = X.line, PA = r.textDecorationLine === "underline" && (r.textDecorationSkipInk || "auto") !== "none";
    if ($ === ze) continue;
    let VA = false;
    if ($ === 0 && Dt !== 0 && (rA += Dt), gA.length > 1) {
      let wA = ot - gA[$];
      if (E === "right" || E === "end") rA += wA;
      else if (E === "center") rA += wA / 2;
      else if (E === "justify" && $ < gA.length - 1) {
        let xA = J[$], jA = xA > 1 ? wA / (xA - 1) : 0;
        rA += jA * X.lineIndex, VA = true;
      }
      u2 && (rA = Math.round(rA));
    }
    let qt = uA[$], RA = Z.baseline(j), ut = Z.height(j), WA = qt - RA, Ue = (wA) => !PA || r.textDecorationLine !== "underline" ? void 0 : { underlineY: pe + wA + WA + RA + RA * 0.1, strokeWidth: Math.max(1, x3 * 0.1) };
    if (XA[$] || (XA[$] = { left: rA, top: pe + tA + WA, ascender: RA, width: VA ? ot : gA[$] }), MA !== 1 / 0) {
      let we = function(zA, le) {
        let Xt = _A(le, "grapheme", B), bt = "", Yr = 0;
        for (let qr of Xt) {
          let Vt = zA + LA([bt + qr]);
          if (bt && Vt + xA > st) break;
          bt += qr, Yr = Vt;
        }
        return { subset: bt, resolvedWidth: Yr };
      }, wA = ne, xA = FA(ne);
      xA > st && (wA = Ht, xA = FA(wA));
      let jA = FA(Et), $A = $ < gA.length - 1;
      if ($ + 1 === MA && ($A || gA[$] > st)) {
        if (rA + ue + xA + jA > st) {
          let { subset: zA, resolvedWidth: le } = we(rA, j);
          j = zA + wA, ze = $, XA[$].width = Math.max(0, le - XA[$].left), IA = true;
        } else if (fA && fA.line !== $) if (E === "center") {
          let { subset: zA, resolvedWidth: le } = we(rA, j);
          j = zA + wA, ze = $, XA[$].width = Math.max(0, le - XA[$].left), IA = true;
        } else {
          let zA = SA[z + 1], { subset: le, resolvedWidth: Xt } = we(ue + rA, zA);
          j = j + le + wA, ze = $, XA[$].width = Math.max(0, Xt - XA[$].left), IA = true;
        }
      }
    }
    if (yA) tA += 0;
    else if (u2) {
      if (!j.includes(Si) && !$s.includes(j) && SA[z + 1] && fA && !fA.isImage && tA === fA.y && !IA) {
        ie === null && (ye = rA), ie = ie === null ? j : ie + j;
        continue;
      }
      let wA = ie === null ? j : ie + j, xA = ie === null ? rA : ye, jA = X.width + rA - xA, $A = Ue(tA), Ie = Z.getSVG(wA.replace(/(\t)+/g, ""), { fontSize: x3, left: ve + xA, top: pe + tA + RA + WA, letterSpacing: D, fontFeatureSettings: h2 }, $A);
      mA = Ie.path, PA && Ie.boxes && Ie.boxes.length && (ge[$] || (ge[$] = [])).push(...Ie.boxes), ie = null, g2 && (gt += R2("rect", { x: ve + xA, y: pe + tA + WA, width: jA, height: ut, fill: "transparent", stroke: "#575eff", "stroke-width": 1, transform: ae || void 0, "clip-path": oA ? `url(#${oA})` : void 0 }) + R2("line", { x1: ve + rA, x2: ve + rA + X.width, y1: pe + tA + WA + RA, y2: pe + tA + WA + RA, stroke: "#14c000", "stroke-width": 1, transform: ae || void 0, "clip-path": oA ? `url(#${oA})` : void 0 }));
    } else if (tA += RA + WA, PA && !yA) {
      let wA = Ue(tA), xA = Z.getSVG(j.replace(/(\t)+/g, ""), { fontSize: x3, left: ve + rA, top: pe + tA, letterSpacing: D, fontFeatureSettings: h2 }, wA);
      xA.boxes && xA.boxes.length && (ge[$] || (ge[$] = [])).push(...xA.boxes);
    }
    if (mA !== null) me += mA + " ";
    else {
      let [wA, xA] = wi({ content: j, filter: qA, id: s, left: ve + rA, top: pe + tA, width: ue, height: ut, matrix: ae, opacity: at, image: yA, clipPathId: oA, debug: g2, shape: !!v2 }, r);
      OA += wA, Y += xA;
    }
    if (IA) break;
  }
  if (r.textDecorationLine && (he = Object.entries(XA).map(([z, X]) => {
    if (!X) return "";
    let fA = ge[z] || [];
    return Di({ left: ve + X.left, top: X.top, width: X.width, ascender: X.ascender, clipPathId: oA, matrix: ae, glyphBoxes: fA }, r);
  }).join("")), me) {
    let z = (!xi(r.color) || qA) && at !== 0 ? R2("path", { fill: qA && (xi(r.color) || F && eg(r.color)) ? "black" : r.color, d: me, transform: ae || void 0, [n.WebkitTextStrokeWidth || w2 || qA ? "opacity" : "fill-opacity"]: at !== 1 ? at : void 0, style: w2 ? `filter:${w2}` : void 0, "stroke-width": n.WebkitTextStrokeWidth ? `${n.WebkitTextStrokeWidth}px` : void 0, stroke: n.WebkitTextStrokeWidth ? n.WebkitTextStrokeColor : void 0, "stroke-linejoin": n.WebkitTextStrokeWidth ? "round" : void 0, "paint-order": n.WebkitTextStrokeWidth ? "stroke" : void 0 }) : "", X = z ? R2("g", { mask: xe ? `url(#${xe})` : void 0, "clip-path": oA ? `url(#${oA})` : void 0 }, z) : "";
    v2 && (Y = R2("path", { d: me, transform: ae || void 0 })), OA += (qA ? qA + R2("g", { filter: `url(#satori_s-${s})` }, X + he) : X + he) + gt;
  } else he && (OA += qA ? R2("g", { filter: `url(#satori_s-${s})` }, he) : he);
  return Y && (r._inheritedBackgroundClipTextPath.value += Y), OA;
}
function qc(A, e) {
  let t = A.Node.create();
  return t.setAlignItems(A.ALIGN_BASELINE), t.setJustifyContent(ZA(e, { left: A.JUSTIFY_FLEX_START, right: A.JUSTIFY_FLEX_END, center: A.JUSTIFY_CENTER, justify: A.JUSTIFY_SPACE_BETWEEN, start: A.JUSTIFY_FLEX_START, end: A.JUSTIFY_FLEX_END }, A.JUSTIFY_FLEX_START, "textAlign")), t;
}
function Xc(A) {
  let e = /(\t)+/.exec(A);
  return e ? { index: e.index, tabCount: e[0].length } : { index: null, tabCount: 0 };
}
function hn(A, e, t, r, n) {
  let i2 = [], o = e.at(-1), s = o && o.offset && o.offset.unit === "%" && r ? +o.offset.value : 100;
  for (let I of e) {
    let { color: B } = I;
    if (!i2.length && (i2.push({ offset: 0, color: B }), !I.offset || I.offset.value === "0")) continue;
    let f = typeof I.offset > "u" ? void 0 : I.offset.unit === "%" ? +I.offset.value / s : Number(V(`${I.offset.value}${I.offset.unit}`, t.fontSize, A, t, true)) / A;
    i2.push({ offset: f, color: B });
  }
  i2.length || i2.push({ offset: 0, color: "transparent" });
  let a = i2[i2.length - 1];
  a.offset !== 1 && (typeof a.offset > "u" ? a.offset = 1 : r ? i2[i2.length - 1] = { offset: 1, color: a.color } : i2.push({ offset: 1, color: a.color }));
  let g2 = 0, u2 = 1;
  for (let I = 0; I < i2.length; I++) if (typeof i2[I].offset > "u") {
    for (u2 < I && (u2 = I); typeof i2[u2].offset > "u"; ) u2++;
    i2[I].offset = (i2[u2].offset - i2[g2].offset) / (u2 - g2) * (I - g2) + i2[g2].offset;
  } else g2 = I;
  return n === "mask" ? i2.map((I) => {
    let B = (0, import_parse_css_color4.default)(I.color);
    return B ? B.alpha === 0 ? { ...I, color: "rgba(0, 0, 0, 1)" } : { ...I, color: `rgba(255, 255, 255, ${B.alpha})` } : I;
  }) : i2;
}
function rg({ id: A, width: e, height: t, repeatX: r, repeatY: n }, i2, o, s, a, g2) {
  let u2 = P(i2), [I, B] = o, f = i2.startsWith("repeating"), E, C, p;
  if (u2.orientation.type === "directional") E = jc(u2.orientation.value), C = Math.sqrt(Math.pow((E.x2 - E.x1) * I, 2) + Math.pow((E.y2 - E.y1) * B, 2));
  else if (u2.orientation.type === "angular") {
    let { length: D, ...h2 } = $c(Te(`${u2.orientation.value.value}${u2.orientation.value.unit}`) / 180 * Math.PI, I, B);
    C = D, E = h2;
  }
  p = f ? Af(u2.stops, C, E, a) : E;
  let m2 = hn(f ? Zc(u2.stops, C) : C, u2.stops, a, f, g2), x3 = `satori_bi${A}`, w2 = `satori_pattern_${A}`, b = R2("pattern", { id: w2, x: s[0] / e, y: s[1] / t, width: r ? I / e : "1", height: n ? B / t : "1", patternUnits: "objectBoundingBox" }, R2("linearGradient", { id: x3, ...p, spreadMethod: f ? "repeat" : "pad" }, m2.map((D) => R2("stop", { offset: (D.offset ?? 0) * 100 + "%", "stop-color": D.color })).join("")) + R2("rect", { x: 0, y: 0, width: I, height: B, fill: `url(#${x3})` }));
  return [w2, b];
}
function Zc(A, e) {
  let t = A[A.length - 1], { offset: r } = t;
  return r ? r.unit === "%" ? Number(r.value) / 100 * e : Number(r.value) : e;
}
function jc(A) {
  let e = 0, t = 0, r = 0, n = 0;
  return A.includes("top") ? t = 1 : A.includes("bottom") && (n = 1), A.includes("left") ? e = 1 : A.includes("right") && (r = 1), !e && !r && !t && !n && (t = 1), { x1: e, y1: t, x2: r, y2: n };
}
function $c(A, e, t) {
  let r = Math.pow(t / e, 2);
  A = (A % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  let n, i2, o, s, a, g2, u2, I, B = (f) => {
    if (f === 0) {
      n = 0, i2 = t, o = 0, s = 0, a = t;
      return;
    } else if (f === Math.PI / 2) {
      n = 0, i2 = 0, o = e, s = 0, a = e;
      return;
    }
    if (f > 0 && f < Math.PI / 2) {
      n = (r * e / 2 / Math.tan(f) - t / 2) / (Math.tan(f) + r / Math.tan(f)), i2 = Math.tan(f) * n + t, o = Math.abs(e / 2 - n) + e / 2, s = t / 2 - Math.abs(i2 - t / 2), a = Math.sqrt(Math.pow(o - n, 2) + Math.pow(s - i2, 2)), u2 = (e / 2 / Math.tan(f) - t / 2) / (Math.tan(f) + 1 / Math.tan(f)), I = Math.tan(f) * u2 + t, a = 2 * Math.sqrt(Math.pow(e / 2 - u2, 2) + Math.pow(t / 2 - I, 2));
      return;
    } else if (f > Math.PI / 2 && f < Math.PI) {
      n = (t / 2 + r * e / 2 / Math.tan(f)) / (Math.tan(f) + r / Math.tan(f)), i2 = Math.tan(f) * n, o = Math.abs(e / 2 - n) + e / 2, s = t / 2 + Math.abs(i2 - t / 2), u2 = (e / 2 / Math.tan(f) + t / 2) / (Math.tan(f) + 1 / Math.tan(f)), I = Math.tan(f) * u2, a = 2 * Math.sqrt(Math.pow(e / 2 - u2, 2) + Math.pow(t / 2 - I, 2));
      return;
    } else f >= Math.PI && (B(f - Math.PI), g2 = n, n = o, o = g2, g2 = i2, i2 = s, s = g2);
  };
  return B(A), { x1: n / e, y1: i2 / t, x2: o / e, y2: s / t, length: a };
}
function Af(A, e, t, r) {
  let { x1: n, x2: i2, y1: o, y2: s } = t, a = A[0].offset ? A[0].offset.unit === "%" ? Number(A[0].offset.value) / 100 : V(`${A[0].offset.value}${A[0].offset.unit}`, r.fontSize, e, r, true) / e : 0, g2 = A.at(-1).offset ? A.at(-1).offset.unit === "%" ? Number(A.at(-1).offset.value) / 100 : V(`${A.at(-1).offset.value}${A.at(-1).offset.unit}`, r.fontSize, e, r, true) / e : 1, u2 = (i2 - n) * a + n, I = (s - o) * a + o, B = (i2 - n) * g2 + n, f = (s - o) * g2 + o;
  return { x1: u2, y1: I, x2: B, y2: f };
}
function ig({ id: A, width: e, height: t, repeatX: r, repeatY: n }, i2, o, s, a, g2) {
  var iA;
  let { shape: u2, stops: I, position: B, size: f, repeating: E } = K(i2), [C, p] = o, m2 = C / 2, x3 = p / 2, w2 = rf(B.x, B.y, C, p, a.fontSize, a);
  m2 = w2.x, x3 = w2.y;
  let b = tf(e, I, E, a), D = hn(b, I, a, E, g2), h2 = `satori_radial_${A}`, v2 = `satori_pattern_${A}`, F = `satori_mask_${A}`, K2 = of(u2, f, a.fontSize, { x: m2, y: x3 }, [C, p], a, E), _ = nf(u2, a.fontSize, I, [C, p], a, E, K2), AA = R2("pattern", { id: v2, x: s[0] / e, y: s[1] / t, width: r ? C / e : "1", height: n ? p / t : "1", patternUnits: "objectBoundingBox" }, R2("radialGradient", { id: h2, ..._ }, D.map((lA) => R2("stop", { offset: lA.offset || 0, "stop-color": lA.color })).join("")) + R2("mask", { id: F }, R2("rect", { x: 0, y: 0, width: C, height: p, fill: "#fff" })) + R2("rect", { x: 0, y: 0, width: C, height: p, fill: ((iA = D.at(-1)) == null ? void 0 : iA.color) || "transparent" }) + R2(u2, { cx: m2, cy: x3, width: C, height: p, ...K2, fill: `url(#${h2})`, mask: `url(#${F})` }));
  return [v2, AA];
}
function tf(A, e, t, r) {
  if (!t) return A;
  let n = e.at(-1);
  return !n || !n.offset || n.offset.unit === "%" ? A : V(`${n.offset.value}${n.offset.unit}`, +r.fontSize, A, r, true);
}
function rf(A, e, t, r, n, i2) {
  let o = { x: t / 2, y: r / 2 };
  return A.type === "keyword" ? Object.assign(o, ng(A.value, t, r, "x")) : o.x = V(`${A.value.value}${A.value.unit}`, n, t, i2, true) ?? t / 2, e.type === "keyword" ? Object.assign(o, ng(e.value, t, r, "y")) : o.y = V(`${e.value.value}${e.value.unit}`, n, r, i2, true) ?? r / 2, o;
}
function ng(A, e, t, r) {
  switch (A) {
    case "center":
      return { [r]: r === "x" ? e / 2 : t / 2 };
    case "left":
      return { x: 0 };
    case "top":
      return { y: 0 };
    case "right":
      return { x: e };
    case "bottom":
      return { y: t };
  }
}
function nf(A, e, t, [r, n], i2, o, s) {
  let { r: a, rx: g2, ratio: u2 = 1 } = s;
  if (!o) return { spreadMethod: "pad" };
  let I = t.at(-1), B = A === "circle" ? a * 2 : g2 * 2;
  return { spreadMethod: "repeat", cx: "50%", cy: "50%", r: I.offset.unit === "%" ? `${Number(I.offset.value) * Math.min(n / r, 1) / u2}%` : Number(V(`${I.offset.value}${I.offset.unit}`, e, r, i2, true) / B) };
}
function of(A, e, t, r, n, i2, o) {
  let [s, a] = n, { x: g2, y: u2 } = r, I = {}, B = 0, f = 0;
  if (sf(e)) {
    if (e.some((E) => E.value.value.startsWith("-"))) throw new Error("disallow setting negative values to the size of the shape. Check https://w3c.github.io/csswg-drafts/css-images/#valdef-rg-size-length-0");
    return A === "circle" ? Object.assign(I, { r: Number(V(`${e[0].value.value}${e[0].value.unit}`, t, s, i2, true)) }) : Object.assign(I, { rx: Number(V(`${e[0].value.value}${e[0].value.unit}`, t, s, i2, true)), ry: Number(V(`${e[1].value.value}${e[1].value.unit}`, t, a, i2, true)) }), mn(I, s, a, g2, u2, o, A), I;
  }
  switch (e[0].value) {
    case "farthest-corner":
      B = Math.max(Math.abs(s - g2), Math.abs(g2)), f = Math.max(Math.abs(a - u2), Math.abs(u2));
      break;
    case "closest-corner":
      B = Math.min(Math.abs(s - g2), Math.abs(g2)), f = Math.min(Math.abs(a - u2), Math.abs(u2));
      break;
    case "farthest-side":
      return A === "circle" ? I.r = Math.max(Math.abs(s - g2), Math.abs(g2), Math.abs(a - u2), Math.abs(u2)) : (I.rx = Math.max(Math.abs(s - g2), Math.abs(g2)), I.ry = Math.max(Math.abs(a - u2), Math.abs(u2))), mn(I, s, a, g2, u2, o, A), I;
    case "closest-side":
      return A === "circle" ? I.r = Math.min(Math.abs(s - g2), Math.abs(g2), Math.abs(a - u2), Math.abs(u2)) : (I.rx = Math.min(Math.abs(s - g2), Math.abs(g2)), I.ry = Math.min(Math.abs(a - u2), Math.abs(u2))), mn(I, s, a, g2, u2, o, A), I;
  }
  return A === "circle" ? I.r = Math.sqrt(B * B + f * f) : Object.assign(I, og(B, f)), mn(I, s, a, g2, u2, o, A), I;
}
function mn(A, e, t, r, n, i2, o) {
  if (i2) if (o === "ellipse") {
    let s = Math.max(Math.abs(e - r), Math.abs(r)), a = Math.max(Math.abs(t - n), Math.abs(n)), { rx: g2, ry: u2 } = og(s, a);
    A.ratio = Math.max(g2 / A.rx, u2 / A.ry), A.ratio > 1 && (A.rx *= A.ratio, A.ry *= A.ratio);
  } else {
    let s = Math.max(Math.abs(e - r), Math.abs(r)), a = Math.max(Math.abs(t - n), Math.abs(n)), g2 = Math.sqrt(s * s + a * a);
    A.ratio = g2 / A.r, A.ratio > 1 && (A.r = g2);
  }
}
function og(A, e) {
  let t = e !== 0 ? A / e : 1;
  if (A === 0) return { rx: 0, ry: 0 };
  {
    let r = Math.sqrt(A * A + e * e * t * t) / t;
    return { ry: r, rx: r * t };
  }
}
function sf(A) {
  return !A.some((e) => e.type === "keyword");
}
function Ri(A, e) {
  return typeof A == "string" && A.endsWith("%") ? e * parseFloat(A) / 100 : +A;
}
function af(A, e, t, r, n) {
  if (!r || !n) return [e, t];
  if (A === "cover") {
    let i2 = e / r, o = t / n, s = Math.max(i2, o);
    return [r * s, n * s];
  }
  if (A === "contain") {
    let i2 = e / r, o = t / n, s = Math.min(i2, o);
    return [r * s, n * s];
  }
  if (A === "auto" || A.includes("auto")) {
    let i2 = A.split(" "), o = i2[0] || "auto", s = i2[1] || i2[0] || "auto", a = r, g2 = n;
    if (o === "auto" && s !== "auto") {
      let u2 = Ri(s, t);
      g2 = u2, a = r / n * u2;
    } else if (s === "auto" && o !== "auto") {
      let u2 = Ri(o, e);
      a = u2, g2 = n / r * u2;
    }
    return [a, g2];
  }
  return [e, t];
}
function vi(A, { x: e, y: t, defaultX: r, defaultY: n }) {
  return (A ? A.split(" ").map((i2) => {
    try {
      let o = new se(i2);
      return o.type === "length" || o.type === "number" ? o.value : o.value + o.unit;
    } catch {
      return null;
    }
  }).filter((i2) => i2 !== null) : [r, n]).map((i2, o) => Ri(i2, [e, t][o]));
}
async function ir({ id: A, width: e, height: t, left: r, top: n }, { image: i2, size: o, position: s, repeat: a }, g2, u2) {
  a = a || "repeat", u2 = u2 || "background";
  let I = a === "repeat-x" || a === "repeat", B = a === "repeat-y" || a === "repeat", f = o && (o === "cover" || o === "contain" || o === "auto" || o.includes("auto")), E = i2.startsWith("linear-gradient(") || i2.startsWith("repeating-linear-gradient(") || i2.startsWith("radial-gradient(") || i2.startsWith("repeating-radial-gradient("), C = f && E ? [e, t] : f ? [0, 0] : vi(o, { x: e, y: t, defaultX: e, defaultY: t }), p = vi(s, { x: e, y: t, defaultX: 0, defaultY: 0 });
  if (i2.startsWith("linear-gradient(") || i2.startsWith("repeating-linear-gradient(")) return rg({ id: A, width: e, height: t, repeatX: I, repeatY: B }, i2, C, p, g2, u2);
  if (i2.startsWith("radial-gradient(") || i2.startsWith("repeating-radial-gradient(")) return ig({ id: A, width: e, height: t, repeatX: I, repeatY: B }, i2, C, p, g2, u2);
  if (i2.startsWith("url(")) {
    let [m2, x3, w2] = await Mt(i2.slice(4, -1)), b, D;
    if (f) {
      let [h2, v2] = af(o, e, t, x3, w2);
      b = h2, D = v2;
    } else {
      let h2 = vi(o, { x: e, y: t, defaultX: 0, defaultY: 0 });
      b = u2 === "mask" ? x3 || h2[0] : h2[0] || x3, D = u2 === "mask" ? w2 || h2[1] : h2[1] || w2;
    }
    return [`satori_bi${A}`, R2("pattern", { id: `satori_bi${A}`, patternContentUnits: "userSpaceOnUse", patternUnits: "userSpaceOnUse", x: p[0] + r, y: p[1] + n, width: I ? b : "100%", height: B ? D : "100%" }, R2("image", { x: 0, y: 0, width: b, height: D, preserveAspectRatio: "none", href: m2 }))];
  }
  if ((0, import_parse_css_color5.default)(i2)) {
    let m2 = (0, import_parse_css_color5.default)(i2), [x3, w2, b, D] = m2.values, v2 = `rgba(${x3},${w2},${b},${D !== void 0 ? D : 1})`;
    return [`satori_bi${A}`, R2("pattern", { id: `satori_bi${A}`, patternContentUnits: "userSpaceOnUse", patternUnits: "userSpaceOnUse", x: r, y: n, width: e, height: t }, R2("rect", { x: 0, y: 0, width: e, height: t, fill: v2 }))];
  }
  throw new Error(`Invalid background image: "${i2}"`);
}
function gf([A, e]) {
  return Math.round(A * 1e3) === 0 && Math.round(e * 1e3) === 0 ? 0 : Math.round(A * e / Math.sqrt(A * A + e * e) * 1e3) / 1e3;
}
function yn(A, e, t) {
  return t < A + e && (t / 2 < A && t / 2 < e ? A = e = t / 2 : t / 2 < A ? A = t - e : t / 2 < e && (e = t - A)), [A, e];
}
function wn(A) {
  A[0] = A[1] = Math.min(A[0], A[1]);
}
function Dn(A, e, t, r, n) {
  if (typeof A == "string") {
    let i2 = A.split(" ").map((s) => s.trim()), o = !i2[1] && !i2[0].endsWith("%");
    return i2[1] = i2[1] || i2[0], [o, [Math.min(V(i2[0], r, e, n, true), e), Math.min(V(i2[1], r, t, n, true), t)]];
  }
  return typeof A == "number" ? [true, [Math.min(A, e), Math.min(A, t)]] : [true, void 0];
}
var bn = (A) => A && A[0] !== 0 && A[1] !== 0;
function Sn(A) {
  return typeof A != "string" ? 1 : Ci(A);
}
function xn(A, e, t, r, n) {
  if (n === 1 / 0) return [A, t, e];
  if (n === -1 / 0) return [A, r, e];
  if (n === 0) return [A, [(A[0] + e[0]) / 2, (A[1] + e[1]) / 2], e];
  let i2 = n < 0 ? t : r, o = Math.pow(2, 1 - Math.abs(n));
  if (o === 0) return n > 0 ? [A, t, e] : [A, r, e];
  let s = [], a = 16;
  for (let g2 = 0; g2 <= a; g2++) {
    let u2 = Math.PI * g2 / a / 2, I = Math.pow(Math.sin(u2), o), B = Math.pow(Math.cos(u2), o);
    s.push([i2[0] + (e[0] - i2[0]) * I + (A[0] - i2[0]) * B, i2[1] + (e[1] - i2[1]) * I + (A[1] - i2[1]) * B]);
  }
  return s;
}
function Qt(A) {
  return `${Math.round(A[0] * 1e3) / 1e3},${Math.round(A[1] * 1e3) / 1e3}`;
}
function ag(A, e, t, r) {
  return Math.min(1, t / (A[0] + e[0] || t), r / (A[1] + e[1] || r));
}
function uf(A, e, t, r, n, i2, o) {
  o != null && o.every(Boolean) && (o = void 0);
  let s = A + t, a = e + r, [g2, u2, I, B] = n, f = [xn([A, e + g2[1]], [A + g2[0], e], [A, e], [A + g2[0], e + g2[1]], i2[0]), xn([s - u2[0], e], [s, e + u2[1]], [s, e], [s - u2[0], e + u2[1]], i2[1]), xn([s, a - I[1]], [s - I[0], a], [s, a], [s - I[0], a - I[1]], i2[2]), xn([A + B[0], a], [A, a - B[1]], [A, a], [A + B[0], a - B[1]], i2[3])];
  if (o) {
    let C = o.indexOf(true);
    if (C === -1) throw new Error("Invalid `partialSides`.");
    for (; o[(C + 3) % 4]; ) C = (C + 3) % 4;
    let p = f[C], m2 = Math.floor(p.length / 2), x3 = `M${Qt(p[m2])}`, w2 = C;
    do {
      let b = f[w2], D = Math.floor(b.length / 2);
      for (let F = D + 1; F < b.length; F++) x3 += ` L${Qt(b[F])}`;
      let h2 = f[(w2 + 1) % 4];
      x3 += ` L${Qt(h2[0])}`;
      let v2 = Math.floor(h2.length / 2);
      for (let F = 1; F <= v2; F++) x3 += ` L${Qt(h2[F])}`;
      w2 = (w2 + 1) % 4;
    } while (o[w2] && w2 !== C);
    return x3;
  }
  let E = `M${Qt(f[0][f[0].length - 1])}`;
  for (let C = 0; C < 4; C++) {
    let p = f[(C + 1) % 4];
    E += ` L${Qt(p[0])}`;
    for (let m2 = 1; m2 < p.length; m2++) E += ` L${Qt(p[m2])}`;
  }
  return E + " Z";
}
function gg({ id: A, borderRadiusPath: e, borderType: t, left: r, top: n, width: i2, height: o }, s) {
  let a = `satori_brc-${A}`;
  return [R2("clipPath", { id: a }, R2(t, { x: r, y: n, width: i2, height: o, d: e || void 0 })), a];
}
function At({ left: A, top: e, width: t, height: r }, n, i2) {
  let { borderTopLeftRadius: o, borderTopRightRadius: s, borderBottomLeftRadius: a, borderBottomRightRadius: g2, fontSize: u2 } = n, I = [Sn(n.cornerTopLeftShape), Sn(n.cornerTopRightShape), Sn(n.cornerBottomRightShape), Sn(n.cornerBottomLeftShape)], B, f, E, C;
  if ([B, o] = Dn(o, t, r, u2, n), [f, s] = Dn(s, t, r, u2, n), [E, a] = Dn(a, t, r, u2, n), [C, g2] = Dn(g2, t, r, u2, n), !i2 && !bn(o) && !bn(s) && !bn(a) && !bn(g2)) return "";
  if (o ||= [0, 0], s ||= [0, 0], a ||= [0, 0], g2 ||= [0, 0], [o[0], s[0]] = yn(o[0], s[0], t), [a[0], g2[0]] = yn(a[0], g2[0], t), [o[1], a[1]] = yn(o[1], a[1], r), [s[1], g2[1]] = yn(s[1], g2[1], r), B && wn(o), f && wn(s), E && wn(a), C && wn(g2), I.some((D) => D < 0)) {
    let D = Math.min(ag(o, g2, t, r), ag(s, a, t, r));
    if (D < 1) for (let h2 of [o, s, g2, a]) h2[0] *= D, h2[1] *= D;
  }
  if (I.some((D) => D !== 1)) return uf(A, e, t, r, [o, s, g2, a], I, i2);
  let p = [];
  p[0] = [s, s], p[1] = [g2, [-g2[0], g2[1]]], p[2] = [a, [-a[0], -a[1]]], p[3] = [o, [o[0], -o[1]]];
  let m2 = `h${t - o[0] - s[0]} a${p[0][0]} 0 0 1 ${p[0][1]}`, x3 = `v${r - s[1] - g2[1]} a${p[1][0]} 0 0 1 ${p[1][1]}`, w2 = `h${g2[0] + a[0] - t} a${p[2][0]} 0 0 1 ${p[2][1]}`, b = `v${a[1] + o[1] - r} a${p[3][0]} 0 0 1 ${p[3][1]}`;
  if (i2) {
    let h2 = function(iA) {
      let lA = gf([o, s, g2, a][iA]);
      return iA === 0 ? [[A + o[0] - lA, e + o[1] - lA], [A + o[0], e]] : iA === 1 ? [[A + t - s[0] + lA, e + s[1] - lA], [A + t, e + s[1]]] : iA === 2 ? [[A + t - g2[0] + lA, e + r - g2[1] + lA], [A + t - g2[0], e + r]] : [[A + a[0] - lA, e + r - a[1] + lA], [A, e + r - a[1]]];
    }, D = i2.indexOf(false);
    if (!i2.includes(true)) throw new Error("Invalid `partialSides`.");
    if (D === -1) D = 0;
    else for (; !i2[D]; ) D = (D + 1) % 4;
    let v2 = "", F = h2(D), K2 = `M${F[0]} A${p[(D + 3) % 4][0]} 0 0 1 ${F[1]}`, _ = 0;
    for (; _ < 4 && i2[(D + _) % 4]; _++) v2 += K2 + " ", K2 = [m2, x3, w2, b][(D + _) % 4];
    let AA = (D + _) % 4;
    v2 += K2.split(" ")[0];
    let EA = h2(AA);
    return v2 += ` A${p[(AA + 3) % 4][0]} 0 0 1 ${EA[0]}`, v2;
  }
  return `M${A + o[0]},${e} ${m2} ${x3} ${w2} ${b}`;
}
function ug(A, e, t) {
  return t[A + "Width"] === t[e + "Width"] && t[A + "Style"] === t[e + "Style"] && t[A + "Color"] === t[e + "Color"];
}
function Ig({ id: A, currentClipPathId: e, borderPath: t, borderType: r, left: n, top: i2, width: o, height: s }, a) {
  if (!(a.borderTopWidth || a.borderRightWidth || a.borderBottomWidth || a.borderLeftWidth)) return null;
  let u2 = `satori_bc-${A}`;
  return [R2("clipPath", { id: u2, "clip-path": e ? `url(#${e})` : void 0 }, R2(r, { x: n, y: i2, width: o, height: s, d: t || void 0 })), u2];
}
function or({ left: A, top: e, width: t, height: r, props: n, asContentMask: i2, maskBorderOnly: o }, s) {
  let a = ["borderTop", "borderRight", "borderBottom", "borderLeft"];
  if (!i2 && !a.some((f) => s[f + "Width"])) return "";
  let g2 = "", u2 = 0;
  for (; u2 > 0 && ug(a[u2], a[(u2 + 3) % 4], s); ) u2 = (u2 + 3) % 4;
  let I = [false, false, false, false], B = [];
  for (let f = 0; f < 4; f++) {
    let E = (u2 + f) % 4, C = (u2 + f + 1) % 4, p = a[E], m2 = a[C];
    if (I[E] = true, B = [s[p + "Width"], s[p + "Style"], s[p + "Color"], p], !ug(p, m2, s)) {
      let x3 = (B[0] || 0) + (i2 && !o && s[p.replace("border", "padding")] || 0);
      x3 && (g2 += R2("path", { width: t, height: r, ...n, fill: "none", stroke: i2 ? "#000" : B[2], "stroke-width": x3 * 2, "stroke-dasharray": !i2 && B[1] === "dashed" ? x3 * 2 + " " + x3 : void 0, d: At({ left: A, top: e, width: t, height: r }, s, I) })), I = [false, false, false, false];
    }
  }
  if (I.some(Boolean)) {
    let f = (B[0] || 0) + (i2 && !o && s[B[3].replace("border", "padding")] || 0);
    f && (g2 += R2("path", { width: t, height: r, ...n, fill: "none", stroke: i2 ? "#000" : B[2], "stroke-width": f * 2, "stroke-dasharray": !i2 && B[1] === "dashed" ? f * 2 + " " + f : void 0, d: At({ left: A, top: e, width: t, height: r }, s, I) }));
  }
  return g2;
}
function Fi({ id: A, left: e, top: t, width: r, height: n, matrix: i2, borderOnly: o }, s) {
  let a = (s.borderLeftWidth || 0) + (o ? 0 : s.paddingLeft || 0), g2 = (s.borderTopWidth || 0) + (o ? 0 : s.paddingTop || 0), u2 = (s.borderRightWidth || 0) + (o ? 0 : s.paddingRight || 0), I = (s.borderBottomWidth || 0) + (o ? 0 : s.paddingBottom || 0), B = { x: e + a, y: t + g2, width: r - a - u2, height: n - g2 - I };
  return R2("mask", { id: A }, R2("rect", { ...B, fill: "#fff", transform: s.overflow === "hidden" && s.transform && i2 ? i2 : void 0, mask: s._inheritedMaskId ? `url(#${s._inheritedMaskId})` : void 0 }) + or({ left: e, top: t, width: r, height: n, props: { transform: i2 || void 0 }, asContentMask: true, maskBorderOnly: o }, s));
}
var Li = { left: 0, "x-start": 0, center: 0.5, right: 1, "x-end": 1 };
var Gi = { top: 0, "y-start": 0, center: 0.5, bottom: 1, "y-end": 1 };
function Ne(A) {
  return Math.round(A * 1e3) / 1e3;
}
function cg(A, e, t, r) {
  let n = A.match(/^shape\((.*)\)$/s);
  if (!n) return null;
  let i2 = _e(n[1]), o = i2.shift();
  if (!o) throw new Error("Invalid `shape()` value.");
  let s = o.match(/^(?:(nonzero|evenodd)\s+)?from\s+(.+)$/);
  if (!s) throw new Error("Invalid `shape()` starting point.");
  let a = s[1] || "nonzero", g2 = Ui(lg(s[2]), e, t, r), u2 = g2, I = `M${Ne(g2[0])},${Ne(g2[1])}`;
  for (let B of i2) {
    let f = lg(B), E = f.shift();
    if (E === "close") {
      if (f.length) throw new Error("Invalid `close` command in `shape()`.");
      I += " Z", g2 = u2;
      continue;
    }
    if (E === "move" || E === "line") {
      let C = Ni(f, g2, e, t, r);
      I += ` ${E === "move" ? "M" : "L"}${Ne(C[0])},${Ne(C[1])}`, g2 = C, E === "move" && (u2 = C);
      continue;
    }
    if (E === "hline" || E === "vline") {
      let C = E === "hline" ? 0 : 1, p = f.shift(), m2 = f.shift();
      if (p !== "to" && p !== "by" || !m2 || f.length) throw new Error(`Invalid \`${E}\` command in \`shape()\`.`);
      let x3 = C === 0 ? e : t, w2 = C === 0 ? Li : Gi, b = p === "to" && m2 in w2 ? w2[m2] * x3 : et2(m2, x3, r);
      g2 = [...g2], g2[C] = p === "by" ? g2[C] + b : b, I += ` ${C === 0 ? "H" : "V"}${Ne(g2[C])}`;
      continue;
    }
    if (E === "curve" || E === "smooth") {
      let C = f.indexOf("with"), p = C === -1 ? f : f.slice(0, C), m2 = C === -1 ? [] : f.slice(C + 1), x3 = p[0], w2 = Ni(p, g2, e, t, r);
      if (E === "curve" && C === -1) throw new Error("A `curve` command requires a control point.");
      let b = If(m2).map((D) => lf(D, g2, w2, e, t, r));
      if (E === "curve") if (b.length === 1) I += ` Q${Ye(b[0])} ${Ye(w2)}`;
      else if (b.length === 2) I += ` C${Ye(b[0])} ${Ye(b[1])} ${Ye(w2)}`;
      else throw new Error("A `curve` command accepts one or two control points.");
      else if (!b.length) I += ` T${Ye(w2)}`;
      else if (b.length === 1) I += ` S${Ye(b[0])} ${Ye(w2)}`;
      else throw new Error("A `smooth` command accepts at most one control point.");
      g2 = w2;
      continue;
    }
    if (E === "arc") {
      let C = f.findIndex((F) => ["of", "cw", "ccw", "large", "small", "rotate"].includes(F)), p = C === -1 ? f : f.slice(0, C), m2 = C === -1 ? [] : f.slice(C), x3 = Ni(p, g2, e, t, r), w2 = 0, b = 0, D = 0, h2 = 0, v2 = 0;
      for (let F = 0; F < m2.length; F++) {
        let K2 = m2[F];
        if (K2 === "of") {
          let _ = m2[++F];
          if (!_) throw new Error("Invalid `arc` radius in `shape()`.");
          let AA = m2[F + 1], EA = AA && !["cw", "ccw", "large", "small", "rotate"].includes(AA);
          if (EA && F++, EA) w2 = et2(_, e, r), b = et2(AA, t, r);
          else {
            let iA = Math.sqrt(e * e + t * t) / Math.sqrt(2);
            w2 = b = et2(_, iA, r);
          }
        } else if (K2 === "cw" || K2 === "ccw") v2 = K2 === "cw" ? 1 : 0;
        else if (K2 === "large" || K2 === "small") h2 = K2 === "large" ? 1 : 0;
        else if (K2 === "rotate") {
          let _ = m2[++F];
          if (!_) throw new Error("Invalid `arc` rotation in `shape()`.");
          let AA = Te(_);
          if (typeof AA > "u") throw new Error("Invalid `arc` rotation in `shape()`.");
          D = AA;
        } else throw new Error("Invalid `arc` option in `shape()`.");
      }
      I += ` A${Ne(Math.abs(w2))},${Ne(Math.abs(b))} ${Ne(D)} ${h2} ${v2} ${Ye(x3)}`, g2 = x3;
      continue;
    }
    throw new Error(`Unsupported \`${E}\` command in \`shape()\`.`);
  }
  return { type: "path", d: I, "fill-rule": a };
}
function lg(A) {
  return A.trim().replace(/\//g, " / ").split(/\s+/).filter(Boolean);
}
function If(A) {
  if (!A.length) return [];
  let e = A.indexOf("/");
  return e === -1 ? [A] : [A.slice(0, e), A.slice(e + 1)];
}
function Ni(A, e, t, r, n) {
  let i2 = A[0];
  if (i2 !== "to" && i2 !== "by") throw new Error("A `shape()` command must use `to` or `by`.");
  let o = Ui(A.slice(1), t, r, n);
  return i2 === "by" ? [e[0] + o[0], e[1] + o[1]] : o;
}
function lf(A, e, t, r, n, i2) {
  let o = A.indexOf("from"), s = o === -1 ? A : A.slice(0, o), a = o === -1 ? void 0 : A[o + 1];
  if (o !== -1 && (o + 2 !== A.length || !a)) throw new Error("Invalid control point reference in `shape()`.");
  let g2 = Ui(s, r, n, i2, true);
  return a === "start" || !a && !cf(A) ? [e[0] + g2[0], e[1] + g2[1]] : a === "end" ? [t[0] + g2[0], t[1] + g2[1]] : g2;
}
function Ui(A, e, t, r, n = false) {
  if (!A.length || A.length > 4) throw new Error("Invalid position in `shape()`.");
  let i2, o, s = [...A];
  for (let a = 0; a < s.length; a++) {
    let g2 = s[a];
    if (g2 === "left" || g2 === "right" || g2 === "x-start" || g2 === "x-end") {
      let u2 = s[a + 1];
      if (u2 && !Mi(u2)) {
        let I = et2(u2, e, r);
        i2 = g2 === "left" || g2 === "x-start" ? I : e - I, a++;
      } else i2 = Li[g2] * e;
    } else if (g2 === "top" || g2 === "bottom" || g2 === "y-start" || g2 === "y-end") {
      let u2 = s[a + 1];
      if (u2 && !Mi(u2)) {
        let I = et2(u2, t, r);
        o = g2 === "top" || g2 === "y-start" ? I : t - I, a++;
      } else o = Gi[g2] * t;
    } else if (g2 === "center") if (i2 === void 0) i2 = e / 2;
    else if (o === void 0) o = t / 2;
    else throw new Error("Invalid position in `shape()`.");
    else if (i2 === void 0) i2 = et2(g2, e, r);
    else if (o === void 0) o = et2(g2, t, r);
    else throw new Error("Invalid position in `shape()`.");
  }
  return !n && A.length === 1 && o === void 0 && (o = t / 2), [i2 ?? (n ? 0 : e / 2), o ?? (n ? 0 : t / 2)];
}
function Mi(A) {
  return A in Li || A in Gi;
}
function cf(A) {
  return A.some(Mi);
}
function et2(A, e, t) {
  let r = V(A, t.fontSize, e, t, true);
  if (typeof r > "u") throw new Error(`Invalid length \`${A}\` in \`shape()\`.`);
  return r;
}
function Ye(A) {
  return `${Ne(A[0])},${Ne(A[1])}`;
}
var Ot = { circle: /circle\((.+)\)/, ellipse: /ellipse\((.+)\)/, path: /path\((.+)\)/, polygon: /polygon\((.+)\)/, inset: /inset\((.+)\)/, shape: /shape\((.+)\)/ };
function Qg({ width: A, height: e }, t, r) {
  function n(u2) {
    let I = u2.match(Ot.circle);
    if (!I) return null;
    let [, B] = I, [f, E = ""] = B.split("at").map((m2) => m2.trim()), { x: C, y: p } = Eg(E, A, e);
    return { type: "circle", r: V(f, r.fontSize, Math.sqrt(Math.pow(A, 2) + Math.pow(e, 2)) / Math.sqrt(2), r, true), cx: V(C, r.fontSize, A, r, true), cy: V(p, r.fontSize, e, r, true) };
  }
  function i2(u2) {
    let I = u2.match(Ot.ellipse);
    if (!I) return null;
    let [, B] = I, [f, E = ""] = B.split("at").map((w2) => w2.trim()), [C, p] = f.split(" "), { x: m2, y: x3 } = Eg(E, A, e);
    return { type: "ellipse", rx: V(C || "50%", r.fontSize, A, r, true), ry: V(p || "50%", r.fontSize, e, r, true), cx: V(m2, r.fontSize, A, r, true), cy: V(x3, r.fontSize, e, r, true) };
  }
  function o(u2) {
    let I = u2.match(Ot.path);
    if (!I) return null;
    let [B, f] = Bg(I[1]);
    return { type: "path", d: f, "fill-rule": B };
  }
  function s(u2) {
    let I = u2.match(Ot.polygon);
    if (!I) return null;
    let [B, f] = Bg(I[1]);
    return { type: "polygon", "fill-rule": B, points: f.split(",").map((E) => E.split(" ").map((C, p) => V(C, r.fontSize, p === 0 ? A : e, r, true)).join(" ")).join(",") };
  }
  function a(u2) {
    let I = u2.match(Ot.inset);
    if (!I) return null;
    let [B, f] = (I[1].includes("round") ? I[1] : `${I[1].trim()} round 0`).split("round"), E = (0, import_css_to_react_native3.getStylesForProperty)("borderRadius", f, true), C = Object.values(E).map((D) => String(D)).map((D, h2) => V(D, r.fontSize, h2 === 0 || h2 === 2 ? e : A, r, true) || 0), p = Object.values((0, import_css_to_react_native3.getStylesForProperty)("margin", B, true)).map((D) => String(D)).map((D, h2) => V(D, r.fontSize, h2 === 0 || h2 === 2 ? e : A, r, true) || 0), m2 = p[3], x3 = p[0], w2 = A - (p[1] + p[3]), b = e - (p[0] + p[2]);
    return C.some((D) => D > 0) ? { type: "path", d: At({ left: m2, top: x3, width: w2, height: b }, { ...t, ...E }) } : { type: "rect", x: m2, y: x3, width: w2, height: b };
  }
  function g2(u2) {
    return Ot.shape.test(u2) ? cg(u2, A, e, r) : null;
  }
  return { parseCircle: n, parseEllipse: i2, parsePath: o, parsePolygon: s, parseInset: a, parseShape: g2 };
}
function Bg(A) {
  let [, e = "nonzero", t] = A.replace(/('|")/g, "").match(/^(nonzero|evenodd)?,?(.+)/) || [];
  return [e, t];
}
function Eg(A, e, t) {
  let r = A.split(" "), n = { x: r[0] || "50%", y: r[1] || "50%" };
  return r.forEach((i2) => {
    i2 === "top" ? n.y = 0 : i2 === "bottom" ? n.y = t : i2 === "left" ? n.x = 0 : i2 === "right" ? n.x = e : i2 === "center" && (n.x = e / 2, n.y = t / 2);
  }), n;
}
function kn(A) {
  return `satori_cp-${A}`;
}
function Cg(A) {
  return `url(#${kn(A)})`;
}
function dg(A, e, t) {
  if (e.clipPath === "none") return "";
  let r = Qg(A, e, t), n = e.clipPath, i2 = { type: "" };
  for (let o of Object.keys(r)) if (i2 = r[o](n), i2) break;
  if (i2) {
    let { type: o, ...s } = i2;
    return R2("clipPath", { id: kn(A.id), "clip-path": A.currentClipPath, transform: `translate(${A.left}, ${A.top})` }, R2(o, s));
  }
  return "";
}
function Hi({ left: A, top: e, width: t, height: r, path: n, matrix: i2, id: o, currentClipPath: s, src: a }, g2, u2) {
  let I = "", B = g2.clipPath && g2.clipPath !== "none" ? dg({ left: A, top: e, width: t, height: r, path: n, id: o, matrix: i2, currentClipPath: s, src: a }, g2, u2) : "";
  if (g2.overflow !== "hidden" && !a) I = "";
  else {
    let E = B ? `satori_ocp-${o}` : kn(o);
    I = R2("clipPath", { id: E, "clip-path": s }, R2(n ? "path" : "rect", { x: A, y: e, width: t, height: r, d: n || void 0, transform: g2.overflow === "hidden" && g2.transform && i2 ? i2 : void 0 }));
  }
  let f = Fi({ id: `satori_om-${o}`, left: A, top: e, width: t, height: r, matrix: i2, borderOnly: !a }, g2);
  return B + I + f;
}
var ff = (A) => `satori_mi-${A}`;
async function Oi(A, e, t) {
  if (!e.maskImage) return ["", ""];
  let { left: r, top: n, width: i2, height: o, id: s } = A, a = e.maskImage, g2 = a.length;
  if (!g2) return ["", ""];
  let u2 = ff(s), I = "";
  for (let B = 0; B < g2; B++) {
    let f = a[B], [E, C] = await ir({ id: `${u2}-${B}`, left: r, top: n, width: i2, height: o }, f, t, "mask");
    I += C + R2("rect", { x: r, y: n, width: i2, height: o, fill: `url(#${E})` });
  }
  return I = R2("mask", { id: u2 }, I), [u2, I];
}
function pg({ id: A, left: e, top: t, width: r, height: n, path: i2, type: o, matrix: s, currentClipPath: a, mask: g2, filters: u2 }) {
  if (!u2.length) return ["", ""];
  let I = `satori_bf-${A}`, B = `satori_bfc-${A}`, f = Ef(u2), E = "BackgroundImage", C = "";
  u2.forEach((x3, w2) => {
    let b = `${I}-${w2}`;
    C += Bf(x3, E, b), E = b;
  });
  let p = R2("filter", { id: I, x: e - f.left, y: t - f.top, width: r + f.left + f.right, height: n + f.top + f.bottom, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" }, C) + R2("clipPath", { id: B, "clip-path": a }, R2(o, { x: e, y: t, width: r, height: n, d: i2 || void 0, transform: s || void 0 })), m2 = R2(o, { x: e, y: t, width: r, height: n, d: i2 || void 0, fill: "#000", transform: s || void 0, filter: `url(#${I})`, "clip-path": `url(#${B})`, mask: g2 });
  return [p, m2];
}
function Bf(A, e, t) {
  if (A.type === "blur") return R2("feGaussianBlur", { in: e, stdDeviation: A.value, result: t });
  if (A.type === "hue-rotate") return R2("feColorMatrix", { in: e, type: "hueRotate", values: A.value, result: t });
  if (A.type === "saturate" || A.type === "grayscale") return R2("feColorMatrix", { in: e, type: "saturate", values: A.type === "grayscale" ? 1 - A.value : A.value, result: t });
  if (A.type === "sepia") {
    let o = A.value, s = 1 - o;
    return R2("feColorMatrix", { in: e, type: "matrix", values: [s + 0.393 * o, 0.769 * o, 0.189 * o, 0, 0, 0.349 * o, s + 0.686 * o, 0.168 * o, 0, 0, 0.272 * o, 0.534 * o, s + 0.131 * o, 0, 0, 0, 0, 0, 1, 0].join(" "), result: t });
  }
  if (A.type === "drop-shadow") {
    let o = `${t}-input`;
    return R2("feComposite", { in: e, in2: "SourceAlpha", operator: "in", result: o }) + R2("feDropShadow", { in: o, dx: A.offsetX, dy: A.offsetY, stdDeviation: A.blurRadius, "flood-color": A.color, result: t });
  }
  let r = A.value, n = A.type === "brightness" ? { slope: r } : A.type === "contrast" ? { slope: r, intercept: 0.5 - 0.5 * r } : A.type === "invert" ? { slope: 1 - 2 * r, intercept: r } : { slope: r }, i2 = A.type === "opacity" ? ["A"] : ["R", "G", "B"];
  return R2("feComponentTransfer", { in: e, result: t }, i2.map((o) => R2(`feFunc${o}`, { type: "linear", ...n })).join(""));
}
function Ef(A) {
  let e = 0, t = 0, r = 0, n = 0;
  for (let i2 of A) if (i2.type === "blur") {
    let o = i2.value * 3;
    e = Math.max(e, o), t = Math.max(t, o), r = Math.max(r, o), n = Math.max(n, o);
  } else if (i2.type === "drop-shadow") {
    let o = i2.blurRadius * 3;
    e = Math.max(e, o - i2.offsetX), t = Math.max(t, o - i2.offsetY), r = Math.max(r, o + i2.offsetX), n = Math.max(n, o + i2.offsetY);
  }
  return { left: e, top: t, right: r, bottom: n };
}
function Qf(A, e, t) {
  let r = A.toLowerCase().trim().split(/\s+/), n = (a, g2) => ({ left: "0%", center: "50%", right: "100%", top: "0%", bottom: "100%" })[a] || a, i2, o;
  if (r.length === 1) {
    let a = r[0];
    a === "left" || a === "center" || a === "right" ? (i2 = n(a, "x"), o = "50%") : a === "top" || a === "bottom" ? (i2 = "50%", o = n(a, "y")) : (i2 = a, o = "50%");
  } else {
    let a = r[0], g2 = r[1];
    a === "top" || a === "bottom" ? (o = n(a, "y"), g2 === "left" || g2 === "right" || g2 === "center" ? i2 = n(g2, "x") : (i2 = "50%", o = a === "top" || a === "bottom" ? n(a, "y") : g2)) : (i2 = n(a, "x"), o = n(g2, "y"));
  }
  let s = (a, g2) => {
    try {
      if (a.endsWith("%")) return g2 * parseFloat(a) / 100;
      let u2 = new se(a);
      return u2.type === "length" || u2.type === "number" ? u2.value : 0;
    } catch {
      return 0;
    }
  };
  return [s(i2, e), s(o, t)];
}
async function sr({ id: A, left: e, top: t, width: r, height: n, isInheritingTransform: i2, src: o, debug: s }, a, g2) {
  if (a.display === "none") return "";
  let u2 = !!o, I = "rect", B = "", f = "", E = [], C = 1, p = "";
  a.backgroundColor && E.push(a.backgroundColor), a.opacity !== void 0 && (C = +a.opacity), a.transform && (B = nr({ left: e, top: t, width: r, height: n }, a.transform, i2, a.transformOrigin));
  let m2 = "";
  if (a.backgroundImage) {
    let Z = [];
    for (let eA = 0; eA < a.backgroundImage.length; eA++) {
      let YA = a.backgroundImage[eA], FA = await ir({ id: A + "_" + eA, width: r, height: n, left: e, top: t }, YA, g2);
      FA && Z.unshift(FA);
    }
    for (let eA of Z) E.push(`url(#${eA[0]})`), f += eA[1], eA[2] && (m2 += eA[2]);
  }
  let [x3, w2] = await Oi({ id: A, left: e, top: t, width: r, height: n }, a, g2);
  f += w2;
  let b = x3 ? `url(#${x3})` : a._inheritedMaskId ? `url(#${a._inheritedMaskId})` : void 0, D = At({ left: e, top: t, width: r, height: n }, a);
  D && (I = "path");
  let h2 = a._inheritedClipPathId;
  s && (p = R2("rect", { x: e, y: t, width: r, height: n, fill: "transparent", stroke: "#ff5757", "stroke-width": 1, transform: B || void 0, "clip-path": h2 ? `url(#${h2})` : void 0 }));
  let { backgroundClip: v2, filter: F } = a, K2 = v2 === "text" ? `url(#satori_bct-${A})` : h2 ? `url(#${h2})` : a.clipPath ? Cg(A) : void 0, _ = Hi({ left: e, top: t, width: r, height: n, path: D, id: A, matrix: B, currentClipPath: K2, src: o }, a, g2), [AA, EA] = pg({ id: A, left: e, top: t, width: r, height: n, path: D, type: I, matrix: B || void 0, currentClipPath: K2, mask: b, filters: a._backdropFilters || [] });
  f += AA;
  let iA = C !== 1 && !u2 && E.length === 1 && !EA && !m2 && !F && !b && !a.boxShadow && !(a.borderTopWidth || a.borderRightWidth || a.borderBottomWidth || a.borderLeftWidth), lA = E.map((Z) => R2(I, { x: e, y: t, width: r, height: n, fill: Z, "fill-opacity": iA ? C : void 0, d: D || void 0, transform: B || void 0, "clip-path": a.transform ? void 0 : K2, style: F ? `filter:${F}` : void 0, mask: a.transform ? void 0 : b })).join(""), re = Ig({ id: A, left: e, top: t, width: r, height: n, currentClipPathId: h2, borderPath: D, borderType: I }, a), MA;
  if (u2) {
    let Z = (a.borderLeftWidth || 0) + (a.paddingLeft || 0), eA = (a.borderTopWidth || 0) + (a.paddingTop || 0), YA = (a.borderRightWidth || 0) + (a.paddingRight || 0), FA = (a.borderBottomWidth || 0) + (a.paddingBottom || 0), LA = r - Z - YA, QA = n - eA - FA, GA = (a.objectPosition || "center").toString(), [HA, gA] = Qf(GA, LA, QA), uA = a.__naturalWidth || LA, J = a.__naturalHeight || QA, SA, CA = LA, vA = QA, NA = e + Z, cA = t + eA;
    if (a.objectFit === "contain") {
      let TA = LA / uA, OA = QA / J, Y = Math.min(TA, OA);
      CA = uA * Y, vA = J * Y, NA = e + Z + HA - CA * HA / LA, cA = t + eA + gA - vA * gA / QA, SA = "none";
    } else if (a.objectFit === "cover") {
      let TA = LA / uA, OA = QA / J, Y = Math.max(TA, OA);
      CA = uA * Y, vA = J * Y, NA = e + Z + HA - CA * HA / LA, cA = t + eA + gA - vA * gA / QA, SA = "none";
    } else if (a.objectFit === "fill") SA = "none";
    else if (a.objectFit === "scale-down") if (uA && J) {
      let TA = LA / uA, OA = QA / J, Y = Math.min(TA, OA);
      if (Y >= 1) CA = uA, vA = J, SA = "none", NA = e + Z + HA - CA * HA / LA, cA = t + eA + gA - vA * gA / QA;
      else {
        let oA = Y;
        CA = uA * oA, vA = J * oA, NA = e + Z + HA - CA * HA / LA, cA = t + eA + gA - vA * gA / QA, SA = "none";
      }
    } else {
      let TA = LA / uA, OA = QA / J, Y = Math.min(TA, OA);
      CA = uA * Y, vA = J * Y, NA = e + Z + HA - CA * HA / LA, cA = t + eA + gA - vA * gA / QA, SA = "none";
    }
    else SA = "none";
    a.transform && (MA = gg({ id: A, borderRadiusPath: D, borderType: I, left: e, top: t, width: r, height: n }, a)), lA += R2("image", { x: NA, y: cA, width: CA, height: vA, href: o, preserveAspectRatio: SA, transform: B || void 0, style: F ? `filter:${F}` : void 0, "clip-path": a.transform ? MA ? `url(#${MA[1]})` : void 0 : `url(#satori_cp-${A})`, mask: a.transform ? void 0 : x3 ? `url(#${x3})` : `url(#satori_om-${A})` });
  }
  if (re) {
    f += re[0];
    let Z = re[1];
    lA += or({ left: e, top: t, width: r, height: n, props: { transform: B || void 0, "clip-path": `url(#${Z})` } }, a);
  }
  let ne = ja({ width: r, height: n, id: A, opacity: C, shape: R2(I, { x: e, y: t, width: r, height: n, fill: "#fff", stroke: "#fff", "stroke-width": 0, d: D || void 0, transform: B || void 0, "clip-path": K2, mask: b }) }, a), kA = EA + (m2 || lA);
  return a.transform && (K2 || b) && (kA = R2("g", { "clip-path": K2 || void 0, mask: b || void 0 }, kA)), C !== 1 && !iA && (kA = R2("g", { opacity: C }, kA)), (f ? R2("defs", {}, f) : "") + (ne ? ne[0] : "") + (MA ? MA[0] : "") + _ + kA + (ne ? ne[1] : "") + p;
}
var mg = String.raw;
var hg = mg`\p{Emoji}(?:\p{EMod}|[\u{E0020}-\u{E007E}]+\u{E007F}|\uFE0F?\u20E3?)`;
var yg = () => new RegExp(mg`\p{RI}{2}|(?![#*\d](?!\uFE0F?\u20E3))${hg}(?:\u200D${hg})*`, "gu");
var Cf = new RegExp(yg(), "u");
var Ti = { emoji: Cf, symbol: new RegExp("\\p{Symbol}", "u"), math: new RegExp("\\p{Math}", "u") };
var Pi = { "ja-JP": new RegExp("\\p{scx=Hira}|\\p{scx=Kana}|\\p{scx=Han}|[\\u3000]|[\\uFF00-\\uFFEF]", "u"), "ko-KR": new RegExp("\\p{scx=Hangul}", "u"), "zh-CN": new RegExp("\\p{scx=Han}", "u"), "zh-TW": new RegExp("\\p{scx=Han}", "u"), "zh-HK": new RegExp("\\p{scx=Han}", "u"), "th-TH": new RegExp("\\p{scx=Thai}", "u"), "bn-IN": new RegExp("\\p{scx=Bengali}", "u"), "ar-AR": new RegExp("\\p{scx=Arabic}", "u"), "ta-IN": new RegExp("\\p{scx=Tamil}", "u"), "ml-IN": new RegExp("\\p{scx=Malayalam}", "u"), "he-IL": new RegExp("\\p{scx=Hebrew}", "u"), "te-IN": new RegExp("\\p{scx=Telugu}", "u"), devanagari: new RegExp("\\p{scx=Devanagari}", "u"), kannada: new RegExp("\\p{scx=Kannada}", "u") };
var vn = Object.keys({ ...Pi, ...Ti });
function wg(A) {
  return vn.includes(A);
}
function Dg(A, e) {
  for (let r of Object.keys(Ti)) if (Ti[r].test(A)) return [r];
  let t = Object.keys(Pi).filter((r) => Pi[r].test(A));
  if (t.length === 0) return ["unknown"];
  if (e) {
    let r = t.findIndex((n) => n === e);
    r !== -1 && (t.splice(r, 1), t.unshift(e));
  }
  return t;
}
function bg(A) {
  if (A) return vn.find((e) => e.toLowerCase().startsWith(A.toLowerCase()));
}
async function* ar(A, e) {
  var cA, TA, OA;
  let t = await je(), { id: r, inheritedStyle: n, parent: i2, font: o, debug: s, locale: a, embedFont: g2 = true, graphemeImages: u2, canLoadAdditionalAssets: I, getTwStyles: B } = e;
  if (A === null || typeof A > "u") return yield, yield, "";
  if (!xt(A) || zs(A.type)) {
    let Y;
    if (!xt(A)) Y = ki(String(A), e), yield (await Y.next()).value;
    else {
      if (Vs(A.type)) throw new Error("Class component is not supported.");
      let xe;
      ni(A.type) ? xe = A.type.render : xe = A.type, Y = ar(await xe(A.props), e), yield (await Y.next()).value;
    }
    await Y.next();
    let oA = yield;
    return (await Y.next(oA)).value;
  }
  let { type: f, props: E } = A, C = f;
  if (E && Zs(E)) throw new Error("dangerouslySetInnerHTML property is not supported. See documentation for more information https://github.com/vercel/satori#jsx.");
  let { style: p, children: m2, tw: x3, lang: w2 = a } = E || {}, b = bg(w2);
  if (x3) {
    let Y = B(x3, p);
    p = Object.assign(Y, p);
  }
  let D = t.Node.create();
  i2.insertChild(D, i2.getChildCount());
  let [h2, v2] = await mi(D, C, n, p, E, e.replacedElements), F = h2.transformStyle === "preserve-3d", K2 = typeof h2.perspective == "number" ? h2.perspective : void 0;
  h2.transform === n.transform && (F || K2 !== void 0 || e.parentStyle.transformStyle === "preserve-3d" || typeof e.parentStyle.perspective == "number") && (h2.transform = [], v2.transform = h2.transform);
  let _ = h2.transform === n.transform;
  _ || (h2.transform.__parent = n.transform);
  let AA = F ? e.planes || [] : void 0;
  if ((h2.overflow === "hidden" || h2.clipPath && h2.clipPath !== "none") && (v2._inheritedClipPathId = `satori_cp-${r}`, v2._inheritedMaskId = `satori_om-${r}`), h2.maskImage && (v2._inheritedMaskId = `satori_mi-${r}`), h2.backgroundClip === "text") {
    let Y = { value: "" };
    v2._inheritedBackgroundClipTextPath = Y, h2._inheritedBackgroundClipTextPath = Y, h2.backgroundImage && (v2._inheritedBackgroundClipTextHasBackground = "true", h2._inheritedBackgroundClipTextHasBackground = "true");
  }
  let EA = !!((cA = e.replacedElements) != null && cA[C]), iA = EA ? [] : js(m2), lA = [], re = 0, MA = [];
  for (let Y of iA) {
    let oA = ar(Y, { id: r + "-" + re++, parentStyle: h2, inheritedStyle: v2, isInheritingTransform: true, parent: D, font: o, embedFont: g2, debug: s, graphemeImages: u2, canLoadAdditionalAssets: I, locale: b, getTwStyles: B, onNodeDetected: e.onNodeDetected, replacedElements: e.replacedElements, projectPlane: e.projectPlane, planes: AA });
    I ? MA.push(...(await oA.next()).value || []) : await oA.next(), lA.push(oA);
  }
  yield MA;
  for (let Y of lA) await Y.next();
  let [ne, kA] = yield, { left: Z, top: eA, width: YA, height: FA } = D.getComputedLayout();
  Z += ne, eA += kA;
  let LA = "", QA = "", GA = "", { children: HA, ...gA } = E;
  (TA = e.onNodeDetected) == null || TA.call(e, { left: Z, top: eA, width: YA, height: FA, type: C, props: gA, key: A.key, textContent: xt(HA) ? void 0 : HA });
  let uA = h2.transform;
  uA && !_ && (uA.__state = Wa({ functions: uA, box: { left: Z, top: eA, width: YA, height: FA }, origin: h2.transformOrigin, parent: ((OA = uA.__parent) == null ? void 0 : OA.__state) || dn, preserve3d: F, perspectiveDistance: K2, perspectiveOrigin: h2.perspectiveOrigin, canProject: !!e.projectPlane }));
  let J = (uA == null ? void 0 : uA.__state) || dn, SA = J.behindViewer || h2.backfaceVisibility === "hidden" && Xa(J), CA, vA = e.planes || AA;
  if (vA) {
    let Y = Ya(J, Z + YA / 2, eA + FA / 2);
    CA = { depth: Number.isFinite(Y) ? Math.round(Y * 1e6) / 1e6 : 0, svg: "" }, vA.push(CA);
  }
  if (C === "img" || EA) {
    let Y = h2.__src;
    QA = await sr({ id: r, left: Z, top: eA, width: YA, height: FA, src: Y, isInheritingTransform: _, debug: s }, h2, v2);
  } else if (C === "svg") {
    let Y = h2.color, oA = await ka(A, Y);
    QA = await sr({ id: r, left: Z, top: eA, width: YA, height: FA, src: oA, isInheritingTransform: _, debug: s }, h2, v2);
  } else {
    let Y = p == null ? void 0 : p.display;
    if (C === "div" && m2 && typeof m2 != "string" && Y !== "flex" && Y !== "none" && Y !== "contents") throw new Error('Expected <div> to have explicit "display: flex", "display: contents", or "display: none" if it has more than one child node.');
    QA = await sr({ id: r, left: Z, top: eA, width: YA, height: FA, isInheritingTransform: _, debug: s }, h2, v2);
  }
  for (let Y of lA) LA += (await Y.next([Z, eA])).value;
  h2._inheritedBackgroundClipTextPath && (GA += R2("clipPath", { id: `satori_bct-${r}`, "clip-path": h2._inheritedClipPathId ? `url(#${h2._inheritedClipPathId})` : void 0 }, h2._inheritedBackgroundClipTextPath.value));
  let NA = SA ? "" : GA + QA + LA;
  return NA && J.projection && !_ && (NA = e.projectPlane(NA, { matrix: J.projection, node: D, left: Z, top: eA, style: h2, id: r })), CA ? (CA.svg = NA, e.planes ? "" : AA.sort((Y, oA) => Y.depth - oA.depth).map(({ svg: Y }) => Y).join("")) : NA;
}
var fe = null;
var Rn = null;
var _i = /* @__PURE__ */ new WeakMap();
var Ji = typeof FinalizationRegistry == "function" ? new FinalizationRegistry((A) => A.destroy()) : null;
async function Sg() {
  if (!fe) {
    if (Rn) {
      await Rn;
      return;
    }
    Rn = (async () => {
      if (fe = await df, !fe || typeof fe.createBlob != "function") throw new Error("HarfBuzz module loaded but API is not available");
    })(), await Rn;
  }
}
function pf(A) {
  if (!fe) throw new Error("HarfBuzz not initialized. Call initHarfBuzz() first.");
  if (_i.has(A)) return _i.get(A);
  let e = A._rawFontData;
  if (!e) throw new Error("Font does not have _rawFontData. Make sure to store the original ArrayBuffer when loading fonts.");
  let t = fe.createBlob(new Uint8Array(e)), r = fe.createFace(t, 0), n = fe.createFont(r);
  r.destroy(), t.destroy();
  let i2 = A.unitsPerEm;
  return n.setScale(i2, i2), _i.set(A, n), Ji == null || Ji.register(A, n), n;
}
function xg(A, e, t = {}) {
  if (!fe) throw new Error("HarfBuzz not initialized");
  if (!e || e.length === 0) return [];
  let { features: r, language: n, script: i2, direction: o } = t, s = pf(A), a = fe.createBuffer();
  try {
    a.addText(e), a.guessSegmentProperties(), n && a.setLanguage(n), i2 && a.setScript(i2), o && a.setDirection(o);
    let g2;
    if (r && Object.keys(r).length > 0) {
      let I = [];
      for (let [B, f] of Object.entries(r)) typeof f == "boolean" ? I.push(f ? `+${B}` : `-${B}`) : I.push(`${B}=${f}`);
      g2 = I.join(",");
    }
    return g2 ? fe.shape(s, a, g2) : fe.shape(s, a), a.json(s);
  } finally {
    a.destroy();
  }
}
function kg(A) {
  if (!A || A === "normal") return {};
  let e = {}, t = A.split(",").map((r) => r.trim());
  for (let r of t) {
    let n = r.match(/["']([a-z0-9]{4})["']\s*(?:(on|off|[0-9]+))?/i);
    if (n) {
      let i2 = n[1], o = n[2];
      if (!o || o === "on" || o === "1") e[i2] = true;
      else if (o === "off" || o === "0") e[i2] = false;
      else {
        let s = parseInt(o, 10);
        isNaN(s) || (e[i2] = s);
      }
    }
  }
  return e;
}
var mf = 256;
function yf(A) {
  return /^\s$/.test(A);
}
function wf(A, e) {
  if (!A) return [];
  let t = _A(A, "grapheme"), r = [], n = "", i2 = null;
  for (let o of t) {
    let s;
    yf(o) && i2 !== null && i2.charToGlyphIndex(o) ? s = i2 : s = e(o), i2 === null ? (i2 = s, n = o) : s === i2 ? n += o : (r.push([n, i2]), n = o, i2 = s);
  }
  return n && i2 && r.push([n, i2]), r;
}
function Df(A) {
  let e = new DataView(A), t = e.getUint16(12), r = e.getUint32(16), n = new ArrayBuffer(r), i2 = new DataView(n), o = new Uint8Array(n);
  i2.setUint32(0, e.getUint32(4)), i2.setUint16(4, t);
  let s = Math.floor(Math.log2(t)), a = (1 << s) * 16;
  i2.setUint16(6, a), i2.setUint16(8, s), i2.setUint16(10, t * 16 - a);
  let g2 = 12 + t * 16;
  for (let u2 = 0; u2 < t; u2++) {
    let I = 44 + u2 * 20, B = e.getUint32(I), f = e.getUint32(I + 4), E = e.getUint32(I + 8), C = e.getUint32(I + 12), p = e.getUint32(I + 16), m2 = 12 + u2 * 16;
    if (i2.setUint32(m2, B), i2.setUint32(m2 + 4, p), i2.setUint32(m2 + 8, g2), i2.setUint32(m2 + 12, C), E < C) {
      let x3 = new Uint8Array(A, f + 2, E - 2), w2 = new Uint8Array(C);
      inflateSync(x3, w2), o.set(w2, g2);
    } else o.set(new Uint8Array(A, f, C), g2);
    g2 += C + 3 & -4;
  }
  return n;
}
var vg = "unknown";
function bf(A) {
  let e = [], t = [0, 0], r = [0, 0], n = (i2, o) => {
    let s = i2[0];
    for (let a = 1; a <= o; a++) {
      let g2 = a / o, u2 = Sf(i2, g2);
      e.push({ from: s, to: u2 }), s = u2;
    }
    r = i2[i2.length - 1];
  };
  for (let i2 of A) {
    if (i2.type === "M") {
      t = r = [i2.x, i2.y];
      continue;
    }
    if (i2.type === "L") {
      let o = [i2.x, i2.y];
      e.push({ from: r, to: o }), r = o;
      continue;
    }
    if (i2.type === "Q") {
      n([r, [i2.x1, i2.y1], [i2.x, i2.y]], 12);
      continue;
    }
    if (i2.type === "C") {
      n([r, [i2.x1, i2.y1], [i2.x2, i2.y2], [i2.x, i2.y]], 16);
      continue;
    }
    i2.type === "Z" && (e.push({ from: r, to: t }), r = t);
  }
  return e;
}
function Sf(A, e) {
  let t = A;
  for (; t.length > 1; ) {
    let r = [];
    for (let n = 0; n < t.length - 1; n++) r.push([t[n][0] + (t[n + 1][0] - t[n][0]) * e, t[n][1] + (t[n + 1][1] - t[n][1]) * e]);
    t = r;
  }
  return t[0];
}
function xf(A, e) {
  if (!e) return [];
  let t = e.strokeWidth, r = e.underlineY - t * 0.25, n = e.underlineY + t * 2.5, i2 = bf(A);
  if (!i2.length) return [];
  let o = n - r, s = Math.max(12, Math.ceil(o / 0.25)), a = o / s, g2 = r + a / 2, u2 = /* @__PURE__ */ new Set();
  for (let w2 = 0; w2 < s; w2++) {
    let b = g2 + a * w2, D = [];
    for (let h2 of i2) {
      let [v2, F] = h2.from, [K2, _] = h2.to;
      if (F === _) continue;
      let AA = Math.min(F, _), EA = Math.max(F, _);
      if (b < AA || b >= EA) continue;
      let iA = (b - F) / (_ - F), lA = v2 + (K2 - v2) * iA;
      D.push(lA);
    }
    if (D.length) {
      D.sort((h2, v2) => h2 - v2);
      for (let h2 = 0; h2 < D.length - 1; h2 += 2) {
        let v2 = Math.min(D[h2], D[h2 + 1]), F = Math.max(D[h2], D[h2 + 1]), K2 = Math.floor(v2), _ = Math.ceil(F);
        for (let AA = K2; AA < _; AA++) u2.add(AA);
      }
    }
  }
  if (!u2.size) return [];
  let I = Array.from(u2.values()).sort((w2, b) => w2 - b), B = [], f = I[0], E = I[0];
  for (let w2 = 1; w2 < I.length; w2++) {
    let b = I[w2];
    b > E + 1 && (B.push([f, E + 1]), f = b), E = b;
  }
  B.push([f, E + 1]);
  let C = [], p = t * 0.6, m2 = B[0][0], x3 = B[B.length - 1][1];
  for (let [w2, b] of B) {
    let D = Math.min(w2, m2) - p, h2 = Math.max(b, x3) + p;
    C.push({ x1: D, x2: h2, y1: r, y2: n });
  }
  return C;
}
function kf(A, e, [t, r], [n, i2]) {
  if (t !== n) return t ? !n || t === A ? -1 : n === A ? 1 : A === 400 && t === 500 || A === 500 && t === 400 ? -1 : A === 400 && n === 500 || A === 500 && n === 400 ? 1 : A < 400 ? t < A && n < A ? n - t : t < A ? -1 : n < A ? 1 : t - n : A < t && A < n ? t - n : A < t ? -1 : A < n ? 1 : n - t : 1;
  if (r !== i2) {
    if (r === e) return -1;
    if (i2 === e) return 1;
  }
  return -1;
}
var Ki = /* @__PURE__ */ new WeakMap();
var gr = class {
  constructor(e) {
    this.fonts = /* @__PURE__ */ new Map();
    this.shapedRunCache = /* @__PURE__ */ new Map();
    this.addFonts(e);
  }
  get({ name: e, weight: t, style: r }) {
    if (!this.fonts.has(e)) return null;
    t === "normal" && (t = 400), t === "bold" && (t = 700), typeof t == "string" && (t = Number.parseInt(t, 10));
    let n = [...this.fonts.get(e)], i2 = n[0];
    for (let o = 1; o < n.length; o++) {
      let [, s, a] = i2, [, g2, u2] = n[o];
      kf(t, r, [s, a], [g2, u2]) > 0 && (i2 = n[o]);
    }
    return i2[0];
  }
  addFonts(e) {
    e.length && this.fonts.size && this.shapedRunCache.clear();
    for (let t of e) {
      let { name: r, data: n, lang: i2 } = t;
      if (i2 && !wg(i2)) throw new Error(`Invalid value for props \`lang\`: "${i2}". The value must be one of the following: ${vn.join(", ")}.`);
      let o = i2 ?? vg, s;
      if (Ki.has(n)) s = Ki.get(n);
      else {
        let g2 = "buffer" in n ? n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength) : n;
        s = import_opentype.default.parse(g2, { lowMemory: true });
        let u2 = new Uint8Array(g2), I = u2[0] === 119 && u2[1] === 79 && u2[2] === 70 && u2[3] === 70;
        s._rawFontData = I ? Df(g2) : g2;
        let B = s.charToGlyphIndex;
        s.charToGlyphIndex = (f) => {
          let E = B.call(s, f);
          return E === 0 && s._trackBrokenChars && s._trackBrokenChars.push(f), E;
        }, Ki.set(n, s);
      }
      this.defaultFont || (this.defaultFont = s);
      let a = `${r.toLowerCase()}_${o}`;
      this.fonts.has(a) || this.fonts.set(a, []), this.fonts.get(a).push([s, t.weight, t.style]);
    }
  }
  getEngine(e = 16, t = "normal", { fontFamily: r = "sans-serif", fontWeight: n = 400, fontStyle: i2 = "normal" }, o) {
    if (!this.fonts.size) throw new Error("No fonts are loaded. At least one font is required to calculate the layout.");
    r = (Array.isArray(r) ? r : [r]).map((h2) => h2.toLowerCase());
    let s = [];
    r.forEach((h2) => {
      let v2 = this.get({ name: h2, weight: n, style: i2 });
      if (v2) {
        s.push(v2);
        return;
      }
      let F = this.get({ name: h2 + "_unknown", weight: n, style: i2 });
      if (F) {
        s.push(F);
        return;
      }
    });
    let a = Array.from(this.fonts.keys()), g2 = [], u2 = [], I = [];
    for (let h2 of a) if (!r.includes(h2)) if (o) {
      let v2 = vf(h2);
      v2 ? v2 === o ? g2.push(this.get({ name: h2, weight: n, style: i2 })) : u2.push(this.get({ name: h2, weight: n, style: i2 })) : I.push(this.get({ name: h2, weight: n, style: i2 }));
    } else I.push(this.get({ name: h2, weight: n, style: i2 }));
    let B = /* @__PURE__ */ new Map(), f = (h2, v2 = true) => {
      let F = [...s, ...I, ...g2, ...v2 ? u2 : []];
      if (typeof h2 > "u") return v2 ? F[F.length - 1] : void 0;
      let K2 = h2.charCodeAt(0);
      if (B.has(K2)) return B.get(K2);
      let _ = F.find((AA, EA) => !!AA.charToGlyphIndex(h2) || v2 && EA === F.length - 1);
      return _ && B.set(K2, _), _;
    }, E = (h2, v2 = false) => {
      var K2, _;
      return ((v2 ? (_ = (K2 = h2.tables) == null ? void 0 : K2.os2) == null ? void 0 : _.sTypoAscender : 0) || h2.ascender) / h2.unitsPerEm * e;
    }, C = (h2, v2 = false) => {
      var K2, _;
      return ((v2 ? (_ = (K2 = h2.tables) == null ? void 0 : K2.os2) == null ? void 0 : _.sTypoDescender : 0) || h2.descender) / h2.unitsPerEm * e;
    }, p = (h2, v2 = false) => {
      var F, K2;
      if (typeof t == "string" && t === "normal") {
        let _ = (v2 ? (K2 = (F = h2.tables) == null ? void 0 : F.os2) == null ? void 0 : K2.sTypoLineGap : 0) || 0;
        return E(h2, v2) - C(h2, v2) + _ / h2.unitsPerEm * e;
      } else if (typeof t == "number") return e * t;
    }, m2 = (h2) => f(h2, false), x3 = this.shapedRunCache, w2 = `${r.join(",")}|${n}|${i2}|${o || ""}`, b = (h2, v2) => {
      let F = `${w2}\0${v2 || ""}\0${h2}`, K2 = x3.get(F);
      if (K2 !== void 0) return x3.delete(F), x3.set(F, K2), K2;
      let _ = v2 ? kg(v2) : {}, AA = wf(h2, f).map(([EA, iA]) => [EA, iA, xg(iA, EA, { features: _ })]);
      if (x3.size >= mf) {
        let EA = x3.keys().next().value;
        EA !== void 0 && x3.delete(EA);
      }
      return x3.set(F, AA), AA;
    };
    return { has: (h2) => {
      if (h2 === `
`) return true;
      let v2 = m2(h2);
      if (!v2) return false;
      for (let F of _A(h2, "grapheme")) if (!v2.charToGlyphIndex(F)) return false;
      return true;
    }, baseline: (h2, v2 = typeof h2 > "u" ? s[0] : f(h2)) => {
      let F = E(v2), K2 = C(v2), _ = F - K2;
      return F + (p(v2) - _) / 2;
    }, height: (h2, v2 = typeof h2 > "u" ? s[0] : f(h2)) => p(v2), measure: (h2, v2) => this.measure(h2, v2, b), getSVG: (h2, v2, F) => this.getSVG(h2, v2, b, F) };
  }
  patchFontFallbackResolver(e, t) {
    let r = [];
    e._trackBrokenChars = r;
    let n = e.stringToGlyphs;
    return e.stringToGlyphs = (i2, ...o) => {
      let s = n.call(e, i2, ...o);
      for (let a = 0; a < s.length; a++) if (s[a].unicode === void 0) {
        let g2 = r.shift(), u2 = t(g2);
        if (u2 !== e) {
          let I = u2.charToGlyph(g2), B = e.unitsPerEm / u2.unitsPerEm, f = new import_opentype.default.Path();
          f.unitsPerEm = e.unitsPerEm, f.commands = I.path.commands.map((C) => {
            let p = { ...C };
            for (let m2 in p) typeof p[m2] == "number" && (p[m2] *= B);
            return p;
          });
          let E = new import_opentype.default.Glyph({ ...I, advanceWidth: I.advanceWidth * B, xMin: I.xMin * B, xMax: I.xMax * B, yMin: I.yMin * B, yMax: I.yMax * B, path: f });
          s[a] = E;
        }
      }
      return s;
    }, () => {
      e.stringToGlyphs = n, e._trackBrokenChars = void 0;
    };
  }
  measure(e, { fontSize: t, letterSpacing: r = 0, fontFeatureSettings: n }, i2) {
    let o = i2(e, n), s = 0, a = 0;
    for (let [, u2, I] of o) {
      let B = 0;
      for (let f of I) B += f.ax;
      s += B / u2.unitsPerEm * t, a += I.length;
    }
    let g2 = r * Math.max(0, a - 1);
    return s + g2;
  }
  getSVG(e, { fontSize: t, top: r, left: n, letterSpacing: i2 = 0, fontFeatureSettings: o }, s, a) {
    if (t === 0) return { path: "", boxes: [] };
    let g2 = s(e.replace(/\n/g, ""), o), u2 = [], I = n, B = r, f = false, E = new import_opentype.default.Path();
    for (let [, C, p] of g2) {
      let m2 = t / C.unitsPerEm;
      for (let x3 = 0; x3 < p.length; x3++) {
        let w2 = p[x3];
        f && (I += i2);
        let b = C.glyphs.get(w2.g);
        if (b && b.path) {
          let D = I + w2.dx * m2, h2 = B + w2.dy * m2, v2 = b.getPath(D, h2, t, {}), F = a ? xf(v2.commands, a) : [];
          F.length && u2.push(...F), E.extend(v2);
        }
        I += w2.ax * m2, f = true;
      }
    }
    return { path: E.toPathData(1), boxes: u2 };
  }
};
function vf(A) {
  let e = A.split("_"), t = e[e.length - 1];
  return t === vg ? void 0 : t;
}
function Wi({ width: A, height: e, content: t }) {
  return R2("svg", { width: A, height: e, viewBox: `0 0 ${A} ${e}`, xmlns: "http://www.w3.org/2000/svg", "enable-background": t.includes('in="BackgroundImage"') ? "new" : void 0 }, t);
}
var gl = yl(TI());
var Ep = ["ios", "android", "windows", "macos", "web"];
function _I(A) {
  return Ep.includes(A);
}
var Qp = ["portrait", "landscape"];
function JI(A) {
  return Qp.includes(A);
}
var PI;
(function(A) {
  A.fontSize = "fontSize", A.lineHeight = "lineHeight";
})(PI || (PI = {}));
var aA;
(function(A) {
  A.rem = "rem", A.em = "em", A.px = "px", A.percent = "%", A.vw = "vw", A.vh = "vh", A.none = "<no-css-unit>";
})(aA || (aA = {}));
function Cs(A) {
  return typeof A == "string";
}
function ds(A) {
  return typeof A == "object";
}
var ps;
function S2(A) {
  return { kind: "complete", style: A };
}
function JA(A, e = {}) {
  let { fractions: t } = e;
  if (t && A.includes("/")) {
    let [i2 = "", o = ""] = A.split("/", 2), s = JA(i2), a = JA(o);
    return !s || !a ? null : [s[0] / a[0], a[1]];
  }
  let r = parseFloat(A);
  if (Number.isNaN(r)) return null;
  let n = A.match(/(([a-z]{2,}|%))$/);
  if (!n) return [r, aA.none];
  switch (n == null ? void 0 : n[1]) {
    case "rem":
      return [r, aA.rem];
    case "px":
      return [r, aA.px];
    case "em":
      return [r, aA.em];
    case "%":
      return [r, aA.percent];
    case "vw":
      return [r, aA.vw];
    case "vh":
      return [r, aA.vh];
    default:
      return null;
  }
}
function Ve(A, e, t = {}) {
  let r = Le(e, t);
  return r === null ? null : S2({ [A]: r });
}
function zn(A, e, t) {
  let r = Le(e);
  return r !== null && (t[A] = r), t;
}
function WI(A, e) {
  let t = Le(e);
  return t === null ? null : { [A]: t };
}
function Le(A, e = {}) {
  if (A === void 0) return null;
  let t = JA(String(A), e);
  return t ? it(...t, e) : null;
}
function it(A, e, t = {}) {
  let { isNegative: r, device: n } = t;
  switch (e) {
    case aA.rem:
      return A * 16 * (r ? -1 : 1);
    case aA.px:
      return A * (r ? -1 : 1);
    case aA.percent:
      return `${r ? "-" : ""}${A}%`;
    case aA.none:
      return A * (r ? -1 : 1);
    case aA.vw:
      return n != null && n.windowDimensions ? n.windowDimensions.width * (A / 100) : (te("`vw` CSS unit requires configuration with `useDeviceContext()`"), null);
    case aA.vh:
      return n != null && n.windowDimensions ? n.windowDimensions.height * (A / 100) : (te("`vh` CSS unit requires configuration with `useDeviceContext()`"), null);
    default:
      return null;
  }
}
function hs(A) {
  let e = JA(A);
  if (!e) return null;
  let [t, r] = e;
  switch (r) {
    case aA.rem:
      return t * 16;
    case aA.px:
      return t;
    default:
      return null;
  }
}
var Cp = { t: "Top", tr: "TopRight", tl: "TopLeft", b: "Bottom", br: "BottomRight", bl: "BottomLeft", l: "Left", r: "Right", x: "Horizontal", y: "Vertical" };
function ms(A) {
  return Cp[A ?? ""] || "All";
}
function ys(A) {
  let e = "All";
  return [A.replace(/^-(t|b|r|l|tr|tl|br|bl)(-|$)/, (r, n) => (e = ms(n), "")), e];
}
function mt(A, e = {}) {
  if (A.includes("/")) {
    let t = KI(A, { ...e, fractions: true });
    if (t) return t;
  }
  return A[0] === "[" && (A = A.slice(1, -1)), KI(A, e);
}
function de(A, e, t = {}) {
  let r = mt(e, t);
  return r === null ? null : S2({ [A]: r });
}
function KI(A, e = {}) {
  if (A === "px") return 1;
  let t = JA(A, e);
  if (!t) return null;
  let [r, n] = t;
  return e.fractions && (n = aA.percent, r *= 100), n === aA.none && (r = r / 4, n = aA.rem), it(r, n, e);
}
function dp(...A) {
  console.warn(...A);
}
function pp(...A) {
}
var te = typeof process > "u" || ((ps = process == null ? void 0 : process.env) === null || ps === void 0 ? void 0 : ps.JEST_WORKER_ID) === void 0 ? dp : pp;
var hp = [["aspect-square", S2({ aspectRatio: 1 })], ["aspect-video", S2({ aspectRatio: 16 / 9 })], ["items-center", S2({ alignItems: "center" })], ["items-start", S2({ alignItems: "flex-start" })], ["items-end", S2({ alignItems: "flex-end" })], ["items-baseline", S2({ alignItems: "baseline" })], ["items-stretch", S2({ alignItems: "stretch" })], ["justify-start", S2({ justifyContent: "flex-start" })], ["justify-end", S2({ justifyContent: "flex-end" })], ["justify-center", S2({ justifyContent: "center" })], ["justify-between", S2({ justifyContent: "space-between" })], ["justify-around", S2({ justifyContent: "space-around" })], ["justify-evenly", S2({ justifyContent: "space-evenly" })], ["content-start", S2({ alignContent: "flex-start" })], ["content-end", S2({ alignContent: "flex-end" })], ["content-between", S2({ alignContent: "space-between" })], ["content-around", S2({ alignContent: "space-around" })], ["content-stretch", S2({ alignContent: "stretch" })], ["content-center", S2({ alignContent: "center" })], ["self-auto", S2({ alignSelf: "auto" })], ["self-start", S2({ alignSelf: "flex-start" })], ["self-end", S2({ alignSelf: "flex-end" })], ["self-center", S2({ alignSelf: "center" })], ["self-stretch", S2({ alignSelf: "stretch" })], ["self-baseline", S2({ alignSelf: "baseline" })], ["direction-inherit", S2({ direction: "inherit" })], ["direction-ltr", S2({ direction: "ltr" })], ["direction-rtl", S2({ direction: "rtl" })], ["hidden", S2({ display: "none" })], ["flex", S2({ display: "flex" })], ["flex-row", S2({ flexDirection: "row" })], ["flex-row-reverse", S2({ flexDirection: "row-reverse" })], ["flex-col", S2({ flexDirection: "column" })], ["flex-col-reverse", S2({ flexDirection: "column-reverse" })], ["flex-wrap", S2({ flexWrap: "wrap" })], ["flex-wrap-reverse", S2({ flexWrap: "wrap-reverse" })], ["flex-nowrap", S2({ flexWrap: "nowrap" })], ["flex-auto", S2({ flexGrow: 1, flexShrink: 1, flexBasis: "auto" })], ["flex-initial", S2({ flexGrow: 0, flexShrink: 1, flexBasis: "auto" })], ["flex-none", S2({ flexGrow: 0, flexShrink: 0, flexBasis: "auto" })], ["overflow-hidden", S2({ overflow: "hidden" })], ["overflow-visible", S2({ overflow: "visible" })], ["overflow-scroll", S2({ overflow: "scroll" })], ["absolute", S2({ position: "absolute" })], ["relative", S2({ position: "relative" })], ["italic", S2({ fontStyle: "italic" })], ["not-italic", S2({ fontStyle: "normal" })], ["oldstyle-nums", Tr("oldstyle-nums")], ["small-caps", Tr("small-caps")], ["lining-nums", Tr("lining-nums")], ["tabular-nums", Tr("tabular-nums")], ["proportional-nums", Tr("proportional-nums")], ["font-thin", S2({ fontWeight: "100" })], ["font-100", S2({ fontWeight: "100" })], ["font-extralight", S2({ fontWeight: "200" })], ["font-200", S2({ fontWeight: "200" })], ["font-light", S2({ fontWeight: "300" })], ["font-300", S2({ fontWeight: "300" })], ["font-normal", S2({ fontWeight: "normal" })], ["font-400", S2({ fontWeight: "400" })], ["font-medium", S2({ fontWeight: "500" })], ["font-500", S2({ fontWeight: "500" })], ["font-semibold", S2({ fontWeight: "600" })], ["font-600", S2({ fontWeight: "600" })], ["font-bold", S2({ fontWeight: "bold" })], ["font-700", S2({ fontWeight: "700" })], ["font-extrabold", S2({ fontWeight: "800" })], ["font-800", S2({ fontWeight: "800" })], ["font-black", S2({ fontWeight: "900" })], ["font-900", S2({ fontWeight: "900" })], ["include-font-padding", S2({ includeFontPadding: true })], ["remove-font-padding", S2({ includeFontPadding: false })], ["max-w-none", S2({ maxWidth: "99999%" })], ["text-left", S2({ textAlign: "left" })], ["text-center", S2({ textAlign: "center" })], ["text-right", S2({ textAlign: "right" })], ["text-justify", S2({ textAlign: "justify" })], ["text-auto", S2({ textAlign: "auto" })], ["underline", S2({ textDecorationLine: "underline" })], ["line-through", S2({ textDecorationLine: "line-through" })], ["no-underline", S2({ textDecorationLine: "none" })], ["uppercase", S2({ textTransform: "uppercase" })], ["lowercase", S2({ textTransform: "lowercase" })], ["capitalize", S2({ textTransform: "capitalize" })], ["normal-case", S2({ textTransform: "none" })], ["w-auto", S2({ width: "auto" })], ["h-auto", S2({ height: "auto" })], ["shadow-sm", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowRadius: 1, shadowOpacity: 0.025, elevation: 1 })], ["shadow", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowRadius: 1, shadowOpacity: 0.075, elevation: 2 })], ["shadow-md", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowRadius: 3, shadowOpacity: 0.125, elevation: 3 })], ["shadow-lg", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 })], ["shadow-xl", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowOpacity: 0.19, shadowRadius: 20, elevation: 12 })], ["shadow-2xl", S2({ shadowOffset: { width: 1, height: 1 }, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 30, elevation: 16 })], ["shadow-none", S2({ shadowOffset: { width: 0, height: 0 }, shadowColor: "#000", shadowRadius: 0, shadowOpacity: 0, elevation: 0 })]];
var ws = hp;
function Tr(A) {
  return { kind: "dependent", complete(e) {
    (!e.fontVariant || !Array.isArray(e.fontVariant)) && (e.fontVariant = []), e.fontVariant.push(A);
  } };
}
var Pr = class {
  constructor(e) {
    this.ir = new Map(ws), this.styles = /* @__PURE__ */ new Map(), this.prefixes = /* @__PURE__ */ new Map(), this.ir = new Map([...ws, ...e ?? []]);
  }
  getStyle(e) {
    return this.styles.get(e);
  }
  setStyle(e, t) {
    this.styles.set(e, t);
  }
  getIr(e) {
    return this.ir.get(e);
  }
  setIr(e, t) {
    this.ir.set(e, t);
  }
  getPrefixMatch(e) {
    return this.prefixes.get(e);
  }
  setPrefixMatch(e, t) {
    this.prefixes.set(e, t);
  }
};
function Ds(A, e, t = {}) {
  let r = e == null ? void 0 : e[A];
  if (!r) return de("fontSize", A, t);
  if (typeof r == "string") return Ve("fontSize", r);
  let n = {}, [i2, o] = r, s = WI("fontSize", i2);
  if (s && (n = s), typeof o == "string") return S2(zn("lineHeight", YI(o, n), n));
  let { lineHeight: a, letterSpacing: g2 } = o;
  return a && zn("lineHeight", YI(a, n), n), g2 && zn("letterSpacing", g2, n), S2(n);
}
function YI(A, e) {
  let t = JA(A);
  if (t) {
    let [r, n] = t;
    if ((n === aA.none || n === aA.em) && typeof e.fontSize == "number") return e.fontSize * r;
  }
  return A;
}
function bs(A, e) {
  var t;
  let r = (t = e == null ? void 0 : e[A]) !== null && t !== void 0 ? t : A.startsWith("[") ? A.slice(1, -1) : A, n = JA(r);
  if (!n) return null;
  let [i2, o] = n;
  if (o === aA.none) return { kind: "dependent", complete(a) {
    if (typeof a.fontSize != "number") return "relative line-height utilities require that font-size be set";
    a.lineHeight = a.fontSize * i2;
  } };
  let s = it(i2, o);
  return s !== null ? S2({ lineHeight: s }) : null;
}
function Ss(A, e, t, r, n) {
  let i2 = "";
  if (r[0] === "[") i2 = r.slice(1, -1);
  else {
    let g2 = n == null ? void 0 : n[r];
    if (g2) i2 = g2;
    else {
      let u2 = mt(r);
      return u2 && typeof u2 == "number" ? qI(u2, aA.px, e, A) : null;
    }
  }
  if (i2 === "auto") return XI(e, A, "auto");
  let o = JA(i2);
  if (!o) return null;
  let [s, a] = o;
  return t && (s = -s), qI(s, a, e, A);
}
function qI(A, e, t, r) {
  let n = it(A, e);
  return n === null ? null : XI(t, r, n);
}
function XI(A, e, t) {
  switch (A) {
    case "All":
      return { kind: "complete", style: { [`${e}Top`]: t, [`${e}Right`]: t, [`${e}Bottom`]: t, [`${e}Left`]: t } };
    case "Bottom":
    case "Top":
    case "Left":
    case "Right":
      return { kind: "complete", style: { [`${e}${A}`]: t } };
    case "Vertical":
      return { kind: "complete", style: { [`${e}Top`]: t, [`${e}Bottom`]: t } };
    case "Horizontal":
      return { kind: "complete", style: { [`${e}Left`]: t, [`${e}Right`]: t } };
    default:
      return null;
  }
}
function xs(A) {
  if (!A) return {};
  let e = Object.entries(A).reduce((n, [i2, o]) => {
    let s = [0, 1 / 0, 0], a = typeof o == "string" ? { min: o } : o, g2 = a.min ? hs(a.min) : 0;
    g2 === null ? te(`invalid screen config value: ${i2}->min: ${a.min}`) : s[0] = g2;
    let u2 = a.max ? hs(a.max) : 1 / 0;
    return u2 === null ? te(`invalid screen config value: ${i2}->max: ${a.max}`) : s[1] = u2, n[i2] = s, n;
  }, {}), t = Object.values(e);
  t.sort((n, i2) => {
    let [o, s] = n, [a, g2] = i2;
    return s === 1 / 0 || g2 === 1 / 0 ? o - a : s - g2;
  });
  let r = 0;
  return t.forEach((n) => n[2] = r++), e;
}
function ks(A, e) {
  let t = e == null ? void 0 : e[A];
  if (!t) return null;
  if (typeof t == "string") return S2({ fontFamily: t });
  let r = t[0];
  return r ? S2({ fontFamily: r }) : null;
}
function yt(A, e, t) {
  if (!t) return null;
  let r;
  e.includes("/") && ([e = "", r] = e.split("/", 2));
  let n = "";
  if (e.startsWith("[#") || e.startsWith("[rgb") ? n = e.slice(1, -1) : n = ZI(e, t), !n) return null;
  if (r) {
    let i2 = Number(r);
    if (!Number.isNaN(i2)) return n = VI(n, i2 / 100), S2({ [Zn[A].color]: n });
  }
  return { kind: "dependent", complete(i2) {
    let o = Zn[A].opacity, s = i2[o];
    typeof s == "number" && (n = VI(n, s)), i2[Zn[A].color] = n;
  } };
}
function _r(A, e) {
  let t = parseInt(e, 10);
  if (Number.isNaN(t)) return null;
  let r = t / 100;
  return { kind: "complete", style: { [Zn[A].opacity]: r } };
}
function VI(A, e) {
  return A.startsWith("#") ? A = mp(A) : A.startsWith("rgb(") && (A = A.replace(/^rgb\(/, "rgba(").replace(/\)$/, ", 1)")), A.replace(/, ?\d*\.?(\d+)\)$/, `, ${e})`);
}
function zI(A) {
  for (let e in A) e.startsWith("__opacity_") && delete A[e];
}
var Zn = { bg: { opacity: "__opacity_bg", color: "backgroundColor" }, text: { opacity: "__opacity_text", color: "color" }, border: { opacity: "__opacity_border", color: "borderColor" }, borderTop: { opacity: "__opacity_border", color: "borderTopColor" }, borderBottom: { opacity: "__opacity_border", color: "borderBottomColor" }, borderLeft: { opacity: "__opacity_border", color: "borderLeftColor" }, borderRight: { opacity: "__opacity_border", color: "borderRightColor" }, shadow: { opacity: "__opacity_shadow", color: "shadowColor" }, tint: { opacity: "__opacity_tint", color: "tintColor" } };
function mp(A) {
  let e = A;
  A = A.replace(yp, (o, s, a, g2) => s + s + a + a + g2 + g2);
  let t = wp.exec(A);
  if (!t) return te(`invalid config hex color value: ${e}`), "rgba(0, 0, 0, 1)";
  let r = parseInt(t[1], 16), n = parseInt(t[2], 16), i2 = parseInt(t[3], 16);
  return `rgba(${r}, ${n}, ${i2}, 1)`;
}
function ZI(A, e) {
  let t = e[A];
  if (Cs(t)) return t;
  if (ds(t) && Cs(t.DEFAULT)) return t.DEFAULT;
  let [r = "", ...n] = A.split("-");
  for (; r !== A; ) {
    let i2 = e[r];
    if (ds(i2)) return ZI(n.join("-"), i2);
    if (n.length === 0) return "";
    r = `${r}-${n.shift()}`;
  }
  return "";
}
var yp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
var wp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
function $I(A, e) {
  let [t, r] = ys(A);
  if (t.match(/^(-?(\d)+)?$/)) return Dp(t, r, e == null ? void 0 : e.borderWidth);
  if (t = t.replace(/^-/, ""), ["dashed", "solid", "dotted"].includes(t)) return S2({ borderStyle: t });
  let i2 = "border";
  switch (r) {
    case "Bottom":
      i2 = "borderBottom";
      break;
    case "Top":
      i2 = "borderTop";
      break;
    case "Left":
      i2 = "borderLeft";
      break;
    case "Right":
      i2 = "borderRight";
      break;
  }
  let o = yt(i2, t, e == null ? void 0 : e.borderColor);
  if (o) return o;
  let s = `border${r === "All" ? "" : r}Width`;
  t = t.replace(/^-/, "");
  let a = t.slice(1, -1), g2 = de(s, a);
  return typeof (g2 == null ? void 0 : g2.style[s]) != "number" ? null : g2;
}
function Dp(A, e, t) {
  if (!t) return null;
  A = A.replace(/^-/, "");
  let n = t[A === "" ? "DEFAULT" : A];
  if (n === void 0) return null;
  let i2 = `border${e === "All" ? "" : e}Width`;
  return Ve(i2, n);
}
function Al(A, e) {
  if (!e) return null;
  let [t, r] = ys(A);
  t = t.replace(/^-/, ""), t === "" && (t = "DEFAULT");
  let n = `border${r === "All" ? "" : r}Radius`, i2 = e[t];
  if (i2) return jI(Ve(n, i2));
  let o = de(n, t);
  return typeof (o == null ? void 0 : o.style[n]) != "number" ? null : jI(o);
}
function jI(A) {
  if ((A == null ? void 0 : A.kind) !== "complete") return A;
  let e = A.style.borderTopRadius;
  e !== void 0 && (A.style.borderTopLeftRadius = e, A.style.borderTopRightRadius = e, delete A.style.borderTopRadius);
  let t = A.style.borderBottomRadius;
  t !== void 0 && (A.style.borderBottomLeftRadius = t, A.style.borderBottomRightRadius = t, delete A.style.borderBottomRadius);
  let r = A.style.borderLeftRadius;
  r !== void 0 && (A.style.borderBottomLeftRadius = r, A.style.borderTopLeftRadius = r, delete A.style.borderLeftRadius);
  let n = A.style.borderRightRadius;
  return n !== void 0 && (A.style.borderBottomRightRadius = n, A.style.borderTopRightRadius = n, delete A.style.borderRightRadius), A;
}
function Kt(A, e, t, r) {
  let n = null;
  A === "inset" && (e = e.replace(/^(x|y)-/, (s, a) => (n = a === "x" ? "x" : "y", "")));
  let i2 = r == null ? void 0 : r[e];
  if (i2) {
    let s = Le(i2, { isNegative: t });
    if (s !== null) return el(A, n, s);
  }
  let o = mt(e, { isNegative: t });
  return o !== null ? el(A, n, o) : null;
}
function el(A, e, t) {
  if (A !== "inset") return S2({ [A]: t });
  switch (e) {
    case null:
      return S2({ top: t, left: t, right: t, bottom: t });
    case "y":
      return S2({ top: t, bottom: t });
    case "x":
      return S2({ left: t, right: t });
  }
}
function Jr(A, e, t) {
  var r;
  e = e.replace(/^-/, "");
  let n = e === "" ? "DEFAULT" : e, i2 = Number((r = t == null ? void 0 : t[n]) !== null && r !== void 0 ? r : e);
  return Number.isNaN(i2) ? null : S2({ [`flex${A}`]: i2 });
}
function tl(A, e) {
  var t, r;
  if (A = (e == null ? void 0 : e[A]) || A, ["min-content", "revert", "unset"].includes(A)) return null;
  if (A.match(/^\d+(\.\d+)?$/)) return S2({ flexGrow: Number(A), flexBasis: "0%" });
  let n = A.match(/^(\d+)\s+(\d+)$/);
  if (n) return S2({ flexGrow: Number(n[1]), flexShrink: Number(n[2]) });
  if (n = A.match(/^(\d+)\s+([^ ]+)$/), n) {
    let i2 = Le((t = n[2]) !== null && t !== void 0 ? t : "");
    return i2 ? S2({ flexGrow: Number(n[1]), flexBasis: i2 }) : null;
  }
  if (n = A.match(/^(\d+)\s+(\d+)\s+(.+)$/), n) {
    let i2 = Le((r = n[3]) !== null && r !== void 0 ? r : "");
    return i2 ? S2({ flexGrow: Number(n[1]), flexShrink: Number(n[2]), flexBasis: i2 }) : null;
  }
  return null;
}
function vs(A, e, t = {}, r) {
  let n = r == null ? void 0 : r[e];
  return n !== void 0 ? Ve(A, n, t) : de(A, e, t);
}
function Kr(A, e, t = {}, r) {
  let n = Le(r == null ? void 0 : r[e], t);
  return n ? S2({ [A]: n }) : (e === "screen" && (e = A.includes("Width") ? "100vw" : "100vh"), de(A, e, t));
}
function rl(A, e, t) {
  let r = t == null ? void 0 : t[A];
  if (r) {
    let n = JA(r, { isNegative: e });
    if (!n) return null;
    let [i2, o] = n;
    if (o === aA.em) return bp(i2);
    if (o === aA.percent) return te("percentage-based letter-spacing configuration currently unsupported, switch to `em`s, or open an issue if you'd like to see support added."), null;
    let s = it(i2, o, { isNegative: e });
    return s !== null ? S2({ letterSpacing: s }) : null;
  }
  return de("letterSpacing", A, { isNegative: e });
}
function bp(A) {
  return { kind: "dependent", complete(e) {
    let t = e.fontSize;
    if (typeof t != "number" || Number.isNaN(t)) return "tracking-X relative letter spacing classes require font-size to be set";
    e.letterSpacing = Math.round((A * t + Number.EPSILON) * 100) / 100;
  } };
}
function nl(A, e) {
  let t = e == null ? void 0 : e[A];
  if (t) {
    let n = JA(String(t));
    if (n) return S2({ opacity: n[0] });
  }
  let r = JA(A);
  return r ? S2({ opacity: r[0] / 100 }) : null;
}
function il(A) {
  let e = parseInt(A, 10);
  return Number.isNaN(e) ? null : { kind: "complete", style: { shadowOpacity: e / 100 } };
}
function ol(A) {
  if (A.includes("/")) {
    let [t = "", r = ""] = A.split("/", 2), n = Rs(t), i2 = Rs(r);
    return n === null || i2 === null ? null : { kind: "complete", style: { shadowOffset: { width: n, height: i2 } } };
  }
  let e = Rs(A);
  return e === null ? null : { kind: "complete", style: { shadowOffset: { width: e, height: e } } };
}
function Rs(A) {
  let e = mt(A);
  return typeof e == "number" ? e : null;
}
var Wt = class {
  constructor(e, t = {}, r, n, i2) {
    var o, s, a, g2, u2, I;
    this.config = t, this.cache = r, this.position = 0, this.isNull = false, this.isNegative = false, this.context = {}, this.context.device = n;
    let B = e.trim().split(":"), f = [];
    B.length === 1 ? this.string = e : (this.string = (o = B.pop()) !== null && o !== void 0 ? o : "", f = B), this.char = this.string[0];
    let E = xs((s = this.config.theme) === null || s === void 0 ? void 0 : s.screens);
    for (let C of f) if (E[C]) {
      let p = (a = E[C]) === null || a === void 0 ? void 0 : a[2];
      p !== void 0 && (this.order = ((g2 = this.order) !== null && g2 !== void 0 ? g2 : 0) + p);
      let m2 = (u2 = n.windowDimensions) === null || u2 === void 0 ? void 0 : u2.width;
      if (m2) {
        let [x3, w2] = (I = E[C]) !== null && I !== void 0 ? I : [0, 0];
        (m2 <= x3 || m2 > w2) && (this.isNull = true);
      } else this.isNull = true;
    } else _I(C) ? this.isNull = C !== i2 : JI(C) ? n.windowDimensions ? (n.windowDimensions.width > n.windowDimensions.height ? "landscape" : "portrait") !== C ? this.isNull = true : this.incrementOrder() : this.isNull = true : C === "retina" ? n.pixelDensity === 2 ? this.incrementOrder() : this.isNull = true : C === "dark" ? n.colorScheme !== "dark" ? this.isNull = true : this.incrementOrder() : this.handlePossibleArbitraryBreakpointPrefix(C) || (this.isNull = true);
  }
  parse() {
    if (this.isNull) return { kind: "null" };
    let e = this.cache.getIr(this.rest);
    if (e) return e;
    this.parseIsNegative();
    let t = this.parseUtility();
    return t ? this.order !== void 0 ? { kind: "ordered", order: this.order, styleIr: t } : t : { kind: "null" };
  }
  parseUtility() {
    var e, t, r, n, i2;
    let o = this.config.theme, s = null;
    switch (this.char) {
      case "m":
      case "p": {
        let a = this.peekSlice(1, 3).match(/^(t|b|r|l|x|y)?-/);
        if (a) {
          let g2 = this.char === "m" ? "margin" : "padding";
          this.advance(((t = (e = a[0]) === null || e === void 0 ? void 0 : e.length) !== null && t !== void 0 ? t : 0) + 1);
          let u2 = ms(a[1]), I = Ss(g2, u2, this.isNegative, this.rest, (r = this.config.theme) === null || r === void 0 ? void 0 : r[g2]);
          if (I) return I;
        }
      }
    }
    if (this.consumePeeked("h-") && (s = vs("height", this.rest, this.context, o == null ? void 0 : o.height), s) || this.consumePeeked("w-") && (s = vs("width", this.rest, this.context, o == null ? void 0 : o.width), s) || this.consumePeeked("min-w-") && (s = Kr("minWidth", this.rest, this.context, o == null ? void 0 : o.minWidth), s) || this.consumePeeked("min-h-") && (s = Kr("minHeight", this.rest, this.context, o == null ? void 0 : o.minHeight), s) || this.consumePeeked("max-w-") && (s = Kr("maxWidth", this.rest, this.context, o == null ? void 0 : o.maxWidth), s) || this.consumePeeked("max-h-") && (s = Kr("maxHeight", this.rest, this.context, o == null ? void 0 : o.maxHeight), s) || this.consumePeeked("leading-") && (s = bs(this.rest, o == null ? void 0 : o.lineHeight), s) || this.consumePeeked("text-") && (s = Ds(this.rest, o == null ? void 0 : o.fontSize, this.context), s || (s = yt("text", this.rest, o == null ? void 0 : o.textColor), s) || this.consumePeeked("opacity-") && (s = _r("text", this.rest), s)) || this.consumePeeked("font-") && (s = ks(this.rest, o == null ? void 0 : o.fontFamily), s) || this.consumePeeked("aspect-") && (this.consumePeeked("ratio-") && te("`aspect-ratio-{ratio}` is deprecated, use `aspect-{ratio}` instead"), s = Ve("aspectRatio", this.rest, { fractions: true }), s) || this.consumePeeked("tint-") && (s = yt("tint", this.rest, o == null ? void 0 : o.colors), s) || this.consumePeeked("bg-") && (s = yt("bg", this.rest, o == null ? void 0 : o.backgroundColor), s || this.consumePeeked("opacity-") && (s = _r("bg", this.rest), s)) || this.consumePeeked("border") && (s = $I(this.rest, o), s || this.consumePeeked("-opacity-") && (s = _r("border", this.rest), s)) || this.consumePeeked("rounded") && (s = Al(this.rest, o == null ? void 0 : o.borderRadius), s) || this.consumePeeked("bottom-") && (s = Kt("bottom", this.rest, this.isNegative, o == null ? void 0 : o.inset), s) || this.consumePeeked("top-") && (s = Kt("top", this.rest, this.isNegative, o == null ? void 0 : o.inset), s) || this.consumePeeked("left-") && (s = Kt("left", this.rest, this.isNegative, o == null ? void 0 : o.inset), s) || this.consumePeeked("right-") && (s = Kt("right", this.rest, this.isNegative, o == null ? void 0 : o.inset), s) || this.consumePeeked("inset-") && (s = Kt("inset", this.rest, this.isNegative, o == null ? void 0 : o.inset), s) || this.consumePeeked("flex-") && (this.consumePeeked("grow") ? s = Jr("Grow", this.rest, o == null ? void 0 : o.flexGrow) : this.consumePeeked("shrink") ? s = Jr("Shrink", this.rest, o == null ? void 0 : o.flexShrink) : s = tl(this.rest, o == null ? void 0 : o.flex), s) || this.consumePeeked("grow") && (s = Jr("Grow", this.rest, o == null ? void 0 : o.flexGrow), s) || this.consumePeeked("shrink") && (s = Jr("Shrink", this.rest, o == null ? void 0 : o.flexShrink), s) || this.consumePeeked("shadow-color-opacity-") && (s = _r("shadow", this.rest), s) || this.consumePeeked("shadow-opacity-") && (s = il(this.rest), s) || this.consumePeeked("shadow-offset-") && (s = ol(this.rest), s) || this.consumePeeked("shadow-radius-") && (s = de("shadowRadius", this.rest), s) || this.consumePeeked("shadow-") && (s = yt("shadow", this.rest, o == null ? void 0 : o.colors), s)) return s;
    if (this.consumePeeked("elevation-")) {
      let a = parseInt(this.rest, 10);
      if (!Number.isNaN(a)) return S2({ elevation: a });
    }
    if (this.consumePeeked("opacity-") && (s = nl(this.rest, o == null ? void 0 : o.opacity), s) || this.consumePeeked("tracking-") && (s = rl(this.rest, this.isNegative, o == null ? void 0 : o.letterSpacing), s)) return s;
    if (this.consumePeeked("z-")) {
      let a = Number((i2 = (n = o == null ? void 0 : o.zIndex) === null || n === void 0 ? void 0 : n[this.rest]) !== null && i2 !== void 0 ? i2 : this.rest);
      if (!Number.isNaN(a)) return S2({ zIndex: a });
    }
    return te(`\`${this.rest}\` unknown or invalid utility`), null;
  }
  handlePossibleArbitraryBreakpointPrefix(e) {
    var t;
    if (e[0] !== "m") return false;
    let r = e.match(/^(min|max)-(w|h)-\[([^\]]+)\]$/);
    if (!r) return false;
    if (!(!((t = this.context.device) === null || t === void 0) && t.windowDimensions)) return this.isNull = true, true;
    let n = this.context.device.windowDimensions, [, i2 = "", o = "", s = ""] = r, a = o === "w" ? n.width : n.height, g2 = JA(s, this.context);
    if (g2 === null) return this.isNull = true, true;
    let [u2, I] = g2;
    return I !== "px" && (this.isNull = true), (i2 === "min" ? a >= u2 : a <= u2) ? this.incrementOrder() : this.isNull = true, true;
  }
  advance(e = 1) {
    this.position += e, this.char = this.string[this.position];
  }
  get rest() {
    return this.peekSlice(0, this.string.length);
  }
  peekSlice(e, t) {
    return this.string.slice(this.position + e, this.position + t);
  }
  consumePeeked(e) {
    return this.peekSlice(0, e.length) === e ? (this.advance(e.length), true) : false;
  }
  parseIsNegative() {
    this.char === "-" && (this.advance(), this.isNegative = true, this.context.isNegative = true);
  }
  incrementOrder() {
    var e;
    this.order = ((e = this.order) !== null && e !== void 0 ? e : 0) + 1;
  }
};
function sl(A) {
  let e = [], t = null;
  return A.forEach((r) => {
    if (typeof r == "string") e = [...e, ...Fs(r)];
    else if (Array.isArray(r)) e = [...e, ...r.flatMap(Fs)];
    else if (typeof r == "object" && r !== null) for (let [n, i2] of Object.entries(r)) typeof i2 == "boolean" ? e = [...e, ...i2 ? Fs(n) : []] : t ? t[n] = i2 : t = { [n]: i2 };
  }), [e.filter(Boolean).filter(Sp), t];
}
function Fs(A) {
  return A.trim().split(/\s+/);
}
function Sp(A, e, t) {
  return t.indexOf(A) === e;
}
function al(A) {
  var e;
  return (e = A == null ? void 0 : A.reduce((t, r) => ({ ...t, ...xp(r.handler) }), {})) !== null && e !== void 0 ? e : {};
}
function xp(A) {
  let e = {};
  return A({ addUtilities: (t) => {
    e = t;
  }, ...kp }), e;
}
function Ge(A) {
  throw new Error(`tailwindcss plugin function argument object prop "${A}" not implemented`);
}
var kp = { addComponents: Ge, addBase: Ge, addVariant: Ge, e: Ge, prefix: Ge, theme: Ge, variants: Ge, config: Ge, corePlugins: Ge, matchUtilities: Ge, postcss: null };
function ul(A, e) {
  let t = (0, gl.default)(vp(A)), r = {}, n = al(t.plugins), i2 = {}, o = Object.entries(n).map(([E, C]) => typeof C == "string" ? (i2[E] = C, [E, { kind: "null" }]) : [E, S2(C)]).filter(([, E]) => E.kind !== "null");
  function s() {
    return [r.windowDimensions ? `w${r.windowDimensions.width}` : false, r.windowDimensions ? `h${r.windowDimensions.height}` : false, r.fontScale ? `fs${r.fontScale}` : false, r.colorScheme === "dark" ? "dark" : false, r.pixelDensity === 2 ? "retina" : false].filter(Boolean).join("--") || "default";
  }
  let a = s(), g2 = {};
  function u2() {
    let E = g2[a];
    if (E) return E;
    let C = new Pr(o);
    return g2[a] = C, C;
  }
  function I(...E) {
    let C = u2(), p = {}, m2 = [], x3 = [], [w2, b] = sl(E), D = w2.join(" "), h2 = C.getStyle(D);
    if (h2) return { ...h2, ...b || {} };
    for (let v2 of w2) {
      let F = C.getIr(v2);
      if (!F && v2 in i2) {
        let _ = I(i2[v2]);
        C.setIr(v2, S2(_)), p = { ...p, ..._ };
        continue;
      }
      switch (F = new Wt(v2, t, C, r, e).parse(), F.kind) {
        case "complete":
          p = { ...p, ...F.style }, C.setIr(v2, F);
          break;
        case "dependent":
          m2.push(F);
          break;
        case "ordered":
          x3.push(F);
          break;
        case "null":
          C.setIr(v2, F);
          break;
      }
    }
    if (x3.length > 0) {
      x3.sort((v2, F) => v2.order - F.order);
      for (let v2 of x3) switch (v2.styleIr.kind) {
        case "complete":
          p = { ...p, ...v2.styleIr.style };
          break;
        case "dependent":
          m2.push(v2.styleIr);
          break;
      }
    }
    if (m2.length > 0) {
      for (let v2 of m2) {
        let F = v2.complete(p);
        F && te(F);
      }
      zI(p);
    }
    return D !== "" && C.setStyle(D, p), b && (p = { ...p, ...b }), p;
  }
  function B(E) {
    let C = I(E.split(/\s+/g).map((p) => p.replace(/^(bg|text|border)-/, "")).map((p) => `bg-${p}`).join(" "));
    return typeof C.backgroundColor == "string" ? C.backgroundColor : void 0;
  }
  let f = (E, ...C) => {
    let p = "";
    return E.forEach((m2, x3) => {
      var w2;
      p += m2 + ((w2 = C[x3]) !== null && w2 !== void 0 ? w2 : "");
    }), I(p);
  };
  return f.style = I, f.color = B, f.prefixMatch = (...E) => {
    let C = E.sort().join(":"), p = u2(), m2 = p.getPrefixMatch(C);
    if (m2 !== void 0) return m2;
    let b = new Wt(`${C}:flex`, t, p, r, e).parse().kind !== "null";
    return p.setPrefixMatch(C, b), b;
  }, f.setWindowDimensions = (E) => {
    r.windowDimensions = E, a = s();
  }, f.setFontScale = (E) => {
    r.fontScale = E, a = s();
  }, f.setPixelDensity = (E) => {
    r.pixelDensity = E, a = s();
  }, f.setColorScheme = (E) => {
    r.colorScheme = E, a = s();
  }, f;
}
function vp(A) {
  return { ...A, content: ["_no_warnings_please"] };
}
var Fp = { handler: ({ addUtilities: A }) => {
  A({ "shadow-sm": { boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }, shadow: { boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" }, "shadow-md": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }, "shadow-lg": { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }, "shadow-xl": { boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }, "shadow-2xl": { boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }, "shadow-inner": { boxShadow: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)" }, "shadow-none": { boxShadow: "0 0 #0000" } });
} };
function Np(A) {
  return ul({ ...A, plugins: [...(A == null ? void 0 : A.plugins) ?? [], Fp] }, "web");
}
var jn;
function Ns({ width: A, height: e, config: t }) {
  return jn || (jn = Np(t)), jn.setWindowDimensions({ width: +A, height: +e }), jn;
}
var Ms = /* @__PURE__ */ new WeakMap();
var Il = /* @__PURE__ */ new WeakMap();
var Mp = 0;
var Lp = 8;
var Wr = /* @__PURE__ */ new Map();
function Gp(A) {
  let e = "";
  for (let t of A) {
    let r = Il.get(t.data);
    r === void 0 && (r = ++Mp, Il.set(t.data, r)), e += `${r}:${t.name}:${t.weight ?? ""}:${t.style ?? ""}:${t.lang ?? ""};`;
  }
  return e;
}
function Up(A) {
  if (Ms.has(A)) return Ms.get(A);
  let e = Gp(A), t = Wr.get(e);
  if (!t) {
    if (t = new gr(A), Wr.size >= Lp) {
      let r = Wr.keys().next().value;
      r !== void 0 && Wr.delete(r);
    }
    Wr.set(e, t);
  }
  return Ms.set(A, t), t;
}
var Hp = Tp;
var Op = Hp;
async function Tp(A, e, { replacedElements: t, projectPlane: r } = {}) {
  let [n] = await Promise.all([je(), Sg()]);
  if (!n || !n.Node) throw new Error("Satori is not initialized: expect `yoga` to be loaded, got " + n);
  e.fonts = e.fonts || [];
  let i2 = Up(e.fonts), o = "width" in e ? e.width : void 0, s = "height" in e ? e.height : void 0, a = Pp(n, e.pointScaleFactor);
  o && a.setWidth(o), s && a.setHeight(s), a.setFlexDirection(n.FLEX_DIRECTION_ROW), a.setFlexWrap(n.WRAP_WRAP), a.setAlignContent(n.ALIGN_AUTO), a.setAlignItems(n.ALIGN_FLEX_START), a.setJustifyContent(n.JUSTIFY_FLEX_START), a.setOverflow(n.OVERFLOW_HIDDEN);
  let g2 = Object.assign(/* @__PURE__ */ Object.create(null), e.graphemeImages), u2 = /* @__PURE__ */ new Set();
  Re.clear(), $t.clear(), await xa(A);
  let I = ar(A, { id: "id", parentStyle: {}, inheritedStyle: { fontSize: 16, fontWeight: "normal", fontFamily: "serif", fontStyle: "normal", lineHeight: "normal", color: "black", opacity: 1, whiteSpace: "normal", _viewportWidth: o, _viewportHeight: s }, parent: a, font: i2, embedFont: e.embedFont, debug: e.debug, graphemeImages: g2, canLoadAdditionalAssets: !!e.loadAdditionalAsset, onNodeDetected: e.onNodeDetected, replacedElements: t, projectPlane: r, getTwStyles: (p, m2) => {
    let w2 = { ...Ns({ width: o, height: s, config: e.tailwindConfig })([p]) };
    return typeof w2.lineHeight == "number" && (w2.lineHeight = w2.lineHeight / (+w2.fontSize || m2.fontSize || 16)), w2.shadowColor && w2.boxShadow && (w2.boxShadow = w2.boxShadow.replace(/rgba?\([^)]+\)/, w2.shadowColor)), w2;
  } }), B = (await I.next()).value;
  if (e.loadAdditionalAsset && B.length) {
    let p = _p(B), m2 = [], x3 = {};
    await Promise.all(Object.entries(p).flatMap(([w2, b]) => b.map((D) => {
      let h2 = `${w2}_${D}`;
      return u2.has(h2) ? null : (u2.add(h2), e.loadAdditionalAsset(w2, D).then((v2) => {
        typeof v2 == "string" ? x3[D] = v2 : v2 && (Array.isArray(v2) ? m2.push(...v2) : m2.push(v2));
      }));
    }))), i2.addFonts(m2), Object.assign(g2, x3);
  }
  await I.next(), a.calculateLayout(o, s, n.DIRECTION_LTR);
  let f = (await I.next([0, 0])).value, E = a.getComputedWidth(), C = a.getComputedHeight();
  return a.freeRecursive(), Wi({ width: E, height: C, content: f });
}
function Pp(A, e) {
  if (e) {
    let t = A.Config.create();
    return t.setPointScaleFactor(e), A.Node.createWithConfig(t);
  } else return A.Node.create();
}
function _p(A) {
  let e = {}, t = {};
  for (let { word: r, locale: n } of A) {
    let i2 = Dg(r, n).join("|");
    t[i2] = t[i2] || "", t[i2] += r;
  }
  return Object.keys(t).forEach((r) => {
    e[r] = e[r] || [], r === "emoji" ? e[r].push(...ll(_A(t[r], "grapheme"))) : (e[r][0] = e[r][0] || "", e[r][0] += ll(_A(t[r], "grapheme", r === "unknown" ? void 0 : r)).join(""));
  }), e;
}
function ll(A) {
  return Array.from(new Set(A));
}

// packages/api/dist/services/carousel-render.js
import { Resvg } from "@resvg/resvg-js";
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS_DIR = [
  join(__dirname, "..", "fonts"),
  join(process.cwd(), "packages", "api", "dist", "fonts"),
  join(process.cwd(), "packages", "api", "src", "fonts")
].find((d2) => existsSync(join(d2, "PermanentMarker-Regular.ttf"))) ?? join(__dirname, "..", "fonts");
var fontsCache = null;
function loadFonts() {
  if (fontsCache)
    return fontsCache;
  fontsCache = [
    {
      name: "Permanent Marker",
      data: readFileSync(join(FONTS_DIR, "PermanentMarker-Regular.ttf")),
      weight: 400,
      style: "normal"
    },
    {
      name: "Gochi Hand",
      data: readFileSync(join(FONTS_DIR, "GochiHand-Regular.ttf")),
      weight: 400,
      style: "normal"
    }
  ];
  return fontsCache;
}
var BLUE = "#1e3fae";
var PAPER = "#f5eeda";
function paperBackground() {
  return {
    backgroundColor: PAPER,
    backgroundImage: [
      // linhas pautadas
      "repeating-linear-gradient(transparent, transparent 63px, rgba(30,63,174,0.18) 63px, rgba(30,63,174,0.18) 65px)",
      // mancha de café (canto superior esquerdo)
      "radial-gradient(ellipse 220px 180px at 8% 6%, rgba(160,120,60,0.25), transparent 70%)",
      "radial-gradient(ellipse 120px 100px at 12% 10%, rgba(160,120,60,0.18), transparent 70%)",
      // mancha de café (canto inferior direito)
      "radial-gradient(ellipse 260px 200px at 92% 94%, rgba(160,120,60,0.22), transparent 70%)",
      // vinheta subtil
      "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 60%, rgba(120,90,40,0.12))"
    ].join(",")
  };
}
function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w2 of words) {
    const next = cur ? cur + " " + w2 : w2;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w2;
    } else {
      cur = next;
    }
  }
  if (cur)
    lines.push(cur);
  return lines;
}
function slideToElement(slide) {
  const { title, items = [], footer, handle, counter } = slide;
  const titleLines = wrapText(title.toUpperCase(), 12);
  const TITLE_Y = 200;
  const TITLE_FS = 88;
  const TITLE_LH = 140;
  const FOOTER_Y = 880;
  const ITEMS_TOP = TITLE_Y + titleLines.length * TITLE_LH + 24;
  const AVAIL_H = FOOTER_Y - 40 - ITEMS_TOP;
  let itemFs = 46;
  let itemLh = 64;
  let itemLines = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    itemLines = [];
    for (const item of items) {
      for (const line of wrapText(item, Math.floor(920 / (itemFs * 0.55))))
        itemLines.push(line);
      itemLines.push("");
    }
    const needH = itemLines.length * itemLh;
    if (needH <= AVAIL_H || attempt === 3)
      break;
    const scale = Math.max(0.7, AVAIL_H / needH);
    itemFs = Math.floor(itemFs * scale);
    itemLh = Math.floor(itemLh * scale);
  }
  const children = [
    // topo: handle + contador
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: "60px",
          left: "80px",
          right: "80px",
          display: "flex",
          justifyContent: "space-between"
        },
        children: [
          {
            type: "div",
            props: {
              style: { fontFamily: "Gochi Hand", fontSize: "44px", color: BLUE },
              children: handle || ""
            }
          },
          {
            type: "div",
            props: {
              style: {
                fontFamily: "Gochi Hand",
                fontSize: "40px",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.45)",
                borderRadius: "40px",
                padding: "8px 28px"
              },
              children: counter || ""
            }
          }
        ]
      }
    },
    // título (linhas absolutas, centradas)
    ...titleLines.map((line, i2) => ({
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: `${TITLE_Y + i2 * TITLE_LH}px`,
          left: "80px",
          right: "80px",
          textAlign: "center",
          fontFamily: "Permanent Marker",
          fontSize: `${TITLE_FS}px`,
          color: BLUE
        },
        children: line
      }
    })),
    // itens (linhas absolutas, com auto-fit)
    ...itemLines.map((line, i2) => ({
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: `${ITEMS_TOP + i2 * itemLh}px`,
          left: "80px",
          right: "80px",
          fontFamily: "Gochi Hand",
          fontSize: `${itemFs}px`,
          color: BLUE
        },
        children: line || " "
      }
    }))
  ];
  if (footer) {
    const footerLines = wrapText(footer.toUpperCase(), 26);
    footerLines.forEach((line, i2) => {
      children.push({
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: `${FOOTER_Y + i2 * 78}px`,
            left: "80px",
            right: "80px",
            textAlign: "center",
            fontFamily: "Permanent Marker",
            fontSize: "58px",
            color: BLUE,
            ...i2 === 0 ? { borderTop: `6px solid ${BLUE}`, paddingTop: "24px" } : {}
          },
          children: line
        }
      });
    });
  }
  return {
    type: "div",
    props: {
      style: {
        width: "1080px",
        height: "1080px",
        position: "relative",
        display: "flex",
        // exigido pelo satori p/ múltiplos filhos (filhos são absolutos)
        ...paperBackground()
      },
      children
    }
  };
}
async function renderSlide(slide) {
  const svg = await Op(slideToElement(slide), {
    width: 1080,
    height: 1080,
    fonts: loadFonts()
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 }
  });
  return Buffer.from(resvg.render().asPng());
}

// api-src/carousel/render.ts
async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "S\xF3 POST" });
  const { title, items, footer, handle, counter } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title \xE9 obrigat\xF3rio" });
  }
  try {
    const png = await renderSlide({
      title,
      items: Array.isArray(items) ? items : [],
      footer,
      handle: handle || "",
      counter: counter || ""
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", png.length);
    res.status(200).send(png);
  } catch (err2) {
    res.status(500).json({ error: err2.message });
  }
}
export {
  handler as default
};
/*! Bundled license information:

escape-html/index.js:
  (*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   *)

css-background-parser/index.js:
  (*!
   * https://github.com/gilmoreorless/css-background-parser
   * Copyright © 2015 Gilmore Davidson under the MIT license: http://gilmoreorless.mit-license.org/
   *)

parse-css-color/dist/index.cjs.js:
  (**
   * parse-css-color
   * @version v0.2.1
   * @link http://github.com/noeldelgado/parse-css-color/
   * @license MIT
   *)
*/
