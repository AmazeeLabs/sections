import SectionCommand from './sectioncommand';

export default class SectionInsertCommand extends SectionCommand {

  constructor(editor, section) {
    super(editor);
    this.section = section;
  }

  refresh() {
    this.isEnabled = false;
    const current = this.getSelectedSection();
    if (current && current.parent) {
      const allowed = (current.parent.getAttribute('ck-allowed-elements') || '').split(' ');
      debugger;
      if(allowed.includes(this.section)) {
        this.isEnabled = true;
      }
    }
  }

  execute(values) {
    const currentSection = this.getSelectedSection();
    this.editor.model.change(writer => {
      const sectionElement = writer.createElement('ck-templates__' + this.section);
      writer.insert(sectionElement, currentSection, 'after');
    });
  }
}
