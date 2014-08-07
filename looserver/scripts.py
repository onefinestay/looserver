import click
from looserver.db import Base, engine, Toilet
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)


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

    loo = Toilet(identifier=identifier, label=label)
    session.add(loo)
    session.commit()
    click.echo("Toilet added with label {}".format(label))
