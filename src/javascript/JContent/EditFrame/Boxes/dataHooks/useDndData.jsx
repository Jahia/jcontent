import {useNodeChecks} from '@jahia/data-helper';
import {PATH_CATEGORIES_ITSELF, PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from '~/JContent/actions/actions.constants';

export const useDndData = ({paths, language, uilang}) => {
    const nodeDragData = useNodeChecks(
        {paths: paths, language: language, displayLanguage: uilang},
        {
            mapResults: true,
            getPrimaryNodeType: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:blockUiMove'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
            getLockInfo: true
        }
    );

    const nodeDropData = useNodeChecks(
        {paths: paths, language: language},
        {
            mapResults: true,
            requiredPermission: 'jcr:addChildNodes',
            getChildNodeTypes: true,
            getContributeTypesRestrictions: true,
            getLockInfo: true,
            getSubNodesCount: ['nt:base'],
            getProperties: ['limit'],
            getIsNodeTypes: ['jmix:listSizeLimit', 'jnt:contentList', 'jnt:folder', 'jnt:contentFolder', 'jnt:area', 'jnt:mainResourceDisplay']
        }
    );

    return {nodeDragData, nodeDropData};
};
