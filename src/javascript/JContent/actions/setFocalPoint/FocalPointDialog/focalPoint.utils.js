// An unset focal point means the centre of the image: that is what a crop does when nothing tells it
// otherwise, so an image nobody has pointed at behaves exactly as it does today.
export const DEFAULT_FOCAL_POINT = {x: 50, y: 50};

const clampPercentage = value => Math.min(100, Math.max(0, value));

/** Rounds to one decimal, which is finer than any crop can resolve and keeps the stored value short. */
const roundPercentage = value => Math.round(value * 10) / 10;

/**
 * Turns a click on the rendered image into a focal point, in percentages of the image's own width and
 * height. Percentages rather than pixels because the point has to stay meaningful across every
 * rendition and every rendered size, none of which match the preview the editor clicked on.
 */
export const toFocalPoint = (event, boundingRect) => {
    if (!boundingRect || boundingRect.width === 0 || boundingRect.height === 0) {
        return DEFAULT_FOCAL_POINT;
    }

    return {
        x: roundPercentage(clampPercentage(((event.clientX - boundingRect.left) / boundingRect.width) * 100)),
        y: roundPercentage(clampPercentage(((event.clientY - boundingRect.top) / boundingRect.height) * 100))
    };
};

/**
 * Reads the stored point off a node, falling back to the centre. Values outside 0-100 are clamped
 * rather than rejected: they can only come from an API caller, and a clamped point still renders.
 */
export const fromProperties = (focalX, focalY) => {
    const x = Number.parseFloat(focalX);
    const y = Number.parseFloat(focalY);

    return {
        x: Number.isFinite(x) ? clampPercentage(x) : DEFAULT_FOCAL_POINT.x,
        y: Number.isFinite(y) ? clampPercentage(y) : DEFAULT_FOCAL_POINT.y
    };
};

export const isDefaultFocalPoint = ({x, y}) => x === DEFAULT_FOCAL_POINT.x && y === DEFAULT_FOCAL_POINT.y;

/** The value a template puts in `object-position`, which is how the point is actually consumed. */
export const toObjectPosition = ({x, y}) => `${x}% ${y}%`;
