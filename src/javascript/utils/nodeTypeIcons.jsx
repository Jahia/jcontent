import React from 'react';
import {Folder, Group, Layers, Link, Page, Person, Section, SiteWeb, Tag} from '@jahia/moonstone';
import {getIcon} from '@jahia/icons';

/**
 * Icon a node type is drawn with, for the types jContent pictures itself rather than taking the
 * icon declared by the definition.
 *
 * This is the one place that answers the question, because the answer is asked for in two shapes -
 * from a node, in trees and tables, and from a type name alone, in chips, breadcrumbs and headers -
 * and the two used to answer differently: a menu title was a Section in the tree and something else
 * in the chip beside it.
 *
 * Moonstone icons are deliberately preferred over the @jahia/icons registry. That registry still
 * carries a couple of Material UI SvgIcon based icons, which size themselves from the Material UI
 * theme rather than from Moonstone, so they come out too large for a Moonstone chip and overflow it.
 */
const ICON_BY_NODE_TYPE = {
    'jnt:page': Page,
    'jnt:folder': Folder,
    'jnt:virtualsite': SiteWeb,
    'jnt:user': Person,
    'jnt:group': Group,
    'jnt:category': Tag,
    'jnt:externalLink': Link,
    'jnt:nodeLink': Link,
    'jnt:navMenuText': Section
};

/**
 * Icon component for a node type, or undefined when jContent has no opinion and the caller should
 * fall back to whatever it knows - the icon from the definition, for a caller holding a node.
 *
 * @param {string} typeName primary node type name
 * @returns {Function|undefined} the icon component
 */
export const getIconComponentForNodeType = typeName => ICON_BY_NODE_TYPE[typeName];

/**
 * Rendered icon for a node type known only by name.
 *
 * Falls back to the @jahia/icons registry for the types it covers and jContent does not, then to a
 * neutral icon, so an unknown type still gets something rather than a hole in the layout.
 *
 * @param {string} typeName primary node type name
 * @returns {JSX.Element} the icon
 */
export const getNodeTypeIcon = typeName => {
    const Icon = getIconComponentForNodeType(typeName) || getIcon(typeName) || Layers;
    return <Icon/>;
};
