const ADMIN_KEY = 'CV!vxUCQvr*p47xNX@ZB';

export async function onRequest(context) {
  const { request, env } = context;
  
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    if (request.method === "GET") {
      const data = await env.BOOKS_KV.get("library", { type: "json" });
      return new Response(JSON.stringify(data || { books: [] }), { headers });
    }

    if (request.method === "POST") {
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");
      
      if (token !== ADMIN_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers
        });
      }

      const body = await request.json();
      await env.BOOKS_KV.put("library", JSON.stringify(body));
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
}
