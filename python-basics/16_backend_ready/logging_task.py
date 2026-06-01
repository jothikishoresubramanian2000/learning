# Logs PR submission steps at INFO and supplier risk at WARNING level
import logging

logging.basicConfig(level=logging.INFO)

logging.info("PR-101 submitted")
logging.info("Budget check passes")
logging.warning("Supplier risk level is High")