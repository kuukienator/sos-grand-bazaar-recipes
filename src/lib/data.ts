import Papa from "papaparse";
import type { Ingredient, RawRecipeRow, RawRow, Recipe, Value } from "./types";

const isRawRecipeRow = (row: RawRow): row is RawRecipeRow => {
	return (row as RawRecipeRow)["Ingredient 1"] !== undefined;
};

const parseValue = (value: string): Value => {
	return {
		value: Number(value.toUpperCase().replace("G", "").replace(",", "")),
		unit: "G",
	};
};

const parseIngredientEntry = (entry: string): string | string[] => {
	const values = entry
		.split(",")
		.map((e) => e.trim())
		.filter((e) => e !== "");
	return values.length > 1 ? values : values[0];
};

const parseIngredients = (row: RawRecipeRow): Ingredient[] => {
	return [
		{
			value: parseIngredientEntry(row["Ingredient 1"]),
			slot: "Ingredient 1",
		},
		{
			value: parseIngredientEntry(row["Ingredient 2"]),
			slot: "Ingredient 2",
		},
		{
			value: parseIngredientEntry(row["Ingredient 3"]),
			slot: "Ingredient 3",
		},
		{
			value: parseIngredientEntry(row["Ingredient 4"]),
			slot: "Ingredient 4",
		},
	].filter((i) => i.value !== "" && i.value !== undefined);
};

const convertRecipies = (rawData: RawRow[]): Recipe[] => {
	let currentGroup: string = "";
	const recipes: Recipe[] = [];
	rawData.forEach((row) => {
		if (isRawRecipeRow(row)) {
			recipes.push({
				name: row["Recipe Name"],
				group: currentGroup,
				ingredients: parseIngredients(row),
				baseValue: parseValue(row["Base Value"]),
				effect: row["Effect"] || undefined,
				usedForFestival: row["Used for Festivals"] || undefined,
				whereToUnlock: row["Where to Unlock"] || undefined,
			});
		} else {
			currentGroup = row["Recipe Name"];
		}
	});

	return recipes;
};
export const loadData = async () => {
	const res = await fetch(
		"https://docs.google.com/spreadsheets/d/17PUAMn7zTDnfk0vSOyO5nP_Q4e5YAtc4huzmq06KfLg/export?format=csv",
	);
	const data = await res.text();
	const cleanData = data
		.replaceAll("I made an alternate spreadsheet with recipe pictures!", "")
		.replaceAll("You can go to the pictureless spreadsheet here!", "")
		.replaceAll(
			"Note: Recipes are organized in the kitchen as follows: Recipe type > Effect type > Base Value. This guide is organized by the bookshelf collection's layout, so a few recipes may be shifted.",
			"",
		)
		.replaceAll(",,,,,,,,", "")
		.replaceAll('""', "")
		.trim();
	const parsedData = Papa.parse<RawRow>(cleanData, { header: true });
	// console.log(parsedData.data);

	const recipes = convertRecipies(parsedData.data);
	const ingredients = Array.from(
		new Set(recipes.flatMap((r) => r.ingredients.flatMap((i) => i.value))),
	)
		.sort()
		.filter((i) => i !== "");
	// https://docs.google.com/spreadsheets/d/1Kk3nKjvrO3Z-YAIqexVx6E4ncyz2_55c0vezXGn5LqQ/export?format=csv

	return { recipes, ingredients };
};
