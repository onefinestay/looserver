from sqlalchemy.sql import func

from looserver.db import Session, Loo, Event


class Reporter(object):
    def __init__(self):
        self.session = Session()

    def report(self):
        session = self.session

        loos = session.query(Loo).all()
        for loo in loos:
            print loo.label
            print "======"
            print "Times used:", self.times_used(loo)
            print "Total time in use:", self.total_time_in_use(loo)

    def times_used(self, loo):
        session = self.session

        events = session.query(Event).filter(
            Event.loo == loo,
            Event.in_use == True
        ).count()

        return events

    def total_time_in_use(self, loo):
        session = self.session

        total_time = session.query(func.sum(Event.seconds_in_state)).filter(
            Event.loo == loo,
            Event.in_use == True
        ).scalar()

        return total_time
