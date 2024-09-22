import { API_URL, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helper.js";
import { AJAX } from "./helper.js";
import { RESULTS_PER_PAGE } from "./config.js";

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = (data) => {
  // Reformat the recipe to make it cleaner
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // koristimo short circuting, ako recipe.key postoji, onda ce citav expression postat ovaj drugi dio, i njega spreadamo
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(
      `${API_URL}/${id}?key=4527c6e0-9c24-49eb-aad3-4f113e35d448`
    );

    // Reformat the recipe to make it cleaner
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some((bookmark) => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    console.log("Error caught in model while loading recipe: ", error);
    throw error;
  }
};

export const loadSearchResult = async function (search) {
  try {
    const data = await AJAX(`${API_URL}?search=${search}&key=${KEY}`);
    console.log(data);

    state.search.query = search;

    state.search.results = data.data.recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page; // da znamo na kojem smo page-u

  const start = state.search.resultsPerPage * (page - 1);
  const end = state.search.resultsPerPage * page; // inace ide -1, ali slice ne uzima zadnji element
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    // NewQt = oldQt * (newServ/oldServ)
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem("forkify-bookmarks", JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked

  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

export const removeBookmark = function (id) {
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistBookmarks();
};

export const restoreBookmarks = function () {
  const storage = localStorage.getItem("forkify-bookmarks");
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
};
restoreBookmarks();

export const uploadRecipe = async function (newRecipe) {
  // Object.entries() vraca array key-value parova od objekta. Sto znaci entry[0] je naziv tj. key, a entry[1] je value
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map((ing) => {
        const ingArr = ing[1].split(",").map((ing) => ing.trim());
        if (ingArr.length !== 3) throw new Error("Wrong ingredient format");

        const [quantity, unit, description] = ingArr;
        // return se nalazi u map() funkciji, i ovo nam vraca nakon svake iteracije i re-mapa kao novi element ingredients array-a
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: newRecipe.cookingTime,
      servings: newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    console.log(data);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
    console.log(recipe);
    console.log(state.recipe);
  } catch (error) {
    throw error;
  }
};
