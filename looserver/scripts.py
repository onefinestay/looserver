import click
import logging
from looserver.db import Base, engine, Loo, Session
from looserver.server import Server

logging.basicConfig(level=logging.DEBUG)


@click.group()
def cli():
    """LooServer"""


@cli.command()
def init_db():
    Base.metadata.create_all(engine)


@cli.command()
@click.argument('identifier')
@click.argument('label')
def add(identifier, label):
    """Add a loo"""
    session = Session()

    loo = Loo(identifier=identifier, label=label)
    session.add(loo)
    session.commit()
    click.echo("Loo added with label {}".format(label))


@cli.command()
def serve():
    server = Server()
    try:
        server.run()
    except KeyboardInterrupt:
        server.stop()
