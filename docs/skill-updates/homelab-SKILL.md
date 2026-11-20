---
name: "homelab"
description: Help Alan manage, automate, troubleshoot, or extend his homelab infrastructure. Use this skill whenever the user mentions TrueNAS, qBittorrent, Plex, Immich, Docker, MediaMate (formerly ScreenMate; replaced AutoRrent/FileSplitter), NetWatch, AdGuard Home, the Bell Home Hub, the Deco mesh, the Raspberry Pi, media or music folders, Cloudflare Tunnel, Nginx Proxy Manager, moot.es, homelab, NFS, ZFS, or any self-hosted service. Also trigger for SSH commands, Docker workflows, bash scripts on TrueNAS, GitHub Actions for parabyte-ca repos, or any infrastructure task involving Alan's home network. If the user says "check my homelab", "TrueNAS", "my server", "Docker update", "add a service", or similar, use this skill.
---

# Homelab Skill

Authoritative context and repeatable workflows for Alan's self-hosted infrastructure.

---

## Network & Access

| Host | IP | Notes |
|---|---|---|
| TrueNAS SCALE | 192.168.2.15 | SSH user: `amoote`, alias: `truenas`, key: `~/.ssh/id_ed25519` |
| moogbox (Windows) | 192.168.2.2 | Primary workstation |
| Bell Home Hub 4000 | 192.168.2.1 | Gateway/router, Bell fibre (PPPoE); hands out DHCP today. Admin password stored (encrypted) in NetWatch only |
| Deco X55 mesh | DHCP | Access-point mode behind the Hub; owner account used by NetWatch (use a manager account in the Deco app) |
| Raspberry Pi (AdGuard Home) | planned, e.g. 192.168.2.53 | **Not installed yet.** Will run AdGuard Home as the LAN's DNS (and possibly DHCP); NetWatch reads it. Setup steps: NetWatch README "AdGuard Home on a Raspberry Pi" |
| LAN subnet | 192.168.2.0/24 | |

**Cloudflare Tunnel ID:** `9923ce60-9481-4beb-9225-e6fdff7134d2`
**Domains:** `moot.es`, `lantix.ca` — DNS on Cloudflare
**GitHub org:** `parabyte-ca`

---

## Port Registry

The authoritative port registry lives in the `dev-sop` skill as `ports.md`. The services table below must be kept in sync with it. **When adding or changing a service here, update `dev-sop/ports.md` as well — and vice versa.**

---

## Key Services on TrueNAS

| Service | Port | Notes |
|---|---|---|
| Plex | 32400 | Media server |
| Immich | 2283 | Photo management |
| qBittorrent | 30024 | Web API; credentials are in MediaMate Settings → qBittorrent, never in notes. Categories: `screenmate` (video; kept from before the rename) and `music` |
| Nginx Proxy Manager | — | Reverse proxy |
| Heimdall | — | Dashboard |
| Cloudflared | — | Host networking via TrueNAS app |
| NetWatch | 8090 | Network diagnostics (outages, Bell vs home network vs DNS); docker compose with host networking (no `-p`; `NETWATCH_PORT`), container `netwatch`, image `ghcr.io/parabyte-ca/netwatch` (signed). Public name `netwatch.moot.es`. See the `netwatch` skill |
| MathQuest | 8086 | Adaptive Ontario math practice (Gr 5-12), invite-only; docker compose, container `mathquest`, image `ghcr.io/parabyte-ca/mathquest` (signed). Public name `mathquest.moot.es`. v2 in build (2026-11); port 8085 stays flagged as an unknown service |
| MediaMate | 4260 | Media app (downloads, encoding, organising, music, Plex sync); docker compose, container `mediamate` (compose service still `screenmate`), image `ghcr.io/parabyte-ca/mediamate`. Formerly ScreenMate; replaced AutoRrent (8180) and FileSplitter, both archived. See the `mediamate` skill |

---

## Key Paths

| Path | Purpose |
|---|---|
| `/mnt/shared_vol/websites/` | Static site files |
| `/mnt/shared_vol/AppConfigs/` | App configs, scripts |
| `/mnt/shared_vol/AppConfigs/usb_backup.sh` | USB rsync backup script |
| `/mnt/shared_vol/AppConfigs/website-deployer/` | Deployer configs |
| `/mnt/shared_vol/Scripts/vt-monitor/` | VirusTotal domain monitor |

| `/mnt/video` | Media: TV, Movies, Mature folders, Bellesa (protected, never in Plex) |
| `/mnt/music` | Music library (Plex Music library points here; MediaMate folder "Library for: Music") |
| `/mnt/music/.downloads` | Album downloads: qBittorrent `music` category save path; same dataset so MediaMate can hardlink into the library |

**Backblaze cloud sync:** task id=5, bucket `amoote-truenas-immich`

---

## Updating Services

**MediaMate** (repo `parabyte-ca/mediamate`, renamed from `screenmate`; GitHub redirects):
- Use the app's **Updates** page. A cron-driven upgrade agent runs `update.sh`, which backs up, tests and rolls back on failure.
- By hand: `cd <install folder> && sudo ./update.sh` (the folder keeps its old name)
- Logs: `docker logs mediamate`
- Local mounts and the port live in `docker-compose.override.yml` and `.env` (written by `setup.sh`).
- Check the override after editing with `docker compose config`.

**NetWatch** (repo `parabyte-ca/netwatch`, checkout `/mnt/shared_vol/websites/netwatch`):
- Use the app's **System** page (live progress since v0.12). A TrueNAS cron job, the upgrade agent (`scripts/upgrade-agent.sh`, managed with `midclt`), runs `update.sh`: backup, signature check, health check, automatic rollback.
- By hand: `cd /mnt/shared_vol/websites/netwatch && sudo ./update.sh` (`--version X.Y.Z`, `--rollback`)
- Logs: `sudo docker logs --tail 100 netwatch`; update log `upgrade-status/upgrade.log`; agent `sudo scripts/upgrade-agent.sh --status`
- Forgotten password: `sudo docker exec -it netwatch python -m netwatch.reset_password admin`

**Other single-container services** (no compose):
```bash
git pull
docker build -t <image-name> .
docker stop <container-name>
docker rm <container-name>
docker run -d --name <container-name> --restart unless-stopped -p <port>:<port> <image-name>
```

---

## ZFS / NFS ACL Notes

- TrueNAS uses NFSv4 ACLs (`nfs4xdr_setfacl`)
- Apply ACLs per-directory, **not** with a blanket recursive flag on dataset root
- `nfs4xdr_setfacl` on TrueNAS SCALE takes the **same text format `nfs4xdr_getfacl` prints**, with the entry straight after `-a`. The `A:fdg:…` (nfs4-acl-tools) format, `-a 0 <entry>` and `-m <entry>` are all rejected.
- Media dataset: `/mnt/shared_vol/media/{video,music}` are folders in one dataset. Each needs `group:apps:rwxpDdaARWc--s:fd-----:allow` so qBittorrent and MediaMate (uid/gid 568) can write. Music was missing it until 2026-11-07.
- qBittorrent write permission fix pattern (folder, subfolders, then files; run each once, since each run adds another copy):
  ```bash
  sudo nfs4xdr_getfacl /path/to/dir
  sudo nfs4xdr_setfacl -a "group:apps:rwxpDdaARWc--s:fd-----:allow" /path/to/dir
  sudo find /path/to/dir -mindepth 1 -type d -exec nfs4xdr_setfacl -a "group:apps:rwxpDdaARWc--s:fd-----:allow" {} \;
  sudo find /path/to/dir -type f -exec nfs4xdr_setfacl -a "group:apps:rwxpDdaARWc--s:-------:allow" {} \;
  ```
- Test as qBittorrent's real user (plain `docker exec` runs as root and always succeeds):
  ```bash
  sudo docker exec -u 568:568 ix-qbittorrent-qbittorrent-1 sh -c 'touch /mnt/music/.t && rm /mnt/music/.t && echo writable'
  ```
- qBittorrent container: `ix-qbittorrent-qbittorrent-1` (runs as 568:568). Host mounts: `/mnt/shared_vol/media/music -> /mnt/music`, `/mnt/shared_vol/media/video -> /mnt/video`.
- New media folders (e.g. `/mnt/music`, `/mnt/music/.downloads`) need the same write access for qBittorrent and MediaMate. Check with MediaMate's **Settings → Folders → Test**.

---

## Websites

Static sites live in `/mnt/shared_vol/websites/` and are served via Nginx Proxy Manager through the Cloudflare Tunnel.

Subdomains in use (examples): `lantix.moot.es`, `postnorth.moot.es`

Lantix website repo: `parabyte-ca/lantix-website`
Lantix temp one-pager: `parabyte-ca/lantix-temp-website`

---

## MediaMate

Feature status, troubleshooting and the release workflow live in the `mediamate` skill. Don't track MediaMate features here.

---

## NetWatch

Features, troubleshooting, code and the release workflow live in the `netwatch` skill. Host-level facts to keep here:
- **Folders** (keep all of them when migrating TrueNAS): `data/` (database, `backups/`, and `.secret_key`, which encrypts the Deco, Home Hub, AdGuard and Anthropic credentials; it is **not** in the backups, so without it those must be re-entered), `upgrade/` (request inbox the container writes), `upgrade-status/` (agent replies, read-only in the container), `.state/` (root-only, never mounted).
- **Host names:** NetWatch only answers to IP addresses, `localhost` and names in `NETWATCH_ALLOWED_HOSTS` (DNS-rebinding protection). For a new name (e.g. `netwatch.moot.es`, `truenas.local`), add it in `.env` and run `sudo docker compose up -d`.
- Serving it through the Cloudflare Tunnel needs HTTPS and `NETWATCH_COOKIE_SECURE=true`.
- The Hub and Deco integrations are read-only; AdGuard Home changes only with "AdGuard Home actions" turned on in NetWatch Admin (off by default).

---

## Automation Principles

- **Measure twice, cut once** — confirm paths and container names before running destructive commands
- Prefer idempotent scripts (safe to re-run)
- SSH commands: always use `truenas` alias and `~/.ssh/id_ed25519`
- For TrueNAS app management, prefer TrueNAS UI or `cli` where possible over direct Docker manipulation of system-managed containers
- Telegram bot integration exists but is incomplete — flag this if a notification feature is requested

---

## Common Task Patterns

### SSH into TrueNAS
```bash
ssh truenas
```

### Check running Docker containers
```bash
ssh truenas "docker ps"
```

### Tail service logs
```bash
ssh truenas "docker logs --tail 50 -f <container-name>"
```

### Deploy a website update
```bash
ssh truenas "cd /mnt/shared_vol/websites/<site> && git pull"
```

### Check disk usage
```bash
ssh truenas "df -h"
```

---

## When Asked to Add a New Service

1. Confirm: port, persistent volume paths, restart policy
2. Check for port conflicts against the services table above
3. Draft `docker run` command with `-d`, `--restart unless-stopped`, named volumes
4. Consider whether it needs a reverse proxy entry in Nginx Proxy Manager
5. Consider whether it needs a Cloudflare DNS record for external access

