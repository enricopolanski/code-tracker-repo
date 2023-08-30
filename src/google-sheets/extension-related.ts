import {
  UnknownError,
  UnparsableRangeError,
  appendValues,
  getSheetValues,
  updateValues,
} from ".";
import { ExtensionConfiguration } from "../config";
import { ExtensionState } from "../state";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { formatTime, logDebug, showErrorMessage } from "../reporting";
import * as O from "@effect/data/Option";

const localizeTime = (time: number) =>
  new Date(time).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const onUnparsableRangeError =
  (state: ExtensionState, configuration: ExtensionConfiguration) =>
  (error: UnparsableRangeError) =>
    pipe(
      showErrorMessage(
        "Google Sheets API Error, the requested range is unparsable. Check output channel for more details."
      ),
      Effect.zipRight(
        logDebug(
          `\n[${localizeTime(
            state.lastEvent.timestamp
          )}] The API is having issues updating the following worksheet range: ${
            error.range
          }.\nVerify that the specified worksheet range is correct and the spreadsheet exists:\nhttps://docs.google.com/spreadsheets/d/${
            configuration.codeTracker.googleSheets.spreadSheetId
          }/`
        )
      )
    );

const onUnknownError = (error: UnknownError) =>
  showErrorMessage(JSON.stringify(error));

export const findRowByValue =
  (value: string) =>
  (rows: string[][]): O.Option<number> =>
    rows.findIndex((row) => row.includes(value)) > -1
      ? O.some(rows.findIndex((row) => row.includes(value)) + 1)
      : O.none();

export const saveStatsToWorksheet = (
  state: ExtensionState,
  configuration: ExtensionConfiguration
): Effect.Effect<never, void, void> =>
  pipe(
    getSheetValues(configuration),
    Effect.flatMap((values) => findRowByValue(state.sessionId)(values)),
    Effect.flatMap((rowNumber) =>
      updateValues(
        rowNumber,
        [
          [
            new Date().toLocaleString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            state.workspaceName,
            state.activeTime,
            state.idleTime,
            state.sessionId,
          ],
        ],
        configuration
      )
    ),
    Effect.catchTags({
      NoSuchElementException: () =>
        appendValues(
          [
            [
              new Date().toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              state.workspaceName,
              formatTime(state.activeTime),
              formatTime(state.idleTime),
              state.sessionId,
            ],
          ],
          configuration
        ),
      UnknownError: onUnknownError,
      UnparsableRangeError: onUnparsableRangeError(state, configuration),
    })
  );
