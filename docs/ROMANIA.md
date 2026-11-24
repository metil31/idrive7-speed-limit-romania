# Speed Limit România — instalare și validare

Acest fork înlocuiește aplicația `speed_limit` din sursa originală cu o hartă offline a României. ID-ul este păstrat intenționat, deci nu instala simultan varianta Georgia.

## Reguli implementate

- o limită numerică OpenStreetMap (`maxspeed`, inclusiv `:forward`/`:backward`) are prioritate;
- zonele `RO:urban`, `RO:rural`, `RO:motorway`, `RO:trunk` sunt interpretate ca 50/90/130/120 km/h;
- fără limită OSM: 50 în localitate, 90 în afara localității, 100 pe drum european, 120 pe drum expres (`highway=trunk`), 130 pe autostradă și 20 pe `living_street`;
- bretelele nu moștenesc limita autostrăzii/drumului expres;
- corecțiile locale făcute din mașină rămân disponibile, dar nu modifică automat OpenStreetMap.

Valorile implicite sunt pentru autoturisme categoria A/B, în condiții normale. Indicatoarele, restricțiile temporare, vremea și regulile speciale au întotdeauna prioritate.

## MGU Store

1. Deschide **MGU Store → Settings → Add source**, introdu `metil31/idrive7-speed-limit-romania` și alege ramura `main`.
2. Adaugă și `robertnisipeanu/idrive-apps`, apoi instalează `cluster-render` dacă nu există deja.
3. Instalează **Speed Limit România** cu mașina staționată. Verifică pornirea aplicației și afișajele disponibile.

[MGU Store compilează aplicația din sursă](https://github.com/robertnisipeanu/mgu-store/blob/main/docs/PUBLISHING.md#3-repo-tree) cu Python și SDK-ul disponibil pe unitate. Pentru testul pe drum, limitele aproximative apar cu contur gri. Clasificarea OSM `trunk` și zonele de localitate sunt indicii care pot da valori greșite. Respectă indicatoarele.

## Build și teste

```text
python kit/tools/pack_sli.py romania-latest.osm.pbf -o apps/speed_limit/romania.pack --region Romania
python kit/tools/test_pack_sli.py
node kit/tools/test_speed_limit_ro.js
node kit/tools/test_speed_limit_outputs.js
python kit/tools/build.py speed_limit
```

Ultima comandă necesită `oap-sdk` pentru compilarea pe PC. MGU Store pregătește modulul la instalarea din ramura `main`.

## Neconfirmat pe BMW X3 G01 30e

Nu este confirmată pe un BMW X3 G01 30e compatibilitatea exactă a semnalelor de poziție/power-state, versiunea Node a unității, disponibilitatea și ABI-ul `cluster-render`, afișarea HUD, persistența după sleep/wake sau instalarea prin versiunea concretă de MGU Store a mașinii. Aplicația rămâne read-only față de semnalele vehiculului; codul de power/safety upstream nu a fost modificat.
