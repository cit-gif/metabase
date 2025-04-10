import { c, t } from "ttag";

import * as Lib from "metabase-lib";
import type Database from "metabase-lib/v1/metadata/Database";
import type { Expression } from "metabase-types/api";

import { ResolverError } from "./errors";
import { parseDimension, parseMetric, parseSegment } from "./identifier";
import type { Node } from "./pratt";
import { resolve } from "./resolver";
import type { StartRule } from "./types";

export function resolverPass({
  query,
  stageIndex,
  startRule,
  database,
}: {
  query: Lib.Query;
  stageIndex: number;
  startRule: StartRule;
  database?: Database | null;
}) {
  return (expression: Expression): Expression =>
    resolve({
      expression,
      type: startRule,
      database,
      fn: fieldResolver({
        query,
        stageIndex,
        startRule,
      }),
    });
}

export function fieldResolver(options: {
  query: Lib.Query;
  stageIndex: number;
  startRule: string;
}) {
  return function (kind: string, name: string, node: Node) {
    const { query, stageIndex } = options;
    if (!query) {
      // @uladzimirdev double check why is this needed
      return [kind, name];
    }

    if (kind === "metric") {
      const metric = parseMetric(name, options);
      if (!metric) {
        const dimension = parseDimension(name, options);
        const isNameKnown = Boolean(dimension);

        if (isNameKnown) {
          const error = c(
            "{0} is an identifier of the field provided by user in a custom expression",
          )
            .t`No aggregation found in: ${name}. Use functions like Sum() or custom Metrics`;

          throw new ResolverError(error, node);
        }

        throw new ResolverError(t`Unknown Metric: ${name}`, node);
      }

      return Lib.legacyRef(query, stageIndex, metric);
    } else if (kind === "segment") {
      const segment = parseSegment(name, options);
      if (!segment) {
        throw new ResolverError(t`Unknown Segment: ${name}`, node);
      }

      return Lib.legacyRef(query, stageIndex, segment);
    } else {
      // fallback
      const dimension = parseDimension(name, options);
      if (!dimension) {
        throw new ResolverError(t`Unknown Field: ${name}`, node);
      }

      return Lib.legacyRef(query, stageIndex, dimension);
    }
  };
}
