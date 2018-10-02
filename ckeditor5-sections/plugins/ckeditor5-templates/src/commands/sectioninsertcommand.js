import SectionCommand from './sectioncommand';

export default class SectionInsertCommand extends SectionCommand {

  refresh() {
    this.isEnabled = !!this.getSelectedSection();
  }

  execute(values) {
    const currentSection = this.getSelectedSection();
    this.editor.model.change(writer => {
      const sectionElement = writer.createElement('ck-templates__' + values.type);
      writer.insert(sectionElement, currentSection, 'after');
    });
  }
}
