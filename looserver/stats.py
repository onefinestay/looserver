from collections import defaultdict

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

        per_loo_stats = []
        for loo in loos:
            total_time_in_use = self.total_time_in_use(loo)
            times_used = self.times_used(loo)

            average_time_in_use = total_time_in_use / times_used

            per_loo_stats.append({
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
            })

        hours, count, duration_total, duration_average = self.series_data()

        total_stats = {
            'hours': hours,
            'number_of_visits': count,
            'total_duration': duration_total,
            'average_duration': duration_average,
        }

        return {
            'per_loo_stats': per_loo_stats,
            'total_stats': total_stats,
        }

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

    def series_data(self):
        session = self.session

        if self.since is None:
            return [], [], [], []

        start = self.since.hour

        hours = [h % 24 for h in xrange(start, start + 24)]

        data_count = [0] * 24
        data_duration_total = [0] * 24
        data_duration_average = []

        query = session.query(Event).filter(
            Event.timestamp > self.since,
            Event.in_use == True
        )

        for event in query:
            hour = event.timestamp.hour
            index = hour - start

            if event.seconds_in_state is None:
                continue

            data_count[index] += 1
            data_duration_total[index] += event.seconds_in_state

        for count, total in zip(data_count, data_duration_total):
            try:
                data_duration_average.append(
                    total / count
                )
            except ZeroDivisionError:
                data_duration_average.append(0)

        return hours, data_count, data_duration_total, data_duration_average
