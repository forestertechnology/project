# Contributing to QR Menu SaaS

## Welcome Contributors!

We appreciate your interest in contributing to the QR Menu SaaS project. This document provides guidelines to help you contribute effectively.

## Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Supabase account
- Supabase CLI

### Initial Setup
1. Fork the repository
2. Clone your forked repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables
5. Run the development server:
   ```bash
   npm run dev
   ```

## Workflow

### Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names:
  - `feature/add-new-feature`
  - `bugfix/resolve-authentication-issue`
  - `docs/update-readme`

### Commit Guidelines
- Write clear, concise commit messages
- Use conventional commit format:
  ```
  <type>(<scope>): <description>
  
  Examples:
  feat(database): add new subscription tier
  fix(auth): resolve login error
  docs(readme): update development instructions
  ```

## Database Management

### Type Synchronization
Always ensure database types are synchronized before committing:

```bash
# Interactively sync and validate types
npm run db:sync

# Validate types manually
npm run validate:db-types
```

### Creating Migrations
Use the interactive database management tool:
```bash
npm run db:manage
```

#### Migration Best Practices
- Create descriptive migration names
- Include comments explaining the migration's purpose
- Test migrations in a development environment first
- Avoid breaking changes when possible

## Code Quality

### Linting and Formatting
- Run linter before committing:
  ```bash
  npm run lint
  ```
- Fix any linting errors
- Ensure consistent code style

### Testing
- Write unit tests for new features
- Run test suite before submitting a PR:
  ```bash
  npm test
  ```

## Pull Request Process
1. Ensure all tests pass
2. Validate database types
3. Update documentation if needed
4. Provide a clear description of changes
5. Reference any related issues

### PR Description Template
```markdown
## Description
[Provide a clear summary of your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] I have performed a self-review of my code
- [ ] I have added tests
- [ ] Database types are synchronized
- [ ] Documentation is updated
```

## Reporting Issues
- Use GitHub Issues
- Provide detailed information
- Include reproduction steps
- Specify your environment details

## Code of Conduct
- Be respectful
- Collaborate constructively
- Welcome diverse perspectives

## Getting Help
- Open an issue for questions
- Join our community discussions

## Additional Resources
- [Project README](README.md)
- [Database Types Guide](DATABASE_TYPES.md)
- [Supabase Documentation](https://supabase.com/docs)

Thank you for contributing to QR Menu SaaS! 🎉
