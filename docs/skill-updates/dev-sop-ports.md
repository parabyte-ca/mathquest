# Port Registry
# Source of truth for all assigned ports across parabyte-ca projects and homelab services.
# Always check this file before assigning a port to a new service or project.
# Update this file immediately when a new port is assigned.

## Reserved Port Ranges

| Range | Purpose |
|---|---|
| 80, 443 | Nginx Proxy Manager (external traffic) |
| 81 | Nginx Proxy Manager admin UI |
| 2000-2999 | Media & photo services |
| 8000-8999 | Custom applications (parabyte-ca projects) |
| 30000-30999 | TrueNAS app-managed services |

---

## Assigned Ports

| Port | Service | Container / App | Notes |
|---|---|---|---|
| 80 | Nginx Proxy Manager | nginxproxymanager | External HTTP |
| 81 | Nginx Proxy Manager Admin | nginxproxymanager | Admin UI |
| 443 | Nginx Proxy Manager | nginxproxymanager | External HTTPS |
| 2283 | Immich | immich | Photo management |
| 3002 | Francine | francine | parabyte-ca project, SMB CRM with Google Workspace backend |
| 8080 | Website - Lantix | website-lantix | Static site |
| 8082 | Website - POSTNORTH | website-postnorth | Static site |
| 8083 | Unknown | unidentified | Occupied outside this registry, "address already in use" on TrueNAS deploy 2026-07-02, do not assign until identified (check `sudo ss -tlnp \| grep 8083` or `sudo docker ps` on TrueNAS) |
| 8084 | The Menu | the-menu | Private couples menu tracker; parabyte-ca/the-menu; menu.moot.es via Cloudflare Tunnel; moved from 8083 on 2026-07-02 |
| 8085 | Unknown | unidentified | Occupied outside this registry (found 2026-10-17 while deploying NetWatch); do not assign until identified (`sudo ss -tlnp \| grep 8085`) |
| 8086 | MathQuest | mathquest | parabyte-ca/mathquest v2; mathquest.moot.es via Cloudflare Tunnel; docker compose, host `-p 8086:8086`; chosen 2026-11-20 because 8085 is occupied by an unknown service. `setup.sh` must still confirm 8086 is free (`sudo ss -tlnp \| grep 8086`) |
| 8090 | NetWatch | netwatch | parabyte-ca/netwatch; host networking (no `-p` mapping: the app listens on 8090 directly, set by `NETWATCH_PORT`) |
| 4260 | MediaMate | mediamate | parabyte-ca/mediamate (formerly ScreenMate); docker compose, `SCREENMATE_PORT` in `.env` → container 8000 |
| 8180 | AutoRrent (retired) | autorrent | Archived; replaced by MediaMate. Confirm the container is gone (`sudo docker ps -a \| grep autorrent`) before reusing the port |
| 30024 | qBittorrent (Web UI) | qbittorrent | TrueNAS managed app |
| 51413 | qBittorrent (Peer) | qbittorrent | Torrent peer listening port |
| 30050 | Sonarr | sonarr | TrueNAS managed app |
| 30119 | Heimdall (HTTPS) | heimdall | TrueNAS managed app |
| 30120 | Heimdall (HTTP) | heimdall | TrueNAS managed app |
| 30149 | Homebox | homebox | Open source, warranty/appliance tracker |
| 30328 | Dockhand | dockhand | Open source Docker manager (not a parabyte-ca project) |
| 32400 | Plex | plex | Media server |

---

## Other Hosts

| Host | Port | Service | Notes |
|---|---|---|---|
| Raspberry Pi (planned, e.g. 192.168.2.53) | 53 | AdGuard Home DNS | Not installed yet |
| Raspberry Pi | 80 (or 3000) | AdGuard Home web UI / API | 3000 is the first-run wizard; NetWatch reads the API on the chosen port |

---

## Available Ranges for New Projects

| Range | Status |
|---|---|
| 3003-4259, 4261-7999 | Available (custom apps) |
| 8001-8079 | Available (custom apps) |
| 8081 | Available (custom apps) |
| 8087-8089 | Available (custom apps) |
| 8091-8179 | Available (custom apps) |
| 8181-8999 | Available (custom apps) |
| 9000-9999 | Available (reserved for future use) |

---

## Changelog

| Date | Port | Action | Service |
|---|---|---|---|
| 2026-11-20 | 8086 | Assigned | MathQuest v2 (parabyte-ca/mathquest); 8085 left flagged unknown. Verify with `sudo ss -tlnp` on first deploy |
| 2026-11-14 | 4260 | Recorded | MediaMate (was missing from the registry) |
| 2026-11-14 | 8180 | Retired | AutoRrent archived, replaced by MediaMate |
| 2026-11-14 | 53, 80 | Planned | AdGuard Home on a Raspberry Pi (separate host) |
| 2026-10-18 | 8090 | Assigned | NetWatch (parabyte-ca/netwatch), host networking |
| 2026-10-18 | 8180 | Clarified | AutoRrent maps host 8180 to container 8000 |
| 2026-10-17 | 8085 | Flagged | Found occupied outside the registry; marked unknown |
| 2026-07-02 | 8083, 8084 | Corrected | 8083 found occupied outside registry on deploy, flagged unknown; The Menu moved to 8084 |
| 2026-07-02 | 8083 | Assigned | The Menu (parabyte-ca/the-menu) |
| 2026-04-18 | N/A | Initial registry created | N/A |
| 2026-04-18 | Multiple | Populated from known services | All above |
