import { http, HttpResponse } from 'msw';

// Mock subscription tier data
const mockFreeTier = {
  id: 'free',
  name: 'Free',
  max_menu_items: 10,
  max_menus: 1,
  max_categories: 5,
  max_backgrounds: 1,
  max_custom_links: 0,
  custom_qr_codes: false,
  special_offers: false,
  regular_price: 0,
  discounted_price: null,
  discount_percentage: null,
  discount_ends_at: null,
};

const mockPremiumTier = {
  id: 'premium',
  name: 'Premium',
  max_menu_items: 100,
  max_menus: 5,
  max_categories: 20,
  max_backgrounds: 5,
  max_custom_links: 5,
  custom_qr_codes: true,
  special_offers: true,
  regular_price: 29.99,
  discounted_price: null,
  discount_percentage: null,
  discount_ends_at: null,
};

// Mock user profile data
const mockUserProfile = {
  id: 'test-user-id',
  first_name: 'Test',
  last_name: 'User',
  phone_number: null,
  subscription_tier_id: 'free',
  is_admin: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const handlers = [
  // Mock Supabase auth session
  http.get('*/auth/v1/session', () => {
    return HttpResponse.json({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      },
    });
  }),

  // Mock subscription tiers endpoint
  http.get('*/rest/v1/subscription_tiers*', ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get('select');
    const or = url.searchParams.get('or');

    // Parse the or parameter to extract tier id or name
    const isFreeQuery = or?.includes('name.eq.Free');
    const tierIdMatch = or?.match(/id\.eq\.([\w-]+)/);
    const requestedTierId = tierIdMatch?.[1];

    // Simulate error case for specific tier ID
    if (requestedTierId === 'error-tier') {
      return HttpResponse.json(
        { message: 'Failed to fetch subscription tier', details: 'Database error' },
        { status: 500 }
      );
    }

    let tierData;
    if (requestedTierId === 'premium') {
      tierData = mockPremiumTier;
    } else if (isFreeQuery || requestedTierId === 'free') {
      tierData = mockFreeTier;
    }

    // Return in Supabase format
    return HttpResponse.json({ data: tierData });
  }),

  // Mock user profiles endpoint
  http.get('*/rest/v1/user_profiles*', () => {
    return HttpResponse.json(mockUserProfile);
  }),

  // Mock auth state change subscription
  http.post('*/auth/v1/channel', () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
