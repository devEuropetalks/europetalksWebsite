# Translation Cleanup Tool

This tool helps you clean up unused translation keys in your EuropeTalks project.

## How to Use

1. Generate the list of unused translations by running:
   ```
   node scripts/clean-translations.js
   ```

2. Visit the admin panel at `/admin/translations/clean` to view and clean up the unused translations.

3. The tool will show you which translation keys are unused and allow you to delete them from all language files and the database.

## How It Works

The process has two main steps:

1. **Analysis**: 
   - The script scans the codebase for usage of translation keys 
   - It compares them with all available keys in the translation files
   - Identifies keys that aren't referenced anywhere

2. **Cleanup**:
   - Removes unused keys from all language JSON files
   - Removes the same keys from the database records
   - Shows confirmation before deleting anything

## Important Notes

- **Backup**: Always back up your translations before running cleanup
- **Confirmation**: You'll see a confirmation dialog showing exactly what will be deleted
- **Performance**: The analysis can be resource intensive for large projects
- **False Positives**: Dynamic/programmatic lookups may be reported as unused even if they're not

## Troubleshooting

If you encounter errors:

1. Make sure you've run `node scripts/clean-translations.js` first
2. Check that you have permission to read/write the translation files
3. Ensure your database connection is working

For developers: The implementation is in:
- `/app/admin/translations/clean/page.tsx` - UI
- `/app/api/translations/clean/route.ts` - Deletion API
- `/app/api/translations/unused/route.ts` - Analysis results API
- `/scripts/clean-translations.js` - Analysis script 