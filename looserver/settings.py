import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))

DB_URI = 'sqlite:///{}/looserver.db'.format(BASE_DIR)
