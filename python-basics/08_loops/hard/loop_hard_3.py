# Task: Count words from user text using split and loop.
document_text = input()
words = document_text.split()

count = 0

for word in words:
    count += 1

print(count)