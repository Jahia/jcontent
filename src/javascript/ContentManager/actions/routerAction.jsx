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
        if (context.subContentBrowsing) {
            setUrl(siteKey, language, 'browse', resolvedPath, {});
        } else {
            setUrl(siteKey, language, mode, resolvedPath, {});
        }
        return null;
    }
});

export {routerAction};
