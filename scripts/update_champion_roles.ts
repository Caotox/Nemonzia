import { db } from "../server/db";
import { champions } from "../shared/schema";
import { eq } from "drizzle-orm";

const championRoles: Record<string, string[]> = {
  "Aatrox": ["TOP"],
  "Ahri": ["MID"],
  "Akali": ["MID", "TOP"],
  "Akshan": ["MID", "ADC"],
  "Alistar": ["SUP"],
  "Amumu": ["JGL", "SUP"],
  "Anivia": ["MID"],
  "Annie": ["MID", "SUP"],
  "Aphelios": ["ADC"],
  "Ashe": ["ADC", "SUP"],
  "AurelionSol": ["MID"],
  "Azir": ["MID"],
  "Bard": ["SUP"],
  "Belveth": ["JGL"],
  "Blitzcrank": ["SUP"],
  "Brand": ["SUP", "MID"],
  "Braum": ["SUP"],
  "Briar": ["JGL"],
  "Caitlyn": ["ADC"],
  "Camille": ["TOP", "JGL"],
  "Cassiopeia": ["MID"],
  "Chogath": ["TOP", "MID"],
  "Corki": ["MID", "ADC"],
  "Darius": ["TOP"],
  "Diana": ["JGL", "MID"],
  "Draven": ["ADC"],
  "DrMundo": ["TOP", "JGL"],
  "Ekko": ["JGL", "MID"],
  "Elise": ["JGL"],
  "Evelynn": ["JGL"],
  "Ezreal": ["ADC", "MID"],
  "Fiddlesticks": ["JGL", "SUP"],
  "Fiora": ["TOP"],
  "Fizz": ["MID"],
  "Galio": ["MID", "SUP"],
  "Gangplank": ["TOP", "MID"],
  "Garen": ["TOP"],
  "Gnar": ["TOP"],
  "Gragas": ["JGL", "TOP", "SUP"],
  "Graves": ["JGL"],
  "Gwen": ["TOP", "JGL"],
  "Hecarim": ["JGL"],
  "Heimerdinger": ["MID", "TOP", "SUP"],
  "Hwei": ["MID", "SUP"],
  "Illaoi": ["TOP"],
  "Irelia": ["TOP", "MID"],
  "Ivern": ["JGL"],
  "Janna": ["SUP"],
  "JarvanIV": ["JGL", "TOP"],
  "Jax": ["TOP", "JGL"],
  "Jayce": ["TOP", "MID"],
  "Jhin": ["ADC"],
  "Jinx": ["ADC"],
  "Kaisa": ["ADC"],
  "Kalista": ["ADC"],
  "Karma": ["SUP", "MID"],
  "Karthus": ["JGL", "MID"],
  "Kassadin": ["MID"],
  "Katarina": ["MID"],
  "Kayle": ["TOP", "MID"],
  "Kayn": ["JGL"],
  "Kennen": ["TOP", "MID"],
  "Khazix": ["JGL"],
  "Kindred": ["JGL"],
  "Kled": ["TOP"],
  "KogMaw": ["ADC", "MID"],
  "KSante": ["TOP"],
  "Leblanc": ["MID"],
  "LeeSin": ["JGL"],
  "Leona": ["SUP"],
  "Lillia": ["JGL", "TOP"],
  "Lissandra": ["MID"],
  "Lucian": ["ADC", "MID"],
  "Lulu": ["SUP"],
  "Lux": ["SUP", "MID"],
  "Malphite": ["TOP", "SUP"],
  "Malzahar": ["MID"],
  "Maokai": ["SUP", "TOP", "JGL"],
  "MasterYi": ["JGL"],
  "Milio": ["SUP"],
  "MissFortune": ["ADC"],
  "MonkeyKing": ["JGL", "TOP"],
  "Mordekaiser": ["TOP"],
  "Morgana": ["SUP", "JGL"],
  "Naafiri": ["MID"],
  "Nami": ["SUP"],
  "Nasus": ["TOP"],
  "Nautilus": ["SUP"],
  "Neeko": ["MID", "SUP", "TOP"],
  "Nidalee": ["JGL"],
  "Nilah": ["ADC"],
  "Nocturne": ["JGL"],
  "Nunu": ["JGL"],
  "Olaf": ["JGL", "TOP"],
  "Orianna": ["MID"],
  "Ornn": ["TOP"],
  "Pantheon": ["SUP", "MID", "TOP"],
  "Poppy": ["JGL", "TOP", "SUP"],
  "Pyke": ["SUP"],
  "Qiyana": ["MID", "JGL"],
  "Quinn": ["TOP"],
  "Rakan": ["SUP"],
  "Rammus": ["JGL"],
  "RekSai": ["JGL"],
  "Rell": ["SUP"],
  "Renata": ["SUP"],
  "Renekton": ["TOP"],
  "Rengar": ["JGL", "TOP"],
  "Riven": ["TOP"],
  "Rumble": ["TOP", "MID"],
  "Ryze": ["MID"],
  "Samira": ["ADC"],
  "Sejuani": ["JGL"],
  "Senna": ["SUP", "ADC"],
  "Seraphine": ["SUP", "MID"],
  "Sett": ["TOP", "SUP"],
  "Shaco": ["JGL", "SUP"],
  "Shen": ["TOP", "SUP"],
  "Shyvana": ["JGL"],
  "Singed": ["TOP"],
  "Sion": ["TOP", "SUP"],
  "Sivir": ["ADC"],
  "Skarner": ["JGL"],
  "Smolder": ["ADC"],
  "Sona": ["SUP"],
  "Soraka": ["SUP"],
  "Swain": ["SUP", "MID", "TOP"],
  "Sylas": ["MID", "JGL", "TOP"],
  "Syndra": ["MID"],
  "TahmKench": ["TOP", "SUP"],
  "Taliyah": ["JGL", "MID"],
  "Talon": ["MID", "JGL"],
  "Taric": ["SUP"],
  "Teemo": ["TOP"],
  "Thresh": ["SUP"],
  "Tristana": ["ADC"],
  "Trundle": ["JGL", "TOP", "SUP"],
  "Tryndamere": ["TOP"],
  "TwistedFate": ["MID"],
  "Twitch": ["ADC", "JGL"],
  "Udyr": ["JGL", "TOP"],
  "Urgot": ["TOP"],
  "Varus": ["ADC", "MID"],
  "Vayne": ["ADC", "TOP"],
  "Veigar": ["MID"],
  "Velkoz": ["SUP", "MID"],
  "Vex": ["MID"],
  "Vi": ["JGL"],
  "Viego": ["JGL"],
  "Viktor": ["MID"],
  "Vladimir": ["MID", "TOP"],
  "Volibear": ["JGL", "TOP"],
  "Warwick": ["JGL", "TOP"],
  "Xayah": ["ADC"],
  "Xerath": ["MID", "SUP"],
  "XinZhao": ["JGL"],
  "Yasuo": ["MID", "TOP"],
  "Yone": ["MID", "TOP"],
  "Yorick": ["TOP"],
  "Yuumi": ["SUP"],
  "Zac": ["JGL", "TOP"],
  "Zed": ["MID"],
  "Zeri": ["ADC"],
  "Ziggs": ["MID", "ADC"],
  "Zilean": ["SUP", "MID"],
  "Zoe": ["MID"],
  "Zyra": ["SUP", "MID"]
};

async function updateChampionRoles() {
  console.log("Starting champion roles update...");
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundChampions: string[] = [];
  
  for (const [championId, roles] of Object.entries(championRoles)) {
    try {
      const result = await db
        .update(champions)
        .set({ roles })
        .where(eq(champions.id, championId))
        .returning();
      
      if (result.length > 0) {
        updatedCount++;
        console.log(`Updated ${championId}: ${roles.join(", ")}`);
      } else {
        notFoundCount++;
        notFoundChampions.push(championId);
        console.log(`Champion not found: ${championId}`);
      }
    } catch (error) {
      console.error(`Error updating ${championId}:`, error);
    }
  }
  
  console.log("\n=== Summary ===");
  console.log(`Total champions in data: ${Object.keys(championRoles).length}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Not found: ${notFoundCount}`);
  
  if (notFoundChampions.length > 0) {
    console.log("\nChampions not found in database:");
    console.log(notFoundChampions.join(", "));
  }
  
  process.exit(0);
}

updateChampionRoles().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
