import React from 'react';
import {mount} from '@jahia/test-framework';
import {ImageEditorContainer} from './ImageEditor.container';
import {MockedProvider} from '@apollo/react-testing';
import {ImageQuery} from './ImageEditor.gql-queries';
import {getImageMutation} from './ImageEditor.gql-mutations';
import {MuiThemeProvider} from '@material-ui/core';
import ImageEditor from './ImageEditor';
import {dsGenericTheme as theme} from '@jahia/design-system-kit';

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

    beforeEach(() => {
        global.contextJsParameters = {
            config: {
            }
        };

        props = {
            path: '/toto.jpg',
            site: 'mySite',
            language: 'en',
            editImage: jest.fn(),
            refreshData: jest.fn()
        };

        wrapper = mount(
            <MuiThemeProvider theme={theme}>
                <MockedProvider mocks={mocks}>
                    <ImageEditorContainer {...props}/>
                </MockedProvider>
            </MuiThemeProvider>
        );
    });

    it('render', async () => {
        expect(wrapper.find(ImageEditor).length).toBe(1);
    });

    it('rotates 1', () => {
        wrapper = wrapper.find('ImageEditorContainer');
        wrapper.instance().rotate(1);
        expect(wrapper.state().rotationParams.rotations).toBe(1);
        expect(wrapper.state().transforms.length).toBe(1);
        expect(wrapper.state().transforms[0].op).toBe('rotateImage');
        expect(wrapper.state().transforms[0].args.angle).toBe(90);
    });

    it('rotates full turn', () => {
        wrapper = wrapper.find('ImageEditorContainer');
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        wrapper.instance().rotate(1);
        expect(wrapper.state().rotationParams.rotations).toBe(0);
        expect(wrapper.state().transforms.length).toBe(0);
    });

    it('resizes', () => {
        wrapper = wrapper.find('ImageEditorContainer');
        wrapper.instance().onImageLoaded({naturalHeight: 200, naturalWidth: 300});
        wrapper.instance().resize({width: 150});
        expect(wrapper.state().resizeParams.width).toBe(150);
        expect(wrapper.state().resizeParams.height).toBe(100);
        expect(wrapper.state().transforms[0].op).toBe('resizeImage');
        expect(wrapper.state().transforms[0].args.width).toBe(150);
        expect(wrapper.state().transforms[0].args.height).toBe(100);

        wrapper.instance().resize({keepRatio: false});
        expect(wrapper.state().resizeParams.width).toBe(150);
        expect(wrapper.state().resizeParams.height).toBe(100);
        expect(wrapper.state().transforms[0].op).toBe('resizeImage');
        expect(wrapper.state().transforms[0].args.width).toBe(150);
        expect(wrapper.state().transforms[0].args.height).toBe(100);

        wrapper.instance().resize({height: 150});
        expect(wrapper.state().resizeParams.width).toBe(150);
        expect(wrapper.state().resizeParams.height).toBe(150);
        expect(wrapper.state().transforms[0].op).toBe('resizeImage');
        expect(wrapper.state().transforms[0].args.width).toBe(150);
        expect(wrapper.state().transforms[0].args.height).toBe(150);
    });
});
