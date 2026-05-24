#!/usr/bin/env pwsh
# Claude Code PreToolUse hook.
# Blocks 'git commit' if dotnet build fails.
# Receives Bash tool input on stdin as JSON: {"command": "..."}
# Exit 0 = allow, non-zero = block.
# Note: Claude Code runs hooks with CWD = project root, but this script
# uses $PSScriptRoot to locate GrandNode.sln for robustness.

$inputJson = $input | Out-String
try {
    $data = $inputJson | ConvertFrom-Json
    $command = $data.command
} catch {
    exit 0
}

if ($command -notmatch '\bgit\s+commit\b') {
    exit 0
}

[Console]::Error.WriteLine("Running pre-commit build check...")
& dotnet build "$PSScriptRoot\..\..\GrandNode.sln" -c Release --no-restore
exit $LASTEXITCODE
