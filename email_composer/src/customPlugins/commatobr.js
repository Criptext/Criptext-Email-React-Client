/**
 *  Trumbowyg - A lightweight WYSIWYG editor
 *  Create a simple plugin (example)
 *  Select text and replace , to </br>
 *  ------------------------
 *  @author Julian Adams
 */
(function($) {
  $.extend(true, $.trumbowyg, {
    langs: {
      en: { commatobr: 'Comma(,) to <br/>' }
    },
    plugins: {
      commatobr: {
        ico: 'commatobr',
        init: function(trumbowyg) {
          const btnDef = {
            fn: function() {
              // Save a reference to the selection
              trumbowyg.saveRange();
              const range = trumbowyg.getRangeText();
              if (range.replace(/\s/g, '') !== '') {
                try {
                  // Trumbowyg automatically converts the <br> to <p>
                  const replacement = range.replace(/(,)/g, '<br />');
                  // Replace the referenced('saved') selection
                  trumbowyg.execCmd('insertHTML', replacement);
                } catch (e) {
                  // Do nothing
                }
              }
            }
          };

          trumbowyg.addBtnDef('commatobr', btnDef);
        }
      }
    }
  });
})(window.jQuery);
