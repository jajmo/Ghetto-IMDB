/**
 * Defines an alert function which slides an alert box onto the screen
 *
 * @file alert.js
 */

var Ghetto;

if (!Ghetto) { Ghetto = {}; }

(function ($) {

    const validLabels = [
        'success',
        'info',
        'warning',
        'danger'
    ];

    const defaultOptions = {
        level         : 'success',
        timeout       : 3000,
        dismissible   : true,
        marginTop     : 20,
        marginBetween : 10

    };

    const alertQueue = [];


    function calculateHeight(marginTop, marginBetween, index, alert) {
        return marginTop + (index)*(alert.outerHeight() + marginBetween);
    }


    function push(alert) {
        var index = alertQueue.indexOf(null);

        index = (index === -1) ? (alertQueue.push(null) - 1) : index;
        alertQueue[index] = alert;

        return index;
    }


    function pop(alert) {
        alertQueue[alertQueue.indexOf(alert)] = null;
    }


    function showAlert(container, alert, opts) {
        alert.animate({
            top: calculateHeight(
                opts.marginTop,
                opts.marginBetween,
                push(alert),
                alert
            ) + 'px'
        }, 400, 'swing', function () {
            if (opts.timeout != null) {
                setTimeout(
                    hideAlert.bind(null, container, alert),
                    opts.timeout
                );
            }
        });
    }


    function hideAlert(container, alert) {
        pop(alert);
        alert.animate({top: '-100%'}, 400, 'swing', function () {
            container.remove();
        });
    }


    /**
     * Spawns an alert modal to inform the user with a message. Can be optionally
     * dismissed, and by default times out after 3 seconds.
     *
     * @function alert
     * @param {string} message Message to display on the alert
     * @param {string|object} opts If a string, used as the level of the alert
     *    (info, success, warning, error). If an object, all properties specified
     *    replace the corresponding default option
     * @param {string} [opts.level = 'success'] Alert level for the modal
     * @param {number} [opts.timeout = 3000] Number of milliseconds for which the
     *    alert will be displayed.
     *    NOTE: if this is `null`, the timeout will be infinite
     * @param {boolean} [opts.dismissible = true] Whether or not the alert can be
     *    dismissed manually via an 'x' (close) button
     */
    Ghetto.alert = function (message, opts) {
        var container = $('<div>').addClass('ghetto-alert-container')

            , alertElem = $('<div>')
                    .addClass('ghetto-alert alert')
                    .css({top: '-100%'})
                    .text(message)

            , options   = Object.create(defaultOptions);

        if (typeof opts === 'string') {
            if (validLabels.indexOf(opts) === -1) {
                throw new Error('Invalid level: ' + opts);
            }
            options.level = opts;
        } else if (opts instanceof Object) {
            Object.keys(opts).forEach(function (key) {
                if (key === 'level' && validLabels.indexOf(opts[key]) === -1) {
                    throw new Error('Invalid level: ' + opts[key]);
                }
                options[key] = opts[key];
            });
        }

        if (options.dismissible) {
            alertElem.append(
                $('<button>')
                    .addClass('close')
                    .append($('<span>').text('×'))
                    .click(hideAlert.bind(null, container, alertElem))
            );
        }

        alertElem.addClass('alert-' + options.level);

        container.append(alertElem);
        $(document.body).append(container);

        showAlert(container, alertElem, options);

        return alertElem;
    };

})(window.jQuery);
