import { getStore } from "@netlify/blobs";

const ADMIN_KEY = 'CV!vxUCQvr*p47xNX@ZB';

export default async (req, context) => {
  const store = getStore("books");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    if (req.method === "GET") {
      const data = await store.get("library", { type: "json" });
      return new Response(JSON.stringify(data || { books: [] }), { headers });
    }

    if (req.method === "POST") {
      // Verify admin authorization
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");
      
      if (token !== ADMIN_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers
        });
      }

      const body = await req.json();
      await store.setJSON("library", body);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
};

export const config = {
  path: "/api/books"
};
