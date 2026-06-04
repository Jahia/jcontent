import { Area, jahiaComponent } from "@jahia/javascript-modules-library";
import { Layout } from "../Layout";

jahiaComponent(
	{
		nodeType: "jnt:page",
		name: "default",
		displayName: "Default",
		componentType: "template",
	},
	() => {
		return (
			<Layout>
				<Area name="main" />
			</Layout>
		);
	},
);

