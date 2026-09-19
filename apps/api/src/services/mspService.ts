export type MspReference = {
    crop: string;
    season: string;
    mspPerQuintal: number;
    unit: string;
    source: 'demo-reference';
};

// Replace these demo references with the current government notification before production use.
const mspReferences: MspReference[] = [
    { crop: 'Ragi', season: 'Kharif 2026', mspPerQuintal: 4290, unit: 'quintal', source: 'demo-reference' },
    { crop: 'Paddy', season: 'Kharif 2026', mspPerQuintal: 2369, unit: 'quintal', source: 'demo-reference' },
    { crop: 'Maize', season: 'Kharif 2026', mspPerQuintal: 2400, unit: 'quintal', source: 'demo-reference' },
    { crop: 'Tur', season: 'Kharif 2026', mspPerQuintal: 8000, unit: 'quintal', source: 'demo-reference' },
    { crop: 'Groundnut', season: 'Kharif 2026', mspPerQuintal: 7263, unit: 'quintal', source: 'demo-reference' },
];

export const getMspReferences = () => mspReferences;

export const findMspReference = (crop: string) =>
    mspReferences.find((reference) => reference.crop.toLowerCase() === crop.trim().toLowerCase());

export const compareWithMsp = (crop: string, marketPrice: number) => {
    const reference = findMspReference(crop);
    if (!reference) return null;

    const difference = marketPrice - reference.mspPerQuintal;
    return {
        ...reference,
        marketPrice,
        difference,
        status: difference >= 0 ? 'above-msp' : 'below-msp',
    } as const;
};
