import "./style.css";
import { createFounderAnimals } from "./genetics/createFounderAnimals";
import { resolveCompatibility } from "./breeding/resolveCompatibility";
import { createLitter } from "./breeding/createLitter";
import { calculateInbreeding } from "./genetics/calculateInbreeding";
import type { Animal, Genotype } from "./types/animal";

const SAVE_KEY = "canidae-lineages-save-v1";

interface SaveData {
  animals: Animal[];
}

type BreedMode = "realistic" | "sandbox";
type SortMode = "name" | "generation" | "fertility" | "stability" | "mutations";

interface KennelFilters {
  search: string;
  species: string;
  generation: string;
  sort: SortMode;
}

const DEFAULT_FILTERS: KennelFilters = {
  search: "",
  species: "all",
  generation: "all",
  sort: "name",
};

async function loadJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function createFallbackGenotype(animal: Animal): Genotype {
  return {
    loci: {},
    inheritedMutations: animal.genome?.M ?? [],
  };
}

function migrateAnimal(animal: Animal): Animal {
  const lineage = animal.genome?.L ?? animal.ancestry?.lineage ?? {};

  return {
    ...animal,
    motherId: animal.motherId ?? null,
    fatherId: animal.fatherId ?? null,
    motherName: animal.motherName ?? null,
    fatherName: animal.fatherName ?? null,
    inbreedingCoefficient: animal.inbreedingCoefficient ?? 0,
    inbreedingTier: animal.inbreedingTier ?? "none",
    genotype: animal.genotype ?? createFallbackGenotype(animal),
    ancestry: animal.ancestry ?? {
      parentIds: [animal.motherId, animal.fatherId].filter(Boolean) as string[],
      founderIds:
        animal.generation === 0
          ? [animal.id]
          : [],
      lineage,
    },
    phenotype: {
      ...(animal.phenotype ?? {}),
      trait_inbreeding_coefficient:
        animal.inbreedingCoefficient ??
        Number(animal.phenotype?.trait_inbreeding_coefficient ?? 0),
    },
  };
}

function saveAnimals(animals: Animal[]) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ animals }));
}

function loadSavedAnimals(): Animal[] | null {
  const rawSave = localStorage.getItem(SAVE_KEY);
  if (!rawSave) return null;

  try {
    const parsed = JSON.parse(rawSave) as SaveData;
    return Array.isArray(parsed.animals)
      ? parsed.animals.map(migrateAnimal)
      : null;
  } catch {
    return null;
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function renderPhenotype(phenotype: Record<string, unknown>): string {
  return Object.entries(phenotype)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`)
    .join("");
}

function renderGenotype(genotype: Genotype): string {
  const loci = genotype?.loci ?? {};

  if (Object.keys(loci).length === 0) {
    return "<p>No genotype loci stored for this saved animal.</p>";
  }

  return `
    <ul>
      ${Object.entries(loci)
        .map(
          ([locus, pair]) =>
            `<li><strong>${locus}:</strong> ${pair.maternal} / ${pair.paternal}</li>`
        )
        .join("")}
    </ul>
  `;
}

function findAnimalById(animals: Animal[], id: string | null): Animal | null {
  if (!id) return null;
  return animals.find((animal) => animal.id === id) ?? null;
}

function renderPedigree(animal: Animal, animals: Animal[], depth = 0, maxDepth = 3): string {
  const indent = "&nbsp;".repeat(depth * 4);
  const label = `${indent}${depth === 0 ? "" : "└─ "}${animal.name} (${animal.speciesId})`;

  if (depth >= maxDepth) {
    return `<div>${label}</div>`;
  }

  const mother = findAnimalById(animals, animal.motherId);
  const father = findAnimalById(animals, animal.fatherId);

  if (!mother && !father) {
    return `<div>${label}</div>`;
  }

  return `
    <div>${label}</div>
    ${
      mother
        ? renderPedigree(mother, animals, depth + 1, maxDepth)
        : `<div>${indent}&nbsp;&nbsp;&nbsp;&nbsp;└─ Unknown mother</div>`
    }
    ${
      father
        ? renderPedigree(father, animals, depth + 1, maxDepth)
        : `<div>${indent}&nbsp;&nbsp;&nbsp;&nbsp;└─ Unknown father</div>`
    }
  `;
}

function renderAnimal(animal: Animal, animals: Animal[]): string {
  return `
    <article>
      <h4>${animal.name}</h4>
      <p><strong>ID:</strong> ${animal.id}</p>
      <p><strong>Species ID:</strong> ${animal.speciesId}</p>
      <p><strong>Generation:</strong> ${animal.generation}</p>
      <p><strong>Mother:</strong> ${animal.motherName ?? "Founder"}</p>
      <p><strong>Father:</strong> ${animal.fatherName ?? "Founder"}</p>
      <p><strong>Inbreeding Coefficient:</strong> ${animal.inbreedingCoefficient ?? 0}</p>
      <p><strong>Inbreeding Tier:</strong> ${animal.inbreedingTier ?? "none"}</p>
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
      <p><strong>Founder IDs:</strong> ${
        animal.ancestry?.founderIds?.length
          ? animal.ancestry.founderIds.join(", ")
          : "Unknown"
      }</p>

      <details>
        <summary>Genotype</summary>
        ${renderGenotype(animal.genotype)}
      </details>

      <details>
        <summary>Phenotype</summary>
        <ul>${renderPhenotype(animal.phenotype)}</ul>
      </details>

      <details>
        <summary>Pedigree</summary>
        <div style="font-family: monospace;">
          ${renderPedigree(animal, animals)}
        </div>
      </details>
    </article>
  `;
}

function renderAnimalOptions(animals: Animal[]): string {
  return animals
    .map((animal) => `<option value="${animal.id}">${animal.name} — ${animal.speciesId}</option>`)
    .join("");
}

function getUniqueSpecies(animals: Animal[]): string[] {
  return Array.from(new Set(animals.map((animal) => animal.speciesId))).sort();
}

function getUniqueGenerations(animals: Animal[]): number[] {
  return Array.from(new Set(animals.map((animal) => animal.generation))).sort(
    (a, b) => a - b
  );
}

function applyKennelFilters(animals: Animal[], filters: KennelFilters): Animal[] {
  let result = [...animals];

  const search = filters.search.trim().toLowerCase();

  if (search) {
    result = result.filter(
      (animal) =>
        animal.name.toLowerCase().includes(search) ||
        animal.speciesId.toLowerCase().includes(search) ||
        animal.id.toLowerCase().includes(search) ||
        (animal.inbreedingTier ?? "none").toLowerCase().includes(search)
    );
  }

  if (filters.species !== "all") {
    result = result.filter((animal) => animal.speciesId === filters.species);
  }

  if (filters.generation !== "all") {
    const generation = Number(filters.generation);
    result = result.filter((animal) => animal.generation === generation);
  }

  result.sort((a, b) => {
    if (filters.sort === "generation") return b.generation - a.generation;
    if (filters.sort === "fertility") return b.stats.fertility - a.stats.fertility;
    if (filters.sort === "stability") return b.stats.stability - a.stats.stability;
    if (filters.sort === "mutations") return b.genome.M.length - a.genome.M.length;
    return a.name.localeCompare(b.name);
  });

  return result;
}

function renderSpeciesFilterOptions(animals: Animal[], selected: string): string {
  return [
    `<option value="all" ${selected === "all" ? "selected" : ""}>All Species</option>`,
    ...getUniqueSpecies(animals).map(
      (speciesId) =>
        `<option value="${speciesId}" ${
          selected === speciesId ? "selected" : ""
        }>${speciesId}</option>`
    ),
  ].join("");
}

function renderGenerationFilterOptions(animals: Animal[], selected: string): string {
  return [
    `<option value="all" ${selected === "all" ? "selected" : ""}>All Generations</option>`,
    ...getUniqueGenerations(animals).map(
      (generation) =>
        `<option value="${generation}" ${
          selected === String(generation) ? "selected" : ""
        }>Generation ${generation}</option>`
    ),
  ].join("");
}

function renderApp(
  species: any,
  traits: any,
  breedingRules: any,
  mutations: any,
  animals: Animal[],
  latestOffspring: Animal | null = null,
  latestCompatibility: any = null,
  selectedMode: BreedMode = "realistic",
  saveStatus = "Loaded.",
  filters: KennelFilters = DEFAULT_FILTERS
) {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  const activeFilters = filters ?? DEFAULT_FILTERS;
  const visibleAnimals = applyKennelFilters(animals, activeFilters);

  app.innerHTML = `
    <h1>Canidae: Lineages</h1>
    <h2>Architecture Lock 0A - Genotype / Phenotype / Ancestry Foundation</h2>

    <section>
      <p><strong>Species Loaded:</strong> ${species.canids?.length ?? "Unknown"}</p>
      <p><strong>Trait Categories:</strong> ${Object.keys(traits.categories ?? {}).length}</p>
      <p><strong>Breeding Rules:</strong> ${breedingRules ? "Loaded" : "Missing"}</p>
      <p><strong>Mutation Catalog:</strong> ${
        mutations.mutations?.length ?? "Unknown"
      } mutations loaded</p>
      <p><strong>Animals in Kennel:</strong> ${animals.length}</p>
      <p><strong>Visible Animals:</strong> ${visibleAnimals.length}</p>
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
      <select id="parentA">${renderAnimalOptions(animals)}</select>

      <br /><br />

      <label for="parentB">Parent B</label><br />
      <select id="parentB">${renderAnimalOptions(animals)}</select>

      <br /><br />

      <label for="mode">Mode</label><br />
      <select id="mode">
        <option value="realistic" ${selectedMode === "realistic" ? "selected" : ""}>Realistic</option>
        <option value="sandbox" ${selectedMode === "sandbox" ? "selected" : ""}>Sandbox</option>
      </select>

      <br /><br />

      <button id="breedButton">Breed Selected Parents</button>
    </section>

    <hr />

    <section>
      <h3>Kennel Management</h3>

      <label for="searchInput">Search</label><br />
      <input id="searchInput" type="text" value="${activeFilters.search}" placeholder="Search name, species, ID, or inbreeding tier" />

      <br /><br />

      <label for="speciesFilter">Species</label><br />
      <select id="speciesFilter">
        ${renderSpeciesFilterOptions(animals, activeFilters.species)}
      </select>

      <br /><br />

      <label for="generationFilter">Generation</label><br />
      <select id="generationFilter">
        ${renderGenerationFilterOptions(animals, activeFilters.generation)}
      </select>

      <br /><br />

      <label for="sortFilter">Sort</label><br />
      <select id="sortFilter">
        <option value="name" ${activeFilters.sort === "name" ? "selected" : ""}>Name A-Z</option>
        <option value="generation" ${activeFilters.sort === "generation" ? "selected" : ""}>Generation High-Low</option>
        <option value="fertility" ${activeFilters.sort === "fertility" ? "selected" : ""}>Fertility High-Low</option>
        <option value="stability" ${activeFilters.sort === "stability" ? "selected" : ""}>Stability High-Low</option>
        <option value="mutations" ${activeFilters.sort === "mutations" ? "selected" : ""}>Mutation Count High-Low</option>
      </select>

      <br /><br />

      <button id="applyFiltersButton">Apply Filters</button>
      <button id="clearFiltersButton">Clear Filters</button>
    </section>

    <hr />

    <section>
      <h3>Latest Compatibility / Litter / Inbreeding Info</h3>
      <pre>${JSON.stringify(latestCompatibility, null, 2)}</pre>
    </section>

    <section>
      <h3>Latest Offspring</h3>
      ${latestOffspring ? renderAnimal(latestOffspring, animals) : "<p>No offspring generated yet.</p>"}
    </section>

    <hr />

    <section>
      <h3>Kennel</h3>
      ${visibleAnimals.map((animal) => renderAnimal(animal, animals)).join("")}
    </section>
  `;

  const parentASelect = document.querySelector<HTMLSelectElement>("#parentA");
  const parentBSelect = document.querySelector<HTMLSelectElement>("#parentB");
  const modeSelect = document.querySelector<HTMLSelectElement>("#mode");
  const breedButton = document.querySelector<HTMLButtonElement>("#breedButton");
  const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
  const resetButton = document.querySelector<HTMLButtonElement>("#resetButton");

  const searchInput = document.querySelector<HTMLInputElement>("#searchInput");
  const speciesFilter = document.querySelector<HTMLSelectElement>("#speciesFilter");
  const generationFilter = document.querySelector<HTMLSelectElement>("#generationFilter");
  const sortFilter = document.querySelector<HTMLSelectElement>("#sortFilter");
  const applyFiltersButton = document.querySelector<HTMLButtonElement>("#applyFiltersButton");
  const clearFiltersButton = document.querySelector<HTMLButtonElement>("#clearFiltersButton");

  if (
    !parentASelect ||
    !parentBSelect ||
    !modeSelect ||
    !breedButton ||
    !saveButton ||
    !resetButton ||
    !searchInput ||
    !speciesFilter ||
    !generationFilter ||
    !sortFilter ||
    !applyFiltersButton ||
    !clearFiltersButton
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
      "Kennel saved.",
      activeFilters
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
      "realistic",
      "Save reset. Founder kennel restored.",
      DEFAULT_FILTERS
    );
  });

  applyFiltersButton.addEventListener("click", () => {
    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      saveStatus,
      {
        search: searchInput.value,
        species: speciesFilter.value,
        generation: generationFilter.value,
        sort: sortFilter.value as SortMode,
      }
    );
  });

  clearFiltersButton.addEventListener("click", () => {
    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      saveStatus,
      DEFAULT_FILTERS
    );
  });

  breedButton.addEventListener("click", () => {
    const parentA = animals.find((animal) => animal.id === parentASelect.value);
    const parentB = animals.find((animal) => animal.id === parentBSelect.value);
    const mode = modeSelect.value as BreedMode;

    if (!parentA || !parentB) return;

    const compatibility = resolveCompatibility(parentA, parentB, species);
    const inbreeding = calculateInbreeding(parentA, parentB, animals);

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
          inbreeding,
          blocked: true,
          blockedReason: "This pairing is blocked in Realistic Mode. Try Sandbox Mode.",
        },
        mode,
        saveStatus,
        activeFilters
      );
      return;
    }

    const litter = createLitter(parentA, parentB, compatibility, mutations, animals);

    litter.forEach((pup) => animals.push(pup));

    saveAnimals(animals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      animals,
      litter[litter.length - 1] ?? null,
      {
        ...compatibility,
        litterSize: litter.length,
        inbreeding,
      },
      mode,
      `Litter generated (${litter.length} pups) and kennel auto-saved.`,
      activeFilters
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
      "realistic",
      "Loaded.",
      DEFAULT_FILTERS
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