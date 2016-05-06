/*global Ghetto*/

if (typeof Ghetto === 'undefined') {
    var Ghetto = {};
}

(function ($) {

    Ghetto.search = function (term) {
        $('section.genre-carousel').each(function () {
            $(this).find('.movie-panel').each((i, elem) => {
                var h3 = $(elem).find('h3')[0].innerText;


                if (h3.toLowerCase().indexOf(term) === -1) {
                    console.log(h3);
                    elem.hidden = true;
                }
            });
        });
    };

})(window.jQuery);
