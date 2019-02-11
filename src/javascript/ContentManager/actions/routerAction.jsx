import {cmGoto} from '../ContentManager.redux-actions';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from './reduxAction';
import requirementsAction from './requirementsAction';

const mapDispatchToProps = dispatch => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params}))
});

const mapStateToProps = state => ({
    language: state.language,
    siteKey: state.site
});

let routerAction = composeActions(requirementsAction, reduxAction(mapStateToProps, mapDispatchToProps), {
    init: context => {
        context.initRequirements();
    },
    onClick: context => {
        const {mode, siteKey, language, setUrl, path} = context;

        if (mode !== 'apps' && context.drawer && context.drawer.handleDrawerClose) {
            context.drawer.handleDrawerClose();
        }

        let resolvedPath = '';
        switch (mode) {
            case 'apps':
                resolvedPath = context.actionPath ? context.actionPath : context.actionKey;
                break;
            case 'browse':
                resolvedPath = `/sites/${siteKey}/contents`;
                break;
            case 'browse-files':
                resolvedPath = `/sites/${siteKey}/files`;
                break;
            default:
                resolvedPath = path;
        }
        // When we're on search and we're browsing subnodes of a content item
        let nodeType = context.node ? context.node.primaryNodeType.name : '';
        let subBrowsingMode = nodeType === 'jnt:folder' ? 'browse-files' : 'browse';

        if (context.subContentBrowsing) {
            setUrl(siteKey, language, subBrowsingMode, resolvedPath, context.urlParams ? context.urlParams : {});
        } else {
            setUrl(siteKey, language, mode, resolvedPath, context.urlParams ? context.urlParams : {});
        }
        return null;
    }
});

export {routerAction};
