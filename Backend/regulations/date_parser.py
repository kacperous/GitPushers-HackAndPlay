"""
Helper functions to generate random dates
"""
import random
from datetime import date, timedelta


def parse_and_generate_date(termin_text=None):
    """
    Generate random date within last 2 years or next year (completely random)
    
    Args:
        termin_text: Not used anymore, kept for compatibility
    
    Returns:
        date: Random date between 2 years ago and 1 year from now
    """
    try:
        today = date.today()
        
        # Start date: 2 years ago
        start_date = today - timedelta(days=730)  # ~2 years
        
        # End date: 1 year from now
        end_date = today + timedelta(days=365)  # ~1 year
        
        # Random number of days between start and end
        days_between = (end_date - start_date).days
        random_days = random.randint(0, days_between)
        random_date = start_date + timedelta(days=random_days)
        
        return random_date
    
    except (ValueError, OverflowError):
        return None

