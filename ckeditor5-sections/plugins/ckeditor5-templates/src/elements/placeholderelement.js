
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from "@ckeditor/ckeditor5-ui/src/view";

/**
 * Entity view element.
 */
class PlaceholderView extends View {
  constructor(modelElement, editor, allowed) {
    super();
    const buttons = [];
    let view;
    const elements = editor.config.get('templates');
    for (const template of allowed) {
      view = new ButtonView();
      view.set( {
          label: elements[template].label,
          withText: true
      } );

      view.render();
      view.on('execute', (e) => {
        editor.execute(`insertElement:${template}`, {model: modelElement});
      });
      buttons.push(view);
    }

    const template = {
      tag: 'div',
      attributes: {
        class: ['ck-placeholder-widget'],
      },
      children: buttons
    };

    this.setTemplate(template);
  }
}

/**
 * Element class for text input elements.
 */
export default class PlaceholderElement {

  /**
   * @private
   */
  get _name() {
    return 'template-placeholder';
  }

  /**
   * Returns the calculated name for this element.
   *
   * @returns {String}
   */
  get name() {
    return 'template-placeholder';
  }

  /**
   * @inheritDoc
   */
  get schema() {
    return {
      allowIn: "ck-templates__root",
    };
  }

  get dataDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, viewWriter) => {
        return viewWriter.createUIElement('div', modelElement.getAttributes());
      }
    });
  }

  get editingDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, writer) => {
        return writer.createUIElement('div', modelElement.getAttributes(), function (domDocument) {
          const domElement = this.toDomElement(domDocument);
          const view = new PlaceholderView(modelElement, editor, modelElement.getAttribute('ck-allowed'))
          view.render();
          domElement.appendChild(view.element);
          return domElement;
        });
      }
    });
  }

}
