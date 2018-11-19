import ElementCommand from './elementcommand';

export default class InsertPlaceholderCommand extends ElementCommand {

  constructor(editor, position) {
    super(editor);
    this.position = position;
  }

  refresh() {
    this.isEnabled = true;
  }

  execute(values) {
    const current = this.getSelectedTemplate();
    this.editor.model.change(writer => {
      let element;
      if (current.parent.getAttribute('ck-allowed-elements').split(' ').length == 1) {
        element = writer.createElement('ck-templates__' + current.parent.getAttribute('ck-allowed-elements'));
      } else {
        element = writer.createElement(current.parent.name + '__placeholder');
      }
      writer.insert(element, current, this.position);
    });
  }
}
