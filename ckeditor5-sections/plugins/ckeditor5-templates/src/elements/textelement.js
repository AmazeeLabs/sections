/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import {downcastElementToElement} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
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
    return {
      isLimit: true,
    };
  }

  /**
   * @inheritDoc
   */
  get childCheck() {
    return (def) => {
      // Only allow plain text elements as children.
      if (def.name !== '$text') {
        return false;
      }
    };
  }

  /**
   * @inheritDoc
   */
  get editingDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, writer) => {
        // Create an editable textfield of the given type and attach the content as placeholder.
        const editable = writer.createEditableElement(this.node.tagName, this.getModelAttributes(modelElement));
        attachPlaceholder(this.editor.editing.view, editable, this.node.textContent);
        return toWidgetEditable(editable, writer);
      }
    });
  }
}
