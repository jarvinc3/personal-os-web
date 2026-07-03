const GRAVATAR_ROBOHASH_BASE = 'https://www.gravatar.com/avatar';
const AVATAR_OPTIONS_LENGTH = 24;


export const AVATAR_OPTIONS = Array.from({ length: AVATAR_OPTIONS_LENGTH }, (_, i) => ({
  id: String(i),
  url: `${GRAVATAR_ROBOHASH_BASE}/${i * 13 + 7}?s=400&d=robohash&r=x`,
}));

export type AvatarOption = (typeof AVATAR_OPTIONS)[number];
