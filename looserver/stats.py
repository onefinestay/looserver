from sqlalchemy.sql import func

from looserver.db import Session, Loo, Event


class Reporter(object):
    def __init__(self, since=None):
        self.session = Session()
        self.since = since

    def report(self):
        stats = self.get_stats()
        for loo in stats.values():
            print loo['loo']['label']
            print "======"
            print "Times used:", loo['stats']['times_used']
            print "Total time in use:", loo['stats']['total_time_in_use']

    def get_stats(self):
        session = self.session

        loos = session.query(Loo).all()

        stats = {}
        for loo in loos:
            total_time_in_use = self.total_time_in_use(loo)
            times_used = self.times_used(loo)

            average_time_in_use = total_time_in_use / times_used

            stats[loo.identifier] = {
                'loo': loo.as_dict(),
                'stats': [
                    {
                        'label': 'Number of visits',
                        'value': times_used,
                        'unit': 'counter',
                    },
                    {
                        'label': 'Total time in use',
                        'value': total_time_in_use,
                        'unit': 'seconds',
                    },
                    {
                        'label': 'Average visit time',
                        'value': average_time_in_use,
                        'unit': 'seconds',
                    },
                ]
            }

        return stats

    def times_used(self, loo):
        session = self.session

        events = session.query(Event).filter(
            Event.loo == loo,
            Event.in_use == True,
        )

        if self.since is not None:
            events = events.filter(
                Event.timestamp > self.since
            )

        return events.count()

    def total_time_in_use(self, loo):
        session = self.session

        total_time = session.query(func.sum(Event.seconds_in_state)).filter(
            Event.loo == loo,
            Event.in_use == True
        ).scalar()

        return total_time
