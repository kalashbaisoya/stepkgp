import { syncGujaratStartupPoliciesFromWeb } from "../src/modules/search/policies-service";

async function main() {
  console.log("Starting Method 1 & Method 2 Gujarat Startup Policies & SOPs sync...");
  const result = await syncGujaratStartupPoliciesFromWeb();
  console.log("Sync complete!", result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sync script failed:", err);
    process.exit(1);
  });
