import prisma from "../lib/prisma.js";

function safeJson(value) {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(
      JSON.stringify(value, (_, current) =>
        typeof current === "bigint" ? current.toString() : current
      )
    );
  } catch {
    return { value: String(value) };
  }
}

export async function writeAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  before = null,
  after = null,
  metadata = null,
  tx = prisma,
}) {
  return tx.auditLog.create({
    data: {
      userId: userId || null,
      action: String(action),
      entityType: String(entityType),
      entityId: entityId || null,
      beforeJson: safeJson(before),
      afterJson: safeJson(after),
      metadata: safeJson(metadata),
    },
  });
}
