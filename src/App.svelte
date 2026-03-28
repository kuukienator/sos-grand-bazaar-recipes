<script lang="ts">
import { onMount } from "svelte";
import { loadData } from "./lib/data";
import { type Recipe } from "./lib/types";
import clsx from "clsx";

const GROUP_COLOR_MAP: Record<string, string> = {
	Salads: "bg-rose-200",
	Soups: "bg-fuchsia-200",
	Sides: "bg-blue-200",
	"Main Dishes": "bg-violet-200",
	Desserts: "bg-teal-200",
	"Other Recipes": "bg-lime-200",
};

let isLoading = $state(true);
let includeAllIngredientsInRecipe = $state(true);
let recipesList: Recipe[] = $state([]);
let ingredientsList: string[] = $state([]);
let inputValue = $state("");

let filteredRecipies: Recipe[] = $state([]);
let filteredIngredients: string[] = $state([]);
let selectedIngredients: string[] = $state([]);

onMount(async () => {
	const { recipes, ingredients } = await loadData();
	recipesList = recipes;
	ingredientsList = ingredients;
	filterRecipies();
	isLoading = false;
});

const filterRecipies = () => {
	if (selectedIngredients.length === 0) {
		filteredRecipies = recipesList;
	} else {
		if (includeAllIngredientsInRecipe) {
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

<main class="flex flex-col mx-auto justify-center items-center px-8 gap-4 bg-mainWhite text-mainText py-8">
    <h1 class="text-2xl font-bold">SOS Grand Bazaar - Recipe Finder</h1>
    <div class="relative w-full">
        <input class="border-2 border-border rounded-xl p-2 w-full"
               type="text"
               placeholder="Search for ingredients..."
               bind:value={inputValue}
               oninput={filterIngredients}>

        {#if filteredIngredients.length > 0}
            <ul class="border-2 border-border rounded-md absolute w-full flex flex-col gap-1 z-10 bg-card drop-shadow-2xl">
                {#each filteredIngredients as ingredient}
                    <button
                            class="cursor-pointer hover:bg-cardInner p-2 w-full text-left"
                            onclick={() => onSelectedIngredient(ingredient)}>{ingredient}</button>
                {/each}
            </ul>
        {/if}
    </div>
    <label for="andCondition" class="text-lg">
        Recipe must include *ALL* ingredients
        <input type="checkbox" name="andCondition" id="andCondition" bind:checked={includeAllIngredientsInRecipe}
               onchange={filterRecipies}>
    </label>
    {#if selectedIngredients.length > 0}
        <div class="flex flex-row gap-2 items-center">
            {#each selectedIngredients as ingredient}
                <button
                        onclick={() => onSelectedIngredient(ingredient)}
                        class="bg-highlight p-2 cursor-pointer rounded text-mainWhite">
                    {ingredient}
                </button>
            {/each}
            <div>
                <button onclick={onRemoveAllIngredients} class="bg-button text-white p-2 cursor-pointer rounded-3xl">Remove all
                </button>
            </div>
        </div>
    {/if}
    {#if isLoading}
        <div>Loading...</div>
    {/if}
    {#if filteredRecipies.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
            {#each filteredRecipies as recipe}
                <div class="bg-card rounded-xl p-2">
                    <div class={clsx("h-full border-2 rounded-xl p-2 flex flex-col gap-2 bg-card border-border text-mainText")}>
                        <div class="font-bold text-2xl">{recipe.name}</div>
                        <div class="text-xl text-secondaryText">{recipe.group}</div>
                        <div class="flex text-xl">
                            <div class="bg-price1 p-1 pl-2 rounded-l-xl">Sales Price</div>
                            <div class="bg-mainWhite p-1 pr-2 rounded-r-xl">{recipe.baseValue.value}{recipe.baseValue.unit}</div>
                        </div>
                        <div class="grid grid-cols-4 gap-2 bg-cardInner rounded-xl p-2">
                            {#each recipe.ingredients as ingredient}
                                <div class="flex flex-col gap-1 text-center">
                                    {#if Array.isArray(ingredient.value)}
                                        <div class="flex flex-col gap-1">
                                            {#each ingredient.value as v}
                                                <div class={clsx("p-1 rounded-xl", {
                                                    "bg-highlight text-mainWhite": selectedIngredients.includes(v),
                                                    "bg-card": !selectedIngredients.includes(v),
                                                })}>{v}</div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div class={clsx("p-1 rounded-xl", {
                                                    "bg-highlight text-mainWhite": selectedIngredients.includes(ingredient.value),
                                                    "bg-card": !selectedIngredients.includes(ingredient.value),
                                                })}>{ingredient.value}</div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</main>
<footer class="w-full flex justify-center gap-2 py-2">
    <p>2026</p>
    |
    <a href="https://www.ema.codes" target="_blank">www.ema.codes</a>
    |
    <a href="https://bsky.app/profile/ema.codes" target="_blank">@ema.codes</a>
</footer>
