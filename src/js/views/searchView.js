import View from "./view.js";

class SearchView extends View {
  _parentElement = document.querySelector(".search");
  _data;
  _errorMessage = "";
  _message = "";

  getQuery() {
    return this._parentElement.querySelector(".search__field").value;
  }

  clearInput() {
    this._parentElement.querySelector(".search__field").value = "";
  }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
      //   this.clearInput(); cleared input inside controller, since we want to clear it only after we render the data
    });
  }
}
export default new SearchView();
