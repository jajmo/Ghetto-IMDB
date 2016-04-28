(function ($) {

    // TODO: We're going to need data-* attributes to prevent expanding/collapsing/etc all of
    // the buttons at once
    $("#save-button").click(function (e) {
        $("#save-button-div").collapse("hide");
        $("#watched-buttons").collapse("show");
        return;
    });

    $(".watched-btn").click(function (e) {
        $("#watched-buttons").collapse("hide");
        $("#save-button").attr("disabled", "disabled");
        $("#save-button-div").collapse("show");
    });

})(window.jQuery);
