// src/lib/supabase.js

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/product_page?select=*&is_active=eq.true`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) throw new Error("Kunne ikke hente produkter");

  const rows = await res.json();

  const productsMap = new Map();

  for (const row of rows) {
    if (!productsMap.has(row.product_id)) {
      productsMap.set(row.product_id, {
        id: row.product_id,
        name: row.product_name,
        slug: row.product_slug,
        price: row.price,
        currency: row.currency,
        features: row.features ?? [],
        description: row.description,
        material: row.material,
        size_guide: row.size_guide,
        delivery: row.delivery,
        returns: row.returns,
        categories: [],
        colors: new Map(),
        images: [],
      });
    }

    const product = productsMap.get(row.product_id);

    // Kategorier
    if (row.category_id && !product.categories.find((c) => c.id === row.category_id)) {
      product.categories.push({
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      });
    }

    // Farver og størrelser
    if (row.color_id) {
      if (!product.colors.has(row.color_id)) {
        product.colors.set(row.color_id, {
          id: row.color_id,
          name: row.color_name,
          hex: row.color_hex,
          sort_order: row.color_sort_order,
          sizes: [],
        });
      }
      if (row.size_label) {
        const color = product.colors.get(row.color_id);
        if (!color.sizes.find((s) => s.id === row.size_id)) {
          color.sizes.push({
            id: row.size_id,
            label: row.size_label,
            sort_order: row.size_sort_order,
          });
        }
      }
    }

    // Billeder
    if (row.storage_path && !product.images.find((i) => i.storage_path === row.storage_path)) {
      product.images.push({
        storage_path: row.storage_path,
        alt_text: row.alt_text,
        sort_order: row.image_sort_order,
        is_primary: row.image_is_primary,
        color_id: row.color_id,
      });
    }
  }

  return Array.from(productsMap.values()).map((p) => ({
    ...p,
    colors: Array.from(p.colors.values())
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((color) => ({
        ...color,
        sizes: color.sizes.sort((a, b) => a.sort_order - b.sort_order),
      })),
    images: p.images.sort((a, b) => a.sort_order - b.sort_order),
  }));
}

// storage_path är redan en full URL
export function getImageUrl(storagePath) {
  return storagePath;
}
