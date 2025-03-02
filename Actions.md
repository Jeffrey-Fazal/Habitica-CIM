openapi: 3.1.0
info:
  title: Habitica Task Management API (via Secure Proxy)
  version: 1.0.0
  description: >
    This API allows managing Habitica tasks using a Cloudflare Worker proxy with
    custom API key authentication via the X-Auth-Key header.
servers:
  - url: https://habitica-proxy-misty-sun-5caa.jeffreyfazal.workers.dev
    description: Cloudflare Worker Proxy for Habitica
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Auth-Key
      description: Enter your API key to authenticate.
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          description: Task ID
        text:
          type: string
          description: The task name
        type:
          type: string
          enum: [habit, daily, todo, reward]
          description: Type of task
        notes:
          type: string
          description: Additional notes
        priority:
          type: number
          enum: [0.1, 1, 1.5, 2]
          default: 1
          description: Task difficulty (Trivial, Easy, Medium, Hard)
        completed:
          type: boolean
          description: Whether the task is completed
paths:
  /tasks/user:
    get:
      operationId: getUserTasks
      summary: Retrieve user's tasks
      description: Fetches all tasks for the user. Requires the X-Auth-Key header.
      security:
        - ApiKeyAuth: []
      responses:
        "200":
          description: List of user tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
        "401":
          description: Unauthorized, invalid or missing credentials

  /tasks/{taskId}:
    parameters:
      - in: path
        name: taskId
        required: true
        schema:
          type: string
        description: The ID of the task.
    delete:
      operationId: deleteTask
      summary: Delete a task
      description: Deletes a specific task identified by its taskId. Requires the X-Auth-Key header.
      security:
        - ApiKeyAuth: []
      responses:
        "200":
          description: Task deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Task deleted successfully."
        "401":
          description: Unauthorized, invalid or missing credentials
        "404":
          description: Task not found

    patch:
      operationId: updateTask
      summary: Update a task
      description: Update a specific task identified by its taskId. Requires the X-Auth-Key header.
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task'
      responses:
        "200":
          description: Task updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        "400":
          description: Bad Request - Invalid input data
        "401":
          description: Unauthorized, invalid or missing credentials
        "404":
          description: Task not found
