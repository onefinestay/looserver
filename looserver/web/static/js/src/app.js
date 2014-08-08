/** @jsx React.DOM */

var App = React.createClass({
    getInitialState: function() {
        return {
            'loos': this.props.loos
        };
    },
    componentDidMount: function() {
        var socket = io.connect(
            'http://' + document.domain + ':' + location.port + '/loos'
        );
        socket.on('update', function(data) {
            var loo = data.loo;
            var identifier = loo.identifier;
            var inUse = loo.in_use;

            var updateAction = {};
            updateAction[identifier] = {'in_use': {$set: inUse}};

            var updatedLoos = React.addons.update(
                this.state.loos, updateAction);
            this.setState({loos: updatedLoos});
        }.bind(this));
    },
    render: function() {
        var loos = _.map(this.state.loos, function(loo) {
            return <Loo loo={ loo }/>;
        });
        return (
            <div className="row">
                { loos }
            </div>
        );
    }
});

var Loo = React.createClass({
    getInitialState: function() {
        return {
            hovering: false,
            notifying: false
        };
    },
    handleMouseEnter: function(event) {
        this.setState({hovering: true})
    },
    handleMouseLeave: function(event) {
        this.setState({hovering: false})
    },
    handleClick: function(event) {
        var Notification = (
            window.Notification ||
            window.mozNotification ||
            window.webkitNotification
        );

        if (this.state.notifying) {
            this.setState({notifying: false});
            return;
        }

        Notification.requestPermission(function (permission) {
            if (permission) {
                this.setState({notifying: true})
            }
        }.bind(this));
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (
            !this.props.loo.in_use &&
            prevProps.loo.in_use &&
            this.state.notifying
        ) {
            var imageUrl = (
                'http://' + document.domain + ':' + location.port +
                '/favicon.ico'
            );
            var notification = new Notification(
                "Time In Lieu", {
                body: this.props.loo.label + " is now available",
                icon: imageUrl
            });
            var clearNotification = function() {
                notification.close();
            };
            setTimeout(clearNotification, 5000);
            this.setState({notifying: false});
        }
    },

    render: function() {
        var cx = React.addons.classSet;
        var classes = cx({
            "loo": true,
        });

        var styles = {
          left: this.props.loo.in_use ? '-100%' : '0'
        };

        return (
          <div className="columns large-6 medium-6">
            <div
                className="loo-container"
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
            >
              <div className={classes} style={styles}>
                <div className="loo-available">
                  <h3>Available</h3>
                </div>
                <div className="loo-unavailable">
                  <h3>Engaged</h3>
                </div>
              </div>
              <h2>{ this.props.loo.label }</h2>
              { this.state.hovering ?
                <a className="overlay" onClick={ this.handleClick }>
                    <div className="overlay-text">
                        {this.state.notifying ? 'Stop notifying' : 'Notify me'}
                    </div>
                </a> : null
              }
            </div>
          </div>
        );
    }
});
