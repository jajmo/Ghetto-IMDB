
var Ghetto;

if (!Ghetto) { Ghetto = {}; }

(function ($) {

    /**
     * Sets up an event listener on the form specified to validate form input upon
     * submission. If an input value is null or empty, or does not match its
     * matcher as specified in `matchers`, its parent `.form-group` element will
     * have the 'has-error' class assigned to it.
     *
     * @function addValidation
     * @param {String} selector The selector used to find the form element
     * @param {Object} matchers Mapping of form input names to regular expressions
     *    that will be used to validate each input
     * @param {String|RegExp} matchers[name] Regular expression used to validate
     *    the form input value whose attribute name=`name`
     */
    Ghetto.addValidation = function (selector, matchers) {
        var testers = {};

        if (matchers != null && matchers instanceof Object) {
            Object.keys(matchers).forEach(function (name) {
                testers[name] = new RegExp(matchers[name]);
            });
        }

        $(selector).submit(function (e) {
            var canSubmit = true;
            var formObj   = {};

            $(this).find('input, textarea').each(function (i, elem) {
                if (
                    elem.value == null  ||
                    elem.value === ''   ||
                    (testers[elem.name] && !testers[elem.name].test(elem.value))
                ) {
                    $(elem).parent().addClass('has-error');
                    canSubmit = false;
                } else {
                    $(elem).parent().removeClass('has-error');
                    formObj[elem.name] = elem.value;
                }
            });

            if (!canSubmit) {
                e.preventDefault();
            }
        });
    };

})(window.jQuery);

