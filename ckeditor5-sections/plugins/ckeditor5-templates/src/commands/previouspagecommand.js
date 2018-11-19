import ElementCommand from "./elementcommand";

export default class PreviousPageCommand extends ElementCommand {

  refresh() {
    const currentPage = this.getSelectedContainerItem();
    if (!currentPage) {
      this.isEnabled = false;
      this.isVisible = false;
      return;
    }
    this.isVisible = true;
    this.isEnabled = !!currentPage.previousSibling;
  }

  execute() {
    const currentElement = this.getSelectedContainerItem();
    this.editor.model.change(writer => {
      writer.setAttribute('ck-current-page', false, currentElement);
      writer.setAttribute('ck-current-page', true, currentElement.previousSibling);
      writer.setSelection(currentElement.previousSibling, 'on');
    });
  }

}
