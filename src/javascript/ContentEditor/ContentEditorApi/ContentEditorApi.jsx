import React, {useEffect, useRef, useState} from 'react';
import {useEdit} from './useEdit';
import {useCreate} from './useCreate';
import {ContentEditorModal} from './ContentEditorModal';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {ContentTypeSelectorModal} from '~/ContentEditor/ContentTypeSelectorModal';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useHistory, useLocation} from 'react-router-dom';
import rison from 'rison-node';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';

function decode(hash) {
    let values = {};
    try {
        values = hash ? rison.decode_uri(hash.substring(1)) : {};
    } catch {
        throw new Error(`Unable to decode URI hash: ${hash.substring(1)}`);
    }

    return values;
}

const getEncodedLocations = function (location, editorConfigs) {
    const {contentEditor, ...others} = decode(location.hash);

    const valid = editorConfigs.every(config => Object.values(config).every(o => typeof o !== 'function'));

    const cleanedHash = Object.keys(others).length > 0 ? rison.encode_uri(others) : '';
    const locationWithoutEditors = rison.encode({search: location.search, hash: cleanedHash});
    const locationFromState = (valid && editorConfigs.length > 0) ?
        rison.encode({
            search: location.search,
            hash: '#' + rison.encode_uri({...others, contentEditor: JSON.parse(JSON.stringify(editorConfigs.map((({closed, ...obj}) => obj))))})
        }) : locationWithoutEditors;

    return {
        locationFromState,
        locationWithoutEditors
    };
};

export const ContentEditorApi = () => {
    const [editorConfigs, setEditorConfigs] = useState([]);
    const [contentTypeSelectorConfig, setContentTypeSelectorConfig] = useState(false);
    const history = useHistory();
    const location = useLocation();
    const loaded = useRef();

    let encodedLoc = {};
    try {
        encodedLoc = getEncodedLocations(location, editorConfigs);
    } catch (error) {
        throw new CeModalError(error.message, {cause: error});
    }

    const {locationFromState, locationWithoutEditors} = encodedLoc;

    const unsetEditorConfigs = () => {
        history.replace(rison.decode(locationWithoutEditors));
        setEditorConfigs(editorConfigs.map(e => ({...e, closed: true, onExited: () => {}})));
    };

    const newEditorConfig = editorConfig => {
        if (!editorConfig.formKey) {
            editorConfig.formKey = 'modal_' + editorConfigs.length;
        }

        editorConfig.uilang = window.jahiaGWTParameters.uilang;

        setEditorConfigs([...editorConfigs, editorConfig]);
    };

    const updateEditorConfig = (editorConfig, index) => {
        const copy = Array.from(editorConfigs);
        copy[index] = {...copy[index], ...editorConfig};
        setEditorConfigs(copy);
    };

    const onExited = index => {
        const copy = Array.from(editorConfigs);
        const spliced = copy.splice(index, 1);
        const onExitedCallback = spliced[0].onExited;

        setEditorConfigs(copy);

        if (onExitedCallback) {
            onExitedCallback();
        } else if (spliced[0]?.isFullscreen) {
            if (copy.length > 0) {
                const {locationFromState: _locationFromState} = getEncodedLocations(location, copy);
                history.replace(rison.decode(_locationFromState));
            } else if (history.location.state?.wasPushed) {
                history.go(-1);
            } else {
                history.replace(rison.decode(locationWithoutEditors));
            }
        }
    };

    const context = useContentEditorApiContext();
    context.edit = useEdit(newEditorConfig);
    context.create = useCreate(newEditorConfig, setContentTypeSelectorConfig);

    window.CE_API = window.CE_API || {};
    window.CE_API.edit = context.edit;
    window.CE_API.create = context.create;

    useEffect(() => {
        // Copy editor state to hash (don't do on load)
        if (loaded.current) {
            const currentEncodedLocation = rison.encode({search: history.location.search, hash: history.location.hash});
            // Add hash to history only if full screen configuration available, otherwise update config state directly
            if (currentEncodedLocation !== locationFromState && locationFromState.includes('contentEditor:') && locationFromState.includes('isFullscreen:!!t')) {
                if (currentEncodedLocation.includes('contentEditor:')) {
                    // eslint-disable-next-line no-warning-comments
                    // Todo : handle the case when stacking a new content-editor - we should push
                    history.replace(rison.decode(locationFromState));
                } else {
                    history.push(rison.decode(locationFromState), {wasPushed: true});
                }
            } else if (currentEncodedLocation !== locationFromState && locationFromState.includes('contentEditor:')) {
                const {contentEditor} = decode(rison.decode(locationFromState).hash);
                setEditorConfigs(contentEditor);
            }
        }
    }, [history, locationFromState]);

    useEffect(() => {
        // Read hash to set/unset editors
        const {contentEditor} = decode(location.hash);
        if (contentEditor) {
            setEditorConfigs(previous => {
                const newValue = rison.encode(contentEditor);
                const previousValue = rison.encode(previous);
                return newValue === previousValue ? previous : contentEditor;
            });
        } else {
            unsetEditorConfigs();
        }
    }, [location.hash]); // eslint-disable-line

    useEffect(() => {
        // Reset all states/hash after location change
        if (loaded.current) {
            unsetEditorConfigs();
        }
    }, [location.pathname]); // eslint-disable-line

    useEffect(() => {
        loaded.current = true;
    }, []);

    const editorConfigLang = editorConfigs.length > 0 ? editorConfigs[0].lang : undefined;
    useEffect(() => {
        if (editorConfigLang) {
            // Sync GWT language
            window.overrideLang = editorConfigLang;
            window.previousLang = window.jahiaGWTParameters.lang;
            if (window.authoringApi?.switchLanguage) {
                window.authoringApi.switchLanguage(editorConfigLang);
            }
        }

        return () => {
            delete window.overrideLang;
            if (window.authoringApi?.switchLanguage && window.previousLang) {
                window.authoringApi.switchLanguage(window.previousLang);
            }
        };
    }, [editorConfigLang]);

    return (
        <>
            {contentTypeSelectorConfig && (
                <ContentTypeSelectorModal
                    isOpen
                    nodeTypesTree={contentTypeSelectorConfig.nodeTypesTree}
                    onClose={() => {
                        setContentTypeSelectorConfig(false);
                    }}
                    onExited={() => {
                        setContentTypeSelectorConfig(false);
                    }}
                    onCreateContent={contentType => {
                        setContentTypeSelectorConfig(false);
                        newEditorConfig({
                            name: contentTypeSelectorConfig.name,
                            contentType: contentType.name,
                            mode: Constants.routes.baseCreateRoute,
                            ...contentTypeSelectorConfig.editorConfig
                        });
                    }}
                />
            )}

            {editorConfigs.map((editorConfig, index) => {
                return (
                    <ContentEditorModal
                        key={`${editorConfig.mode}_${editorConfig.uuid}`}
                        editorConfig={editorConfig}
                        updateEditorConfig={updatedEditorConfig => {
                            updateEditorConfig(updatedEditorConfig, index);
                        }}
                        onExited={() => {
                            onExited(index);
                        }}
                    />
                );
            })}
        </>
    );
};
