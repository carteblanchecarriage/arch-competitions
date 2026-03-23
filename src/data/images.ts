/**
 * Unsplash image URLs for mock competition data.
 *
 * All images are served via Unsplash's image CDN with size parameters.
 * Unsplash License: https://unsplash.com/license (free for commercial use)
 *
 * Format: https://images.unsplash.com/photo-{ID}?w={width}&h={height}&fit=crop&q=80
 *
 * IMPORTANT: In production, download and self-host images.
 * These URLs are for development/mockup use only.
 */

// Helper to build Unsplash URLs with consistent params
function unsplash(photoId: string, w = 1200, h = 800) {
  return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&q=80`;
}

function unsplashThumb(photoId: string) {
  return unsplash(photoId, 600, 400);
}

function unsplashAvatar(photoId: string) {
  return unsplash(photoId, 200, 200);
}

// ============================================================
// Competition Hero & Thumbnail Images
// ============================================================

export const competitionImages = {
  // 1. "Reimagining Public Housing" — global ideas competition
  publicHousing: {
    hero: unsplash("photo-1545093149-618ce3bcf49d"), // Modern residential architecture, Annie Spratt
    thumbnail: unsplashThumb("photo-1545093149-618ce3bcf49d"),
    photographer: "Annie Spratt",
    unsplashUrl: "https://unsplash.com/photos/BWZd1xT4QEM",
  },

  // 2. "Campus Micro-Library" — student competition
  microLibrary: {
    hero: unsplash("photo-1521587760476-6c12a4b040da"), // Modern library interior, Susan Yin
    thumbnail: unsplashThumb("photo-1521587760476-6c12a4b040da"),
    photographer: "Susan Yin",
    unsplashUrl: "https://unsplash.com/photos/2JIvboGLeho",
  },

  // 3. "Urban Waterfront Pavilion" — last call, closing soon
  waterfrontPavilion: {
    hero: unsplash("photo-1506744038136-46273834b3fb"), // Oslo Opera House waterfront, Hans-Joachim Kaiser
    thumbnail: unsplashThumb("photo-1506744038136-46273834b3fb"),
    photographer: "Hans-Joachim Kaiser",
    unsplashUrl: "https://unsplash.com/photos/j3z_ve53Tyw",
  },

  // 4. "Memorial Park Design" — completed with results
  memorialPark: {
    hero: unsplash("photo-1476842634003-7dcca8f832de"), // Lush green park landscape
    thumbnail: unsplashThumb("photo-1476842634003-7dcca8f832de"),
    photographer: "Todd Quackenbush",
    unsplashUrl: "https://unsplash.com/photos/x5SRhkFajrA",
  },

  // 5. "Community Center" — in construction
  communityCenter: {
    hero: unsplash("photo-1486325212027-8081e485255e"), // Modern community building
    thumbnail: unsplashThumb("photo-1486325212027-8081e485255e"),
    photographer: "Liam Truong",
    unsplashUrl: "https://unsplash.com/photos/qORHuvtgybw",
  },

  // 6. "Floating Classroom" — built and occupied
  floatingClassroom: {
    hero: unsplash("photo-1518005020951-eccb494ad742"), // Modern white building on water
    thumbnail: unsplashThumb("photo-1518005020951-eccb494ad742"),
    photographer: "Daniel Sinoca",
    unsplashUrl: "https://unsplash.com/photos/mSatS58_WyA",
  },

  // 7. "Mixed-Use Development" — invite-only / private
  mixedUse: {
    hero: unsplash("photo-1486406146926-c627a92ad1ab"), // Modern glass high-rise
    thumbnail: unsplashThumb("photo-1486406146926-c627a92ad1ab"),
    photographer: "Sean Pollock",
    unsplashUrl: "https://unsplash.com/photos/PhYq704ffdA",
  },

  // 8. "Emerging Architect of the Year" — awards type
  emergingArchitect: {
    hero: unsplash("photo-1487958449943-2429e8be8625"), // Dramatic modern architecture
    thumbnail: unsplashThumb("photo-1487958449943-2429e8be8625"),
    photographer: "Joel Filipe",
    unsplashUrl: "https://unsplash.com/photos/VvpN157u7ks",
  },

  // 9. "Climate-Resilient School" — open pool with contributions
  climateSchool: {
    hero: unsplash("photo-1577495508326-19a1b3cf65b7"), // Green sustainable building with plants
    thumbnail: unsplashThumb("photo-1577495508326-19a1b3cf65b7"),
    photographer: "Victor Garcia",
    unsplashUrl: "https://unsplash.com/photos/nQfuSRDOyn0",
  },

  // 10. "Civic Plaza Redesign" — shelved
  civicPlaza: {
    hero: unsplash("photo-1449824913935-59a10b8d2000"), // Urban cityscape with public space
    thumbnail: unsplashThumb("photo-1449824913935-59a10b8d2000"),
    photographer: "Anders Jildén",
    unsplashUrl: "https://unsplash.com/photos/Sc5RKXLBjGg",
  },
} as const;

// ============================================================
// Jury Member Avatars
// ============================================================

export const juryAvatars = {
  // Professional headshot-style photos
  person1: {
    url: unsplashAvatar("photo-1507003211169-0a1dd7228f2d"),
    photographer: "Joseph Gonzalez",
  },
  person2: {
    url: unsplashAvatar("photo-1494790108377-be9c29b29330"),
    photographer: "Michael Dam",
  },
  person3: {
    url: unsplashAvatar("photo-1438761681033-6461ffad8d80"),
    photographer: "Christopher Campbell",
  },
  person4: {
    url: unsplashAvatar("photo-1472099645785-5658abf4ff4e"),
    photographer: "Foto Sushi",
  },
  person5: {
    url: unsplashAvatar("photo-1580489944761-15a19d654956"),
    photographer: "Christina Morillo",
  },
  person6: {
    url: unsplashAvatar("photo-1573496359142-b8d87734a5a2"),
    photographer: "Christina Morillo",
  },
  person7: {
    url: unsplashAvatar("photo-1560250097-0b93528c311a"),
    photographer: "Hunters Race",
  },
  person8: {
    url: unsplashAvatar("photo-1534528741775-53994a69daeb"),
    photographer: "Aiony Haust",
  },
} as const;

// ============================================================
// Winner Entry Images (for results pages)
// ============================================================

export const winnerImages = {
  // Architectural renders / concept images
  render1: {
    url: unsplash("photo-1518780664697-55e3ad937233"), // Modern house concept
    photographer: "Frames For Your Heart",
  },
  render2: {
    url: unsplash("photo-1600585154340-be6161a56a0c"), // Modern building exterior
    photographer: "R Architecture",
  },
  render3: {
    url: unsplash("photo-1600607687939-ce8a6c25118c"), // Minimal modern architecture
    photographer: "R Architecture",
  },
  render4: {
    url: unsplash("photo-1600566753190-17f0baa2a6c3"), // Contemporary design
    photographer: "R Architecture",
  },
  render5: {
    url: unsplash("photo-1600573472550-8090b5e0745e"), // Modern interior/exterior
    photographer: "R Architecture",
  },
} as const;

// ============================================================
// Organizer Logos (placeholder abstract images)
// ============================================================

export const organizerImages = {
  org1: {
    url: unsplashAvatar("photo-1557804506-669a67965ba0"), // Abstract office/corporate
    photographer: "Austin Distel",
  },
  org2: {
    url: unsplashAvatar("photo-1497366216548-37526070297c"), // Modern office space
    photographer: "Alex Kotliarskyi",
  },
  org3: {
    url: unsplashAvatar("photo-1497215842964-222b430dc094"), // Clean workspace
    photographer: "Shridhar Gupta",
  },
} as const;

// ============================================================
// Utility: All competition images as an array for easy iteration
// ============================================================

export const allCompetitionImages = Object.values(competitionImages);
