(function ($, Drupal) {

  Drupal.behaviors.sections = {
    attach: function (context, settings) {
      $('input.sections-editor', context).each(function (index, item) {
        if ($(this).hasClass('sections-initiated')) {
          return;
        }
        var currentCallback = null;
        $(this).addClass('sections-initiated');
        Sections.initSectionEditor(item, {
          entitySelector: (callback, max) => {

            var $widget = $(this).parents('form').find('.field--name-field-embedded-images');
            var $selector = $widget.find('[name="field_embedded_images[target_id]"]');
            var $button = $widget.find('.button');
            $selector.bind('entity_browser_value_updated', function () {
              $selector.unbind('entity_browser_value_updated');
              var id = $(this).val().split(':')[1];
              var poll = window.setInterval(function () {
                var $remove = $widget.find('input[value="Remove"]');
                if ($remove.length) {
                  $remove.trigger('mousedown');
                  window.clearInterval(poll);
                }
              }, 100);
              window.setTimeout(function () {
              }, 3000);
              $.get({
                dataType: 'json',
                url: '/graphql',
                data: {
                  query: 'query($id:String!){mediaById(id:$id){uuid}}',
                  variables: {id: id},
                }
              }).done(function (result) {
                callback([result.data.mediaById.uuid]);
              });
            });
            $button.click();
          },
          graphqlResolver: (query, variables, callback) => {
            $.get({
              dataType: 'json',
              url: '/graphql',
              data: {
                query: query,
                variables: variables
              }
            }).done(function (result) {
              callback(result.data);
            });
          }
        });
      });
    }
  };
}(jQuery, Drupal));
