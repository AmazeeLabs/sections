
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from "@ckeditor/ckeditor5-ui/src/view";
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import TemplateElement from "../templateelement";
import {toWidget} from "@ckeditor/ckeditor5-widget/src/utils";

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
export default class PlaceholderElement extends TemplateElement {

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'placeholder';
  }

  get dataDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, viewWriter) => {
        return viewWriter.createText('');
      }
    });
  }

  get schemaExtensions() {
    return this.node.getAttribute('ck-allowed-elements').split(' ').map((name) => {
      return { element: 'ck-templates__' + name, info: { allowWhere: this.name }};
    }).concat([
      {element: this.name, allowAttributes: ['ck-current-page']}
    ]);
  }

  get fittingElements() {
    return super.fittingElements.concat(this.node.getAttribute('ck-allowed-elements').split(' ').map((el) => `ck-templates__${el}`));
  }


  get editingDowncast() {
    const editor = this.editor;
    const node = this.node;
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, writer) => {
        const element = writer.createUIElement('div', this.getModelAttributes(modelElement), function (domDocument) {
          const domElement = this.toDomElement(domDocument);
          const view = new PlaceholderView(modelElement, editor, node.getAttribute('ck-allowed-elements').split(' '));
          view.render();
          domElement.appendChild(view.element);
          return domElement;
        });
        const cont = writer.createContainerElement('div', { class: 'placeholder-container-element'});
        writer.insert( ViewPosition.createAt( cont , 0), element );
        writer.setCustomProperty('placeholder', true, cont);
        return toWidget(cont, writer);
      }
    });
  }

}
