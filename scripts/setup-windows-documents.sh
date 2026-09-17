#!/usr/bin/env bash
# Recreate MATCHU under Windows Documents via WSL.
# Default: C:\Users\Administrator\Documents\matchu
set -euo pipefail

REPO_SLUG="daesung-digital/matchu"
DOCS_DIR="${MATCHU_DOCS_DIR:-/mnt/c/Users/Administrator/Documents}"
TARGET="${MATCHU_TARGET:-$DOCS_DIR/matchu}"

if [[ ! -d /mnt/c ]]; then
  echo "error: /mnt/c not found. Run this script inside WSL on Windows, not in the cloud agent VM."
  exit 1
fi

mkdir -p "$DOCS_DIR"

if ! command -v origin >/dev/null 2>&1; then
  echo "Installing Origin CLI..."
  curl -fsSL https://downloads.cursor.com/origin/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

if ! command -v origin >/dev/null 2>&1; then
  echo 'error: origin not on PATH. Run:'
  echo '  echo export PATH="\$HOME/.local/bin:\$PATH" >> ~/.bashrc && source ~/.bashrc'
  exit 1
fi

if [[ -d "$TARGET/.git" ]]; then
  echo "Updating existing clone at $TARGET"
  git -C "$TARGET" pull --ff-only
else
  echo "Cloning $REPO_SLUG into $DOCS_DIR"
  cd "$DOCS_DIR"
  origin repo clone "$REPO_SLUG"
fi

cd "$TARGET"
npm install

cat <<EOF

MATCHU is ready.

Windows path: C:\\Users\\Administrator\\Documents\\matchu
WSL path:     $TARGET

  cd "$TARGET"
  npm run dev

Open http://127.0.0.1:43123

EOF
