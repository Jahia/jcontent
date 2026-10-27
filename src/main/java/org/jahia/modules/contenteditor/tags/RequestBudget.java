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
package org.jahia.modules.contenteditor.tags;

import graphql.schema.DataFetchingEnvironment;
import org.jahia.modules.graphql.provider.dxm.relay.PaginationHelper;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.stream.Stream;

/**
 * Charges streamed results to graphql-dxm-provider's per-request node allowance.
 *
 * <p>{@code PaginationHelper.chargeToRequestBudget} only exists from graphql-dxm-provider 3.9.1, while jContent
 * runs on older providers too, so it is looked up once at runtime: on a provider that has it the stream is charged
 * exactly as graphql-dxm-provider's own connections are, on an older one it is returned unchanged.
 */
final class RequestBudget {
    private static final Method CHARGE_TO_REQUEST_BUDGET = findChargeToRequestBudget();

    private RequestBudget() {
    }

    @SuppressWarnings("unchecked")
    static <T> Stream<T> charge(Stream<T> stream, DataFetchingEnvironment environment) {
        if (CHARGE_TO_REQUEST_BUDGET == null) {
            return stream;
        }
        try {
            return (Stream<T>) CHARGE_TO_REQUEST_BUDGET.invoke(null, stream, environment);
        } catch (IllegalAccessException e) {
            throw new IllegalStateException(e);
        } catch (InvocationTargetException e) {
            // The provider signals an exhausted allowance with a runtime exception: rethrow it as is
            if (e.getCause() instanceof RuntimeException) {
                throw (RuntimeException) e.getCause();
            }
            throw new IllegalStateException(e.getCause());
        }
    }

    private static Method findChargeToRequestBudget() {
        try {
            return PaginationHelper.class.getMethod("chargeToRequestBudget", Stream.class, DataFetchingEnvironment.class);
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
}
