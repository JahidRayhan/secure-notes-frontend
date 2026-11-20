export const fmt = (d) => new Date(d).toLocaleString();
export const parseInterests = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
export const isObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(s);
