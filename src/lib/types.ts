export interface RawGroupRow {
	"Recipe Name": string;
}

export interface RawRecipeRow {
	"Recipe Name": string;
	"Ingredient 1": string;
	"Ingredient 2": string;
	"Ingredient 3": string;
	"Ingredient 4": string;
	"Base Value": string;
	Effect: string;
	"Used for Festivals": string;
	"Where to Unlock": string;
}

export type RawRow = RawGroupRow | RawRecipeRow;

export interface Value {
	value: number;
	unit: string;
}

export interface Ingredient {
	slot: string;
	value: string | string[];
}

export interface Recipe {
	name: string;
	group: string;
	ingredients: Ingredient[];
	baseValue: Value;
	effect?: string;
	usedForFestival?: string;
	whereToUnlock?: string;
}
