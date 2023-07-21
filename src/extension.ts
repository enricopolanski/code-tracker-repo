import * as Effect from "@effect/io/Effect";
import { SessionEvent, addEditorEventListeners, createTimeout } from "./events";
import { ExtensionState, initState, updateExtensionState } from "./state";
import { trackAndReport } from "./reporting";

export function activate() {
  const now = Date.now();

  let stateRef: ExtensionState = initState(now);

  /**
   * The callback for every single event tracked by the extension
   */
  function onEvent(event: SessionEvent): void {
    // Should we update the remote stats?
    const msSinceLastUpdate = event.timestamp - stateRef.lastUpdate;
    const shouldUpdateRemoteStats = msSinceLastUpdate > stateRef.idleCountdown;

    // 1. Clear the pending timeout, if any.
    if (stateRef.timeout) {
      clearTimeout(stateRef.timeout);
    }

    // 2. Compute the new state of the extension and update the stateRef
    stateRef = updateExtensionState(stateRef, event, shouldUpdateRemoteStats);

    Effect.runPromise(trackAndReport(stateRef, shouldUpdateRemoteStats));

    // 4. Create a new timeout and assign it to the stateRef
    stateRef.timeout = createTimeout(onEvent, stateRef.idleCountdown);
  }

  addEditorEventListeners({
    onActiveTextEditorChanged: onEvent,
    onActiveTerminalChange: onEvent,
    onBreakpointsChanged: onEvent,
    onColorThemeChanged: onEvent,
    onConfigurationChange: onEvent,
    onDebugSessionStarted: onEvent,
    onDebugSessionTerminated: onEvent,
    onDidGrantWorkspaceTrust: onEvent,
    onExtensionsChanged: onEvent,
    onFileClosed: onEvent,
    onFileCreated: onEvent,
    onFileDeleted: onEvent,
    onFileEdited: onEvent,
    onFileSaved: onEvent,
    onFileOpened: onEvent,
    onFileRenamed: onEvent,
    onFocus: onEvent,
    onNotebookDocumentChanged: onEvent,
    onNotebookDocumentClosed: onEvent,
    onNotebookDocumentOpened: onEvent,
    onNotebookDocumentSaved: onEvent,
    onNotebookEditorSelectionChanged: onEvent,
    onNotebookEditorVisibleRangesChanged: onEvent,
    onTaskStart: onEvent,
    onTelemetrySettingsChanged: onEvent,
    onTerminalClosed: onEvent,
    onTerminalOpened: onEvent,
    onVisibleNotebookEditorsChanged: onEvent,
    onWorkspaceFoldersChange: onEvent,
  });

  onEvent({ _tag: "StartExtension", timestamp: now });
}
