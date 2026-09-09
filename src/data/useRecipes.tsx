import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Recipe } from '../types';
import { seedRecipes } from './seed';

const STORAGE_KEY = 'pantry.recipes.v1';

function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Recipe[];
  } catch {
    // fall through to seed data
  }
  return seedRecipes();
}

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export type NewRecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'timesCooked' | 'lastMade'>;

interface RecipesContextValue {
  recipes: Recipe[];
  getRecipe: (id: string) => Recipe | undefined;
  addRecipe: (input: NewRecipeInput) => Recipe;
  updateRecipe: (id: string, patch: Partial<NewRecipeInput>) => void;
  deleteRecipe: (id: string) => void;
  logCooked: (id: string) => void;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {
      // storage unavailable (private mode, quota) — state still works in-memory
    }
  }, [recipes]);

  const value = useMemo<RecipesContextValue>(
    () => ({
      recipes,
      getRecipe: (id) => recipes.find((r) => r.id === id),
      addRecipe: (input) => {
        const recipe: Recipe = {
          ...input,
          id: newId('recipe'),
          createdAt: Date.now(),
          timesCooked: 0,
          lastMade: null,
        };
        setRecipes((prev) => [recipe, ...prev]);
        return recipe;
      },
      updateRecipe: (id, patch) => {
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      },
      deleteRecipe: (id) => {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      },
      logCooked: (id) => {
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, timesCooked: r.timesCooked + 1, lastMade: new Date().toISOString().slice(0, 10) }
              : r,
          ),
        );
      },
    }),
    [recipes],
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used within a RecipesProvider');
  return ctx;
}

export function newIngredientId() {
  return newId('ing');
}
