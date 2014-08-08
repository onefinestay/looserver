/** @jsx React.DOM */

var App = React.createClass({displayName: 'App',
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
            return Loo({loo: loo });
        });
        return (
            React.DOM.div({className: "row"}, 
                loos 
            )
        );
    }
});

var Loo = React.createClass({displayName: 'Loo',
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
          React.DOM.div({className: "columns large-6 medium-6"}, 
            React.DOM.div({
                className: "loo-container", 
                onMouseEnter: this.handleMouseEnter, 
                onMouseLeave: this.handleMouseLeave
            }, 
              React.DOM.div({className: classes, style: styles}, 
                React.DOM.div({className: "loo-available"}, 
                  React.DOM.h3(null, "Available")
                ), 
                React.DOM.div({className: "loo-unavailable"}, 
                  React.DOM.h3(null, "Engaged")
                )
              ), 
              React.DOM.h2(null,  this.props.loo.label), 
               this.state.notifying ?
              React.DOM.svg({className: "notification-icon"}, React.DOM.path({transform: "translate(0 30) scale(0.02 -0.02)", d: "M0 64v482q0 62 25 123l238 552q10 25 36.5 42t52.5 17h832q26 0 52.5 -17t36.5 -42l238 -552q25 -61 25 -123v-482q0 -26 -19 -45t-45 -19h-1408q-26 0 -45 19t-19 45zM197 576h316l95 -192h320l95 192h316q-1 3 -2.5 8t-2.5 8l-212 496h-708l-212 -496q-1 -2 -2.5 -8 t-2.5 -8z"})) : null, 
               this.state.hovering ?
                React.DOM.a({className: "overlay", onClick:  this.handleClick}, 
                    React.DOM.div({className: "overlay-text"}, 
                        this.state.notifying ? 'Stop notifying' : 'Notify me'
                    )
                ) : null
              
            )
          )
        );
    }
});
