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
    render: function() {
        var cx = React.addons.classSet;
        var classes = cx({
            "loo": true,
        });

        var styles = {
          left: this.props.loo.in_use ? '-100%' : '0'
        };

        return (
          React.DOM.div({className: "columns large-6"}, 
            React.DOM.div({className: "loo-container"}, 
              React.DOM.div({className: classes, style: styles}, 
                React.DOM.div({className: "loo-available"}, 
                  React.DOM.h3(null, "Available")
                ), 
                React.DOM.div({className: "loo-unavailable"}, 
                  React.DOM.h3(null, "Engaged")
                )
              ), 
              React.DOM.h2(null,  this.props.loo.label)
            )
          )
        );
    }
});
