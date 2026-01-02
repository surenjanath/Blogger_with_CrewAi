# Blog Post Builder with CrewAI & Ollama

A Django web application that uses CrewAI agents and Ollama to automatically generate blog posts. The system employs three specialized AI agents (Researcher, Writer, and Editor) working together to create high-quality content.

## Features

- 🤖 **Multi-Agent System**: Three specialized agents (Researcher, Writer, Editor) collaborate to create blog posts
- 🎨 **Modern Web Interface**: Clean, responsive frontend with real-time status updates
- 🔄 **Asynchronous Processing**: Background task processing with status polling
- 🏠 **Local LLM**: Uses Ollama for privacy and no API costs
- 📝 **Django REST API**: RESTful API endpoints for blog post generation

## Architecture

The system uses a sequential agent workflow:

1. **Researcher Agent**: Gathers comprehensive information about the topic
2. **Writer Agent**: Creates a well-structured blog post from the research
3. **Editor Agent**: Reviews and polishes the final blog post

## Prerequisites

Before you begin, ensure you have:

- **Python 3.8+** installed
- **Ollama** installed and running locally
  - Download from: https://ollama.ai
  - Install and start the Ollama service
- **Ollama Model** downloaded (e.g., `llama3` or `mistral`)
  - Run: `ollama pull llama3`

## Quick Start

### Windows

1. **Run the setup script**:
   ```bash
   setup.bat
   ```

2. **Activate virtual environment**:
   ```bash
   venv\Scripts\activate
   ```

3. **Configure environment** (edit `.env` file):
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start the server**:
   ```bash
   python manage.py runserver
   ```

6. **Open your browser**:
   Navigate to `http://127.0.0.1:8000`

### Linux/Mac

1. **Make setup script executable and run**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Activate virtual environment**:
   ```bash
   source venv/bin/activate
   ```

3. **Configure environment** (edit `.env` file):
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start the server**:
   ```bash
   python manage.py runserver
   ```

6. **Open your browser**:
   Navigate to `http://127.0.0.1:8000`

## Manual Setup

If you prefer to set up manually:

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create superuser** (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**:
   ```bash
   python manage.py runserver
   ```

## Project Structure

```
crewai-blog-builder/
├── manage.py
├── requirements.txt
├── README.md
├── .gitignore
├── setup.bat              # Windows setup script
├── setup.sh               # Linux/Mac setup script
├── .env.example           # Environment variables template
├── blog_builder/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── blog_app/              # Main application
│   ├── models.py         # BlogPost model
│   ├── views.py          # API views
│   ├── urls.py           # URL routing
│   ├── agents/           # CrewAI agents
│   │   ├── crew_setup.py
│   │   ├── researcher_agent.py
│   │   ├── writer_agent.py
│   │   ├── editor_agent.py
│   │   └── tasks.py
│   ├── templates/        # HTML templates
│   └── static/          # CSS, JavaScript
└── db.sqlite3            # SQLite database (created after migrations)
```

## API Endpoints

### POST `/api/generate-post/`

Create a new blog post generation request.

**Request Body**:
```json
{
  "topic": "The Future of Artificial Intelligence"
}
```

**Response**:
```json
{
  "post_id": 1,
  "status": "processing"
}
```

### GET `/api/post/{id}/`

Get blog post by ID.

**Response**:
```json
{
  "id": 1,
  "topic": "The Future of Artificial Intelligence",
  "content": "Generated blog post content...",
  "status": "completed",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:05:00Z"
}
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

- `OLLAMA_BASE_URL`: Ollama server URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model name to use (default: `llama3`)
- `DJANGO_SECRET_KEY`: Django secret key for production
- `DEBUG`: Django debug mode (`True`/`False`)

## Usage

1. **Start Ollama** (if not already running):
   ```bash
   ollama serve
   ```

2. **Ensure your model is downloaded**:
   ```bash
   ollama pull llama3
   ```

3. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```

4. **Open the web interface** and enter a topic

5. **Wait for the agents to complete** their work (this may take a few minutes)

6. **View your generated blog post**

## How It Works

1. **User Input**: Enter a blog post topic in the web interface
2. **Research Phase**: Researcher agent gathers information about the topic
3. **Writing Phase**: Writer agent creates a structured blog post from the research
4. **Editing Phase**: Editor agent reviews and polishes the final post
5. **Result**: The completed blog post is displayed to the user

## Troubleshooting

### Ollama Connection Issues

- Ensure Ollama is running: `ollama serve`
- Check the `OLLAMA_BASE_URL` in your `.env` file
- Verify the model is downloaded: `ollama list`

### Django Issues

- Make sure virtual environment is activated
- Run migrations: `python manage.py migrate`
- Check for missing dependencies: `pip install -r requirements.txt`

### Agent Processing Issues

- Check Django logs for error messages
- Verify Ollama model is accessible
- Ensure sufficient system resources (RAM/CPU) for LLM processing

## Technologies Used

- **Django**: Web framework
- **Django REST Framework**: API development
- **CrewAI**: Multi-agent orchestration
- **Ollama**: Local LLM inference
- **LangChain**: LLM integration

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel

1. Create superuser: `python manage.py createsuperuser`
2. Navigate to: `http://127.0.0.1:8000/admin`

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the project repository.

---

Built with ❤️ using Django, CrewAI, and Ollama

