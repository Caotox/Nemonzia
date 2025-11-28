import { db } from "../server/db";
import { champions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateZaahen() {
  console.log("Updating Zahen to Zaahen...");
  
  try {
    // Supprimer l'ancien Zahen
    await db.delete(champions).where(eq(champions.id, "Zahen"));
    console.log("✓ Deleted old Zahen entry");
    
    // Ajouter Zaahen avec une image placeholder générique
    const zaahenData = {
      id: "Zaahen",
      name: "Zaahen",
      imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Yone.png", // Placeholder temporaire
      key: "893",
      roles: ["TOP", "MID"]
    };
    
    await db.insert(champions).values(zaahenData);
    
    console.log("✅ Zaahen successfully added!");
    console.log(`   - ID: ${zaahenData.id}`);
    console.log(`   - Name: ${zaahenData.name}`);
    console.log(`   - Roles: ${zaahenData.roles.join(", ")}`);
    console.log(`   - Image: ${zaahenData.imageUrl} (placeholder)`);
    console.log("\n⚠️  Note: L'image est un placeholder. Remplacez-la manuellement quand l'image officielle sera disponible.");
    
  } catch (error) {
    console.error("❌ Error updating Zaahen:", error);
    throw error;
  }
  
  process.exit(0);
}

updateZaahen().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
