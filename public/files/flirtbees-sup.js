$(document).ready(function () {
    function detectmob() {
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
            document.getElementById("main--content").classList.add('mobile');
            var $h = $('h2');
            $h.addClass('open-text');
            $h.wrap('<div class="togle--over"></div>');
            $('h2').after('<div class="fullbody hidden"></div>');
            $('.togle--over').addClass(function (i, old) {
                $(this).removeClass(old);
                i++;
                return 'togle--over togle--over-' + i;
            });
            $('.togle--over').each(function (index) {
                $(".togle--over-" + index).nextUntil(".togle--over-" + (index + 1)).appendTo($('.togle--over-' + index + ' ' + '.fullbody'));
            });
            var lastlength = $('.togle--over').length;
            $(".togle--over-" + lastlength).nextAll('p', 'ul').appendTo($('.togle--over-' + lastlength + ' ' + '.fullbody'));
        }
        else {
            document.getElementById("main--content").classList.add('desktop');
        }
    }

    detectmob();
    $(".mobile .open-text").on("click", function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass("active");
            $(this).siblings('.fullbody').slideUp(400);
            $(this).removeClass("icon-less").addClass("icon-more");
        } else {
            $(".open-text").removeClass("icon-less").addClass("icon-more");
            $(this).removeClass("icon-more").addClass("icon-less");
            $(".open-text").removeClass("active");
            $(this).addClass("active");
            $('.fullbody').slideUp(400);
            $(this).siblings('.fullbody').slideDown(400);
        }
    });
});