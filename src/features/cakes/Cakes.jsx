import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

export default function Cakes() {
  const [name, setName] = useState('');
  const [pricePerPiece, setPricePerPiece] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const { 
    cakes, 
    loading: { cakes: loading },
    fetchCakes,
    updateCake,
    addCake,
    deleteCake
  } = useStore();
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    const supabaseClient = getSupabaseWithAuth();
    fetchCakes(supabaseClient);
  }, [fetchCakes, getSupabaseWithAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const supabaseClient = getSupabaseWithAuth();
    
    if (editingId) {
      // Update existing cake
      const { error } = await supabaseClient
        .from('cakes')
        .update({ name, price_per_piece: parseInt(pricePerPiece) })
        .eq('id', editingId);
        
      if (error) {
        console.error('Error updating cake:', error);
      } else {
        updateCake({ id: editingId, name, price_per_piece: parseInt(pricePerPiece) });
        setEditingId(null);
        setName('');
        setPricePerPiece('');
      }
    } else {
      // Create new cake
      const { data, error } = await supabaseClient
        .from('cakes')
        .insert([{ name, price_per_piece: parseInt(pricePerPiece) }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding cake:', error);
      } else {
        addCake(data);
        setName('');
        setPricePerPiece('');
      }
    }
  };

  const handleEdit = (cake) => {
    setName(cake.name);
    setPricePerPiece(cake.price_per_piece);
    setEditingId(cake.id);
  };

  const handleDelete = async (id) => {
    const supabaseClient = getSupabaseWithAuth();
    const { error } = await supabaseClient
      .from('cakes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting cake:', error);
    } else {
      deleteCake(id);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cakes Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Cake' : 'Add New Cake'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Piece (IDR)</label>
            <input
              type="number"
              value={pricePerPiece}
              onChange={(e) => setPricePerPiece(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editingId ? 'Update Cake' : 'Add Cake'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setPricePerPiece('');
              }}
              className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Cakes List</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Piece</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cakes.map((cake) => (
                <tr key={cake.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cake.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cake.price_per_piece?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cake.current_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cake)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cake.id)}
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
        
        {cakes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cakes found. Add a cake to get started.
          </div>
        )}
      </div>
    </div>
  );
}