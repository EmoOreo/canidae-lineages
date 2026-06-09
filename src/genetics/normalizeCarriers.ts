export function normalizeCarrier(carrier: string): string {
  const [locusOrTrait, allelePair] = carrier.split(":");

  if (!locusOrTrait || !allelePair) {
    return carrier;
  }

  if (!allelePair.includes("/")) {
    return carrier;
  }

  const normalizedPair = allelePair
    .split("/")
    .map((part) => part.trim())
    .sort()
    .join("/");

  return `${locusOrTrait}:${normalizedPair}`;
}

export function normalizeCarriers(carriers: string[]): string[] {
  return Array.from(new Set(carriers.map(normalizeCarrier)));
}