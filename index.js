export default {
	async fetch(request, env) {
	  // Retrieve the custom authentication header
	  const authHeader = request.headers.get("X-Auth-Key");
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
  
	  // Prepare fetch options
	  const fetchOptions = {
		method: request.method,
		headers: modifiedHeaders,
	  };
  
	  // Forward the request body for non-GET/HEAD requests
	  if (!["GET", "HEAD"].includes(request.method)) {
		// You can use request.body directly, or convert it to text if needed.
		// Here, we use await request.text() to ensure the body is captured.
		fetchOptions.body = JSON.stringify(await request.json());
	  }
  
	  // Forward the request to Habitica
	  const habiticaResponse = await fetch(habiticaUrl, fetchOptions);
	  const responseData = await habiticaResponse.json();
  
	  return new Response(JSON.stringify(responseData), {
		status: habiticaResponse.status,
		headers: { "Content-Type": "application/json" },
	  });
	},
  };
  