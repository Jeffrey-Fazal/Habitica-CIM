# Habitica Proxy for ChatGPT Actions

## Description
This project sets up a **Cloudflare Worker proxy** to allow **ChatGPT Actions** to interact with the **Habitica API**. Habitica requires authentication via headers (`x-api-user` and `x-api-key`), but **ChatGPT Actions only support one header or OAuth**. To work around this, we use a Cloudflare Worker to forward authenticated requests from ChatGPT to Habitica.

## Instructions
### 1. Get Your Habitica User ID and API Key
To use this proxy, you’ll need your **User ID** and **API Key** from Habitica.
- Go to **Habitica**
- Navigate to **Settings > Site Data**
- Copy your **User ID** and **API Key**
- **⚠️ Keep this information safe!** Do not share it publicly.

### 2. Understanding the Habitica API
- Official API documentation: [https://habitica.com/apidoc/](https://habitica.com/apidoc/)
- Community-maintained OpenAPI spec (may be outdated): [https://github.com/igromanru/habitica-api/blob/master/openapi.yaml](https://github.com/igromanru/habitica-api/blob/master/openapi.yaml)

### 3. Deploy a Cloudflare Worker
You need a **Cloudflare Workers** account. Cloudflare has a **free tier** with reasonable limits.

#### Steps:
1. **Create a new Worker** in Cloudflare
2. **Set up environment variables**
   - `habiticaUserId`: Your Habitica User ID
   - `HhabiticaApiKey`: Your Habitica API Key
   - `API_KEY`: The authentication key that will be required by ChatGPT (`X-Auth-Key`)
3. **Deploy the Worker** with the provided `index.js` script

### 4. How the Proxy Works (Pseudocode)
```plaintext
- ChatGPT makes a request with `X-Auth-Key` to the Cloudflare Worker
- Worker checks if `X-Auth-Key` is valid
  - If invalid: return `401 Unauthorized`
- If valid, Worker adds `x-api-user` and `x-api-key` headers
- Worker forwards the request to the Habitica API
- Habitica API responds
- Worker relays the response back to ChatGPT
```
📌 **Full code can be found in `index.js`**

### 5. Create a ChatGPT Action
ChatGPT needs an **Action** that uses the OpenAPI spec provided in `Actions.md`.

#### High-Level Explanation
- The `Actions.md` file defines how ChatGPT interacts with Habitica via the proxy.
- You will need to **create an Action** in your **Custom GPT** using the OpenAPI spec.
- The API call to `https://habitica-proxy-<your-worker>.workers.dev/tasks/user` will retrieve your Habitica tasks.

### 6. Testing & Troubleshooting
✅ **To test:**
- Use Postman or cURL to call `https://habitica-proxy-<your-worker>.workers.dev/tasks/user`
- Ensure you provide the `X-Auth-Key` header

🚨 **Common Issues:**
- **401 Unauthorized?** Check that `X-Auth-Key` matches the value in your Cloudflare Worker.
- **Invalid Habitica credentials?** Ensure `HABITICA_USER_ID` and `HABITICA_API_KEY` are correct.
- **Requests not forwarding?** Check the Cloudflare Worker logs.

Once everything is set up correctly, you should be able to retrieve and manage Habitica tasks using ChatGPT Actions!

### Log

- Commit updated wranger has get tasks and delete tasks working. Update tasks and create tasks are not working
- Testing api methods
- Server and Open API / Actions have now been setup

## API Docs:
--- 
https://habitica.com/apidoc/#api-Task-CreateUserTasks
https://habitica.com/apidoc/#api-Task-GetUserTasks
https://habitica.com/apidoc/#api-Task-UpdateTask
https://habitica.com/apidoc/#api-Task-DeleteTask