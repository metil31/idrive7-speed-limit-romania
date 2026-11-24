'use strict';
/* Romania-specific rules plus sanity checks against the generated Geofabrik pack. Node 8 compatible. */
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { LimitPack, F, SRC, merc } = require(path.join(ROOT, 'apps', 'speed_limit', 'limitpack'));
const { Matcher, limitOf } = require(path.join(ROOT, 'apps', 'speed_limit', 'matcher'));
const { DemoDrive } = require(path.join(ROOT, 'apps', 'speed_limit', 'position'));
let failed = 0;
function check(ok, text) { console.log((ok ? 'ok   ' : 'FAIL ') + text); if (!ok) failed++; }
function piece(cls, flags, f, b, src) { return { cls, flags, limF: f || 0, limB: b || 0, src: src || 0 }; }

check(limitOf(piece(6, F.URBAN), 1).limit === 50, 'Romania: 50 km/h in settlements');
check(limitOf(piece(2, 0), 1).limit === 90, 'Romania: 90 km/h outside settlements');
check(limitOf(piece(2, F.EUROPEAN), 1).limit === 100, 'Romania: 100 km/h on European roads outside settlements');
check(limitOf(piece(1, 0), 1).limit === 120, 'Romania: 120 km/h on expressways (OSM trunk)');
check(limitOf(piece(0, 0), 1).limit === 130, 'Romania: 130 km/h on motorways');
check(limitOf(piece(7, F.URBAN), 1).limit === 20, 'Romania: 20 km/h on living streets');
check(limitOf(piece(2, F.URBAN, 30, 30, SRC.NUM | (SRC.NUM << 2)), 1).limit === 30,
    'an explicit local 30 km/h limit overrides the legal default');
check(limitOf(piece(2, 0, 70, 50, SRC.NUM | (SRC.NUM << 2)), -1).limit === 50,
    'the backward-direction limit is interpreted independently');
check(limitOf(piece(0, F.LINK), 1).limit === 90, 'a motorway ramp does not inherit 130 km/h');

const file = process.argv[2] || path.join(ROOT, 'apps', 'speed_limit', 'romania.pack');
const pack = LimitPack.open(file);
check(pack.meta.region === 'Romania', 'pack metadata identifies Romania');
check(pack.count > 500000, 'pack contains Romania-scale road coverage (' + pack.count + ' pieces)');
check(pack.cameras.n > 0, 'pack contains mapped speed cameras (' + pack.cameras.n + ')');
const classes = {}, samples = {};
for (let i = 0; i < pack.count; i++) {
    const p = pack.piece(i); classes[p.cls] = (classes[p.cls] || 0) + 1;
    if (!samples[p.cls]) samples[p.cls] = p;
}
check(classes[0] > 0 && classes[1] > 0 && classes[6] > 0 && classes[7] > 0,
    'pack has motorways, expressways, residential and living-street roads');

// Two reproducible Romanian city examples from this exact pack.
function at(name, lat, lon, heading, expected) {
    const xy = merc(lat, lon), m = new Matcher(pack, { radius: 40 });
    const r = m.update({ x: xy[0], y: xy[1], heading, speed: 40 }, 1);
    check(r.state === 'match' && r.limit === expected,
        name + ': matched OSM way ' + r.way + ', ' + r.limit + ' km/h' + (r.inferred ? ' inferred' : ' tagged'));
}
at('Cluj-Napoca, Calea Moților sample', 46.7700, 23.5900, 0, 50);
at('Otopeni living-street sample', 44.5470, 26.0720, 0, 30);

const demo = new DemoDrive(pack);
function demoMatch(drive, seconds, way, limit) {
    const now = drive.t0 + seconds * 1000;
    const fix = drive.fix(now);
    if (!fix || fix.source !== 'demo') return null;
    const r = new Matcher(pack).update(fix, now);
    return r.state === 'match' && r.way === way && r.limit === limit ? r : null;
}
const outbound = demoMatch(demo, 30, 746230194, 50);
const returning = demoMatch(demo, 105, 746230194, 50);
check(outbound && returning && outbound.dir === 1 && returning.dir === -1,
    'default demo matches the Cluj-Napoca route at 50 km/h in both directions');
const custom = new DemoDrive(pack, { way: 41496744, speed: 35 });
check(custom.speedKmh(custom.t0) === 35 && demoMatch(custom, 10, 41496744, 50),
    'demo still accepts a custom way and a steady speed');
pack.close();
if (failed) { console.error('\n' + failed + ' failed'); process.exit(1); }
console.log('\nok');
