import sharp from 'sharp';

const BASE = 'http://localhost:3000';

// A noisy 600x600 source. Blurring collapses its file size, which is what the
// locked-frame assertions below measure.
const noise = Buffer.alloc(600 * 600 * 3);
for (let i = 0; i < noise.length; i++) noise[i] = Math.floor(Math.random() * 256);
const PNG = await sharp(noise, { raw: { width: 600, height: 600, channels: 3 } })
  .png()
  .toBuffer();

function jar() {
  const cookies = new Map();
  return {
    header: () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    absorb: (res) => {
      for (const c of res.headers.getSetCookie?.() ?? []) {
        const [pair] = c.split(';');
        const i = pair.indexOf('=');
        cookies.set(pair.slice(0, i), pair.slice(i + 1));
      }
    },
  };
}

async function call(j, path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { ...(opts.headers || {}), Cookie: j.header() },
  });
  j.absorb(res);
  return res;
}

async function frameBytes(j, filename) {
  const res = await call(j, `/api/media/${filename}`);
  return {
    status: res.status,
    type: res.headers.get('content-type'),
    bytes: (await res.arrayBuffer()).byteLength,
  };
}

const ok = [];
const fail = [];
const check = (name, cond, extra = '') =>
  (cond ? ok : fail).push(`${name}${extra ? ' — ' + extra : ''}`);

const studio = jar();
const email = `studio.${Date.now()}@example.com`;

// 1. Register
let res = await call(studio, '/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Photographer',
    business_name: 'Test Studio',
    email,
    password: 'testpass123',
    tier: 'free',
  }),
});
let registered = await res.json();
check('register', res.ok, String(res.status));
const studioHandle = registered.user?.handle;
check('studio handle minted', !!studioHandle && /^[a-z0-9-]+$/.test(studioHandle), String(studioHandle));

// 2. Create a passcoded, paywalled gallery
res = await call(studio, '/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'E2E Session',
    custom_slug: `e2e-${Date.now()}`,
    passcode: '4821',
    price_ngn: 25000,
    description: 'End to end check',
  }),
});
let data = await res.json();
check('create gallery', res.ok, JSON.stringify(data).slice(0, 100));
const project = data.project;
const galleryApi = `/api/studios/${studioHandle}/gallery/${project.slug}`;

// 3. Upload a frame
const fd = new FormData();
fd.append('files', new Blob([PNG], { type: 'image/png' }), 'frame-01.png');
res = await call(studio, `/api/projects/${project.id}/upload`, { method: 'POST', body: fd });
data = await res.json();
check('upload', res.ok && data.uploadedCount === 1, JSON.stringify(data).slice(0, 100));
const filename = data.media[0].filename;

// 4. A client hits the passcode gate
const client = jar();
res = await call(client, galleryApi);
data = await res.json();
check('passcode gate', data.requiresPasscode === true && data.accessLevel === 'passcode');

// 4b. Frames behind the gate render blurred, never as the original file
const behindGate = await frameBytes(client, filename);
check(
  'passcode-gated frame is blurred',
  behindGate.status === 200 && behindGate.type === 'image/jpeg' && behindGate.bytes < PNG.length / 4,
  `${behindGate.bytes} bytes vs original ${PNG.length}`
);

// 4c. An anonymous visitor cannot reach the original either
const anonymous = await frameBytes(jar(), filename);
check(
  'anonymous request cannot reach the original',
  anonymous.status === 200 && anonymous.bytes < PNG.length / 4,
  `${anonymous.bytes} bytes`
);

// 5. Wrong passcode rejected
res = await call(client, `${galleryApi}/verify-passcode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passcode: '0000' }),
});
check('wrong passcode rejected', !res.ok, String(res.status));

// 6. Correct passcode opens the gallery
res = await call(client, `${galleryApi}/verify-passcode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passcode: '4821' }),
});
check('passcode accepted', res.ok, String(res.status));

res = await call(client, galleryApi);
data = await res.json();
check('gallery visible', data.media?.length === 1 && data.accessLevel === 'unpaid');
check('paystack flag exposed', data.paystackConfigured === false, `got ${data.paystackConfigured}`);

// 6b. Passcode cleared but unpaid: frames are still blurred
const whileUnpaid = await frameBytes(client, filename);
check(
  'unpaid frame is still blurred',
  whileUnpaid.status === 200 && whileUnpaid.bytes < PNG.length / 4,
  `${whileUnpaid.bytes} bytes`
);

// 7. Download blocked before payment
res = await call(client, `${galleryApi}/download?all=true`);
check('download blocked while unpaid', res.status === 403, String(res.status));

// 8. Pay (test mode)
res = await call(client, '/api/payments/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: project.id,
    clientEmail: 'client@example.com',
    clientName: 'Test Client',
  }),
});
data = await res.json();
check('initialize payment', res.ok && data.testMode === true, JSON.stringify(data).slice(0, 100));
const reference = data.reference;

res = await call(client, '/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reference, projectId: project.id }),
});
data = await res.json();
check('verify payment', res.ok && data.unlocked === true, JSON.stringify(data).slice(0, 100));

// 9. ZIP download now works
res = await call(client, `${galleryApi}/download?all=true`);
const buf = Buffer.from(await res.arrayBuffer());
check(
  'zip download',
  res.status === 200 && buf.length > 0,
  `${res.status}, ${buf.length} bytes, ${res.headers.get('content-type')}`
);

// 9b. Paying brings the frame into focus
const afterPaying = await frameBytes(client, filename);
check(
  'paid frame renders readable',
  afterPaying.status === 200 && afterPaying.bytes > whileUnpaid.bytes * 3,
  `${afterPaying.bytes} bytes vs locked ${whileUnpaid.bytes}`
);

// 9c. The public page lives at /<studio>/gallery/<slug>, and the old link redirects
res = await fetch(`${BASE}/${studioHandle}/gallery/${project.slug}`);
check('studio gallery page serves', res.ok, String(res.status));

res = await fetch(`${BASE}/gallery/${project.slug}`, { redirect: 'manual' });
check(
  'legacy /gallery link redirects',
  [301, 302, 303, 307, 308].includes(res.status) &&
    (res.headers.get('location') || '').includes(`/${studioHandle}/gallery/${project.slug}`),
  `${res.status} → ${res.headers.get('location')}`
);

// 10. The order reaches the studio ledger
res = await call(studio, '/api/orders');
data = await res.json();
check(
  'order recorded',
  data.orders?.some((o) => o.paystack_reference === reference && o.status === 'success')
);

console.log('PASS:');
ok.forEach((l) => console.log('  ✓ ' + l));
if (fail.length) {
  console.log('FAIL:');
  fail.forEach((l) => console.log('  ✗ ' + l));
  process.exit(1);
}
