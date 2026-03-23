import type { Competition } from "./types";
import { competitionImages, juryAvatars, winnerImages } from "./images";
import { organizers } from "./organizers";

export const competitions: Competition[] = [
  // 1. Open, large prize, global ideas competition
  {
    id: "comp-1",
    slug: "reimagining-public-housing",
    title: "Reimagining Public Housing",
    shortDescription:
      "Envision the next generation of public housing that prioritizes community, dignity, and sustainability for aging populations worldwide.",
    brief: `Public housing is at a crossroads. Aging infrastructure, changing demographics, and climate pressures demand a fundamental rethink of how we house our most vulnerable populations.

This competition asks designers to reimagine public housing — not as a last resort, but as a model for dignified, community-centered living. Proposals should address the needs of aging populations while creating spaces that foster intergenerational connection.

We're looking for bold ideas that challenge assumptions about density, shared space, accessibility, and the relationship between public housing and its surrounding neighborhood. Proposals need not be tied to a specific site — we want transferable concepts that could be adapted globally.`,
    designObjectives: [
      "Create adaptable housing typologies for aging populations",
      "Foster intergenerational community interaction",
      "Achieve net-zero energy performance",
      "Integrate with surrounding neighborhood fabric",
      "Prioritize universal accessibility beyond code minimums",
    ],
    siteContext:
      "Conceptual — proposals should be adaptable to various urban contexts worldwide.",
    background:
      "Launched by the Urban Futures Institute in partnership with 12 municipal housing authorities across 8 countries, this competition aims to build a global library of housing ideas that any city can adapt.",
    type: "ideas",
    status: "open",
    eligibility: "open_to_all",
    tags: ["housing", "sustainability", "public-space", "civic"],
    location: "Global",
    region: "Global",
    language: "English",
    heroImage: competitionImages.publicHousing.hero,
    thumbnailImage: competitionImages.publicHousing.thumbnail,
    registrationDeadline: "2026-09-01",
    submissionDeadline: "2026-10-15",
    judgingStart: "2026-10-20",
    judgingEnd: "2026-12-01",
    announcementDate: "2026-12-15",
    prizePool: {
      totalAmount: 50000,
      currency: "USD",
      breakdown: [
        { place: "1st Place", amount: 25000 },
        { place: "2nd Place", amount: 15000 },
        { place: "3rd Place", amount: 5000 },
        { place: "Honorable Mention (x5)", amount: 1000 },
      ],
      isOpenPool: true,
      contributorCount: 34,
      platformFeePercent: 5,
      netToWinners: 47500,
      fundingStatus: "funded",
    },
    organizer: organizers.urbanFutures,
    jury: [
      {
        name: "Dr. Amara Osei",
        title: "Professor of Urban Design",
        organization: "Linden Institute of Technology",
        photo: juryAvatars.person2.url,
        bio: "Leading researcher in social housing policy and participatory design with 20+ years of practice across West Africa and Europe.",
      },
      {
        name: "Kenji Tanaka",
        title: "Principal Architect",
        organization: "Tanaka + Associates",
        photo: juryAvatars.person1.url,
        bio: "Award-winning architect known for his innovative approaches to high-density residential design in Tokyo and Singapore.",
      },
      {
        name: "Maria Chen",
        title: "Director of Housing Innovation",
        organization: "City of Vancouver",
        photo: juryAvatars.person5.url,
        bio: "Municipal leader who has overseen the development of over 5,000 units of affordable housing using design competition outcomes.",
      },
      {
        name: "Kofi Mensah",
        title: "Founder & Principal",
        organization: "Mensah Studio",
        photo: juryAvatars.person4.url,
        bio: "Internationally acclaimed architect whose work spans civic buildings, housing, and cultural institutions across three continents.",
      },
    ],
    evaluationCriteria: [
      { name: "Design Innovation", weight: 30, description: "Originality of the housing typology and spatial concepts" },
      { name: "Community Impact", weight: 25, description: "How well the design fosters social connection and dignity" },
      { name: "Sustainability", weight: 20, description: "Environmental performance and climate resilience" },
      { name: "Adaptability", weight: 15, description: "How easily the concept transfers to different contexts" },
      { name: "Feasibility", weight: 10, description: "Realistic construction and maintenance considerations" },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", maxSize: "50MB", dimensions: "A1 landscape (2×)", description: "Two A1 boards showing concept, plans, sections, and key details" },
      { type: "Written Statement", format: "PDF", maxSize: "5MB", description: "500-word design statement explaining the concept and its adaptability" },
    ],
    ipTerms: {
      type: "retain_all",
      summary: "Designers retain all rights to their submissions. The organizer may display entries for competition exhibition purposes only.",
      fullText: "All intellectual property rights remain with the submitting designer(s). The Urban Futures Institute is granted a non-exclusive, non-transferable license to display submissions in competition-related exhibitions, publications, and the competition website for a period of 2 years.",
      appliesToAllEntries: false,
      isDefault: true,
      warningLevel: "none",
    },
    createdAt: "2026-02-01",
  },

  // 2. Student competition
  {
    id: "comp-2",
    slug: "campus-micro-library",
    title: "Campus Micro-Library",
    shortDescription:
      "Design a 50m² micro-library for a university campus that reimagines how students discover, share, and engage with books and knowledge.",
    brief: `The traditional university library is evolving. Students access most resources digitally, yet they crave physical spaces for focused study, serendipitous discovery, and community gathering.

This competition challenges architecture students to design a 50m² micro-library — a small, purpose-built structure that complements the main library by bringing books and reading spaces into unexpected corners of campus.

The micro-library should be a beacon: visible, inviting, and unmistakably a place of knowledge. It should hold approximately 2,000 physical volumes, provide seating for 8-12 people, and operate on an honor system (no checkout desk).`,
    designObjectives: [
      "Create an iconic yet intimate reading space in 50m²",
      "Design for natural ventilation and daylighting",
      "Accommodate 2,000 volumes and 8-12 seated readers",
      "Use sustainable, locally-sourced materials where possible",
      "Enable prefabrication for potential replication across campuses",
    ],
    siteContext:
      "A grassy quadrangle at a mid-sized North American university. The site is flat, surrounded by mature trees, and adjacent to a main pedestrian pathway.",
    background:
      "Part of the Studio Nexus Foundation's annual student competition series, now in its 6th year. Previous winning designs have been built on three campuses.",
    type: "student",
    status: "open",
    eligibility: "students_only",
    tags: ["education", "cultural", "sustainability"],
    location: "North America",
    region: "North America",
    language: "English",
    heroImage: competitionImages.microLibrary.hero,
    thumbnailImage: competitionImages.microLibrary.thumbnail,
    registrationDeadline: "2026-04-15",
    submissionDeadline: "2026-04-25",
    judgingStart: "2026-04-28",
    judgingEnd: "2026-05-15",
    announcementDate: "2026-05-20",
    prizePool: {
      totalAmount: 2000,
      currency: "USD",
      breakdown: [
        { place: "1st Place", amount: 1000 },
        { place: "2nd Place", amount: 500 },
        { place: "3rd Place", amount: 300 },
        { place: "Honorable Mention (x2)", amount: 100 },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 1900,
      fundingStatus: "funded",
    },
    organizer: organizers.studioNexus,
    jury: [
      {
        name: "Prof. Sarah Williams",
        title: "Chair of Architecture",
        organization: "Harwood University",
        photo: juryAvatars.person3.url,
        bio: "Educator and practitioner focused on small-scale public architecture and community-engaged design.",
      },
      {
        name: "Daniel Reyes",
        title: "Design Director",
        organization: "Nordvik Design",
        photo: juryAvatars.person7.url,
        bio: "Led the design of multiple award-winning library projects across Scandinavia and North America.",
      },
      {
        name: "Yuki Nakamura",
        title: "Founder",
        organization: "Atelier Yuki",
        photo: juryAvatars.person8.url,
        bio: "Known for poetic small-scale timber structures that blur boundaries between architecture and furniture.",
      },
    ],
    evaluationCriteria: [
      { name: "Spatial Quality", weight: 35, description: "Quality of the reading experience and atmosphere" },
      { name: "Design Clarity", weight: 25, description: "Clear architectural concept and coherent resolution" },
      { name: "Material Strategy", weight: 20, description: "Thoughtful, sustainable material choices" },
      { name: "Buildability", weight: 20, description: "Realistic construction approach and prefab potential" },
    ],
    deliverables: [
      { type: "Presentation Board", format: "PDF", maxSize: "30MB", dimensions: "A1 portrait (1×)" },
      { type: "Floor Plan", format: "PDF", maxSize: "10MB", dimensions: "1:50 scale" },
      { type: "Physical Model Photos", format: "JPEG", maxSize: "20MB", description: "3-5 photos of a physical study model" },
    ],
    ipTerms: {
      type: "retain_all",
      summary: "Students retain all rights. Winning designs may be considered for real construction with a separate commission agreement.",
      fullText: "All intellectual property rights remain with the submitting student(s). If a winning design is selected for construction, a separate design services agreement will be negotiated with fair compensation.",
      appliesToAllEntries: false,
      isDefault: true,
      warningLevel: "none",
    },
    createdAt: "2026-01-15",
  },

  // 3. Last call — closing soon
  {
    id: "comp-3",
    slug: "urban-waterfront-pavilion",
    title: "Urban Waterfront Pavilion",
    shortDescription:
      "Design a year-round public pavilion for Harbour City's revitalized waterfront — a gathering place that celebrates the relationship between city and sea.",
    brief: `Harbour City is transforming its industrial waterfront into a vibrant public destination. The centerpiece will be a 200m² public pavilion that serves as a flexible gathering space, event venue, and architectural landmark.

The pavilion must work year-round in a maritime climate, sheltering visitors from rain and wind while remaining open and inviting. It should accommodate community events (up to 150 standing), a small café kiosk, and public restrooms.

This is a real project — the winning design will be built. The selected architect will receive the prize plus a design commission for construction documents.`,
    designObjectives: [
      "Create a landmark structure visible from water and land approaches",
      "Design for maritime climate: wind, rain, salt spray, and direct sun",
      "Accommodate 150 people for events while feeling intimate for daily use",
      "Include café kiosk (15m²) and public restrooms (25m²)",
      "Achieve LEED Gold or equivalent sustainability standard",
    ],
    siteContext:
      "A concrete pier extending 40m into the harbour, 12m wide. The site faces north toward open water with the city skyline behind. Strong prevailing winds from the northwest.",
    background:
      "Part of a $200M waterfront redevelopment. The pavilion is the first public building in the new district and will set the architectural tone for future development.",
    type: "open",
    status: "open",
    eligibility: "licensed_professionals",
    tags: ["public-space", "pavilion", "civic", "landscape"],
    location: "Harbour City, Norway",
    region: "Europe",
    language: "English",
    heroImage: competitionImages.waterfrontPavilion.hero,
    thumbnailImage: competitionImages.waterfrontPavilion.thumbnail,
    registrationDeadline: "2026-03-24",
    submissionDeadline: "2026-03-27",
    judgingStart: "2026-04-01",
    judgingEnd: "2026-05-01",
    announcementDate: "2026-05-15",
    prizePool: {
      totalAmount: 15000,
      currency: "USD",
      breakdown: [
        { place: "1st Place + Commission", amount: 10000 },
        { place: "2nd Place", amount: 3000 },
        { place: "3rd Place", amount: 2000 },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 14250,
      fundingStatus: "funded",
    },
    organizer: organizers.harbourCity,
    jury: [
      {
        name: "Ingrid Solberg",
        title: "City Architect",
        organization: "Harbour City Municipality",
        photo: juryAvatars.person6.url,
        bio: "Overseeing the architectural vision for the city's largest waterfront transformation in 50 years.",
      },
      {
        name: "Renzo Maffei",
        title: "Partner",
        organization: "Maffei & Partners",
        photo: juryAvatars.person4.url,
        bio: "Specialist in waterfront architecture with completed projects in 14 countries.",
      },
      {
        name: "Lina Bergström",
        title: "Principal",
        organization: "Studio Bergström",
        photo: juryAvatars.person2.url,
        bio: "Internationally recognized architect known for sustainable, climate-responsive public buildings.",
      },
    ],
    evaluationCriteria: [
      { name: "Architectural Excellence", weight: 30 },
      { name: "Climate Response", weight: 25 },
      { name: "Public Space Quality", weight: 20 },
      { name: "Structural Feasibility", weight: 15 },
      { name: "Sustainability", weight: 10 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", maxSize: "50MB", dimensions: "A1 landscape (3×)" },
      { type: "Site Plan", format: "PDF", dimensions: "1:200 scale" },
      { type: "Structural Concept", format: "PDF", description: "Diagram showing primary structural system" },
    ],
    ipTerms: {
      type: "winning_license",
      summary: "Only the winning entry grants the organizer rights for construction. All other entries remain fully owned by their designers.",
      fullText: "The winning designer grants the Harbour City Development Authority a license to construct the design, subject to a separate design services agreement. All non-winning entries: designers retain full rights.",
      appliesToAllEntries: false,
      isDefault: false,
      warningLevel: "info",
    },
    createdAt: "2026-01-01",
  },

  // 4. Completed with results
  {
    id: "comp-4",
    slug: "memorial-park-design",
    title: "Memorial Park Design",
    shortDescription:
      "A landscape architecture competition to design a 2-hectare memorial park honoring the city's immigrant heritage and cultural diversity.",
    brief: `The city seeks a design for a new 2-hectare memorial park on the site of the former immigration processing center. The park should honor the generations of immigrants who passed through this place while creating a vibrant, forward-looking public space for today's diverse community.

The design should balance contemplation and celebration — a place for quiet reflection and community gathering, for remembering the past and welcoming the future.`,
    designObjectives: [
      "Create a powerful memorial experience without being somber",
      "Design inclusive gathering spaces for cultural events and festivals",
      "Integrate native plantings and stormwater management",
      "Connect to the surrounding neighborhood's pedestrian network",
      "Include an interpretive element that tells immigration stories",
    ],
    siteContext: "A 2-hectare waterfront site in a diverse urban neighborhood. Former immigration processing center — some foundation walls remain and must be preserved.",
    background: "Funded by a combination of municipal bonds and private donations. The park has been a community priority for over a decade.",
    type: "open",
    status: "announced",
    eligibility: "open_to_all",
    tags: ["memorial", "landscape", "public-space", "civic"],
    location: "Portland, OR, USA",
    region: "North America",
    language: "English",
    heroImage: competitionImages.memorialPark.hero,
    thumbnailImage: competitionImages.memorialPark.thumbnail,
    registrationDeadline: "2025-08-01",
    submissionDeadline: "2025-09-15",
    judgingStart: "2025-09-20",
    judgingEnd: "2025-11-01",
    announcementDate: "2025-11-15",
    prizePool: {
      totalAmount: 25000,
      currency: "USD",
      breakdown: [
        { place: "1st Place", amount: 15000, recipientName: "Lena Park & Associates" },
        { place: "2nd Place", amount: 7000, recipientName: "Terrafirma Studio" },
        { place: "3rd Place", amount: 3000, recipientName: "Root Collective" },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 23750,
      fundingStatus: "paid_out",
      paidOutDate: "2025-11-20",
    },
    organizer: organizers.civicLab,
    jury: [
      {
        name: "Henrik Larsen",
        title: "Founder & Director",
        organization: "Larsen Field Studio",
        photo: juryAvatars.person1.url,
        bio: "Landscape architect known for transformative public space projects across three continents.",
      },
      {
        name: "Sora Nakamura",
        title: "Artist & Designer",
        organization: "Nakamura Studio",
        photo: juryAvatars.person5.url,
        bio: "Acclaimed environmental artist and designer of internationally recognized memorial landscapes.",
      },
      {
        name: "Carlos Ferreira",
        title: "Landscape Director",
        organization: "Ferreira Landscape",
        photo: juryAvatars.person7.url,
        bio: "Known for bold, culturally-rooted landscape design across Latin America and the Caribbean.",
      },
    ],
    evaluationCriteria: [
      { name: "Memorial Experience", weight: 30 },
      { name: "Landscape Design", weight: 25 },
      { name: "Community Space Quality", weight: 20 },
      { name: "Ecological Performance", weight: 15 },
      { name: "Historical Sensitivity", weight: 10 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", maxSize: "50MB", dimensions: "A1 landscape (3×)" },
      { type: "Master Plan", format: "PDF", dimensions: "1:500 scale" },
    ],
    ipTerms: {
      type: "winning_license",
      summary: "Winning design licensed for construction. All other entries remain with designers.",
      fullText: "The winning designer grants the City of Portland a license to develop and construct the design. A separate design services contract will be offered to the winner. All non-winning entries retain full IP rights.",
      appliesToAllEntries: false,
      isDefault: false,
      warningLevel: "info",
    },
    results: {
      winners: [
        {
          place: "1st Place",
          designerName: "Lena Park",
          designerOrg: "Lena Park & Associates",
          submitterSlug: "lena-park",
          projectTitle: "Threshold — Where Journeys Meet",
          description: "A design organized around a central 'threshold' — a sculptural passage that visitors walk through, symbolizing the immigrant experience of crossing into a new life. The park radiates outward from this moment into gardens representing the world's biomes.",
          images: [winnerImages.render1.url, winnerImages.render2.url],
          juryStatement: "An extraordinarily moving design that transforms the act of walking through a park into a profound narrative experience. The threshold concept is both architecturally powerful and emotionally resonant.",
          prizeAmount: 15000,
          paidOut: true,
          paidOutDate: "2025-11-20",
        },
        {
          place: "2nd Place",
          designerName: "Terrafirma Studio",
          submitterSlug: "terrafirma-studio",
          projectTitle: "Woven Ground",
          description: "An intricate landscape of interlocking pathways and garden rooms, each representing a different wave of immigration. Native and culturally significant plantings intermingle, creating an evolving ecological tapestry.",
          images: [winnerImages.render3.url],
          prizeAmount: 7000,
          paidOut: true,
          paidOutDate: "2025-11-20",
        },
        {
          place: "3rd Place",
          designerName: "Root Collective",
          submitterSlug: "root-collective",
          projectTitle: "Common Table",
          description: "Centered on a monumental communal table — 50 meters long — carved from reclaimed timber. The table serves as gathering space, memorial marker, and symbol of shared meals across cultures.",
          images: [winnerImages.render4.url],
          prizeAmount: 3000,
          paidOut: true,
          paidOutDate: "2025-11-20",
        },
      ],
      jurySummary: "The jury received 247 submissions from 38 countries. The winning entries stood out for their ability to honor the site's history while creating genuinely inviting public spaces.",
    },
    updates: [
      {
        date: "2025-12-10",
        author: "Civic Design Lab",
        title: "Design Services Contract Awarded",
        content: "We're thrilled to announce that Lena Park & Associates has been awarded the design services contract to develop Threshold into construction documents. Groundbreaking is planned for Fall 2026.",
      },
      {
        date: "2026-03-01",
        author: "Lena Park",
        title: "Schematic Design Complete",
        content: "Our team has completed schematic design. We've refined the threshold structure and are working with structural engineers on the sculptural passage. Community feedback sessions begin next month.",
      },
    ],
    createdAt: "2025-05-01",
  },

  // 5. In construction
  {
    id: "comp-5",
    slug: "community-center-renewal",
    title: "Greenwood Community Center",
    shortDescription:
      "A new 1,500m² community center for the Greenwood neighborhood, replacing an aging facility with a modern, multi-purpose civic building.",
    brief: `The Greenwood neighborhood needs a new heart. The existing community center — built in 1968 — no longer serves the community's needs. This competition sought designs for a 1,500m² replacement that would house a gymnasium, meeting rooms, a commercial kitchen, childcare facilities, and flexible event space.

The winning design is now under construction.`,
    designObjectives: [
      "Create a welcoming, daylit public building",
      "Design flexible spaces that adapt to multiple uses",
      "Achieve Passive House certification",
      "Maximize community ownership and pride",
    ],
    siteContext: "Corner lot in a residential neighborhood, 2,800m² site. Adjacent to a public park.",
    background: "Funded by a $12M municipal bond approved by voters in 2024.",
    type: "open",
    status: "announced",
    eligibility: "open_to_all",
    tags: ["civic", "public-space", "sustainability"],
    location: "Seattle, WA, USA",
    region: "North America",
    language: "English",
    heroImage: competitionImages.communityCenter.hero,
    thumbnailImage: competitionImages.communityCenter.thumbnail,
    registrationDeadline: "2025-03-01",
    submissionDeadline: "2025-04-15",
    judgingStart: "2025-04-20",
    judgingEnd: "2025-06-01",
    announcementDate: "2025-06-15",
    prizePool: {
      totalAmount: 30000,
      currency: "USD",
      breakdown: [
        { place: "1st Place + Commission", amount: 20000, recipientName: "Alder Collective" },
        { place: "2nd Place", amount: 7000, recipientName: "Lindqvist Partners" },
        { place: "3rd Place", amount: 3000, recipientName: "Birch & Stone Architects" },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 28500,
      fundingStatus: "paid_out",
      paidOutDate: "2025-06-20",
    },
    organizer: organizers.civicLab,
    jury: [
      {
        name: "Erik Lindqvist",
        title: "Owner & Principal",
        organization: "Lindqvist Partners",
        photo: juryAvatars.person4.url,
        bio: "Award-winning architect known for innovative civic and residential architecture in the Pacific Northwest.",
      },
      {
        name: "Nadia Voss",
        title: "Partner",
        organization: "Voss & Partners",
        photo: juryAvatars.person6.url,
        bio: "Designed numerous cultural institutions and civic landmarks across the United States.",
      },
    ],
    evaluationCriteria: [
      { name: "Architectural Quality", weight: 30 },
      { name: "Community Engagement", weight: 25 },
      { name: "Sustainability", weight: 25 },
      { name: "Functionality", weight: 20 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", dimensions: "A1 landscape (3×)" },
    ],
    ipTerms: {
      type: "winning_transfer",
      summary: "Winning entry: full rights transfer to the city for construction. All others retain their rights.",
      fullText: "The winning designer transfers design rights to the City of Seattle for the purpose of constructing this community center. A design services contract accompanies the transfer. Non-winning entries retain all rights.",
      appliesToAllEntries: false,
      isDefault: false,
      warningLevel: "caution",
    },
    results: {
      winners: [
        {
          place: "1st Place",
          designerName: "Alder Collective",
          submitterSlug: "alder-collective",
          projectTitle: "The Commons",
          description: "A timber-framed building organized around a central daylit atrium that serves as the building's social heart. Operable walls allow spaces to expand and contract based on community needs.",
          images: [winnerImages.render2.url],
          prizeAmount: 20000,
          paidOut: true,
          paidOutDate: "2025-06-20",
        },
      ],
      jurySummary: "The jury was unanimous in selecting The Commons for its warmth, flexibility, and deep engagement with the community's actual needs.",
    },
    updates: [
      {
        date: "2025-09-01",
        author: "Civic Design Lab",
        title: "Groundbreaking Ceremony",
        content: "Over 300 community members attended the groundbreaking. Construction has officially begun with Ridgeline Builders as the general contractor.",
        newStatus: "announced",
      },
      {
        date: "2026-01-15",
        author: "Alder Collective",
        title: "Structure Topping Out",
        content: "The mass timber structure is now complete. The signature glulam beams of the central atrium are in place. Interior work begins this month.",
      },
      {
        date: "2026-03-10",
        author: "Civic Design Lab",
        title: "On Track for Fall Opening",
        content: "Construction is on schedule and on budget. The building envelope is sealed and interior finishes are underway. Grand opening planned for October 2026.",
      },
    ],
    createdAt: "2024-12-01",
  },

  // 6. Built and occupied
  {
    id: "comp-6",
    slug: "floating-classroom",
    title: "The Floating Classroom",
    shortDescription:
      "A floating educational facility for a coastal community, designed to adapt to rising sea levels while teaching children about marine ecology.",
    brief: `Design a floating classroom — a 120m² educational facility that sits on water and teaches children about marine ecology through its very architecture. The structure must be fully functional as a classroom for 25 students while demonstrating sustainable building practices.

This competition was completed in 2024 and the winning design was built and inaugurated in March 2025.`,
    designObjectives: [
      "Design a structure that floats safely and stably",
      "Create an inspiring learning environment for 25 students",
      "Incorporate marine ecology teaching moments into the architecture",
      "Use sustainable and marine-safe materials",
    ],
    siteContext: "A protected harbour in a coastal village, connected to shore by a pedestrian bridge.",
    background: "Funded by the Green Build Alliance and a coalition of environmental education nonprofits.",
    type: "open",
    status: "announced",
    eligibility: "open_to_all",
    tags: ["education", "sustainability", "infrastructure"],
    location: "Stavanger, Norway",
    region: "Europe",
    language: "English",
    heroImage: competitionImages.floatingClassroom.hero,
    thumbnailImage: competitionImages.floatingClassroom.thumbnail,
    registrationDeadline: "2024-06-01",
    submissionDeadline: "2024-07-15",
    judgingStart: "2024-07-20",
    judgingEnd: "2024-09-01",
    announcementDate: "2024-09-15",
    prizePool: {
      totalAmount: 10000,
      currency: "USD",
      breakdown: [
        { place: "1st Place + Commission", amount: 7000, recipientName: "Nordic Atelier" },
        { place: "2nd Place", amount: 2000, recipientName: "WaterStudio" },
        { place: "3rd Place", amount: 1000, recipientName: "Tidal Lab" },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 9500,
      fundingStatus: "paid_out",
      paidOutDate: "2024-09-20",
    },
    organizer: organizers.greenBuildAlliance,
    jury: [
      {
        name: "Willem De Vries",
        title: "Founder",
        organization: "AquaBuild Studio",
        photo: juryAvatars.person1.url,
        bio: "Pioneer of floating architecture with completed aquatic building projects across four continents.",
      },
      {
        name: "Clara Montoya",
        title: "Professor",
        organization: "Universidad del Sur",
        photo: juryAvatars.person3.url,
        bio: "Award-winning educator known for achieving maximum architectural impact with minimal resources.",
      },
    ],
    evaluationCriteria: [
      { name: "Innovation", weight: 30 },
      { name: "Educational Value", weight: 25 },
      { name: "Structural Viability", weight: 25 },
      { name: "Sustainability", weight: 20 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", dimensions: "A1 landscape (2×)" },
    ],
    ipTerms: {
      type: "winning_license",
      summary: "Winning design licensed for construction at this specific site. Designer retains rights for all other uses.",
      fullText: "The winning designer grants the Green Build Alliance a site-specific license to construct the design in Stavanger, Norway. The designer retains all other rights including the right to build similar structures elsewhere.",
      appliesToAllEntries: false,
      isDefault: false,
      warningLevel: "info",
    },
    results: {
      winners: [
        {
          place: "1st Place",
          designerName: "Nordic Atelier",
          submitterSlug: "nordic-atelier",
          projectTitle: "Tideroom",
          description: "A gently curved timber structure whose floor level visibly responds to tidal changes, making the ocean's rhythms part of every lesson. A transparent floor section reveals marine life below.",
          images: [winnerImages.render5.url, winnerImages.render1.url],
          juryStatement: "Tideroom transforms the act of going to school into an encounter with the living ocean. The transparent floor alone is worth the project.",
          prizeAmount: 7000,
          paidOut: true,
          paidOutDate: "2024-09-20",
        },
      ],
      jurySummary: "82 submissions from 23 countries. The jury praised the overall quality and noted the winning entry's elegant integration of pedagogy and architecture.",
    },
    updates: [
      {
        date: "2024-12-01",
        author: "Green Build Alliance",
        title: "Construction Complete",
        content: "The Floating Classroom is anchored and connected to shore. Final inspections passed. Interior fit-out begins this week.",
      },
      {
        date: "2025-03-15",
        author: "Nordic Atelier",
        title: "Grand Opening — Students on Board!",
        content: "The first class of 25 students held their lesson in the Floating Classroom today. The transparent floor was an immediate hit — a small crab was spotted during math class.",
        newStatus: "announced",
      },
      {
        date: "2026-02-01",
        author: "Green Build Alliance",
        title: "One Year In — Impact Report",
        content: "Over 1,200 students have used the Floating Classroom in its first year. Marine biology test scores are up 23% at the local school. Three other coastal communities have inquired about replicating the design.",
      },
    ],
    createdAt: "2024-04-01",
  },

  // 7. Invite-only
  {
    id: "comp-7",
    slug: "meridian-mixed-use",
    title: "Meridian Mixed-Use Development",
    shortDescription:
      "Invited competition for the design of a 12-story mixed-use building combining 80 residential units, ground-floor retail, and a public courtyard.",
    brief: `Meridian Development Group invites five pre-selected architecture firms to propose designs for a 12-story mixed-use building in the city's arts district.

The building will include 80 residential units (20% affordable), 1,200m² of ground-floor retail, underground parking for 60 vehicles, and a publicly-accessible courtyard connecting to the adjacent arts walk.`,
    designObjectives: [
      "Create a distinctive yet contextual building in the arts district",
      "Maximize natural light in residential units",
      "Design an activated ground floor and inviting public courtyard",
      "Meet 6-star Green Star rating",
    ],
    siteContext: "3,200m² corner site in a rapidly developing arts district. Adjacent to a converted warehouse gallery and a public transit stop.",
    background: "Meridian's first design competition. The firm traditionally selects architects directly but is piloting a competitive process to access fresh ideas.",
    type: "invite_only",
    status: "judging",
    eligibility: "licensed_professionals",
    tags: ["mixed-use", "residential", "urban-design"],
    location: "Melbourne, Australia",
    region: "Oceania",
    language: "English",
    heroImage: competitionImages.mixedUse.hero,
    thumbnailImage: competitionImages.mixedUse.thumbnail,
    registrationDeadline: "2026-02-01",
    submissionDeadline: "2026-03-01",
    judgingStart: "2026-03-05",
    judgingEnd: "2026-04-15",
    announcementDate: "2026-04-30",
    prizePool: {
      totalAmount: 20000,
      currency: "USD",
      breakdown: [
        { place: "1st Place + Commission", amount: 12000 },
        { place: "2nd Place", amount: 5000 },
        { place: "3rd Place", amount: 3000 },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 19000,
      fundingStatus: "funded",
    },
    organizer: organizers.meridianDev,
    jury: [
      {
        name: "Thomas Ashford",
        title: "Director",
        organization: "Ashford Studio",
        photo: juryAvatars.person4.url,
        bio: "One of Australia's most respected architects, known for material-rich, culturally grounded buildings.",
      },
      {
        name: "Helen Morrow",
        title: "Director",
        organization: "Morrow Architecture",
        photo: juryAvatars.person6.url,
        bio: "Award-winning architect recognized for housing and civic projects that elevate everyday architecture.",
      },
    ],
    evaluationCriteria: [
      { name: "Design Quality", weight: 30 },
      { name: "Residential Amenity", weight: 25 },
      { name: "Urban Context", weight: 20 },
      { name: "Commercial Viability", weight: 15 },
      { name: "Sustainability", weight: 10 },
    ],
    deliverables: [
      { type: "Design Report", format: "PDF", maxSize: "100MB", description: "Comprehensive design report including plans, sections, elevations, and renders" },
    ],
    ipTerms: {
      type: "winning_transfer",
      summary: "Winning design rights transfer to the developer for construction. Non-winners retain all rights. Stipend paid to all invited firms.",
      fullText: "All five invited firms receive a $3,000 participation stipend. The winning designer transfers development rights to Meridian Development Group for this site. All non-winning firms retain full IP rights.",
      appliesToAllEntries: false,
      isDefault: false,
      warningLevel: "caution",
    },
    createdAt: "2025-11-01",
  },

  // 8. Awards type
  {
    id: "comp-8",
    slug: "emerging-architect-award-2026",
    title: "Emerging Architect of the Year 2026",
    shortDescription:
      "Annual award recognizing an architect under 40 whose built work demonstrates exceptional promise, innovation, and social commitment.",
    brief: `The Architecture Foundation's Emerging Architect of the Year award celebrates architects under 40 who are redefining what architecture can do. Candidates are evaluated on their body of built work (minimum 3 completed projects) rather than a single competition entry.

This is a nomination-based award — candidates may self-nominate or be nominated by peers.`,
    designObjectives: [
      "Demonstrate a coherent architectural vision across multiple projects",
      "Show evidence of social impact or community engagement",
      "Display innovation in materials, construction, or spatial design",
      "Maintain a commitment to sustainability",
    ],
    siteContext: "N/A — this is a portfolio-based award, not a site-specific competition.",
    background: "Now in its 15th year, previous winners include Amara Diallo, Lars Henriksen (before founding Studio Henriksen), and Kofi Adjei.",
    type: "awards",
    status: "open",
    eligibility: "open_to_all",
    tags: ["cultural"],
    location: "Global",
    region: "Global",
    language: "English",
    heroImage: competitionImages.emergingArchitect.hero,
    thumbnailImage: competitionImages.emergingArchitect.thumbnail,
    registrationDeadline: "2026-06-01",
    submissionDeadline: "2026-07-01",
    judgingStart: "2026-07-15",
    judgingEnd: "2026-09-15",
    announcementDate: "2026-10-01",
    prizePool: {
      totalAmount: 5000,
      currency: "USD",
      breakdown: [
        { place: "Winner", amount: 5000 },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 4750,
      fundingStatus: "funded",
    },
    organizer: organizers.archFoundation,
    jury: [
      {
        name: "Yumi Hayashi",
        title: "Principal",
        organization: "Hayashi Atelier",
        photo: juryAvatars.person8.url,
        bio: "Internationally acclaimed architect and one of the most influential designers of the 21st century.",
      },
      {
        name: "Kwame Asante",
        title: "Founder",
        organization: "Mensah Studio",
        photo: juryAvatars.person7.url,
        bio: "Award-winning architect whose work spans cultural institutions and civic landmarks across three continents.",
      },
      {
        name: "Rachel Okonkwo",
        title: "Founding Principal",
        organization: "Okonkwo Design Lab",
        photo: juryAvatars.person3.url,
        bio: "Award-winning architect known for buildings that forge unexpected connections between people and the environment.",
      },
    ],
    evaluationCriteria: [
      { name: "Body of Work", weight: 35 },
      { name: "Innovation", weight: 25 },
      { name: "Social Impact", weight: 25 },
      { name: "Future Potential", weight: 15 },
    ],
    deliverables: [
      { type: "Portfolio", format: "PDF", maxSize: "100MB", description: "Portfolio documenting minimum 3 built projects with photos, drawings, and project descriptions" },
      { type: "Personal Statement", format: "PDF", maxSize: "5MB", description: "1,000-word statement on your architectural vision and values" },
      { type: "CV", format: "PDF", maxSize: "5MB" },
    ],
    ipTerms: {
      type: "retain_all",
      summary: "Nominees retain all rights. Award is recognition only — no IP transfer of any kind.",
      fullText: "This award involves no transfer of intellectual property. All submitted portfolio materials remain the property of the nominee.",
      appliesToAllEntries: false,
      isDefault: true,
      warningLevel: "none",
    },
    createdAt: "2026-03-01",
  },

  // 9. Open pool with multiple contributors
  {
    id: "comp-9",
    slug: "climate-resilient-school",
    title: "Climate-Resilient School",
    shortDescription:
      "Design a prototype school building for tropical regions that can withstand extreme weather while providing an exceptional learning environment.",
    brief: `Climate change is making schools dangerous in many tropical regions. Extreme heat, flooding, and storms regularly disrupt education and threaten student safety. This competition seeks a prototype school design that is inherently resilient — a building that doesn't just survive extreme weather but thrives in it.

The design should serve 200 students (ages 6-14) and be replicable across diverse tropical contexts. This is an open-pool competition — organizations worldwide are contributing to the prize fund because the ideas generated here will benefit communities globally.`,
    designObjectives: [
      "Design for passive cooling to maintain comfort without air conditioning",
      "Withstand Category 3 hurricane winds and 500mm rainfall events",
      "Serve as a community shelter during extreme weather",
      "Use locally-available materials and construction techniques",
      "Create joyful, inspiring learning spaces despite harsh climate constraints",
    ],
    siteContext: "Generic tropical site — designs should be adaptable to various locations. Assume flat terrain, high water table, and 12-month growing season.",
    background: "Initiated by the Green Build Alliance after Typhoon Rai destroyed over 500 school buildings in the Philippines in 2021.",
    type: "ideas",
    status: "open",
    eligibility: "open_to_all",
    tags: ["education", "sustainability", "infrastructure", "housing"],
    location: "Global (Tropical Regions)",
    region: "Global",
    language: "English",
    heroImage: competitionImages.climateSchool.hero,
    thumbnailImage: competitionImages.climateSchool.thumbnail,
    registrationDeadline: "2026-08-01",
    submissionDeadline: "2026-09-01",
    judgingStart: "2026-09-15",
    judgingEnd: "2026-11-01",
    announcementDate: "2026-11-15",
    prizePool: {
      totalAmount: 20000,
      currency: "USD",
      breakdown: [
        { place: "1st Place", amount: 10000 },
        { place: "2nd Place", amount: 5000 },
        { place: "3rd Place", amount: 3000 },
        { place: "Honorable Mention (x2)", amount: 1000 },
      ],
      isOpenPool: true,
      contributorCount: 47,
      platformFeePercent: 5,
      netToWinners: 19000,
      fundingStatus: "funded",
    },
    organizer: organizers.greenBuildAlliance,
    jury: [
      {
        name: "Thanh Nguyen",
        title: "Founder",
        organization: "Nguyen Green Studio",
        photo: juryAvatars.person1.url,
        bio: "Vietnamese architect celebrated for bamboo structures and green buildings that work with tropical climates.",
      },
      {
        name: "Fatima Rahman",
        title: "Principal",
        organization: "Rahman Architects",
        photo: juryAvatars.person5.url,
        bio: "Award-winning architect whose community mosques demonstrate climate-responsive design at its finest.",
      },
      {
        name: "Dr. Sofia Guerrero",
        title: "Professor",
        organization: "Pacific Institute of Design",
        photo: juryAvatars.person4.url,
        bio: "Researcher at the intersection of architecture, 3D printing, and disaster-resilient construction.",
      },
    ],
    evaluationCriteria: [
      { name: "Climate Resilience", weight: 30 },
      { name: "Learning Environment", weight: 25 },
      { name: "Replicability", weight: 20 },
      { name: "Material Innovation", weight: 15 },
      { name: "Community Value", weight: 10 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", maxSize: "50MB", dimensions: "A1 landscape (2×)" },
      { type: "Climate Strategy Diagram", format: "PDF", description: "Diagram showing passive cooling, ventilation, and storm resilience strategies" },
      { type: "Material Palette", format: "PDF", description: "Specification of primary materials with local sourcing strategy" },
    ],
    ipTerms: {
      type: "retain_all",
      summary: "Designers retain all rights. Winning designs published under Creative Commons to maximize global impact.",
      fullText: "Designers retain all intellectual property rights. By entering, winners agree to also publish their designs under a Creative Commons Attribution-ShareAlike 4.0 license, allowing communities worldwide to adapt and build upon the designs with credit.",
      appliesToAllEntries: false,
      isDefault: true,
      warningLevel: "none",
    },
    createdAt: "2026-02-15",
  },

  // 10. Shelved
  {
    id: "comp-10",
    slug: "civic-plaza-redesign",
    title: "Civic Plaza Redesign",
    shortDescription:
      "A competition to redesign the city's main civic plaza into a vibrant, accessible public space. Winners announced; project on hold pending funding.",
    brief: `The city's central civic plaza hasn't been updated since 1985. This competition sought bold visions for transforming the 1.5-hectare space into a 21st-century public square — green, accessible, event-ready, and reflective of the community's evolving identity.

Note: This competition was completed and winners selected. The project is currently on hold due to reallocation of municipal funds to emergency infrastructure repairs.`,
    designObjectives: [
      "Transform a dated concrete plaza into a green, inviting public space",
      "Accommodate large civic events (5,000+ people) and intimate daily use",
      "Improve accessibility and universal design",
      "Integrate stormwater management and urban tree canopy",
    ],
    siteContext: "1.5 hectares in the civic center, surrounded by City Hall, the public library, and a transit hub.",
    background: "A voter-approved bond measure funded the competition. Post-competition, emergency sewer infrastructure repairs consumed the allocated budget.",
    type: "open",
    status: "announced",
    eligibility: "open_to_all",
    tags: ["public-space", "landscape", "civic", "urban-design"],
    location: "Denver, CO, USA",
    region: "North America",
    language: "English",
    heroImage: competitionImages.civicPlaza.hero,
    thumbnailImage: competitionImages.civicPlaza.thumbnail,
    registrationDeadline: "2025-05-01",
    submissionDeadline: "2025-06-15",
    judgingStart: "2025-06-20",
    judgingEnd: "2025-08-01",
    announcementDate: "2025-08-15",
    prizePool: {
      totalAmount: 15000,
      currency: "USD",
      breakdown: [
        { place: "1st Place", amount: 8000, recipientName: "Civitas" },
        { place: "2nd Place", amount: 4000, recipientName: "Dig Studio" },
        { place: "3rd Place", amount: 3000, recipientName: "Mundus Bishop" },
      ],
      isOpenPool: false,
      contributorCount: 1,
      platformFeePercent: 5,
      netToWinners: 14250,
      fundingStatus: "paid_out",
      paidOutDate: "2025-08-20",
    },
    organizer: organizers.civicLab,
    jury: [
      {
        name: "Elena Vasquez",
        title: "Founder",
        organization: "Vasquez Landscape",
        photo: juryAvatars.person2.url,
        bio: "Award-winning landscape architect working at the intersection of urban design and environmental systems.",
      },
      {
        name: "Marcus Jefferson",
        title: "Founder",
        organization: "Jefferson Design Studio",
        photo: juryAvatars.person7.url,
        bio: "Award-winning designer whose work reimagines urban landscapes as spaces of cultural memory and social justice.",
      },
    ],
    evaluationCriteria: [
      { name: "Design Vision", weight: 30 },
      { name: "Public Life", weight: 25 },
      { name: "Sustainability", weight: 20 },
      { name: "Feasibility", weight: 15 },
      { name: "Accessibility", weight: 10 },
    ],
    deliverables: [
      { type: "Presentation Boards", format: "PDF", dimensions: "A1 landscape (3×)" },
    ],
    ipTerms: {
      type: "retain_all",
      summary: "All designers retain full rights. Since the project is on hold, no construction license applies.",
      fullText: "All intellectual property rights remain with the submitting designers. The originally-intended construction license is void as the project will not proceed.",
      appliesToAllEntries: false,
      isDefault: true,
      warningLevel: "none",
    },
    results: {
      winners: [
        {
          place: "1st Place",
          designerName: "Civitas",
          submitterSlug: "civitas",
          projectTitle: "The Green Commons",
          description: "A radical transformation replacing 80% of hardscape with a native grassland prairie, threaded with accessible paths and dotted with event pavilions.",
          images: [winnerImages.render3.url],
          prizeAmount: 8000,
          paidOut: true,
          paidOutDate: "2025-08-20",
        },
      ],
      jurySummary: "Strong entries across the board. All prize money was paid out despite the project being put on hold — the competition honored its commitments to designers.",
    },
    updates: [
      {
        date: "2025-08-15",
        author: "Civic Design Lab",
        title: "Winners Announced",
        content: "Congratulations to all winners. Prize payments will be processed this week.",
      },
      {
        date: "2025-10-01",
        author: "Civic Design Lab",
        title: "Project On Hold — Full Transparency",
        content: "We're disappointed to share that the Civic Plaza Redesign has been put on hold. Emergency sewer infrastructure repairs have consumed the construction budget allocated by the 2024 bond measure. All competition prizes were paid out in full. We hope to revive this project when funding becomes available. The winning designs remain powerful visions for what this space could become.",
        newStatus: "announced",
      },
    ],
    createdAt: "2025-02-01",
  },
];

export function getCompetitionBySlug(slug: string): Competition | undefined {
  return competitions.find((c) => c.slug === slug);
}

export function getOpenCompetitions(): Competition[] {
  return competitions.filter((c) => c.status === "open");
}

export function getLastCallCompetitions(): Competition[] {
  return competitions
    .filter((c) => c.status === "open")
    .filter((c) => {
      const deadline = new Date(c.submissionDeadline);
      const now = new Date();
      const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30 && daysLeft > 0;
    })
    .sort((a, b) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime());
}

export function getFeaturedCompetitions(): Competition[] {
  return competitions.filter(
    (c) => c.prizePool.totalAmount >= 10000 || c.prizePool.isOpenPool
  );
}

export function getAllSlugs(): string[] {
  return competitions.map((c) => c.slug);
}
