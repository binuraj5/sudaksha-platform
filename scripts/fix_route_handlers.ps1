# Fix-RouteHandlers.ps1
$routeFiles = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

foreach ($file in $routeFiles) {
    # Use .NET method for reading all text (compatible with older PS versions)
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Check if the file contains the problematic pattern
    if ($content -match "params\s*:\s*\{") {
        # Avoid files that are already correct (params: Promise<)
        if ($content -notmatch "params\s*:\s*Promise") {
            Write-Host "Fixing $($file.FullName)"
            
            # Replace 'params: {' with 'params: Promise<{'
            # We are careful to only target the argument definition
            $newContent = $content -replace "(params\s*:\s*)\{", '$1Promise<{'
            
            # Match: params: { CONTENT } -> params: Promise<{ CONTENT }>
            # Using regex to capture content inside braces (non-nested assumption)
            $newContent = $newContent -replace "params\s*:\s*\{([^}]+)\}", 'params: Promise<{$1}>'
            
            if ($newContent -ne $content) {
                [System.IO.File]::WriteAllText($file.FullName, $newContent)
            }
        }
    }
}
