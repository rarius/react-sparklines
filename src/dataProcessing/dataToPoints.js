import arrayMin from "./min";
import arrayMax from "./max";

function getType_old(d) {
    if (d < 0) return "critical";
    if (d < 0.5) return "warning";
    return "ok";
}

function getX(x0, y0, x1, y1, y) {
    return ((x1 - x0) / (y1 - y0)) * (y - y0) + x0;
}

function splitLine(p0, p1, t1 = -1, t2 = -2) {
    function getType(y, dec = false) {
        if (!dec) {
            if (y > t1) return "critical";
            if (y > t2) return "warning";
            return "ok";
        } else {
            if (y <= t2) return "ok";
            if (y <= t1) return "warning";
            return "critical";
        }
    }

    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    let lines = [];
    let prevType;

    if (y0 > y1) {
        prevType = getType(y0, false);
        lines.push({ ...p0, type: prevType });
        if (y0 > t1 && t1 > y1) {
            const newY1 = t1;
            const newX1 = getX(x0, y0, x1, y1, t1);
            lines.push({ x: newX1, y: newY1, type: prevType });
            prevType = "warning";
            lines.push({ x: newX1, y: newY1, type: prevType });
        }
        if (y0 > t2 && t2 > y1) {
            const newY2 = t2;
            const newX2 = getX(x0, y0, x1, y1, t2);
            lines.push({ x: newX2, y: newY2, type: prevType });
            prevType = "ok";
            lines.push({ x: newX2, y: newY2, type: prevType });
        }
        lines.push({ ...p1, type: prevType });
        return lines;
    } else {
        // if (y0 < y1) {
        prevType = getType(y0, true);
        lines.push({ ...p0, type: prevType });
        if (y0 < t2 && t2 < y1) {
            const newY2 = t2;
            const newX2 = getX(x0, y0, x1, y1, t2);
            lines.push({ x: newX2, y: newY2, type: prevType });
            prevType = "warning";
            lines.push({ x: newX2, y: newY2, type: prevType });
        }
        if (y0 < t1 && t1 < y1) {
            const newY1 = t1;
            const newX1 = getX(x0, y0, x1, y1, t1);
            lines.push({ x: newX1, y: newY1, type: prevType });
            prevType = "critical";
            lines.push({ x: newX1, y: newY1, type: prevType });
        }
        lines.push({ ...p1, type: prevType });
        return lines;
    }
}

export default ({
    data,
    limit,
    width = 1,
    height = 1,
    margin = 0,
    max = arrayMax(data),
    min = arrayMin(data),
    useSegments,
    warnThreshold,
    critThreshold
}) => {
    const len = data.length;
    if (limit && limit < len) {
        data = data.slice(len - limit);
    }

    const vfactor = (height - margin * 2) / (max - min || 2);
    const hfactor = (width - margin * 2) / ((limit || len) - (len > 1 ? 1 : 0));

    const modCrit = (max === min ? 1 : max - critThreshold) * vfactor + margin;
    const modWarn = (max === min ? 1 : max - warnThreshold) * vfactor + margin;
    // console.log(`max: ${max} min: ${min} crit: ${critThreshold} warn: ${warnThreshold} modCrit: ${modCrit} modWarn: ${modWarn}` );

    // console.log(data);
    const points = data.map((d, i) => ({
        x: i * hfactor + margin,
        y: (max === min ? 1 : max - d) * vfactor + margin
    }));
    // console.log(points);
    if (useSegments) {
        let splits = [];
        for (let i = 0; i < points.length; i += 1) {
            if (i + 1 < points.length) {
                const temp = splitLine(points[i], points[i + 1], modCrit, modWarn);
                // console.log(temp);
                splits = splits.concat(temp);
            }
        }
        // console.log(splits);
        return splits;
    }
    return points;
};
