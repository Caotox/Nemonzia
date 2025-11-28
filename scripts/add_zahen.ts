import { db } from "../server/db";
import { champions } from "../shared/schema";

async function addZahen() {
  console.log("Adding Zahen champion...");
  
  try {
    // Image URL officielle de Riot pour Zahen (à venir)
    // Pour l'instant, on utilise l'URL du patch 15.1
    const zahenData = {
      id: "Zahen",
      name: "Zahen",
      imageUrl: "https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/Zahen.png",
      key: "893", // Key temporaire
      roles: ["TOP", "MID"] // Rôles de Zahen basés sur son kit
    };
    
    // Vérifier si Zahen existe déjà
    const existingChampions = await db.select().from(champions);
    const zahenExists = existingChampions.some(c => c.id === "Zahen");
    
    if (zahenExists) {
      console.log("❌ Zahen already exists in database");
      return;
    }
    
    // Ajouter Zahen
    await db.insert(champions).values(zahenData);
    
    console.log("✅ Zahen successfully added!");
    console.log(`   - ID: ${zahenData.id}`);
    console.log(`   - Name: ${zahenData.name}`);
    console.log(`   - Roles: ${zahenData.roles.join(", ")}`);
    console.log(`   - Image: ${zahenData.imageUrl}`);
    
  } catch (error) {
    console.error("❌ Error adding Zahen:", error);
    throw error;
  }
  
  process.exit(0);
}

addZahen().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
