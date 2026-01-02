from crewai import Task


def get_research_task(researcher_agent, topic: str, key_points: str = '', examples: str = ''):
    """
    Create a research task for the researcher agent.
    
    Args:
        researcher_agent: The researcher agent instance
        topic: The blog post topic to research
        key_points: Optional key points to focus on
        examples: Optional specific examples to research
        
    Returns:
        Configured Task instance
    """
    description = f"""Research the topic: "{topic}"
    
    Your task is to gather comprehensive information about this topic. Include:
    - Key facts and statistics
    - Important concepts and definitions
    - Relevant examples or case studies
    - Current trends or developments
    - Any other relevant information that would be useful for writing a blog post"""
    
    if key_points:
        description += f"\n\nPay special attention to these key points: {key_points}"
    
    if examples:
        description += f"\n\nInclude research on these specific examples: {examples}"
    
    description += "\n\nOrganize your research findings in a clear, structured format that can be easily used by a content writer."
    
    return Task(
        description=description,
        agent=researcher_agent,
        expected_output="A comprehensive research summary with key points, facts, and insights about the topic, organized in a clear structure.",
    )


def get_writing_task(writer_agent, research_task: Task, topic: str = '', subtitle: str = '',
                    target_audience: list = None, tone: str = 'friendly', length: str = 'medium'):
    """
    Create a writing task for the writer agent.
    
    Args:
        writer_agent: The writer agent instance
        research_task: The research task that provides the input
        topic: The blog post topic
        subtitle: Optional subtitle
        target_audience: List of target audience tags
        tone: Writing tone to use
        
    Returns:
        Configured Task instance
    """
    if target_audience is None:
        target_audience = []
    
    description = """Write a complete blog post based on the research provided.
    
    Use the research findings from the previous task to create an engaging blog post. 
    The blog post should:
    - Have a compelling introduction that hooks the reader
    - Include well-structured body sections with clear headings
    - Be informative and easy to read
    - Include relevant examples or insights from the research
    - Have a strong conclusion that summarizes key points"""
    
    if topic:
        description += f"\n\nTopic: {topic}"
    if subtitle:
        description += f"\nSubtitle/Theme: {subtitle}"
    if target_audience:
        description += f"\nTarget Audience: {', '.join(target_audience)}"
        description += "\n\nWrite the content specifically for this audience, using language and examples that resonate with them."
    if tone:
        tone_descriptions = {
            'friendly': 'Use a warm, approachable, and conversational tone',
            'professional': 'Use a formal, business-appropriate tone',
            'casual': 'Use a relaxed, informal, and conversational tone',
            'formal': 'Use a formal, academic, and structured tone',
            'humorous': 'Use a light, witty, and entertaining tone',
            'informative': 'Use a clear, educational, and fact-focused tone'
        }
        description += f"\n\nTone: {tone_descriptions.get(tone, 'Use an appropriate tone')}"
    
    # Add word count requirement based on length
    length_requirements = {
        'short': '300-500 words',
        'medium': '500-1000 words',
        'long': '1000+ words (aim for 1200-1500 words)'
    }
    word_count = length_requirements.get(length, '500-1000 words')
    description += f"\n\nIMPORTANT: The blog post must be exactly {word_count}. Make sure you write the complete content within this word count range and flows naturally from start to finish."
    
    return Task(
        description=description,
        agent=writer_agent,
        expected_output="A complete, well-structured blog post with introduction, body sections, and conclusion, ready for editing.",
        context=[research_task],
    )


def get_editing_task(editor_agent, writing_task: Task, length: str = 'medium'):
    """
    Create an editing task for the editor agent.
    
    Args:
        editor_agent: The editor agent instance
        writing_task: The writing task that provides the blog post to edit
        length: Target length of the blog post
        
    Returns:
        Configured Task instance
    """
    # Add word count requirement based on length
    length_requirements = {
        'short': '300-500 words',
        'medium': '500-1000 words',
        'long': '1000+ words (aim for 1200-1500 words)'
    }
    word_count = length_requirements.get(length, '500-1000 words')
    
    return Task(
        description=f"""Review and polish the blog post from the previous task.
        
        Your task is to:
        - Check for clarity and readability
        - Ensure proper grammar and spelling
        - Verify the structure and flow
        - Make sure the content is engaging and well-organized
        - Fix any inconsistencies or errors
        - Ensure the post is publication-ready
        - IMPORTANT: Verify the blog post is within the target length of {word_count}. If it's too short, expand it. If it's too long, condense it while maintaining quality.
        
        Make improvements where needed, but maintain the original style and voice of the writer.""",
        agent=editor_agent,
        expected_output=f"A polished, publication-ready blog post that is clear, error-free, engaging, and exactly {word_count}.",
        context=[writing_task],
    )

