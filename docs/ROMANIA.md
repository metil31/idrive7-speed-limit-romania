# Speed Limit România — instalare și validare

Acest fork înlocuiește aplicația `speed_limit` din sursa originală cu o hartă offline a României. ID-ul este păstrat intenționat, deci nu instala simultan varianta Georgia.

## Reguli implementate

- o limită numerică OpenStreetMap (`maxspeed`, inclusiv `:forward`/`:backward`) are prioritate;
- zonele `RO:urban`, `RO:rural`, `RO:motorway`, `RO:trunk` sunt interpretate ca 50/90/130/120 km/h;
- fără limită OSM: 50 în localitate, 90 în afara localității, 100 pe drum european, 120 pe drum expres (`highway=trunk`), 130 pe autostradă și 20 pe `living_street`;
- bretelele nu moștenesc limita autostrăzii/drumului expres;
- corecțiile locale făcute din mașină rămân disponibile, dar nu modifică automat OpenStreetMap.

Valorile implicite sunt pentru autoturisme categoria A/B, în condiții normale. Indicatoarele, restricțiile temporare, vremea și regulile speciale au întotdeauna prioritate.

## București și Ilfov

Harta folosește extractul Geofabrik din 24 noiembrie 2026. Pe Calea Victoriei, 13 segmente pe care OpenStreetMap încă le marca la 50 km/h au fost corectate la 30 km/h. Alte trei segmente de pe arteră aveau deja 30 km/h în OSM. [Comunicatul Brigăzii Rutiere din 11 aprilie 2025](https://agerpres.ro/comunicate/2025/04/11/comunicat-de-presa---brigada-rutiera--1439889)

[Lista de corecții](../kit/tools/romania-local-limits.json) se aplică la compilarea hărții. Fiecare intrare identifică segmentul OSM prin ID și nodurile din capete. Dacă se schimbă segmentul sau eticheta de viteză, compilatorul sare peste corecție și o semnalează pentru verificare.

Pe Strada Cantonului din Corbeanca există deja în OSM un segment de 30 km/h. Limita pentru porțiunea alăturată necesită confirmare în teren. În București, anunțul pentru zona centrală din mai 2025 enumeră perimetre, iar pentru strada Prevederii documentele confirmă un indicator lângă școală. Acestea sunt piste pentru o verificare pe segmente. [Zona centrală](https://www.radioromania.ro/stiri-locale/bucuresti-restrictie-de-viteza-la-30-km-h-in-centrul-orasului-id73119.html) · [Strada Prevederii](https://avp.ro/index.php/domenii-de-activitate/domeniul-apararea-protectia-si-promovarea-drepturilor-copilului-avocatul-copilului/competente/)

Am comparat și cu [Overture Transportation](https://docs.overturemaps.org/guides/transportation/), versiunea 2026-11-18.0. Toate segmentele cu limită din eșantionul pentru Calea Victoriei și Strada Cantonului indicau OpenStreetMap ca sursă. Comunicatul Brigăzii Rutiere furnizează confirmarea independentă pentru Calea Victoriei.

## MGU Store

1. Deschide **MGU Store → Settings → Add source**, introdu `metil31/idrive7-speed-limit-romania` și alege ramura `main`.
2. Adaugă și `robertnisipeanu/idrive-apps`, apoi instalează `cluster-render` dacă nu există deja.
3. Instalează **Speed Limit România** cu mașina staționată. Verifică pornirea aplicației și afișajele disponibile.

[MGU Store compilează aplicația din sursă](https://github.com/robertnisipeanu/mgu-store/blob/main/docs/PUBLISHING.md#3-repo-tree) cu Python și SDK-ul disponibil pe unitate. Pentru testul pe drum, limitele aproximative apar cu contur gri. Clasificarea OSM `trunk` și zonele de localitate sunt indicii care pot da valori greșite. Respectă indicatoarele.

## Build și teste

```text
python kit/tools/pack_sli.py romania-latest.osm.pbf -o apps/speed_limit/romania.pack --region Romania --local-limits kit/tools/romania-local-limits.json
python kit/tools/test_pack_sli.py
node kit/tools/test_speed_limit_ro.js
node kit/tools/test_speed_limit_outputs.js
python kit/tools/build.py speed_limit
```

Ultima comandă necesită `oap-sdk` pentru compilarea pe PC. MGU Store pregătește modulul la instalarea din ramura `main`.

## Neconfirmat pe BMW X3 G01 30e

Nu este confirmată pe un BMW X3 G01 30e compatibilitatea exactă a semnalelor de poziție/power-state, versiunea Node a unității, disponibilitatea și ABI-ul `cluster-render`, afișarea HUD, persistența după sleep/wake sau instalarea prin versiunea concretă de MGU Store a mașinii. Aplicația rămâne read-only față de semnalele vehiculului; codul de power/safety upstream nu a fost modificat.
