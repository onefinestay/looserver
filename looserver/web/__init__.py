from gevent import monkey
monkey.patch_all()

import datetime
import json
from threading import Thread

from flask import Flask, render_template, jsonify
from flask.ext.socketio import SocketIO
import redis

from looserver import settings
from looserver.db import Loo, Session
from looserver.stats import Reporter

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None


def background_thread():
    """Example of how to send server generated events to clients."""
    redis_ = redis.StrictRedis()
    pubsub = redis_.pubsub()
    pubsub.subscribe(settings.EVENTS_CHANNEL)
    for event in pubsub.listen():
        if event['type'] != 'message':
            continue
        data = json.loads(event['data'])
        identifier = data['loo']
        in_use = data['in_use']

        socketio.emit(
            'update', {
                'loo': {
                    'identifier': identifier,
                    'in_use': in_use
                },
            },
            namespace='/loos')


@app.route('/')
def index():
    session = Session()
    return render_template('index.html', loos={
        loo.identifier: loo.as_dict()
        for loo in session.query(Loo)
    })


def get_stats():
    now = datetime.datetime.now()
    yesterday = now - datetime.timedelta(days=1)
    last_24 = Reporter(since=yesterday)
    forever = Reporter()

    return forever.get_stats(), last_24.get_stats()


@app.route('/stats')
def stats():
    forever, last_24 = get_stats()

    return render_template(
        'stats.html',
        forever=forever,
        last_24=last_24
    )


@app.route('/stats.json')
def stats_json():
    forever, last_24 = get_stats()

    return jsonify(
        forever=forever,
        last_24=last_24,
    )


# is there a better way to declare a namespace
@socketio.on('declaration', namespace='/loos')
def declaration(message):
    pass


if __name__ == '__main__':
    thread = Thread(target=background_thread)
    thread.start()

    socketio.run(app)
