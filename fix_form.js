const fs = require('fs');
const file = '/Users/luxfajah/Documents/duasmaos/components/clients/ClientForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace labels
content = content.replace(/text-xs font-bold uppercase tracking-wider text-text-primary/g, 'text-[13px] font-medium text-text-primary');

// Add styles to existing Inputs
// We will replace `className="h-11"` with `className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"`
content = content.replace(/className="h-11"/g, 'className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"');
content = content.replace(/className="h-11/g, 'className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all');

// Also replace the remaining uppercase texts
// Step 2, 3, etc titles
content = content.replace(/text-sm font-black uppercase tracking-widest text-text-muted/g, 'text-[17px] font-semibold text-text-primary');

// Segmented controls in step 1 are already fixed by multi_replace_file_content earlier.
fs.writeFileSync(file, content);
console.log('Done');
