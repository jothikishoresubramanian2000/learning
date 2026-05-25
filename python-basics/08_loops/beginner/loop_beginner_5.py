# Task: Count letter p in a text.
sentence = 'purchase approval pending'
count = 0

for letter in sentence:
    if letter == 'P' or letter =='p':
        count += 1

print(count)