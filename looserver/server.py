import logging
from time import sleep
from datetime import datetime

import redis
from sqlalchemy import desc

from looserver import settings
from looserver.db import Session, Loo, Event

logger = logging.getLogger(__name__)


def poll_loo(identifier):
    with open('/tmp/fake_loo_{}'.format(identifier)) as handle:
        status = handle.read().strip()
    return bool(status)


class Server(object):
    def __init__(self):
        self.session = Session()
        self.redis = redis.StrictRedis()

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
        now = datetime.now()

        previous_event = (
            session.query(Event)
            .filter(Event.loo == loo)
            .order_by(desc(Event.timestamp))
        ).first()

        if previous_event is not None:
            diff = (now - previous_event.timestamp).total_seconds()
            previous_event.seconds_in_state = diff

        event = Event(timestamp=now, loo=loo, in_use=in_use)
        session.add(event)

        session.commit()

        self.redis.publish(settings.EVENTS_CHANNEL, {
            'loo': loo.identifier,
            'in_use': in_use,
        })
