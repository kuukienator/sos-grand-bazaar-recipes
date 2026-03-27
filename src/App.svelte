<script lang="ts">
import { onMount } from "svelte";
import { loadData } from "./lib/data";
import { type Recipe, SearchConditionMode } from "./lib/types";
import clsx from "clsx";

const GROUP_COLOR_MAP: Record<string, string> = {
	Salads: "bg-rose-200",
	Soups: "bg-fuchsia-200",
	Sides: "bg-blue-200",
	"Main Dishes": "bg-violet-200",
	Desserts: "bg-teal-200",
	"Other Recipes": "bg-lime-200",
};

let searchConditionMode = $state(SearchConditionMode.OR);
let recipesList: Recipe[] = $state([]);
let ingredientsList: string[] = $state([]);
let searchInput;
let inputValue = $state("");

let filteredRecipies: Recipe[] = $state([]);
let filteredIngredients: string[] = $state([]);
let selectedIngredients: string[] = $state([]);

onMount(async () => {
	const { recipes, ingredients } = await loadData();
	console.log(recipes);
	console.log(ingredients);
	console.log("Mounted");
	recipesList = recipes;
	ingredientsList = ingredients;
	filterRecipies();
});

const filterRecipies = () => {
	console.log("Filter recipies", searchConditionMode);
	if (selectedIngredients.length === 0) {
		filteredRecipies = recipesList;
	} else {
		if (searchConditionMode === SearchConditionMode.AND) {
			filteredRecipies = recipesList.filter((recipe) => {
				return selectedIngredients.every((ingredient) => {
					return recipe.ingredients.some((i) => {
						return Array.isArray(i.value)
							? i.value.includes(ingredient)
							: i.value === ingredient;
					});
				});
			});
		} else {
			filteredRecipies = recipesList.filter((recipe) => {
				return recipe.ingredients.some((ingredient) => {
					if (Array.isArray(ingredient.value)) {
						return ingredient.value.some((i) =>
							selectedIngredients.includes(i),
						);
					} else {
						return selectedIngredients.includes(ingredient.value);
					}
				});
			});
		}
	}
};

const onRemoveAllIngredients = () => {
	selectedIngredients = [];
	filterRecipies();
};

const onSelectedIngredient = (ingredient: string) => {
	if (selectedIngredients.includes(ingredient)) {
		selectedIngredients = selectedIngredients.filter((i) => i !== ingredient);
	} else {
		selectedIngredients = [...selectedIngredients, ingredient];
	}
	inputValue = "";
	filteredIngredients = [];
	filterRecipies();
};

const filterIngredients = () => {
	console.log("Filter", inputValue);
	if (inputValue) {
		filteredIngredients = ingredientsList.filter((i) =>
			i.toLowerCase().includes(inputValue.toLowerCase()),
		);
	}
};
</script>

<main class="flex flex-col mx-auto justify-center items-center px-8 gap-4">
    <h1 class="">SOS Grand Bazaar - Recipies Finder</h1>
    <div class="relative w-full">
        <input class="border-2 border-black rounded-md p-2 w-full"
               type="text"
               placeholder="Search for ingredients..."
               bind:this={searchInput}
               bind:value={inputValue}
               oninput={filterIngredients}>

        <div>
            Search Condition
            <label for={SearchConditionMode.AND}>
                <input type="radio" id={SearchConditionMode.OR} name="searchConditionMode"
                       value={SearchConditionMode.OR}
                       bind:group={searchConditionMode}/> OR
            </label>
            <label for={SearchConditionMode.AND}>
                <input type="radio" id={SearchConditionMode.AND} name="searchConditionMode"
                       value={SearchConditionMode.AND}
                       bind:group={searchConditionMode}/>AND
            </label>
        </div>

        {#if filteredIngredients.length > 0}
            <ul class="border-2 border-black rounded-md absolute w-full flex flex-col gap-1 z-10 bg-white drop-shadow-2xl">
                {#each filteredIngredients as ingredient}
                    <button
                            class="cursor-pointer hover:bg-gray-200 p-2 w-full text-left"
                            onclick={() => onSelectedIngredient(ingredient)}>{ingredient}</button>
                {/each}
            </ul>
        {/if}
    </div>
    {#if selectedIngredients.length > 0}
        <div class="flex flex-row gap-2 items-center">
            <div>Selected ingredients:</div>
            <div>
                {#each selectedIngredients as ingredient}
                    <button
                            onclick={() => onSelectedIngredient(ingredient)}
                            class="bg-green-200 p-2">
                        {ingredient}
                    </button>
                {/each}
            </div>
            <div>
                <button onclick={onRemoveAllIngredients} class="bg-black text-white p-2">Remove all</button>
            </div>
        </div>
    {/if}
    {#if filteredRecipies.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
            {#each filteredRecipies as recipe}
                <div class={clsx("border-2 border-black rounded-md p-2 flex flex-col gap-2", GROUP_COLOR_MAP[recipe.group])}>
                    <div>{recipe.name} - {recipe.group}</div>
                    <div>{recipe.baseValue.value} {recipe.baseValue.unit}</div>
                    <div class="grid grid-cols-4 gap-2">
                        {#each recipe.ingredients as ingredient}
                            <div class="flex flex-col gap-1">
                                <div>{ingredient.slot}</div>
                                {#if Array.isArray(ingredient.value)}
                                    <div class="flex flex-col gap-1">
                                        {#each ingredient.value as v}
                                            <div class={clsx("p-1 rounded", {
                                                "bg-green-300": selectedIngredients.includes(v),
                                                "bg-blue-300": !selectedIngredients.includes(v),
                                            })}>{v}</div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class={clsx("p-1 rounded", {
                                                "bg-green-300": selectedIngredients.includes(ingredient.value),
                                                "bg-blue-300": !selectedIngredients.includes(ingredient.value),
                                            })}>{ingredient.value}</div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</main>
