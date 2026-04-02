<script lang="ts">
import { type Recipe } from "./lib/types";
import clsx from "clsx";
import { ingredients, recipes } from "./assets/data";

let isLoading = $state(false);
let includeAllIngredientsInRecipe = $state(true);
let recipesList: Recipe[] = $state([...recipes]);
let ingredientsList: string[] = $state([...ingredients]);
let inputValue = $state("");

let filteredRecipies: Recipe[] = $state([...recipes]);
let filteredIngredients: string[] = $state([...ingredients]);
let selectedIngredients: string[] = $state([]);
let isOpen = $state(false);
let highlightedIndex = $state(-1);

let listEl: HTMLUListElement = $state(null as unknown as HTMLUListElement);

const getAssetName = (name: string): string => {
	return name
		.replace(/[^\w\-. ]/g, "_")
		.replaceAll(" ", "_")
		.trim();
};

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
	filterIngredients();
	filterRecipies();
};

const filterIngredients = () => {
	highlightedIndex = -1;
	if (inputValue) {
		filteredIngredients = ingredientsList.filter((i) =>
			i.toLowerCase().includes(inputValue.toLowerCase()),
		);
	} else {
		filteredIngredients = [...ingredientsList];
	}
};

const onFocus = () => {
	isOpen = true;
	filterIngredients();
};

const onBlur = () => {
	setTimeout(() => {
		isOpen = false;
		highlightedIndex = -1;
	}, 150);
};

const scrollHighlighted = () => {
	if (listEl && highlightedIndex >= 0) {
		const item = listEl.children[highlightedIndex] as HTMLElement;
		item?.scrollIntoView({ block: "nearest" });
	}
};

const onKeyDown = (e: KeyboardEvent) => {
	if (!isOpen) {
		if (e.key === "ArrowDown") {
			isOpen = true;
			filterIngredients();
		}
		return;
	}

	switch (e.key) {
		case "ArrowDown":
			e.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % filteredIngredients.length;
			scrollHighlighted();
			break;
		case "ArrowUp":
			e.preventDefault();
			highlightedIndex =
				highlightedIndex <= 0
					? filteredIngredients.length - 1
					: highlightedIndex - 1;
			scrollHighlighted();
			break;
		case "Enter":
			e.preventDefault();
			if (highlightedIndex >= 0) {
				onSelectedIngredient(filteredIngredients[highlightedIndex]);
			}
			break;
		case "Escape":
			isOpen = false;
			highlightedIndex = -1;
			break;
		case "Backspace":
			if (!inputValue && selectedIngredients.length > 0) {
				onSelectedIngredient(
					selectedIngredients[selectedIngredients.length - 1],
				);
			}
			break;
	}
};
</script>

<main class="flex flex-col mx-auto justify-center items-center px-8 gap-4 bg-mainWhite text-mainText py-8">
    <h1 class="text-2xl font-bold">SOS Grand Bazaar - Recipe Finder</h1>
    <div class="relative w-full">
        <label class="border-2 border-border focus-within:border-highlight rounded-xl p-2 w-full flex flex-wrap gap-1 items-center min-h-11.5 transition-colors cursor-pointer">
            {#each selectedIngredients as ingredient}
                <span class="bg-highlight text-mainWhite px-2 py-0.5 rounded-lg flex items-center gap-1 text-sm cusor-pointer">
                    {ingredient}
                    <button aria-label="Remove {ingredient}"
                            class="hover:opacity-75 flex items-center cusor-pointer"
                            onmousedown={(e) => e.preventDefault()}
                            onclick={(e) => {
                                e.stopPropagation();
                                onSelectedIngredient(ingredient);
                            }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </span>
            {/each}
            <input class="outline-none flex-1 min-w-35 bg-transparent cursor-text"
                   type="text"
                   placeholder={selectedIngredients.length === 0 ? "Search for ingredients..." : ""}
                   bind:value={inputValue}
                   oninput={filterIngredients}
                   onfocus={onFocus}
                   onblur={onBlur}
                   onkeydown={onKeyDown}>
            {#if selectedIngredients.length > 0}
                <button aria-label="Clear all ingredients"
                        class="text-mainWhite hover:bg-button/80 flex items-center p-1 transition-colors bg-button rounded-xl cursor-pointer"
                        onmousedown={(e) => e.preventDefault()}
                        onclick={(e) => {
                            e.stopPropagation();
                            onRemoveAllIngredients();
                        }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            {/if}
        </label>

        {#if isOpen && filteredIngredients.length > 0}
            <ul bind:this={listEl}
                class="border-2 border-border rounded-md absolute w-full flex flex-col z-10 bg-card drop-shadow-2xl max-h-96 overflow-y-auto mt-1">
                {#each filteredIngredients as ingredient, i}
                    <button
                            class={clsx("cursor-pointer p-2 w-full text-left flex items-center justify-between", {
                                "bg-cardInner": i === highlightedIndex,
                                "hover:bg-cardInner": i !== highlightedIndex,
                            })}
                            onmousedown={(e) => e.preventDefault()}
                            onclick={() => onSelectedIngredient(ingredient)}>
                        <span>{ingredient}</span>
                        {#if selectedIngredients.includes(ingredient)}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        {/if}
                    </button>
                {/each}
            </ul>
        {/if}
    </div>
    <div class="flex justify-center items-center gap-2">
        <label for="andCondition" class="text-lg cursor-pointer">
            Recipe must include *ALL* ingredients
        </label>
        <input class="accent-button w-5 h-5 cursor-pointer" type="checkbox" name="andCondition" id="andCondition"
               bind:checked={includeAllIngredientsInRecipe}
               onchange={filterRecipies}>
    </div>
    {#if isLoading}
        <div>Loading...</div>
    {/if}
    {#if filteredRecipies.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
            {#each filteredRecipies as recipe}
                <div class="bg-card rounded-xl p-2">
                    <div class={clsx("h-full border-2 rounded-xl p-2 flex flex-col gap-2 bg-card border-border text-mainText")}>
                        <div class="font-bold text-2xl self-center">{recipe.name}</div>
                        <img class="h-16 self-center my-2" src={`/recipe-images/${getAssetName(recipe.name)}.png`}
                             alt={recipe.name} loading="lazy"/>
                        <div class="text-xl text-secondaryText">{recipe.group}</div>
                        <div class="flex text-xl">
                            <div class="bg-price1 p-1 pl-2 rounded-l-xl">Sales Price</div>
                            <div class="bg-mainWhite p-1 pr-2 rounded-r-xl">{recipe.baseValue.value}{recipe.baseValue.unit}</div>
                        </div>
                        <div class="sm:grid sm:grid-rows-1 sm:grid-cols-4 gap-2 bg-cardInner rounded-xl p-2">
                            {#each recipe.ingredients as ingredient}
                                <div class="sm:hidden">{ingredient.slot}</div>
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
<div class="w-full text-center">Data from <a
        class="hover:underline cursor-pointer"
        href="https://www.reddit.com/r/storyofseasons/comments/1ngavo2/sos_gb_recipes_and_crops_spreadsheets/">u/AludraKijurorin</a>
    -
    <a class="hover:underline cursor-pointer"
       href="https://docs.google.com/spreadsheets/d/17PUAMn7zTDnfk0vSOyO5nP_Q4e5YAtc4huzmq06KfLg/edit?gid=0#gid=0">Link
        to source data
        sheet</a>
</div>
<footer class="w-full flex justify-center gap-2 py-2">
    <p>2026</p>
    |
    <a class="hover:underline cursor-pointer" href="https://www.ema.codes" target="_blank">www.ema.codes</a>
    |
    <a class="hover:underline cursor-pointer" href="https://bsky.app/profile/ema.codes" target="_blank">@ema.codes</a>
    |
    <a href="https://github.com/kuukienator/sos-grand-bazaar-recipes">Source</a>
</footer>
