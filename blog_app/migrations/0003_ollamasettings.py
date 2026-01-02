# Generated manually for Ollama Settings

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('blog_app', '0002_agent_task_crewconfig'),
    ]

    operations = [
        migrations.CreateModel(
            name='OllamaSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Default', max_length=200, unique=True)),
                ('base_url', models.URLField(default='http://localhost:11434')),
                ('model', models.CharField(default='llama3', max_length=100)),
                ('temperature', models.FloatField(default=0.7, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(2.0)])),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Ollama Settings',
                'verbose_name_plural': 'Ollama Settings',
                'ordering': ['-is_active', 'name'],
            },
        ),
    ]

