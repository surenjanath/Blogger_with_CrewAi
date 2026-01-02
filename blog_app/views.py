import threading
import requests
from django.shortcuts import render, get_object_or_404
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import BlogPost, Agent, Task, CrewConfig, OllamaSettings
from .serializers import (
    BlogPostSerializer, BlogPostCreateSerializer,
    AgentSerializer, TaskSerializer, CrewConfigSerializer, OllamaSettingsSerializer
)
from .agents.crew_setup import generate_blog_post, get_ollama_llm


def index(request):
    """Render the homepage/dashboard."""
    # Get stats
    total_posts = BlogPost.objects.count()
    completed_posts = BlogPost.objects.filter(status='completed').count()
    saved_posts = BlogPost.objects.filter(is_saved=True).count()
    recent_posts = BlogPost.objects.filter(status='completed').order_by('-created_at')[:5]
    
    # Calculate total words
    total_words = sum(post.word_count for post in BlogPost.objects.filter(status='completed'))
    
    stats = {
        'total_posts': total_posts,
        'completed_posts': completed_posts,
        'saved_posts': saved_posts,
        'total_words': total_words,
        'recent_posts': recent_posts,
    }
    
    return render(request, 'blog_app/home.html', {'stats': stats})


def new_post(request):
    """Render the blog post generation page."""
    return render(request, 'blog_app/index.html')


def settings(request):
    """Render the settings page."""
    return render(request, 'blog_app/settings.html')


def history(request):
    """Render the history page with all blog posts."""
    posts = BlogPost.objects.filter(status='completed').order_by('-created_at')
    return render(request, 'blog_app/history.html', {'posts': posts})


def edit_post(request, post_id):
    """Render the edit page for a specific blog post."""
    post = get_object_or_404(BlogPost, id=post_id)
    return render(request, 'blog_app/edit.html', {'post': post})


@api_view(['POST'])
def generate_post(request):
    """
    Create a new blog post generation request.
    
    Accepts: {
        "topic": "string",
        "subtitle": "string" (optional),
        "target_audience": ["tag1", "tag2"] (optional),
        "key_points": "string" (optional),
        "examples": "string" (optional),
        "tone": "friendly" (optional)
    }
    Returns: {"post_id": int, "status": "processing"}
    """
    serializer = BlogPostCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    
    # Create blog post record
    blog_post = BlogPost.objects.create(
        topic=validated_data['topic'],
        subtitle=validated_data.get('subtitle', ''),
        target_audience=validated_data.get('target_audience', []),
        key_points=validated_data.get('key_points', ''),
        examples=validated_data.get('examples', ''),
        tone=validated_data.get('tone', 'friendly'),
        status='processing'
    )
    
    # Start blog post generation in background thread
    def generate_in_background():
        try:
            blog_post.status = 'processing'
            blog_post.save()
            
            # Generate blog post using CrewAI with all parameters
            content = generate_blog_post(
                topic=validated_data['topic'],
                subtitle=validated_data.get('subtitle', ''),
                target_audience=validated_data.get('target_audience', []),
                key_points=validated_data.get('key_points', ''),
                examples=validated_data.get('examples', ''),
                tone=validated_data.get('tone', 'friendly'),
                length=validated_data.get('length', 'medium'),
                crew_config_id=validated_data.get('crew_config_id'),
                blog_post_id=blog_post.id
            )
            
            # Extract title from content
            import re
            title_match = re.search(r'^#\s*(.+)$', content, re.MULTILINE) if content else None
            title = title_match.group(1).strip() if title_match else validated_data['topic']
            
            # Update blog post with generated content
            blog_post.content = content
            blog_post.title = title
            blog_post.status = 'completed'
            blog_post.save()
        except Exception as e:
            # Update status to failed on error
            blog_post.status = 'failed'
            blog_post.content = f"Error: {str(e)}"
            blog_post.progress_message = f"Error occurred: {str(e)}"
            blog_post.progress_percentage = 0
            blog_post.save()
    
    # Start background thread
    thread = threading.Thread(target=generate_in_background)
    thread.daemon = True
    thread.start()
    
    return Response({
        'post_id': blog_post.id,
        'status': blog_post.status
    }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
def get_post(request, post_id):
    """
    Get blog post by ID, or delete it.
    
    Returns: Blog post data with status and content
    """
    try:
        blog_post = BlogPost.objects.get(id=post_id)
        
        if request.method == 'DELETE':
            blog_post.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        serializer = BlogPostSerializer(blog_post)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except BlogPost.DoesNotExist:
        return Response(
            {'error': 'Blog post not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def save_post(request, post_id):
    """Save a blog post."""
    post = get_object_or_404(BlogPost, id=post_id)
    post.is_saved = True
    if 'title' in request.data:
        post.title = request.data['title']
    post.save()
    serializer = BlogPostSerializer(post)
    return Response(serializer.data)


@api_view(['PUT'])
def update_post(request, post_id):
    """Update a blog post's content."""
    post = get_object_or_404(BlogPost, id=post_id)
    
    if 'content' in request.data:
        post.content = request.data['content']
    if 'title' in request.data:
        post.title = request.data['title']
    if 'topic' in request.data:
        post.topic = request.data['topic']
    
    post.save()
    serializer = BlogPostSerializer(post)
    return Response(serializer.data)


@api_view(['GET'])
def list_posts(request):
    """List all blog posts with optional filters."""
    status_filter = request.GET.get('status', None)
    saved_filter = request.GET.get('saved', None)
    
    posts = BlogPost.objects.all()
    
    if status_filter:
        posts = posts.filter(status=status_filter)
    if saved_filter == 'true':
        posts = posts.filter(is_saved=True)
    
    posts = posts.order_by('-created_at')
    serializer = BlogPostSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def search_posts(request):
    """Search blog posts by topic or content."""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response({'error': 'Query parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    posts = BlogPost.objects.filter(
        models.Q(topic__icontains=query) | 
        models.Q(content__icontains=query) |
        models.Q(title__icontains=query)
    ).order_by('-created_at')
    
    serializer = BlogPostSerializer(posts, many=True)
    return Response(serializer.data)


# Agent API endpoints
@api_view(['GET', 'POST'])
def agent_list(request):
    """List all agents or create a new agent."""
    if request.method == 'GET':
        agents = Agent.objects.all().order_by('order', 'name')
        serializer = AgentSerializer(agents, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AgentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def agent_detail(request, agent_id):
    """Get, update, or delete a specific agent."""
    agent = get_object_or_404(Agent, id=agent_id)
    
    if request.method == 'GET':
        serializer = AgentSerializer(agent)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AgentSerializer(agent, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        agent.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Task API endpoints
@api_view(['GET', 'POST'])
def task_list(request):
    """List all tasks or create a new task."""
    if request.method == 'GET':
        tasks = Task.objects.all().order_by('order', 'name')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def task_detail(request, task_id):
    """Get, update, or delete a specific task."""
    task = get_object_or_404(Task, id=task_id)
    
    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Crew Config API endpoints
@api_view(['GET', 'POST'])
def crew_config_list(request):
    """List all crew configurations or create a new one."""
    if request.method == 'GET':
        configs = CrewConfig.objects.all().order_by('-is_default', 'name')
        serializer = CrewConfigSerializer(configs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrewConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def crew_config_detail(request, config_id):
    """Get, update, or delete a specific crew configuration."""
    config = get_object_or_404(CrewConfig, id=config_id)
    
    if request.method == 'GET':
        serializer = CrewConfigSerializer(config)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CrewConfigSerializer(config, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        config.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Ollama Settings API endpoints
@api_view(['GET', 'POST'])
def ollama_settings_list(request):
    """List all Ollama settings or create a new one."""
    if request.method == 'GET':
        settings_list = OllamaSettings.objects.all().order_by('-is_active', 'name')
        serializer = OllamaSettingsSerializer(settings_list, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = OllamaSettingsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def ollama_settings_detail(request, settings_id):
    """Get, update, or delete a specific Ollama settings."""
    settings_obj = get_object_or_404(OllamaSettings, id=settings_id)
    
    if request.method == 'GET':
        serializer = OllamaSettingsSerializer(settings_obj)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = OllamaSettingsSerializer(settings_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        settings_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def get_active_ollama_settings(request):
    """Get the active Ollama settings."""
    try:
        settings_obj = OllamaSettings.objects.get(is_active=True)
        serializer = OllamaSettingsSerializer(settings_obj)
        return Response(serializer.data)
    except OllamaSettings.DoesNotExist:
        return Response(
            {'error': 'No active Ollama settings found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def test_ollama_connection(request):
    """Test the connection to Ollama with the active settings."""
    try:
        # Get active Ollama settings
        try:
            ollama_settings = OllamaSettings.objects.get(is_active=True)
        except OllamaSettings.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No active Ollama settings found. Please create one in settings.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Test connection by making a simple request to Ollama
        try:
            # Test if Ollama server is reachable
            test_url = f"{ollama_settings.base_url}/api/tags"
            response = requests.get(test_url, timeout=5)
            
            if response.status_code == 200:
                return Response({
                    'success': True,
                    'message': f'Successfully connected to Ollama at {ollama_settings.base_url}',
                    'settings': {
                        'base_url': ollama_settings.base_url,
                        'model': ollama_settings.model,
                        'temperature': ollama_settings.temperature,
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': f'Ollama server returned status code {response.status_code}',
                    'base_url': ollama_settings.base_url
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.exceptions.ConnectionError:
            return Response({
                'success': False,
                'error': f'Cannot connect to Ollama server at {ollama_settings.base_url}. Make sure Ollama is running.',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.Timeout:
            return Response({
                'success': False,
                'error': f'Connection timeout to Ollama server at {ollama_settings.base_url}',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error testing connection: {str(e)}',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def fetch_ollama_models(request):
    """Fetch available models from Ollama."""
    try:
        # Get active Ollama settings
        try:
            ollama_settings = OllamaSettings.objects.get(is_active=True)
        except OllamaSettings.DoesNotExist:
            return Response(
                {'error': 'No active Ollama settings found. Please create one in settings.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Fetch models from Ollama
        try:
            models_url = f"{ollama_settings.base_url}/api/tags"
            response = requests.get(models_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                models = []
                if 'models' in data:
                    for model in data['models']:
                        models.append({
                            'name': model.get('name', ''),
                            'size': model.get('size', 0),
                            'modified_at': model.get('modified_at', ''),
                            'digest': model.get('digest', ''),
                        })
                
                return Response({
                    'success': True,
                    'models': models,
                    'base_url': ollama_settings.base_url,
                    'count': len(models)
                })
            else:
                return Response({
                    'success': False,
                    'error': f'Ollama server returned status code {response.status_code}',
                    'base_url': ollama_settings.base_url
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.exceptions.ConnectionError:
            return Response({
                'success': False,
                'error': f'Cannot connect to Ollama server at {ollama_settings.base_url}. Make sure Ollama is running.',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.Timeout:
            return Response({
                'success': False,
                'error': f'Connection timeout to Ollama server at {ollama_settings.base_url}',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching models: {str(e)}',
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def test_ollama_model(request):
    """Test a specific Ollama model with a simple prompt."""
    try:
        # Get active Ollama settings
        try:
            ollama_settings = OllamaSettings.objects.get(is_active=True)
        except OllamaSettings.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No active Ollama settings found. Please create one in settings.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        model_name = request.data.get('model', ollama_settings.model)
        
        # Test the model with a simple prompt
        try:
            from crewai import LLM
            
            # Use CrewAI's LLM class for testing
            # Ensure model name has ollama/ prefix
            test_model = model_name
            if not test_model.startswith('ollama/'):
                test_model = f"ollama/{test_model}"
            
            llm = LLM(
                model=test_model,
                base_url=ollama_settings.base_url,
                temperature=ollama_settings.temperature,
            )
            
            # Simple test prompt
            test_prompt = "Say 'Hello, Ollama is working!' in one sentence."
            # CrewAI LLM uses different interface - use litellm directly for testing
            import litellm
            result = litellm.completion(
                model=f"ollama/{model_name}",
                messages=[{"role": "user", "content": test_prompt}],
                api_base=ollama_settings.base_url,
                temperature=ollama_settings.temperature,
            )
            result_text = result.choices[0].message.content if result.choices else "No response"
            
            return Response({
                'success': True,
                'message': 'Model test successful',
                'model': model_name,
                'response': result_text.strip() if result_text else 'No response',
                'base_url': ollama_settings.base_url
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error testing model: {str(e)}',
                'model': model_name,
                'base_url': ollama_settings.base_url
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

