import type { JSX, ReactNode } from "react";
import {
	AbsoluteArea,
	AddResources,
	buildModuleFileUrl,
	useServerContext,
} from "@jahia/javascript-modules-library";
import "./css/global.css";

export const Layout = ({
	children,
}: {
	children: ReactNode;
}): JSX.Element => {
	return (
		<>
			<HtmlHead />
			<body>
				<main id="main">{children}</main>
				<HtmlFooter />
			</body>
		</>
	);
};

const HtmlHead = (): JSX.Element => {
	return (
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
		</head>
	);
};

const HtmlFooter = (): JSX.Element => {
	const { renderContext } = useServerContext();
	return (
		<footer>
			<AbsoluteArea
				name="aaSiteRootLinks"
				parent={renderContext.getSite()}
				nodeType="jnt:linkList"
				allowedNodeTypes={["jnt:nodeLink", "jnt:externalLink"]}
			/>
			<AbsoluteArea
				name="aaHomeRootLinks"
				parent={renderContext.getSite().getHome()}
				nodeType="jnt:linkList"
				allowedNodeTypes={["jnt:nodeLink", "jnt:externalLink"]}
			/>
		</footer>
	);
};


