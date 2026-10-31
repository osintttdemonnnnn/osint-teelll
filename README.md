# Aegis Archive
Static OSINT research workspace. No build step, no dependencies, no API keys required.

## Files
index.html, styles.css, app.js, tools.js, storage.js, README.md (all in the repo root).

## Replace files on GitHub (iPhone)
1. Unzip aegis-archive.zip in the Files app (tap it).
2. In Safari open github.com/osintttdemonnnnn/osinttool6777 (tap aA > Request Desktop Website).
3. Tap **Add file > Upload files**, pick the 6 files (same names overwrite old ones).
4. Delete any old files you no longer need (open file > ... > Delete file).
5. Write a commit message, choose **Commit directly to main**, tap Commit.

## Deploy on Render
Render Dashboard > your Static Site > Settings: Branch `main`, Build Command empty, Publish Directory `.` (a dot). Auto-Deploy On. Or tap **Manual Deploy > Deploy latest commit**. Open the .onrender.com URL.

## API keys
None needed. Sources used: Google Public DNS (DoH), ipwho.is, RDAP, Internet Archive, OpenStreetMap Nominatim. If you later add a keyed API, never put the key in these files. Create a Render Web Service or Cloudflare Worker that holds the key as an environment variable and call that from the front end.

## Result labels
verified = fetched live from the named source. derived = computed in your browser. unverified = link-out; confirm manually.

## Limits
Browsers block cross-site requests to many sources, so certificates, SSL, headers, robots.txt, username checks and social searches open the source site instead of fetching. Data is stored in this browser only (localStorage); export JSON to back up.

## Test checklist
- Directory tree opens and filters. Type an email, IP, or domain in the top bar and press Enter: the right tool runs.
- Dashboard loads; menu (☰) opens sidebar; search filters tools.
- Username: 14 links appear. Email: try gmail.com address, see MX/SPF/DMARC.
- Phone: +44 20 7946 0958 gives +44 United Kingdom.
- Org: registry links open. Address: Nominatim matches and map link.
- IP: 8.8.8.8 returns AS15169. DNS: example.com A. WHOIS: example.com.
- Archive: example.com lists snapshots. Domain links open.
- Social links; Discord ID 80351110224678912 gives 2015-05-13.
- Dork builder links open Google. Timestamp 1700000000; hash MD5 sample; Base64 round trip; stacker.
- Favorite a tool; see it on dashboard. Save a result; see it in Investigations.
- New investigation, notes persist after reload, Report TXT and JSON download.
