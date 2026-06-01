# Reading exercise: FastAPI decorator pattern shown as commented example
# @app.get("/purchase-requests/101")
def get_purchase_request():
    return 'PR-101 details'

print(get_purchase_request())