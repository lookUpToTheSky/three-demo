$.sidebarMenu = function(menu) {
  var currentHref = $('#iframe').attr('src');
  var animationSpeed = 300,
    subMenuSelector = '.sidebar-submenu',
    firstButNoChild = '.noNext';
  $(menu).on('click', 'li a', function(e) {
    var $this = $(this);
    var checkElement = $this.next();
    if (checkElement.is(subMenuSelector) && checkElement.is(':visible')) {
      $('.lowMark').css('transform', 'rotateZ(0deg)');
        $this.children().eq(2).css('transform', 'rotateZ(0deg)');
        checkElement.slideUp(animationSpeed, function() {
        checkElement.removeClass('menu-open');
      });
      checkElement.parent("li").removeClass("active");
    }else if ((checkElement.is(subMenuSelector)) && (!checkElement.is(':visible'))) {
      $('.lowMark').css('transform', 'rotateZ(0deg)');
      $this.children().eq(2).css('transform', 'rotateZ(-90deg)');
      var parent = $this.parents('ul').first();
      var ul = parent.find('ul:visible').slideUp(animationSpeed);
      ul.removeClass('menu-open');
      var parent_li = $this.parent("li");
      checkElement.slideDown(animationSpeed, function() {
        checkElement.addClass('menu-open');
        parent.find('li.active').removeClass('active');
        parent_li.addClass('active');
      });
    }else if($this.is(firstButNoChild)){
        let href = event.target.dataset.href || event.target.parentElement.dataset.href;
        if(currentHref !== href) {
          $('#iframe').attr('src', href);
          currentHref = href;
        }
        if($('body').eq(0).width() <= 990) {
          $('#navLeft .animate-menu').eq(0).css('top', '-100vh');
        }
        $('.lowMark').css('transform', 'rotateZ(0deg)');
        var parent_li = $this.parent("li");
        parent_li.addClass('active');
        $this.eq(0).addClass('active');
        var parent = $this.parents('ul').first();
        var ul = parent.find('ul:visible').slideUp(animationSpeed);
        ul.removeClass('menu-open');
        checkElement.addClass('menu-open');	
        parent.find('li.active').removeClass('active');
        parent_li.addClass('active');
    }else{
        let href = event.target.dataset.href;
        if(currentHref !== href) {
          $('#iframe').attr('src', href);
          currentHref = href;
        }
        if($('body').eq(0).width() <= 990) {
          $('#navLeft .animate-menu').eq(0).css('top', '-100vh');
        }
        var parent = $this.parents('ul').first();
        var parent_li = $this.parent("li");
        var ul = parent.find('ul:visible').slideUp(animationSpeed);
        ul.removeClass('menu-open');
        checkElement.addClass('menu-open');	
        parent.find('li.active').removeClass('active');
        parent_li.addClass('active');
    }
    if (checkElement.is(subMenuSelector)) {
      e.preventDefault();
    }
  });
}
window.onload = () => {
  $.sidebarMenu($('#navLeft'));
  $('.menuBtn').eq(0).on('click',  () => {
      let top = parseInt($('#navLeft .animate-menu').eq(0).css('top'));
      if(top === 0) {
          $('#navLeft .animate-menu').eq(0).css('top', '-100vh');
      }else{
          $('#navLeft .animate-menu').eq(0).css('top', '0px');
          $('#navLeft .animate-menu ul').eq(0).css('width', '100vw');
      }
  })
  $(window).resize(() => {
      if($('body').eq(0).width() <= 990) {
          $('#navLeft .animate-menu').eq(0).css('top', '-100vh');
      }else{
          $('#navLeft .animate-menu').eq(0).css('top', '0px');
          $('#navLeft .animate-menu ul').eq(0).css('width', '262px');
      }
  })
}