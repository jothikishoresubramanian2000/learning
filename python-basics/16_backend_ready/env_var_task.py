# Reads PROCIQ_ENV environment variable and prints its value
import os

proiq_env = os.environ.get("PROCIQ_ENV")
print(proiq_env)
