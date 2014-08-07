from gevent import monkey
monkey.patch_all()

import json
from threading import Thread

from flask import Flask, render_template
from flask.ext.socketio import SocketIO
import redis

from looserver import settings
from looserver.db import Loo, Session

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
        loo.identifier: {
            'identifier': loo.identifier,
            'label': loo.label,
            'floor': loo.floor,
            'in_use': loo.in_use,
        } for loo in session.query(Loo)
    })


# is there a better way to declare a namespace
@socketio.on('declaration', namespace='/loos')
def declaration(message):
    pass


if __name__ == '__main__':
    thread = Thread(target=background_thread)
    thread.start()

    socketio.run(app)
