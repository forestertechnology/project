# Supabase Migration Guide for QR Menu SaaS

## Migration Best Practices

### Creating Migrations
1. Use descriptive, meaningful names
2. Include a comment explaining the migration's purpose
3. Test migrations in a development environment first
4. Avoid breaking changes when possible

### Naming Convention
- Migrations are named with a timestamp prefix
- Use snake_case for migration names
- Example: `20240115120000_add_restaurant_limits.sql`

## Migration Types

### Schema Changes
- Adding new tables
- Modifying existing table structures
- Creating indexes
- Updating table constraints

### Policy Changes
- Row-level security policies
- Access control modifications

### Function and Trigger Updates
- Database function modifications
- Trigger creation or updates

## Migration Workflow

### Development
```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npm run db:migrate

# Rollback last migration
supabase migration repair
```

## Migration Configuration

### Allowed Operations
- CREATE TABLE
- ALTER TABLE
- CREATE INDEX
- CREATE POLICY
- CREATE FUNCTION
- CREATE TRIGGER

### Forbidden Operations
- DROP TABLE
- DROP COLUMN
- TRUNCATE

## Environment-Specific Rules

### Development
- Destructive changes allowed
- Flexible migration process

### Staging
- No destructive changes
- Stricter validation

### Production
- No destructive changes
- Requires manual review
- Extensive testing required

## Type Generation
- Automatic TypeScript type generation
- Output: `src/lib/database.types.ts`
- Triggered on each migration

## Validation Rules
- Maximum migration size: 500 KB
- Maximum migrations per release: 10
- Require migration description
- Enforce referential integrity

## Backup Strategy
- Automatic backups enabled
- Backup retention: 30 days

## Hooks
- Pre-migration: Validate database types
- Post-migration: Synchronize types

## Troubleshooting

### Common Issues
- Referential integrity violations
- Type mismatches
- Performance impacts

### Debugging Steps
1. Review migration description
2. Check database constraints
3. Validate type generation
4. Test in development environment

## Best Practices
- Small, incremental migrations
- Comprehensive testing
- Clear documentation
- Avoid data loss

## Tools
- Supabase CLI
- Custom migration scripts
- Database type validation

## Resources
- [Supabase Migration Docs](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Schema Changes](https://www.postgresql.org/docs/current/ddl.html)

## Contribution Guidelines
- Follow naming conventions
- Include migration purpose
- Test thoroughly
- Update documentation

## Disclaimer
Migrations can impact database performance and data integrity. Always proceed with caution and thorough testing.
