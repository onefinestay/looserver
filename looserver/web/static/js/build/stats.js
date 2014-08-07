/** @jsx React.DOM */

var Stats = React.createClass({displayName: 'Stats',
    render: function() {
        var loos = _.map(this.props.data, function(entry) {
            return LooStat({loo: entry.loo, stats: entry.stats});
        });
        return (
            React.DOM.div({className: "row"}, 
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

var StatsGraph = React.createClass({displayName: 'StatsGraph',
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
                    text: 'Total duration',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} seconds',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                min: 0,
                opposite: true
            }, { // Tertiary yAxis
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
                name: 'Total duration',
                type: 'scatter',
                yAxis: 1,
                data: this.props.data.total_duration,
                marker: {
                    symbol: 'diamond'
                },
                dashStyle: 'shortdot',
                tooltip: {
                    valueSuffix: ' seconds'
                }
            }, {
                name: 'Average duration',
                type: 'spline',
                yAxis: 2,
                data: this.props.data.average_duration,
                tooltip: {
                    valueSuffix: ' seconds'
                }
            }]

        });
    },

    render: function() {
        return (
            React.DOM.div({className: "row"}, 
                React.DOM.div({ref: "chart"})
            )
        );
    }
});
