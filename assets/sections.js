(function ($, Drupal) {

  Drupal.behaviors.sections = {
    attach: function (context, settings) {
      $('textarea.sections-editor', context).each(function (index, item) {
        if ($(this).hasClass('sections-initiated')) {
          return;
        }
        $(this).addClass('sections-initiated');
        $(this).hide();

        var input = this;
        var editor = document.createElement('div');
        $(editor).insertAfter(this);
        editor.innerHTML = $(this).val();

        var currentCallback = null;

        var $updateButton = $('<button/>').attr('data-media-library-widget-update', $(this).attr('id'));
        var $updateValue = $('<input/>').attr('data-media-library-widget-value', $(this).attr('id'));

        $updateButton.insertAfter(this);
        $updateValue.insertAfter(this);

        $updateButton.hide();
        $updateValue.hide();

        $updateButton.mousedown(function (event) {
          event.preventDefault();
          if (currentCallback) {
            currentCallback($updateValue.val());
            currentCallback = null;
          }
        });

        SectionsEditor.create( editor , {
          rootTemplate: '_root',
          templates: drupalSettings.sections,

          mediaSelector: function (type, operation, callback) {
            ///admin/content/media-widget
            //   ?media_library_widget_id=field_media-
            //   &media_library_allowed_types%5Bimage%5D=image
            //   &media_library_allowed_types%5Bremote_video%5D=remote_video
            //   &media_library_allowed_types%5Bvideo%5D=video
            //   &media_library_remaining=1
            currentCallback = callback;
            var path = (operation === 'add') ? '/admin/content/media-widget-upload' : '/admin/content/media-widget';
            Drupal.ajax({
              url: path + '?media_library_widget_id=' + $(input).attr('id') + '&media_library_remaining=1',
              dialogType: 'modal',
              dialog: {
                dialogClass: 'media-library-widget-modal',
                heigh: '75%',
                width: '75%',
                title: 'Media library',
              }
            }).execute();

          },
          mediaRenderer: function (uuid, display, callback) {
            $.ajax('/sections/media-preview/' + uuid + '/' + display || 'default').done(callback);
          }
        })
        .then( editor => {
          editor.model.document.on('change', () => {
            $(input).val(editor.getData());
          });
        })
        .catch( err => {
          console.error( err.stack );
        });

      });
    }
  };
}(jQuery, Drupal));
