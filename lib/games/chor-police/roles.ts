export const ROLES = ['raja', 'mantri', 'police', 'chor'] as const;
export type Role = typeof ROLES[number];

export interface RoleInfo {
  id: Role;
  nameEn: string;
  nameBn: string;
  points: number;
  emoji: string;
  descriptionEn: string;
  descriptionBn: string;
}

export const ROLE_DETAILS: Record<Role, RoleInfo> = {
  raja: {
    id: 'raja',
    nameEn: 'Raja (King)',
    nameBn: 'রাজা',
    points: 1000,
    emoji: '👑',
    descriptionEn: 'The sovereign who commands the court. Always receives 1000 points.',
    descriptionBn: 'সর্বোচ্চ মর্যাদার অধিকারী। সর্বদা ১০০০ পয়েন্ট পান।',
  },
  mantri: {
    id: 'mantri',
    nameEn: 'Mantri (Minister)',
    nameBn: 'মন্ত্রী',
    points: 800,
    emoji: '📜',
    descriptionEn: 'The wise advisor to the King. Receives 800 points.',
    descriptionBn: 'রাজার বিজ্ঞ উপদেষ্টা। ৮০০ পয়েন্ট পান।',
  },
  police: {
    id: 'police',
    nameEn: 'Police (Officer)',
    nameBn: 'পুলিশ',
    points: 500,
    emoji: '👮',
    descriptionEn: 'Must identify the hidden Chor! Wins 500 pts if correct, 0 if wrong.',
    descriptionBn: 'লুকিয়ে থাকা চোরকে ধরতে হবে! ঠিক ধরলে ৫০০ পয়েন্ট, ভুল হলে ০।',
  },
  chor: {
    id: 'chor',
    nameEn: 'Chor (Thief)',
    nameBn: 'চোর',
    points: 0,
    emoji: '🎭',
    descriptionEn: 'Must stay undercover. Wins the 500 pts if the Police fails!',
    descriptionBn: 'নিজের পরিচয় গোপন রাখতে হবে। পুলিশ ব্যর্থ হলে ৫০০ পয়েন্ট পাবে!',
  },
};
