export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Retrieve the custom authentication header
    const authKey = req.headers['auth_key'];

    if (!authKey || authKey !== process.env.auth_key) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract Habitica credentials from environment variables
    const habiticaUserId = process.env.HABITICA_USER_ID;
    const habiticaApiKey = process.env.HABITICA_API_KEY;

    // Prepare headers for Habitica API
    const headers = new Headers();
    headers.append("x-api-user", habiticaUserId);
    headers.append("x-api-key", habiticaApiKey);
    headers.append("Content-Type", "application/json");

    // Forward request to Habitica API
    const habiticaResponse = await fetch(`https://habitica.com/api/v3/tasks/user`, {
        method: req.method,
        headers,
    });

    const responseData = await habiticaResponse.json();

    return res.status(habiticaResponse.status).json(responseData);
}
