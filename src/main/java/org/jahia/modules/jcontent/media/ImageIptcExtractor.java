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

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.lang.KeyValuePair;
import com.drew.lang.SequentialByteArrayReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.iptc.IptcDirectory;
import com.drew.metadata.photoshop.PhotoshopReader;
import com.drew.metadata.png.PngDirectory;
import com.drew.metadata.xmp.XmpDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reads the IPTC metadata of an image binary into the {@code jmix:iptc} properties.
 * <p>
 * This reads the file itself rather than going through Jahia's extraction pipeline, because that
 * pipeline cannot see this data. Core populates metadata from whatever Tika reports, and Tika only
 * parses IPTC for JPEG: a PNG yields an unparsed XMP packet plus a hex-encoded IPTC blob, and WebP
 * yields nothing at all for want of a configured parser. The values are in the files regardless, so
 * the fix is to parse the binary.
 * <p>
 * Two provenances are merged, and where a file carries both, <strong>XMP wins</strong>: it is the
 * current standard, it is unambiguously Unicode, and a writer updating a file usually refreshes the
 * XMP packet while leaving the legacy IIM block behind.
 */
public class ImageIptcExtractor {

    private static final Logger logger = LoggerFactory.getLogger(ImageIptcExtractor.class);

    /**
     * Reads every IPTC value the binary carries.
     *
     * @param stream the image binary; not closed here, the caller owns it
     * @return property name to value, empty when the image carries no IPTC at all
     */
    public Map<String, String> extract(InputStream stream) throws ImageProcessingException, IOException {
        // readMetadata sniffs the format from the first bytes and needs to rewind afterwards.
        Metadata metadata = ImageMetadataReader.readMetadata(new BufferedInputStream(stream));

        decodePngRawProfiles(metadata);

        Map<String, String> values = new LinkedHashMap<>();
        readIim(metadata, values);
        readXmp(metadata, values);
        return values;
    }

    /**
     * Turns any hex-encoded IPTC block hiding in a PNG text chunk into a real IPTC directory.
     * <p>
     * Nothing downstream knows this convention, so without this step a PNG's IPTC stays a string of
     * hex digits. The decoded block is a Photoshop image resource, which PhotoshopReader unwraps and
     * routes to the IPTC reader - the same reader the JPEG path uses, so both formats agree.
     */
    private void decodePngRawProfiles(Metadata metadata) {
        // Collected first: the readers below add directories to this same Metadata, which would
        // otherwise mean mutating the collection we are walking.
        List<byte[]> blocks = new ArrayList<>();

        for (PngDirectory directory : metadata.getDirectoriesOfType(PngDirectory.class)) {
            Object textualData = directory.getObject(PngDirectory.TAG_TEXTUAL_DATA);
            if (!(textualData instanceof Collection)) {
                continue;
            }

            for (Object entry : (Collection<?>) textualData) {
                if (!(entry instanceof KeyValuePair)) {
                    continue;
                }

                KeyValuePair pair = (KeyValuePair) entry;
                if (!PngRawIptcProfile.isRawIptcProfile(pair.getKey()) || pair.getValue() == null) {
                    continue;
                }

                byte[] decoded = PngRawIptcProfile.decode(pair.getValue().toString());
                if (decoded != null) {
                    blocks.add(decoded);
                }
            }
        }

        for (byte[] block : blocks) {
            try {
                new PhotoshopReader().extract(new SequentialByteArrayReader(block), block.length, metadata);
            } catch (Exception e) {
                // A malformed profile is the file's problem, not a reason to lose the metadata that
                // parsed cleanly elsewhere in the image.
                logger.warn("Could not read the IPTC profile embedded in a PNG text chunk", e);
            }
        }
    }

    private void readIim(Metadata metadata, Map<String, String> values) {
        for (IptcDirectory directory : metadata.getDirectoriesOfType(IptcDirectory.class)) {
            for (Map.Entry<Integer, String> mapped : IptcPropertyMapping.iimTags().entrySet()) {
                int tag = mapped.getKey();
                if (!directory.containsTag(tag)) {
                    continue;
                }

                String value = readTag(directory, tag);
                if (value != null) {
                    values.put(mapped.getValue(), value);
                }
            }
        }
    }

    /**
     * IPTC lets several datasets repeat - keywords above all - and they arrive as an array. Joining
     * them keeps one string property per field, which is what the node type declares; the array form
     * would need the definition to become multi-valued.
     */
    private String readTag(IptcDirectory directory, int tag) {
        String[] parts = directory.getStringArray(tag);
        if (parts == null || parts.length == 0) {
            return trimToNull(directory.getString(tag));
        }

        StringBuilder joined = new StringBuilder();
        for (String part : parts) {
            String trimmed = trimToNull(part);
            if (trimmed == null) {
                continue;
            }

            if (joined.length() > 0) {
                joined.append(IptcPropertyMapping.MULTI_VALUE_SEPARATOR);
            }

            joined.append(trimmed);
        }

        return joined.length() == 0 ? null : joined.toString();
    }

    private void readXmp(Metadata metadata, Map<String, String> values) {
        for (XmpDirectory directory : metadata.getDirectoriesOfType(XmpDirectory.class)) {
            Map<String, String> properties = directory.getXmpProperties();
            if (properties == null || properties.isEmpty()) {
                continue;
            }

            // Grouped before being written, so the several entries of an array property become one
            // joined value rather than each overwriting the last.
            Map<String, List<String>> grouped = new LinkedHashMap<>();
            for (Map.Entry<String, String> property : properties.entrySet()) {
                String target = IptcPropertyMapping.propertyForXmpPath(property.getKey());
                if (target == null) {
                    continue;
                }

                String value = trimToNull(property.getValue());
                if (value == null) {
                    // The container node of an array carries no value of its own.
                    continue;
                }

                List<String> collected = grouped.get(target);
                if (collected == null) {
                    collected = new ArrayList<>();
                    grouped.put(target, collected);
                }

                if (!collected.contains(value)) {
                    collected.add(value);
                }
            }

            for (Map.Entry<String, List<String>> entry : grouped.entrySet()) {
                values.put(entry.getKey(), String.join(IptcPropertyMapping.MULTI_VALUE_SEPARATOR, entry.getValue()));
            }
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
