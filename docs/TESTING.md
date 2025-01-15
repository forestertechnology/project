# QR Menu SaaS - Testing Guide

## Testing Strategy Overview

### Testing Pyramid
- Unit Tests: 70%
- Integration Tests: 20%
- End-to-End (E2E) Tests: 10%

### Testing Tools
- Vitest (Unit & Integration Testing)
- React Testing Library
- Cypress (E2E Testing)
- Mock Service Worker (API Mocking)

## Unit Testing

### React Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemComponent from './MenuItemComponent';

describe('MenuItemComponent', () => {
  const mockItem = {
    id: '1',
    name: 'Pizza',
    price: 12.99,
    description: 'Delicious cheese pizza'
  };

  test('renders menu item correctly', () => {
    render(<MenuItemComponent item={mockItem} />);
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });

  test('handles click event', () => {
    const mockOnClick = jest.fn();
    render(<MenuItemComponent item={mockItem} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByText('Pizza'));
    expect(mockOnClick).toHaveBeenCalledWith(mockItem);
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useSubscription from './useSubscription';

describe('useSubscription', () => {
  test('fetches subscription tier', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSubscription());
    
    await waitForNextUpdate();
    
    expect(result.current.tier).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('updates subscription', async () => {
    const { result } = renderHook(() => useSubscription());
    
    await act(async () => {
      await result.current.updateTier('pro');
    });
    
    expect(result.current.tier.name).toBe('pro');
  });
});
```

## Integration Testing

### Supabase Query Testing
```typescript
import { supabase } from '../lib/supabase';

describe('Supabase Queries', () => {
  test('fetches menu items for a restaurant', async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', 'test-restaurant-id');
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
  });

  test('creates a new menu item', async () => {
    const newItem = {
      name: 'Test Pizza',
      price: 10.99,
      restaurant_id: 'test-restaurant-id'
    };

    const { data, error } = await supabase
      .from('menu_items')
      .insert(newItem);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## End-to-End Testing

### Cypress E2E Tests
```typescript
describe('Restaurant Menu Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  it('creates a new menu item', () => {
    cy.visit('/dashboard/menu');
    cy.get('[data-testid="add-menu-item"]').click();
    
    cy.get('input[name="name"]').type('Margherita Pizza');
    cy.get('input[name="price"]').type('12.99');
    cy.get('button[type="submit"]').click();

    cy.contains('Margherita Pizza').should('be.visible');
  });

  it('edits an existing menu item', () => {
    cy.visit('/dashboard/menu');
    cy.get('[data-testid="edit-item-1"]').click();
    
    cy.get('input[name="price"]').clear().type('14.99');
    cy.get('button[type="submit"]').click();

    cy.contains('$14.99').should('be.visible');
  });
});
```

## Mocking Strategies

### API Mocking with MSW
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/menu-items', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'Pizza', price: 12.99 },
        { id: '2', name: 'Burger', price: 9.99 }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Configuration

### Vitest Configuration
```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Unit Tests
        run: npm run test:unit
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Run E2E Tests
        run: npm run test:e2e
```

## Test Coverage

### Coverage Reporting
```bash
# Generate test coverage report
npm run test:coverage
```

## Best Practices
- Write tests before implementing features
- Keep tests independent
- Use meaningful test descriptions
- Mock external dependencies
- Test both happy and edge cases
- Maintain high test coverage

## Testing Checklist
- ✅ Unit test components
- ✅ Test hooks and custom functions
- ✅ Integration test database queries
- ✅ E2E test critical user flows
- ✅ Mock external services
- ✅ Maintain high test coverage

## Recommended Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/)

## Continuous Improvement
Regularly review and update test suites to maintain code quality and catch potential issues early.
