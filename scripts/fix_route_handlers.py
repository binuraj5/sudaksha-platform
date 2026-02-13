import os
import re

def fix_route_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern A: (req: NextRequest, params: { params: { ... } }) -> This is WRONG in Next 15 if type is just { slug: string }
    # But usually people wrote (req: NextRequest, { params }: { params: { slug: string } }) which is also wrong now -> Promise
    
    # We need to target:
    # (req: NextRequest, { params }: { params: { ... } })  --> (req: NextRequest, { params }: { params: Promise<{ ... }> })
    # (req: NextRequest, params: { ... }) --> (req: NextRequest, { params }: { params: Promise<{ ... }> })

    # 1. Fix type definition wrapper: { params: { ... } } -> { params: Promise<{ ... }> }
    # Regex to find: params:\s*\{\s*([a-zA-Z0-9_]+\s*:\s*[a-zA-Z0-9_]+[^{}]*)\s*\}
    # And replace with: params: Promise<{$1}>
    
    # This is tricky because of nested braces.
    # Let's try a simpler approach targeting the specific known generated pattern or common manual pattern.
    
    # Common pattern in this codebase based on errors:
    # params: { clientId: string }
    # params: { clientId: string; deptId: string }
    
    # We want to wrap the type in Promise<...>
    
    def promise_wrapper(match):
        inner_type = match.group(1)
        # Avoid double wrapping
        if "Promise<" in inner_type:
            return match.group(0)
        return f"params: Promise<{{ {inner_type} }}>"

    # Regex for: params: { key: type; ... }
    # We look for "params: {" followed by content until "}"
    # This handles the Type Definition part.
    
    new_content = re.sub(r'params\s*:\s*\{\s*([^}]+)\s*\}', promise_wrapper, content)
    
    # 2. Fix Destructuring parameters in function signature
    # (req: NextRequest, params: { ... })  -> (req: NextRequest, { params }: { params: Promise<{ ... }> })
    # This is harder to regex safely.
    
    # However, checks show we often have: 
    # { params }: { params: ... }  (Already destructured)
    # OR 
    # params: { ... } (Not destructured, treating 2nd arg as params object directly)
    
    # If the code uses `params.clientId` later, and we change signature to `{ params }`, we break logic.
    # BUT, Next.js 15 passes `context` as 2nd arg. `context.params` is the promise.
    
    # Current broken state often looks like:
    # export async function GET(req: NextRequest, params: { clientId: string }) 
    # This is treating 2nd arg as the params object (Old Next.js behavior?)
    # We need to change it to:
    # export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> })
    # AND we need to await it: const { clientId } = await params;
    
    # Given the complexity of "awaiting" inside the function body via regex, 
    # we will focus ONLY on fixing the Type Signature which causes the build error "Type X is not assignable to RouteHandlerConfig".
    # The runtime "await" might be needed too, but let's pass the build first.
    # Actually, if we don't await, `params.clientId` will be a Promise object, possibly undefined property access.
    
    # Strategy: 
    # Just wrap the type in Promise<> where it matches "params: { ... }" in the arguments list.
    
    if new_content != content:
        print(f"Fixing type signature in {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            # We explicitly replace "params: {" with "params: Promise<{" in specific contexts
            # This is a bit of a brute force but safe for "params: { id: string }" patterns
            f.write(new_content)
        return True
    return False

def scan_and_fix(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'route.ts':
                filepath = os.path.join(root, file)
                try:
                    if fix_route_file(filepath):
                        count += 1
                except Exception as e:
                    print(f"Failed to process {filepath}: {e}")
    return count

if __name__ == "__main__":
    target_dir = r"c:\Users\Administrator\Documents\GitHub\SudakshaNWS\app\api"
    print(f"Scanning {target_dir}...")
    fixed_count = scan_and_fix(target_dir)
    print(f"Fixed {fixed_count} files.")
