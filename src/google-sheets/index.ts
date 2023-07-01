import { sheets_v4, Auth, google } from "googleapis";
import * as Effect from "@effect/io/Effect";
import { identity, pipe } from "@effect/data/Function";
import { ExtensionConfiguration } from "../config";

export interface UnknownError {
  _tag: "UnknownError";
  data?: unknown;
}

type _SheetsApiResponse = { response: { data: { error: unknown } } };

/**
 * Represents an error deriving from querying a non existing worksheet or range
 */
export interface UnparsableRangeError {
  range: string;
  _tag: "UnparsableRangeError";
}

export type SheetsQueryError = UnknownError | UnparsableRangeError;

const sheetsQueryError: (
  data: _SheetsApiResponse,
  title: string
) => SheetsQueryError = (data, title) =>
  data
    ? {
        _tag: "UnparsableRangeError",
        range: title,
      }
    : {
        _tag: "UnknownError",
        data,
      };

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
  spreadsheetId: string,
  title: string,
  configuration: ExtensionConfiguration
) =>
  pipe(
    effectSheet(configuration),
    Effect.flatMap((sheets: sheets_v4.Sheets) =>
      Effect.tryCatchPromise(
        () =>
          sheets.spreadsheets.values.get({
            spreadsheetId,
            range: title,
          }),
        (error) => sheetsQueryError(error as any, title)
      )
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
    Effect.mapError((response) =>
      sheetsQueryError(
        response as any,
        configuration.codeTracker.googleSheets.workSheetTitle
      )
    )
  );

/**
 * Creates a new worksheet in the given spreadsheet
 */
export const appendWorksheet = (
  spreadsheetId: string,
  title: string,
  configuration: ExtensionConfiguration
) =>
  pipe(
    effectSheet(configuration),
    Effect.flatMap((sheets: sheets_v4.Sheets) =>
      Effect.async(
        () =>
          sheets.spreadsheets
            .batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [
                  {
                    addSheet: {
                      properties: {
                        title,
                      },
                    },
                  },
                ],
              },
            })
            .then(identity, (error) => sheetsQueryError(error as any, title))
        // (error) => sheetsQueryError(error as any, title)
      )
    )
  );

// TODO: utility for sheets: `A1 A2` etc notation or double array
