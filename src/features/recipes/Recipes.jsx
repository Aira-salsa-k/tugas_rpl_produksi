// import { useState, useEffect } from 'react';
// import { useStore } from '../../store/appStore';
// import { useAuth } from '../../contexts/AuthContext';

// export default function Recipes() {
//   const [selectedCake, setSelectedCake] = useState('');
//   const [batchYield, setBatchYield] = useState('');
//   const [selectedIngredient, setSelectedIngredient] = useState('');
//   const [quantityNeeded, setQuantityNeeded] = useState('');
//   const [recipeIngredients, setRecipeIngredients] = useState([]);
//   const [editingRecipeId, setEditingRecipeId] = useState(null);

//   const { 
//     cakes, 
//     ingredients, 
//     recipes,
//     loading: { recipes: loading },
//     fetchRecipes,
//     updateRecipe,
//     addRecipe,
//     deleteRecipe
//   } = useStore();
  
//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     const supabaseClient = getSupabaseWithAuth();
//     fetchRecipes(supabaseClient);
//   }, [fetchRecipes, getSupabaseWithAuth]);

//   const handleAddIngredient = () => {
//     if (!selectedIngredient || !quantityNeeded) return;
    
//     const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
//     if (!ingredient) return;
    
//     const newIngredient = {
//   id: Date.now(), // temporary ID for UI
//   ingredient_id: selectedIngredient,  // <--- ini HARUS berisi UUID dari ingredient
//   ingredient_name: ingredient.name,
//   quantity_needed: parseInt(quantityNeeded)
// };

    
//     setRecipeIngredients([...recipeIngredients, newIngredient]);
//     setSelectedIngredient('');
//     setQuantityNeeded('');
//   };

//   const handleRemoveIngredient = (id) => {
//     setRecipeIngredients(recipeIngredients.filter(ing => ing.id !== id));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedCake || !batchYield || recipeIngredients.length === 0) {
//       alert('Please fill all fields and add at least one ingredient');
//       return;
//     }
    
//     try {
//       const supabaseClient = getSupabaseWithAuth();
      
//       // Start a transaction by using a single insert call
//       if (editingRecipeId) {
//         // Update existing recipe
//         const { data: { session } } = await supabaseClient.auth.getSession();

//         const { error: updateRecipeError } = await supabaseClient
//           .from('recipes')
//           .update({
//             user_id: session.user.id, // pastikan tetap milik user yang sedang login
//             cake_id: selectedCake,
//             batch_yield: parseInt(batchYield)
//           })
//           .eq('id', editingRecipeId);

          
//         if (updateRecipeError) throw updateRecipeError;
        
//         // Delete existing recipe ingredients
//         await supabaseClient
//           .from('recipe_ingredients')
//           .delete()
//           .eq('recipe_id', editingRecipeId);
          
//         // Add new recipe ingredients
//         const recipeIngredientsWithRecipeId = recipeIngredients.map(ri => ({
//           recipe_id: editingRecipeId,
//           ingredient_id: ri.ingredient_id,
//           quantity_needed: ri.quantity_needed
//         }));
        
//         const { error: insertIngredientsError } = await supabaseClient
//           .from('recipe_ingredients')
//           .insert(recipeIngredientsWithRecipeId);
          
//         if (insertIngredientsError) throw insertIngredientsError;
        
//         // Update the recipe in the store
//         const updatedRecipe = {
//           id: editingRecipeId,
//           cake_id: selectedCake,
//           batch_yield: parseInt(batchYield),
//           recipe_ingredients: recipeIngredients
//         };
//         updateRecipe(updatedRecipe);
//       } else {
//         // Create new recipe
//       const { data: { session } } = await supabaseClient.auth.getSession();

//       const { data: newRecipe, error: recipeError } = await supabaseClient
//         .from('recipes')
//         .insert([
//           {
//             user_id: session.user.id,
//             cake_id: selectedCake,
//             batch_yield: parseInt(batchYield)
//           }
//         ])
//         .select()
//         .single();

        
//         // Add recipe ingredients
//         const recipeIngredientsWithRecipeId = recipeIngredients.map(ri => ({
//           recipe_id: newRecipe.id,
//           ingredient_id: ri.ingredient_id,
//           quantity_needed: ri.quantity_needed
//         }));
        
//         const { error: insertIngredientsError } = await supabaseClient
//           .from('recipe_ingredients')
//           .insert(recipeIngredientsWithRecipeId);
          
//         if (insertIngredientsError) throw insertIngredientsError;
        
//         // Add the new recipe to the store
//         const fullRecipe = {
//           ...newRecipe,
//           recipe_ingredients: recipeIngredients
//         };
//         addRecipe(fullRecipe);
//       }
      
//       // Reset form
//       setSelectedCake('');
//       setBatchYield('');
//       setRecipeIngredients([]);
//       setEditingRecipeId(null);
//     } catch (error) {
//       console.error('Error saving recipe:', error);
//       alert('Error saving recipe: ' + error.message);
//     }
//   };

//   const handleEdit = async (recipe) => {
//     setSelectedCake(recipe.cake_id);
//     setBatchYield(recipe.batch_yield);
//     setEditingRecipeId(recipe.id);
    
//     // Load recipe ingredients
//     const supabaseClient = getSupabaseWithAuth();
//     const { data, error } = await supabaseClient
//       .from('recipe_ingredients')
//       .select('*, ingredient_id(name)')
//       .eq('recipe_id', recipe.id);
      
//     if (error) {
//       console.error('Error fetching recipe ingredients:', error);
//       return;
//     }
//     const ingredientsWithNames = data.map(ri => ({
//   id: ri.id,
//   ingredient_id: ri.ingredient_id.id, // Ambil ID aslinya jika perlu
//   ingredient_name: ri.ingredient_id.name, // <-- BENAR
//   quantity_needed: ri.quantity_needed
  
//     }));
    
//     setRecipeIngredients(ingredientsWithNames);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
//     try {
//       const supabaseClient = getSupabaseWithAuth();
//       // Delete recipe ingredients first
//       await supabaseClient
//         .from('recipe_ingredients')
//         .delete()
//         .eq('recipe_id', id);
      
//       // Then delete the recipe
//       const { error } = await supabaseClient
//         .from('recipes')
//         .delete()
//         .eq('id', id);
      
//       if (error) throw error;
      
//       deleteRecipe(id);
//     } catch (error) {
//       console.error('Error deleting recipe:', error);
//       alert('Error deleting recipe: ' + error.message);
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Recipes Management</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold mb-4">
//           {editingRecipeId ? 'Edit Recipe' : 'Add New Recipe'}
//         </h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Cake</label>
//               <select
//                 value={selectedCake}
//                 onChange={(e) => setSelectedCake(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               >
//                 <option value="">Select a cake</option>
//                 {cakes.map(cake => (
//                   <option key={cake.id} value={cake.id}>{cake.name}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Batch Yield</label>
//               <input
//                 type="number"
//                 value={batchYield}
//                 onChange={(e) => setBatchYield(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
//           </div>
          
//           <div className="border-t border-gray-200 pt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Recipe Ingredients</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
//                 <select
//                   value={selectedIngredient}
//                   onChange={(e) => setSelectedIngredient(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                   <option value="">Select an ingredient</option>
//                   {ingredients.map(ingredient => (
//                     <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
//                 <input
//                   type="number"
//                   value={quantityNeeded}
//                   onChange={(e) => setQuantityNeeded(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//             </div>
            
//             <button
//               type="button"
//               onClick={handleAddIngredient}
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//             >
//               Add Ingredient
//             </button>
//           </div>
          
//           {recipeIngredients.length > 0 && (
//             <div className="mt-4">
//               <h4 className="text-md font-medium text-gray-900 mb-2">Current Ingredients</h4>
//               <ul className="border rounded-md divide-y">
//                 {recipeIngredients.map((ri) => (
//                   <li key={ri.id} className="flex justify-between items-center p-3">
//                     <span>{ri.ingredient_name} - {ri.quantity_needed}</span>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveIngredient(ri.id)}
//                       className="text-red-600 hover:text-red-900"
//                     >
//                       Remove
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
          
//           <div className="flex space-x-4">
//             <button
//               type="submit"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               {editingRecipeId ? 'Update Recipe' : 'Add Recipe'}
//             </button>
            
//             {editingRecipeId && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSelectedCake('');
//                   setBatchYield('');
//                   setRecipeIngredients([]);
//                   setEditingRecipeId(null);
//                 }}
//                 className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
      
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <h2 className="text-xl font-semibold p-6">Recipes List</h2>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cake</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Yield</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredients</th>
//                 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {recipes.map((recipe) => (
//                 <tr key={recipe.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {cakes.find(c => c.id === recipe.cake_id)?.name || 'Unknown Cake'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipe.batch_yield}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     <ul>
//                       {recipe.recipe_ingredients?.map((ri, idx) => (
//                       <li key={idx}>
//                         {ri.ingredient_id.name}: {ri.quantity_needed} {ri.ingredient_id.unit}
//                       </li>
//                     ))}
//                     </ul>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button
//                       onClick={() => handleEdit(recipe)}
//                       className="text-indigo-600 hover:text-indigo-900 mr-3"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(recipe.id)}
//                       className="text-red-600 hover:text-red-900"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         {recipes.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No recipes found. Add a recipe to get started.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

export default function Recipes() {
  const [selectedCake, setSelectedCake] = useState('');
  const [batchYield, setBatchYield] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantityNeeded, setQuantityNeeded] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const { 
    cakes, 
    ingredients, 
    recipes,
    loading: { recipes: loading },
    fetchRecipes,
    updateRecipe,
    addRecipe,
    deleteRecipe
  } = useStore();
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    // Kita panggil fetchRecipes dari store saat komponen dimuat
    const supabaseClient = getSupabaseWithAuth();
    fetchRecipes(supabaseClient);
    // Kita juga perlu fetch cakes & ingredients jika belum ada di store
    // (Tambahkan logika fetch cakes & ingredients jika perlu)
  }, [fetchRecipes, getSupabaseWithAuth]);

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantityNeeded) return;
    
    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    if (!ingredient) return;
    
    const newIngredient = {
      id: Date.now(), // temporary ID for UI
      ingredient_id: selectedIngredient,
      ingredient_name: ingredient.name,
      quantity_needed: parseInt(quantityNeeded)
    };
    
    setRecipeIngredients([...recipeIngredients, newIngredient]);
    setSelectedIngredient('');
    setQuantityNeeded('');
  };

  const handleRemoveIngredient = (id) => {
    setRecipeIngredients(recipeIngredients.filter(ing => ing.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCake || !batchYield || recipeIngredients.length === 0) {
      alert('Please fill all fields and add at least one ingredient');
      return;
    }
    
    try {
      const supabaseClient = getSupabaseWithAuth();
      const { data: { session } } = await supabaseClient.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        alert('User not authenticated!');
        return;
      }
      
      if (editingRecipeId) {
        // Update existing recipe
        const { error: updateRecipeError } = await supabaseClient
          .from('recipes')
          .update({
            user_id: userId,
            cake_id: selectedCake,
            batch_yield: parseInt(batchYield)
          })
          .eq('id', editingRecipeId);

          
        if (updateRecipeError) throw updateRecipeError;
        
        // Delete existing recipe ingredients
        await supabaseClient
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', editingRecipeId);
          
        // Add new recipe ingredients
        const recipeIngredientsWithRecipeId = recipeIngredients.map(ri => ({
          recipe_id: editingRecipeId,
          ingredient_id: ri.ingredient_id, // Ini sekarang akan memiliki UUID yang valid
          quantity_needed: ri.quantity_needed
        }));
        
        const { error: insertIngredientsError } = await supabaseClient
          .from('recipe_ingredients')
          .insert(recipeIngredientsWithRecipeId);
          
        if (insertIngredientsError) throw insertIngredientsError;
        
        // Refresh data dari store
        fetchRecipes(supabaseClient);

      } else {
        // Create new recipe
        const { data: newRecipe, error: recipeError } = await supabaseClient
          .from('recipes')
          .insert([
            {
              user_id: userId,
              cake_id: selectedCake,
              batch_yield: parseInt(batchYield)
            }
          ])
          .select()
          .single();

        if (recipeError) throw recipeError;
        
        // Add recipe ingredients
        const recipeIngredientsWithRecipeId = recipeIngredients.map(ri => ({
          recipe_id: newRecipe.id,
          ingredient_id: ri.ingredient_id,
          quantity_needed: ri.quantity_needed
        }));
        
        const { error: insertIngredientsError } = await supabaseClient
          .from('recipe_ingredients')
          .insert(recipeIngredientsWithRecipeId);
          
        if (insertIngredientsError) throw insertIngredientsError;
        
        // Refresh data dari store
        fetchRecipes(supabaseClient);
      }
      
      // Reset form
      setSelectedCake('');
      setBatchYield('');
      setRecipeIngredients([]);
      setEditingRecipeId(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Error saving recipe: ' + error.message);
    }
  };

  const handleEdit = async (recipe) => {
    // Data 'recipe' dari 'recipes' state mungkin tidak lengkap,
    // jadi kita ambil cake_id dan batch_yield saja
    setSelectedCake(recipe.cake_id); // Asumsi `recipe.cake_id` adalah ID
    setBatchYield(recipe.batch_yield);
    setEditingRecipeId(recipe.id);
    
    // Load recipe ingredients
    const supabaseClient = getSupabaseWithAuth();
    
    // ⛔️ PERBAIKAN: Query select di sini yang menyebabkan bug
    // Kita perlu 'id' dari recipe_ingredients, dan 'id' + 'name' dari ingredient_id
    const { data, error } = await supabaseClient
      .from('recipe_ingredients')
      .select('id, quantity_needed, ingredient_id (id, name)') // <-- DI SINI PERBAIKANNYA
      .eq('recipe_id', recipe.id);
      
    if (error) {
      console.error('Error fetching recipe ingredients:', error);
      return;
    }

    // Sekarang, 'data' akan berisi apa yang kita butuhkan
    const ingredientsWithNames = data.map(ri => ({
      id: ri.id, // ID dari baris recipe_ingredients
      ingredient_id: ri.ingredient_id.id, // UUID dari bahan
      ingredient_name: ri.ingredient_id.name, // Nama bahan
      quantity_needed: ri.quantity_needed
    }));
    
    setRecipeIngredients(ingredientsWithNames);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const supabaseClient = getSupabaseWithAuth();
      // RLS akan menangani keamanan, jadi kita bisa hapus langsung
      // Hapus resep (cascade delete akan mengurus ingredients)
      const { error } = await supabaseClient
        .from('recipes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      deleteRecipe(id); // Update state lokal
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Error deleting recipe: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recipes Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingRecipeId ? 'Edit Recipe' : 'Add New Recipe'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cake</label>
              <select
                value={selectedCake}
                onChange={(e) => setSelectedCake(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a cake</option>
                {cakes.map(cake => (
                  <option key={cake.id} value={cake.id}>{cake.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Yield</label>
              <input
                type="number"
                value={batchYield}
                onChange={(e) => setBatchYield(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recipe Ingredients</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                <input
                  type="number"
                  value={quantityNeeded}
                  onChange={(e) => setQuantityNeeded(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddIngredient}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Ingredient
            </button>
          </div>
          
          {recipeIngredients.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Current Ingredients</h4>
              <ul className="border rounded-md divide-y">
                {recipeIngredients.map((ri) => (
                  <li key={ri.id} className="flex justify-between items-center p-3">
                    <span>{ri.ingredient_name} - {ri.quantity_needed}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ri.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingRecipeId ? 'Update Recipe' : 'Add Recipe'}
            </button>
            
            {editingRecipeId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCake('');
                  setBatchYield('');
                  setRecipeIngredients([]);
                  setEditingRecipeId(null);
                }}
                className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Recipes List</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cake</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Yield</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredients</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {/* ⛔️ PERBAIKAN: Menggunakan data join dari store */}
                    {recipe.cake_id?.name || 'Unknown Cake'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipe.batch_yield}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul>
                      {/* Ini sudah benar, menggunakan data join */}
                      {recipe.recipe_ingredients?.map((ri, idx) => (
                      <li key={idx}>
                        {ri.ingredient_id.name}: {ri.quantity_needed} {ri.ingredient_id.unit}
                      </li>
                    ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recipes found. Add a recipe to get started.
          </div>
        )}
      </div>
    </div>
  );
}
