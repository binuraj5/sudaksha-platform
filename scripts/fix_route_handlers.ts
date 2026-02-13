import fs from 'fs';
import path from 'path';

function fixRouteFile(filepath: string): boolean {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Regex to find: params: Promise<...>
    // and replace with: { params }: { params: Promise<...> }

    // Pattern: 
    // Match "params: Promise<...>" but NOT if it's already inside { ... }
    // We use a simple approach: look for the string "params: Promise<" 
    // and check if the preceding characters are "{ "

    // However, regex lookbehind might not be fully supported or complex.
    // Let's iterate through matches.

    let newContent = content;

    // Regex matching: (req: NextRequest, params: Promise<...>)
    // We want to capture the type definition.
    // It's hard to capture balanced <> with regex.
    // But usually these are single line or simple enough.

    // Strategy: Find `params: Promise<` and assume it goes until the next matching `>`.
    // Then wrap it.

    const regex = /params\s*:\s*Promise\s*<([^>]+)>/g;

    newContent = content.replace(regex, (match, typeArg, offset) => {
        // Check context
        const preceding = content.substring(offset - 10, offset);
        if (preceding.includes('{')) {
            // Already wrapped likely: { params }: { params: Promise<...> }
            // or { params }: { params: Promise<...> }
            return match; // Don't change
        }

        // Wrap it
        return `{ params }: { params: Promise<${typeArg}> }`;
    });

    if (newContent !== content) {
        // Also need to update usage?
        // If we change `params` to be destructured `{ params }`, 
        // then inside the function `params` is available as the Promise.
        // So usage like `const { id } = await params` STILL WORKS.
        // We don't need to change the body!

        console.log(`Fixing ${filepath}`);
        fs.writeFileSync(filepath, newContent, 'utf-8');
        return true;
    }
    return false;
}

function scanAndFix(directory: string): number {
    let count = 0;
    if (!fs.existsSync(directory)) {
        console.error(`Directory not found: ${directory}`);
        return 0;
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            count += scanAndFix(fullPath);
        } else if (file === 'route.ts') {
            if (fixRouteFile(fullPath)) {
                count++;
            }
        }
    }
    return count;
}

const targetDir = path.resolve('app/api');
const fixedCount = scanAndFix(targetDir);
console.log(`Fixed ${fixedCount} files.`);
