# Development Guide

Guide for developers contributing to the Blog Post Builder project.

## Development Setup

### Prerequisites

- Python 3.8 or higher
- Git
- Ollama installed and running
- Virtual environment tool (venv or virtualenv)

### Initial Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd crewai-blog-builder
   ```

2. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create Superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```

## Project Structure

```
crewai-blog-builder/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── setup.bat / setup.sh      # Setup scripts
├── docs/                     # Documentation
├── blog_builder/             # Django project
│   ├── settings.py           # Project settings
│   ├── urls.py               # Main URL routing
│   └── wsgi.py               # WSGI configuration
└── blog_app/                 # Main application
    ├── models.py             # Database models
    ├── views.py              # Views and API endpoints
    ├── serializers.py        # DRF serializers
    ├── admin.py              # Admin configuration
    ├── agents/               # CrewAI agents
    ├── templates/            # HTML templates
    └── static/               # Static files
```

## Code Style

### Python Style Guide

Follow PEP 8 style guide:

- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use descriptive variable names
- Add docstrings to functions and classes

### Example

```python
def generate_blog_post(topic: str, subtitle: str = '') -> str:
    """
    Generate a blog post for the given topic.
    
    Args:
        topic: The blog post topic
        subtitle: Optional subtitle
        
    Returns:
        Generated blog post content
    """
    # Implementation
    pass
```

## Running Tests

### Run All Tests

```bash
python manage.py test
```

### Run Specific Test

```bash
python manage.py test blog_app.tests.TestBlogPost
```

### Run with Coverage

```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Database Management

### Creating Migrations

```bash
# Create migrations for changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Resetting Database

```bash
# Delete database
rm db.sqlite3

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### Django Shell

```bash
python manage.py shell
```

Example usage:
```python
from blog_app.models import BlogPost, Agent

# Create a blog post
post = BlogPost.objects.create(topic="Test Topic")

# Query agents
agents = Agent.objects.filter(is_active=True)
```

## Adding New Features

### 1. Create a New Agent

1. **Add Agent File**:
   ```python
   # blog_app/agents/custom_agent.py
   from crewai import Agent
   
   def get_custom_agent(llm):
       return Agent(
           role='Custom Role',
           goal='Agent goal',
           backstory='Agent backstory',
           verbose=True,
           allow_delegation=False,
           llm=llm,
       )
   ```

2. **Add to Crew Setup**:
   ```python
   # blog_app/agents/crew_setup.py
   from .custom_agent import get_custom_agent
   ```

3. **Create Database Model** (if needed):
   ```python
   # blog_app/models.py
   class CustomAgent(models.Model):
       # Fields
       pass
   ```

4. **Create Migration**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

### 2. Add New API Endpoint

1. **Add View Function**:
   ```python
   # blog_app/views.py
   @api_view(['GET'])
   def custom_endpoint(request):
       return Response({'message': 'Success'})
   ```

2. **Add URL Route**:
   ```python
   # blog_app/urls.py
   path('api/custom/', views.custom_endpoint, name='custom_endpoint'),
   ```

3. **Add Serializer** (if needed):
   ```python
   # blog_app/serializers.py
   class CustomSerializer(serializers.ModelSerializer):
       class Meta:
           model = CustomModel
           fields = '__all__'
   ```

### 3. Add Frontend Feature

1. **Create Template**:
   ```html
   <!-- blog_app/templates/blog_app/custom.html -->
   {% extends "base.html" %}
   {% block content %}
   <!-- Your content -->
   {% endblock %}
   ```

2. **Add JavaScript**:
   ```javascript
   // blog_app/static/blog_app/js/custom.js
   function customFunction() {
       // Implementation
   }
   ```

3. **Add CSS**:
   ```css
   /* blog_app/static/blog_app/css/custom.css */
   .custom-class {
       /* Styles */
   }
   ```

## Debugging

### Django Debug Toolbar

1. **Install**:
   ```bash
   pip install django-debug-toolbar
   ```

2. **Add to INSTALLED_APPS**:
   ```python
   INSTALLED_APPS = [
       # ...
       'debug_toolbar',
   ]
   ```

3. **Add Middleware**:
   ```python
   MIDDLEWARE = [
       # ...
       'debug_toolbar.middleware.DebugToolbarMiddleware',
   ]
   ```

4. **Add URLs**:
   ```python
   if DEBUG:
       import debug_toolbar
       urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
   ```

### Logging

Add logging configuration to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
        'blog_app': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        },
    },
}
```

## Admin Panel

### Accessing Admin

1. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

2. **Access Admin**:
   Navigate to `http://127.0.0.1:8000/admin`

### Customizing Admin

```python
# blog_app/admin.py
from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['topic', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['topic', 'content']
    readonly_fields = ['created_at', 'updated_at']
```

## Management Commands

### Creating Custom Commands

1. **Create Command File**:
   ```python
   # blog_app/management/commands/custom_command.py
   from django.core.management.base import BaseCommand
   
   class Command(BaseCommand):
       help = 'Description of command'
       
       def handle(self, *args, **options):
           # Command logic
           self.stdout.write(self.style.SUCCESS('Command executed'))
   ```

2. **Run Command**:
   ```bash
   python manage.py custom_command
   ```

### Existing Commands

- `seed_agents`: Seed default agents and configurations
- `migrate`: Apply database migrations
- `makemigrations`: Create migration files
- `runserver`: Start development server
- `shell`: Django shell
- `test`: Run tests

## API Development

### Testing API Endpoints

1. **Using curl**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/generate-post/ \
     -H "Content-Type: application/json" \
     -d '{"topic": "Test Topic"}'
   ```

2. **Using Python requests**:
   ```python
   import requests
   
   response = requests.post(
       'http://127.0.0.1:8000/api/generate-post/',
       json={'topic': 'Test Topic'}
   )
   print(response.json())
   ```

3. **Using Django Test Client**:
   ```python
   from django.test import Client
   
   client = Client()
   response = client.post('/api/generate-post/', {
       'topic': 'Test Topic'
   }, content_type='application/json')
   ```

## Frontend Development

### Static Files

- **CSS**: `blog_app/static/blog_app/css/`
- **JavaScript**: `blog_app/static/blog_app/js/`
- **Images**: `blog_app/static/blog_app/images/`

### Templates

- **Base Template**: Create `base.html` for common layout
- **Template Inheritance**: Use `{% extends %}` and `{% block %}`
- **Static Files**: Use `{% load static %}` and `{% static %}`

### JavaScript

- Use modern ES6+ syntax
- Handle API calls with fetch or axios
- Implement error handling
- Add loading states

## Git Workflow

### Branching Strategy

1. **Main Branch**: `main` or `master` (production-ready)
2. **Development Branch**: `develop` (integration branch)
3. **Feature Branches**: `feature/feature-name`
4. **Bug Fix Branches**: `fix/bug-name`

### Commit Messages

Follow conventional commits:

```
feat: Add new agent type
fix: Resolve Ollama connection issue
docs: Update API documentation
refactor: Improve code structure
test: Add unit tests for agents
```

### Pull Request Process

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Code review
6. Merge to develop/main

## Performance Optimization

### Database Optimization

1. **Use select_related**:
   ```python
   posts = BlogPost.objects.select_related('agent').all()
   ```

2. **Use prefetch_related**:
   ```python
   configs = CrewConfig.objects.prefetch_related('agents').all()
   ```

3. **Add Database Indexes**:
   ```python
   class BlogPost(models.Model):
       topic = models.CharField(max_length=500, db_index=True)
   ```

### Caching

1. **Install Redis**:
   ```bash
   pip install django-redis
   ```

2. **Configure Cache**:
   ```python
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
       }
   }
   ```

3. **Use Caching**:
   ```python
   from django.core.cache import cache
   
   cache.set('key', 'value', 3600)
   value = cache.get('key')
   ```

## Security Considerations

### Environment Variables

- Never commit `.env` file
- Use strong secret keys in production
- Rotate keys regularly

### SQL Injection

- Use Django ORM (already protected)
- Never use raw SQL with user input
- Use parameterized queries

### XSS Protection

- Django templates auto-escape
- Use `|safe` filter carefully
- Validate user input

### CSRF Protection

- Django includes CSRF protection
- Use `{% csrf_token %}` in forms
- Configure CSRF settings for API if needed

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure database (PostgreSQL recommended)
- [ ] Set up static file serving
- [ ] Configure HTTPS
- [ ] Set up logging
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Test thoroughly

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Ollama Documentation](https://github.com/ollama/ollama)

## Getting Help

- Check existing documentation
- Review code comments
- Search for similar issues
- Ask in project discussions
- Open an issue with details

