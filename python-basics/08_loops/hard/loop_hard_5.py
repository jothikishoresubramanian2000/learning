# Task: Count approved statuses from five user inputs.
count = 0
for number in range(1,6):
    approval_status = input("Enter the status: ")

    approval_status = approval_status.strip().lower()

    if approval_status == 'approved':
        count += 1
    
print()
print(f'Approved count: {count}')