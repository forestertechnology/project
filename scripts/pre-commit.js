#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';

try {
  console.log(chalk.blue('Running database type validation...'));
  
  // Run the database type validation script
  execSync('npm run validate:db-types', { stdio: 'inherit' });
  
  console.log(chalk.green('✅ Database type validation successful'));
} catch (error) {
  console.error(chalk.red('❌ Database type validation failed'));
  console.error(chalk.red('Please fix the database type inconsistencies before committing.'));
  process.exit(1);
}
