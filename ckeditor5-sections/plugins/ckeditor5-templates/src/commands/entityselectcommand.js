import Command from '@ckeditor/ckeditor5-core/src/command';

export default class EntitySelectCommand extends Command {

  refresh() {
    this.isEnabled = true;
  }

  /**
   * @inheritDoc
   */
  constructor( editor ) {
    super( editor );
    this._entitySelector = editor.config.get('entitySelector');
    this._entityRenderer = editor.config.get('entityRenderer');
  }

  execute(values) {
    const model = this.editor.model;
    this._entitySelector(values.type, values.add, (id) => {
      if (id === values.model.getAttribute('data-entity-id')) {
        return;
      }
      model.change(writer => {
        writer.setAttribute('data-entity-id', id, values.model);
        writer.setAttribute('ck-entity-loading', true, values.model);

        this._entityRenderer(values.model.getAttribute('data-entity-type'), id, values.model.getAttribute('data-entity-id'), content => {
          model.change(writer => {
            writer.setAttribute('ck-entity-loading', false, values.model);
            writer.setAttribute('ck-entity-rendered', content, values.model);
          });
        });
      });
    });
  }
}
