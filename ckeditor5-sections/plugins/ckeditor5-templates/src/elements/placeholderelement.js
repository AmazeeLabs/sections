
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from "@ckeditor/ckeditor5-ui/src/view";
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';

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
      view.set({
        label: elements[template].label,
        withText: true
      });

      view.render();
      view.on('execute', () => {
        editor.execute(`insertElement:${template}`, {model: modelElement});
      });
      buttons.push(view);
    }
    const removeButton = new ButtonView();
    removeButton.set({
      label: 'Close',
      withText: true,
      class: 'close-button'
    });
    removeButton.render();
    removeButton.on('execute', () => {
      editor.execute('removePlaceholder', {model: modelElement});
    });
    buttons.push(removeButton);

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
        return viewWriter.createUIElement('div', this.getModelAttributes(modelElement));
      }
    });
  }

  get editingDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, writer) => {
        const element = writer.createUIElement('div', this.getModelAttributes(modelElement), function (domDocument) {
          const domElement = this.toDomElement(domDocument);
          const view = new PlaceholderView(modelElement, editor, modelElement.getAttribute('ck-allowed'))
          view.render();
          domElement.appendChild(view.element);
          return domElement;
        });
        const cont = writer.createContainerElement('div', { class: 'placeholder-container-element'});
        writer.insert( ViewPosition.createAt( cont , 0), element );

        return cont;
      }
    });
  }


  getModelAttributes(modelElement) {
    return Array.from(modelElement.getAttributeKeys())
      .filter(attr => attr.substr(0, 3) !== 'ck-' && modelElement.getAttribute(attr))
      .map(attr => ({[attr]: modelElement.getAttribute(attr)}))
      .reduce((acc, val) => Object.assign(acc, val), {});
  }
}
