"use client";

import { useState } from "react";
import { Mention, AiAnalysis } from "@/types";

export default function MentionsList({ userId }: { userId: string }) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
}
