import { db } from "../server/db";
import { champions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function fixZaahenImage() {
  console.log("Fixing Zaahen image...");
  
  try {
    // Mettre à jour l'image de Zaahen avec l'image locale
    await db
      .update(champions)
      .set({ 
        imageUrl: "/zaahen.png"
      })
      .where(eq(champions.id, "Zaahen"));
    
    console.log("Zaahen image updated successfully!");
    console.log("   - Image URL: /zaahen.png");
    console.log("   - Location: client/public/zaahen.png");
    
  } catch (error) {
    console.error("Error updating Zaahen image:", error);
    throw error;
  }
  
  process.exit(0);
}

fixZaahenImage().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
