import "./style.css";
import { createFounderAnimals } from "./genetics/createFounderAnimals";
import { resolveCompatibility } from "./breeding/resolveCompatibility";
import { createOffspring } from "./breeding/createOffspring";
import type { Animal } from "./types/animal";

const SAVE_KEY = "canidae-lineages-save-v1";

interface SaveData {
  animals: Animal[];
}

async function loadJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function saveAnimals(animals: Animal[]) {
  const saveData: SaveData = {
    animals,
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadSavedAnimals(): Animal[] | null {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (!rawSave) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSave) as SaveData;

    if (!Array.isArray(parsed.animals)) {
      return null;
    }

    return parsed.animals;
  } catch {
    return null;
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function renderPhenotype(phenotype: Record<string, unknown>): string {
  return Object.entries(phenotype)
    .map(
      ([key, value]) =>
        `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`
    )
    .join("");
}

function renderAnimal(animal: Animal): string {
  return `
    <article>
      <h4>${animal.name}</h4>
      <p><strong>ID:</strong> ${animal.id}</p>
      <p><strong>Species ID:</strong> ${animal.speciesId}</p>
      <p><strong>Generation:</strong> ${animal.generation}</p>
      <p><strong>D Traits:</strong> ${animal.genome.D.length}</p>
      <p><strong>R Carriers:</strong> ${
        animal.genome.R.length ? animal.genome.R.join(", ") : "None"
      }</p>
      <p><strong>M Mutations:</strong> ${
        animal.genome.M.length ? animal.genome.M.join(", ") : "None"
      }</p>
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

function renderAnimalOptions(animals: Animal[]): string {
  return animals
    .map(
      (animal) =>
        `<option value="${animal.id}">${animal.name} — ${animal.speciesId}</option>`
    )
    .join("");
}

function renderApp(
  species: any,
  traits: any,
  breedingRules: any,
  mutations: any,
  animals: Animal[],
  latestOffspring: Animal | null,
  latestCompatibility: any,
  selectedMode: "realistic" | "sandbox",
  saveStatus: string
) {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  app.innerHTML = `
    <h1>Canidae: Lineages</h1>
    <h2>Phase 2A - Sprint 10 Save Persistence</h2>

    <section>
      <p><strong>Species Loaded:</strong> ${species.canids?.length ?? "Unknown"}</p>
      <p><strong>Trait Categories:</strong> ${
        Object.keys(traits.categories ?? {}).length
      }</p>
      <p><strong>Breeding Rules:</strong> ${
        breedingRules ? "Loaded" : "Missing"
      }</p>
      <p><strong>Mutation Catalog:</strong> ${
        mutations.mutations?.length ?? "Unknown"
      } mutations loaded</p>
      <p><strong>Animals in Kennel:</strong> ${animals.length}</p>
      <p><strong>Save Status:</strong> ${saveStatus}</p>
    </section>

    <section>
      <button id="saveButton">Save Kennel</button>
      <button id="resetButton">Reset Save</button>
    </section>

    <hr />

    <section>
      <h3>Breeding Lab</h3>

      <label for="parentA">Parent A</label><br />
      <select id="parentA">
        ${renderAnimalOptions(animals)}
      </select>

      <br /><br />

      <label for="parentB">Parent B</label><br />
      <select id="parentB">
        ${renderAnimalOptions(animals)}
      </select>

      <br /><br />

      <label for="mode">Mode</label><br />
      <select id="mode">
        <option value="realistic" ${
          selectedMode === "realistic" ? "selected" : ""
        }>Realistic</option>
        <option value="sandbox" ${
          selectedMode === "sandbox" ? "selected" : ""
        }>Sandbox</option>
      </select>

      <br /><br />

      <button id="breedButton">Breed Selected Parents</button>
    </section>

    <hr />

    <section>
      <h3>Latest Compatibility</h3>
      <pre>${JSON.stringify(latestCompatibility, null, 2)}</pre>
    </section>

    <section>
      <h3>Latest Offspring</h3>
      ${
        latestOffspring
          ? renderAnimal(latestOffspring)
          : "<p>No offspring generated yet.</p>"
      }
    </section>

    <hr />

    <section>
      <h3>Kennel</h3>
      ${animals.map(renderAnimal).join("")}
    </section>
  `;

  const parentASelect = document.querySelector<HTMLSelectElement>("#parentA");
  const parentBSelect = document.querySelector<HTMLSelectElement>("#parentB");
  const modeSelect = document.querySelector<HTMLSelectElement>("#mode");
  const breedButton = document.querySelector<HTMLButtonElement>("#breedButton");
  const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
  const resetButton = document.querySelector<HTMLButtonElement>("#resetButton");

  if (
    !parentASelect ||
    !parentBSelect ||
    !modeSelect ||
    !breedButton ||
    !saveButton ||
    !resetButton
  ) {
    return;
  }

  if (animals[0]) parentASelect.value = animals[0].id;
  if (animals[1]) parentBSelect.value = animals[1].id;
  modeSelect.value = selectedMode;

  saveButton.addEventListener("click", () => {
    saveAnimals(animals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      "Kennel saved."
    );
  });

  resetButton.addEventListener("click", () => {
    clearSave();

    const resetAnimals = createFounderAnimals(species);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      resetAnimals,
      null,
      null,
      "Save reset. Founder kennel restored."
    );
  });

  breedButton.addEventListener("click", () => {
    const parentA = animals.find((animal) => animal.id === parentASelect.value);
    const parentB = animals.find((animal) => animal.id === parentBSelect.value);
    const mode = modeSelect.value as "realistic" | "sandbox";

    if (!parentA || !parentB) return;

    const compatibility = resolveCompatibility(parentA, parentB, species);

    if (mode === "realistic" && !compatibility.realisticAllowed) {
      renderApp(
        species,
        traits,
        breedingRules,
        mutations,
        animals,
        null,
        {
          ...compatibility,
          blocked: true,
          blockedReason:
            "This pairing is blocked in Realistic Mode. Try Sandbox Mode.",
        },
        mode,
        saveStatus
      );
      return;
    }

    const offspring = createOffspring(parentA, parentB, compatibility, mutations);

    animals.push(offspring);
    saveAnimals(animals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      offspring,
      compatibility,
      mode,
      "Offspring generated and kennel auto-saved."
    );
  });
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

    const savedAnimals = loadSavedAnimals();
    const animals = savedAnimals ?? createFounderAnimals(species);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      null,
      null,
      "Loaded."
    );
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