import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import SparklinesText from "./SparklinesText";
import SparklinesLine from "./SparklinesLine";
import SparklinesCurve from "./SparklinesCurve";
import SparklinesBars from "./SparklinesBars";
import SparklinesSpots from "./SparklinesSpots";
import SparklinesReferenceLine from "./SparklinesReferenceLine";
import SparklinesNormalBand from "./SparklinesNormalBand";
import dataToPoints from "./dataProcessing/dataToPoints";

class Sparklines extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        limit: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        svgWidth: PropTypes.number,
        svgHeight: PropTypes.number,
        preserveAspectRatio: PropTypes.string,
        margin: PropTypes.number,
        style: PropTypes.object,
        min: PropTypes.number,
        max: PropTypes.number,
        onMouseMove: PropTypes.func,
        useSegments: PropTypes.bool,
        warnThreshold: PropTypes.number,
        critThreshold: PropTypes.number
    };

    static defaultProps = {
        data: [],
        width: 240,
        height: 60,
        //Scale the graphic content of the given element non-uniformly if necessary such that the element's bounding box exactly matches the viewport rectangle.
        preserveAspectRatio: "none", //https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
        margin: 2,
        useSegments: false,
        warnThreshold: 0,
        critThreshold: 0
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {
            data,
            limit,
            width,
            height,
            svgWidth,
            svgHeight,
            preserveAspectRatio,
            margin,
            style,
            max,
            min,
            useSegments,
            warnThreshold,
            critThreshold
        } = this.props;

        if (data.length === 0) return null;

        const points = dataToPoints({
            data,
            limit,
            width,
            height,
            margin,
            max,
            min,
            useSegments,
            warnThreshold,
            critThreshold
        });

        const svgOpts = {
            style: style,
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: preserveAspectRatio
        };
        if (svgWidth > 0) svgOpts.width = svgWidth;
        if (svgHeight > 0) svgOpts.height = svgHeight;

        return (
            <svg {...svgOpts}>
                {React.Children.map(this.props.children, function(child) {
                    return React.cloneElement(child, {
                        data,
                        points,
                        width,
                        height,
                        margin,
                        useSegments
                    });
                })}
            </svg>
        );
    }
}

export {
    Sparklines,
    SparklinesLine,
    SparklinesCurve,
    SparklinesBars,
    SparklinesSpots,
    SparklinesReferenceLine,
    SparklinesNormalBand,
    SparklinesText
};
