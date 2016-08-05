$(function() {
  var draggableConfig = {
    revert: "invalid",
    opacity: 0.6,
    cursor: "pointer",
  };

  $('.server').draggable($.extend({}, draggableConfig, {revert: true}));
  $('.ubuntu, .win7, .neokylin').draggable($.extend({}, draggableConfig, {helper: 'clone'}));

  $('.central').droppable({
    hoverClass: 'drophover',
    tolerance: 'pointer',
    drop: function(event, ui ) {
      if(ui.draggable.hasClass('server')) {
        handleServerDrop(ui);
      } else {
        handleVMDrop(ui);
      }
    },
  });

  function handleServerDrop(ui) {
    var name = ui.draggable.attr('id');
    log('添加主机' + name + '.');
    //ui.draggable.remove();
    ui.draggable.hide();

    var newServer = $('#server-container-template').clone();
    newServer.attr('id', name)
    newServer.addClass('server-container')
    $('.central > ul').append(newServer);
    newServer.hide();
    newServer.fadeIn('slow');

    $('.central > ul #' + name + ' .vms').droppable({
      hoverClass: "drophover",
      tolerance: "pointer" ,
      greedy: true,
      accept: '.ubuntu, .win7, .neokylin',

      drop: function(event, ui ) {
        var vm = ui.draggable;
        if(vm.hasClass('running')) {
          vm.css('left', 0);
          vm.css('top', 0);
          vm.css('opacity', 1);
          $(this).find('ul').append(vm.parent('a'));

          vm.hide();
          vm.fadeIn(2000, blink);
          log('迁移虚拟机到'+ name + '...');

          vm.draggable(draggableConfig)
        }
        else {
          log('从模板创建虚拟机...');
          vm = vm.clone();
          vm.addClass('running');
          vm.draggable(draggableConfig);

          var href = vm.attr('data-url');
          useFancyBox($(this).find('ul'), href, vm)

          vm.hide();
          vm.fadeIn(2000, blink);
        }
      }
    });

    $('.central #' + name).hover(
      function(){
        $(this).find('.close').toggle();
      }
    );

    $('.central #' + name +' .close').click(function() {
      $('.central #' + name).fadeOut('slow', function(){
        $(this).remove();
        log('删除主机' + name + '.');
      });
      $('.left-1 #' + name).fadeIn('slow');
    });
  }

  function handleVMDrop(ui) {
    var small = -1;
    var id;
    $('.server-container').each(function() {
      var len = $(this).find('.card').length;
      if(small === -1 || len < small)  {
        small = len;
        id = $(this).attr('id');
      }
    });
    if (small === -1) {
      return;
    }
    log("虚拟机自动负载平衡到主机" + id);
    var vm = ui.draggable;
    if(vm.hasClass('running')) {
      vm.css('left', 0);
      vm.css('top', 0);
      vm.css('opacity', 1);
      $('#'+id+' .vms ul').append(vm.parent('a'));
    } else {
      vm = ui.draggable.clone();
      vm.addClass('running');
      var href = vm.attr('data-url');
      useFancyBox($('#'+id+' .vms ul'), href, vm);
    }
    vm.draggable(draggableConfig);
    vm.hide();
    vm.fadeIn(2000, blink);
  }

  function useFancyBox(e, href, vm) {
    e.append($('<a class="thumb" rel="fancybox" href="' + href + '"></a>').append(vm));
    $('.thumb').fancybox();
  }

  function log(str) {
    $('#monitorlog').append('<li>' + str + '</li>');
  }

  function blink() {
    $(this).animate({
      boxShadow: "0 0 18px 8px #FFF000",
    }, 800, "linear", function(){
      $(this).animate({ boxShadow:'none'},200);
      log("添加虚拟机完成");
    });
  }
});
