import { supabase } from './supabase.js';

async function testStartProduction() {
  console.log('🚀 Testing RPC: start_production...\n');

  const { data, error } = await supabase.rpc('start_production', {
    recipe_id_input: '6ad9be83-8d87-4327-824a-a91204d1b24d', // ganti dgn ID resep yg valid
    batch_count_input: 1,
    expired_date_input: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Sukses:', data);
  }
}

testStartProduction();
