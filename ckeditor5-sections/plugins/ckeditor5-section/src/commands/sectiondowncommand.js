import SectionCommand from './sectioncommand';

export default class SectionDownCommand extends SectionCommand {

  refresh() {
    const currentSection = this.getSelectedSection();
    this.isEnabled = currentSection && currentSection.nextSibling;
  }

  execute() {
    const model = this.editor.model;
    const currentSection = this.getSelectedSection();
    model.change(writer => {
      writer.insert(currentSection, currentSection.nextSibling, 'after');
    });
  }
}
