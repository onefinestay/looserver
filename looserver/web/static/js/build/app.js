/** @jsx React.DOM */

var App = React.createClass({displayName: 'App',
    getInitialState: function() {
        return {
            'loos': this.props.loos
        }
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
            updateAction[identifier] = {'in_use': {$set: inUse}}

            var updatedLoos = React.addons.update(
                this.state.loos, updateAction);
            this.setState({loos: updatedLoos});
        }.bind(this));
    },
    render: function() {
        var loos = _.map(this.state.loos, function(loo) {
            return Loo({loo: loo })
        });
        return (
            React.DOM.div({className: "row"}, 
                React.DOM.h2(null, "Hello world"), 
                loos 
            )
        )
    }
});


var Loo = React.createClass({displayName: 'Loo',
    render: function() {
        var cx = React.addons.classSet;
        var classes = cx({
            "columns": true,
            "large-6": true,
            "loo": true,
            "loo-unavailable": this.props.loo.in_use
        });
        var statusString = function(in_use) {
            if (in_use) {
                return "Engaged";
            }
            else {
                return "Available";
            }
        };
        return (
            React.DOM.div({className: classes}, 
                React.DOM.h2(null,  this.props.loo.label), 
                React.DOM.h3(null,  statusString(this.props.loo.in_use) )

            )
        )
    }
});
