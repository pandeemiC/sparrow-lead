import { task } from "@trigger.dev/sdk";
import { scanUser } from "./scanUser";
import type { Payload } from "@/types";

export const autoScanTask = task({
  id: "auto-scan",
  maxDuration: 300,
  run: async (payload: Payload) => {
    const { found } = await scanUser(payload.userId);
    return { totalFound: found };
  },
});
