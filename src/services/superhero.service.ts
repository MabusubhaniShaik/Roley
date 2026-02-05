export interface Character {
  id: number;
  name: string;
  slug: string;

  powerstats: {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    power: number;
    combat: number;
  };

  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    eyeColor: string;
    hairColor: string;
  };

  biography: {
    fullName: string;
    alterEgos: string;
    aliases: string[];
    placeOfBirth: string;
    firstAppearance: string;
    publisher: string;
    alignment: "good" | "bad" | "neutral" | string;
  };

  work: {
    occupation: string;
    base: string;
  };

  connections: {
    groupAffiliation: string;
    relatives: string;
  };

  images: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
}

// Default API URL
const API_URL =
  "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json";

/**
 * Fetch all characters or filter by publisher
 * @param publisher - optional filter for publisher
 */
export const getAllCharacters = async (
  publisher?: string
): Promise<Character[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch characters");

  const data: Character[] = await response.json();

  if (publisher) {
    return data.filter(
      (c) => c.biography.publisher?.toLowerCase() === publisher.toLowerCase()
    );
  }

  return data;
};
