(function ($, window, document, undefined) {
    var pluginName = "Calendarium",
        defaults = {
            locations: [54.690669, 25.268196],  // Lat-Lng position to center the map on
            zoom : 12,                          // Maps zoom ( 1 <= zoom <= 16 )
            sliderFx: 'fade',			        // Slider effect. Can be 'slide' or 'fade'
            sliderInterval: 8000,		        // Interval between image change. Set 0 to disable auto slideshow
            sliderSpeed: 500,			        // Speed of the slider effect in milliseconds
            panoramaDirection: 'left',          // Can be 'left' or 'right'
            panoramaSpeed: 60,                  // The higher the value, the slower the animation
            countdownTo: '2014/12/28',	        // Change this in the format: 'YYYY/MM/DD'
            speedAnimation: 600,                // Default speed of the all animation
            infoBoxName: 'Aisconverse',         // Write the actual name in InfoBox
            infoBoxDescription: 'J. Savickio str. 4<br>' +
                                'Vilnius, LT-01108<br>' +
                                'Lithuania ',   // write the actual address in Infobox
            infoBoxUrl: 'http://aisconverse.com/',      // write the actual url in InfoBox
            infoBoxUrlText: 'Aisconverse.com',      // write the url text
			successText: 'Thanks. You have successfully subscribed. Please check email to confirm.', // text after successful subscribing
			errorText: 'Please, enter a valid email', // text, if email is invalid
            loop: true,                             // True or false loops the movie once ended.
            startAt: 0,                             // Set the seconds the video should start at.
            autoPlay: true,                         // True or false play the video once ready.
            showControls: false,                    // Show or hide the controls bar at the bottom of the page.
            addRaster: true,                       // Show or hide the background pattern image
            videoURL: 'http://youtu.be/fB78x9P58kM',// background video URL
            mute: true                              // video sound
        },
        WIN = $(window);

    // The plugin constructor
    function Plugin(element, options) {
        var that = this;
        that.element = $(element);
        that.options = $.extend({}, defaults, options);

        that.init();
        that.ytVideo();

        WIN.load(function(){    // onLoad function
            that.body.removeClass('loading');
            that.activate();
            that.mainHeight();
        }).resize(function(){   // onResize function
            that.mainHeight();
            that.countTeam();
            that.contactmap.height(WIN.height());
        });

    }

    Plugin.prototype = {
        init: function () {
            this.body = $(document.body);
            this.wrapper = $('#wrap');
            this.header = $('#header');
            this.slider = $('#slides');
            this.timer = $('#countdown');
            this.content = $('#content');
            this.footer = $('#footer');
            this.newsletter = $('#feedback-form form');
            this.menu = $('#menu');
            this.calendar = $('.calendar');
            this.classContent = $('.content');
            this.contact = $('#contact');
            this.contactmap = this.contact.find('#contact-map');
            this.team = $('#team');
            this.teamlist = this.team.find('.team-list');
            this.panorama = $('#panorama');
            this.innerLink = $('.inner-link');
            this.ytvid = $('#ytvideo');

            this.body.addClass('loading');
        },
        activate: function () {
            var instance = this;

            // menu
            if (instance.menu.length === 1){
                instance.menu.find('> a').on('click', function(e){
                    var self = $(this);

                    self.toggleClass('open');
                    self.next('ul').stop(true,true)
                        .slideToggle(instance.options.speedAnimation/2);

                    e.preventDefault();
                });

                instance.menu.find('ul li a').on('click', function(e){
                    var self = $(this),
                        content = self.attr('href');

                    if (self.attr('title') == 'Help') { return true; }

                    else if ( content.replace('#','') !== instance.classContent.filter(':visible').attr('id')){
                        $('.content:visible').fadeOut(instance.options.speedAnimation/2);

                        if (content == '#team'){
                            $(content).delay(instance.options.speedAnimation/2).fadeIn(instance.options.speedAnimation/100, function(){
                                instance.countTeam();
                                $('#team').animate({opacity: 1}, instance.options.speedAnimation/2);
                            });

                        } else {
                            $(content).delay(instance.options.speedAnimation/2).fadeIn(instance.options.speedAnimation, function(){
                                if (content == '#contact' && instance.contactmap.children().length === 0)
                                    instance.mapFunction();
                            });
                        }

                        instance.menu.find('ul').slideUp(instance.options.speedAnimation/2);
                        instance.menu.find('> a').removeClass('open');
                    }

                    return false;
                });
            }

            if (instance.innerLink.length > 0){
                instance.innerLink.on('click', function(e){
                    var self = $(this),
                        content = self.attr('href');

                    if ( content.replace('#','') !== instance.classContent.filter(':visible').attr('id')){
                        $('.content:visible').fadeOut(instance.options.speedAnimation/2);

                        $(content).delay(instance.options.speedAnimation/2).fadeIn(instance.options.speedAnimation, function(){
                            if (content == '#contact' && instance.contactmap.children().length === 0)
                                instance.mapFunction();

                            if (content == '#team')
                                instance.countTeam();
                        });
                    }

                    e.preventDefault();
                });
            }

            // Activate the slider
            if (instance.slider.length === 1) {
                instance.slider.superslides({
                    animation: instance.options.sliderFx,
                    play: instance.options.sliderInterval,
                    animation_speed: instance.options.sliderSpeed
                });
            }

            // Run the countdown
            if (instance.calendar.length >= 1){
                instance.calendar.append('<ins/><span/><em/><i/>');

                var cDown = instance.options.countdownTo.split('/'),
                    monthArray = ['january', 'february', 'march', 'april',' may', 'june'
                        , 'july', 'august', 'september', 'october', 'november', 'december'],
                    cDay= instance.calendar.find('ins').text(cDown[2]),
                    cMonth = instance.calendar.find('span').text(monthArray[Number(cDown[1]) - 1]),
                    cYear = instance.calendar.find('em').text(cDown[0]);
            }

            if (instance.timer.length >= 1) {
                instance.timer.countdown(instance.options.countdownTo, function (event) {
                    $(this).html(event.strftime(
                        '<div><span>%D</span> <ins>day%!D</ins></div>' + '<div><span>%H<i>:</i></span><ins class="cd1">hour%!D</ins></div>' + '<div><span>%M<i>:</i></span><ins class="cd2">minute%!D</ins></div>' + '<div><span class="csec">%S</span><ins class="cd3">second%!D</ins></div>'));
                });
            }

            // Activate the subscribe form
            if(this.newsletter.length === 1) {
                this.newsletter.find('input[type=email]').on('keyup', function(){
                    var sucBlock = $('.success-block p');
                    if (sucBlock.is(':visible'))
                        sucBlock.css('display','none');
                });

                this.newsletter.validatr({
                    showall: true,
                    location: 'top',
                    template: '<div class="error-email">'+instance.options.errorText+'</div>',
                    valid: function(){
                        var form = instance.newsletter,
                            loader = form.find('.form-loader'),
                            msgwrap = form.prev(),
                            url = form.attr('action'),
                            email = form.find('input[type=email]'),
                            data = form.serialize();

                        url = url.replace('/post?', '/post-json?').concat('&c=?');

                        var data = {};
                        var dataArray = form.serializeArray();

                        $.each(dataArray, function (index, item) {
                            data[item.name] = item.value;
                        });

                        $.ajax({
                            url: url,
                            data: data,
                            success: function(resp){
                                var successText = instance.options.successText;
                                function notHide(){
                                    form.attr('style',' ');
                                }

                                if(resp.result === 'success') {
                                    msgwrap.html('<p class="success">'+successText+'</p>');
                                    setTimeout(notHide, 0);
                                }
                                else {
                                    setTimeout(notHide, 0);
                                    var index = -1;
                                    var msg;
                                    try {
                                        var parts = resp.msg.split(' - ', 2);
                                        if (parts[1] === undefined) {
                                            msg = resp.msg;
                                        } else {
                                            var i = parseInt(parts[0], 10);
                                            if (i.toString() === parts[0]) {
                                                index = parts[0];
                                                msg = parts[1];
                                            } else {
                                                index = -1;
                                                msg = resp.msg;
                                            }
                                        }
                                    }
                                    catch (e) {
                                        index = -1;
                                        msg = resp.msg;
                                    }
                                    msgwrap.html('<p class="error">' + msg + '</p>');
                                }
                                loader.fadeOut();
                                form.slideUp(function () {
                                    msgwrap.slideDown();
                                });
                            },
                            dataType: 'jsonp',
                            error: function (resp, text) {
                                alert('Oops! AJAX error: ' + text);
                            }
                        });
                        return false;
                    }
                });
            }

            // Run the panorama
            if (instance.panorama.length === 1){
                instance.panorama.css({
                    'width': WIN.width(),
                    'height': WIN.height
                }).panoScroll({
                        direction: instance.options.panoramaDirection,
                        scrollSpeed: instance.options.panoramaSpeed
                  });
            }

        },
        countTeam: function(){

            var instance = this;
            if (instance.teamlist.length > 0){
                var teamLength = instance.teamlist.children().filter(':visible').length,
                    teamChildWidth = instance.teamlist.children().width(),
                    winWidth = WIN.width();

                if ( teamLength === 3 && winWidth >= 690 )
                    instance.teamlist.width(teamChildWidth*teamLength);
                if ( teamLength === 3 && winWidth < 690 )
                    instance.teamlist.width(teamChildWidth);
                if ( teamLength === 2 || teamLength === 1 )
                    instance.teamlist.width(teamChildWidth);

                if ( winWidth > 1300){
                    $(instance.teamlist).removeAttr('style');
                    $(instance.teamlist).children().removeAttr('style');
                    if (instance.teamlist.find('.calendar').length === 1 && instance.teamlist.find('.calendar').is(':visible')){
                        $(instance.teamlist).children().filter(':nth-child(3n+2)').css('marginLeft', '230px');
                        $(instance.teamlist).children().filter(':nth-child(2)').css('marginLeft', 0);
                    } else {
                        $(instance.teamlist).children().css('marginLeft', 0);
                    }
                }
                else if ( winWidth <= 1300 && winWidth >= 690 && teamLength > 3 ){
                    $(instance.teamlist).removeAttr('style');
                    $(instance.teamlist).children().removeAttr('style');
                    if (instance.teamlist.find('.calendar').length === 1 && instance.teamlist.find('.calendar').is(':visible')){
                        $(instance.teamlist).width(690);
                        $(instance.teamlist).children().filter(':nth-child(3n+2)').css('marginLeft', '230px');
                        $(instance.teamlist).children().filter(':nth-child(3n+3)').css('marginLeft', '-460px');
                        $(instance.teamlist).children().filter(':nth-child(1)').css('marginLeft', '230px');
                        $(instance.teamlist).children().filter(':nth-child(2)').css({'marginLeft': '0', 'clear': 'left'});
                        $(instance.teamlist).children().filter(':nth-child(3)').css({'marginLeft': '0'});

                    } else {
                        $(instance.teamlist).width(690);
                        $(instance.teamlist).children().removeAttr('style');
                        $(instance.teamlist).children().filter(':nth-child(3n+3)').css('marginLeft', '230px');
                        $(instance.teamlist).children().filter(':nth-child(3n+4)').css('marginLeft', '-460px');
                        $(instance.teamlist).children().filter(':nth-child(2)').css('marginLeft', '230px');
                        $(instance.teamlist).children().filter(':nth-child(3)').css({'marginLeft': '0', 'clear': 'left'});
                        $(instance.teamlist).children().filter(':nth-child(4)').css({'marginLeft': '0'});
                    }
                } else {
                    $(instance.teamlist).removeAttr('style');
                    $(instance.teamlist).children().removeAttr('style');
                }
            }
        },
        ytVideo: function(){
            var instance = this,
                onMobile = false,
                full = instance.ytvid.find(".fullscreen-video");

            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
                onMobile = true;

            if( !onMobile && !instance.ytvid.hasClass('none') ) {
                full.mb_YTPlayer({
                    containment: instance.body,
                    loop: instance.options.loop,
                    startAt: instance.options.startAt,
                    autoPlay: instance.options.autoPlay,
                    showControls: instance.options.showControls,
                    addRaster: instance.options.addRaster,
                    videoURL: instance.options.videoURL,
                    mute: instance.options.mute
                });
                full.on("YTPStart",function(){
                    instance.slider.hide();
                    instance.panorama.hide();
                });

            } else {
                instance.ytvid.hide();
            }
        },
        mapFunction: function(){
            var instance = this;
            var map;
            var x = instance.options.locations[0];
            var y = instance.options.locations[1];
            var winWidth = WIN.width();

			if (instance.contactmap.length === 1) {
			
				var myOptions = {
					zoom: instance.options.zoom,
					scrollwheel: true,
					navigationControl: false,
					mapTypeControl: false,
					scaleControl: true,
					draggable: true,
                    disableDefaultUI: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
					center: new google.maps.LatLng(x, y)
				};

				map = new google.maps.Map(document.getElementById('contact-map'),   myOptions);

                instance.contactmap.height(WIN.height());

                instance.body.append('<div class="mmarker"/>');
                instance.body.append('<div class="mmarker-h"/>');

                var bi1 = $('.mmarker').css('background-image');
                var bi2 = $('.mmarker-h').css('background-image');

                var icon1 = 'images'+bi1.split('/images')[1].split('.png')[0]+'.png';
                var icon2 = 'images'+bi2.split('/images')[1].split('.png')[0]+'.png';
                var icon3 = "images/mapmarker-t.png";

                if ( winWidth > 480 ){
                    var marker = new google.maps.Marker({
                        position: map.getCenter(),
                        map: map,
                        icon: new google.maps.MarkerImage(
                            icon3,
                            new google.maps.Size(1, 1))
                    });
                } else {
                    var marker = new google.maps.Marker({
                        position: map.getCenter(),
                        map: map,
                        icon: new google.maps.MarkerImage(
                            icon1,
                            new google.maps.Size(38, 56))
                    });
                }

				var boxText = document.createElement("div");
				boxText.innerHTML = "<span class='mapbox-close'></span>" +
                    "<div class='ib-inner'>" +
					"<div class='calendar'></div>" +
                    "<article><p>" +
					"<strong>"+instance.options.infoBoxName+"</strong>" +
                    instance.options.infoBoxDescription+"</p>" +
					"<a href='"+instance.options.infoBoxUrl+"' target='_blank'>"+instance.options.infoBoxUrlText+"</a>" +
					"</article>" +
					"</div>";

				var myOptions1 = {
					content: boxText,
					disableAutoPan: false,
					pixelOffset: new google.maps.Size(6, -21),
					boxClass: 'map-box',
					alignBottom: true,
					closeBoxURL: "images/1px.gif",
					pane: "floatPane"
				};

				var ib = new InfoBox(myOptions1);

                if ( winWidth > 480 )
				    ib.open(map, marker);

                var mapbox = $('.mapbox');

                function mapBoxLength(){
                    var mapboxLength = mapbox.length;

                    if (mapboxLength === 0){
                        google.maps.event.addListener(marker, 'mouseover', function() {
                            if ($('.map-box').length === 0){
                                marker.setIcon(new google.maps.MarkerImage(
                                    icon2,
                                    new google.maps.Size(38, 56)));
                            }
                        });
                        google.maps.event.addListener(marker, 'mouseout', function() {
                            if ($('.map-box').length === 0){
                                marker.setIcon(new google.maps.MarkerImage(
                                icon1,
                                new google.maps.Size(38, 56)));
                            }
                        });
                    } else {
                        marker.setIcon(new google.maps.MarkerImage(
                            icon3,
                            new google.maps.Size(38, 56)));
                    }
                }

                google.maps.event.addListener(marker, "click", function() {
                    ib.open(map, marker);
                    marker.setIcon(new google.maps.MarkerImage(
                        icon3,
                        new google.maps.Size(1, 1)));

                    setTimeout( mapBoxLength, 10);
                });

                google.maps.event.addListener(map, "idle", function() {
                   mapCal();

                    if ( winWidth <= 480 && mapbox.length === 0 )
                        setTimeout( mapBoxLength, 10);

                    $('.mapbox-close').on('click', function(){
                        marker.setIcon(new google.maps.MarkerImage(
                            icon1,
                            new google.maps.Size(38, 56)));
                        setTimeout( mapBoxLength, 10);

                        ib.close(map, marker);

                        return false;

                    })

                });

                function mapCal(){
                    if (instance.contact.find('.calendar').length === 1 && instance.contact.find('.calendar').children().length === 0){
                        instance.contact.find($('.calendar')).append('<ins/><span/><em/><i/>');
                        var cDown = instance.options.countdownTo.split('/'),
                            monthArray = ['january', 'february', 'march', 'april',' may', 'june'
                                , 'july', 'august', 'september', 'october', 'november', 'december'],
                            cDay= instance.contact.find($('.calendar ins')).text(cDown[2]),
                            cMonth = instance.contact.find($('.calendar span')).text(monthArray[Number(cDown[1]) - 1]),
                            cYear = instance.contact.find($('.calendar em')).text(cDown[0]);
                    }
                }

                var mclose = $('.mclose');

                mclose.on('click', function(e){
                    e.preventDefault();
                    var self = $(this);
                    self.parents('.content').fadeOut(instance.options.speedAnimation/2);
                    $('#home').delay(instance.options.speedAnimation/2).fadeIn(instance.options.speedAnimation/2);
                });
			}
        },
        mainHeight: function(height){
            var instance = this,
                winHeight = WIN.height(),
                headerHeight = instance.header.height();

            instance.wrapper.css('minHeight', winHeight - 70);
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);

(function ($) {
    $(document.body).Calendarium();

})(jQuery);