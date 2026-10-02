// Widths a preview is rendered at, then scaled down to fit the pane it sits in.
//
// Scaling alone would not help: a preview pane is only a few hundred pixels wide, so a responsive
// template collapses to its narrow layout and two variants that differ in how they place an image
// side by side end up looking identical. Rendering at a real desktop width and shrinking the result
// is what makes that difference visible.
export const VIEWPORT_WIDTHS = [1280, 1024, 768, 375];
export const DEFAULT_VIEWPORT_WIDTH = 1280;
