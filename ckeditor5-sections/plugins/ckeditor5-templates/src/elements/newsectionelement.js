/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import {downcastElementToElement} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import View from "@ckeditor/ckeditor5-ui/src/view";
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import iconAdd from "../../theme/icons/add.svg";

const toPx = toUnit( 'px' );

/**
 * Entity view element.
 */
class NewSectionView extends View {
  constructor(modelElement, editor) {
    super();
    const bind = this.bindTemplate;

    this.set('loading', false);
    this.set('rendered', false);

    const newSectionButton = new ButtonView();
    newSectionButton.set('class', 'new-section');
    newSectionButton.set({
      label: 'Add new section',
      icon: iconAdd,
    });
    newSectionButton.on('execute', () => editor.execute('addNewSection', {
      model: modelElement,
      operation: 'add',
    }));

    this.setTemplate({
      tag: 'div',
      children: [
        newSectionButton,
      ],
      attributes: {
        class: [
          'new-section',
          bind.if( 'isEnabled', 'ck-disabled', value => !value ),
          bind.if( 'isVisible', 'ck-hidden', value => !value ),
          bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' )
        ],
        style: {
          position: 'absolute',
          top: bind.to('top', val => toPx(val)),
          left: bind.to('left', val => toPx(val)),
          width: bind.to('width', val => toPx(val)),
        }
      },
      on: {
        mousedown: bind.to(evt => {
          evt.preventDefault();
        }),

        click: bind.to( evt => {
          // We can't make the button disabled using the disabled attribute, because it won't be focusable.
          // Though, shouldn't this condition be moved to the button controller?
          if ( this.isEnabled ) {
            this.fire( 'execute' );
          } else {
            // Prevent the default when button is disabled, to block e.g.
            // automatic form submitting. See ckeditor/ckeditor5-link#74.
            evt.preventDefault();
          }
        })
      }
    });
  }
}

/**
 * Element class for text input elements.
 */
export default class NewSectionElement extends TemplateElement {

  constructor(editor, node, parent = parent, index = 0) {
    super(editor, node, parent, index);
  }

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'container';
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
      // Object elements never have children.
      return false;
    };
  }

  toModelElement(viewElement, modelWriter) {
    const model = super.toModelElement(viewElement, modelWriter);


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

        console.log('here');

        // Create an editable textfield of the given type and attach the content as placeholder.
        return writer.createUIElement(this.node.tagName, this.getModelAttributes(modelElement), function (domDocument) {
          const domElement = this.toDomElement(domDocument);
          const view = new NewSectionView(modelElement, editor);
          view.render();
          domElement.appendChild(view.element);

          return domElement;
        });
      }
    });
  }
}
