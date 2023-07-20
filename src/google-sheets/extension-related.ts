import {
  UnknownError,
  UnparsableRangeError,
  appendValues,
} from ".";
import { ExtensionConfiguration } from "../config";
import { ExtensionState } from "../state";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { formatTime, logDebug, showErrorMessage } from "../reporting";

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

export const saveStatsToWorksheet = (
  state: ExtensionState,
  configuration: ExtensionConfiguration
): Effect.Effect<never, void, void> =>
  pipe(
    appendValues(
      [
        [
          new Date().toLocaleString(),
          state.workspaceName,
          formatTime(state.activeTime),
          formatTime(state.idleTime),
          state.sessionId,
        ],
      ],
      
      configuration
    ),
    Effect.catchTags({
      UnknownError: onUnknownError,
      UnparsableRangeError: onUnparsableRangeError(state, configuration),
    })
  );
