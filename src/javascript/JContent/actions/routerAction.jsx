import {cmGoto} from '../JContent.redux-actions';
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
        if (mode === 'apps') {
            resolvedPath = context.actionPath ? context.actionPath : context.actionKey;
        } else {
            resolvedPath = path;
        }

        setUrl(siteKey, language, mode, resolvedPath, context.urlParams ? context.urlParams : {});
        return null;
    }
});

export {routerAction};
