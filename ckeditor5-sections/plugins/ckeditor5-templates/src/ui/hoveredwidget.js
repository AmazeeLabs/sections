import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class HoveredWidget extends Plugin {

  static get pluginName() {
    return 'HoveredWidget';
  }

  constructor( editor ) {
    super( editor );

    editor.ui.view.listenTo( document, 'mouseover', ( evt, data ) => {
      // @todo: improve this to not query the the document all the time, but
      // have maybe some statically cached list.
      for (let node of document.querySelectorAll('.ck-widget')) {
        node.classList.remove('hovered');
      }

      let element = data.target;
      while (element && element.classList) {
        if (element.classList.contains('ck-widget')) {
          element.classList.add('hovered');
          break;
        }
        element = element.parentNode;
      }
    } );
  }
}
