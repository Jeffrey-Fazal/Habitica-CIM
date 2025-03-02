// Deployed via GitHub https://github.com/Jeffrey-Fazal/Habitica-CIM
export default {
	async fetch(request, env) {
	  // Retrieve the custom authentication header
	  const authHeader = request.headers.get("X-Auth-Key");
	  
	  // Check if the header exists and matches the expected value stored in env.API_KEY
	  if (!authHeader || authHeader !== env.API_KEY) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
		  status: 401,
		  headers: { "Content-Type": "application/json" },
		});
	  }
	  
	  // Extract Habitica credentials from environment variables
	  const habiticaUserId = env.habiticaUserId;
	  const habiticaApiKey = env.habiticaApiKey;
	  
	  // Create new headers for forwarding to Habitica
	  const modifiedHeaders = new Headers();
	  modifiedHeaders.set("x-api-user", habiticaUserId);
	  modifiedHeaders.set("x-api-key", habiticaApiKey);
	  modifiedHeaders.set("Content-Type", "application/json");
	  
	  // Build the Habitica API URL using the request URL pathname and search parameters
	  const url = new URL(request.url);
	  const habiticaUrl = `https://habitica.com/api/v3${url.pathname}${url.search}`;
	  
	  // Forward the request to Habitica
	  const habiticaResponse = await fetch(habiticaUrl, {
		method: request.method,
		headers: modifiedHeaders,
		// If needed, forward the request body as well:
		// body: request.body,
	  });
	  
	  const responseData = await habiticaResponse.json();
	  return new Response(JSON.stringify(responseData), {
		status: habiticaResponse.status,
		headers: { "Content-Type": "application/json" },
	  });
	},
  };  