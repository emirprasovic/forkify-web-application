import { RESULTS_PER_PAGE } from "../config.js";
import View from "./view.js";
import icons from "url:./../../img/icons.svg"; // parcel2

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const button = e.target.closest(".btn--inline");
      if (!button) return;

      const goToPage = Number(button.dataset.travel);
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const currentPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    console.log(`Number of pages: ${numPages}`);
    // Page 1, no other pages
    if (currentPage === 1 && numPages === 1) {
      return "";
    }
    // Page 1, and there are other pages
    if (currentPage === 1 && numPages > 1) {
      return this.generateNextButton(currentPage);
    }
    // Last page
    if (currentPage === numPages) {
      return this.generateBackButton(currentPage);
    }
    // Middle page
    if (currentPage < numPages) {
      return (
        this.generateBackButton(currentPage) +
        this.generateNextButton(currentPage)
      );
    }
  }
  generateBackButton(currentPage) {
    return `
        <button data-travel="${
          currentPage - 1
        }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${currentPage - 1}</span>
        </button>
    `;
  }
  generateNextButton(currentPage) {
    return `
        <button data-travel="${
          currentPage + 1
        }"class="btn--inline pagination__btn--next">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>`;
  }
}
export default new PaginationView();
