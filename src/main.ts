import "./style.css";

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
    const [species, traits, breedingRules, mutations] = await Promise.all([
      loadJson("/data/canid_compendium_starter.json"),
      loadJson("/data/trait_library_starter.json"),
      loadJson("/data/breeding_rules_starter.json"),
      loadJson("/data/MUTATION_CATALOG_V1.json"),
    ]);

    app.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Phase 2A - Sprint 1 Complete</h2>

      <p><strong>Species Loaded:</strong> ${species.canids?.length ?? "Unknown"}</p>
      <p><strong>Trait Library:</strong> Loaded</p>
      <p><strong>Breeding Rules:</strong> Loaded</p>
      <p><strong>Mutation Catalog:</strong> ${mutations.mutations?.length ?? "Unknown"} mutations loaded</p>

      <h3>Starter Roster</h3>
      <ul>
        ${(species.canids ?? [])
          .map((canid: any) => `<li>${canid.commonName} <em>${canid.scientificName}</em></li>`)
          .join("")}
      </ul>
    `;

    console.log({ species, traits, breedingRules, mutations });
  } catch (error) {
    app.innerHTML = `
      <h1>Data Load Failed</h1>
      <pre>${String(error)}</pre>
    `;
  }
}

bootstrap();