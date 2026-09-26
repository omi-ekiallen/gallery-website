import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSessionUser } from '@/lib/auth';
import { projectRepo } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = projectRepo.listByUserId(user.id);
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, passcode, price_ngn, custom_slug } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

    let baseSlug = custom_slug && custom_slug.trim() ? slugify(custom_slug) : slugify(title);
    if (!baseSlug) {
      baseSlug = `project-${Date.now()}`;
    }

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (projectRepo.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const projectId = crypto.randomUUID();
    const project = projectRepo.create({
      id: projectId,
      user_id: user.id,
      title: title.trim(),
      slug,
      description: description ? description.trim() : '',
      cover_media_id: null,
      passcode: passcode && passcode.trim() ? passcode.trim() : null,
      price_ngn: typeof price_ngn === 'number' ? Math.max(0, price_ngn) : (parseInt(price_ngn) || 0),
      is_paywall_active: 1,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}
