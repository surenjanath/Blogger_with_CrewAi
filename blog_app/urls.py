from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('new/', views.new_post, name='new_post'),
    path('settings/', views.settings, name='settings'),
    path('history/', views.history, name='history'),
    path('edit/<int:post_id>/', views.edit_post, name='edit_post'),
    path('api/generate-post/', views.generate_post, name='generate_post'),
    path('api/post/<int:post_id>/', views.get_post, name='get_post'),
    path('api/post/<int:post_id>/save/', views.save_post, name='save_post'),
    path('api/post/<int:post_id>/update/', views.update_post, name='update_post'),
    path('api/posts/', views.list_posts, name='list_posts'),
    path('api/posts/search/', views.search_posts, name='search_posts'),
    # Agent endpoints
    path('api/agents/', views.agent_list, name='agent_list'),
    path('api/agents/<int:agent_id>/', views.agent_detail, name='agent_detail'),
    # Task endpoints
    path('api/tasks/', views.task_list, name='task_list'),
    path('api/tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    # Crew config endpoints
    path('api/crew-configs/', views.crew_config_list, name='crew_config_list'),
    path('api/crew-configs/<int:config_id>/', views.crew_config_detail, name='crew_config_detail'),
    # Ollama settings endpoints
    path('api/ollama-settings/', views.ollama_settings_list, name='ollama_settings_list'),
    path('api/ollama-settings/<int:settings_id>/', views.ollama_settings_detail, name='ollama_settings_detail'),
    path('api/ollama-settings/active/', views.get_active_ollama_settings, name='get_active_ollama_settings'),
    path('api/ollama-settings/test-connection/', views.test_ollama_connection, name='test_ollama_connection'),
    path('api/ollama-settings/fetch-models/', views.fetch_ollama_models, name='fetch_ollama_models'),
    path('api/ollama-settings/test-model/', views.test_ollama_model, name='test_ollama_model'),
]

