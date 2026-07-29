/// <reference types="./graphql-cache.d.ts" />
import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-live.d.ts';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    Date: unknown; // To be updated with the real runtime types
    Long: unknown;
  }
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
