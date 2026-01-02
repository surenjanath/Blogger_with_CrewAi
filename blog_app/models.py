from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Agent(models.Model):
    """AI Agent configuration for CrewAI"""
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    goal = models.TextField()
    backstory = models.TextField()
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Agent'
        verbose_name_plural = 'Agents'
    
    def __str__(self):
        return f"{self.name} ({self.role})"


class Task(models.Model):
    """Task configuration for CrewAI agents"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='tasks')
    expected_output = models.TextField()
    depends_on = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='dependent_tasks')
    order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    
    def __str__(self):
        return f"{self.name} ({self.agent.name})"


class CrewConfig(models.Model):
    """Crew configuration for blog post generation"""
    PROCESS_CHOICES = [
        ('sequential', 'Sequential'),
        ('parallel', 'Parallel'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    process_type = models.CharField(max_length=20, choices=PROCESS_CHOICES, default='sequential')
    agents = models.ManyToManyField(Agent, related_name='crew_configs')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', 'name']
        verbose_name = 'Crew Configuration'
        verbose_name_plural = 'Crew Configurations'
    
    def __str__(self):
        return f"{self.name} ({self.process_type})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default config exists
        if self.is_default:
            CrewConfig.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class OllamaSettings(models.Model):
    """Ollama configuration settings"""
    name = models.CharField(max_length=200, default='Default', unique=True)
    base_url = models.URLField(default='http://localhost:11434')
    model = models.CharField(max_length=100, default='llama3')
    temperature = models.FloatField(default=0.7, validators=[MinValueValidator(0.0), MaxValueValidator(2.0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_active', 'name']
        verbose_name = 'Ollama Settings'
        verbose_name_plural = 'Ollama Settings'
    
    def __str__(self):
        return f"{self.name} ({self.model})"
    
    def save(self, *args, **kwargs):
        # Ensure only one active setting exists
        if self.is_active:
            OllamaSettings.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    TONE_CHOICES = [
        ('friendly', 'Friendly'),
        ('professional', 'Professional'),
        ('casual', 'Casual'),
        ('formal', 'Formal'),
        ('humorous', 'Humorous'),
        ('informative', 'Informative'),
    ]
    
    topic = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True, default='')
    target_audience = models.JSONField(default=list, blank=True)  # List of tags
    key_points = models.TextField(blank=True, max_length=1000)
    examples = models.TextField(blank=True, max_length=1000)
    tone = models.CharField(max_length=20, choices=TONE_CHOICES, default='friendly')
    content = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_saved = models.BooleanField(default=False)
    title = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.topic} - {self.status}"
    
    @property
    def word_count(self):
        if self.content:
            return len(self.content.split())
        return 0
    
    @property
    def reading_time(self):
        words = self.word_count
        return max(1, round(words / 200))  # 200 words per minute

