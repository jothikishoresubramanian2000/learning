list_prac = ["F", "L", "A", "M", "E", "S"]

name1 = input("Enter the name 1: ")
name2 = input("Enter the name 2: ")

name1 = name1.strip().lower().replace(" ", "")
name2 = name2.strip().lower().replace(" ", "")

for char in name1:
    if char in name2:
        name1 = name1.replace(char, "", 1)
        name2 = name2.replace(char, "", 1)

count = len(name2) + len(name1)

current_index = 0

while len(list_prac) > 1:
    remove_index = (current_index + count - 1) % len(list_prac)
    removed_letter = list_prac.pop(remove_index)
    current_index = remove_index

    print(f"Removed: {removed_letter}")
    print(f"Remaining: {list_prac}")

final_letter = list_prac[0]

if final_letter == "F":
    result = "Friends"
elif final_letter == "L":
    result = "Love"
elif final_letter == "A":
    result = "Affection"
elif final_letter == "M":
    result = "Marriage"
elif final_letter == "E":
    result = "Enemy"
else:
    result = "Siblings"

print(f"Remaining count: {count}")
print(f"FLAMES result: {result}")
