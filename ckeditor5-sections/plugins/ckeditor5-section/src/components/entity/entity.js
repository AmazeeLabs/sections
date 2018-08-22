import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastElementToElement, downcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';

import EntitySelectCommand from './entityselectcommand';

export const imageQuery = `
query ($uuid: String!, $style: ImageStyleId!) {
  mediaQuery(filter: {
    conditions: [{
      field: "uuid",
      value: [$uuid],
    }]
  }) {
    entities {
      ... on MediaImage {
        fieldMediaImage {
          style:derivative(style: $style) {
            url
          }
        }
      }
    }
  }
}
`;


export function registerEntity(editor, config) {
  const schema = editor.model.schema;
  const conversion = editor.conversion;

  editor.editing.view.addObserver( ClickObserver );

  const model = config.parent + '__' + config.model;

  // Configure schema.
  schema.register( model, {
    isObject: true,
    isBlock: true,
    allowAttributes: [ 'type', 'uuid', 'src' ],
  });

  schema.addChildCheck((context, def) => {
    if (context.endsWith(config.parent) && def.name === model) {
      return true;
    }
  });

  editor.model.document.registerPostFixer( (writer) => {
    const changes = editor.model.document.differ.getChanges();

    for ( const entry of changes ) {
      if ( entry.attributeKey === 'uuid' ) {
        const item = entry.range.start.nodeAfter;
        resolveImageUrl(editor, item, writer);
      }
    }
  });

  conversion.for('dataDowncast')
    .add(downcastElementToElement({
      view: (modelElement, viewWriter) => {
        return viewWriter.createEmptyElement('drupal-entity', { class: model });
      },
      model: model,
    }))
    .add(downcastAttributeToAttribute({
      view: 'type',
      model: 'type',
    }))
    .add(downcastAttributeToAttribute({
      view: 'uuid',
      model: 'uuid',
    }))
  ;

  conversion.for('editingDowncast')
      .add(downcastElementToElement({
        model: model,
        view: (modelElement, viewWriter) => {
          return viewWriter.createUIElement('img', {class: `entity ${model}`}, function (domDocument) {
            const domElement = this.toDomElement(domDocument);
            domElement.ondblclick =  () => {
              editor.execute('entitySelect', {entity: modelElement});
            };
            return domElement;
          });
        }
      }))
      .add(modelToViewAttributeConverter('uuid', model))
      .add(modelToViewAttributeConverter('src', model))
      .add(modelToViewAttributeConverter('loading', model))
  ;

  conversion.for('upcast')
      .add(upcastElementToElement({
        view: { name: 'drupal-entity', classes: model },
        model: ( viewElement, modelWriter ) => {
          const element = modelWriter.createElement(model);
          modelWriter.setAttribute('style', config.style, element);
          return element;
        }
      }))
      .add(upcastAttributeToAttribute({
        view: 'type',
        model: 'type',
      }))
      .add(upcastAttributeToAttribute({
        view: 'uuid',
        model: 'uuid',
      }))
  ;
}

export function resolveImageUrl(editor, item, writer) {
  const uuid = item.getAttribute('uuid');
  if (uuid) {
    writer.setAttribute('loading', 'true', item);
    editor.config.get('graphqlResolver')(imageQuery, {uuid: item.getAttribute('uuid'), style: item.getAttribute('style')}, function (data) {
      editor.model.change((w) => {
        w.setAttribute('loading', 'false', item);
        w.setAttribute('src', data.mediaQuery.entities[0].fieldMediaImage.style.url, item);
      });
    });
  }
  else {
    writer.removeAttribute('src', item);
  }
}

export default class Entity extends Plugin {
  static get pluginName() {
    return 'Entity';
  }

  static get requires() {
    return [];
  }

  /**
   * @inheritDoc
   */
  constructor( editor ) {
    super( editor );
    editor.config.define( 'entitySelector', function () {
      throw "No entitySelector defined.";
    });
    editor.config.define( 'graphqlResolver', function () {
      throw "No graphqlResolver defined.";
    });
  }

  init () {
    this.editor.commands.add('entitySelect', new EntitySelectCommand(this.editor));
  }
}

export function modelToViewAttributeConverter( attributeKey, element ) {
  return dispatcher => {
    dispatcher.on( `attribute:${ attributeKey }:${ element }`, converter );
  };

  function converter( evt, data, conversionApi ) {
    if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
      return;
    }

    const viewWriter = conversionApi.writer;
    const entity = conversionApi.mapper.toViewElement( data.item );

    if ( data.attributeNewValue !== null ) {
      viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, entity );
    } else {
      viewWriter.removeAttribute( data.attributeKey, entity );
    }
  }
}
