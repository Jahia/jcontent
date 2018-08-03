import React from 'react';
import {CmSelectionContext, CmSelectionHelper} from "./CmSelectionContext";
import {Jcr} from '@jahia/apollo-dx';

const DxContext = React.createContext();

class DxContextProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({}, props.dxContext, {selectedTreeItems: [], selectedListItems: []});
        this.selectionContext = new CmSelectionContext(this);
        this.apolloJcr = new Jcr(props.apolloClient);
    }

    onRouteChanged = (location, match) => {
        CmSelectionHelper.updateTreeSelection(this, location, match);
    };

    render() {
        const { children } = this.props;

        return (
          <DxContext.Provider
            value={Object.assign({
                    onRouteChanged: this.onRouteChanged,
                    selectionContext: this.selectionContext,
                }, this.state)}>
            {children}
          </DxContext.Provider>
        );
    }
}

const DxContextConsumer = DxContext.Consumer;

export {DxContext, DxContextProvider, DxContextConsumer};