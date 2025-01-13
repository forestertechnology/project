const { supabase } = require('../src/lib/supabase');

async function checkSubscriptionTiers() {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not properly initialized');
    }

    console.log('Checking subscription_tiers table...');
    
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No subscription tiers found in database');
      return;
    }

    console.log('Found subscription tiers:', data);
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

checkSubscriptionTiers();
