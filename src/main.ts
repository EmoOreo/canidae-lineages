import "./style.css";
import { createFounderAnimals } from "./genetics/createFounderAnimals";
import { resolveCompatibility } from "./breeding/resolveCompatibility";
import { resolveLineage } from "./lineage/resolveLineage";
import { createOffspring } from "./breeding/createOffspring";

async function loadJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function bootstrap() {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  app.innerHTML = "<h1>Loading Canidae: Lineages...</h1>";

  try {
    const [species, traits, breedingRules, mutations] =
      await Promise.all([
        loadJson("/data/canid_compendium_starter.json"),
        loadJson("/data/trait_library_starter.json"),
        loadJson("/data/breeding_rules_starter.json"),
        loadJson("/data/MUTATION_CATALOG_V1.json"),
      ]);

    const founders = createFounderAnimals(species);

    const wolf = founders.find(
      (animal) => animal.speciesId === "canis_lupus"
    );

    const coyote = founders.find(
      (animal) => animal.speciesId === "canis_latrans"
    );

    const fox = founders.find(
      (animal) => animal.speciesId === "vulpes_vulpes"
    );

    const dog = founders.find(
      (animal) => animal.speciesId === "canis_lupus_familiaris"
    );

    const wolfDog =
      wolf && dog
        ? resolveCompatibility(wolf, dog, species)
        : null;

    const wolfCoyote =
      wolf && coyote
        ? resolveCompatibility(wolf, coyote, species)
        : null;

    const wolfFox =
      wolf && fox
        ? resolveCompatibility(wolf, fox, species)
        : null;

    const wolfDogLineage =
      wolf && dog
        ? resolveLineage(wolf, dog)
        : null;

    const wolfCoyoteLineage =
      wolf && coyote
        ? resolveLineage(wolf, coyote)
        : null;

    const wolfFoxLineage =
      wolf && fox
        ? resolveLineage(wolf, fox)
        : null;

    const wolfDogOffspring =
      wolf && dog && wolfDog
        ? createOffspring(
            wolf,
            dog,
            wolfDog,
            mutations
          )
        : null;

    const wolfCoyoteOffspring =
      wolf && coyote && wolfCoyote
        ? createOffspring(
            wolf,
            coyote,
            wolfCoyote,
            mutations
          )
        : null;

    const wolfFoxOffspring =
      wolf && fox && wolfFox
        ? createOffspring(
            wolf,
            fox,
            wolfFox,
            mutations
          )
        : null;

    app.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Phase 2A - Sprint 6 Mutation Engine</h2>

      <p><strong>Species:</strong> ${
        species.canids?.length ?? 0
      }</p>

      <p><strong>Mutations:</strong> ${
        mutations.mutations?.length ?? 0
      }</p>

      <hr>

      <h3>Wolf × Dog</h3>
      <pre>${JSON.stringify(
        wolfDogOffspring,
        null,
        2
      )}</pre>

      <h3>Wolf × Coyote</h3>
      <pre>${JSON.stringify(
        wolfCoyoteOffspring,
        null,
        2
      )}</pre>

      <h3>Wolf × Red Fox</h3>
      <pre>${JSON.stringify(
        wolfFoxOffspring,
        null,
        2
      )}</pre>
    `;
  } catch (error) {
    document.body.innerHTML = `
      <h1>Error</h1>
      <pre>${String(error)}</pre>
    `;

    console.error(error);
  }
}

bootstrap();