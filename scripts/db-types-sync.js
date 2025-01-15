#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Paths
const TYPES_PATH = path.resolve(process.cwd(), 'src/lib/database.types.ts');
const SUPABASE_CONFIG_PATH = path.resolve(process.cwd(), 'supabase/config.toml');

// Utility functions
function runCommand(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(chalk.red(`Command failed: ${command}`));
    console.error(chalk.red(error.stderr.toString()));
    process.exit(1);
  }
}

async function main() {
  console.log(chalk.blue('🔄 Supabase Database Type Synchronization'));

  // Check Supabase CLI installation
  try {
    runCommand('supabase --version');
  } catch {
    console.error(chalk.red('Supabase CLI is not installed.'));
    const install = await inquirer.prompt([{
      type: 'confirm',
      name: 'installCLI',
      message: 'Would you like to install Supabase CLI globally?',
      default: true
    }]);

    if (install.installCLI) {
      runCommand('npm install -g supabase-cli');
    } else {
      console.error(chalk.yellow('Please install Supabase CLI to continue.'));
      process.exit(1);
    }
  }

  // Read Supabase configuration
  const supabaseConfig = fs.readFileSync(SUPABASE_CONFIG_PATH, 'utf8');
  const projectRefMatch = supabaseConfig.match(/project_ref\s*=\s*"([^"]+)"/);
  
  if (!projectRefMatch) {
    console.error(chalk.red('Could not find Supabase project reference in config.'));
    process.exit(1);
  }

  const projectRef = projectRefMatch[1];

  // Sync options
  const syncOptions = await inquirer.prompt([
    {
      type: 'list',
      name: 'syncType',
      message: 'Select type synchronization method:',
      choices: [
        'Generate types from local database',
        'Pull types from remote Supabase project',
        'Validate current types'
      ]
    }
  ]);

  switch (syncOptions.syncType) {
    case 'Generate types from local database':
      console.log(chalk.yellow('Generating types from local database...'));
      runCommand(`supabase gen types typescript > ${TYPES_PATH}`);
      console.log(chalk.green('✅ Types generated successfully!'));
      break;

    case 'Pull types from remote Supabase project':
      console.log(chalk.yellow(`Pulling types for project: ${projectRef}`));
      runCommand(`supabase gen types typescript --project-ref ${projectRef} > ${TYPES_PATH}`);
      console.log(chalk.green('✅ Remote types pulled successfully!'));
      break;

    case 'Validate current types':
      console.log(chalk.yellow('Running type validation...'));
      runCommand('npm run validate:db-types');
      break;
  }

  // Optional: Run validation after sync
  const validate = await inquirer.prompt([{
    type: 'confirm',
    name: 'runValidation',
    message: 'Run type validation?',
    default: true
  }]);

  if (validate.runValidation) {
    console.log(chalk.yellow('Running type validation...'));
    runCommand('npm run validate:db-types');
  }

  console.log(chalk.green('🎉 Database type synchronization complete!'));
}

main().catch(error => {
  console.error(chalk.red('Synchronization failed:'), error);
  process.exit(1);
});
