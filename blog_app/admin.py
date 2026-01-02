from django.contrib import admin
from .models import BlogPost, Agent, Task, CrewConfig, OllamaSettings


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'role', 'goal']
    ordering = ['order', 'name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'role', 'is_active', 'order')
        }),
        ('Agent Configuration', {
            'fields': ('goal', 'backstory')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'agent', 'order', 'is_active', 'depends_on', 'created_at']
    list_filter = ['is_active', 'agent', 'created_at']
    search_fields = ['name', 'description', 'agent__name']
    ordering = ['order', 'name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'agent', 'is_active', 'order')
        }),
        ('Task Configuration', {
            'fields': ('description', 'expected_output', 'depends_on')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CrewConfig)
class CrewConfigAdmin(admin.ModelAdmin):
    list_display = ['name', 'process_type', 'is_default', 'created_at']
    list_filter = ['is_default', 'process_type', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['agents']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_default')
        }),
        ('Configuration', {
            'fields': ('process_type', 'agents')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OllamaSettings)
class OllamaSettingsAdmin(admin.ModelAdmin):
    list_display = ['name', 'model', 'base_url', 'temperature', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'model', 'base_url']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'is_active')
        }),
        ('Ollama Configuration', {
            'fields': ('base_url', 'model', 'temperature')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['topic', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['topic', 'content']
    readonly_fields = ['created_at', 'updated_at']

