# Pydantic model for supplier with validated fields including bool type
from pydantic import BaseModel

class SupplierInfo(BaseModel):
    supplier_id: str
    name: str
    risk_level: str
    is_active: bool

pr = SupplierInfo(supplier_id= 'SUP-001', name = 'Cisco', risk_level= "Low", is_active=True)

print(pr.supplier_id)
print(pr.name)
print(pr.risk_level)
print(pr.is_active)
