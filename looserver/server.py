import logging
from time import sleep
from datetime import datetime

import pytz

from looserver.db import Session, Loo, Event

logger = logging.getLogger(__name__)


def poll_loo(identifier):
    with open('/tmp/fake_loo_{}'.format(identifier)) as handle:
        status = handle.read().strip()
    return bool(status)


class Server(object):
    def __init__(self):
        self.session = Session()
        self.loos = self.session.query(Loo).all()
        self.running = True

    def run(self):
        logger.info("Starting server")
        while self.running:
            self.tick()
            sleep(1)

    def stop(self):
        self.running = False
        logger.info("Stopping server")

    def tick(self):
        # polling RF
        for loo in self.loos:
            in_use = poll_loo(loo.identifier)
            logging.info("Status of {}: {}".format(loo.label, in_use))
            if in_use != loo.in_use:
                self.update_status(loo, in_use)

    def update_status(self, loo, in_use):
        session = self.session

        loo.in_use = in_use
        event = Event(timestamp=datetime.now(pytz.utc), loo=loo, in_use=in_use)
        session.add(event)
        session.commit()
