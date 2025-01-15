import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription } from './useSubscription';
import { createWrapper } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';

describe('useSubscription', () => {
  const wrapper = createWrapper();

  it('should start with loading state', () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.tier).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch free tier successfully', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tier).toMatchObject({
      name: 'Free',
      max_menu_items: 10,
      max_menus: 1,
      max_categories: 5,
      max_restaurants: 1
    });
    expect(result.current.error).toBeNull();
  });

  it('should fetch premium tier successfully', async () => {
    // Mock user with premium subscription
    server.use(
      http.get('*/rest/v1/user_profiles*', () => {
        return HttpResponse.json({
          id: 'test-user-id',
          subscription_tier_id: 'premium',
        });
      })
    );

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tier).toMatchObject({
      name: 'Premium',
      max_menu_items: 100,
      max_menus: 5,
      max_categories: 20,
      max_restaurants: 3
    });
  });

  it('should handle API errors and retry', async () => {
    // Mock user with error-triggering tier
    server.use(
      http.get('*/rest/v1/user_profiles*', () => {
        return HttpResponse.json({
          id: 'test-user-id',
          subscription_tier_id: 'error-tier',
        });
      })
    );

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch subscription tier');
    expect(result.current.tier).toBeNull();
    expect(result.current.retryCount).toBeGreaterThan(0);
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('*/rest/v1/subscription_tiers*', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.tier).toBeNull();
    expect(result.current.retryCount).toBeGreaterThan(0);
  });

  describe('helper functions', () => {
    it('should correctly check menu limits for free tier', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canAddMenu(0)).toBe(true);
      expect(result.current.canAddMenu(1)).toBe(false);
      expect(result.current.canAddMenuItem(9)).toBe(true);
      expect(result.current.canAddMenuItem(10)).toBe(false);
      expect(result.current.canAddCategory(4)).toBe(true);
      expect(result.current.canAddCategory(5)).toBe(false);
      expect(result.current.canAddRestaurant(0)).toBe(true);
      expect(result.current.canAddRestaurant(1)).toBe(false);
    });

    it('should correctly check menu limits for premium tier', async () => {
      // Mock user with premium subscription
      server.use(
        http.get('*/rest/v1/user_profiles*', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            subscription_tier_id: 'premium',
          });
        })
      );

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canAddMenu(4)).toBe(true);
      expect(result.current.canAddMenu(5)).toBe(false);
      expect(result.current.canAddMenuItem(99)).toBe(true);
      expect(result.current.canAddMenuItem(100)).toBe(false);
      expect(result.current.canAddCategory(19)).toBe(true);
      expect(result.current.canAddCategory(20)).toBe(false);
      expect(result.current.canAddRestaurant(2)).toBe(true);
      expect(result.current.canAddRestaurant(3)).toBe(false);
    });
  });

  it('should handle no user profile', async () => {
    server.use(
      http.get('*/auth/v1/session', () => {
        return HttpResponse.json({ data: { session: null } });
      })
    );

    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tier).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.canAddMenu(0)).toBe(false);
    expect(result.current.canAddMenuItem(0)).toBe(false);
    expect(result.current.canAddCategory(0)).toBe(false);
    expect(result.current.canAddRestaurant(0)).toBe(false);
  });
});
