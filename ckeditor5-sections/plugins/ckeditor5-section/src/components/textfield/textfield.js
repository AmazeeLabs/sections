import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { attachPlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

export function registerTextField (editor, config) {

  const schema = editor.model.schema;

  const model = config.parent + '__' + config.model;

  schema.register(model, {
    isLimit: true,
  });

  editor.conversion.for('upcast').add(upcastElementToElement({
    view: {
      name: config.view,
      classes: model,
    },
    model: model,
  }));

  editor.conversion.for('dataDowncast').add(downcastElementToElement({
    model: model,
    view: {
      name: config.view,
      classes: model,
    },
  }));

  editor.conversion.for('editingDowncast').add(downcastElementToElement({
    model: model,
    view: function (modelElement, writer) {
      const editable = writer.createEditableElement(config.view, {
        class: model
      });
      attachPlaceholder(editor.editing.view, editable, config.placeholder);
      return toWidgetEditable(editable, writer);
    }
  }));

  schema.addChildCheck((context, def) => {
    if (context.endsWith(config.parent) && def.name === model) {
      return true;
    }
    if (context.endsWith(model) && def.name === '$text') {
      return true;
    }
  });

}
