/**
 * Canonical Aries AI Companion Avatar Resolver.
 *
 * 1:1 port of `ariesxpertv2/lib/modules/ai/utils/avatar_portrait_resolver.dart`:
 *   - Male user   -> Tanya  (`/avatars/tanya.png`)
 *   - Female user -> Rivan  (`/avatars/rivan.png`)
 *   - Unspecified -> Tanya  (`/avatars/tanya.png`)
 *
 * Gaming Arena portraits (`/images/avatar_f1.png`, `/images/avatar_m1.png`,
 * `/images/avatar_d*.png`) are strictly reserved for the Arena game lobby and
 * MUST NEVER be used as the clinical AI Companion portrait.
 */

export type CompanionAvatarId = 'tanya' | 'rivan';

export interface CompanionIdentity {
  avatarId: CompanionAvatarId;
  defaultName: 'Tanya' | 'Rivan';
  displayName: string;
  portraitUrl: string;
}

export function resolveCompanionAvatarId(userGender?: string | null): CompanionAvatarId {
  const normalized = String(userGender || '').trim().toLowerCase();
  if (normalized === 'female' || normalized === 'f' || normalized.startsWith('female')) {
    return 'rivan';
  }
  return 'tanya';
}

export function resolveCompanionIdentity(
  userGender?: string | null,
  buddyProfile?: {
    aiCustomName?: string | null;
    portraitUrl?: string | null;
    avatarUrl?: string | null;
  } | null
): CompanionIdentity {
  const avatarId = resolveCompanionAvatarId(userGender);
  const defaultName = avatarId === 'rivan' ? 'Rivan' : 'Tanya';
  const defaultPortrait = avatarId === 'rivan' ? '/avatars/rivan.png' : '/avatars/tanya.png';

  const customName = String(buddyProfile?.aiCustomName || '').trim();
  const displayName = customName || defaultName;

  // Match mobile `AvatarPortraitResolver.resolvePortraitUrl`: only accept an
  // HTTPS portrait override that belongs to the assigned character.
  const candidateUrl = String(buddyProfile?.portraitUrl || buddyProfile?.avatarUrl || '').trim();
  let portraitUrl = defaultPortrait;
  if (candidateUrl.startsWith('https://')) {
    const lower = candidateUrl.toLowerCase();
    if (
      (avatarId === 'tanya' && lower.includes('/tanya/')) ||
      (avatarId === 'rivan' && lower.includes('/rivan/'))
    ) {
      portraitUrl = candidateUrl;
    }
  }

  return {
    avatarId,
    defaultName,
    displayName,
    portraitUrl,
  };
}
