import assert from 'node:assert';
import { userRepo, projectRepo, mediaRepo, sessionRepo, orderRepo } from '../lib/db';
import { checkStorageQuota, formatBytes } from '../lib/storage';
import { verifyPassword, hashPassword } from '../lib/auth';

async function runTests() {
  console.log('--- Running Backend & Paywall Verification Tests ---');

  // Test 1: User & Password Auth
  console.log('1. Testing User & Password Hashing...');
  const testEmail = `test_${Date.now()}@example.com`;
  const hashed = await hashPassword('secret123');
  const user = userRepo.create({
    id: `test-user-${Date.now()}`,
    email: testEmail,
    password_hash: hashed,
    name: 'Test Creative',
    business_name: 'Test Studios',
    handle: `test-studio-${Date.now()}`,
    tier: 'free',
  });

  assert.strictEqual(user.tier, 'free');
  assert.strictEqual(user.storage_used, 0);

  const isPasswordValid = await verifyPassword('secret123', user.password_hash);
  assert.strictEqual(isPasswordValid, true);

  const isWrongPasswordValid = await verifyPassword('wrongpassword', user.password_hash);
  assert.strictEqual(isWrongPasswordValid, false);
  console.log('✓ User and Auth Verified');

  // Test 2: Storage Quota Enforcement
  console.log('2. Testing Storage Quota Limits...');
  // Free tier is 500MB
  const quotaUnder = checkStorageQuota(user.id, 100 * 1024 * 1024); // 100MB
  assert.strictEqual(quotaUnder.allowed, true, '100MB should be allowed in 500MB quota');

  const quotaOver = checkStorageQuota(user.id, 600 * 1024 * 1024); // 600MB
  assert.strictEqual(quotaOver.allowed, false, '600MB should be blocked on Free tier');

  // Upgrade to Tier 2 (15GB)
  userRepo.updateTier(user.id, 'tier_2');
  const upgradedUser = userRepo.findById(user.id)!;
  assert.strictEqual(upgradedUser.tier, 'tier_2');

  const quotaTier2 = checkStorageQuota(user.id, 600 * 1024 * 1024);
  assert.strictEqual(quotaTier2.allowed, true, '600MB should now be allowed on Tier 2 (15GB)');
  console.log('✓ Storage Quota and Tier Upgrades Verified');

  // Test 3: Project with Passcode & Paywall Price
  console.log('3. Testing Project Creation, Passcode & Paywall...');
  const proj = projectRepo.create({
    id: `test-proj-${Date.now()}`,
    user_id: user.id,
    title: 'Sarah & David Wedding',
    slug: `sarah-david-${Date.now()}`,
    description: 'Beautiful ceremony at Victoria Island',
    cover_media_id: null,
    passcode: '9876',
    price_ngn: 75000,
    is_paywall_active: 1,
  });

  assert.strictEqual(proj.price_ngn, 75000);
  assert.strictEqual(proj.passcode, '9876');

  // Add sample media
  const media = mediaRepo.create({
    id: `test-media-${Date.now()}`,
    project_id: proj.id,
    filename: 'test-file.jpg',
    original_name: 'ceremony-01.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 5 * 1024 * 1024, // 5MB
    width: 4000,
    height: 3000,
    sort_order: 0,
  });

  const updatedStorage = userRepo.recalculateStorage(user.id);
  assert.strictEqual(updatedStorage, 5 * 1024 * 1024);
  console.log(`✓ Media addition updated storage to ${formatBytes(updatedStorage)}`);

  // Test 4: Gallery Session & Unlocking
  console.log('4. Testing Gallery Session & Payment Unlock...');
  const sessionToken = `gs_test_${Date.now()}`;
  sessionRepo.save({
    token: sessionToken,
    project_id: proj.id,
    client_email: 'sarah@example.com',
    passcode_verified: 1,
    unlocked_downloads: 0, // Unpaid yet
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  });

  let session = sessionRepo.find(sessionToken)!;
  assert.strictEqual(session.passcode_verified, 1);
  assert.strictEqual(session.unlocked_downloads, 0);

  // Client pays ₦75,000 via Paystack
  const order = orderRepo.create({
    id: `order-test-${Date.now()}`,
    project_id: proj.id,
    client_email: 'sarah@example.com',
    client_name: 'Sarah',
    amount_ngn: 75000,
    paystack_reference: `REF_${Date.now()}`,
    status: 'pending',
    unlocked_at: null,
  });

  assert.strictEqual(orderRepo.hasCompletedOrder(proj.id, 'sarah@example.com'), false);

  // Mark success
  orderRepo.markSuccess(order.paystack_reference);
  assert.strictEqual(orderRepo.hasCompletedOrder(proj.id, 'sarah@example.com'), true);

  // Unlock session
  session.unlocked_downloads = 1;
  sessionRepo.save(session);

  const refreshedSession = sessionRepo.find(sessionToken)!;
  assert.strictEqual(refreshedSession.unlocked_downloads, 1);
  console.log('✓ Payment confirmation and Download Unlocking Verified');

  console.log('\nAll 4 Core Backend & Paywall Tests Passed Successfully! 🎉');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
