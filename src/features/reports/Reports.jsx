

// import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';


// // ⛔️ BARU: Fungsi helper untuk download CSV (Excel)
// const downloadCSV = (data, filename) => {
//   if (!data || data.length === 0) {
//     alert('No data to export');
//     return;
//   }

//   // Sederhanakan data yang nested/objek
//   const simplifiedData = data.map(row => {
//     const newRow = {};
//     for (const key in row) {
//       if (key === 'recipe_id' && row[key] && row[key].cake_id) {
//         newRow['cake_name'] = row[key].cake_id.name;
//       } else if (key === 'distribution_items' && Array.isArray(row[key])) {
//         newRow['items_distributed'] = row[key].reduce((sum, item) => sum + item.quantity_distributed, 0);
//         newRow['items_damaged'] = row[key].reduce((sum, item) => sum + item.quantity_damaged, 0);
//       } else if (key === 'ingredient_id' && row[key]) {
//         newRow['ingredient_name'] = row[key].name;
//       } else if (typeof row[key] !== 'object' || row[key] === null) {
//         newRow[key] = row[key];
//       }
//     }
//     return newRow;
//   });

//   const headers = Object.keys(simplifiedData[0]);
//   const replacer = (key, value) => value === null ? '' : value;

//   const csvData = simplifiedData.map(row => {
//     return headers.map(header => {
//       return JSON.stringify(row[header], replacer).replace(/"/g, '""');
//     }).join(',');
//   });

//   const csv = [headers.join(','), ...csvData].join('\n');
//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//   const link = document.createElement('a');
//   if (link.download !== undefined) {
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', filename);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
// };


// export default function Reports() {
//   const [productionReport, setProductionReport] = useState([]);
//   const [distributionReport, setDistributionReport] = useState([]);
//   const [ingredientUsageReport, setIngredientUsageReport] = useState([]);
//   const [financialReport, setFinancialReport] = useState({});
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     // Set default date range to last 30 days
//     const today = new Date();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(today.getDate() - 30);
    
//     setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
//     setEndDate(today.toISOString().split('T')[0]);
//   }, []);

//   const generateReports = async () => {
//     if (!startDate || !endDate) {
//       alert('Please select both start and end dates');
//       return;
//     }

//     setLoading(true);

//     try {
//       const supabaseClient = getSupabaseWithAuth();
      
//       // Production Report
//       // ⛔️ PERBAIKAN #1: Join diperbaiki
//       const prodResponse = await supabaseClient
//         .from('productions')
//         .select('*, recipe_id(cake_id(name)), total_output, total_cost, production_date')
//         .gte('production_date', startDate)
//         .lte('production_date', endDate + ' 23:59:59');
        
//       if (prodResponse.error) throw prodResponse.error;
//       setProductionReport(prodResponse.data || []);

//       // Distribution Report
//       // ⛔️ PERBAIKAN #2: Join diperbaiki
//       const distResponse = await supabaseClient
//         .from('distributions')
//         .select(`
//           *,
//           distribution_items!inner(
//             cake_id(name),
//             quantity_distributed,
//             quantity_damaged
//           )
//         `)
//         .gte('distribution_date', startDate)
//         .lte('distribution_date', endDate + ' 23:59:59');
        
//       if (distResponse.error) throw distResponse.error;
//       setDistributionReport(distResponse.data || []);

//       // Financial Report
//       // ⛔️ PERBAIKAN: Menghapus RPC yang gagal (menyebabkan error 404)
//       // Kita hitung manual dari data yang ada.
//       // Nanti kita buat RPC baru setelah ada data 'Sales'.
//       const totalProductionCost = prodResponse.data?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;
//       setFinancialReport({
//         totalProductionCost: totalProductionCost,
//         totalSalesRevenue: 0, // Ini akan diisi dari modul 'Sales' baru nanti
//         netProfit: 0 - totalProductionCost // Profit sementara = 0 - biaya
//       });


//       // Ingredient Usage Report - for now just showing ingredient purchases
//       // ⛔️ PERBAIKAN #3: Join diperbaiki
//       const ingredientResponse = await supabaseClient
//         .from('ingredient_purchases')
//         .select('*, ingredient_id(name)')
//         .gte('purchase_date', startDate)
//         .lte('purchase_date', endDate + ' 23:59:59');
        
//       if (ingredientResponse.error) throw ingredientResponse.error;
//       setIngredientUsageReport(ingredientResponse.data || []);
//     } catch (error) {
//       console.error('Error generating reports:', error);
//       alert('Error generating reports: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate summary stats
//   const totalProduced = productionReport.reduce((sum, p) => sum + p.total_output, 0);
//   const totalProductionCost = productionReport.reduce((sum, p) => sum + (p.total_cost || 0), 0);
//   const totalDistributed = distributionReport.reduce((sum, d) => {
//     return sum + d.distribution_items.reduce((itemSum, item) => itemSum + item.quantity_distributed, 0);
//   }, 0);
//   const totalDamaged = distributionReport.reduce((sum, d) => {
//     return sum + d.distribution_items.reduce((itemSum, item) => itemSum + item.quantity_damaged, 0);
//   }, 0);

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold mb-4">Report Parameters</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
          
//           <div className="flex items-end">
//             <button
//               onClick={generateReports}
//               disabled={loading}
//               className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//             >
//               {loading ? 'Generating...' : 'Generate Reports'}
//             </button>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="border rounded-lg p-4 text-center">
//             <p className="text-2xl font-bold text-blue-600">{totalProduced}</p>
//             <p className="text-gray-600">Total Produced</p>
//           </div>
//           <div className="border rounded-lg p-4 text-center">
//             <p className="text-2xl font-bold text-green-600">{totalProductionCost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || '0'}</p>
//             <p className="text-gray-600">Production Cost</p>
//           </div>
//           <div className="border rounded-lg p-4 text-center">
//             <p className="text-2xl font-bold text-yellow-600">{totalDistributed}</p>
//             <p className="text-gray-600">Total Distributed</p>
//           </div>
//           <div className="border rounded-lg p-4 text-center">
//             <p className="text-2xl font-bold text-red-600">{totalDamaged}</p>
//             <p className="text-gray-600">Total Damaged/Unsold</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="space-y-8">
//         {/* Production Summary */}
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           {/* ⛔️ BARU: Tombol Export CSV */}
//           <div className="flex justify-between items-center p-6">
//             <h2 className="text-xl font-semibold">Production Summary</h2>
//             <button
//               onClick={() => downloadCSV(productionReport, 'production_report.csv')}
//               disabled={productionReport.length === 0}
//               className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
//             >
//               Export CSV
//             </button>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cake</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {productionReport.map((production) => (
//                   <tr key={production.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {/* ⛔️ PERBAIKAN #4: Path data diperbaiki */}
//                       {production.recipe_id?.cake_id?.name || 'Unknown'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(production.production_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.total_output}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {production.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {productionReport.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No production data available for the selected date range.
//             </div>
//           )}
//         </div>
        
//         {/* Distribution Summary */}
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           {/* ⛔️ BARU: Tombol Export CSV */}
//           <div className="flex justify-between items-center p-6">
//             <h2 className="text-xl font-semibold">Distribution Summary</h2>
//             <button
//               onClick={() => downloadCSV(distributionReport, 'distribution_report.csv')}
//               disabled={distributionReport.length === 0}
//               className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
//             >
//               Export CSV
//             </button>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributed</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damaged/Unsold</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {distributionReport.map((distribution) => (
//                   <tr key={distribution.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(distribution.distribution_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {distribution.location}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {distribution.distribution_items.map((item, idx) => (
//                         <div key={idx}>
//                           {/* ⛔️ PERBAIKAN #5: Path data diperbaiki */}
//                           {item.cake_id?.name}: {item.quantity_distributed}
//                         </div>
//                       ))}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {distribution.distribution_items.map((item, idx) => (
//                         <div key={idx}>
//                           {/* ⛔️ PERBAIKAN #5 (Bonus): Tampilan diperbaiki agar konsisten */}
//                           {item.quantity_damaged > 0 ? `${item.cake_id?.name}: ${item.quantity_damaged}` : '-'}
//                         </div>
//                       ))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {distributionReport.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No distribution data available for the selected date range.
//             </div>
//           )}
//         </div>
        
//         {/* Ingredient Usage */}
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           {/* ⛔️ BARU: Tombol Export CSV */}
//           <div className="flex justify-between items-center p-6">
//             <h2 className="text-xl font-semibold">Ingredient Purchases</h2>
//             <button
//               onClick={() => downloadCSV(ingredientUsageReport, 'ingredient_purchases.csv')}
//               disabled={ingredientUsageReport.length === 0}
//               className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
//             >
//               Export CSV
//             </button>
//           </div>
//           <p className="px-6 pb-4 text-sm text-gray-600 -mt-4">Menampilkan log pembelian bahan baku pada rentang tanggal yang dipilih.</p>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (unit dasar)</th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {ingredientUsageReport.map((purchase) => (
//                   <tr key={purchase.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {/* ⛔️ PERBAIKAN #6: Path data diperbaiki */}
//                       {purchase.ingredient_id?.name || 'Unknown'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(purchase.purchase_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {purchase.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {ingredientUsageReport.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No ingredient purchase data available for the selected date range.
//             </div>
//           )}
//         </div>
        
//         {/* Financial Summary */}
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           <h2 className="text-xl font-semibold p-6">Financial Summary</h2>
          
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="border rounded-lg p-4">
//                 <p className="text-sm text-gray-600">Total Production Cost</p>
//                 <p className="text-xl font-semibold">
//                   {financialReport.totalProductionCost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || '0'}
//                 </p>
//               </div>
//               <div className="border rounded-lg p-4">
//                 <p className="text-sm text-gray-600">Total Sales Revenue</p>
//                 <p className="text-xl font-semibold text-gray-400">
//                   {financialReport.totalSalesRevenue?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp0,00'}
//                 </p>
//               </div>
//               <div className="border rounded-lg p-4">
//                 <p className="text-sm text-gray-600">Net Profit</p>
//                 <p className="text-xl font-semibold text-red-500">
//                   {financialReport.netProfit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp0,00'}
//                 </p>
//               </div>
//             </div>
            
//             <div className="mt-6">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
//               <p className="text-gray-600">
//                 {/* ⛔️ PERBAIKAN: Teks catatan diubah */}
//                 Laporan Profit & Revenue memerlukan data penjualan. Saat ini, profit hanya menampilkan nilai negatif berdasarkan biaya produksi.
//                 Kita perlu membuat modul 'Catatan Penjualan' untuk menghitung profit sebenarnya.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Fungsi helper untuk download CSV
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Sederhanakan data yang nested/objek
  const simplifiedData = data.map(row => {
    const newRow = {};
    for (const key in row) {
      if (key === 'recipe_id' && row[key] && row[key].cake_id) {
        newRow['cake_name'] = row[key].cake_id.name;
      } else if (key === 'distribution_items' && Array.isArray(row[key])) {
        newRow['items_sent'] = row[key].reduce((sum, item) => sum + (item.quantity_sent || 0), 0);
        newRow['items_sold'] = row[key].reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
        newRow['items_returned'] = row[key].reduce((sum, item) => sum + (item.quantity_returned_good || 0), 0);
        newRow['items_damaged'] = row[key].reduce((sum, item) => sum + (item.quantity_damaged_at_location || 0), 0);
      } else if (key === 'ingredient_id' && row[key]) {
        newRow['ingredient_name'] = row[key].name;
      } else if (typeof row[key] !== 'object' || row[key] === null) {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });

  const headers = Object.keys(simplifiedData[0] || {});
  const replacer = (key, value) => value === null ? '' : value;

  const csvData = simplifiedData.map(row => {
    return headers.map(header => {
      return JSON.stringify(row[header], replacer).replace(/"/g, '""');
    }).join(',');
  });

  const csv = [headers.join(','), ...csvData].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function Reports() {
  const [productionReport, setProductionReport] = useState([]);
  const [distributionReport, setDistributionReport] = useState([]);
  const [ingredientUsageReport, setIngredientUsageReport] = useState([]);
  const [financialReport, setFinancialReport] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const generateReports = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);

    try {
      const supabaseClient = getSupabaseWithAuth();
      
      // 1. Production Report
      const prodResponse = await supabaseClient
        .from('productions')
        .select('*, recipe_id(cake_id(name)), total_output, total_cost, production_date')
        .gte('production_date', startDate)
        .lte('production_date', endDate + ' 23:59:59');
        
      if (prodResponse.error) throw prodResponse.error;
      setProductionReport(prodResponse.data || []);

      // 2. Distribution Report
      const distResponse = await supabaseClient
        .from('distributions')
        .select(`
          id, location, distribution_date,
          distribution_items!inner(
            quantity_sent,
            quantity_sold,
            quantity_returned_good,
            quantity_damaged_at_location,
            cake_id ( name, price_per_piece )
          )
        `)
        .gte('distribution_date', startDate)
        .lte('distribution_date', endDate + ' 23:59:59');
        
      if (distResponse.error) throw distResponse.error;
      setDistributionReport(distResponse.data || []);

      // 3. Financial Report
      const totalProductionCost = prodResponse.data?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;
      
      const totalSalesRevenue = distResponse.data?.reduce((sum, d) => {
        const itemsRevenue = d.distribution_items.reduce((itemSum, item) => {
          const price = item.cake_id?.price_per_piece || 0;
          return itemSum + (item.quantity_sold * price);
        }, 0);
        return sum + itemsRevenue;
      }, 0) || 0;

      setFinancialReport({
        totalProductionCost: totalProductionCost,
        totalSalesRevenue: totalSalesRevenue,
        netProfit: totalSalesRevenue - totalProductionCost
      });

      // 4. Ingredient Usage Report
      const ingredientResponse = await supabaseClient
        .from('ingredient_purchases')
        .select('*, ingredient_id(name)')
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate + ' 23:59:59');
        
      if (ingredientResponse.error) throw ingredientResponse.error;
      setIngredientUsageReport(ingredientResponse.data || []);
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kalkulasi summary stats
  const totalProduced = productionReport.reduce((sum, p) => sum + (p.total_output || 0), 0);
  const totalProductionCost = financialReport.totalProductionCost || 0;
  
  const totalSent = distributionReport.reduce((sum, d) => {
    return sum + d.distribution_items.reduce((itemSum, item) => itemSum + (item.quantity_sent || 0), 0);
  }, 0);
  
  const totalSold = distributionReport.reduce((sum, d) => {
    return sum + d.distribution_items.reduce((itemSum, item) => itemSum + (item.quantity_sold || 0), 0);
  }, 0);

  const totalReturned = distributionReport.reduce((sum, d) => {
    return sum + d.distribution_items.reduce((itemSum, item) => itemSum + (item.quantity_returned_good || 0), 0);
  }, 0);

  const totalDamaged = distributionReport.reduce((sum, d) => {
    return sum + d.distribution_items.reduce((itemSum, item) => itemSum + (item.quantity_damaged_at_location || 0), 0);
  }, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Report Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReports}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Reports'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalProduced}</p>
            <p className="text-gray-600">Total Produced</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{totalSent}</p>
            <p className="text-gray-600">Total Sent</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalSold}</p>
            <p className="text-gray-600">Total Sold</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{totalDamaged}</p>
            <p className="text-gray-600">Total Damaged</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Production Summary */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold">Production Summary</h2>
            <button
              onClick={() => downloadCSV(productionReport, 'production_report.csv')}
              disabled={productionReport.length === 0}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cake</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productionReport.map((production) => (
                  <tr key={production.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {production.recipe_id?.cake_id?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(production.production_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.total_output}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {production.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productionReport.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No production data available for the selected date range.
            </div>
          )}
        </div>
        
        {/* Distribution Summary */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold">Distribution Summary</h2>
            <button
              onClick={() => downloadCSV(distributionReport, 'distribution_report.csv')}
              disabled={distributionReport.length === 0}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damaged</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributionReport.map((distribution) => (
                  <tr key={distribution.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(distribution.distribution_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {distribution.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {distribution.distribution_items.map((item, idx) => (
                        <div key={idx}>
                          {item.cake_id?.name}: {item.quantity_sent}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {distribution.distribution_items.map((item, idx) => (
                        <div key={idx}>
                          {item.cake_id?.name}: {item.quantity_sold}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {distribution.distribution_items.map((item, idx) => (
                        <div key={idx}>
                          {item.cake_id?.name}: {item.quantity_returned_good}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {distribution.distribution_items.map((item, idx) => (
                        <div key={idx}>
                          {item.cake_id?.name}: {item.quantity_damaged_at_location}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {distributionReport.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No distribution data available for the selected date range.
            </div>
          )}
        </div>
        
        {/* Ingredient Purchases */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold">Ingredient Purchases</h2>
            <button
              onClick={() => downloadCSV(ingredientUsageReport, 'ingredient_purchases.csv')}
              disabled={ingredientUsageReport.length === 0}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
          <p className="px-6 pb-4 text-sm text-gray-600 -mt-4">Menampilkan log pembelian bahan baku pada rentang tanggal yang dipilih.</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (unit dasar)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredientUsageReport.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.ingredient_id?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ingredientUsageReport.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No ingredient purchase data available for the selected date range.
            </div>
          )}
        </div>
        
        {/* Financial Summary */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-6">Financial Summary</h2>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Production Cost</p>
                <p className="text-xl font-semibold text-red-600">
                  {financialReport.totalProductionCost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp0,00'}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Sales Revenue</p>
                <p className="text-xl font-semibold text-green-600">
                  {financialReport.totalSalesRevenue?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp0,00'}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Gross Profit</p>
                <p className={`text-xl font-semibold ${financialReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialReport.netProfit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'Rp0,00'}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600">
                Laba Kotor (Gross Profit) dihitung dari Total Pendapatan (dari item terjual di modul distribusi) dikurangi Total Biaya Produksi.
                Laporan ini belum termasuk biaya operasional lain dan kerugian dari barang rusak (yang masih dihitung sebagai item, bukan rupiah).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}