import Search from './models/Search';
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from './models/Likes'
import {elements,renderLoader,clearLoader} from './views/base';
import * as searchView from './views/searchView'
import * as recipeViews from "./views/recipeViews";
import * as listViews from "./views/listViews";
import * as likesView from "./views/likesView";



const state={}



const controlSearch=async()=>{
     //1-get query from view
    const query=searchView.getInput();
    
    if(query){
    //new search object and add to state 
        state.search=new Search(query);
    //3-prepare UI for the result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
    //4- seach for recipe
        
        await state.search.getResults();
    //5- render result on UI    
        clearLoader();
        searchView.renderResults(state.search.result);
    }
};


elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();
});



elements.searchResPage.addEventListener('click',e=>{
    const btn = e.target.closest(".btn-inline");
    if(btn){
        const goToPage=parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    };

});

const controlList=()=>{
    if(!state.list) state.list=new List();
    state.recipe.ingredients.forEach(el=>{
        const item= state.list.addItem(el.count,el.unit,el.ingredient)
        listViews.renderItem(item);
    })
};

elements.shopping.addEventListener('click',e=>{
    const id = e.target.closest(".shopping__item ,shopping__item *").dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listViews.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val=parseInt(e.target.value);
        state.list.updateCount(id,val);
    }
})

const controlRecipe=async()=>{
        //get id
    const id=window.location.hash.replace('#','');;
    if(id){
        //prepare UI for results
        recipeViews.clearRecipe();
        renderLoader(elements.recipe)
        //creat new recipe object
        state.recipe=new Recipe(id);
        
        try {
            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.pasreIngredients();
            //calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServing();
            //render recipe
            clearLoader();
            recipeViews.renderRecipe(state.recipe)
        } catch (err) {
            alert('Error')
        }
    }

};
['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));




const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if (!state.likes.isLiked(currentID)) {
        const newLike = state.likes.addLike(
        currentID,
        state.recipe.title,
        state.recipe.author,
        state.recipe.img
        );
        likesView.toggleLikeBtn(true);

        likesView.renderLike(newLike);

    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    };

window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});



elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        if(state.recipe.serving>1){
            state.recipe.updateServings("dec");
            recipeViews.updateServingsIngredients(state.recipe)
        };
    }else if (e.target.matches(".btn-increase,.btn-increase *")) {
        state.recipe.updateServings("inc");
        recipeViews.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if (e.target.matches(".recipe__love, .recipe__love *")) {
        controlLike();
    };
    
})
