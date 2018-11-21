import {CM_PREVIEW_STATES, cmGoto, cmSetPreviewState} from '../redux/actions';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from './reduxAction';
import requirementsAction from './requirementsAction';

const mapDispatchToProps = (dispatch) => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params})),
    setPreviewState: state => {
        dispatch(cmSetPreviewState(state));
    }
});

const mapStateToProps = (state) => ({
    language: state.language,
    siteKey: state.site
});

let routerAction = composeActions(requirementsAction, reduxAction(mapStateToProps, mapDispatchToProps), {
    init: context => {
        context.initRequirements();
    },
    onClick: context => {
        const {mode, siteKey, language, drawer: {handleDrawerClose}, setUrl, setPreviewState} = context;

        if (mode !== 'apps' && handleDrawerClose) {
            handleDrawerClose();
        }
        let pathSuffix = '';
        switch (mode) {
            case 'browse':
                pathSuffix = '/contents';
                break;
            case 'browse-files':
                pathSuffix = '/files';
                break;
            default:
                pathSuffix = '';
        }
        setPreviewState(CM_PREVIEW_STATES.HIDE);
        setUrl(siteKey, language, mode, (mode === 'apps' ? (context.actionPath ? context.actionPath : context.actionKey) : `/sites/${siteKey}${pathSuffix}`), {});
        return null;
    }
});

export {routerAction};
