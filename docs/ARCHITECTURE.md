# Architecture

## System Overview

The Blog Post Builder uses a multi-agent architecture orchestrated by CrewAI, where specialized AI agents work sequentially to generate high-quality blog posts.

## Agent Workflow

```
┌─────────────────┐
│   User Input    │
│  (Topic, etc.)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Researcher     │
│  Agent          │──► Gathers information, facts, statistics
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Writer Agent   │──► Creates structured blog post
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Editor Agent   │──► Reviews, polishes, and finalizes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Blog Post      │
│  (Completed)    │
└─────────────────┘
```

## System Components

### 1. Django Backend

The Django application provides:
- **RESTful API**: REST endpoints for all operations
- **Web Interface**: HTML/CSS/JavaScript frontend
- **Database Models**: SQLite (or other DB) for persistence
- **Admin Panel**: Django admin for managing data

### 2. CrewAI Framework

CrewAI orchestrates the multi-agent workflow:
- **Agent Management**: Creates and manages AI agents
- **Task Orchestration**: Handles task dependencies and execution order
- **Process Types**: Sequential or parallel execution
- **LLM Integration**: Connects agents to Ollama LLM

### 3. Ollama Integration

Local LLM inference engine:
- **Model Management**: Multiple model support
- **API Integration**: RESTful API for model access
- **Configuration**: Temperature, base URL, and model selection
- **Offline Operation**: Complete privacy, no external API calls

### 4. Database Layer

SQLite database stores:
- **Agents**: Agent definitions (role, goal, backstory)
- **Tasks**: Task definitions with dependencies
- **Crew Configurations**: Agent and task combinations
- **Ollama Settings**: LLM configuration
- **Blog Posts**: Generated content and metadata

### 5. Frontend

Modern web interface:
- **Dashboard**: Statistics and recent posts
- **Blog Generation**: Form for creating new posts
- **Progress Tracking**: Real-time status updates
- **History**: Browse and manage posts
- **Settings**: Configure agents, tasks, and Ollama

## Data Flow

### Blog Post Generation Flow

1. **User Input** → Django View receives request
2. **Blog Post Creation** → Database record created with "processing" status
3. **Background Thread** → Blog generation starts in separate thread
4. **Crew Initialization** → CrewAI crew created with agents and tasks
5. **Agent Execution** → Agents execute sequentially:
   - Researcher gathers information
   - Writer creates blog post
   - Editor polishes content
6. **Progress Updates** → Database updated with progress information
7. **Completion** → Blog post saved with generated content
8. **Frontend Polling** → JavaScript polls API for status updates

### Progress Tracking

The system tracks progress through:
- **ProgressTracker Class**: Updates database with current state
- **Threading**: Background execution with progress updates
- **Real-time Updates**: Frontend polls `/api/post/{id}/` endpoint
- **Status Fields**: 
  - `current_agent`: Active agent name
  - `current_task`: Current task description
  - `progress_percentage`: 0-100% completion
  - `progress_message`: Detailed status message

## Agent Architecture

### Researcher Agent

**Role**: Research Specialist

**Goal**: Gather comprehensive and accurate information about the given topic

**Responsibilities**:
- Research the topic thoroughly
- Identify key facts and statistics
- Organize information for the writer
- Ensure accuracy and relevance

### Writer Agent

**Role**: Content Writer

**Goal**: Create engaging, well-structured blog posts

**Responsibilities**:
- Transform research into narrative
- Structure content with introduction, body, conclusion
- Follow tone and length requirements
- Include key points and examples

### Editor Agent

**Role**: Content Editor

**Goal**: Review and polish the final blog post

**Responsibilities**:
- Review content for clarity and flow
- Improve readability
- Ensure proper formatting
- Finalize the output

## Database Schema

### Agent Model

```python
- name: CharField
- role: CharField
- goal: TextField
- backstory: TextField
- is_active: BooleanField
- order: IntegerField
```

### Task Model

```python
- name: CharField
- description: TextField
- agent: ForeignKey(Agent)
- expected_output: TextField
- depends_on: ForeignKey(Task, null=True)
- order: IntegerField
- is_active: BooleanField
```

### CrewConfig Model

```python
- name: CharField
- description: TextField
- process_type: CharField (sequential/parallel)
- agents: ManyToManyField(Agent)
- is_default: BooleanField
```

### OllamaSettings Model

```python
- name: CharField
- base_url: URLField
- model: CharField
- temperature: FloatField
- is_active: BooleanField
```

### BlogPost Model

```python
- topic: CharField
- subtitle: CharField
- target_audience: JSONField
- key_points: TextField
- examples: TextField
- tone: CharField
- content: TextField
- status: CharField (pending/processing/completed/failed)
- title: CharField
- current_agent: CharField
- current_task: CharField
- progress_message: TextField
- progress_percentage: IntegerField
- is_saved: BooleanField
```

## Configuration System

### Environment Variables

Configuration via `.env` file:
- `OLLAMA_BASE_URL`: Ollama server URL
- `OLLAMA_MODEL`: Model name
- `OLLAMA_TEMPERATURE`: Temperature setting
- `DJANGO_SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode

### Database Configuration

Settings stored in database:
- **Ollama Settings**: Multiple configurations, one active
- **Agents**: Customizable agent definitions
- **Tasks**: Task definitions with dependencies
- **Crew Configs**: Agent and task combinations

### Fallback System

If no database configuration exists:
- Uses hardcoded default agents (Researcher, Writer, Editor)
- Uses environment variables for Ollama settings
- Maintains backward compatibility

## Security Considerations

- **Local LLM**: No data sent to external APIs
- **Environment Variables**: Sensitive data in `.env` file
- **Django Security**: CSRF protection, secure settings
- **SQLite**: File-based database (consider PostgreSQL for production)

## Scalability

### Current Limitations

- Single-threaded blog generation (one at a time)
- SQLite database (not ideal for high concurrency)
- Local Ollama (limited by hardware)

### Future Improvements

- **Task Queue**: Use Celery for background processing
- **Database**: Migrate to PostgreSQL for production
- **Caching**: Add Redis for performance
- **Load Balancing**: Multiple Ollama instances
- **API Rate Limiting**: Prevent abuse

## Performance Considerations

- **LLM Processing**: Most time-consuming operation
- **Model Size**: Larger models = slower but better quality
- **System Resources**: RAM and CPU usage
- **Database Queries**: Optimize with select_related/prefetch_related
- **Frontend Polling**: Adjust polling interval for balance

