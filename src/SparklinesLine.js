import PropTypes from "prop-types";
import React from "react";

const flattenPoints = points => points.map(p => [p.x, p.y]).reduce((a, b) => a.concat(b), []);

function lineStyler(type, style, color) {
    let lineColor;
    if (type === "critical") lineColor = "red";
    if (type === "warning") lineColor = "#ffe900";
    if (type === "ok") lineColor = "green";
    return {
        stroke: lineColor || style.stroke || "slategray",
        // stroke: color || style.stroke || "slategray",
        strokeWidth: style.strokeWidth || "1",
        strokeLinejoin: style.strokeLinejoin || "round",
        strokeLinecap: style.strokeLinecap || "round",
        fill: "none"
    };
}

function segmentize(d) {
    if (d.length === 0) return d;
    // console.log(d);
    const { x, y, type: curType } = d[0];
    const nextDiff = d.findIndex(e => e.type !== curType);
    if (nextDiff < 0) {
        // only curType remains
        const curSegment = {
            points: flattenPoints(d),
            type: curType
        };
        return [curSegment];
    }

    // d[nextDiff] is first of a new segment
    const curSegment = {
        points: flattenPoints(d.slice(0, nextDiff)),
        type: curType
    };
    return [curSegment].concat(segmentize(d.slice(nextDiff)));
}

export default class SparklinesLine extends React.Component {
    static propTypes = {
        color: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        style: {},
        onMouseMove: () => {}
    };

    render() {
        const {
            data,
            points,
            width,
            height,
            margin,
            color,
            style,
            onMouseMove,
            useSegments
        } = this.props;
        // console.log(points);
        // console.log(`SparklinesLine useSegments:${useSegments}`);
        const linePoints = flattenPoints(points);

        const lineSegments = segmentize(points);
        // console.log(lineSegments);
        const closePolyPoints = [
            points[points.length - 1].x,
            height - margin,
            margin,
            height - margin,
            margin,
            points[0].y
        ];

        const fillPoints = linePoints.concat(closePolyPoints);

        const lineStyle = {
            stroke: color || style.stroke || "slategray",
            strokeWidth: style.strokeWidth || "1",
            strokeLinejoin: style.strokeLinejoin || "round",
            strokeLinecap: style.strokeLinecap || "round",
            fill: "none"
        };
        const fillStyle = {
            stroke: style.stroke || "none",
            strokeWidth: "0",
            fillOpacity: style.fillOpacity || ".1",
            fill: style.fill || color || "slategray",
            pointerEvents: "auto"
        };

        const tooltips = points.map((p, i) => {
            return (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={2}
                    style={fillStyle}
                    onMouseEnter={e => onMouseMove("enter", data[i], p)}
                    onClick={e => onMouseMove("click", data[i], p)}
                />
            );
        });
        if (useSegments) {
            return (
                <g>
                    <polyline points={fillPoints.join(" ")} style={fillStyle} />
                    {lineSegments.map((segment, i) => (
                        <polyline
                            key={i}
                            points={segment.points}
                            style={lineStyler(segment.type, lineStyle, color)}
                        />
                    ))}
                </g>
            );
        }
        return (
            <g>
                {tooltips}
                <polyline points={fillPoints.join(" ")} style={fillStyle} />
                <polyline points={linePoints.join(" ")} style={lineStyle} />
            </g>
        );
    }
}
