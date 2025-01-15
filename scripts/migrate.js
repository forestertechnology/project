#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const MIGRATIONS_PATH = path.resolve(process.cwd(), 'supabase/migrations');

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
-- Example:
-- ALTER TABLE restaurants ADD COLUMN new_column_name datatype;
`);

  console.log(chalk.green(`✅ Migration created: ${filename}`));
}

async function main() {
  console.log(chalk.blue('🗄️  QR Menu SaaS - Database Migration Utility'));

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Select a database migration action:',
    choices: [
      'Create New Migration',
      'List Migrations',
      'Apply Migrations',
      'Rollback Last Migration',
      'Database Status'
    ]
  }]);

  switch (action) {
    case 'Create New Migration':
      await createMigration();
      break;
    case 'List Migrations':
      console.log(chalk.blue('Existing Migrations:'));
      const migrations = listMigrations();
      migrations.forEach(migration => {
        console.log(chalk.yellow(`- ${migration.name}`));
      });
      break;
    case 'Apply Migrations':
      console.log(chalk.yellow('Applying Supabase Migrations...'));
      runCommand('supabase migration up');
      console.log(chalk.green('✅ Migrations Applied'));
      break;
    case 'Rollback Last Migration':
      console.log(chalk.yellow('Rolling Back Last Migration...'));
      runCommand('supabase migration repair');
      console.log(chalk.green('✅ Last Migration Rolled Back'));
      break;
    case 'Database Status':
      console.log(chalk.blue('Checking Database Status...'));
      runCommand('supabase status');
      break;
  }
}

main().catch(error => {
  console.error(chalk.red('Migration process failed:'), error);
  process.exit(1);
});
