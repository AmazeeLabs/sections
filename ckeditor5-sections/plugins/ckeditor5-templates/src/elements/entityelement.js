/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import {downcastElementToElement} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import View from "@ckeditor/ckeditor5-ui/src/view";

import SearchIcon from '../../theme/icons/search.svg';
import UploadIcon from '../../theme/icons/upload.svg';
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import AttributeOperation from "@ckeditor/ckeditor5-engine/src/model/operation/attributeoperation";
import {upcastElementToElement} from "@ckeditor/ckeditor5-engine/src/conversion/upcast-converters";

/**
 * Entity view element.
 */
class EntityView extends View {
  constructor(modelElement, editor) {
    super();

    this.set('loading', false);
    this.set('rendered', false);

    const bind = this.bindTemplate;

    const searchButton = new ButtonView();
    searchButton.set('class', 'media-select');
    searchButton.set({icon: SearchIcon});
    searchButton.on('execute', () => editor.execute('entitySelect', {
      model: modelElement,
      add: false,
    }));

    const uploadButton = new ButtonView({
      class: 'media-add',
    });
    uploadButton.set('class', 'media-add');
    uploadButton.set({icon: UploadIcon});
    uploadButton.on('execute', () => editor.execute('entitySelect', {
      model: modelElement,
      add: true,
    }));

    const template = {
      tag: 'div',
      attributes: {
        class: ['ck-entity-widget'],
      },
      children: [
        {
          tag: 'div',
          attributes: {
            class: ['ck-entity-buttons'],
          },
          children: [searchButton, uploadButton],
        },
        {
          tag: 'div',
          attributes: {
            class: 'ck-entity-content',
          },
        }
      ]
    };

    this.setTemplate(template);
  }
}

/**
 * Element class for text input elements.
 */
export default class EntityElement extends TemplateElement {

  constructor(editor, node, parent = parent, index = 0) {
    super(editor, node, parent, index);
    this._entityRenderer = editor.config.get('entityRenderer');
  }

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'entity';
  }

  /**
   * @inheritDoc
   */
  get schema() {
    return {
      isLimit: true,
    };
  }

  get defaultAttributes() {
    return {
      'ck-entity-rendered': '',
      'data-entity-id': '',
    };
  }

  postfix(writer, item) {
    super.postfix(writer, item);
  }

  /**
   * @inheritDoc
   */
  get childCheck() {
    return (def) => {
      // Object elements never have children.
      return false;
    };
  }

  get upcast() {
    // Todo: construct in a way that it doesn't have to be a straight copy.
    return upcastElementToElement({
      view: (viewElement) => {
        if (this.matches(viewElement)) {
          return {template: true};
        }
        return null;
      },
      model: (viewElement, modelWriter) => {
        const attributes = Object.assign(this.defaultAttributes, Array.from(viewElement.getAttributeKeys())
            .map(key => ({[key]: viewElement.getAttribute(key)}))
            .reduce((acc, val) => Object.assign(acc, val), {}));
        const model = modelWriter.createElement(this.name, attributes);

        if (attributes['data-entity-id']) {
          window.setTimeout(() => {
            this.editor.model.change(writer => {
              writer.setAttribute('ck-entity-loading', true, model);
            });
            this._entityRenderer(model.getAttribute('data-entity-type'), model.getAttribute('data-entity-id'), model.getAttribute('data-entity-id'), content => {
              this.editor.model.change(writer => {
                writer.setAttribute('ck-entity-loading', false, model);
                writer.setAttribute('ck-entity-rendered', content, model);
              });
            });
          }, 500);
        }

        return model;
      }
    });
  }

  /**
   * @inheritDoc
   */
  get editingDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, writer) => {
        const editor = this.editor;

        // Create an editable textfield of the given type and attach the content as placeholder.
        return writer.createUIElement(this.node.tagName, this.getModelAttributes(modelElement), function (domDocument) {
          const domElement = this.toDomElement(domDocument);
          const view = new EntityView(modelElement, editor);
          view.render();
          domElement.appendChild(view.element);

          const preview = domElement.querySelector('.ck-entity-content');
          editor.model.document.on('change:data', (evt, batch) => {
            for (const op of batch.getOperations()) {
              if (op instanceof AttributeOperation && op.key === 'ck-entity-rendered') {
                if (modelElement === op.range.start.nodeAfter) {
                  preview.innerHTML = op.newValue;
                }
              }
              if (op instanceof AttributeOperation && op.key === 'ck-entity-loading' && op.newValue) {
                if (modelElement === op.range.start.nodeAfter) {
                  preview.innerHTML = '<div class="ck-entity-placeholder"><div class="ck-entity-loader"/></div>';
                }
              }
            }
          });

          if (modelElement.getAttribute('ck-entity-rendered')) {
            preview.innerHTML = modelElement.getAttribute('ck-entity-rendered');
          }
          else if (modelElement.getAttribute('ck-entity-loading')) {
            preview.innerHTML = '<div class="ck-entity-placeholder"><div class="ck-entity-loader"/></div>';
          }
          else {
            preview.innerHTML = '<div class="ck-entity-placeholder"/>';
          }
          return domElement;
        });
      }
    });
  }
}
