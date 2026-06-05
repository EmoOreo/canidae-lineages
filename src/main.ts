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

function renderPhenotype(phenotype: Record<string, unknown>): string {
  return Object.entries(phenotype)
    .map(
      ([key, value]) =>
        `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`
    )
    .join("");
}

function renderAnimal(animal: any): string {
  return `
    <article>
      <h4>${animal.name}</h4>
      <p><strong>Species ID:</strong> ${animal.speciesId}</p>
      <p><strong>Generation:</strong> ${animal.generation}</p>
      <p><strong>D Traits:</strong> ${animal.genome.D.length}</p>
      <p><strong>M Mutations:</strong> ${animal.genome.M.length ? animal.genome.M.join(", ") : "None"}</p>
      <p><strong>Fertility:</strong> ${animal.stats.fertility}</p>
      <p><strong>Stability:</strong> ${animal.stats.stability}</p>
      <p><strong>Lineage:</strong> ${JSON.stringify(animal.genome.L)}</p>
      <details>
        <summary>Phenotype</summary>
        <ul>${renderPhenotype(animal.phenotype)}</ul>
      </details>
    </article>
  `;
}

async function bootstrap() {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  app.innerHTML = "<h1>Loading Canidae: Lineages...</h1>";

  try {
    const [species, traits, breedingRules, mutations] = await Promise.all([
      loadJson("/data/canid_compendium_starter.json"),
      loadJson("/data/trait_library_starter.json"),
      loadJson("/data/breeding_rules_starter.json"),
      loadJson("/data/MUTATION_CATALOG_V1.json"),
    ]);

    const founders = createFounderAnimals(species);

    const wolf = founders.find((animal) => animal.speciesId === "canis_lupus");
    const coyote = founders.find((animal) => animal.speciesId === "canis_latrans");
    const fox = founders.find((animal) => animal.speciesId === "vulpes_vulpes");
    const dog = founders.find(
      (animal) => animal.speciesId === "canis_lupus_familiaris"
    );

    const wolfDog =
      wolf && dog ? resolveCompatibility(wolf, dog, species) : null;

    const wolfCoyote =
      wolf && coyote ? resolveCompatibility(wolf, coyote, species) : null;

    const wolfFox =
      wolf && fox ? resolveCompatibility(wolf, fox, species) : null;

    const wolfDogLineage =
      wolf && dog ? resolveLineage(wolf, dog) : null;

    const wolfCoyoteLineage =
      wolf && coyote ? resolveLineage(wolf, coyote) : null;

    const wolfFoxLineage =
      wolf && fox ? resolveLineage(wolf, fox) : null;

    const wolfDogOffspring =
      wolf && dog && wolfDog
        ? createOffspring(wolf, dog, wolfDog, mutations)
        : null;

    const wolfCoyoteOffspring =
      wolf && coyote && wolfCoyote
        ? createOffspring(wolf, coyote, wolfCoyote, mutations)
        : null;

    const wolfFoxOffspring =
      wolf && fox && wolfFox
        ? createOffspring(wolf, fox, wolfFox, mutations)
        : null;

    app.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Phase 2A - Sprint 8 Trait Inheritance Engine</h2>

      <section>
        <p><strong>Species Loaded:</strong> ${species.canids?.length ?? "Unknown"}</p>
        <p><strong>Trait Categories:</strong> ${
          Object.keys(traits.categories ?? {}).length
        }</p>
        <p><strong>Breeding Rules:</strong> Loaded</p>
        <p><strong>Mutation Catalog:</strong> ${
          mutations.mutations?.length ?? "Unknown"
        } mutations loaded</p>
      </section>

      <section>
        <h3>Founder Animals With Phenotypes</h3>
        ${founders.map(renderAnimal).join("")}
      </section>

      <section>
        <h3>Compatibility Tests</h3>

        <h4>Wolf × Dog</h4>
        <pre>${JSON.stringify(wolfDog, null, 2)}</pre>

        <h4>Wolf × Coyote</h4>
        <pre>${JSON.stringify(wolfCoyote, null, 2)}</pre>

        <h4>Wolf × Red Fox</h4>
        <pre>${JSON.stringify(wolfFox, null, 2)}</pre>
      </section>

      <section>
        <h3>Lineage Tests</h3>

        <h4>Wolf × Dog</h4>
        <pre>${JSON.stringify(wolfDogLineage, null, 2)}</pre>

        <h4>Wolf × Coyote</h4>
        <pre>${JSON.stringify(wolfCoyoteLineage, null, 2)}</pre>

        <h4>Wolf × Red Fox</h4>
        <pre>${JSON.stringify(wolfFoxLineage, null, 2)}</pre>
      </section>

      <section>
        <h3>Offspring With Inherited Traits</h3>

        <h4>Wolf × Dog Offspring</h4>
        ${wolfDogOffspring ? renderAnimal(wolfDogOffspring) : "<p>Unavailable</p>"}

        <h4>Wolf × Coyote Offspring</h4>
        ${wolfCoyoteOffspring ? renderAnimal(wolfCoyoteOffspring) : "<p>Unavailable</p>"}

        <h4>Wolf × Red Fox Sandbox Offspring</h4>
        ${wolfFoxOffspring ? renderAnimal(wolfFoxOffspring) : "<p>Unavailable</p>"}
      </section>
    `;

    console.log({
      species,
      traits,
      breedingRules,
      mutations,
      founders,
      wolfDog,
      wolfCoyote,
      wolfFox,
      wolfDogLineage,
      wolfCoyoteLineage,
      wolfFoxLineage,
      wolfDogOffspring,
      wolfCoyoteOffspring,
      wolfFoxOffspring,
    });
  } catch (error) {
    app.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Error</h2>
      <pre>${String(error)}</pre>
    `;

    console.error(error);
  }
}

bootstrap();