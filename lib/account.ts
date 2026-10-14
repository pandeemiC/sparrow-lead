import { getDb } from "@/lib/db";

// removes everything sparrow stores for a user. mentions go with their
// keywords through the cascade. safe to run twice, the webhook may repeat it
export async function deleteUserData(userId: string) {
  const sql = getDb();
  await sql.transaction([
    sql`DELETE FROM keywords WHERE user_id = ${userId}`,
    sql`DELETE FROM users WHERE user_id = ${userId}`,
  ]);
}
