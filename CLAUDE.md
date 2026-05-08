# BioRevolution Coalition — site notes for Claude

Static prototype for the BioRevolution petition campaign. No build step — plain HTML/CSS/JS at the repo root.

## Deployment targets

The same files are published to two places. Both should be updated for any production change.

| Target | URL | How |
| --- | --- | --- |
| GitHub Pages (preview) | https://initchar.github.io/biorevolution-prototype/ | Auto-builds on `git push origin main`. Confirm via `gh api repos/initchar/biorevolution-prototype/pages/builds --jq '.[0]'`. |
| Production | https://biorevolution.uk | Krystal Hosting cPanel. FTPS upload (see below). DNS already on Krystal nameservers; AutoSSL Let's Encrypt wildcard auto-renews. |

## Production deploy (Krystal cPanel)

Credentials live in `.claude/deploy.env` (gitignored). Source it before running lftp.

```bash
set -a; source .claude/deploy.env; set +a

# Use lftp -c with `open` inside the script — `-e` runs `set` after the
# initial connect attempt, which fails because TLS isn't configured yet.
lftp -c "
set ssl:verify-certificate no
set ftp:ssl-protect-data true
set ftp:ssl-force true
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $FTP_REMOTE
mirror -R --parallel=4 --only-newer --no-perms \
  --exclude-glob .DS_Store \
  --exclude-glob '*.md' \
  --exclude '^\\.git/' \
  --exclude '^\\.claude/' \
  --exclude '^\\.docs/' \
  --exclude '^\\.herenow/' \
  --exclude '^\\.planning/' \
  . .
bye
"

# Verify
curl -sS -I https://biorevolution.uk/ | head -3
```

### Important: --no-perms is mandatory

Pure-FTPd preserves local file modes by default. If a local image has `0600` (which can happen on iCloud-synced files marked private), the upload will copy that mode and the web server will return 403/blank. `--no-perms` forces the remote default (0644) regardless of the local mode. The `IBIC` and `Biofabricate` logos hit this on the first deploy — fix is baked into the command above.

If a single asset is broken on production after a deploy, check perms:

```bash
curl -sS --ssl-reqd -k --user "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST/public_html/Images/logos/mono-dark/"
# any -rw------- entries are unreadable by the web server — chmod them:
lftp -u "$FTP_USER,$FTP_PASS" -e "set ssl:verify-certificate no; set ftp:ssl-force true; chmod 644 public_html/path/to/file; bye" "$FTP_HOST"
```

## Conventions for this site

- British English, plain hyphens only (never em-dashes).
- Petition CTA links to `https://petition.parliament.uk/petitions/767417`.
- Mono-dark supporting-organisation logos in `Images/logos/mono-dark/`.
- Parliamentary supporter photos in `Images/parliamentarians/` (jpg, head-and-shoulders, named `First-Last.jpg`).
- Campaign lead label sits as a sibling above the org grid (not inside a cell) so every grid cell stays structurally identical.
