prs = [
    {"pr_id": "PR-101", "amount": 50000},
    {"pr_id": "PR-102", "amount": 120000},
    {"pr_id": "PR-103", "amount": 8000},
    {"pr_id": "PR-104", "amount": 200000},
]


def filter_big_prs(prs: list, threshold: int) -> list:
    high_list =[]
    for pr in prs:
        if pr['amount'] > threshold:
            high_list.append(pr)
    return high_list

big_prs = filter_big_prs(prs,100000)

for pr in big_prs:
    print(f'{pr['pr_id']} | ${pr['amount']:,}')