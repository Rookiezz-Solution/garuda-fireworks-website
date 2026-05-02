import { createClient } from "@supabase/supabase-js";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

export const uploadImage = async (file) => {
  const fileExt =
    file?.originalname?.split(".").pop()?.toLowerCase() ||
    file?.mimetype?.split("/")?.[1]?.toLowerCase() ||
    "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(fileExt) ? fileExt : "jpg";

  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${safeExt}`;

  const { error } = await supabase.storage.from(process.env.SUPABASE_BUCKET).upload(fileName, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

export const deleteImage = async (imageUrl) => {
  try {
    const marker = `/${process.env.SUPABASE_BUCKET}/`;
    const idx = String(imageUrl || "").indexOf(marker);
    if (idx === -1) return;
    const path = String(imageUrl).slice(idx + marker.length);
    if (!path) return;
    await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([path]);
  } catch (err) {
    console.error("Delete failed:", err);
  }
};
