const BASE = 'http://localhost:3000';

// Minimal valid 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

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

const ok = [];
const fail = [];
const check = (name, cond, extra = '') => (cond ? ok : fail).push(`${name}${extra ? ' — ' + extra : ''}`);

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
check('register', res.ok, String(res.status));

// 2. Create gallery
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
check('create gallery', res.ok, JSON.stringify(data).slice(0, 120));
const project = data.project;

// 3. Upload a file
const fd = new FormData();
fd.append('files', new Blob([PNG], { type: 'image/png' }), 'frame-01.png');
res = await call(studio, `/api/projects/${project.id}/upload`, { method: 'POST', body: fd });
data = await res.json();
check('upload', res.ok && data.uploadedCount === 1, JSON.stringify(data).slice(0, 120));

// 4. Client sees the passcode gate
const client = jar();
res = await call(client, `/api/gallery/${project.slug}`);
data = await res.json();
check('passcode gate', data.requiresPasscode === true);

// 5. Wrong passcode rejected
res = await call(client, `/api/gallery/${project.slug}/verify-passcode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passcode: '0000' }),
});
check('wrong passcode rejected', !res.ok, String(res.status));

// 6. Correct passcode opens it
res = await call(client, `/api/gallery/${project.slug}/verify-passcode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passcode: '4821' }),
});
check('passcode accepted', res.ok, String(res.status));

res = await call(client, `/api/gallery/${project.slug}`);
data = await res.json();
check('gallery visible', data.media?.length === 1 && data.isUnlocked === false);
check('paystack flag exposed', data.paystackConfigured === false, `got ${data.paystackConfigured}`);

// 7. Download blocked before payment
res = await call(client, `/api/gallery/${project.slug}/download?all=true`);
check('download blocked while unpaid', res.status === 403, String(res.status));

// 8. Pay (test mode)
res = await call(client, '/api/payments/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: project.id, clientEmail: 'client@example.com', clientName: 'Test Client' }),
});
data = await res.json();
check('initialize payment', res.ok && data.testMode === true, JSON.stringify(data).slice(0, 120));
const reference = data.reference;

res = await call(client, '/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reference, projectId: project.id }),
});
data = await res.json();
check('verify payment', res.ok && data.unlocked === true, JSON.stringify(data).slice(0, 120));

// 9. ZIP download now works
res = await call(client, `/api/gallery/${project.slug}/download?all=true`);
const buf = Buffer.from(await res.arrayBuffer());
check('zip download', res.status === 200 && buf.length > 0, `${res.status}, ${buf.length} bytes, ${res.headers.get('content-type')}`);

// 10. Order shows in the studio
res = await call(studio, '/api/orders');
data = await res.json();
check('order recorded', data.orders?.some((o) => o.paystack_reference === reference && o.status === 'success'));

console.log('PASS:');
ok.forEach((l) => console.log('  ✓ ' + l));
if (fail.length) {
  console.log('FAIL:');
  fail.forEach((l) => console.log('  ✗ ' + l));
  process.exit(1);
}
