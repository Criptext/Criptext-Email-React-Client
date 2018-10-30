export const Utf8Decode = strUtf => {
  if (!strUtf) {
    return '';
  }
  return String(strUtf)
    .replace(
      /[\u00f0-\u00f7][\u0080-\u00bf][\u0080-\u00bf][\u0080-\u00bf]/g,
      function(c) {
        var cc =
          ((c.charCodeAt(0) & 0x07) << 18) |
          ((c.charCodeAt(1) & 0x3f) << 12) |
          ((c.charCodeAt(2) & 0x3f) << 6) |
          (c.charCodeAt(3) & 0x3f);
        var tmp = cc - 0x10000;
        return String.fromCharCode(
          0xd800 + (tmp >> 10),
          0xdc00 + (tmp & 0x3ff)
        );
      }
    )
    .replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(c) {
      var cc =
        ((c.charCodeAt(0) & 0x0f) << 12) |
        ((c.charCodeAt(1) & 0x3f) << 6) |
        (c.charCodeAt(2) & 0x3f);
      return String.fromCharCode(cc);
    })
    .replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(c) {
      var cc = ((c.charCodeAt(0) & 0x1f) << 6) | (c.charCodeAt(1) & 0x3f);
      return String.fromCharCode(cc);
    });
};
