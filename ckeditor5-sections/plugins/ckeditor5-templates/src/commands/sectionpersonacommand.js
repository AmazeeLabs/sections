import SectionCommand from './sectioncommand';

export default class SectionPersonaCommand extends SectionCommand {

  refresh() {
    this.isEnabled = !!this.getSelectedSection();
    this.value = this.isEnabled ? this.getSelectedSection().getAttribute('persona') || 'any' : 'any';
  }

  execute(values) {
    const currentSection = this.getSelectedSection();
    this.editor.model.change(writer => {
      if (values.value === 'any') {
        writer.removeAttribute('persona', currentSection);
      }
      else {
        writer.setAttribute('persona', values.value, currentSection);
      }
    });
  }
}
