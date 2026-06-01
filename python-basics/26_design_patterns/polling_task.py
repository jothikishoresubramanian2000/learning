import time
count = 0
def status_check():
    global count 

    count += 1
    if count >= 15:
        return 'complete'
    return 'processing'

def wait_for_job(job_id, interval = 1, timeout = 10):
    elasped = 0

    while elasped < timeout:
        status = status_check()
        if status == 'complete':
            print(f'Job {job_id} completed')
            return True
        time.sleep(interval)
        elasped += interval
        print(f'Job {job_id}: processing')
    print(f'Job {job_id} timed out')   # ← add this — runs when loop exits without completing
    return False

if wait_for_job("JOB-101"):
    print('JOB-101 done')
