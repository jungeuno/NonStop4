window.TrackJS &&TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});
$(document).ready(function() {
    $().ready(function() {
        $navbar = $('.navbar');
        $main_panel = $('.main-panel');

        $full_page = $('.full-page');

        white_color = false;

        window_width = $(window).width();

        fixed_plugin_open = $('.nav li.active a p').html();

        // we simulate the window Resize so the charts will get updated in realtime.
        var simulateWindowResize = setInterval(function() {
            window.dispatchEvent(new Event('resize'));
        }, 180);

        // we stop the simulation of Window Resize after the animations are completed
        setTimeout(function() {
        clearInterval(simulateWindowResize);
        }, 1000);
    });

    $('.switch-change-color input').on("switchChange.bootstrapSwitch", function() {
        var $btn = $(this);

        if (white_color == true) {

            $('body').addClass('change-background');
            setTimeout(function() {
                $('body').removeClass('change-background');
                $('body').removeClass('white-content');
            }, 900);
            white_color = false;
        } else {

            $('body').addClass('change-background');
            setTimeout(function() {
                $('body').removeClass('change-background');
                $('body').addClass('white-content');
            }, 900);

            white_color = true;
        }
    });

    $('.light-badge').click(function() {
        $('body').addClass('white-content');
    });

    $('.dark-badge').click(function() {
        $('body').removeClass('white-content');
    });
});