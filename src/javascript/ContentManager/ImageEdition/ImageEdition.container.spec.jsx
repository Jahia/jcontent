import React from 'react';
import {mount, shallow} from 'enzyme';
import {ImageEditionContainer} from './ImageEdition.container';
import {MockedProvider} from 'react-apollo/test-utils';
import {ImageQuery} from './ImageEdition.gql-queries';
import {getImageMutation} from './ImageEdition.gql-mutations';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {fragmentMatcher} from '@jahia/apollo-dx';
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import ImageEdition from './ImageEdition';
import waitForExpect from 'wait-for-expect';
import {dsGenericTheme as theme} from '@jahia/ds-mui-theme';
import wait from 'waait';
import DxContext from '../DxContext';

var contextJsParameters = {};

let result = {
    data: {
        jcr: {
            __typename: 'JCRQuery',
            nodeByPath: {
                width: {
                    value: 200,
                    __typename: 'JCRProperty'
                },
                height: {
                    value: 100,
                    __typename: 'JCRProperty'
                },
                nodeName: {
                    value: 'toto.jpg',
                    __typename: 'JCRProperty'
                },
                uuid: '7fca64e7-f2c4-457f-870a-fe0e6343bce2',
                path: '/toto.jpg',
                name: 'toto.jpg',
                workspace: 'edit',
                __typename: 'GenericJCRNode'
            }
        }
    }
};

let request = {
    query: ImageQuery,
    variables: {
        path: '/toto.jpg'
    }
};
const mocks = [
    {
        request: request,
        result: result
    },
    {
        request: request,
        result: result
    },
    {
        request: request,
        result: result
    },
    {
        request: {
            query: getImageMutation([]),
            variables: {
                path: '/toto.jpg'
            }
        }
    }
];

describe('Image Edition', () => {
    let props;
    let wrapper;

    let dxContext = {
        config: {
            academyLink: 'http://'
        }
    };

    beforeEach(() => {
        try {
            global.contextJsParameters = dxContext;

            props = {
                path: '/toto.jpg'
            };

            wrapper = mount(
                <DxContext.Provider value={dxContext}>
                    <MuiThemeProvider theme={theme}>
                        <MockedProvider mocks={mocks} cache={new InMemoryCache({fragmentMatcher})}>
                            <ImageEditionContainer {...props}/>
                        </MockedProvider>
                    </MuiThemeProvider>
                </DxContext.Provider>
            );
        } catch (e) {
            console.log(e);
        }
    });

    it('render', async () => {
        await (wait(0));
        wrapper.update();
        expect(wrapper.find(ImageEdition).length).toBe(1);
    });

    it('rotates 1', () => {
        wrapper = wrapper.find('ImageEditionContainer');
        wrapper.instance().rotate(1);
        expect(wrapper.state().rotations).toBe(1);
        expect(wrapper.state().transforms.length).toBe(1);
        expect(wrapper.state().transforms[0].op).toBe('rotateImage');
        expect(wrapper.state().transforms[0].args.angle).toBe(90);
    });

    it('rotates full turn', () => {
        wrapper = wrapper.find('ImageEditionContainer');
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        expect(wrapper.state().rotations).toBe(0);
        expect(wrapper.state().transforms.length).toBe(0);
    });

    it('resizes', () => {
        wrapper = wrapper.find('ImageEditionContainer');
        wrapper.instance().resize({width:50, height:100});
        expect(wrapper.state().width).toBe(50);
        expect(wrapper.state().height).toBe(100);
        expect(wrapper.state().transforms[0].op).toBe('resizeImage');
        expect(wrapper.state().transforms[0].args.width).toBe(50);
        expect(wrapper.state().transforms[0].args.height).toBe(100);
    });

});
