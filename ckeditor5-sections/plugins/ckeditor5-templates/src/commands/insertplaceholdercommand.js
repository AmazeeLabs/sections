import ElementCommand from './elementcommand';

export default class InsertPlaceholderCommand extends ElementCommand {

  constructor(editor, position) {
    super(editor);
    this.position = position;
    this.allowed = [];
  }

  refresh() {
    this.isEnabled = true;
    const current = this.getSelectedElement();
    if (current && current.parent) {
      this.allowed = (current.parent.getAttribute('ck-allowed-elements') || '').split(' ');
    }
  }

  execute(values) {
    const current = this.getSelectedElement();
    this.editor.model.change(writer => {
      const element = writer.createElement('template-placeholder');
      writer.setAttribute('ck-allowed', this.allowed, element);
      writer.insert(element, current, this.position);
    });
  }
}
