
const Ghetto = {};

(function ($) {

    /**
     * Sets up event listeners on forms specified as arguments to validate form
     * input upon submission. If an input value is null or empty, its parent
     * .form-group element will have the 'has-error' class assigned to it.
     *
     * @function validation
     * @param {String...} arguments Each argument will be used to select a form
     */
    Ghetto.validation = function () {
        $(Array.prototype.join.call(arguments, ',')).submit(function (e) {
            var canSubmit = true;
            var formObj   = {};

            e.preventDefault();

            $(this).find('input, textarea').each(function (i, elem) {
                if (elem.value == null || elem.value === '') {
                    $(elem).parent().addClass('has-error');
                    canSubmit = false;
                } else {
                    formObj[elem.name] = elem.value;
                }
            });

            if (canSubmit) {
                $.post('/post', formObj, function () {
                    location.reload();
                });
            }
        });
    };

    $(document).ready(function () {
        Ghetto.validation('form');
    });
})(window.jQuery);

