import ElementCommand from './elementcommand';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

export default class InsertElementCommand extends ElementCommand {

  constructor(editor, element) {
    super(editor);
    this.element = element;
  }

  refresh() {
    this.isEnabled = true;
  }

  execute(values) {
    this.editor.model.change(writer => {
      const element = writer.createElement('ck-templates__' + this.element, {'ck-current-page': true});
      writer.insert(element, values.model, 'after');
      writer.remove(values.model);
      window.setTimeout(() => {
        this.editor.model.change(writer => {
          writer.setSelection(element, 'on');
        })
      });
    });

  }
}
