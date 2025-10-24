export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

export function handleCorsPreFlight(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function errorResponse(error: string, status: number = 400): Response {
  return jsonResponse({ error }, status);
}
