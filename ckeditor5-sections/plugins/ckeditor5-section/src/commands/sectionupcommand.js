import SectionCommand from './sectioncommand';

export default class SectionUpCommand extends SectionCommand {

  refresh() {
    const currentSection = this.getSelectedSection();
    this.isEnabled = currentSection && currentSection.previousSibling;
  }

  execute() {
    const currentSection = this.getSelectedSection();
    this.editor.model.change(writer => {
      writer.insert(currentSection, currentSection.previousSibling, 'before');
    });
  }
}
