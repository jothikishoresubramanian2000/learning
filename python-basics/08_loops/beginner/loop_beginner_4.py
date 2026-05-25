# Task: Count letters in Cisco manually.
count = 0
for letter in "Cisco":
    letter = letter.lower()

    if letter >= 'a' and letter <= 'z':
        count += 1

print(count)