# Database Type Management Guide

## Overview
This guide provides detailed instructions for managing database types in the QR Menu SaaS project, ensuring type safety and consistency between TypeScript definitions and Supabase schema.

## Type Synchronization Workflow

### 1. Understanding Database Types
Database types are defined in `src/lib/database.types.ts`. These types must exactly match the Supabase database schema to ensure type safety across the application.

### 2. Generating Types
To generate updated types after schema changes:

```bash
# Fetch the latest Supabase types
npx supabase gen types typescript > src/lib/database.types.ts
```

### 3. Validation Process
The project includes an automated validation script that checks:
- Column name consistency
- Type matching
- Nullability constraints

### 4. Pre-Commit Validation
A pre-commit hook automatically runs type validation:
- Prevents commits with type inconsistencies
- Provides detailed error reporting
- Ensures type safety before code is committed

### Common Scenarios

#### Adding a New Column
1. Update Supabase schema
2. Regenerate types using Supabase CLI
3. Run manual validation: `npm run validate:db-types`
4. Update any affected application code

#### Changing Column Type
1. Modify column type in Supabase
2. Regenerate types
3. Update TypeScript type definitions
4. Adjust application code to match new type
5. Validate types

## Best Practices

### Type Definition Guidelines
- Always use precise types
- Prefer explicit nullability
- Use optional properties when appropriate
- Include descriptive comments for complex types

### Validation Configuration
Customize validation in `scripts/validate-db-types.ts`:
- Modify `VALIDATION_CONFIG`
- Adjust type mapping
- Add custom validation rules

## Troubleshooting

### Validation Failures
- Check `database-validation-report.json`
- Verify Supabase schema matches TypeScript types
- Ensure all type conversions are handled correctly

### Common Issues
- Mismatched column names
- Incorrect type mapping
- Inconsistent nullability
- Missing or extra columns

## Advanced Configuration

### Custom Type Mapping
Modify the `TYPE_MAPPING` in `validate-db-types.ts` to handle custom type conversions:

```typescript
const TYPE_MAPPING: Record<string, string> = {
  'custom_postgres_type': 'typescript_type'
};
```

## Continuous Integration
Consider integrating the type validation into your CI/CD pipeline to catch type inconsistencies early.

## Tools and Resources
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Database Type Validation Script](../scripts/validate-db-types.ts)

## Contributing
When contributing:
1. Always run type validation before committing
2. Update documentation if type structure changes
3. Communicate schema modifications with the team
