<script lang="ts">
    import {onMount} from "svelte";
    import {loadData} from "./lib/data";
    import {type Recipe} from "./lib/types";
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
        const {recipes, ingredients} = await loadData();
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

<main class="flex flex-col mx-auto justify-center items-center px-8 gap-4">
    <h1 class="text-2xl">SOS Grand Bazaar - Recipe Finder</h1>
    <div class="relative w-full">
        <input class="border-2 border-black rounded-md p-2 w-full"
               type="text"
               placeholder="Search for ingredients..."
               bind:value={inputValue}
               oninput={filterIngredients}>

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
                        class="bg-green-200 p-2 cursor-pointer rounded">
                    {ingredient}
                </button>
            {/each}
            <div>
                <button onclick={onRemoveAllIngredients} class="bg-black text-white p-2 cursor-pointer">Remove all
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
