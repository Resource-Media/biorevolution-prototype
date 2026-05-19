# BioRevolution Coalition — site notes for Claude

Static prototype for the BioRevolution petition campaign. No build step — plain HTML/CSS/JS at the repo root.

## Hosting

Production runs on a Krystal Hosting cPanel account backed by LiteSpeed. Public URL: https://biorevolution.uk. DNS is on Krystal nameservers; AutoSSL Let's Encrypt wildcard auto-renews.

## Petition counter cron

`update-petition-count.php` fetches the live signature count from `petition.parliament.uk/petitions/767417.json` and writes it to `petition-count.json` (atomic via `.tmp` + `rename`). The front-end (`script.js`) reads `/petition-count.json` to render the count and progress bar.

A cPanel Cron job runs the PHP every 5 minutes:

```
*/5 * * * * /usr/local/bin/php /home/<cpanel-user>/public_html/update-petition-count.php >/dev/null 2>&1
```

If the counter on the live site goes stale, check the cron log in cPanel and confirm `petition-count.json` is being rewritten.

## Production deploy (FTPS via lftp)

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

Do not overwrite `petition-count.json` on deploy — it is rewritten server-side by the cron job. The `mirror --only-newer` flag protects it as long as the local copy isn't touched.

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
