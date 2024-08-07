const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';

const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;
const filePrefix = `${contextPath}/files/{workspace}`;

// Find "URL" input in CKEditor dialog.
function getCKEditorUrlInputId(dialog) {
    if (!dialog) {
        return;
    }

    const hasUrl = dialog.getContentElement('info', 'url');
    return hasUrl ? 'url' : 'txtUrl';
}

export function fillCKEditorPicker(setUrl, dialog, contentPicker, pickerResult) {
    // Fill Dialog alt title
    const eltId = getCKEditorUrlInputId(dialog);

    const altElementId = dialog.getName() === 'image2' ? 'alt' : 'txtAlt';

    const contentElement = dialog.getContentElement('info', eltId === 'url' ? 'advTitle' : altElementId);

    if (contentElement !== undefined) {
        if (eltId === 'url' && pickerResult.displayName) {
            contentElement.setValue(pickerResult.displayName);
        } else {
            contentElement.setValue(pickerResult.name);
        }
    }

    if (pickerResult.url) {
        setUrl(pickerResult.url);
    } else {
        // Wrap path to build Jahia url.
        const pathWithEncodedFileName = pickerResult.path.replace(/\/([^/]+\.[^/?#]+)(\?|#|$)/, (_, fileName, suffix) => `/${encodeURIComponent(fileName)}${suffix}`);
        setUrl(`${contentPicker ? contentPrefix : filePrefix}${pathWithEncodedFileName}${contentPicker ? '.html' : ''}`, {});
    }
}

export function getPickerValue(dialog) {
    const urlInput = dialog.getContentElement('info', getCKEditorUrlInputId(dialog));
    const valueInInput = urlInput ? urlInput.getValue() : '';
    try {
        const contentURL = new URL(valueInInput);
        return contentURL.toString();
    } catch {
        return decodeURIComponent(valueInInput.startsWith(contentPrefix) ?
            valueInInput.substr(contentPrefix.length).slice(0, -('.html').length) :
            valueInInput.substr(filePrefix.length));
    }
}
