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

    def times_used(self, loo):
        session = self.session

        events = session.query(Event).filter(
            Event.loo == loo,
            Event.in_use == True
        ).count()

        return events
