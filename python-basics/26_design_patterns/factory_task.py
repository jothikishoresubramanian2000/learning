# Factory Pattern — one function returns the right object based on input config.
# Task: build create_llm(provider) factory that returns a GroqLLM with .ask() method.

from groq import Groq
import os

class GroqLLM:
    def __init__(self):
        self.client = _client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    def ask(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": f""" You are a pico assitant, analyse the user question{prompt} and 
                       answer as per below following rules
                    if amount > $10000 - needs finance approval
                       
    task = analyse and answer
                    """}]
        )
        return response.choices[0].message.content

def create_llm(provider: str):
    if provider == "groq":
        return GroqLLM()
    # if provider == "openai": return OpenAILLM()  ← add later, nothing else changes

llm = create_llm("groq")
print(llm.ask("Does a $150,000 IT purchase need finance approval? One sentence."))
