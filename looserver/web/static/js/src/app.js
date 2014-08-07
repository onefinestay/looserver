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
    render: function() {
        var cx = React.addons.classSet;
        var classes = cx({
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
            <div className="columns large-6 loo-container">
              <div className={classes}>
                <h2>{ this.props.loo.label }</h2>
                <h3>{ statusString(this.props.loo.in_use) }</h3>
              </div>
            </div>
        );
    }
});
