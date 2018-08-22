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
    editor.config.define( 'defaultSection', 'section--text');
    this._selector = editor.config.get('entitySelector');
  }

  execute(values) {
    const model = this.editor.model;
    model.change(writer => {
      writer.removeAttribute('src', values.entity);
      writer.removeAttribute('uuid', values.entity);
      writer.setAttribute('loading', 'true', values.entity);
    });
    this._selector((items) => {
      model.change(writer => {
        writer.setAttribute('uuid', items[0], values.entity);
      });
    });
  }
}
