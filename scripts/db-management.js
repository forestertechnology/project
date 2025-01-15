#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Paths
const TYPES_PATH = path.resolve(process.cwd(), 'src/lib/database.types.ts');
const SUPABASE_CONFIG_PATH = path.resolve(process.cwd(), 'supabase/config.toml');
const MIGRATIONS_PATH = path.resolve(process.cwd(), 'supabase/migrations');

// Utility functions
function runCommand(command, options = {}) {
  try {
    return execSync(command, { stdio: 'pipe', ...options }).toString().trim();
  } catch (error) {
    console.error(chalk.red(`Command failed: ${command}`));
    console.error(chalk.red(error.stderr.toString()));
    return null;
  }
}

function listMigrations() {
  return fs.readdirSync(MIGRATIONS_PATH)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => ({
      name: `${file} - ${getMigrationDescription(file)}`,
      value: file
    }));
}

function getMigrationDescription(filename) {
  try {
    const content = fs.readFileSync(path.join(MIGRATIONS_PATH, filename), 'utf8');
    const commentMatch = content.match(/^#\s*(.+)/m);
    return commentMatch ? commentMatch[1] : 'No description';
  } catch {
    return 'Unable to read description';
  }
}

async function main() {
  console.log(chalk.blue('🗄️  QR Menu SaaS - Database Management'));

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Select a database management action:',
    choices: [
      'Synchronize Database Types',
      'Create New Migration',
      'List Migrations',
      'Apply Migrations',
      'Rollback Last Migration',
      'Database Health Check'
    ]
  }]);

  switch (action) {
    case 'Synchronize Database Types':
      await syncDatabaseTypes();
      break;
    case 'Create New Migration':
      await createMigration();
      break;
    case 'List Migrations':
      listExistingMigrations();
      break;
    case 'Apply Migrations':
      applyMigrations();
      break;
    case 'Rollback Last Migration':
      rollbackLastMigration();
      break;
    case 'Database Health Check':
      await performHealthCheck();
      break;
  }
}

async function syncDatabaseTypes() {
  console.log(chalk.yellow('Synchronizing Database Types...'));
  
  const { syncMethod } = await inquirer.prompt([{
    type: 'list',
    name: 'syncMethod',
    message: 'Select type synchronization method:',
    choices: [
      'Generate from Local Database',
      'Pull from Remote Supabase Project',
      'Validate Current Types'
    ]
  }]);

  switch (syncMethod) {
    case 'Generate from Local Database':
      runCommand(`supabase gen types typescript > ${TYPES_PATH}`);
      break;
    case 'Pull from Remote Supabase Project':
      const config = fs.readFileSync(SUPABASE_CONFIG_PATH, 'utf8');
      const projectRefMatch = config.match(/project_ref\s*=\s*"([^"]+)"/);
      
      if (projectRefMatch) {
        runCommand(`supabase gen types typescript --project-ref ${projectRefMatch[1]} > ${TYPES_PATH}`);
      } else {
        console.error(chalk.red('Could not find project reference in config'));
      }
      break;
    case 'Validate Current Types':
      runCommand('npm run validate:db-types');
      break;
  }

  console.log(chalk.green('✅ Type Synchronization Complete'));
}

async function createMigration() {
  const { migrationName, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'migrationName',
      message: 'Enter a name for the migration (use snake_case):',
      validate: input => /^[a-z_]+$/.test(input) || 'Use only lowercase and underscores'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Provide a brief description of the migration:'
    }
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
  const filename = `${timestamp}_${migrationName}.sql`;
  const filepath = path.join(MIGRATIONS_PATH, filename);

  fs.writeFileSync(filepath, `# ${description}

-- Write your migration SQL here
`);

  console.log(chalk.green(`✅ Migration created: ${filename}`));
}

function listExistingMigrations() {
  console.log(chalk.blue('Existing Migrations:'));
  const migrations = listMigrations();
  migrations.forEach(migration => {
    console.log(chalk.yellow(`- ${migration.name}`));
  });
}

function applyMigrations() {
  console.log(chalk.yellow('Applying Supabase Migrations...'));
  runCommand('supabase migration up');
  console.log(chalk.green('✅ Migrations Applied'));
}

function rollbackLastMigration() {
  console.log(chalk.yellow('Rolling Back Last Migration...'));
  runCommand('supabase migration repair');
  console.log(chalk.green('✅ Last Migration Rolled Back'));
}

async function performHealthCheck() {
  console.log(chalk.blue('Performing Database Health Check...'));
  
  const checks = [
    { name: 'Supabase Connection', command: 'supabase status' },
    { name: 'Migration Status', command: 'supabase migration list' }
  ];

  for (const check of checks) {
    console.log(chalk.yellow(`Checking ${check.name}...`));
    const result = runCommand(check.command);
    console.log(result || chalk.red('Check failed'));
  }

  console.log(chalk.green('✅ Health Check Complete'));
}

main().catch(error => {
  console.error(chalk.red('Database management failed:'), error);
  process.exit(1);
});
