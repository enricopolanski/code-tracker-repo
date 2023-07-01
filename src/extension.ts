import * as vscode from "vscode";
import { appendValues } from "./google-sheets";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as E from "@effect/data/Either";
import { SessionEvent, addEditorEventListeners, createTimeout } from "./events";
import { ExtensionState, initState, updateExtensionState } from "./state";
import { trackAndReport } from "./reporting";

export function activate() {
  const now = Date.now();

  let stateRef: ExtensionState = initState(now);

  // const hasGoogleSheetsConfig = E.isRight(configuration);

  // if (hasGoogleSheetsConfig) {
  //   debugOutputChannel.appendLine(
  //     "Extension launched with Google Sheets active"
  //   );
  // }

  /**
   * The callback for every single event tracked by the extension
   */
  function onEvent(event: SessionEvent): void {
    /*
     * At every event we do 4 things:
     * 1. Clear any pending timeout
     * 2. Compute the new state of the extension and update the stateRef
     * 3. Trigger the reporting of the event and stats
     * 4. Create a new timeout and assign it to the stateRef
     */

    // 1. Clear the pending timeout, if any.
    if (stateRef.timeout) {
      clearTimeout(stateRef.timeout);
    }

    // 2. Compute the new state of the extension and update the stateRef
    stateRef = updateExtensionState(stateRef, event);

    // 3. Trigger the reporting of the event and stats
    Effect.runPromise(trackAndReport(stateRef));

    // 4. Create a new timeout and assign it to the stateRef
    stateRef.timeout = createTimeout(onEvent, stateRef.idleCountdown);
  }

  // subscribe to vscode events
  addEditorEventListeners({
    onFocus: onEvent,
    onFileCreated: onEvent,
    onFileDeleted: onEvent,
    onFileSaved: onEvent,
    onFileFocusChange: onEvent,
  });

  onEvent({ _tag: "StartExtension", timestamp: now });
}
