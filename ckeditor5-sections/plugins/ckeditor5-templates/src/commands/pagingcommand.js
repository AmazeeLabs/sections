import ElementCommand from "./elementcommand";

export default class PagingCommand extends ElementCommand {

  refresh() {
    const currentPage = this.getSelectedContainerItem();
    if (!currentPage) {
      this.isVisible = false;
      return;
    }
    this.isVisible = true;
    this.label = `${currentPage.index + 1} of ${currentPage.parent.childCount}`;
  }

  execute() {
    const currentElement = this.getSelectedContainerItem();
    this.editor.model.change(writer => {
      writer.setAttribute('ck-paging-disabled', currentElement.parent.getAttribute('ck-paging-disabled'), currentElement.parent);
    });
  }

}
