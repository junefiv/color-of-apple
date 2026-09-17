# Run from Windows PowerShell (requires WSL). Cannot use Origin CLI in PowerShell alone.
$ErrorActionPreference = "Stop"

if (-not (Get-Command wsl -ErrorAction SilentlyContinue)) {
  Write-Error "WSL is not installed. Install WSL, then run this script again."
}

$scriptInWsl = @'
set -e
if [ ! -d /mnt/c ]; then
  echo "WSL cannot see C: drive. Check WSL installation."
  exit 1
fi
TMP="$(mktemp -d)"
cd "$TMP"
curl -fsSL https://downloads.cursor.com/origin/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
command -v origin >/dev/null || { echo "origin install failed"; exit 1; }
DOCS="/mnt/c/Users/Administrator/Documents"
mkdir -p "$DOCS"
if [ -d "$DOCS/matchu/.git" ]; then
  git -C "$DOCS/matchu" pull --ff-only
else
  cd "$DOCS"
  origin repo clone daesung-digital/matchu
fi
cd "$DOCS/matchu"
npm install
echo ""
echo "Done: C:\Users\Administrator\Documents\matchu"
echo "In WSL: cd /mnt/c/Users/Administrator/Documents/matchu && npm run dev"
'@

wsl -e bash -lc $scriptInWsl
