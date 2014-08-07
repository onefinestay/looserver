/** @jsx React.DOM */

var Stats = React.createClass({
    render: function() {
        var loos = _.map(this.props.data, function(entry) {
            return <LooStat loo={entry.loo} stats={entry.stats}/>;
        });
        return (
            <div className="row">
                <h2>{this.props.title}</h2>
                { loos }
            </div>
        );
    }
});

var humanizeNumber = function(number, unit) {
    if (unit == 'seconds') {
        return number.toFixed(2) + ' seconds';
    }
    return number;
};

var LooStat = React.createClass({
    render: function() {
        var rows = _.map(this.props.stats, function(entry) {
            return (
                <tr>
                    <td>{ entry.label }</td>
                    <td>{ humanizeNumber(entry.value, entry.unit) }</td>
                </tr>
            );
        });

        return (
            <div className="columns large-6 ">
                <h2>{ this.props.loo.label }</h2>
                <table className="stats">{ rows }</table>
            </div>
        );
    }
});
