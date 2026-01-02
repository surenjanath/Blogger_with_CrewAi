import os
import threading
import time
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from ..models import Agent as AgentModel, Task as TaskModel, CrewConfig, OllamaSettings, BlogPost

# Load environment variables
load_dotenv()

# Explicitly disable OpenAI to ensure offline mode
# Remove any OpenAI API key from environment to prevent fallback
if 'OPENAI_API_KEY' in os.environ:
    del os.environ['OPENAI_API_KEY']


def get_ollama_llm():
    """
    Get CrewAI LLM instance configured for Ollama from database settings or fallback to environment variables.
    Uses CrewAI's LLM class with ollama/ prefix for the model name.
    
    Returns:
        LLM instance configured with active Ollama settings
    """
    try:
        # Try to get active Ollama settings from database
        ollama_settings = OllamaSettings.objects.filter(is_active=True).first()
        if ollama_settings:
            # CrewAI LLM expects model name with "ollama/" prefix
            model_name = ollama_settings.model
            if not model_name.startswith('ollama/'):
                model_name = f"ollama/{model_name}"
            
            llm = LLM(
                model=model_name,
                base_url=ollama_settings.base_url,
                temperature=ollama_settings.temperature,
            )
            # Ensure the LLM is properly configured
            print(f"Using Ollama LLM: {model_name} at {ollama_settings.base_url}")
            return llm
    except Exception as e:
        print(f"Error loading Ollama settings from database: {e}")
        import traceback
        traceback.print_exc()
        pass
    
    # Fallback to environment variables
    base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    model = os.getenv('OLLAMA_MODEL', 'llama3')
    temperature = float(os.getenv('OLLAMA_TEMPERATURE', '0.7'))
    
    # CrewAI LLM expects model name with "ollama/" prefix
    if not model.startswith('ollama/'):
        model = f"ollama/{model}"
    
    llm = LLM(
        model=model,
        base_url=base_url,
        temperature=temperature,
    )
    print(f"Using Ollama LLM (env): {model} at {base_url}")
    return llm


# Don't initialize LLM at module level - create it when needed
# This prevents issues with Django models not being loaded yet


class ProgressTracker:
    """
    Tracks and updates progress for blog post generation.
    Updates BlogPost record with current agent, task, and progress information.
    """
    
    def __init__(self, blog_post_id: int, total_tasks: int):
        """
        Initialize progress tracker.
        
        Args:
            blog_post_id: ID of the BlogPost to update
            total_tasks: Total number of tasks to execute
        """
        self.blog_post_id = blog_post_id
        self.total_tasks = total_tasks
        self.completed_tasks = 0
        self.current_task_index = 0
    
    def update_progress(self, agent_name: str = '', task_description: str = '', 
                       message: str = '', percentage: int = None):
        """
        Update progress in the database.
        
        Args:
            agent_name: Name of currently active agent
            task_description: Description of current task
            message: Detailed progress message
            percentage: Progress percentage (0-100). If None, calculated automatically.
        """
        try:
            blog_post = BlogPost.objects.get(id=self.blog_post_id)
            
            if percentage is None:
                # Calculate percentage based on completed tasks
                if self.total_tasks > 0:
                    percentage = int((self.completed_tasks / self.total_tasks) * 100)
                else:
                    percentage = 0
            
            blog_post.current_agent = agent_name
            blog_post.current_task = task_description
            blog_post.progress_message = message
            blog_post.progress_percentage = min(100, max(0, percentage))
            blog_post.save(update_fields=['current_agent', 'current_task', 'progress_message', 'progress_percentage'])
        except BlogPost.DoesNotExist:
            pass
        except Exception as e:
            print(f"Error updating progress: {e}")
    
    def task_started(self, agent_name: str, task_description: str, task_index: int = None):
        """
        Called when a task starts.
        
        Args:
            agent_name: Name of the agent executing the task
            task_description: Description of the task
            task_index: Index of the task (0-based). If None, uses current_task_index.
        """
        if task_index is not None:
            self.current_task_index = task_index
        
        message = f"{agent_name}: {task_description}"
        percentage = int((self.current_task_index / self.total_tasks) * 100) if self.total_tasks > 0 else 0
        self.update_progress(agent_name, task_description, message, percentage)
    
    def task_completed(self, agent_name: str, task_description: str):
        """
        Called when a task completes.
        
        Args:
            agent_name: Name of the agent that completed the task
            task_description: Description of the completed task
        """
        self.completed_tasks += 1
        self.current_task_index += 1
        message = f"{agent_name}: Completed {task_description}"
        percentage = int((self.completed_tasks / self.total_tasks) * 100) if self.total_tasks > 0 else 0
        self.update_progress(agent_name, task_description, message, percentage)
    
    def set_initializing(self, message: str = "Initializing crew..."):
        """Set initializing state."""
        self.update_progress('', '', message, 0)
    
    def set_finalizing(self, message: str = "Finalizing blog post..."):
        """Set finalizing state."""
        self.update_progress('', '', message, 95)


def create_agent_from_model(agent_model: AgentModel, llm_instance=None):
    """
    Create a CrewAI Agent from a database Agent model.
    
    Args:
        agent_model: Agent model instance
        llm_instance: LLM instance to use (defaults to get_ollama_llm())
        
    Returns:
        CrewAI Agent instance
    """
    if llm_instance is None:
        llm_instance = get_ollama_llm()
    
    return Agent(
        role=agent_model.role,
        goal=agent_model.goal,
        backstory=agent_model.backstory,
        verbose=True,
        allow_delegation=False,
        llm=llm_instance,
    )


def create_task_from_model(task_model: TaskModel, crew_agent, dependent_tasks=None):
    """
    Create a CrewAI Task from a database Task model.
    
    Args:
        task_model: Task model instance
        crew_agent: CrewAI Agent instance to assign the task to
        dependent_tasks: Dictionary mapping task IDs to CrewAI Task instances
        
    Returns:
        CrewAI Task instance
    """
    context = []
    if task_model.depends_on and dependent_tasks:
        dependent_task = dependent_tasks.get(task_model.depends_on.id)
        if dependent_task:
            context.append(dependent_task)
    
    return Task(
        description=task_model.description,
        agent=crew_agent,
        expected_output=task_model.expected_output,
        context=context if context else None,
    )


def create_crew_from_config(crew_config: CrewConfig, topic: str = '', subtitle: str = '',
                           target_audience: list = None, key_points: str = '', 
                           examples: str = '', tone: str = 'friendly', length: str = 'medium'):
    """
    Create a CrewAI crew from a CrewConfig model.
    
    Args:
        crew_config: CrewConfig model instance
        topic: Blog post topic
        subtitle: Optional subtitle
        target_audience: List of target audience tags
        key_points: Key points to cover
        examples: Specific examples to include
        tone: Writing tone
        
    Returns:
        Configured Crew instance
    """
    if target_audience is None:
        target_audience = []
    
    # Get active agents from the config
    agents_models = crew_config.agents.filter(is_active=True).order_by('order')
    
    if not agents_models.exists():
        raise ValueError(f"No active agents found in crew config: {crew_config.name}")
    
    # Create CrewAI agents
    crew_agents = []
    agent_map = {}  # Map agent model ID to CrewAI agent
    
    # Get LLM instance once for all agents to ensure consistency
    current_llm = get_ollama_llm()
    
    for agent_model in agents_models:
        crew_agent = create_agent_from_model(agent_model, llm_instance=current_llm)
        crew_agents.append(crew_agent)
        agent_map[agent_model.id] = crew_agent
    
    # Get active tasks for these agents, ordered by dependencies
    tasks_models = TaskModel.objects.filter(
        agent__in=agents_models,
        is_active=True
    ).order_by('order', 'depends_on__order')
    
    # Build task dependency map
    task_map = {}  # Map task model ID to CrewAI task
    crew_tasks = []
    
    # First pass: create tasks without dependencies
    for task_model in tasks_models:
        if task_model.depends_on is None:
            crew_agent = agent_map[task_model.agent.id]
            crew_task = create_task_from_model(task_model, crew_agent, task_map)
            task_map[task_model.id] = crew_task
            crew_tasks.append(crew_task)
    
    # Second pass: create tasks with dependencies
    remaining_tasks = tasks_models.exclude(depends_on=None)
    max_iterations = len(remaining_tasks)  # Prevent infinite loops
    iteration = 0
    
    while remaining_tasks.exists() and iteration < max_iterations:
        iteration += 1
        for task_model in remaining_tasks:
            if task_model.depends_on.id in task_map:
                crew_agent = agent_map[task_model.agent.id]
                crew_task = create_task_from_model(task_model, crew_agent, task_map)
                task_map[task_model.id] = crew_task
                crew_tasks.append(crew_task)
                remaining_tasks = remaining_tasks.exclude(id=task_model.id)
    
    # Add remaining tasks (circular dependencies or missing dependencies)
    for task_model in remaining_tasks:
        crew_agent = agent_map[task_model.agent.id]
        crew_task = create_task_from_model(task_model, crew_agent, task_map)
        task_map[task_model.id] = crew_task
        crew_tasks.append(crew_task)
    
    # Enhance task descriptions with blog post context
    context_info = f"Topic: {topic}\n"
    if subtitle:
        context_info += f"Subtitle: {subtitle}\n"
    if target_audience:
        context_info += f"Target Audience: {', '.join(target_audience)}\n"
    if key_points:
        context_info += f"Key Points: {key_points}\n"
    if examples:
        context_info += f"Examples: {examples}\n"
    context_info += f"Tone: {tone}\n"
    
    # Add word count requirement based on length
    length_requirements = {
        'short': '300-500 words',
        'medium': '500-1000 words',
        'long': '1000+ words (aim for 1200-1500 words)'
    }
    word_count = length_requirements.get(length, '500-1000 words')
    context_info += f"Target Length: {word_count}\n"
    
    for task in crew_tasks:
        task.description = f"{context_info}\n\n{task.description}"
    
    # Determine process type
    process_type = Process.sequential if crew_config.process_type == 'sequential' else Process.hierarchical
    
    # Get LLM instance for the crew to ensure offline mode
    current_llm = get_ollama_llm()
    
    # Create crew with explicit LLM to prevent OpenAI fallback
    crew = Crew(
        agents=crew_agents,
        tasks=crew_tasks,
        process=process_type,
        verbose=True,
        llm=current_llm,  # Explicitly set LLM to ensure offline Ollama usage
    )
    
    return crew


def get_default_crew_config():
    """Get the default crew configuration or create one if none exists."""
    try:
        return CrewConfig.objects.filter(is_default=True).first()
    except:
        return None


def create_blog_post_crew(topic: str, subtitle: str = '', target_audience: list = None, 
                          key_points: str = '', examples: str = '', tone: str = 'friendly',
                          length: str = 'medium', crew_config_id: int = None):
    """
    Create and configure a CrewAI crew for blog post generation.
    
    Args:
        topic: The blog post topic
        subtitle: Optional subtitle
        target_audience: List of target audience tags
        key_points: Key points to cover
        examples: Specific examples to include
        tone: Writing tone (friendly, professional, etc.)
        crew_config_id: Optional crew configuration ID (uses default if not provided)
        
    Returns:
        Configured Crew instance
    """
    if target_audience is None:
        target_audience = []
    
    # Get crew config
    if crew_config_id:
        try:
            crew_config = CrewConfig.objects.get(id=crew_config_id)
        except CrewConfig.DoesNotExist:
            crew_config = get_default_crew_config()
    else:
        crew_config = get_default_crew_config()
    
    # Fallback to hardcoded agents if no config exists
    if not crew_config:
        return create_blog_post_crew_fallback(topic, subtitle, target_audience, key_points, examples, tone, length)
    
    return create_crew_from_config(crew_config, topic, subtitle, target_audience, key_points, examples, tone, length)


def create_blog_post_crew_fallback(topic: str, subtitle: str = '', target_audience: list = None, 
                                   key_points: str = '', examples: str = '', tone: str = 'friendly', length: str = 'medium'):
    """
    Fallback to hardcoded agents if no database config exists.
    This maintains backward compatibility.
    """
    from .researcher_agent import get_researcher_agent
    from .writer_agent import get_writer_agent
    from .editor_agent import get_editor_agent
    from .tasks import get_research_task, get_writing_task, get_editing_task
    
    if target_audience is None:
        target_audience = []
    
    # Get agents with current Ollama settings
    current_llm = get_ollama_llm()
    researcher = get_researcher_agent(current_llm)
    writer = get_writer_agent(current_llm)
    editor = get_editor_agent(current_llm)
    
    # Get tasks with additional context
    research_task = get_research_task(researcher, topic, key_points, examples)
    writing_task = get_writing_task(writer, research_task, topic, subtitle, target_audience, tone, length)
    editing_task = get_editing_task(editor, writing_task, length)
    
    # Create crew with explicit LLM to prevent OpenAI fallback
    crew = Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, writing_task, editing_task],
        process=Process.sequential,
        verbose=True,
        llm=current_llm,  # Explicitly set LLM to ensure offline Ollama usage
    )
    
    return crew


def generate_blog_post(topic: str, subtitle: str = '', target_audience: list = None,
                      key_points: str = '', examples: str = '', tone: str = 'friendly',
                      length: str = 'medium', crew_config_id: int = None, blog_post_id: int = None) -> str:
    """
    Generate a blog post for the given topic using CrewAI agents.
    
    Args:
        topic: The blog post topic
        subtitle: Optional subtitle
        target_audience: List of target audience tags
        key_points: Key points to cover
        examples: Specific examples to include
        tone: Writing tone
        crew_config_id: Optional crew configuration ID
        blog_post_id: Optional BlogPost ID for progress tracking
        
    Returns:
        Generated blog post content
    """
    # Initialize progress tracker if blog_post_id is provided
    progress_tracker = None
    if blog_post_id:
        # We'll count tasks after crew creation
        progress_tracker = ProgressTracker(blog_post_id, 0)  # Will update total_tasks later
        progress_tracker.set_initializing("Initializing crew and agents...")
    
    # Create crew
    if progress_tracker:
        progress_tracker.update_progress('', '', 'Creating crew configuration...', 5)
    
    crew = create_blog_post_crew(topic, subtitle, target_audience, key_points, examples, tone, length, crew_config_id)
    
    # Count total tasks for progress tracking
    total_tasks = len(crew.tasks) if hasattr(crew, 'tasks') and crew.tasks else 3  # Default to 3 if unknown
    if progress_tracker:
        progress_tracker.total_tasks = total_tasks
        progress_tracker.update_progress('', '', f'Crew ready with {total_tasks} tasks. Starting execution...', 10)
    
    # Execute crew with progress tracking using threading
    # Use a background thread to simulate progress updates during execution
    execution_done = threading.Event()
    execution_error = [None]
    result = None  # Initialize result variable
    
    def execute_crew():
        """Execute crew in a separate thread."""
        nonlocal result
        try:
            result = crew.kickoff()
        except Exception as e:
            execution_error[0] = e
        finally:
            execution_done.set()
    
    # Start execution in background thread
    exec_thread = threading.Thread(target=execute_crew)
    exec_thread.start()
    
    # Update progress during execution
    if progress_tracker and hasattr(crew, 'tasks') and crew.tasks:
        task_list = list(crew.tasks)
        base_percentage = 15
        percentage_per_task = (85 - base_percentage) / total_tasks if total_tasks > 0 else 0
        
        task_index = 0
        while not execution_done.is_set() and task_index < len(task_list):
            # Update progress for current task
            current_task = task_list[task_index]
            agent_name = current_task.agent.role if hasattr(current_task, 'agent') and hasattr(current_task.agent, 'role') else 'Agent'
            task_desc = current_task.description[:150] + '...' if len(current_task.description) > 150 else current_task.description
            
            # Calculate progress percentage
            current_progress = base_percentage + (task_index * percentage_per_task)
            progress_tracker.task_started(agent_name, task_desc, task_index)
            progress_tracker.update_progress(agent_name, task_desc, 
                                           f"{agent_name} is working on: {task_desc}", 
                                           int(current_progress))
            
            # Wait a bit before moving to next task (simulate task progression)
            # Check if execution is done every 2 seconds
            for _ in range(10):  # Check 10 times (20 seconds max per task)
                if execution_done.wait(timeout=2):
                    break
                # Gradually increase progress within task
                if task_index < len(task_list) - 1:
                    sub_progress = current_progress + (percentage_per_task * 0.1 * (_ + 1))
                    progress_tracker.update_progress(agent_name, task_desc,
                                                   f"{agent_name} is working on: {task_desc}",
                                                   int(min(sub_progress, base_percentage + ((task_index + 1) * percentage_per_task))))
            
            # Mark task as completed
            progress_tracker.task_completed(agent_name, task_desc)
            task_index += 1
    
    # Wait for execution to complete
    exec_thread.join()
    
    if execution_error[0]:
        raise execution_error[0]
    
    # After kickoff completes, we know all tasks are done
    if progress_tracker:
        # Mark all tasks as completed
        progress_tracker.completed_tasks = total_tasks
        progress_tracker.current_task_index = total_tasks
        progress_tracker.set_finalizing("Processing final output...")
    
    # Extract the final blog post from the result
    if hasattr(result, 'raw'):
        content = result.raw
    elif hasattr(result, 'output'):
        content = result.output
    elif isinstance(result, str):
        content = result
    else:
        # Fallback: convert to string
        content = str(result)
    
    if progress_tracker:
        progress_tracker.update_progress('', '', 'Blog post generation completed!', 100)
    
    return content
