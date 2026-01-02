from rest_framework import serializers
from .models import BlogPost, Agent, Task, CrewConfig, OllamaSettings


class BlogPostSerializer(serializers.ModelSerializer):
    word_count = serializers.ReadOnlyField()
    reading_time = serializers.ReadOnlyField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'topic', 'subtitle', 'target_audience', 'key_points', 'examples', 'tone', 'content', 'status', 'is_saved', 'title', 'word_count', 'reading_time', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'word_count', 'reading_time']


class BlogPostCreateSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=500, required=True)
    subtitle = serializers.CharField(max_length=500, required=False, allow_blank=True)
    target_audience = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    key_points = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    examples = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    tone = serializers.ChoiceField(choices=BlogPost.TONE_CHOICES, required=False, default='friendly')
    crew_config_id = serializers.IntegerField(required=False, allow_null=True)


class AgentSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Agent
        fields = ['id', 'name', 'role', 'goal', 'backstory', 'is_active', 'order', 'tasks_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'tasks_count']
    
    def get_tasks_count(self, obj):
        return obj.tasks.filter(is_active=True).count()


class TaskSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    depends_on_name = serializers.CharField(source='depends_on.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'agent', 'agent_name', 'expected_output', 'depends_on', 'depends_on_name', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'agent_name', 'depends_on_name']


class CrewConfigSerializer(serializers.ModelSerializer):
    agents_detail = AgentSerializer(source='agents', many=True, read_only=True)
    agents = serializers.PrimaryKeyRelatedField(many=True, queryset=Agent.objects.filter(is_active=True))
    
    class Meta:
        model = CrewConfig
        fields = ['id', 'name', 'description', 'process_type', 'agents', 'agents_detail', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'agents_detail']


class OllamaSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OllamaSettings
        fields = ['id', 'name', 'base_url', 'model', 'temperature', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

