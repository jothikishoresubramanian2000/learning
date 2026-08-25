# Writes a text string to a file, overwriting if it exists
with open('python-basics/13_files_json/output_summary.txt', 'w') as file:
    content = file.write('Cisco purchase request summary created.')

print(content)