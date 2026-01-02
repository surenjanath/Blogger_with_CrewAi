# Usage Guide

Complete guide on how to use the Blog Post Builder application.

## Getting Started

### Prerequisites

Before using the application, ensure:

1. **Ollama is installed and running**:
   ```bash
   ollama serve
   ```

2. **A model is downloaded**:
   ```bash
   ollama pull llama3
   # Or other models like:
   # ollama pull mistral
   # ollama pull llama3.2
   ```

3. **Django server is running**:
   ```bash
   python manage.py runserver
   ```

4. **Ollama settings are configured**:
   - Navigate to `/settings/`
   - Configure Ollama base URL and model
   - Test connection
   - Set as active

## Generating a Blog Post

### Step-by-Step Process

1. **Navigate to New Post Page**:
   - Click the "+" button in the left navigation
   - Or go to `/new/` directly

2. **Fill in Blog Post Details**:

   **Topic** (Required):
   - Enter the main subject of your blog post
   - Example: "The Future of Artificial Intelligence"

   **Subtitle** (Optional):
   - Add a subtitle for more context
   - Example: "Exploring AI trends in 2024"

   **Target Audience** (Optional):
   - Add tags describing your audience
   - Examples: `developers`, `tech enthusiasts`, `beginners`
   - Separate multiple tags with commas

   **Key Points** (Optional):
   - List important points to cover
   - Example: "Machine learning, neural networks, automation, ethics"

   **Examples** (Optional):
   - Provide specific examples to include
   - Example: "ChatGPT, self-driving cars, medical diagnosis"

   **Tone** (Optional):
   - Select writing style:
     - `friendly`: Conversational and approachable
     - `professional`: Formal and business-oriented
     - `casual`: Relaxed and informal
     - `formal`: Academic and structured
     - `humorous`: Light-hearted with humor
     - `informative`: Factual and educational

   **Length** (Optional):
   - `short`: 300-500 words
   - `medium`: 500-1000 words (default)
   - `long`: 1000+ words (aims for 1200-1500)

3. **Click "Generate Blog Post"**:
   - The system will create a blog post record
   - Status will change to "processing"
   - You'll be redirected to the generation page

4. **Monitor Progress**:
   - Watch real-time progress updates
   - See which agent is currently working
   - View current task being executed
   - Progress percentage updates automatically

5. **Review Generated Content**:
   - Once complete, the blog post will be displayed
   - Content is in Markdown format
   - Title is automatically extracted

6. **Edit if Needed**:
   - Click "Edit" to modify the content
   - Update title, topic, or content
   - Save changes

7. **Save the Post**:
   - Click "Save" to mark as saved
   - Saved posts appear in your history

## Managing Blog Posts

### Viewing History

1. **Navigate to History**:
   - Click the clock icon in left navigation
   - Or go to `/history/`

2. **Browse Posts**:
   - See all completed blog posts
   - View creation date and time
   - See word count and reading time

3. **Search Posts**:
   - Use the search bar to find posts
   - Search by topic, title, or content
   - Results update as you type

4. **View Post Details**:
   - Click on any post to view full content
   - Edit or delete from the detail view

### Editing Posts

1. **Open Post for Editing**:
   - Click on a post in history
   - Or click "Edit" button

2. **Edit Content**:
   - Modify the title
   - Update the topic
   - Edit the content (Markdown supported)
   - Save changes

3. **Delete Posts**:
   - Click "Delete" button
   - Confirm deletion
   - Post is permanently removed

## Managing Agents

### Viewing Agents

1. **Navigate to Settings**:
   - Click the settings icon in left navigation
   - Or go to `/settings/`

2. **View Agents Section**:
   - See all configured agents
   - View agent details (role, goal, backstory)
   - Check active status

### Creating Custom Agents

1. **Add New Agent**:
   - Click "Add Agent" in settings
   - Fill in:
     - **Name**: Descriptive name (e.g., "SEO Specialist")
     - **Role**: Agent's role (e.g., "SEO Expert")
     - **Goal**: What the agent should accomplish
     - **Backstory**: Context and personality
     - **Order**: Execution order (lower numbers first)
     - **Is Active**: Enable/disable agent

2. **Example Agent**:
   ```
   Name: SEO Specialist
   Role: SEO Optimization Expert
   Goal: Optimize blog posts for search engines with keywords and meta descriptions
   Backstory: You are an SEO expert with 10+ years of experience optimizing content for search engines. You understand keyword research, on-page optimization, and content structure that ranks well.
   Order: 3
   Is Active: ✓
   ```

### Editing Agents

1. **Select Agent**:
   - Click on an agent in the list
   - Or use the edit button

2. **Update Details**:
   - Modify any field
   - Save changes
   - Changes take effect for new blog posts

### Deactivating Agents

- Uncheck "Is Active" to disable an agent
- Disabled agents won't be used in crew configurations

## Managing Tasks

### Creating Tasks

1. **Add New Task**:
   - Go to Settings → Tasks
   - Click "Add Task"
   - Fill in:
     - **Name**: Task name
     - **Description**: What the task should do
     - **Agent**: Which agent performs this task
     - **Expected Output**: What should be produced
     - **Depends On**: Previous task (optional)
     - **Order**: Execution order
     - **Is Active**: Enable/disable

2. **Example Task**:
   ```
   Name: SEO Optimization
   Description: Optimize the blog post with relevant keywords, meta description, and SEO best practices
   Agent: SEO Specialist
   Expected Output: SEO-optimized blog post with keywords and meta description
   Depends On: Editing Task
   Order: 4
   ```

### Task Dependencies

- Tasks can depend on other tasks
- Dependent tasks wait for dependencies to complete
- Useful for sequential workflows:
  - Research → Writing → Editing → SEO

## Managing Crew Configurations

### Creating Crew Configurations

1. **Add Crew Configuration**:
   - Go to Settings → Crew Configurations
   - Click "Add Crew Configuration"
   - Fill in:
     - **Name**: Configuration name
     - **Description**: What this configuration does
     - **Process Type**: `sequential` or `parallel`
     - **Agents**: Select multiple agents
     - **Is Default**: Set as default

2. **Process Types**:
   - **Sequential**: Tasks execute one after another (recommended)
   - **Parallel**: Tasks can run simultaneously (if no dependencies)

3. **Selecting Agents**:
   - Choose which agents to include
   - Agents must have active tasks
   - Order matters for sequential processing

### Using Crew Configurations

- **Default Configuration**: Used automatically if no config is specified
- **Custom Configuration**: Select when generating blog post
- **Multiple Configurations**: Create different workflows for different use cases

## Managing Ollama Settings

### Configuring Ollama

1. **Add Ollama Settings**:
   - Go to Settings → Ollama Settings
   - Click "Add Ollama Settings"
   - Fill in:
     - **Name**: Settings name
     - **Base URL**: Ollama server URL (default: `http://localhost:11434`)
     - **Model**: Model name (e.g., `llama3`, `mistral`)
     - **Temperature**: 0.0 to 2.0 (default: 0.7)
     - **Is Active**: Set as active

2. **Test Connection**:
   - Click "Test Connection"
   - Verify Ollama is accessible
   - Check for errors

3. **Fetch Available Models**:
   - Click "Fetch Models"
   - See all models available in Ollama
   - Select a model from the list

4. **Test Model**:
   - Click "Test Model"
   - Verify the model responds correctly
   - Check response quality

### Multiple Ollama Instances

- Create multiple settings for different models
- Switch between them by setting one as active
- Useful for:
  - Testing different models
  - Using remote Ollama servers
  - Different temperature settings

## Dashboard

### Viewing Statistics

The dashboard (`/`) shows:

- **Total Posts**: All blog posts created
- **Completed Posts**: Successfully generated posts
- **Saved Posts**: Posts marked as saved
- **Total Words**: Combined word count of all posts
- **Recent Posts**: Latest 5 completed posts

### Quick Actions

- **New Post**: Create a new blog post
- **History**: View all posts
- **Settings**: Configure application

## Tips and Best Practices

### For Better Results

1. **Provide Detailed Input**:
   - Clear topic description
   - Specific key points
   - Relevant examples
   - Appropriate tone selection

2. **Choose Right Length**:
   - Short: Quick reads, summaries
   - Medium: Standard blog posts
   - Long: Comprehensive guides, in-depth articles

3. **Select Appropriate Tone**:
   - Match tone to your audience
   - Consider the topic's nature
   - Professional for business, friendly for general

4. **Use Target Audience Tags**:
   - Helps agents tailor content
   - More specific = better results
   - Examples: `developers`, `beginners`, `experts`

### Performance Tips

1. **Model Selection**:
   - Larger models = better quality but slower
   - Smaller models = faster but may sacrifice quality
   - Test different models for your use case

2. **Temperature Settings**:
   - Lower (0.3-0.5): More focused, consistent
   - Medium (0.7): Balanced creativity and consistency
   - Higher (0.9-1.2): More creative, varied

3. **System Resources**:
   - Ensure adequate RAM for model
   - Close other applications if slow
   - Consider using smaller models on limited hardware

### Workflow Optimization

1. **Create Custom Agents**:
   - Tailor agents to your specific needs
   - Define clear goals and backstories
   - Test and refine agent definitions

2. **Organize Tasks**:
   - Create logical task sequences
   - Use dependencies appropriately
   - Set correct execution order

3. **Save Templates**:
   - Create crew configurations for common use cases
   - Switch between configurations as needed
   - Set frequently used config as default

## Troubleshooting

### Common Issues

- **Generation takes too long**: Try a smaller model or reduce length
- **Poor quality output**: Adjust temperature or try different model
- **Connection errors**: Verify Ollama is running
- **Progress not updating**: Check browser console for errors

For more detailed troubleshooting, see [Troubleshooting Guide](TROUBLESHOOTING.md).

