// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

////////////////////////////////////////////////////////////////////////////////fix-2
import { createClient } from '@supabase/supabase-js';

// // Pastikan variabel dibaca sebelum dipakai
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug log — boleh hapus nanti setelah test
console.log('🔍 ENV URL:', supabaseUrl);
console.log('🔍 ENV KEY:', supabaseAnonKey ? 'KEY FOUND ✅' : '❌ NO KEY');

// Buat client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tes koneksi Supabase (opsional, untuk dokumentasi)
(async () => {
  try {
    const { data, error } = await supabase.from('cakes').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection success! Example data:', data);
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
  }
})();

// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config(); // <-- ini penting biar Node baca file .env

// const supabaseUrl = process.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// console.log('🔍 ENV URL:', supabaseUrl);
// console.log('🔍 ENV KEY:', supabaseAnonKey ? 'KEY FOUND ✅' : '❌ KEY MISSING');

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
