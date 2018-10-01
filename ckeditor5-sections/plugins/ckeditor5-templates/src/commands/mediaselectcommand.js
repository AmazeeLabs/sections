import Command from '@ckeditor/ckeditor5-core/src/command';

export default class MediaSelectCommand extends Command {

  refresh() {
    this.isEnabled = true;
  }

  /**
   * @inheritDoc
   */
  constructor( editor ) {
    super( editor );
    this._mediaSelector = editor.config.get('mediaSelector');
    this._mediaRenderer = editor.config.get('mediaRenderer');
  }

  execute(values) {
    const model = this.editor.model;
    this._mediaSelector(values.model.getAttribute('data-media-type'), values.operation, (uuid) => {
      if (uuid === values.model.getAttribute('data-media-uuid')) {
        return;
      }

      model.change(writer => {
        writer.setAttribute('data-media-uuid', uuid, values.model);
        writer.setAttribute('ck-media-loading', true, values.model);

        this._mediaRenderer(uuid, values.model.getAttribute('data-media-display'), content => {
          model.change(writer => {
            writer.setAttribute('ck-media-loading', false, values.model);
            writer.setAttribute('ck-media-rendered', content, values.model);
          });
        });
      });
    });
  }
}
