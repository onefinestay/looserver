/** @jsx React.DOM */

var Stats = React.createClass({displayName: 'Stats',
    render: function() {
        var loos = _.map(this.props.data, function(entry) {
            return LooStat({loo: entry.loo, stats: entry.stats});
        });
        return (
            React.DOM.div({className: "row"}, 
                React.DOM.h2(null, this.props.title), 
                loos 
            )
        );
    }
});

var humanizeNumber = function(number, unit) {
    if (unit == 'seconds') {
        return number.toFixed(2) + ' seconds';
    }
    return number;
};

var LooStat = React.createClass({displayName: 'LooStat',
    render: function() {
        var rows = _.map(this.props.stats, function(entry) {
            return (
                React.DOM.tr(null, 
                    React.DOM.td(null,  entry.label), 
                    React.DOM.td(null,  humanizeNumber(entry.value, entry.unit) )
                )
            );
        });

        return (
            React.DOM.div({className: "columns large-6 "}, 
                React.DOM.h2(null,  this.props.loo.label), 
                React.DOM.table({className: "stats"}, rows )
            )
        );
    }
});
