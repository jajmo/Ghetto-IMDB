(function ($) {

    // TODO: We're going to need data-* attributes to prevent expanding/collapsing/etc all of
    // the buttons at once
    $('div').on('click', '.save-button', function (e) {
        var id = $(this).attr('data-id');
        $('#save-button-div-' + id).collapse('hide');
        $('#watched-buttons-' + id).collapse('show');
    });

    $('div').on('click', '.watched-btn', function (e) {
        var id = $(this).attr('data-id');
        var state = $(this).attr('data-state');

        var request = {
            url: "/api/user/watchMovie/" + id.substring(0, id.indexOf('_')),
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                state: state
            })
        };

        $.ajax(request).then(function (response) {
            if (!response.err) {
                $('#watched-buttons-' + id).collapse('hide');

                if (state == 2) {
                    $("#movie-panel-" + id).unbind('mouseleave mouseenter');
                    $('#rate-' + id).collapse('show');
                } else {
                    $('.save-button[data-id="' + id + '"]').attr('disabled', 'disabled');
                    $('#save-button-div-' + id).collapse('show');
                }
            } else {
                console.log(response.err);
            }
        });
    });

    $('.save-rating-btn').click(function (e) {
        var id = $(this).attr('data-id');
        var rating = parseInt($('#rating-' + id).val());

        if (rating) {
            var request = {
                url: "/api/movies/" + id.substring(0, id.indexOf('_')) + "/vote",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    rating: rating
                })
            };

            $.ajax(request).then(function (response) {
                resetButtons(id);
            });
        }
    });

    $('.cancel-rating-btn').click(function (e) {
        var id = $(this).attr('data-id');
        resetButtons(id);
    });

    function resetButtons (id) {
        // Reset buttons and re-attach event handler
        $('#rate-' + id).collapse('hide');
        $('.save-button[data-id="' + id + '"]').attr('disabled', 'disabled');
        $('#save-button-div-' + id).collapse('show');
        $("#movie-panel-" + id).bind('mouseenter', function () {
            $(this).find('.movie-panel-overlay').finish();
            $(this).find('.movie-panel-overlay').fadeIn(150);
        }).bind('mouseleave', function () {
            $(this).find('.movie-panel-overlay').fadeOut(150);
        });
    };

    $('h2').on('click', '.btn-collapse', function (e) {
        if (this.dataset.expanded === 'true') {
            $(this).animate({ rotateAmount: -90 }, {
                step: function (now, fx) {
                    console.log(now);
                    $(this).css('transform', 'rotate(' + now + 'deg)');
                },
                duration: 150
            });
            this.dataset.expanded = false;
        } else {
            $(this).animate({ rotateAmount: 0 }, {
                step: function (now, fx) {
                    console.log(now);
                    $(this).css('transform', 'rotate(' + now + 'deg)');
                },
                duration: 150
            });
            this.dataset.expanded = true;
        }
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


    // Display overlay when the user hovers over a movie panel
    $('.movie-panel').on('mouseenter', function () {
        $(this).find('.movie-panel-overlay').finish();
        $(this).find('.movie-panel-overlay').fadeIn(150);
    }).on('mouseleave', function () {
        $(this).find('.movie-panel-overlay').fadeOut(150);
    });


    // Why do I need to specify this hook? I'm not sure -- maybe because
    // bootstrap = dick
    $('.input-group').on('focus', '.form-control', function () {
        $(this).closest('.form-group, .input-group').addClass('focus');
    }).on('blur', '.form-control', function () {
        $(this).closest('.form-group, .input-group').removeClass('focus');
    });
})(window.jQuery);
