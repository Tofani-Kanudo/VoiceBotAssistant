import logging
import datetime
import traceback
log_file = None
def setup_logging():
    global log_file
    if log_file is None:
        log_file = f'logs/voicebot_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )

def log_error_with_traceback(logger, message):
    logger.error(f"{message}\n{traceback.format_exc()}") 