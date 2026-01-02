from crewai import Agent


def get_researcher_agent(llm):
    """
    Create and return a researcher agent.
    
    Args:
        llm: The language model to use
        
    Returns:
        Configured Agent instance
    """
    return Agent(
        role='Research Specialist',
        goal='Gather comprehensive and accurate information about the given topic, including key facts, statistics, and insights',
        backstory="""You are an expert researcher with years of experience in gathering 
        and analyzing information. You have a keen eye for detail and always ensure 
        that the information you collect is accurate, relevant, and well-organized. 
        You excel at finding the most important points and presenting them in a clear, 
        structured manner that will be useful for content creation.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
    )

