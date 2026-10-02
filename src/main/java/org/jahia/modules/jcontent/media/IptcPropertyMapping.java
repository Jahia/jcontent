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

import com.drew.metadata.iptc.IptcDirectory;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Where each piece of IPTC metadata ends up on the node, for both of the ways a file can carry it.
 * <p>
 * The same photograph can hold its caption twice over: once as legacy IIM (the binary block IPTC
 * defined in 1991, still what most tools write) and once as XMP (the RDF packet that superseded it,
 * and the only option in PNG and WebP). Both land on the same {@code jmix:iptc} properties, because
 * a photographer thinks "the credit line", not "IIM dataset 2:110 versus photoshop:Credit".
 * <p>
 * IIM is keyed by tag number rather than by the display name the extractor prints. Numbers are the
 * format's actual identity; display names are a presentation detail that could be reworded upstream.
 */
final class IptcPropertyMapping {

    static final String MIXIN = "jmix:iptc";

    /** Separator for the fields IPTC allows to repeat, such as keywords. */
    static final String MULTI_VALUE_SEPARATOR = "; ";

    private static final Map<Integer, String> IIM_TO_PROPERTY;
    private static final Map<String, String> XMP_TO_PROPERTY;

    static {
        Map<Integer, String> iim = new LinkedHashMap<>();
        iim.put(IptcDirectory.TAG_OBJECT_NAME, "j:iptcObjectName");
        iim.put(IptcDirectory.TAG_HEADLINE, "j:iptcHeadline");
        iim.put(IptcDirectory.TAG_CAPTION, "j:iptcCaption");
        iim.put(IptcDirectory.TAG_CAPTION_WRITER, "j:iptcCaptionWriter");
        iim.put(IptcDirectory.TAG_KEYWORDS, "j:iptcKeywords");
        iim.put(IptcDirectory.TAG_BY_LINE, "j:iptcByline");
        iim.put(IptcDirectory.TAG_BY_LINE_TITLE, "j:iptcBylineTitle");
        iim.put(IptcDirectory.TAG_CREDIT, "j:iptcCredit");
        iim.put(IptcDirectory.TAG_SOURCE, "j:iptcSource");
        iim.put(IptcDirectory.TAG_COPYRIGHT_NOTICE, "j:iptcCopyrightNotice");
        iim.put(IptcDirectory.TAG_CONTACT, "j:iptcContact");
        iim.put(IptcDirectory.TAG_CITY, "j:iptcCity");
        iim.put(IptcDirectory.TAG_SUB_LOCATION, "j:iptcSublocation");
        iim.put(IptcDirectory.TAG_PROVINCE_OR_STATE, "j:iptcProvinceState");
        iim.put(IptcDirectory.TAG_COUNTRY_OR_PRIMARY_LOCATION_NAME, "j:iptcCountry");
        iim.put(IptcDirectory.TAG_DATE_CREATED, "j:iptcDateCreated");
        iim.put(IptcDirectory.TAG_CATEGORY, "j:iptcCategory");
        iim.put(IptcDirectory.TAG_SUPPLEMENTAL_CATEGORIES, "j:iptcSupplementalCategories");
        iim.put(IptcDirectory.TAG_SPECIAL_INSTRUCTIONS, "j:iptcSpecialInstructions");
        iim.put(IptcDirectory.TAG_URGENCY, "j:iptcUrgency");
        iim.put(IptcDirectory.TAG_ORIGINAL_TRANSMISSION_REFERENCE, "j:iptcTransmissionReference");
        IIM_TO_PROPERTY = Collections.unmodifiableMap(iim);

        // The equivalences the IPTC Photo Metadata standard itself defines between IIM datasets and
        // XMP properties, so a file carrying only XMP fills the same fields.
        Map<String, String> xmp = new LinkedHashMap<>();
        xmp.put("dc:title", "j:iptcObjectName");
        xmp.put("photoshop:Headline", "j:iptcHeadline");
        xmp.put("dc:description", "j:iptcCaption");
        xmp.put("photoshop:CaptionWriter", "j:iptcCaptionWriter");
        xmp.put("dc:subject", "j:iptcKeywords");
        xmp.put("dc:creator", "j:iptcByline");
        xmp.put("photoshop:AuthorsPosition", "j:iptcBylineTitle");
        xmp.put("photoshop:Credit", "j:iptcCredit");
        xmp.put("photoshop:Source", "j:iptcSource");
        xmp.put("dc:rights", "j:iptcCopyrightNotice");
        xmp.put("photoshop:City", "j:iptcCity");
        xmp.put("Iptc4xmpCore:Location", "j:iptcSublocation");
        xmp.put("photoshop:State", "j:iptcProvinceState");
        xmp.put("photoshop:Country", "j:iptcCountry");
        xmp.put("photoshop:DateCreated", "j:iptcDateCreated");
        xmp.put("photoshop:Category", "j:iptcCategory");
        xmp.put("photoshop:SupplementalCategories", "j:iptcSupplementalCategories");
        xmp.put("photoshop:Instructions", "j:iptcSpecialInstructions");
        xmp.put("photoshop:Urgency", "j:iptcUrgency");
        xmp.put("photoshop:TransmissionReference", "j:iptcTransmissionReference");
        // j:iptcContact is deliberately absent: its XMP counterpart, Iptc4xmpCore:CreatorContactInfo,
        // is a structure of address, phone, email and web fields. Flattening it into one string would
        // invent a format nobody writes, so contact details stay IIM-only until the field is modelled
        // properly.
        XMP_TO_PROPERTY = Collections.unmodifiableMap(xmp);
    }

    private IptcPropertyMapping() {
    }

    static Map<Integer, String> iimTags() {
        return IIM_TO_PROPERTY;
    }

    static String propertyForXmpPath(String xmpPath) {
        return XMP_TO_PROPERTY.get(normalizeXmpPath(xmpPath));
    }

    /**
     * Reduces an XMP property path to the plain namespace-qualified name we map on.
     * <p>
     * XMP arrays and language alternatives arrive indexed - {@code dc:subject[1]}, and for a
     * localised caption {@code dc:description[1]} - so the index is stripped. Qualifiers arrive as
     * child paths such as {@code dc:description[1]/xml:lang}; those describe a value rather than
     * being one, and are rejected by returning null.
     */
    static String normalizeXmpPath(String xmpPath) {
        if (xmpPath == null) {
            return null;
        }

        if (xmpPath.indexOf('/') >= 0) {
            return null;
        }

        int bracket = xmpPath.indexOf('[');
        return bracket < 0 ? xmpPath : xmpPath.substring(0, bracket);
    }

    /**
     * @return every property this mapping can write, so a re-extraction can clear the ones the new
     *         binary no longer carries instead of leaving the previous file's values behind
     */
    static Iterable<String> allProperties() {
        return IIM_TO_PROPERTY.values();
    }
}
