# API Documentation

Complete API reference for the Blog Post Builder application.

## Base URL

All API endpoints are relative to: `http://127.0.0.1:8000`

## Authentication

Currently, the API does not require authentication. For production use, implement authentication middleware.

## Blog Post Endpoints

### Create Blog Post

**POST** `/api/generate-post/`

Create a new blog post generation request.

**Request Body**:
```json
{
  "topic": "The Future of Artificial Intelligence",
  "subtitle": "Exploring AI trends in 2024",
  "target_audience": ["developers", "tech enthusiasts"],
  "key_points": "Machine learning, neural networks, automation",
  "examples": "ChatGPT, self-driving cars",
  "tone": "friendly",
  "length": "medium",
  "crew_config_id": 1
}
```

**Parameters**:
- `topic` (required): Main subject of the blog post
- `subtitle` (optional): Optional subtitle
- `target_audience` (optional): Array of audience tags
- `key_points` (optional): Important points to cover
- `examples` (optional): Specific examples to include
- `tone` (optional): Writing style - `friendly`, `professional`, `casual`, `formal`, `humorous`, `informative` (default: `friendly`)
- `length` (optional): `short`, `medium`, `long` (default: `medium`)
- `crew_config_id` (optional): ID of crew configuration to use

**Response** (201 Created):
```json
{
  "post_id": 1,
  "status": "processing"
}
```

### Get Blog Post

**GET** `/api/post/{id}/`

Get blog post by ID with full details.

**Response** (200 OK):
```json
{
  "id": 1,
  "topic": "The Future of Artificial Intelligence",
  "subtitle": "Exploring AI trends in 2024",
  "title": "The Future of Artificial Intelligence: A Comprehensive Guide",
  "content": "Generated blog post content in markdown format...",
  "status": "completed",
  "progress_percentage": 100,
  "current_agent": "",
  "current_task": "",
  "progress_message": "Blog post generation completed!",
  "word_count": 850,
  "reading_time": 4,
  "target_audience": ["developers", "tech enthusiasts"],
  "key_points": "Machine learning, neural networks, automation",
  "examples": "ChatGPT, self-driving cars",
  "tone": "friendly",
  "is_saved": false,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:05:00Z"
}
```

**Status Values**:
- `pending`: Initial state
- `processing`: Generation in progress
- `completed`: Successfully generated
- `failed`: Generation failed

### Update Blog Post

**PUT** `/api/post/{id}/update/`

Update a blog post's content, title, or topic.

**Request Body**:
```json
{
  "content": "Updated content",
  "title": "New Title",
  "topic": "Updated Topic"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "topic": "Updated Topic",
  "title": "New Title",
  "content": "Updated content",
  ...
}
```

### Save Blog Post

**POST** `/api/post/{id}/save/`

Mark a blog post as saved.

**Request Body** (optional):
```json
{
  "title": "Custom Title"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "is_saved": true,
  "title": "Custom Title",
  ...
}
```

### Delete Blog Post

**DELETE** `/api/post/{id}/`

Delete a blog post.

**Response** (204 No Content)

### List Blog Posts

**GET** `/api/posts/`

List all blog posts with optional filters.

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`)
- `saved` (optional): Filter by saved status (`true`/`false`)

**Example**: `/api/posts/?status=completed&saved=true`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "topic": "Topic 1",
    "status": "completed",
    ...
  },
  {
    "id": 2,
    "topic": "Topic 2",
    "status": "completed",
    ...
  }
]
```

### Search Blog Posts

**GET** `/api/posts/search/?q=query`

Search blog posts by topic, title, or content.

**Query Parameters**:
- `q` (required): Search query

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "topic": "Matching topic",
    "content": "Content with matching text...",
    ...
  }
]
```

## Agent Management Endpoints

### List Agents

**GET** `/api/agents/`

List all agents.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Researcher",
    "role": "Research Specialist",
    "goal": "Gather comprehensive information...",
    "backstory": "You are an expert researcher...",
    "is_active": true,
    "order": 0
  }
]
```

### Create Agent

**POST** `/api/agents/`

Create a new agent.

**Request Body**:
```json
{
  "name": "Custom Agent",
  "role": "Custom Role",
  "goal": "Agent goal description",
  "backstory": "Agent backstory description",
  "is_active": true,
  "order": 0
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "name": "Custom Agent",
  ...
}
```

### Get Agent

**GET** `/api/agents/{id}/`

Get agent details.

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Researcher",
  ...
}
```

### Update Agent

**PUT** `/api/agents/{id}/`

Update an agent.

**Request Body**: Same as create

**Response** (200 OK): Updated agent object

### Delete Agent

**DELETE** `/api/agents/{id}/`

Delete an agent.

**Response** (204 No Content)

## Task Management Endpoints

### List Tasks

**GET** `/api/tasks/`

List all tasks.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Research Task",
    "description": "Gather information about the topic",
    "agent": 1,
    "expected_output": "Comprehensive research report",
    "depends_on": null,
    "order": 0,
    "is_active": true
  }
]
```

### Create Task

**POST** `/api/tasks/`

Create a new task.

**Request Body**:
```json
{
  "name": "Custom Task",
  "description": "Task description",
  "agent": 1,
  "expected_output": "Expected output description",
  "depends_on": null,
  "order": 0,
  "is_active": true
}
```

**Response** (201 Created): Created task object

### Get Task

**GET** `/api/tasks/{id}/`

Get task details.

**Response** (200 OK): Task object

### Update Task

**PUT** `/api/tasks/{id}/`

Update a task.

**Response** (200 OK): Updated task object

### Delete Task

**DELETE** `/api/tasks/{id}/`

Delete a task.

**Response** (204 No Content)

## Crew Configuration Endpoints

### List Crew Configurations

**GET** `/api/crew-configs/`

List all crew configurations.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Default Crew",
    "description": "Default crew configuration",
    "process_type": "sequential",
    "agents": [1, 2, 3],
    "is_default": true
  }
]
```

### Create Crew Configuration

**POST** `/api/crew-configs/`

Create a new crew configuration.

**Request Body**:
```json
{
  "name": "Custom Crew",
  "description": "Custom crew description",
  "process_type": "sequential",
  "agents": [1, 2, 3],
  "is_default": false
}
```

**Response** (201 Created): Created crew configuration

### Get Crew Configuration

**GET** `/api/crew-configs/{id}/`

Get crew configuration details.

**Response** (200 OK): Crew configuration object

### Update Crew Configuration

**PUT** `/api/crew-configs/{id}/`

Update a crew configuration.

**Response** (200 OK): Updated crew configuration

### Delete Crew Configuration

**DELETE** `/api/crew-configs/{id}/`

Delete a crew configuration.

**Response** (204 No Content)

## Ollama Settings Endpoints

### List Ollama Settings

**GET** `/api/ollama-settings/`

List all Ollama settings.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Default",
    "base_url": "http://localhost:11434",
    "model": "llama3",
    "temperature": 0.7,
    "is_active": true
  }
]
```

### Create Ollama Settings

**POST** `/api/ollama-settings/`

Create new Ollama settings.

**Request Body**:
```json
{
  "name": "Custom Settings",
  "base_url": "http://localhost:11434",
  "model": "mistral",
  "temperature": 0.8,
  "is_active": false
}
```

**Response** (201 Created): Created settings object

### Get Active Ollama Settings

**GET** `/api/ollama-settings/active/`

Get the currently active Ollama settings.

**Response** (200 OK): Active settings object

**Response** (404 Not Found) if no active settings:
```json
{
  "error": "No active Ollama settings found"
}
```

### Test Ollama Connection

**POST** `/api/ollama-settings/test-connection/`

Test connection to Ollama server using active settings.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully connected to Ollama at http://localhost:11434",
  "settings": {
    "base_url": "http://localhost:11434",
    "model": "llama3",
    "temperature": 0.7
  }
}
```

**Response** (400 Bad Request) on failure:
```json
{
  "success": false,
  "error": "Cannot connect to Ollama server...",
  "base_url": "http://localhost:11434"
}
```

### Fetch Ollama Models

**GET** `/api/ollama-settings/fetch-models/`

Fetch available models from Ollama.

**Response** (200 OK):
```json
{
  "success": true,
  "models": [
    {
      "name": "llama3",
      "size": 4838377984,
      "modified_at": "2024-01-01T00:00:00Z",
      "digest": "sha256:..."
    }
  ],
  "base_url": "http://localhost:11434",
  "count": 1
}
```

### Test Ollama Model

**POST** `/api/ollama-settings/test-model/`

Test a specific Ollama model with a simple prompt.

**Request Body**:
```json
{
  "model": "llama3"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Model test successful",
  "model": "llama3",
  "response": "Hello, Ollama is working!",
  "base_url": "http://localhost:11434"
}
```

### Get Ollama Settings

**GET** `/api/ollama-settings/{id}/`

Get specific Ollama settings.

**Response** (200 OK): Settings object

### Update Ollama Settings

**PUT** `/api/ollama-settings/{id}/`

Update Ollama settings.

**Response** (200 OK): Updated settings object

### Delete Ollama Settings

**DELETE** `/api/ollama-settings/{id}/`

Delete Ollama settings.

**Response** (204 No Content)

## Error Responses

All endpoints may return error responses:

**400 Bad Request**:
```json
{
  "error": "Error message",
  "field_name": ["Field-specific error"]
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error message"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing rate limiting to prevent abuse.

## CORS

CORS is not configured by default. For frontend applications on different domains, configure CORS in Django settings.

