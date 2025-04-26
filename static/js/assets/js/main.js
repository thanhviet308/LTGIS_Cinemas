// @ts-nocheck
/*-----------------------------------------------------------------------------------

    Template Name: Poco - Agency Bootstrap4 HTML5 Template
    Template URI: zakirsoft.com
    Description: Agency - Agency Bootstrap4 HTML5 Template
    Author: Templatecookie
    Author URI: zakirhossen.com
    Version: 1.0

-----------------------------------------------------------------------------------

    JS INDEX
    ===================

    01. Ui Variables	
    02. Search Field
    03. Hamburget Menu	
    04. Magnify popup	
    05. Slick Sliders
        . Branding
        . Branding-item
        . Banner Branding	
        . Testimonial
        . Testimonial-2
        . client Review
        . client Image
    06. Counter js
        . Skill Progressbar 	
   

-----------------------------------------------------------------------------------*/

(function ($) {
  'use strict';

  /*UI VARS*/
  let logo = document.querySelector('.logo-04');

  /*  Sticky Header*/
  window.addEventListener('scroll', function () {
    let header = document.querySelectorAll('header');

    header.forEach((headItem) => {
      headItem.classList.toggle('sticky', window.scrollY > 0);
    });
    // it's only for homepage-3
    // window.scrollY > 0
    //   ? logo.setAttribute('src', 'assets/img/logo/logo.png')
    //   : logo.setAttribute('src', 'assets/img/logo/logo04.png');
  });

  /* back to top button */
  var topBtn = $('#to-top');
  topBtn.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, '600');
  });

  /* search box open */
  $('.search-bar').on('click', function () {
    $('.search-box').addClass('search-open');
  });
  $('.search-close').on('click', function () {
    $('.search-box').removeClass('search-open');
  });

  /* humberger menu */
  function toggleSidebar() {
    $('header aside').toggleClass('active');
    $('.hamburger-menu').toggleClass('open');

    var sidebarOpen = $('header aside').hasClass('active');
    if (sidebarOpen) {
      disableScrolling();
    } else {
      enableScrolling();
    }
  }

  $('.hamburger-menu').on('click', function () {
    toggleSidebar();
  });

  $('.close-sidebar').on('click', function () {
    toggleSidebar();
  });

  $('aside .overlay').on('click', function () {
    toggleSidebar();
  });

  // aso js init

  AOS.init({
    duration: 1000,
    once: true,
  });


})(jQuery);

function enableScrolling() {
  throw new Error('Function not implemented.');
}

document.addEventListener('DOMContentLoaded', function () {
  // Lấy tất cả các menu cha
  const menuParents = document.querySelectorAll('.menu-parent');

  // Lấy tất cả các menu con
  const subMenuLinks = document.querySelectorAll('.sub-menu a');

  // Xử lý khi click vào menu cha
  menuParents.forEach(parent => {
    parent.addEventListener('click', function (e) {
      e.preventDefault();

      // Toggle class active cho menu cha
      this.classList.toggle('active');

      // Ngăn sự kiện click lan sang document
      e.stopPropagation();
    });
  });

  // Xử lý khi click vào menu con
  subMenuLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      // Quan trọng: KHÔNG ngăn sự kiện mặc định để cho phép chuyển trang
      // e.preventDefault(); 

      // Tìm menu cha gần nhất và thêm active
      const menuItem = this.closest('.menu-item');
      if (menuItem) {
        const parent = menuItem.querySelector('.menu-parent');
        if (parent) {
          parent.classList.add('active');
        }
      }

      // Ngăn lan sự kiện để tránh đóng menu ngay lập tức
      e.stopPropagation();
    });
  });

  // Đóng menu khi click bên ngoài
  document.addEventListener('click', function () {
    menuParents.forEach(parent => {
      parent.classList.remove('active');
    });
  });
});