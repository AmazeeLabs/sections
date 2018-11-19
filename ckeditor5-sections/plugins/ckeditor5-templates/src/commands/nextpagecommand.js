import ElementCommand from "./elementcommand";

export default class NextPageCommand extends ElementCommand {

  refresh() {
    const currentPage = this.getSelectedContainerItem();
    if (!currentPage) {
      this.isEnabled = false;
      this.isVisible = false;
      return;
    }
    this.isVisible = true;
    this.isEnabled = !!currentPage.nextSibling;
  }

  execute() {
    const currentElement = this.getSelectedContainerItem();
    this.editor.model.change(writer => {
      writer.setAttribute('ck-current-page', false, currentElement);
      writer.setAttribute('ck-current-page', true, currentElement.nextSibling);
      writer.setSelection(currentElement.nextSibling, 'on');
    });
  }

}
