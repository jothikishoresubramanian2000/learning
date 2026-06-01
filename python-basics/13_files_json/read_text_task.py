# Reads and prints contents of a text file using with/open
with open('python-basics/13_files_json/sample_policy.txt', 'r') as file:
    content = file.read()

print(content)