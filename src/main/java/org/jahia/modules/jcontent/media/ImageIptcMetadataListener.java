/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.jcontent.media;

import org.jahia.services.content.DefaultEventListener;
import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Binary;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import java.io.InputStream;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * Stores the IPTC metadata of an image on its file node whenever the binary is written.
 * <p>
 * Jahia's own metadata extraction cannot do this. It reports only what Tika parses, and Tika parses
 * IPTC for JPEG alone - so a PNG or a WebP carrying a full set of captions and credits arrives with
 * nothing to show. This listener reads the binary itself, which is the only way to reach those
 * formats, and covers JPEG by the same path so every format behaves alike.
 * <p>
 * Listening on the binary rather than on the node means replacing a file re-reads its metadata, and
 * that <strong>overwrites whatever was stored before</strong>: the file is treated as the source of
 * truth, matching how core already handles EXIF. Values typed by hand into these fields do not
 * survive a re-upload.
 * <p>
 * The properties written here live on the file node while the event watched is on its
 * {@code nt:resource} child, so the listener cannot retrigger itself.
 */
public class ImageIptcMetadataListener extends DefaultEventListener {

    private static final Logger logger = LoggerFactory.getLogger(ImageIptcMetadataListener.class);

    private static final String JCR_DATA = "jcr:data";
    private static final String JCR_CONTENT = "jcr:content";
    private static final String JCR_DATA_SUFFIX = "/" + JCR_DATA;
    private static final String JCR_CONTENT_SUFFIX = "/" + JCR_CONTENT;
    private static final String IMAGE_MIME_PREFIX = "image/";

    private final ImageIptcExtractor extractor = new ImageIptcExtractor();

    @Override
    public int getEventTypes() {
        return Event.PROPERTY_ADDED | Event.PROPERTY_CHANGED;
    }

    @Override
    public String[] getNodeTypes() {
        // The binary of a file lives on its jcr:content child, so that is the node whose properties
        // we watch. Narrowing here keeps the listener out of the way of every other property write
        // in the repository.
        //
        // nt:resource rather than Jahia's jnt:resource: a node type filter matches subtypes, so this
        // catches both, and it does not depend on which of the two a given provider actually uses.
        return new String[]{"nt:resource"};
    }

    @Override
    public void onEvent(EventIterator events) {
        Set<String> filePaths = new LinkedHashSet<>();

        while (events.hasNext()) {
            Event event = events.nextEvent();
            try {
                if (isExternal(event)) {
                    // Another cluster node is handling its own copy of this change.
                    continue;
                }

                String path = event.getPath();
                if (path == null || !path.endsWith(JCR_DATA_SUFFIX)) {
                    continue;
                }

                String filePath = toFilePath(path);
                if (filePath != null) {
                    // A single save can report the binary as both added and changed; the set means
                    // the image is read once either way.
                    filePaths.add(filePath);
                }
            } catch (RepositoryException e) {
                logger.error("Could not inspect a repository event while reading image metadata", e);
            }
        }

        if (filePaths.isEmpty()) {
            return;
        }

        try {
            JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, workspace, null, new JCRCallback<Object>() {
                @Override
                public Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    for (String filePath : filePaths) {
                        storeMetadata(session, filePath);
                    }

                    if (session.hasPendingChanges()) {
                        session.save();
                    }

                    return null;
                }
            });
        } catch (RepositoryException e) {
            logger.error("Could not store image IPTC metadata", e);
        }
    }

    /**
     * Turns the path of a changed {@code jcr:data} property into the path of the file that owns it.
     *
     * @return null when the property is not a file's binary after all
     */
    private String toFilePath(String propertyPath) {
        String contentPath = propertyPath.substring(0, propertyPath.length() - JCR_DATA_SUFFIX.length());
        if (!contentPath.endsWith(JCR_CONTENT_SUFFIX)) {
            return null;
        }

        return contentPath.substring(0, contentPath.length() - JCR_CONTENT_SUFFIX.length());
    }

    private void storeMetadata(JCRSessionWrapper session, String filePath) {
        try {
            JCRNodeWrapper fileNode = session.getNode(filePath);
            JCRNodeWrapper contentNode = fileNode.getNode(JCR_CONTENT);

            if (!isImage(contentNode)) {
                return;
            }

            Map<String, String> values = read(contentNode, filePath);
            if (values == null) {
                return;
            }

            if (values.isEmpty() && !fileNode.isNodeType(IptcPropertyMapping.MIXIN)) {
                // Nothing to store and nothing stored before: leave the node untouched rather than
                // giving it an empty mixin.
                return;
            }

            apply(fileNode, values);
        } catch (PathNotFoundException e) {
            // The file was moved or deleted between the event and now; nothing to annotate.
            logger.debug("No file to read image metadata from at {}", filePath, e);
        } catch (RepositoryException e) {
            logger.error("Could not store the image metadata of {}", filePath, e);
        }
    }

    private boolean isImage(JCRNodeWrapper contentNode) throws RepositoryException {
        if (!contentNode.hasProperty("jcr:mimeType")) {
            return false;
        }

        String mimeType = contentNode.getProperty("jcr:mimeType").getString();
        return mimeType != null && mimeType.toLowerCase().startsWith(IMAGE_MIME_PREFIX);
    }

    /**
     * @return the values read from the binary, or null when the file could not be read as an image at
     *         all - which is not worth clearing existing metadata over
     */
    private Map<String, String> read(JCRNodeWrapper contentNode, String filePath) throws RepositoryException {
        Binary binary = contentNode.getProperty(JCR_DATA).getBinary();
        try (InputStream stream = binary.getStream()) {
            return extractor.extract(stream);
        } catch (Exception e) {
            // An unsupported or truncated image is an everyday event, not a fault of ours: a broken
            // upload should not fill the log with stack traces.
            logger.warn("Could not read the image metadata of {}: {}", filePath, e.getMessage());
            return null;
        } finally {
            binary.dispose();
        }
    }

    private void apply(JCRNodeWrapper fileNode, Map<String, String> values) throws RepositoryException {
        if (!fileNode.isNodeType(IptcPropertyMapping.MIXIN)) {
            fileNode.addMixin(IptcPropertyMapping.MIXIN);
        }

        // Cleared first, so a file replaced by one with sparser metadata does not keep showing the
        // previous version's captions and credits.
        for (String property : IptcPropertyMapping.allProperties()) {
            if (fileNode.hasProperty(property)) {
                fileNode.getProperty(property).remove();
            }
        }

        for (Map.Entry<String, String> value : values.entrySet()) {
            fileNode.setProperty(value.getKey(), value.getValue());
        }
    }
}
