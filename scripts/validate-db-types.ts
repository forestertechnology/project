import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(chalk.red('Missing Supabase environment variables'));
  process.exit(1);
}

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type definitions for validation
interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  description?: string;
}

interface TableValidationResult {
  tableName: string;
  columnsMatched: number;
  columnsMissing: string[];
  columnsExtra: string[];
  typeErrors: string[];
  isValid: boolean;
}

// Configuration for validation
const VALIDATION_CONFIG = {
  ignoredColumns: ['created_at', 'updated_at'],
  strictTypeChecking: true,
  generateReport: true,
  reportPath: path.resolve(process.cwd(), 'database-validation-report.json')
};

// Manually defined column definitions to match the Database type
const DatabaseStructure = {
  public: {
    Tables: {
      subscription_tiers: {
        Row: [
          { name: 'id', type: 'string', nullable: false, description: 'Unique identifier for the subscription tier' } as ColumnDefinition,
          { name: 'name', type: 'string', nullable: false, description: 'Name of the subscription tier' } as ColumnDefinition,
          { name: 'max_menu_items', type: 'number', nullable: false, description: 'Maximum number of menu items allowed' } as ColumnDefinition,
          { name: 'max_menus', type: 'number', nullable: false, description: 'Maximum number of menus allowed' } as ColumnDefinition,
          { name: 'max_categories', type: 'number', nullable: false, description: 'Maximum number of categories allowed' } as ColumnDefinition,
          { name: 'max_backgrounds', type: 'number', nullable: false, description: 'Maximum number of backgrounds allowed' } as ColumnDefinition,
          { name: 'max_custom_links', type: 'number', nullable: false, description: 'Maximum number of custom links allowed' } as ColumnDefinition,
          { name: 'custom_qr_codes', type: 'boolean', nullable: false, description: 'Whether custom QR codes are enabled' } as ColumnDefinition,
          { name: 'special_offers', type: 'boolean', nullable: false, description: 'Whether special offers are enabled' } as ColumnDefinition,
          { name: 'regular_price', type: 'number', nullable: false, description: 'Regular price of the subscription tier' } as ColumnDefinition,
          { name: 'discounted_price', type: 'number', nullable: true, description: 'Discounted price of the subscription tier' } as ColumnDefinition,
          { name: 'discount_percentage', type: 'number', nullable: true, description: 'Percentage discount for the tier' } as ColumnDefinition,
          { name: 'discount_ends_at', type: 'string', nullable: true, description: 'Timestamp when the discount ends' } as ColumnDefinition,
          { name: 'created_at', type: 'string', nullable: false, description: 'Timestamp of tier creation' } as ColumnDefinition,
          { name: 'updated_at', type: 'string', nullable: false, description: 'Timestamp of last tier update' } as ColumnDefinition
        ]
      },
      user_profiles: {
        Row: [
          { name: 'id', type: 'string', nullable: false, description: 'Unique identifier for the user profile' } as ColumnDefinition,
          { name: 'first_name', type: 'string', nullable: false, description: 'User\'s first name' } as ColumnDefinition,
          { name: 'last_name', type: 'string', nullable: false, description: 'User\'s last name' } as ColumnDefinition,
          { name: 'phone_number', type: 'string', nullable: true, description: 'User\'s phone number' } as ColumnDefinition,
          { name: 'subscription_tier_id', type: 'string', nullable: false, description: 'ID of the user\'s subscription tier' } as ColumnDefinition,
          { name: 'is_admin', type: 'boolean', nullable: false, description: 'Whether the user has admin privileges' } as ColumnDefinition,
          { name: 'created_at', type: 'string', nullable: false, description: 'Timestamp of profile creation' } as ColumnDefinition,
          { name: 'updated_at', type: 'string', nullable: false, description: 'Timestamp of last profile update' } as ColumnDefinition
        ]
      },
      restaurants: {
        Row: [
          { name: 'id', type: 'string', nullable: false, description: 'Unique identifier for the restaurant' } as ColumnDefinition,
          { name: 'name', type: 'string', nullable: false, description: 'Name of the restaurant' } as ColumnDefinition,
          { name: 'description', type: 'string', nullable: true, description: 'Description of the restaurant' } as ColumnDefinition,
          { name: 'location', type: 'string', nullable: true, description: 'Location of the restaurant' } as ColumnDefinition,
          { name: 'logo_url', type: 'string', nullable: true, description: 'URL of the restaurant\'s logo' } as ColumnDefinition,
          { name: 'owner_id', type: 'string', nullable: false, description: 'ID of the restaurant owner' } as ColumnDefinition,
          { name: 'facebook_url', type: 'string', nullable: true, description: 'Facebook page URL' } as ColumnDefinition,
          { name: 'twitter_url', type: 'string', nullable: true, description: 'Twitter profile URL' } as ColumnDefinition,
          { name: 'instagram_url', type: 'string', nullable: true, description: 'Instagram profile URL' } as ColumnDefinition,
          { name: 'created_at', type: 'string', nullable: false, description: 'Timestamp of restaurant creation' } as ColumnDefinition,
          { name: 'updated_at', type: 'string', nullable: false, description: 'Timestamp of last restaurant update' } as ColumnDefinition
        ]
      },
      menu_categories: {
        Row: [
          { name: 'id', type: 'string', nullable: false, description: 'Unique identifier for the menu category' } as ColumnDefinition,
          { name: 'name', type: 'string', nullable: false, description: 'Name of the menu category' } as ColumnDefinition,
          { name: 'restaurant_id', type: 'string', nullable: false, description: 'ID of the restaurant this category belongs to' } as ColumnDefinition,
          { name: 'created_at', type: 'string', nullable: false, description: 'Timestamp of category creation' } as ColumnDefinition,
          { name: 'updated_at', type: 'string', nullable: false, description: 'Timestamp of last category update' } as ColumnDefinition
        ]
      },
      menu_items: {
        Row: [
          { name: 'id', type: 'string', nullable: false, description: 'Unique identifier for the menu item' } as ColumnDefinition,
          { name: 'name', type: 'string', nullable: false, description: 'Name of the menu item' } as ColumnDefinition,
          { name: 'description', type: 'string', nullable: true, description: 'Description of the menu item' } as ColumnDefinition,
          { name: 'price', type: 'number', nullable: false, description: 'Price of the menu item' } as ColumnDefinition,
          { name: 'category', type: 'string', nullable: false, description: 'Category of the menu item' } as ColumnDefinition,
          { name: 'restaurant_id', type: 'string', nullable: false, description: 'ID of the restaurant this item belongs to' } as ColumnDefinition,
          { name: 'image_url', type: 'string', nullable: true, description: 'URL of the menu item image' } as ColumnDefinition,
          { name: 'created_at', type: 'string', nullable: false, description: 'Timestamp of menu item creation' } as ColumnDefinition,
          { name: 'updated_at', type: 'string', nullable: false, description: 'Timestamp of last menu item update' } as ColumnDefinition
        ]
      }
    }
  }
};

// Map Postgres types to TypeScript types
const TYPE_MAPPING: Record<string, string> = {
  'character varying': 'string',
  'text': 'string',
  'integer': 'number',
  'numeric': 'number',
  'boolean': 'boolean',
  'timestamp with time zone': 'string',
  'uuid': 'string'
};

async function validateDatabaseTypes() {
  console.log(chalk.blue('Starting database type validation...'));

  // Define the tables to validate
  const tablesToValidate = Object.keys(DatabaseStructure.public.Tables);

  const validationResults: TableValidationResult[] = [];

  for (const tableName of tablesToValidate) {
    try {
      // Fetch table schema from Supabase
      const { data: tableColumns, error } = await supabase
        .from('pg_catalog.information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');

      if (error) {
        console.error(chalk.red(`Error fetching schema for ${tableName}:`), error);
        continue;
      }

      // Get the corresponding TypeScript type
      const typeDefinition = DatabaseStructure.public.Tables[tableName as keyof typeof DatabaseStructure.public.Tables];
      
      if (!typeDefinition) {
        console.error(chalk.red(`No type definition found for table: ${tableName}`));
        continue;
      }

      // Extract column names from TypeScript type
      const typeColumns = typeDefinition.Row;

      // Compare database columns with type definition
      const columnNames = tableColumns.map(col => col.column_name);
      
      const columnsMissing = typeColumns
        .filter(col => 
          !columnNames.includes(col.name) && 
          !VALIDATION_CONFIG.ignoredColumns.includes(col.name)
        )
        .map(col => col.name);
      
      const columnsExtra = columnNames.filter(
        col => !typeColumns.some(tc => tc.name === col) && 
               !VALIDATION_CONFIG.ignoredColumns.includes(col)
      );

      // Type validation
      const typeErrors: string[] = [];
      if (VALIDATION_CONFIG.strictTypeChecking) {
        tableColumns.forEach(dbCol => {
          const typeCol = typeColumns.find(tc => tc.name === dbCol.column_name);
          if (typeCol) {
            const expectedType = TYPE_MAPPING[dbCol.data_type.toLowerCase()] || dbCol.data_type;
            
            // Check nullability
            if (typeCol.nullable === false && dbCol.is_nullable === 'YES') {
              typeErrors.push(`Column ${dbCol.column_name} should not be nullable`);
            }
            
            // Check type mapping
            if (expectedType !== typeCol.type) {
              typeErrors.push(
                `Type mismatch for column ${dbCol.column_name}: ` +
                `Expected ${typeCol.type}, got ${expectedType}`
              );
            }
          }
        });
      }

      const validationResult: TableValidationResult = {
        tableName,
        columnsMatched: typeColumns.length - columnsMissing.length,
        columnsMissing,
        columnsExtra,
        typeErrors,
        isValid: columnsMissing.length === 0 && 
                 columnsExtra.length === 0 && 
                 typeErrors.length === 0
      };

      validationResults.push(validationResult);
    } catch (err) {
      console.error(chalk.red(`Validation error for ${tableName}:`), err);
    }
  }

  // Print validation results
  console.log(chalk.blue('\nValidation Results:'));
  let overallValid = true;

  validationResults.forEach(result => {
    console.log(`\n${chalk.bold(result.tableName)}:`);
    
    const validStatus = result.isValid ? 
      chalk.green('✅ Valid') : 
      chalk.red('❌ Invalid');
    console.log(`Status: ${validStatus}`);
    console.log(`Columns Matched: ${result.columnsMatched}`);
    
    if (result.columnsMissing.length > 0) {
      console.log(chalk.yellow('Columns Missing from Type Definition:'));
      result.columnsMissing.forEach(col => console.log(`  - ${col}`));
      overallValid = false;
    }
    
    if (result.columnsExtra.length > 0) {
      console.log(chalk.yellow('Extra Columns in Database:'));
      result.columnsExtra.forEach(col => console.log(`  - ${col}`));
      overallValid = false;
    }

    if (result.typeErrors.length > 0) {
      console.log(chalk.yellow('Type Validation Errors:'));
      result.typeErrors.forEach(err => console.log(`  - ${err}`));
      overallValid = false;
    }
  });

  // Generate validation report if enabled
  if (VALIDATION_CONFIG.generateReport) {
    try {
      fs.writeFileSync(
        VALIDATION_CONFIG.reportPath, 
        JSON.stringify(validationResults, null, 2)
      );
      console.log(chalk.green(`\nValidation report saved to: ${VALIDATION_CONFIG.reportPath}`));
    } catch (err) {
      console.error(chalk.red('Failed to generate validation report:'), err);
    }
  }

  // Exit with non-zero code if any validation failed
  if (!overallValid) {
    console.log(chalk.red('\nDatabase type validation failed!'));
    process.exit(1);
  }

  console.log(chalk.green('\nDatabase type validation successful! 🎉'));
  process.exit(0);
}

// Run the validation
validateDatabaseTypes().catch(err => {
  console.error(chalk.red('Validation script error:'), err);
  process.exit(1);
});
