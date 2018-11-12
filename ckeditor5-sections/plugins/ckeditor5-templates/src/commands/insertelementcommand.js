import ElementCommand from './elementcommand';

export default class InsertElementCommand extends ElementCommand {

  constructor(editor, element) {
    super(editor);
    this.element = element;
  }

  refresh() {
    this.isEnabled = true;
  }

  execute(values) {
    const current = this.getSelectedElement();
    this.editor.model.change(writer => {
      const element = writer.createElement('ck-templates__' + this.element);
      writer.insert(element, values.model, 'before');
    });
  }
}
