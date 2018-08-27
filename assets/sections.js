(function ($, Drupal) {

  Drupal.behaviors.sections = {
    attach: function (context, settings) {
      $('input.sections-editor', context).each(function (index, item) {
        // TODO: Find out why jquery.once doesn't work here.
        if ($(this).hasClass('sections-initiated')) {
          return;
        }
        $(this).addClass('sections-initiated');

        var input = this;
        var editor = document.createElement('div');
        $(editor).insertAfter(this);
        editor.innerHTML = $(this).val();

        SectionsEditor.create( editor , {
          defaultSection: 'hero',
          templates: {
            text: '<section class="text"> <h2 ck-editable-type="text">Enter a headline ...</h2><p ck-editable-type="text">Enter some text ...</p></section>',
            hero: '<section class="stage"><img src="https://picsum.photos/800/300"/><h2 ck-editable-type="text">Enter a headline ...</h2></section>',
          },
          sections: {
            text: {
              label: 'Text',
            },
            hero: {
              label: 'Hero',
            },
          },
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
