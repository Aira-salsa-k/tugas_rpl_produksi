// import { useState, useEffect } from 'react';
// import { useStore } from '../../store/appStore';
// import { useAuth } from '../../contexts/AuthContext';

// export default function Productions() {
//   const [productions, setProductions] = useState([]);
//   const [recipes, setRecipes] = useState([]);
//   const [cakes, setCakes] = useState([]);
//   const [ingredients, setIngredients] = useState([]);
//   const [recipeIngredients, setRecipeIngredients] = useState({});
  
//   const [selectedRecipe, setSelectedRecipe] = useState('');
//   const [batchCount, setBatchCount] = useState('');
//   const [expiredDate, setExpiredDate] = useState('');
//   const [loading, setLoading] = useState(true);

//   const { 
//     fetchRecipes: fetchRecipesStore,
//     updateProduction,
//     addProduction
//   } = useStore();
  
//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     fetchData();
//   }, [getSupabaseWithAuth]);

//   const fetchData = async () => {
//     const supabaseClient = getSupabaseWithAuth();
    
// const [productionsData, recipesData, cakesData, ingredientsData] = await Promise.all([
//   supabaseClient
//     .from('productions')
//     .select(`
//       id, user_id, recipe_id, batch_count, total_output, total_cost, expired_date, production_date,
//       recipe_id (
//         id,
//         batch_yield,
//         cake_id ( name )
//       ),
//       user_id ( email )
//     `)
//     .order('production_date', { ascending: false }),

//   supabaseClient
//     .from('recipes')
//     .select(`
//       id, user_id, cake_id, batch_yield, created_at,
//       cake_id ( name ),
//       recipe_ingredients (
//         quantity_needed,
//         ingredient_id ( name, unit )
//       )
//     `)
//     .order('created_at', { ascending: false }),

//   supabaseClient.from('cakes').select('id, user_id, name, price_per_piece, current_stock'),
//   supabaseClient.from('ingredients').select('id, user_id, name, unit, current_stock')
// ]);


// if (productionsData.error) console.error('Error fetching productions:', productionsData.error);
// if (recipesData.error) console.error('Error fetching recipes:', recipesData.error);
// if (cakesData.error) console.error('Error fetching cakes:', cakesData.error);
// if (ingredientsData.error) console.error('Error fetching ingredients:', ingredientsData.error);

// setProductions(productionsData.data || []);
// setRecipes(recipesData.data || []);
// setCakes(cakesData.data || []);
// setIngredients(ingredientsData.data || []);

// // Prepare recipe ingredients mapping for quick access
// const recipeIngMap = {};
// recipesData.data?.forEach(recipe => {
//   recipeIngMap[recipe.id] = recipe.recipe_ingredients;
// });
// setRecipeIngredients(recipeIngMap);

// setLoading(false);


//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedRecipe || !batchCount || !expiredDate) {
//       alert('Please fill all fields');
//       return;
//     }
    
//     try {
//       const supabaseClient = getSupabaseWithAuth();
      
//       // Calculate total output based on recipe batch yield
//       const recipe = recipes.find(r => r.id === selectedRecipe);
//       if (!recipe) {
//         alert('Invalid recipe selected');
//         return;
//       }
      
//       const totalOutput = parseInt(batchCount) * recipe.batch_yield;
      
//       // For now, we'll just record the production. In a real app, 
//       // this would need to call an RPC function to handle the complex logic
//       const { data: { session } } = await supabaseClient.auth.getSession();

//       const { data, error } = await supabaseClient
//         .from('productions')
//         .insert([{
//           user_id: session.user.id, // 🟢 wajib untuk RLS
//           recipe_id: selectedRecipe,
//           batch_count: parseInt(batchCount),
//           expired_date: expiredDate,
//           total_output: totalOutput,
//           total_cost: 0
//         }])
//         .select()
//         .single();

        
//       if (error) throw error;
      
//       // Update store and refresh data
//       addProduction(data);
      
//       // Reset form
//       setSelectedRecipe('');
//       setBatchCount('');
//       setExpiredDate('');
//       fetchData();
//     } catch (error) {
//       console.error('Error recording production:', error);
//       alert('Error recording production: ' + error.message);
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Production Management</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold mb-4">Start New Production Run</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Recipe</label>
//             <select
//               value={selectedRecipe}
//               onChange={(e) => setSelectedRecipe(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             >
//               <option value="">Select a recipe</option>
//               {recipes.map(recipe => (
//                 <option key={recipe.id} value={recipe.id}>
//                   {recipe.cake_id?.cakes?.name || 'Unknown Cake'} (Yield: {recipe.batch_yield})
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Batch Count</label>
//               <input
//                 type="number"
//                 value={batchCount}
//                 onChange={(e) => setBatchCount(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
//               <input
//                 type="date"
//                 value={expiredDate}
//                 onChange={(e) => setExpiredDate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
//           </div>
          
//           {selectedRecipe && (
//             <div className="bg-gray-50 p-4 rounded-md">
//               <h3 className="text-md font-medium text-gray-900 mb-2">Required Ingredients</h3>
//               <ul className="space-y-1">
//                 {recipeIngredients[selectedRecipe]?.map((ri, idx) => {
//                   const totalRequired = ri.quantity_needed * (parseInt(batchCount) || 0);
//                   return (
//                     <li key={idx} className="flex justify-between">
//                       <span>{ri.ingredient_id?.name}: {ri.quantity_needed} per batch</span>
//                       <span className="font-medium">{totalRequired} total</span>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           )}
          
//           <button
//             type="submit"
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Start Production
//           </button>
//         </form>
//       </div>
      
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <h2 className="text-xl font-semibold p-6">Production Runs</h2>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Count</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {productions.map((production) => (
//                 <tr key={production.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {production.recipe_id?.recipes?.cake_id?.cakes?.name || 'Unknown'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(production.production_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.batch_count}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.total_output}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {production.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(production.expired_date).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         {productions.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No production runs recorded yet.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

export default function Productions() {
  const [productions, setProductions] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState({});
  
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [batchCount, setBatchCount] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  
  // BARU: State loading khusus untuk form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { 
    // Kita tidak perlu store di sini karena kita fetch manual
  } = useStore();
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchData();
  }, [getSupabaseWithAuth]); // dependensi sudah benar

  const fetchData = async () => {
    setLoading(true); // Pastikan loading di set di awal
    const supabaseClient = getSupabaseWithAuth();
    
    const [productionsData, recipesData, cakesData, ingredientsData] = await Promise.all([
      supabaseClient
        .from('productions')
        .select(`
          id, user_id, recipe_id, batch_count, total_output, total_cost, expired_date, production_date,
          recipe_id (
            id,
            batch_yield,
            cake_id ( name )
          )
        `)
        .order('production_date', { ascending: false }),

      supabaseClient
        .from('recipes')
        .select(`
          id, user_id, cake_id, batch_yield,
          cake_id ( name ),
          recipe_ingredients (
            quantity_needed,
            ingredient_id ( id, name, unit )
          )
        `),

      supabaseClient.from('cakes').select('id, user_id, name, price_per_piece, current_stock'),
      supabaseClient.from('ingredients').select('id, user_id, name, unit, current_stock')
    ]);


    if (productionsData.error) console.error('Error fetching productions:', productionsData.error);
    if (recipesData.error) console.error('Error fetching recipes:', recipesData.error);
    if (cakesData.error) console.error('Error fetching cakes:', cakesData.error);
    if (ingredientsData.error) console.error('Error fetching ingredients:', ingredientsData.error);

    setProductions(productionsData.data || []);
    setRecipes(recipesData.data || []);
    setCakes(cakesData.data || []);
    setIngredients(ingredientsData.data || []);

    const recipeIngMap = {};
    recipesData.data?.forEach(recipe => {
      recipeIngMap[recipe.id] = recipe.recipe_ingredients;
    });
    setRecipeIngredients(recipeIngMap);

    setLoading(false);
  };

  // ⛔️ INI FUNGSI YANG BENAR (MENGGUNAKAN RPC) ⛔️
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRecipe || !batchCount || !expiredDate) {
      alert('Harap isi semua field');
      return;
    }
    
    setIsSubmitting(true); // Set loading untuk tombol
    
    try {
      const supabaseClient = getSupabaseWithAuth();
      
      // 1. Panggil fungsi 'start_production' di database
      const { error } = await supabaseClient
        .rpc('start_production', {
          recipe_id_input: selectedRecipe,
          batch_count_input: parseInt(batchCount),
          expired_date_input: expiredDate
        });

      if (error) {
        // Jika ada error (misal, stok tidak cukup), database akan mengirim pesan
        throw error;
      }
      
      // 2. Jika berhasil, semua data (bahan, kue, produksi) SUDAH di-update di server.
      alert('Produksi berhasil dicatat!');
      
      // Reset form
      setSelectedRecipe('');
      setBatchCount('');
      setExpiredDate('');
      
      // Fetch ulang semua data untuk me-refresh UI
      await fetchData(); 

    } catch (error) {
      console.error('Error recording production:', error);
      // Tampilkan pesan error dari database (misal "Stok tidak cukup...")
      alert('Error recording production: ' + error.message);
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  if (loading && !isSubmitting) { 
    return <div className="p-6">Loading...</div>;
  }


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Production Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Start New Production Run</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe</label>
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a recipe</option>
              {recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {/* ⛔️ PERBAIKAN #3a: Path data diperbaiki */}
                  {recipe.cake_id?.name || 'Unknown Cake'} (Yield: {recipe.batch_yield})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Count</label>
              <input
                type="number"
                value={batchCount}
                onChange={(e) => setBatchCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                type="date"
                value={expiredDate}
                onChange={(e) => setExpiredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          {selectedRecipe && recipeIngredients[selectedRecipe] && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium text-gray-900 mb-2">Required Ingredients</h3>
              <ul className="space-y-1">
                {recipeIngredients[selectedRecipe].map((ri, idx) => {
                  const totalRequired = ri.quantity_needed * (parseInt(batchCount) || 0);
                  // ri.ingredient_id sudah benar (isinya {name: '...', unit: '...'})
                  return (
                    <li key={idx} className="flex justify-between">
                      <span>{ri.ingredient_id?.name}: {ri.quantity_needed} {ri.ingredient_id?.unit} per batch</span>
                      <span className="font-medium">{totalRequired} {ri.ingredient_id?.unit} total</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start Production
          </button>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Production Runs</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Count</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productions.map((production) => (
                <tr key={production.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {/* ⛔️ PERBAIKAN #3b: Path data diperbaiki */}
                    {production.recipe_id?.cake_id?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(production.production_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.batch_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.total_output}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {production.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(production.expired_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {productions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No production runs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
