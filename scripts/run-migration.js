import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
  try {
    // Check current data
    const { data: tiers, error: readError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('name');

    if (readError) {
      console.error('Failed to read tiers:', readError);
      return;
    }

    console.log('Current subscription tiers:', JSON.stringify(tiers, null, 2));
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
