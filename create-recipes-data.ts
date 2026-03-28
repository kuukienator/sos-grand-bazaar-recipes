import fs from "node:fs/promises";
import { loadData } from "./src/lib/data";

const init = async () => {
	const { recipes, ingredients } = await loadData();

	const data = `
    import type { Recipe } from "../lib/types";
    export const recipes: Recipe[] = ${JSON.stringify(recipes)};
    export const ingredients: string[] = ${JSON.stringify(ingredients)};
    `;

	await fs.writeFile("./src/assets/data.ts", data);
};

init();
