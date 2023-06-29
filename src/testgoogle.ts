import { Auth, google, sheets_v4 } from "googleapis";
import { effectSheet } from "./google-sheets";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

// spreadsheet id should come from external configurator

const spreadsheetId = "11PMsjz9HTO1Nw6xGm_TjGcUC_8LnkPYQpq7yc-j26R0";

// title should be a default parameter for now

interface UnknownError {
  readonly _tag: "UnknownError";
  readonly data?: unknown;
}

const unknownError = (data?: unknown): UnknownError => ({
  _tag: "UnknownError",
  data,
});

interface SpreadsheetNotFoundError {
  readonly _tag: "SpreadsheetNotFoundError";
  readonly spreadsheetId: string;
}

const spreadsheetNotFoundError = (
  spreadsheetId: string
): SpreadsheetNotFoundError => ({
  _tag: "SpreadsheetNotFoundError",
  spreadsheetId,
});

interface WorksheetNotFoundError {
  readonly _tag: "WorksheetNotFoundError";
  readonly spreadsheetId: string;
  readonly worksheetTitle: string;
}

// we need to add two types of errors:
// 1. those for which spreadsheetId is not found
// 2. those for which worksheet is not found

const parseError = (error: unknown): UnknownError => ({
  _tag: "UnknownError",
});

const readWorksheet = (
  worksheetTitle: string
): Effect.Effect<never, UnknownError, unknown> =>
  pipe(
    effectSheet,
    Effect.flatMap((sheet) =>
      pipe(
        Effect.tryCatchPromise(
          () =>
            sheet.spreadsheets.values.get({
              spreadsheetId,
              range: worksheetTitle,
            }),
          unknownError
        )
        // Effect.mapError((response) => JSON.stringify(response.data))
      )
    )
  );

Effect.runPromise(readWorksheet("Extension")); //?
