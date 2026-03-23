import type { Submitter } from "@/data/types";
import { juryAvatars } from "@/data/images";

export const submitters: Submitter[] = [
  {
    id: "sub-1",
    slug: "lena-park",
    name: "Lena Park",
    type: "individual",
    photo: juryAvatars.person5.url,
    country: "South Korea",
    city: "Seoul",
    bio: "Landscape architect focused on memory, migration, and the politics of public space. Principal at Lena Park & Associates.",
    specialties: ["landscape", "memorial", "public-space"],
    website: "https://example.com/lenapark",
    yearEstablished: 2018,
  },
  {
    id: "sub-2",
    slug: "terrafirma-studio",
    name: "Terrafirma Studio",
    type: "studio",
    photo: juryAvatars.person3.url,
    country: "Netherlands",
    city: "Rotterdam",
    bio: "A multidisciplinary design studio working at the intersection of landscape architecture, ecology, and social infrastructure.",
    specialties: ["landscape", "sustainability", "urban-design"],
    yearEstablished: 2015,
  },
  {
    id: "sub-3",
    slug: "root-collective",
    name: "Root Collective",
    type: "studio",
    photo: juryAvatars.person7.url,
    country: "Mexico",
    city: "Mexico City",
    bio: "An architecture cooperative specializing in community-driven design, material reuse, and spaces that center the communal experience.",
    specialties: ["public-space", "adaptive-reuse", "cultural"],
    yearEstablished: 2020,
  },
  {
    id: "sub-4",
    slug: "alder-collective",
    name: "Alder Collective",
    type: "studio",
    photo: juryAvatars.person4.url,
    country: "United States",
    city: "Portland, OR",
    bio: "A women-led architecture practice known for timber-forward community buildings that prioritize warmth, flexibility, and deep neighborhood engagement.",
    specialties: ["civic", "sustainability", "housing"],
    website: "https://example.com/alder",
    yearEstablished: 2016,
  },
  {
    id: "sub-5",
    slug: "nordic-atelier",
    name: "Nordic Atelier",
    type: "studio",
    photo: juryAvatars.person1.url,
    country: "Norway",
    city: "Bergen",
    bio: "A coastal architecture practice designing structures that live with water — floating, tidal, and flood-adaptive buildings for a changing climate.",
    specialties: ["sustainability", "education", "infrastructure"],
    website: "https://example.com/nordicatelier",
    yearEstablished: 2012,
  },
  {
    id: "sub-6",
    slug: "civitas",
    name: "Civitas",
    type: "studio",
    photo: juryAvatars.person6.url,
    country: "United States",
    city: "Denver, CO",
    bio: "Urban design and landscape architecture practice focused on transforming civic spaces into ecological and social assets.",
    specialties: ["public-space", "landscape", "urban-design", "civic"],
    yearEstablished: 2009,
  },
];

export function getSubmitterBySlug(slug: string): Submitter | undefined {
  return submitters.find((s) => s.slug === slug);
}

export function getAllSubmitterSlugs(): string[] {
  return submitters.map((s) => s.slug);
}
