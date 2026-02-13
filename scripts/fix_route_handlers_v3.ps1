# Fix-RouteHandlers-Correction-V3.ps1
$routeFiles = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

foreach ($file in $routeFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Problem: We created "Promise<{... >}" instead of "Promise<{... }>}"
        # We need to find "Promise<{" ... ">}" and verify if it's "}>}" or just ">}"
        # Actually our previous script replaced "} }" with ">}"
        # So we have "... string >}"
        # We want "... string }>}"
        
        # Regex to find: (Promise<\{[^>]+)(>\})
        # This matches "Promise<{ ... string " (Group 1) and ">}" (Group 2)
        # We want to replace Group 2 with "}>}"
        
        if ($content -match "Promise<\{") {
            # Fix the specific error pattern ">}" inside a Promise context (heuristic)
            # We look for the sequence ">}" which is likely the breakage point
            # provided it's NOT "}>" or "=>"
             
            # Safer: Look for our Promise substitution pattern again
            # (Promise<\{[^>]+?)(>\}) 
             
            $newContent = $content -replace "(Promise<\{[^>]+?)(>\})", '$1}>}'
             
            if ($newContent -ne $content) {
                Write-Host "Repairing $($file.FullName)"
                [System.IO.File]::WriteAllText($file.FullName, $newContent)
            }
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $_"
    }
}
