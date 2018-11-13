import ElementCommand from './elementcommand';

export default class InsertPlaceholderCommand extends ElementCommand {

  constructor(editor, position) {
    super(editor);
    this.position = position;
    this.allowed = [];
  }

  refresh() {
    this.isEnabled = true;
  }

  execute(values) {
    const current = this.getSelectedElement();
    this.editor.model.change(writer => {
      const element = writer.createElement(current.parent.name + '__placeholder');
      writer.setAttribute('ck-allowed-elements', this.allowed, element);
      writer.insert(element, current, this.position);
    });
  }
}
