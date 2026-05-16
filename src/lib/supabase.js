// src/lib/supabase.js

const SUPABASE_URL = "https://uzjprnzrritimokvzoyj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Vm_-WFws5OtBbopfyOJDdA_UZtG4LeT";

export async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/product_page?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `sb_publishable_Vm_-WFws5OtBbopfyOJDdA_UZtG4LeT`,
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
        sort_order: row.product_sort_order ?? 0,
        categories: [],
        colors: new Map(),
        images: [],
        friends_images: [],
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
      if (row.size_id) {
        const color = product.colors.get(row.color_id);
        if (!color.sizes.find((s) => s.id === row.size_id)) {
          color.sizes.push({
            id: row.size_id,
            label: row.size_label,
            sort_order: row.size_sort_order,
            in_stock: row.in_stock,
          });
        }
      }
    }

    // Produktbilleder
    if (row.storage_path && row.image_color_id && !product.images.find((i) => i.storage_path === row.storage_path)) {
      product.images.push({
        storage_path: row.storage_path,
        alt_text: row.alt_text,
        color_id: row.image_color_id,
      });
    }
  }

  // Hent friends of boom billeder
  const friendsRes = await fetch(`${SUPABASE_URL}/rest/v1/product_friends_images?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (friendsRes.ok) {
    const friendsRows = await friendsRes.json();
    for (const row of friendsRows) {
      const product = productsMap.get(row.product_id);
      if (product) {
        product.friends_images.push({
          storage_path: row.storage_path,
          alt_text: row.alt_text,
          sort_order: row.sort_order,
        });
      }
    }
  }

  return Array.from(productsMap.values())
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      ...p,
      colors: Array.from(p.colors.values())
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((color) => ({
          ...color,
          sizes: color.sizes.sort((a, b) => a.sort_order - b.sort_order),
        })),
      images: p.images,
      friends_images: p.friends_images.sort((a, b) => a.sort_order - b.sort_order),
    }));
}

export function getImageUrl(storagePath) {
  return storagePath;
}

export async function fetchProductsByCategory(categorySlug) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/product_page?select=*&category_slug=eq.${categorySlug}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) throw new Error("Kunne ikke hente kategori");

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
        sort_order: row.product_sort_order ?? 0,
        categories: [],
        colors: new Map(),
        images: [],
        friends_images: [],
      });
    }

    const product = productsMap.get(row.product_id);

    if (row.category_id && !product.categories.find((c) => c.id === row.category_id)) {
      product.categories.push({
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      });
    }

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
      if (row.size_id) {
        const color = product.colors.get(row.color_id);
        if (!color.sizes.find((s) => s.id === row.size_id)) {
          color.sizes.push({
            id: row.size_id,
            label: row.size_label,
            sort_order: row.size_sort_order,
            in_stock: row.in_stock,
          });
        }
      }
    }

    if (row.storage_path && row.image_color_id && !product.images.find((i) => i.storage_path === row.storage_path)) {
      product.images.push({
        storage_path: row.storage_path,
        alt_text: row.alt_text,
        color_id: row.image_color_id,
      });
    }
  }

  // Hent friends of boom billeder
  const friendsRes = await fetch(`${SUPABASE_URL}/rest/v1/product_friends_images?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (friendsRes.ok) {
    const friendsRows = await friendsRes.json();
    for (const row of friendsRows) {
      const product = productsMap.get(row.product_id);
      if (product) {
        product.friends_images.push({
          storage_path: row.storage_path,
          alt_text: row.alt_text,
          sort_order: row.sort_order,
        });
      }
    }
  }

  return Array.from(productsMap.values())
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      ...p,
      colors: Array.from(p.colors.values())
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((color) => ({
          ...color,
          sizes: color.sizes.sort((a, b) => a.sort_order - b.sort_order),
        })),
      images: p.images,
      friends_images: p.friends_images.sort((a, b) => a.sort_order - b.sort_order),
    }));
}

export async function fetchCategoryBySlug(slug) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?slug=eq.${slug}&select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) throw new Error("Kunne ikke hente kategori");
  const data = await res.json();
  return data[0] ?? null;
}
