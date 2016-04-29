(function ($) {

    // TODO: We're going to need data-* attributes to prevent expanding/collapsing/etc all of
    // the buttons at once
    $('div').on('click', '#save-button', function (e) {
        var id = $(this).attr('data-id');
        $('#save-button-div-' + id).collapse('hide');
        $('#watched-buttons-' + id).collapse('show');
        return;
    });

    $('div').on('click', '.watched-btn', function (e) {
        var id = $(this).attr('data-id');

        $('#watched-buttons-' + id).collapse('hide');
        $('#save-button[data-id="' + id + '"]').attr('disabled', 'disabled');
        $('#save-button-div-' + id).collapse('show');
    });

    $('h2').on('click', '.btn-collapse', function (e) {
        var text = $(this).html() === 'Collapse' ? 'Expand' : 'Collapse';
        $(this).html(text);
    });

    // For every <li><a href=[path]></a></li>, if the path is equal to the current
    // browser location, give the anchor the 'active' class so it is properly
    // highlighted by bootstrap
    $('.navbar .navbar-nav li').each(function (_, li) {
        if (li.children instanceof HTMLCollection && li.children.length > 0) {
            $(li.children).each(function (_, child) {
                if (child.href === document.location.href.split('#')[0]) {
                    li.classList.add('active');
                }
            });
        }
    });

})(window.jQuery);
