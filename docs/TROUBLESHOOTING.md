# QR Menu SaaS - Troubleshooting Guide

## 🛠️ Common Issues and Solutions

### 1. Installation and Setup Problems

#### Node.js Version Compatibility
- **Symptom**: Installation fails or unexpected errors
- **Solution**:
  ```bash
  # Verify Node.js version
  node --version

  # Recommended: Use Node.js v18+
  # Use nvm to manage Node.js versions
  nvm install 18
  nvm use 18
  ```

#### Dependency Installation Failures
- **Symptom**: `npm install` fails
- **Solutions**:
  1. Clear npm cache
     ```bash
     npm cache clean --force
     ```
  2. Delete node_modules and reinstall
     ```bash
     rm -rf node_modules
     npm install
     ```
  3. Use specific npm registry
     ```bash
     npm install --registry=https://registry.npmjs.org/
     ```

### 2. Supabase Configuration Issues

#### Environment Variable Errors
- **Symptom**: Supabase connection failures
- **Checklist**:
  1. Verify `.env` file exists
  2. Confirm all required variables are set
  3. Check Supabase project URL and keys

##### Example `.env` Validation
```bash
# Verify Supabase configuration
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Authentication Problems
- **Symptom**: Login failures, unauthorized access
- **Troubleshooting**:
  1. Check Supabase authentication settings
  2. Verify email verification requirements
  3. Test different authentication methods

### 3. Development Server Issues

#### Port Already in Use
- **Symptom**: `Port 5173 is already in use`
- **Solutions**:
  ```bash
  # Find process using the port
  npx kill-port 5173

  # Alternative: Specify different port
  npm run dev -- --port 5174
  ```

#### CORS and Network Errors
- **Symptom**: Cross-Origin Resource Sharing (CORS) errors
- **Solutions**:
  1. Check Supabase CORS configuration
  2. Verify allowed origins in Supabase project settings
  3. Add local development origin

### 4. Database Migration Problems

#### Type Synchronization Failures
- **Symptom**: Database type validation errors
- **Troubleshooting**:
  ```bash
  # Validate database types
  npm run validate:db-types

  # Regenerate types
  npm run db:sync
  ```

#### Migration Conflicts
- **Symptom**: Migration application fails
- **Solutions**:
  ```bash
  # List migrations
  npm run db:migrate

  # Repair last migration
  supabase migration repair
  ```

### 5. Performance and Build Issues

#### Slow Development Server
- **Troubleshooting**:
  1. Update dependencies
  2. Clear Vite cache
     ```bash
     npx vite clean
     ```
  3. Check system resources

#### Build Failures
- **Solutions**:
  ```bash
  # Clean build cache
  npm run clean

  # Rebuild project
  npm run build
  ```

### 6. Testing and Validation

#### Test Suite Failures
- **Troubleshooting**:
  ```bash
  # Run specific test suite
  npm run test:unit
  npm run test:integration

  # Verbose test output
  npm run test -- --verbose
  ```

### 7. Environment-Specific Issues

#### Development vs. Production Discrepancies
- **Checklist**:
  1. Match environment variables
  2. Verify configuration differences
  3. Test in staging environment

### 8. Security and Access Control

#### Permission Denied Errors
- **Troubleshooting**:
  1. Check Supabase Row Level Security (RLS)
  2. Verify user roles and permissions
  3. Test with different user accounts

## 🔍 Diagnostic Tools

### Logging and Monitoring
- Enable verbose logging
  ```bash
  VITE_LOG_LEVEL=debug npm run dev
  ```

### Performance Profiling
```bash
# Generate performance report
npm run test:performance
```

## 🚨 When to Seek Help

1. Issues persist after trying troubleshooting steps
2. Unique error messages not covered here
3. Suspected system-specific problems

### Recommended Support Channels
- [GitHub Issues](https://github.com/your-org/qrmenu-saas/issues)
- [Support Email](mailto:support@qrmenu.com)
- [Community Discord](https://discord.gg/your-invite)

## 💡 Best Practices

- Keep dependencies updated
- Use the latest Node.js LTS version
- Regularly validate database types
- Monitor performance metrics
- Practice secure configuration

## 🛡️ Disclaimer
Troubleshooting steps may vary based on your specific environment. Always backup data and configuration before making significant changes.

---

🆘 **Need More Help? We're Here for You!** 🚀
