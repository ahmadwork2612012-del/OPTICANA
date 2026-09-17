const EXTRA_FIELDS_RE = /<!--OPTICANA_EXTRA_FIELDS:([\s\S]*?)-->/i;

export function parseProductDescription(description = "") {
  const source = String(description || "");
  const match = source.match(EXTRA_FIELDS_RE);
  if (!match) return { description: source.trim(), extraFields: [] };
  let extraFields = [];
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (Array.isArray(parsed)) {
      extraFields = parsed.map((field,index)=>({id:String(field?.id||`extra-${index}`),label:String(field?.label||"").trim(),value:String(field?.value||"").trim()})).filter(field=>field.label&&field.value);
    }
  } catch { extraFields = []; }
  return { description: source.replace(match[0], "").trim(), extraFields };
}

export function serializeProductDescription(description = "", extraFields = []) {
  const cleanDescription = String(description || "").replace(EXTRA_FIELDS_RE, "").trim();
  const normalized = (Array.isArray(extraFields) ? extraFields : []).map((field,index)=>({id:String(field?.id||`extra-${index}`),label:String(field?.label||"").trim(),value:String(field?.value||"").trim()})).filter(field=>field.label&&field.value);
  if (!normalized.length) return cleanDescription;
  const marker = `<!--OPTICANA_EXTRA_FIELDS:${encodeURIComponent(JSON.stringify(normalized))}-->`;
  return cleanDescription ? `${cleanDescription}\n\n${marker}` : marker;
}

export function createEmptyProductExtraField(index = 0) {
  return { id:`extra-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`, label:"", value:"" };
}
