import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/lib/contracts/generated.ts",
  plugins: [
    foundry({
      project: "contracts",
      include: [
        "CompetitionEscrow.sol/CompetitionEscrow.json",
        "CompetitionEscrowFactory.sol/CompetitionEscrowFactory.json",
      ],
    }),
    react(),
  ],
});
