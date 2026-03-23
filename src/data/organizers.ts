import type { Organizer } from "./types";
import { organizerImages } from "./images";

export const organizers: Record<string, Organizer> = {
  urbanFutures: {
    id: "org-1",
    name: "Urban Futures Institute",
    logo: organizerImages.org1.url,
    description:
      "A global think tank dedicated to advancing equitable, resilient urban development through design research and public competitions.",
    website: "https://example.com/urban-futures",
    isVerified: true,
    competitionsCount: 12,
    payoutCompletionRate: 100,
  },
  studioNexus: {
    id: "org-2",
    name: "Studio Nexus Foundation",
    logo: organizerImages.org2.url,
    description:
      "Non-profit supporting emerging architects through student competitions, mentorship programs, and design grants.",
    website: "https://example.com/studio-nexus",
    isVerified: true,
    competitionsCount: 8,
    payoutCompletionRate: 100,
  },
  harbourCity: {
    id: "org-3",
    name: "Harbour City Development Authority",
    logo: organizerImages.org3.url,
    description:
      "Public agency overseeing waterfront redevelopment and civic design initiatives for the Harbour City metropolitan area.",
    website: "https://example.com/harbour-city",
    isVerified: true,
    competitionsCount: 5,
    payoutCompletionRate: 100,
  },
  greenBuildAlliance: {
    id: "org-4",
    name: "Green Build Alliance",
    description:
      "International coalition of architects, engineers, and educators working to advance climate-resilient design in underserved communities.",
    isVerified: true,
    competitionsCount: 3,
    payoutCompletionRate: 100,
  },
  meridianDev: {
    id: "org-5",
    name: "Meridian Development Group",
    description:
      "Private real estate development firm specializing in mixed-use urban projects across the Eastern Seaboard.",
    isVerified: false,
    competitionsCount: 1,
    payoutCompletionRate: 0,
  },
  archFoundation: {
    id: "org-6",
    name: "The Architecture Foundation",
    logo: organizerImages.org1.url,
    description:
      "Established in 1991, The Architecture Foundation promotes public understanding and enjoyment of contemporary architecture and urbanism.",
    website: "https://example.com/arch-foundation",
    isVerified: true,
    competitionsCount: 20,
    payoutCompletionRate: 100,
  },
  civicLab: {
    id: "org-7",
    name: "Civic Design Lab",
    description:
      "Municipal design office partnering with communities to reimagine public spaces through participatory design processes.",
    isVerified: true,
    competitionsCount: 6,
    payoutCompletionRate: 83,
  },
};
