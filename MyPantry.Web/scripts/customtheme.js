$(function () {
    //#region resize
    // replaced by cc-sidebar
    //$(window).resize(function() {
    //    if ($(window).width() >= 765) {
    //        $(".sidebar .sidebar-inner").slideDown(350);
    //    } else {
    //        $(".sidebar .sidebar-inner").slideUp(350);
    //    }
    //});
    //#endregion

    //#region Unused - SubMenu
    //$("body").on('click', '.has_submenu > a', function(e) {
    //    e.preventDefault();
    //    var menu_li = $(this).parent("li");
    //    var menu_ul = $(this).next("ul");

    //    if (menu_li.hasClass("open")) {
    //        menu_ul.slideUp(350);
    //        menu_li.removeClass("open")
    //    } else {
    //        $(".navi > li > ul").slideUp(350);
    //        $(".navi > li").removeClass("open");
    //        menu_ul.slideDown(350);
    //        menu_li.addClass("open");
    //    }
    //});
    //#endregion

    //#region sidebar dropdown
    //replaced by cc-sidebar
    //$("body").on('click', '.sidebar-dropdown a', function(e) {
    //    e.preventDefault();

    //    if (!$(this).hasClass("dropy")) {
    //        // hide any open menus and remove all other classes
    //        $(".sidebar .sidebar-inner").slideUp(350);
    //        $(".sidebar-dropdown a").removeClass("dropy");

    //        // open our new menu and add the dropy class
    //        $(".sidebar .sidebar-inner").slideDown(350);
    //        $(this).addClass("dropy");
    //    } else if ($(this).hasClass("dropy")) {
    //        $(this).removeClass("dropy");
    //        $(".sidebar .sidebar-inner").slideUp(350);
    //    }
    //});
    //#endregion

    //#region Widget close
    //$('.wclose').click(function (e) {
    // replaced by data-cc-widget-close
    //$('body').on('click', '.widget .wclose', function(e) {
    //    e.preventDefault();
    //    var $wbox = $(this).parent().parent().parent();
    //    $wbox.hide(100);
    //});
    //#endregion

    //#region Widget minimize 
    // Replaced by data-cc-widget-minimize
    //$('body').on('click', '.widget .wminimize', function(e) {
    //    //$('.wminimize').click(function (e) {
    //    e.preventDefault();
    //    var $wcontent = $(this).parent().parent().next('.widget-content');
    //    if ($wcontent.is(':visible')) {
    //        $(this).children('i').removeClass('icon-chevron-up');
    //        $(this).children('i').addClass('icon-chevron-down');
    //    } else {
    //        $(this).children('i').removeClass('icon-chevron-down');
    //        $(this).children('i').addClass('icon-chevron-up');
    //    }
    //    $wcontent.toggle(500);
    //});
    //#endregion

    //#region Scroll to Top 
    // Replaced by data-cc-scroll-totop
    //$(".totop").hide();

    //$(window).scroll(function() {
    //    if ($(this).scrollTop() > 300) {
    //        $('.totop').slideDown();
    //    } else {
    //        $('.totop').slideUp();
    //    }
    //});

    //$('.totop a').click(function(e) {
    //    e.preventDefault();
    //    $('body,html').animate({ scrollTop: 0 }, 500);
    //});
    //#endregion

    //#region Unused - Notification box 
    //$('.slide-box-head').click(function() {
    //    var $slidebtn = $(this);
    //    var $slidebox = $(this).parent().parent();
    //    if ($slidebox.css('right') == "-252px") {
    //        $slidebox.animate({
    //            right: 0
    //        }, 500);
    //        $slidebtn.children("i").removeClass().addClass("icon-chevron-right");
    //    } else {
    //        $slidebox.animate({
    //            right: -252
    //        }, 500);
    //        $slidebtn.children("i").removeClass().addClass("icon-chevron-left");
    //    }
    //});
    //#endregion
});