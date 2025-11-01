import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

export default function Distributions() {
  const [distributions, setDistributions] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [newDistribution, setNewDistribution] = useState({
    location: '',
    distributionDate: new Date().toISOString().split('T')[0],
  });
  const [selectedCake, setSelectedCake] = useState('');
  const [quantityDistributed, setQuantityDistributed] = useState('');
  const [quantityDamaged, setQuantityDamaged] = useState('');
  
  // ⛔️ BARU: State loading untuk form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ⛔️ BARU: Daftar lokasi untuk dropdown
  const locationList = [
    'Arso 1',
    'Arso 2',
    'Arso 3',
    'Nimbokrang',
    'Pir 2',
    'Koya Barat',
    'Koya Timur',
    // Tambahkan "dll" atau lokasi lain di sini
  ];

 
  
  // State untuk form pengiriman baru
  const [location, setLocation] = useState('');
  const [items, setItems] = useState([{ cake_id: '', quantity_sent: '' }]);
  


  const { 
    // Kita tidak perlu store di sini karena kita fetch manual
  } = useStore();
  const { 
    // Kita tidak perlu addDistribution dari store, kita fetch ulang
  } = useStore();
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchData();
  }, [getSupabaseWithAuth]);

  const fetchData = async () => {
    setLoading(true);
    const supabaseClient = getSupabaseWithAuth();
    
  
    // PERBAIKAN: Menambahkan untuk menampung hasil promise
  const [distributionsData, cakesData] = await Promise.all([
  supabaseClient
    .from('distributions')
    .select(`
      id, location, distribution_date,
      distribution_items (
        id, quantity_sent, quantity_sold, quantity_returned_good, quantity_damaged_at_location,
        cake_id ( id, name )
      )
    `)
    .order('distribution_date', { ascending: false }),

  supabaseClient
    .from('cakes')
    .select('id, name, current_stock')
]);

if (distributionsData.error) console.error('Error fetching distributions:', distributionsData.error);
if (cakesData.error) console.error('Error fetching cakes:', cakesData.error);

setDistributions(distributionsData.data || []);
setCakes(cakesData.data || []);
setLoading(false);
  };

  // Handler untuk form item dinamis
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { cake_id: '', quantity_sent: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i!== index);
    setItems(newItems);
  };

  // Handler untuk MENCATAT PENGIRIMAN BARU
  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    if (!location || items.some(item =>!item.cake_id ||!item.quantity_sent || item.quantity_sent <= 0)) {
      alert('Harap isi lokasi dan semua detail item kue dengan kuantitas yang valid.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const supabaseClient = getSupabaseWithAuth();
      const { error } = await supabaseClient.rpc('log_distribution', {
        p_location: location,
        p_items: items.map(item => ({
          cake_id: item.cake_id,
          quantity_sent: parseInt(item.quantity_sent)
        }))
      });

      if (error) throw error;

      alert('Distribusi berhasil dicatat!');
      setLocation('');
      setItems([{ cake_id: '', quantity_sent: '' }]);
      await fetchData();
    } catch (error) {
      console.error('Error creating distribution:', error);
      alert('Gagal mencatat distribusi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler untuk MEREKONSILIASI DATA PENJUALAN/RETUR
  const handleReconcile = async (item) => {
    const sold = prompt("Jumlah terjual:", item.quantity_sold);
    const returned = prompt("Jumlah retur (kondisi baik):", item.quantity_returned_good);
    const damaged = prompt("Jumlah rusak/basi di lokasi:", item.quantity_damaged_at_location);

    if (sold === null || returned === null || damaged === null) return;

    setIsSubmitting(true); 
    
    try {
        const supabaseClient = getSupabaseWithAuth();
        const { error } = await supabaseClient.rpc('reconcile_distribution_item', {
            p_dist_item_id: item.id,
            p_sold: parseInt(sold) || 0,
            p_returned_good: parseInt(returned) || 0,
            p_damaged: parseInt(damaged) || 0
        });

        if (error) throw error;

        alert('Rekonsiliasi berhasil!');
        await fetchData();
    } catch (error) {
        console.error('Error reconciling item:', error);
        alert('Gagal rekonsiliasi: ' + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading &&!isSubmitting) { 
    return <div className="p-6">Loading...</div>;
  }

  const handleAddItem = () => {
    if (!selectedCake || !quantityDistributed) {
      alert('Please select a cake and enter distributed quantity');
      return;
    }

    const cake = cakes.find(c => c.id === selectedCake);
    if (!cake) return;

    // ⛔️ PERBAIKAN LOGIKA: Cek stok HANYA terhadap yang didistribusikan
    const qtyToDistribute = parseInt(quantityDistributed);
    const qtyDamaged = parseInt(quantityDamaged) || 0;
    // const totalToRemove = qtyToDistribute + qtyDamaged; // <-- Logika lama
    const totalToRemove = qtyToDistribute; // <-- Logika baru

    if (cake.current_stock < totalToRemove) {
      alert(`Stok ${cake.name} tidak cukup. Stok tersisa: ${cake.current_stock}`);
      return;
    }

    const newItem = {
      id: Date.now(), // temporary ID for UI
      cake_id: selectedCake,
      cake_name: cake.name,
      quantity_distributed: qtyToDistribute,
      quantity_damaged: qtyDamaged // Ini HANYA untuk catatan
    };

    setDistributionItems([...distributionItems, newItem]);
    setSelectedCake('');
    setQuantityDistributed('');
    setQuantityDamaged('');
  };

  const handleRemoveItem = (id) => {
    setDistributionItems(distributionItems.filter(item => item.id !== id));
  };

  // ⛔️ PERBAIKAN #3: Logika handleSubmit diubah total
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newDistribution.location || distributionItems.length === 0) {
      alert('Please enter location and add at least one item');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabaseClient = getSupabaseWithAuth();

      // Siapkan array JSON untuk dikirim ke RPC
      const itemsToInsert = distributionItems.map(item => ({
        cake_id: item.cake_id,
        distributed: item.quantity_distributed,
        damaged: item.quantity_damaged
      }));
      
      // Panggil fungsi RPC
      const { error } = await supabaseClient
        .rpc('record_distribution', {
          location_input: newDistribution.location,
          date_input: newDistribution.distributionDate,
          items_input: itemsToInsert
        });

      if (error) {
        // Error dari database (misal, stok tidak cukup)
        throw error;
      }

      // Jika berhasil
      alert('Distribusi berhasil dicatat!');
      
      setNewDistribution({
        location: '',
        distributionDate: new Date().toISOString().split('T')[0],
      });
      setDistributionItems([]);
      await fetchData(); // Fetch ulang data untuk refresh stok

    } catch (error) {
      console.error('Error creating distribution:', error);
      alert('Error creating distribution: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) {
    return <div className="p-6">Loading...</div>;
  }
return (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Distribution Management</h1>

    {/* ===================== FORM RECORD NEW SHIPMENT ===================== */}
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Record New Shipment</h2>

      <form onSubmit={handleCreateDistribution} className="space-y-6">
        {/* Lokasi Tujuan */}
        {/* Lokasi Tujuan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
          disabled={isSubmitting}
        >
          <option value="">Select Location</option>
          {locationList.map((loc, index) => (
            <option key={index} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>


        {/* Item Kue */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Items to Send</h3>

          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded-md">
              <select
                value={item.cake_id}
                onChange={(e) => handleItemChange(index, 'cake_id', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Cake</option>
                {cakes.map((cake) => (
                  <option key={cake.id} value={cake.id}>
                    {cake.name} (Stok: {cake.current_stock})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantity Sent"
                value={item.quantity_sent}
                onChange={(e) => handleItemChange(index, 'quantity_sent', e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isSubmitting}
              />

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 font-medium"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            disabled={isSubmitting}
          >
            + Add Another Item
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Recording Shipment...' : 'Record Shipment'}
        </button>
      </form>
    </div>

    {/* ===================== DISTRIBUTION HISTORY ===================== */}
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold p-6">Distribution History</h2>

      <div className="space-y-6 p-6">
        {distributions.map((dist) => (
          <div key={dist.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{dist.location}</p>
                <p className="text-sm text-gray-500">
                  {new Date(dist.distribution_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cake</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damaged</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {dist.distribution_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.cake_id.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_sent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_sold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_returned_good}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_damaged_at_location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleReconcile(item)}
                          disabled={isSubmitting}
                          className="font-medium text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                        >
                          Reconcile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {distributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No distributions recorded yet.
          </div>
        )}
      </div>
    </div>
  </div>
);


}