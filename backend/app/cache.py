"""
Caching service for search results
Using in-memory cache with TTL (time to live)
"""
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any, Dict, List
from functools import wraps
import time

class CacheManager:
    def __init__(self, ttl: int = 300):  # 5 minutes default TTL
        self.cache: Dict[str, tuple] = {}
        self.ttl = ttl
    
    def get_key(self, *args, **kwargs) -> str:
        """
        Generate cache key từ arguments
        """
        key_data = f"{str(args)}{json.dumps(kwargs, sort_keys=True, default=str)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set cache value với TTL
        """
        expire_time = time.time() + (ttl or self.ttl)
        self.cache[key] = (value, expire_time)
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get cache value nếu chưa expire
        """
        if key not in self.cache:
            return None
        
        value, expire_time = self.cache[key]
        
        # Check if expired
        if time.time() > expire_time:
            del self.cache[key]
            return None
        
        return value
    
    def delete(self, key: str) -> None:
        """
        Delete cache entry
        """
        if key in self.cache:
            del self.cache[key]
    
    def clear(self) -> None:
        """
        Clear all cache
        """
        self.cache.clear()
    
    def cleanup_expired(self) -> None:
        """
        Remove expired entries (run periodically)
        """
        current_time = time.time()
        expired_keys = [
            k for k, (_, expire_time) in self.cache.items()
            if current_time > expire_time
        ]
        for key in expired_keys:
            del self.cache[key]

# Global cache manager instance
search_cache = CacheManager(ttl=600)  # 10 minutes for search results
availability_cache = CacheManager(ttl=300)  # 5 minutes for availability

def cache_result(cache_manager: CacheManager, ttl: Optional[int] = None):
    """
    Decorator to cache function results
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache_manager.get_key(*args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_manager.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator
