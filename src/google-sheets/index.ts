import { sheets_v4, Auth, google } from "googleapis";
import * as Effect from "@effect/io/Effect";
import { identity, pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import { ExtensionConfiguration } from "../config";
import * as S from "@effect/schema/Schema";

export interface UnknownError {
  _tag: "UnknownError";
  data?: unknown;
}

const unknownError: (data?: unknown) => UnknownError = (data) => ({
  _tag: "UnknownError",
  data,
});

/**
 * Represents an error deriving from querying a non existing worksheet or range
 */
export interface UnparsableRangeError {
  range: string;
  _tag: "UnparsableRangeError";
  data: unknown;
}

const InvalidArgument = S.struct({
  response: S.struct({
    data: S.struct({
      error: S.struct({
        code: S.literal(400),
        status: S.literal("INVALID_ARGUMENT"),
      }),
    }),
  }),
});

type InvalidArgument = S.To<typeof InvalidArgument>;

type InvalidArgumentError = {
  _tag: "InvalidArgumentError";
  data: InvalidArgument;
};

const invalidArgumentError = (data: InvalidArgument): InvalidArgumentError => ({
  _tag: "InvalidArgumentError",
  data,
});

const noValuesError = {
  _tag: "NoValuesError",
} as const;

type NoValuesError = typeof noValuesError;

export type SheetsQueryError =
  | UnknownError
  | InvalidArgumentError
  | NoValuesError;

export const effectSheet: (
  configuration: ExtensionConfiguration
) => Effect.Effect<never, never, sheets_v4.Sheets> = (configuration) =>
  Effect.succeed(
    google.sheets({
      version: "v4",
      auth: new Auth.JWT({
        email: configuration.codeTracker.googleSheets.clientEmail,
        key: configuration.codeTracker.googleSheets.privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      }),
    })
  );

export const getSheetValues = (
  configuration: ExtensionConfiguration
): Effect.Effect<never, SheetsQueryError, any[][]> =>
  pipe(
    effectSheet(configuration),
    Effect.flatMap((sheets: sheets_v4.Sheets) =>
      Effect.tryCatchPromise(
        () =>
          sheets.spreadsheets.values.get({
            spreadsheetId: configuration.codeTracker.googleSheets.spreadSheetId,
            range: configuration.codeTracker.googleSheets.workSheetTitle,
          }),
        (e) =>
          pipe(
            S.parseOption(InvalidArgument)(e),
            O.match(() => unknownError(e), invalidArgumentError)
          )
      )
    ),
    Effect.flatMap((res) =>
      res.data.values
        ? Effect.succeed(res.data.values)
        : Effect.fail(noValuesError)
    )
  );

// TODO: add date time to current values
export const appendValues = (
  values: (number | string)[][],
  configuration: ExtensionConfiguration
) =>
  pipe(
    effectSheet(configuration),
    Effect.flatMap((sheets: sheets_v4.Sheets) =>
      Effect.tryPromise(() =>
        sheets.spreadsheets.values.append({
          spreadsheetId: configuration.codeTracker.googleSheets.spreadSheetId,
          range: configuration.codeTracker.googleSheets.workSheetTitle,
          valueInputOption: "RAW",
          requestBody: {
            values,
          },
        })
      )
    ),
    Effect.mapError((response) => unknownError(response))
  );

export const updateValues = (
  row: number,
  values: (number | string)[][],
  configuration: ExtensionConfiguration
): Effect.Effect<
  never,
  SheetsQueryError,
  sheets_v4.Schema$UpdateValuesResponse
> =>
  pipe(
    effectSheet(configuration),
    Effect.flatMap((sheets: sheets_v4.Sheets) =>
      Effect.tryPromise(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: configuration.codeTracker.googleSheets.spreadSheetId,
          range: `${configuration.codeTracker.googleSheets.workSheetTitle}!A${row}`,
          valueInputOption: "RAW",
          requestBody: {
            values,
          },
        })
      )
    ),
    Effect.map((res) => res.data),
    Effect.mapError((response) => unknownError(response))
  );

// TODO: Does this even work?
/**
 * Creates a new worksheet in the given spreadsheet
 */
// export const appendWorksheet = (
//   spreadsheetId: string,
//   title: string,
//   configuration: ExtensionConfiguration
// ) =>
//   pipe(
//     effectSheet(configuration),
//     Effect.flatMap((sheets: sheets_v4.Sheets) =>
//       Effect.async(() =>
//         sheets.spreadsheets
//           .batchUpdate({
//             spreadsheetId,
//             requestBody: {
//               requests: [
//                 {
//                   addSheet: {
//                     properties: {
//                       title,
//                     },
//                   },
//                 },
//               ],
//             },
//           })
//           .then(identity, unknownError)
//       )
//     )
//   );
