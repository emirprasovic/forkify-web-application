import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import searchResultsView from "./views/searchResultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/actual"; // For polyfilling everything except async js
import "regenerator-runtime/runtime"; // For polyfilling async js
import { MODAL_CLOSE_SEC } from "./config.js";

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

const getRecipe = async function () {
  try {
    // While the recipe gets fetched, we should display the spinner, and when we fetch the recipe and render it, the render phase first emptys the html content, meaning the spinner with it when the recipe gets loaded
    const id = window.location.hash.slice(1); // slice da sklonimo "#" symbol
    if (!id) throw "Id not set (hash). Not a big problem";

    recipeView.renderSpinner();

    // Update results view da highlightamo search result
    searchResultsView.update(model.getSearchResultsPage());

    // Da updateujemo unutar bookmarks koji je trenutno highlightan
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);
  } catch (e) {
    // console.error("Error from getRecice function: ", e);
    console.error(`Error caught in controller: ${e}`);
    if (!window.location.hash == "") {
      // console.log("empty");
      recipeView.renderError();
    }
  }
};

const getSearchResults = async function () {
  try {
    searchResultsView.renderSpinner();

    const search = searchView.getQuery();
    if (!search) return;

    await model.loadSearchResult(search);

    searchView.clearInput();
    searchResultsView.render(model.getSearchResultsPage(1)); // START AT PAGE 1

    // Render pagination buttons - trebamo proslijedit sve za search
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};
// getSearchResults();

const getPaginatedResults = function (goToPage) {
  console.log("pagination handler, go to page ", goToPage);
  searchResultsView.render(model.getSearchResultsPage(goToPage)); // Render new page of articles
  paginationView.render(model.state.search); // Update pagination buttons
};

const getServings = function (newServings) {
  // Update recipe servings
  model.updateServings(newServings);
  // Update the view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.removeBookmark(model.state.recipe.id);
  }
  recipeView.update(model.state.recipe);

  // Render bookmark in bookmarks tab
  if (model.state.bookmarks.length === 0) {
    bookmarksView.renderError();
  } else {
    bookmarksView.render(model.state.bookmarks);
  }
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    // Render added recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Re-render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.hideWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.log("Error while adding recipe: ", error);
    addRecipeView.renderError(error.message);
  }
};

// Ovako se handlaju eventi sa MVC architecture. U biti, view nam govori KADA se eventi trebaju slusati, a control govori KAKO da se event HANDLEA. To se radi zbog abstrakcije jer ne zelimo da view ima ikakve veze sa logikom, a i ne zelimo da controller ima ikakve veze sa DOM-om, jer se eventi stavljaju na DOM Elemente. Ne moramo ovo raditi, ali ako bas hocemo da sve razdvojimo, onda mozemo
const init = function () {
  model.restoreBookmarks();
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(getRecipe);
  searchView.addHandlerSearch(getSearchResults);
  paginationView.addHandlerClick(getPaginatedResults);
  recipeView.addHandlerUpdateServings(getServings);
  recipeView.addHandlerAddBookmark(controlBookmark);
  addRecipeView.addHandlerSubmitFrom(controlAddRecipe);
};
init();
