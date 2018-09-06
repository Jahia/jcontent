import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";

class PublishAction extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <DxContext.Consumer>{dxContext => {
            const {call, children, context, allLanguages, allSubTree, checkForUnpublication, checkIfLanguagesMoreThanOne, ...rest} = this.props;
            let ctx = _.cloneDeep(context);
            ctx.uuid = [context.node.uuid];
            ctx.allLanguages = allLanguages;
            ctx.allSubTree = allSubTree;
            ctx.checkForUnpublication = checkForUnpublication;
            if(checkIfLanguagesMoreThanOne){
                if(dxContext.siteLanguages.length > 1){
                    return children({...rest,
                        labelParams: {language: dxContext.langName},
                        onClick: () => call(ctx)
                    })
                }else{
                    return null;
                }
            }else{
                return children({...rest,
                    labelParams: {language: dxContext.langName},
                    onClick: () => call(ctx)
                })
            }
        }}</DxContext.Consumer>;
    }

}

export default PublishAction;