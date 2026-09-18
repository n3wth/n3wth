import type { D1Database } from '../db/d1'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  github_url: string | null
  twitter_url: string | null
  website_url: string | null
  reputation: number
  streak: number
  role: 'user' | 'maker' | 'admin'
  created_at: string
  updated_at: string
}

export type ProfilePatch = Pick<Profile, 'display_name' | 'avatar_url' | 'bio' | 'github_url' | 'twitter_url' | 'website_url' | 'username'>

export async function getProfile(db: D1Database, userId: string): Promise<Profile | null> {
  return db.prepare(`
    SELECT id, username, display_name, avatar_url, bio, github_url, twitter_url,
      website_url, reputation, streak, role, created_at, updated_at
    FROM profiles WHERE id = ?
  `).bind(userId).first<Profile>()
}

export async function createProfile(
  db: D1Database,
  profile: Pick<Profile, 'id' | 'username'> & Partial<Omit<Profile, 'id' | 'username'>>,
): Promise<Profile> {
  const timestamp = profile.created_at ?? new Date().toISOString()
  await db.prepare(`
    INSERT INTO profiles (
      id, username, display_name, avatar_url, bio, github_url, twitter_url,
      website_url, reputation, streak, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    profile.id,
    profile.username,
    profile.display_name ?? null,
    profile.avatar_url ?? null,
    profile.bio ?? null,
    profile.github_url ?? null,
    profile.twitter_url ?? null,
    profile.website_url ?? null,
    profile.reputation ?? 0,
    profile.streak ?? 0,
    profile.role ?? 'user',
    timestamp,
    profile.updated_at ?? timestamp,
  ).run()

  const created = await getProfile(db, profile.id)
  if (!created) throw new Error('Profile was not created')
  return created
}

export async function updateProfile(
  db: D1Database,
  userId: string,
  patch: ProfilePatch,
): Promise<Profile | null> {
  await db.prepare(`
    UPDATE profiles SET username = ?, display_name = ?, avatar_url = ?, bio = ?,
      github_url = ?, twitter_url = ?, website_url = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    patch.username,
    patch.display_name,
    patch.avatar_url,
    patch.bio,
    patch.github_url,
    patch.twitter_url,
    patch.website_url,
    new Date().toISOString(),
    userId,
  ).run()
  return getProfile(db, userId)
}
