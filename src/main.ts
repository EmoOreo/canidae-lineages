import "./style.css";

async function loadJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function createFounderAnimals(speciesData: any) {
  const starterSpecies = [
    "canis_lupus_familiaris",
    "canis_lupus",
    "canis_latrans",
    "vulpes_vulpes",
    "vulpes_zerda",
    "aenocyon_dirus",
  ];

  return starterSpecies
    .map((id) => speciesData.canids.find((c: any) => c.id === id))
    .filter(Boolean)
    .map((species: any, index: number) => ({
      id: `founder_${index}`,
      name: `${species.commonName} Alpha`,
      speciesId: species.id,
      generation: 0,
      genome: {
        D: [],
        R: [],
        M: [],
        L: {
          [species.id]: 100,
        },
      },
      stats: {
        fertility: species.fertilityBaseline ?? 50,
        stability: 100,
      },
    }));
}

async function bootstrap() {
  document.body.innerHTML = "<h1>Loading Canidae: Lineages...</h1>";

  try {
    const [species, traits, breedingRules, mutations] = await Promise.all([
      loadJson("/data/canid_compendium_starter.json"),
      loadJson("/data/trait_library_starter.json"),
      loadJson("/data/breeding_rules_starter.json"),
      loadJson("/data/MUTATION_CATALOG_V1.json"),
    ]);

    const founders = createFounderAnimals(species);

    document.body.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Founder Animals Loaded</h2>
      <p>Species Loaded: ${species.canids?.length ?? "Unknown"}</p>
      <p>Founders Created: ${founders.length}</p>
      <ul>
        ${founders
          .map(
            (animal: any) => `
              <li>
                <strong>${animal.name}</strong><br>
                Species: ${animal.speciesId}<br>
                Generation: ${animal.generation}<br>
                Fertility: ${animal.stats.fertility}<br>
                Stability: ${animal.stats.stability}
              </li>
            `
          )
          .join("")}
      </ul>
      <pre>${JSON.stringify({ founders }, null, 2)}</pre>
    `;

    console.log({ species, traits, breedingRules, mutations, founders });
  } catch (error) {
    document.body.innerHTML = `
      <h1>Canidae: Lineages Error</h1>
      <pre>${String(error)}</pre>
    `;
    console.error(error);
  }
}

bootstrap();