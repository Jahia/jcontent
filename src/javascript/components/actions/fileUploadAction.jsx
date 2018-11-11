import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import {connect} from "react-redux";
import {setPanelState, setPath} from '../fileupload/redux/actions';
import {panelStates} from '../fileupload/constatnts';
import {batchActions} from 'redux-batched-actions';

// class FileUploadAction extends React.Component {
//
//     render() {
//
//         let {children, context, t, labelKey, dispatchBatch, ...rest} = this.props;
//
//         return children({
//
//             ...rest,
//             labelKey: labelKey,
//
//             // Defer opening the upload panel for a fraction of second to avoid closing the menu that contains the action and opening the panel simultaneously
//             // which causes a Material UI ModalManager error otherwise.
//             onClick: () => setTimeout(() => dispatchBatch([
//                 setPath(context.path),
//                 setPanelState(panelStates.VISIBLE)
//             ]), 100)
//         });
//     }
// }
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         dispatch: dispatch,
//         dispatchBatch: (actions) => dispatch(batchActions(actions))
//     }
// };
//
// FileUploadAction = _.flowRight(
//     withNotifications(),
//     translate(),
//     connect(null, mapDispatchToProps)
// )(FileUploadAction);

export default {};
