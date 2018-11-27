/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import {
  changeAttribute
} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import {attachPlaceholder} from "@ckeditor/ckeditor5-engine/src/view/placeholder";
import {toWidgetEditable} from "@ckeditor/ckeditor5-widget/src/utils";

/**
 * Element class for text input elements.
 */
export default class TextElement extends TemplateElement {

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'text';
  }

  /**
   * @inheritDoc
   */
  get schema() {
    return Object.assign(super.schema, {
      isLimit: true
    });
  }

  /**
   * @inheritDoc
   */
  get schemaExtensions() {
    return [
      { element: '$text', info: { allowIn: this.name }},
    ];
  }

  /**
   * @inheritDoc
   */
  get editingDowncast() {
    const createWidget = (modelElement, writer) => {
      // Create an editable textfield of the given type and attach the content as placeholder.
      const editable = writer.createEditableElement(this.node.tagName, this.getModelAttributes(modelElement));
      attachPlaceholder(this.editor.editing.view, editable, this.node.textContent);
      return toWidgetEditable(editable, writer);
    };

    const insertElement = (evt, data, conversionApi) => {
      const modelElement = data.item;
      const viewElement = createWidget(modelElement, conversionApi.writer);

      if (!viewElement || !conversionApi.consumable.consume(modelElement, 'insert')) {
        return;
      }

      const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);

      conversionApi.mapper.bindElements(modelElement, viewElement);
      conversionApi.writer.insert(viewPosition, viewElement);
    };

    return dispatcher => {
      dispatcher.on('insert:' + this.name, insertElement),
      dispatcher.on('attribute:ck-char-limit-exceeded', changeAttribute());
    };
  }

}
