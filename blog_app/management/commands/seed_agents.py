from django.core.management.base import BaseCommand
from blog_app.models import Agent, Task, CrewConfig, OllamaSettings


class Command(BaseCommand):
    help = 'Seed default agents, tasks, crew configuration, and Ollama settings'

    def handle(self, *args, **options):
        self.stdout.write('Seeding default agents, tasks, crew configuration, and Ollama settings...')
        
        # Create default Ollama settings
        ollama_settings, created = OllamaSettings.objects.get_or_create(
            name='Default',
            defaults={
                'base_url': 'http://localhost:11434',
                'model': 'llama3',
                'temperature': 0.7,
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Default Ollama Settings'))
        else:
            self.stdout.write('Default Ollama settings already exists')
        
        # Create default agents
        researcher, created = Agent.objects.get_or_create(
            name='Researcher',
            defaults={
                'role': 'Research Specialist',
                'goal': 'Gather comprehensive and accurate information about the given topic, including key facts, statistics, and insights',
                'backstory': """You are an expert researcher with years of experience in gathering 
and analyzing information. You have a keen eye for detail and always ensure 
that the information you collect is accurate, relevant, and well-organized. 
You excel at finding the most important points and presenting them in a clear, 
structured manner that will be useful for content creation.""",
                'is_active': True,
                'order': 0,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Researcher agent'))
        else:
            self.stdout.write('Researcher agent already exists')
        
        writer, created = Agent.objects.get_or_create(
            name='Writer',
            defaults={
                'role': 'Content Writer',
                'goal': 'Create engaging, well-structured blog posts that are informative and easy to read',
                'backstory': """You are a professional content writer with a talent for creating 
engaging blog posts. You have a natural ability to take research and transform 
it into compelling narratives that capture readers' attention. Your writing style 
is clear, conversational, and accessible, making complex topics easy to understand. 
You always structure your posts with a clear introduction, well-organized body 
sections, and a strong conclusion.""",
                'is_active': True,
                'order': 1,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Writer agent'))
        else:
            self.stdout.write('Writer agent already exists')
        
        editor, created = Agent.objects.get_or_create(
            name='Editor',
            defaults={
                'role': 'Editor',
                'goal': 'Review and polish blog posts to ensure they are clear, error-free, and ready for publication',
                'backstory': """You are an experienced editor with a sharp eye for detail. You have 
edited thousands of articles and blog posts, always ensuring they meet the highest 
standards of quality. You check for clarity, flow, grammar, and overall readability. 
You make sure that the content is well-organized, engaging, and free of any errors 
or inconsistencies. Your goal is to polish every piece of content until it shines.""",
                'is_active': True,
                'order': 2,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Editor agent'))
        else:
            self.stdout.write('Editor agent already exists')
        
        # Create default tasks
        research_task, created = Task.objects.get_or_create(
            name='Research Topic',
            defaults={
                'description': """Research the topic provided. Gather comprehensive information including:
- Key facts and statistics
- Important concepts and definitions
- Relevant examples or case studies
- Current trends or developments
- Any other relevant information that would be useful for writing a blog post

Organize your research findings in a clear, structured format.""",
                'agent': researcher,
                'expected_output': 'A comprehensive research summary with key points, facts, and insights about the topic, organized in a clear structure.',
                'depends_on': None,
                'is_active': True,
                'order': 0,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Research Task'))
        
        writing_task, created = Task.objects.get_or_create(
            name='Write Blog Post',
            defaults={
                'description': """Write a complete blog post based on the research provided.
The blog post should:
- Have a compelling introduction that hooks the reader
- Include well-structured body sections with clear headings
- Be informative and easy to read
- Use a conversational, engaging tone
- Include relevant examples or insights from the research
- Have a strong conclusion that summarizes key points

Make sure the post is at least 500 words and flows naturally from start to finish.""",
                'agent': writer,
                'expected_output': 'A complete, well-structured blog post with introduction, body sections, and conclusion, ready for editing.',
                'depends_on': research_task,
                'is_active': True,
                'order': 1,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Writing Task'))
        
        editing_task, created = Task.objects.get_or_create(
            name='Edit Blog Post',
            defaults={
                'description': """Review and polish the blog post from the previous task.
Your task is to:
- Check for clarity and readability
- Ensure proper grammar and spelling
- Verify the structure and flow
- Make sure the content is engaging and well-organized
- Fix any inconsistencies or errors
- Ensure the post is publication-ready

Make improvements where needed, but maintain the original style and voice of the writer.""",
                'agent': editor,
                'expected_output': 'A polished, publication-ready blog post that is clear, error-free, and engaging.',
                'depends_on': writing_task,
                'is_active': True,
                'order': 2,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Editing Task'))
        
        # Create default crew configuration
        default_crew, created = CrewConfig.objects.get_or_create(
            name='Default Blog Post Crew',
            defaults={
                'description': 'Default crew configuration with Researcher, Writer, and Editor agents',
                'process_type': 'sequential',
                'is_default': True,
            }
        )
        if created:
            default_crew.agents.add(researcher, writer, editor)
            self.stdout.write(self.style.SUCCESS('Created Default Crew Configuration'))
        else:
            self.stdout.write('Default crew configuration already exists')
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded default agents, tasks, and crew configuration!'))

