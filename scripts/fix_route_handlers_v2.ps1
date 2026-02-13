# Fix-RouteHandlers-Correction.ps1
$routeFiles = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

foreach ($file in $routeFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Pattern to fix: Promise<{ ... } }  -> Promise<{ ... }> }
        # We look for "Promise<{" followed by anything NOT ">" until "}" followed by " }"
        
        if ($content -match "Promise<\{") {
            # We want to replace the closing sequence.
            # If we see: string } }
            # And it is inside a Promise, we want string }> }
             
            # Regex: (Promise<\{[^>]+?)( \}\s*\})
            # Capture 1: Promise<{ ...
            # Capture 2: } }
            # Result: $1> }
             
            # Note: regex needs escaping for { }
            $newContent = $content -replace "(Promise<\{[^>]+?)(\}\s*\})", '$1>}'
             
            # Also handle case where there might be a newline
            # But the previous script likely kept it on one line if it matched.
             
            if ($newContent -ne $content) {
                Write-Host "Correcting $($file.FullName)"
                [System.IO.File]::WriteAllText($file.FullName, $newContent)
            }
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $_"
    }
}
