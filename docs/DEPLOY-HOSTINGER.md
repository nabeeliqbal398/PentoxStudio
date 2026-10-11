# Deploying Pentox Studio on a Hostinger VPS

One VPS runs everything with Docker Compose: the app (Next.js + Payload), PostgreSQL 17 with pgvector, Nginx (HTTPS, the only public entry point) and Let's Encrypt (free certificates, renewed automatically).

Files involved: `Dockerfile`, `docker-compose.prod.yml`, `deploy/nginx/default.conf.template`, `deploy/init-letsencrypt.sh`, `deploy/.env.production.example`, `scripts/backup.sh`.

Anything marked **TODO** is information only the client/hosting account can supply. Nothing here has been run against a real Hostinger server yet.

## 1. The server

- **Plan:** a KVM VPS with **at least 2 vCPU and 4 GB RAM** (TODO: confirm the plan bought). The production build and the local embedding model for the chatbot need memory; 1 GB is not enough. 40 GB+ disk (media and backups grow).
- **OS:** Ubuntu 24.04 LTS template.
- **Firewall** (hPanel → VPS → Firewall, or `ufw`): allow 22 (SSH), 80 and 443 only. Postgres is published on `127.0.0.1` only and is never reachable from outside.
- Log in with an SSH key, not a password; disable password login once the key works.

Install Docker (as root or with sudo):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # log out and in again
docker compose version             # must print v2.x
```

## 2. First deploy

```bash
sudo mkdir -p /opt/pentox && sudo chown $USER /opt/pentox
git clone <TODO-repository-url> /opt/pentox
cd /opt/pentox

cp deploy/.env.production.example .env.prod
nano .env.prod        # fill in every TODO. Generate secrets with:  openssl rand -base64 48
```

Required in `.env.prod`: `DOMAIN`, `LETSENCRYPT_EMAIL`, `POSTGRES_*`, `NEXT_PUBLIC_SITE_URL` (https), `PAYLOAD_SECRET`, the SMTP settings. Optional features (analytics ids, Turnstile, Groq chatbot) can stay empty and the feature stays off.

Then, in this order (the build reads published content from the database, so the database must be up and migrated **before** the app is built):

```bash
C="docker compose --env-file .env.prod -f docker-compose.prod.yml"

$C up -d db                              # 1. database
$C run --rm tools pnpm migrate           # 2. create the tables
$C run --rm tools pnpm seed              # 3. starter content (safe to repeat, never overwrites)
$C build app                             # 4. build the site image (takes a few minutes)
bash deploy/init-letsencrypt.sh          # 5. certificate + start Nginx (DNS must already point here, see section 5)
$C up -d                                 # 6. start everything
curl -I https://YOUR-DOMAIN/api/health/  # expect 200 and {"status":"ok"}
```

Open `https://YOUR-DOMAIN/admin/` and create the first admin account (the first account is always an Admin). Use a strong password.

### Updating the site later

```bash
cd /opt/pentox && git pull
C="docker compose --env-file .env.prod -f docker-compose.prod.yml"
$C up -d db
$C run --rm tools pnpm migrate      # only does something when the release has database changes
$C build app && $C up -d app
```

Take a backup first (section 4). Content edits made in the admin need no deploy.

## 3. What is stored where (all survive restarts and rebuilds)

| Docker volume | Holds | Backed up by |
| --- | --- | --- |
| `pentox_pgdata` | the database (all content, leads, subscribers, chat logs) | `backup.sh` |
| `pentox_media` | uploaded images and files | `backup.sh` |
| `pentox_model_cache` | the chatbot's embedding model (downloaded on first use, about 90 MB). Must be **writable** by the app user; if it is lost it simply downloads again. | not needed |
| `pentox_certs`, `pentox_certbot_www` | Let's Encrypt certificates | re-issuable |

`docker compose down` keeps volumes. **Never run `docker compose down -v`** on production: it deletes them.

After the first chat question the model is downloaded; the chatbot's content index is rebuilt from the admin (Chatbot → re-index) after content changes.

## 4. Backups (daily, with an off-server copy)

`scripts/backup.sh` writes a Postgres dump (`db-*.dump`) and a media archive (`media-*.tar.gz`) to `/opt/pentox/backups`, deletes local copies older than 14 days, and copies the new files off the server.

Choose one off-server target (a backup that stays on the same VPS is lost with the VPS):

- **rclone** to Google Drive/Dropbox/S3: `curl https://rclone.org/install.sh | sudo bash`, `rclone config`, then `BACKUP_RCLONE_REMOTE=gdrive:pentox-backups` in `.env.prod`. (TODO: which storage the client uses.)
- **scp** to another server: `BACKUP_SCP_TARGET=user@host:/backups/pentox/` with an SSH key set up.
- Also enable Hostinger's own VPS snapshots/backups as a second layer.

Run it once by hand, then schedule it:

```bash
bash scripts/backup.sh
crontab -e
# add:   30 3 * * *  cd /opt/pentox && bash scripts/backup.sh >> backups/backup.log 2>&1
```

The script prints a WARNING when no off-server copy is configured. **Test a restore** before going live (on staging):

```bash
C="docker compose --env-file .env.prod -f docker-compose.prod.yml"
# database
$C exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists < backups/db-YYYYMMDD-HHMMSS.dump
# media
docker run --rm -v pentox_media:/media -v "$PWD/backups":/in alpine tar xzf /in/media-YYYYMMDD-HHMMSS.tar.gz -C /media
$C restart app
```

On a Windows machine (for example a staging copy), `scripts\backup.ps1` does the same job for the local dev container: `powershell -ExecutionPolicy Bypass -File scripts\backup.ps1`.

## 5. DNS at Namecheap

(Namecheap → Domain List → Manage → **Advanced DNS**.)

1. **Two days before the cut-over, lower the TTL** of the existing `@` and `www` records to 5 min (Automatic is fine) so the switch is quick and reversible.
2. Staging first (section 6): add `A` record, host `new`, value = the VPS IPv4 (TODO).
3. At cut-over: change `A` record host `@` to the VPS IPv4, and make `www` a `CNAME` to `@` (or an `A` to the same IP). Remove any `AAAA` records that point to the old host, unless the VPS has IPv6 configured.
4. Do **not** touch the MX / mail records (they keep the mailboxes working) unless email is moving too.
5. Run `deploy/init-letsencrypt.sh` once DNS resolves to the VPS (`nslookup YOUR-DOMAIN`). If `www` should also work, add it to `server_name` and the certbot `-d` list (TODO: decide whether to redirect `www` to the bare domain; the app's redirect rules can do this).

## 6. Staging at new.pentoxstudio.com

Run staging as a **separate copy** (second folder, e.g. `/opt/pentox-staging`, its own `.env.prod` with `DOMAIN=new.pentoxstudio.com`, `NEXT_PUBLIC_SITE_URL=https://new.pentoxstudio.com`, a different `POSTGRES_PASSWORD`). Docker Compose project names and ports must not clash: use a different `name:` in a copy of the compose file, or put staging on a second small VPS. (TODO: decide the layout; the simplest is staging on the same server **before** the cut-over, then retire it.)

Required staging settings:

- `NOINDEX_SITE=true`: robots.txt disallows everything, every response carries `X-Robots-Tag: noindex`, the sitemap and llms.txt are empty. **Never set this in production** and check it is empty after cut-over.
- Put a password on it too (Nginx `auth_basic`): `sudo apt install apache2-utils && htpasswd -c deploy/nginx/.htpasswd staging`, mount that file, add `auth_basic "Staging"; auth_basic_user_file /etc/nginx/.htpasswd;` to the `location /` block of the staging Nginx config.
- Import the WordPress content there (`pnpm migrate:wp`, all posts arrive as **drafts**), review, then publish.

## 7. Email deliverability (SPF, DKIM, DMARC)

Mail is sent through SMTP (`SMTP_*`), from `EMAIL_FROM` (TODO: the real sending address, e.g. hello@pentoxstudio.com, and which provider: Google Workspace, Zoho, Hostinger email, etc.). Add these TXT records in Namecheap Advanced DNS; copy the exact values from the mail provider's admin console:

| Host | Type | Value |
| --- | --- | --- |
| `@` | TXT (SPF) | `v=spf1 include:TODO-provider-spf-domain ~all`. Only **one** SPF record per domain: merge `include:` entries if there is already one. |
| `TODO-selector._domainkey` | TXT (DKIM) | the key the provider shows (TODO). |
| `_dmarc` | TXT (DMARC) | start with `v=DMARC1; p=none; rua=mailto:TODO-dmarc-reports@pentoxstudio.com; adkim=s; aspf=s`. After a few weeks of clean reports move to `p=quarantine`. |

Check with <https://www.mail-tester.com> (send a test newsletter/lead mail) and Google Postmaster Tools. A Gmail/Workspace account has a daily send cap; the newsletter limits (`NEWSLETTER_*`) keep batches under it.

## 8. Monitoring

- **UptimeRobot** (free): HTTPS monitor on `https://YOUR-DOMAIN/api/health/` every 5 minutes, expected keyword `ok`; alert to the client's email/phone (TODO).
- Logs: `docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f app` (add `--since 1h`). Application errors are written there.
- Disk: `df -h` monthly; `docker system prune -f` removes unused build layers (never use `--volumes`).
- Security updates: `sudo apt update && sudo apt upgrade` monthly; `docker compose ... pull db nginx certbot` and `up -d` for new base images.

## 9. Cut-over checklist (old WordPress → new site)

Before the day:

- [ ] Full **backup of the old WordPress site** (files + database) stored somewhere safe and **kept**: hosting panel backup plus an All-in-One WP Migration/UpdraftPlus export.
- [ ] Staging reviewed end to end on phone and desktop; all TODO content replaced or the section hidden (see the README content list).
- [ ] 07 §12 content received and entered (logo, case studies, prices, testimonials with permission, booking URL, office hours).
- [ ] `.env.prod` complete; `NOINDEX_SITE` **empty**; SMTP test: submit the contact form and a newsletter subscribe, confirm the mails arrive (not in spam).
- [ ] SPF/DKIM/DMARC published and verified.
- [ ] A backup run and a **restore test** succeeded.
- [ ] TTL lowered (section 5).

Cut-over day:

- [ ] Take a final backup of the new site and of WordPress.
- [ ] Point the `A` record to the VPS; wait for `nslookup` to show it; run `deploy/init-letsencrypt.sh`.
- [ ] `https://YOUR-DOMAIN/` loads with a valid certificate; `http://` redirects to `https://`.
- [ ] `/admin/` login works; create the real admin accounts, delete the temporary ones.

**301 redirects check** (the old WordPress URLs must land on the right new pages, otherwise search rankings are lost):

- [ ] List the old URLs (from the old sitemap and Google Search Console → Pages). Make sure each has a rule in the admin under **Redirects** (the seed includes the known ones: `/gallery/`, `/home-new/`, `/service/…`, the duplicate "Top Digital Marketing Agency" posts).
- [ ] Test each: `curl -sI https://YOUR-DOMAIN/OLD-PATH/ | head -n 5`. Expect `HTTP/… 301` or `308` and a `location:` header with the new URL, then `200` on the target. Quick loop:

  ```bash
  for p in /gallery/ /home-new/ /service/; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://YOUR-DOMAIN$p)"; done
  ```
- [ ] No redirect chains (A → B → C) and no loops; targets return 200.
- [ ] `pnpm audit:site https://YOUR-DOMAIN` passes (run from any machine with Node; checks every sitemap URL for status, title, description, h1, canonical, noindex and security headers).

After:

- [ ] `https://YOUR-DOMAIN/robots.txt` shows `Sitemap:` and blocks `/admin/` and `/api/`; `https://YOUR-DOMAIN/sitemap.xml` lists the pages.
- [ ] **Google Search Console:** add the property (domain verification via a Namecheap TXT record), submit `sitemap.xml`, use *Change of address* only if the domain changes (it does not here). Watch Pages → errors for a few weeks.
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] Analytics: GA4/GTM/Clarity ids set, and confirm they only load after accepting cookies.
- [ ] UptimeRobot monitor is green; first scheduled backup ran the next morning and appeared off-server.
- [ ] Keep the old WordPress hosting alive (read-only) for at least 30 days.
- [ ] Update Google Business Profile and social profiles to the final URL if they differ.

## 10. Troubleshooting

| Symptom | Check |
| --- | --- |
| `docker compose build app` fails connecting to the database | `$C up -d db` first and run `pnpm migrate` via the `tools` service; the build needs a migrated database. |
| Nginx restarts in a loop | No certificate yet: run `deploy/init-letsencrypt.sh`. See `$C logs nginx`. |
| 502 from Nginx | The app is still starting (first start takes ~30 s) or crashed: `$C logs app`. |
| Chatbot says it is unavailable | `GROQ_API_KEY`/`GROQ_MODEL` empty; or the model cache volume is not writable: `$C logs app | grep -i cache`. |
| Everyone shares one rate limit | The app must see the real client address: Nginx sets `X-Forwarded-For` to `$remote_addr`. Do not put Cloudflare or another proxy in front without updating that. |
| Site not in Google | `NOINDEX_SITE` is still `true`. |
