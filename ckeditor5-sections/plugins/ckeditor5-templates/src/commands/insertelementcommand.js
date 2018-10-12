import ElementCommand from './elementcommand';

export default class InsertElementCommand extends ElementCommand {

  constructor(editor, element) {
    super(editor);
    this.element = element;
  }

  refresh() {
    this.isEnabled = false;
    const current = this.getSelectedElement();
    if (current && current.parent) {
      const allowed = (current.parent.getAttribute('ck-allowed-elements') || '').split(' ');
      if(allowed.includes(this.element)) {
        this.isEnabled = true;
      }
    }
  }

  execute(values) {
    const current = this.getSelectedElement();
    this.editor.model.change(writer => {
      const element = writer.createElement('ck-templates__' + this.element);
      writer.insert(element, current, values.position);
    });
  }
}
