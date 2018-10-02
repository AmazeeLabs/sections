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
class MediaView extends View {
  constructor(modelElement, editor) {
    super();

    this.set('loading', false);
    this.set('rendered', false);

    const searchButton = new ButtonView();
    searchButton.set('class', 'media-select');
    searchButton.set({
      label: 'Select media',
      icon: SearchIcon,
    });
    searchButton.on('execute', () => editor.execute('mediaSelect', {
      model: modelElement,
      operation: 'select',
    }));

    const uploadButton = new ButtonView({
      class: 'media-add',
    });
    uploadButton.set('class', 'media-add');
    uploadButton.set({
      label: 'Add media',
      icon: UploadIcon,
    });
    uploadButton.on('execute', () => editor.execute('mediaSelect', {
      model: modelElement,
      operation: 'add',
    }));

    const template = {
      tag: 'div',
      attributes: {
        class: ['ck-media-widget'],
      },
      children: [
        {
          tag: 'div',
          attributes: {
            class: ['ck-media-buttons'],
          },
          children: [searchButton, uploadButton],
        },
        {
          tag: 'div',
          attributes: {
            class: 'ck-media-content',
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
export default class MediaElement extends TemplateElement {

  constructor(editor, node, parent = parent, index = 0) {
    super(editor, node, parent, index);
    this._mediaRenderer = editor.config.get('mediaRenderer');
  }

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'media';
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
      'ck-media-rendered': '',
      'data-media-uuid': '',
    };
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

  toModelElement(viewElement, modelWriter) {
    const model = super.toModelElement(viewElement, modelWriter);

    if (model.getAttribute('data-media-uuid')) {
      window.setTimeout(() => {
        this.editor.model.change(writer => {
          writer.setAttribute('ck-media-loading', true, model);
        });
        this._mediaRenderer(model.getAttribute('data-media-uuid'), model.getAttribute('data-media-display'), content => {
          this.editor.model.change(writer => {
            writer.setAttribute('ck-media-loading', false, model);
            writer.setAttribute('ck-media-rendered', content, model);
          });
        });
      }, 500);
    }

    return model;
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
          const view = new MediaView(modelElement, editor);
          view.render();
          domElement.appendChild(view.element);

          const preview = domElement.querySelector('.ck-media-content');

          editor.model.document.on('change:data', (evt, batch) => {
            for (const op of batch.getOperations()) {
              if (op instanceof AttributeOperation && op.key === 'ck-media-rendered') {
                if (modelElement === op.range.start.nodeAfter) {
                  preview.innerHTML = op.newValue;
                }
              }
              if (op instanceof AttributeOperation && op.key === 'ck-media-loading' && op.newValue) {
                if (modelElement === op.range.start.nodeAfter) {
                  preview.innerHTML = '<div class="ck-media-placeholder"><div class="ck-media-loader"/></div>';
                }
              }
            }
          });

          if (modelElement.getAttribute('ck-media-rendered')) {
            preview.innerHTML = modelElement.getAttribute('ck-media-rendered');
          }
          else if (modelElement.getAttribute('ck-media-loading')) {
            preview.innerHTML = '<div class="ck-media-placeholder"><div class="ck-media-loader"/></div>';
          }
          else {
            preview.innerHTML = '<div class="ck-media-placeholder"/>';
          }
          return domElement;
        });
      }
    });
  }
}
