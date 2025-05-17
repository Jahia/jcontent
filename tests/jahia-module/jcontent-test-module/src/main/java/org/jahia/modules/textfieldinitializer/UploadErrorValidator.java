package org.jahia.modules.textfieldinitializer;/*
 * ==========================================================================================
 * =                            JAHIA'S ENTERPRISE DISTRIBUTION                             =
 * ==========================================================================================
 *
 *                                  http://www.jahia.com
 *
 * JAHIA'S ENTERPRISE DISTRIBUTIONS LICENSING - IMPORTANT INFORMATION
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2025 Jahia Solutions Group. All rights reserved.
 *
 *     This file is part of a Jahia's Enterprise Distribution.
 *
 *     Jahia's Enterprise Distributions must be used in accordance with the terms
 *     contained in the Jahia Solutions Group Terms &amp; Conditions as well as
 *     the Jahia Sustainable Enterprise License (JSEL).
 *
 *     For questions regarding licensing, support, production usage...
 *     please contact our team at sales@jahia.com or go to http://www.jahia.com/license.
 *
 * ==========================================================================================
 */

import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.validation.JCRNodeValidator;

import javax.validation.constraints.AssertTrue;

/**
 * Test validator to always fail if node starts with the given prefix
 * (Methods needs to start with 'get' to be recognized by the validator)
 */
public class UploadErrorValidator implements JCRNodeValidator {

    private final JCRNodeWrapper node;
    private static final String TEST_NODE_NAME_PREFIX = "uploadConstraintValidation";

    public UploadErrorValidator(JCRNodeWrapper node) {
        this.node = node;
    }

    private boolean assertTest() {
        return !node.getName().startsWith(TEST_NODE_NAME_PREFIX);
    }

    @AssertTrue(message = "{validation.constraints.upload.constraint1}")
    public boolean getConstraint1() {
        return assertTest();
    }

    @AssertTrue(message = "{validation.constraints.upload.constraint2}")
    public boolean getConstraint2() {
        return assertTest();
    }

}
