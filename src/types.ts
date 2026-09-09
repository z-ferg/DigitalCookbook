export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Course = 'Dinner' | 'Breakfast' | 'Baking' | 'Sides' | 'Sweets';

export interface Ingredient {
  id: string;
  qty: string;
  unit: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  difficulty: Difficulty;
  course: Course;
  source: string;
  notes: string;
  ingredients: Ingredient[];
  steps: string[];
  timesCooked: number;
  lastMade: string | null;
  createdAt: number;
}

export const COURSES: Course[] = ['Dinner', 'Breakfast', 'Baking', 'Sides', 'Sweets'];
export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
