import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Main store for application data
export const useStore = create((set, get) => ({
  // Data
  cakes: [],
  ingredients: [],
  recipes: [],
  productions: [],
  distributions: [],
  
  // Loading states
  loading: {
    cakes: false,
    ingredients: false,
    recipes: false,
    productions: false,
    distributions: false,
  },
  
  // Fetch data functions
  fetchCakes: async () => {
    set(state => ({ loading: { ...state.loading, cakes: true } }));
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching cakes:', error);
    } else {
      set({ cakes: data });
    }
    set(state => ({ loading: { ...state.loading, cakes: false } }));
  },
  
  fetchIngredients: async () => {
    set(state => ({ loading: { ...state.loading, ingredients: true } }));
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching ingredients:', error);
    } else {
      set({ ingredients: data });
    }
    set(state => ({ loading: { ...state.loading, ingredients: false } }));
  },
  
  fetchRecipes: async () => {
    set(state => ({ loading: { ...state.loading, recipes: true } }));
    const { data, error } = await supabase
      .from('recipes')
      // appStore.js - fetchRecipes
      .select('*, cake_id(name), recipe_ingredients(ingredient_id(name, unit), quantity_needed)')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching recipes:', error);
    } else {
      set({ recipes: data });
    }
    set(state => ({ loading: { ...state.loading, recipes: false } }));
  },
  
  fetchProductions: async () => {
    set(state => ({ loading: { ...state.loading, productions: true } }));
    const { data, error } = await supabase
      .from('productions')
      .select('*, recipe_id(recipes(cake_id(cakes(name)), batch_yield)), user_id(auth.users(email))')
      .order('production_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching productions:', error);
    } else {
      set({ productions: data });
    }
    set(state => ({ loading: { ...state.loading, productions: false } }));
  },
  
  fetchDistributions: async () => {
    set(state => ({ loading: { ...state.loading, distributions: true } }));
    const { data, error } = await supabase
      .from('distributions')
      .select('*, distribution_items!inner(cake_id(cakes(name)), quantity_distributed, quantity_damaged)')
      .order('distribution_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching distributions:', error);
    } else {
      set({ distributions: data });
    }
    set(state => ({ loading: { ...state.loading, distributions: false } }));
  },
  
  // Initialize all data
  initializeData: async () => {
    await Promise.all([
      get().fetchCakes(),
      get().fetchIngredients(),
      get().fetchRecipes(),
      get().fetchProductions(),
      get().fetchDistributions()
    ]);
  },
  
  // Update functions
  updateCake: (updatedCake) => {
    set(state => ({
      cakes: state.cakes.map(cake => 
        cake.id === updatedCake.id ? updatedCake : cake
      )
    }));
  },
  
  addCake: (newCake) => {
    set(state => ({
      cakes: [...state.cakes, newCake]
    }));
  },
  
  deleteCake: (id) => {
    set(state => ({
      cakes: state.cakes.filter(cake => cake.id !== id)
    }));
  },
  
  updateIngredient: (updatedIngredient) => {
    set(state => ({
      ingredients: state.ingredients.map(ing => 
        ing.id === updatedIngredient.id ? updatedIngredient : ing
      )
    }));
  },
  
  addIngredient: (newIngredient) => {
    set(state => ({
      ingredients: [...state.ingredients, newIngredient]
    }));
  },
  
  deleteIngredient: (id) => {
    set(state => ({
      ingredients: state.ingredients.filter(ing => ing.id !== id)
    }));
  },
  
  updateRecipe: (updatedRecipe) => {
    set(state => ({
      recipes: state.recipes.map(recipe => 
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    }));
  },
  
  addRecipe: (newRecipe) => {
    set(state => ({
      recipes: [...state.recipes, newRecipe]
    }));
  },
  
  deleteRecipe: (id) => {
    set(state => ({
      recipes: state.recipes.filter(recipe => recipe.id !== id)
    }));
  },
  
  updateProduction: (updatedProduction) => {
    set(state => ({
      productions: state.productions.map(prod => 
        prod.id === updatedProduction.id ? updatedProduction : prod
      )
    }));
  },
  
  addProduction: (newProduction) => {
    set(state => ({
      productions: [...state.productions, newProduction]
    }));
  },
  
  updateDistribution: (updatedDistribution) => {
    set(state => ({
      distributions: state.distributions.map(dist => 
        dist.id === updatedDistribution.id ? updatedDistribution : dist
      )
    }));
  },
  
  addDistribution: (newDistribution) => {
    set(state => ({
      distributions: [...state.distributions, newDistribution]
    }));
  },
}));