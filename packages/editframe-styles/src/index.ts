// Import first so that the .root reset has a lower specificity than all other styles
export * as editFrameStyles from "./EditFrame.module.scss";

export * as boxStyles from "./Box.module.scss";
export * as createStyles from "./Create.module.scss";
export * as deletedStyles from "./Deleted.module.scss";

import "@jahia/moonstone/scoped.css"; // Import Moonstone after all other styles to ensure precedence
