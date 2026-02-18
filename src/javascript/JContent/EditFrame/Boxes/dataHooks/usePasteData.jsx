import {ACTION_PERMISSIONS} from '~/JContent/actions/actions.constants';
import {useNodeChecks} from '@jahia/data-helper';

export const usePasteData = ({createButtons, language}) => {
    const nodeChecksProps = {
        mapResults: true,
        requiredPermission: 'jcr:addChildNodes',
        requiredSitePermission: [ACTION_PERMISSIONS.pasteAction],
        getChildNodeTypes: true,
        getContributeTypesRestrictions: true,
        getSubNodesCount: ['nt:base'],
        getIsNodeTypes: ['jmix:listSizeLimit', 'jnt:contentList', 'jnt:folder', 'jnt:contentFolder', 'jnt:area', 'jnt:mainResourceDisplay'],
        getProperties: ['limit']
    };

    const paths = createButtons.map(b => b.node.path);

    const resPaste = useNodeChecks(
        {paths, language},
        nodeChecksProps
    );

    const resPasteRef = useNodeChecks(
        {paths, language},
        {
            ...nodeChecksProps,
            hideOnNodeTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:category']
        }
    );

    return {resPaste, resPasteRef};
};
