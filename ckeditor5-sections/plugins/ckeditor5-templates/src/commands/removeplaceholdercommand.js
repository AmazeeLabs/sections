import ElementCommand from './elementcommand';

export default class RemovePlaceholderCommand extends ElementCommand {

  constructor(editor) {
    super(editor);
  }

  refresh() {
    this.isEnabled = true;
  }

  execute(values) {
    this.editor.model.change(writer => {
      writer.remove(values.model);
    });
  }
}
