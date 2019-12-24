import axios from 'axios';

export default class Recipe{
    constructor(id){
        this.id=id;
    };
    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title=res.data.recipe.title;
            this.auther = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.ingredients = res.data.recipe.ingredients;
            this.url = res.data.recipe.source_url;

        } catch (error) {
            alert('somthin went wrong!')
        }
        
    }
    calcTime(){
        const numIg=this.ingredients.length;
        const periods=Math.ceil(numIg/3);
        this.time=periods*15;
    };
    calcServing(){
        this.serving=4;
    }

    pasreIngredients(){
        const unitsLong=['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitsShort=['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const newIngredients=this.ingredients.map(el=>{
            // 1- uniform units
            let ingredient=el.toLowerCase();
            unitsLong.forEach((unit,i)=>{
                ingredient=ingredient.replace(unit,unitsShort[i]);
            });
            // 2- remove paerntheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
            // 3- parse ingredients into counts,units and ingredient
            const arrIng=ingredient.split(' ');
            const unitIndex=arrIng.findIndex(el=>unitsShort.includes(el));
            
            let objIng;
            if(unitIndex >-1){
                // there is a unit
                const arrCount=arrIng.slice(0,unitIndex);
                let count;
                if(arrCount.length===1){
                    count=eval(arrIng[0].replace('-','+'));
                }else{
                    count=eval(arrCount.join('+'))
                };
                objIng={
                    count:count,
                    unit:arrIng[unitIndex],
                    ingredient:arrIng.slice(unitIndex+1).join(' ')
                }

            }else if(parseInt(arrIng[0])){
                //ther is a number
                objIng = {
                    count: parseInt(arrIng[0]),
                    unit: "",
                    ingredient: arrIng.slice(1).join(' ')
                };
            }else if(unitIndex===-1){
                //there is no unit or number
                objIng={
                    count:1,
                    unit:'',
                    ingredient:ingredient,
                }
            };


            return objIng;
        });
        this.ingredients=newIngredients;
    }
    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.serving - 1 : this.serving + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.serving);
        });

        this.serving = newServings;
    }
};
