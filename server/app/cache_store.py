from cachetools import TTLCache

# 1 minut TTL
cache = TTLCache(maxsize=512, ttl=60)

def cache_key(*parts):
    return ":".join(str(p) for p in parts)

def invalidate_prefix(prefix: str):
    """Obrisi sve kljuceve koji pocinju prefiksom."""
    keys = [k for k in list(cache.keys()) if str(k).startswith(prefix)]
    for k in keys:
        cache.pop(k, None)
