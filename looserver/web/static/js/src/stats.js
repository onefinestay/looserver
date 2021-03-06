/** @jsx React.DOM */

var Stats = React.createClass({
    render: function() {
        var loos = _.map(this.props.data, function(entry) {
            return <LooStat loo={entry.loo} stats={entry.stats}/>;
        });
        return (
            <div className="row">
                { loos }
            </div>
        );
    }
});

var humanizeNumber = function(number, unit) {
    if (unit == 'seconds') {
        var hours = Math.floor(number / (60 * 60));
        number = number - hours * 60 * 60;
        var minutes = Math.floor(number / 60);
        number = number - minutes * 60;
        var seconds = Math.floor(number)

        var output = ''
        if (hours) {
            output += hours + ' hour' + pluralize(hours) + ' ';
        }

        if (minutes) {
            output += minutes + ' minute' + pluralize(minutes) + ' and ';
        }

        output += seconds + ' second' + pluralize(seconds);
        return output;
    }
    return number;
};

var pluralize = function(number) {
    return number == 1 ? '' : 's';
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
            <div className="columns large-6 loo-stats">
                <h2>{ this.props.loo.label }</h2>
                <table className="stats">{ rows }</table>
            </div>
        );
    }
});

var StatsGraph = React.createClass({
    componentDidMount: function() {
        var $el = $(this.refs.chart.getDOMNode());

        $el.highcharts({
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: ''
            },
            xAxis: [{
                categories: this.props.data.hours
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: 'Number of visits',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                min: 0,

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Average duration',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                labels: {
                    format: '{value} seconds',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                min: 0,
                opposite: true
            }],
            tooltip: {
                enabled: false
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 80,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [{
                name: 'Number of visits',
                type: 'column',
                yAxis: 0,
                data: this.props.data.number_of_visits
            }, {
                name: 'Average duration',
                type: 'spline',
                yAxis: 1,
                color: Highcharts.getOptions().colors[2],
                data: this.props.data.average_duration,
                tooltip: {
                    valueSuffix: ' seconds'
                }
            }]

        });
    },

    render: function() {
        return (
            <div className="row">
                <div ref="chart"></div>
            </div>
        );
    }
});
