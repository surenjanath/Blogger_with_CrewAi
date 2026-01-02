# Configuration Guide

Complete guide to configuring the Blog Post Builder application.

## Environment Variables

Create a `.env` file in the project root directory with the following variables:

### Ollama Configuration

```env
# Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434

# Model name (without 'ollama/' prefix)
OLLAMA_MODEL=llama3

# Temperature for model responses (0.0 to 2.0)
OLLAMA_TEMPERATURE=0.7
```

**Note**: The `OLLAMA_MODEL` should be the model name as it appears in Ollama (e.g., `llama3`, `mistral`, `llama3.2`). The system automatically adds the `ollama/` prefix when needed.

### Django Configuration

```env
# Django secret key (required for production)
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production

# Debug mode (True for development, False for production)
DEBUG=True

# Allowed hosts (comma-separated)
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Example .env File

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_TEMPERATURE=0.7

# Django Configuration
DJANGO_SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
```

## Database Configuration

### SQLite (Default)

The project uses SQLite by default, which requires no additional configuration. The database file `db.sqlite3` is created automatically after running migrations.

### PostgreSQL

To use PostgreSQL, update `blog_builder/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**Install PostgreSQL adapter**:
```bash
pip install psycopg2-binary
```

### MySQL

To use MySQL, update `blog_builder/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

**Install MySQL adapter**:
```bash
pip install mysqlclient
```

## Ollama Configuration via Web Interface

You can configure Ollama settings directly through the web interface without editing environment variables:

### Steps

1. **Navigate to Settings**: Go to `/settings/` in the web interface

2. **Add Ollama Settings**:
   - Click "Add Ollama Settings"
   - Enter a name (e.g., "Default")
   - Set base URL (e.g., `http://localhost:11434`)
   - Select or enter model name (e.g., `llama3`)
   - Set temperature (0.0 to 2.0)

3. **Test Connection**:
   - Click "Test Connection" to verify Ollama is accessible
   - Check that the connection is successful

4. **Set as Active**:
   - Check "Is Active" to use these settings
   - Only one setting can be active at a time

5. **Fetch Available Models**:
   - Click "Fetch Models" to see available models from Ollama
   - Select a model from the list

### Multiple Ollama Instances

You can configure multiple Ollama settings for different models or instances:

- Create multiple settings with different names
- Switch between them by setting one as active
- Useful for testing different models or using remote Ollama servers

## Agent Configuration

### Default Agents

The system comes with three default agents:

1. **Researcher Agent**
   - Role: Research Specialist
   - Goal: Gather comprehensive information
   - Backstory: Expert researcher with attention to detail

2. **Writer Agent**
   - Role: Content Writer
   - Goal: Create engaging blog posts
   - Backstory: Professional writer with narrative skills

3. **Editor Agent**
   - Role: Content Editor
   - Goal: Review and polish content
   - Backstory: Experienced editor focused on clarity

### Creating Custom Agents

1. **Via Web Interface**:
   - Go to `/settings/`
   - Navigate to "Agents" section
   - Click "Add Agent"
   - Fill in:
     - Name
     - Role
     - Goal
     - Backstory
     - Order (execution order)
     - Is Active

2. **Via API**:
   ```bash
   POST /api/agents/
   {
     "name": "Custom Agent",
     "role": "Custom Role",
     "goal": "Agent goal",
     "backstory": "Agent backstory",
     "order": 0,
     "is_active": true
   }
   ```

3. **Via Django Admin**:
   - Create superuser: `python manage.py createsuperuser`
   - Access admin at `/admin`
   - Navigate to Agents section

## Task Configuration

### Creating Tasks

Tasks define what each agent should do:

1. **Via Web Interface**:
   - Go to `/settings/`
   - Navigate to "Tasks" section
   - Click "Add Task"
   - Fill in:
     - Name
     - Description (what the task should do)
     - Agent (which agent performs this task)
     - Expected Output (what should be produced)
     - Depends On (optional, for task dependencies)
     - Order (execution order)
     - Is Active

2. **Task Dependencies**:
   - Tasks can depend on other tasks
   - Dependent tasks wait for their dependencies to complete
   - Useful for sequential workflows

## Crew Configuration

### Creating Crew Configurations

Crew configurations combine agents and tasks into workflows:

1. **Via Web Interface**:
   - Go to `/settings/`
   - Navigate to "Crew Configurations" section
   - Click "Add Crew Configuration"
   - Fill in:
     - Name
     - Description
     - Process Type: `sequential` or `parallel`
     - Agents: Select multiple agents
     - Is Default: Set as default configuration

2. **Process Types**:
   - **Sequential**: Tasks execute one after another
   - **Parallel**: Tasks can execute simultaneously (if no dependencies)

3. **Setting Default**:
   - Only one crew configuration can be default
   - Default configuration is used when no specific config is selected

## Static Files Configuration

### Development

In development, Django serves static files automatically when `DEBUG=True`.

### Production

For production, configure static files:

1. **Update settings.py**:
   ```python
   STATIC_URL = '/static/'
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   ```

2. **Collect static files**:
   ```bash
   python manage.py collectstatic
   ```

3. **Configure web server** (Nginx example):
   ```nginx
   location /static/ {
       alias /path/to/staticfiles/;
   }
   ```

## Security Configuration

### Production Settings

For production deployment, update `blog_builder/settings.py`:

```python
# Security settings
DEBUG = False
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')  # Use strong secret key
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# HTTPS settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### Secret Key Generation

Generate a secure secret key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

## Logging Configuration

Add logging configuration to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'blog_builder.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## CORS Configuration (if needed)

If you need to allow cross-origin requests:

1. **Install django-cors-headers**:
   ```bash
   pip install django-cors-headers
   ```

2. **Add to INSTALLED_APPS**:
   ```python
   INSTALLED_APPS = [
       ...
       'corsheaders',
   ]
   ```

3. **Add middleware**:
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       ...
   ]
   ```

4. **Configure allowed origins**:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000",
   ]
   ```

## Performance Configuration

### Database Optimization

For better performance with large datasets:

```python
# Use connection pooling
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,
    }
}
```

### Caching (Optional)

Add Redis caching:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

## Troubleshooting Configuration

### Check Configuration

1. **Verify environment variables are loaded**:
   ```python
   # In Django shell
   from django.conf import settings
   print(settings.DEBUG)
   ```

2. **Test Ollama connection**:
   - Use the web interface test connection feature
   - Or use the API: `POST /api/ollama-settings/test-connection/`

3. **Check database connection**:
   ```bash
   python manage.py dbshell
   ```

### Common Issues

- **Environment variables not loading**: Ensure `.env` file is in project root
- **Ollama connection fails**: Verify Ollama is running and URL is correct
- **Database errors**: Check database credentials and permissions
- **Static files not loading**: Run `collectstatic` and check `STATIC_URL` setting

