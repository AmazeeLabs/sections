/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import {downcastElementToElement} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import {attachPlaceholder} from "@ckeditor/ckeditor5-engine/src/view/placeholder";
import {toWidgetEditable} from "@ckeditor/ckeditor5-widget/src/utils";
import ViewPosition from "@ckeditor/ckeditor5-engine/src/view/position";

/**
 * Element class for text input elements.
 */
export default class FormattedElement extends TemplateElement {

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'formatted';
  }

  /**
   * @inheritDoc
   */
  get schema() {
    return Object.assign(super.schema, {
      isLimit: true,
      inheritAllFrom: '$root',
    });
  }

  /**
   * {@inheritDoc}
   */
  get postfixChildren() {
    return false;
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
        // attachPlaceholder(this.editor.editing.view, editable, this.node.textContent);
        return toWidgetEditable(editable, writer);
      }
    });
  }

  postfix(writer, item) {
    // Template attributes that are not part of the model are copied into the model initially.
    for (let attr of this.node.attributes) {
      if (!Array.from(item.getAttributeKeys()).includes(attr.name)) {
        writer.setAttribute(attr.name, attr.value, item);
      }
    }

    if (item.childCount === 0) {
      const paragraph = writer.createElement('paragraph');
      if (this.editor.model.schema.checkChild(item, paragraph)) {
        writer.insert( paragraph, item, 'end' );
        writer.insert(writer.createText(this.node.textContent), paragraph);
        return true;
      }
    }
  }
}
