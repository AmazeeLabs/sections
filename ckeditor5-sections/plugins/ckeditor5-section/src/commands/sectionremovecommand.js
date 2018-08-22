import SectionCommand from './sectioncommand';

export default class SectionRemoveCommand extends SectionCommand {

  refresh() {
    const currentSection = this.getSelectedSection();
    this.isEnabled = currentSection && (currentSection.previousSibling || currentSection.nextSibling);
  }

  execute(values) {
    const currentSection = this.getSelectedSection();
    this.editor.model.change(writer => {
      writer.remove(currentSection);
    });
  }
}
