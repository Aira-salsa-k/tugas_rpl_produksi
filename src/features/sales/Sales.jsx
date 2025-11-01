import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Daftar lokasi yang sama dengan Distributions
const locationList = [
  'Arso 1', 'Arso 2', 'Arso 3', 'Nimbokrang', 'Pir 2', 'Koya Barat', 'Koya Timur',
];

export default function Sales() {
  const [cakes, setCakes] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [selectedCake, setSelectedCake] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [quantityReturned, setQuantityReturned] = useState('');

  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchData();
  }, [getSupabaseWithAuth]);

  const fetchData = async () => {
    setLoading(true);
    const supabaseClient = getSupabaseWithAuth();
    
    const [cakesData, salesData] = await Promise.all([
      supabaseClient.from('cakes').select('id, name, price_per_piece'),
      supabaseClient
        .from('sales_logs')
        .select('*, cake_id(name)')
        .order('sale_date', { ascending: false })
        .limit(20) // Tampilkan 20 catatan terakhir
    ]);

    if (cakesData.error) console.error('Error fetching cakes:', cakesData.error);
    if (salesData.error) console.error('Error fetching sales logs:', salesData.error);

    setCakes(cakesData.data || []);
    setSalesLog(salesData.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!saleDate || !location || !selectedCake || !quantitySold) {
      alert('Harap isi minimal tanggal, lokasi, kue, dan jumlah terjual.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabaseClient = getSupabaseWithAuth();
      const qtySold = parseInt(quantitySold) || 0;
      const qtyReturned = parseInt(quantityReturned) || 0;

      const { data: revenue, error } = await supabaseClient
        .rpc('record_sale', {
          sale_date_input: saleDate,
          location_input: location,
          cake_id_input: selectedCake,
          qty_sold_input: qtySold,
          qty_returned_input: qtyReturned
        });

      if (error) throw error;

      alert(`Penjualan berhasil dicatat! Total Revenue: ${revenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`);
      
      // Reset form
      setLocation('');
      setSelectedCake('');
      setQuantitySold('');
      setQuantityReturned('');

      await fetchData(); // Refresh data

    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Error recording sale: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Log</h1>
      <p className="mb-6 text-gray-600">Catat hasil penjualan dan retur (kue utuh) dari kios di halaman ini.</p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Record New Sale / Return</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
                disabled={isSubmitting}
              >
                <option value="">Pilih lokasi</option>
                {locationList.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cake</label>
            <select
              value={selectedCake}
              onChange={(e) => setSelectedCake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={isSubmitting}
            >
              <option value="">Pilih kue</option>
              {cakes.map(cake => (
                <option key={cake.id} value={cake.id}>
                  {cake.name} (Harga: {cake.price_per_piece?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Sold</label>
              <input
                type="number"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 190"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Returned (Unsold)</label>
              <input
                type="number"
                value={quantityReturned}
                onChange={(e) => setQuantityReturned(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Kue utuh (akan kembali ke stok)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Recording...' : 'Record Sale'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Recent Sales Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cake</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesLog.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.sale_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.cake_id.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{log.quantity_sold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{log.quantity_returned_unsold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.total_revenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
