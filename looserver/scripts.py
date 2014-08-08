import click
import logging
from looserver.db import Loo, Session
from looserver.server import Server
from looserver.stats import Reporter

logging.basicConfig(level=logging.WARNING)


@click.group()
def cli():
    """LooServer"""


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


@cli.command()
def stats():
    reporter = Reporter()
    reporter.report()
