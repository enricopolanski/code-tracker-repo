import * as vscode from "vscode";
import { appendValues } from "./google-sheets";
import * as Effect from "@effect/io/Effect";

/**
 * Data specific to every event we track in the extension.
 */
type ExtensionEventInfo = {
  timestamp: number;
};

/**
 * The user has focused on the editor window from some other application.
 * This event comes from the VSCode API.
 */
type FocusOnEvent = ExtensionEventInfo & {
  type: "FocusOn";
};

/**
 * The user has created a new file.
 * This event comes from the VSCode API.
 */
type FileCreatedEvent = ExtensionEventInfo & {
  type: "FileCreated";
};

/**
 * The user has deleted a file.
 * This event comes from the VSCode API.
 */
type FileDeletedEvent = ExtensionEventInfo & {
  type: "FileDeleted";
};

/**
 * The user has saved a file.
 * This event comes from the VSCode API.
 */
interface FileSavedEvent extends ExtensionEventInfo {
  type: "FileSaved";
}

/**
 * The user has changed the focus to another file.
 * This event comes from the VSCode API.
 */
type FileFocusChangeEvent = ExtensionEventInfo & {
  type: "FileFocusChange";
};

/**
 * Only triggered for those documents we can consider filers.
 * We are only interested in document changes triggered mostly by the user.
 * This event comes from the VSCode API.
 */
type DocumentChanged = ExtensionEventInfo & {
  type: "DocumentChanged";
};

type EditorActiveEvent =
  | FocusOnEvent
  | FileCreatedEvent
  | FileDeletedEvent
  | FileSavedEvent
  | FileFocusChangeEvent
  | DocumentChanged;

function isFileRelatedEvent(
  type: SessionEvent["type"]
): type is "DocumentChanged" | "FileSaved" | "FileCreated" | "FileDeleted" {
  return (
    type === "DocumentChanged" ||
    type === "FileSaved" ||
    type === "FileCreated" ||
    type === "FileDeleted"
  );
}

/*
 * The elements below represent signals that the user is no longer active.
 */

/**
 * When the user "abandons" the editor window, i.e. when the user focuses one (e.g. browser, chat, etc.)
 * This event comes from the VSCode API.
 */
type FocusOffEvent = ExtensionEventInfo & {
  type: "FocusOff";
};

type EditorIdleEvent = FocusOffEvent;

/*
 * Those are additional event types created by our own extension
 */

/**
 * Triggered when the latest active event is older than a certain amount of time
 * This event is created by our own extension.
 */
type TimeoutEvent = ExtensionEventInfo & {
  type: "Timeout";
};

/**
 * First event sent created when the extension is activated.
 * This event is created by our own extension.
 */
type StartExtension = ExtensionEventInfo & {
  type: "StartExtension";
};

type ExtensionEvent = TimeoutEvent | StartExtension;

/**
 * Represents all the events we track in the VSCode session
 */
type SessionEvent = EditorActiveEvent | EditorIdleEvent | ExtensionEvent;

const createTimeout: (
  previousEvent: SessionEvent,
  timeoutEvent: TimeoutEvent,
  idleCountdown: number
) => NodeJS.Timeout = (previousEvent, timeoutEvent, idleCountdown) =>
  setTimeout(
    () => createTimeout(previousEvent, timeoutEvent, idleCountdown),
    idleCountdown
  );

type VSCodeAPIEventLister = {
  // includes both on and off events
  focus: (type: FocusOnEvent["type"] | FocusOffEvent["type"]) => void;
  file: {
    created: (type: FileCreatedEvent["type"], uri: vscode.Uri) => void;
    deleted: (type: FileDeletedEvent["type"], uri: vscode.Uri) => void;
    saved: (type: FileSavedEvent["type"], uri: vscode.Uri) => void;
    focusChange: (type: FileFocusChangeEvent["type"]) => void;
    documentChanged: (type: DocumentChanged["type"], uri: vscode.Uri) => void;
  };
};

const vscodeAPIEventListener: (eventMap: VSCodeAPIEventLister) => void = (
  eventMap
) => {
  const focusCallback = eventMap.focus;
  vscode.window.onDidChangeWindowState((e) => {
    if (e.focused) {
      focusCallback("FocusOn");
    } else {
      focusCallback("FocusOff");
    }
  });

  const fileCallback = eventMap.file;

  if (fileCallback) {
    vscode.workspace.onDidCreateFiles((event) =>
      fileCallback.created("FileCreated", event.files[0])
    );

    vscode.workspace.onDidDeleteFiles((event) =>
      fileCallback.deleted("FileDeleted", event.files[0])
    );

    vscode.workspace.onDidSaveTextDocument((event) =>
      fileCallback.saved("FileSaved", event.uri)
    );

    vscode.window.onDidChangeActiveTextEditor(() =>
      fileCallback.focusChange("FileFocusChange")
    );

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.scheme === "file") {
        fileCallback.documentChanged("DocumentChanged", event.document.uri);
      }
    });
  }
};

const areAllIdleEvents = (events: SessionEvent["type"][]): boolean =>
  events.every((x) => x === "FocusOff" || x === "Timeout");

const createLogMessage = (
  lastEvent: SessionEvent,
  currentEvent: SessionEvent,
  workspaceName: string
): string =>
  `EventType: ${currentEvent.type} - since last event: ${
    currentEvent.timestamp - lastEvent.timestamp
  } - workspace: ${workspaceName}\n`;

const withFile = (filePath: string) => (s: string) =>
  `${s} - FilePath: ${filePath}`;

const getProjectAndFileName = (path: string, workspaceName: string) => {
  return {
    workspaceName: workspaceName,
    fileName: path.split(workspaceName)[1],
  };
};

const createFileLogMessage =
  (filepath: string) =>
  (
    lastEvent: SessionEvent,
    currentEvent: SessionEvent,
    workspaceName: string
  ): string =>
    withFile(getProjectAndFileName(filepath, workspaceName).fileName)(
      createLogMessage(lastEvent, currentEvent, workspaceName)
    );

const getLogMessage = (
  type: SessionEvent["type"],
  currentEvent: SessionEvent,
  lastEvent: SessionEvent,
  workspaceName: string,
  path?: string
): string =>
  isFileRelatedEvent(type) && path
    ? createFileLogMessage(path)(lastEvent, currentEvent, workspaceName)
    : createLogMessage(lastEvent, currentEvent, workspaceName);

// create an output channel
const createOutputChannel = vscode.window.createOutputChannel;

type ExtensionState = {
  activeTime: number;
  extensionStart: number;
  idleTime: number;
  idleCountdown: number;
  lastEvent: SessionEvent;
  timeout: NodeJS.Timeout | null;
  sessionId: string;
  workspaceName: string;
};

export function activate(context: vscode.ExtensionContext) {
  const now = Date.now();

  let stateRef: ExtensionState = {
    activeTime: 0,
    extensionStart: now,
    idleCountdown: 15000,
    idleTime: 0,
    lastEvent: {
      type: "StartExtension",
      timestamp: now,
    },
    sessionId: vscode.env.sessionId,
    timeout: null,
    workspaceName:
      vscode.workspace.workspaceFolders![0].name || "No Workspace Name",
  };

  // create the output channels that will be used to log events
  const eventOutputChannel = createOutputChannel("code-tracker");
  const statsOutputChannel = createOutputChannel("code-tracker-stats");
  const debugOutputChannel = createOutputChannel("code-tracker-debug");

  const getExtensionConfiguration = () =>
    vscode.workspace.getConfiguration().get("codeTracker");

  debugOutputChannel.appendLine(JSON.stringify(getExtensionConfiguration()));

  const updateState = (
    oldState: ExtensionState,
    date: number,
    type: SessionEvent["type"]
  ): ExtensionState => ({
    ...oldState,
    lastEvent: { type, timestamp: date },
    activeTime: areAllIdleEvents([oldState.lastEvent.type, type])
      ? oldState.activeTime
      : oldState.activeTime + (date - oldState.lastEvent.timestamp),
    idleTime: areAllIdleEvents([oldState.lastEvent.type, type])
      ? oldState.idleTime + (date - oldState.lastEvent.timestamp)
      : oldState.idleTime,
  });

  /**
   * The callback for every single event tracked by the extension
   */
  function onEvent(type: SessionEvent["type"], uri?: vscode.Uri): void {
    const eventTime = Date.now();

    if (stateRef.timeout) {
      clearTimeout(stateRef.timeout);
    }

    // assign the new state
    const newState = updateState(stateRef, eventTime, type);

    const path = uri?.path;

    // log the event and stats
    const logMessage = getLogMessage(
      type,
      newState.lastEvent,
      stateRef.lastEvent,
      stateRef.workspaceName,
      path
    );

    eventOutputChannel.appendLine(logMessage);
    statsOutputChannel.appendLine(
      `Active Time: ${newState.activeTime} ms. Idle Time: ${newState.idleTime} ms.`
    );

    // update google sheets
    const program = appendValues(
      [
        [
          "repo",
          newState.workspaceName,
          "activeTime",
          Math.floor(newState.activeTime / 60000) +
            " minutes" +
            Math.floor((newState.activeTime % 60000) / 1000) +
            " seconds",
          "idleTime",
          Math.floor(newState.idleTime / 60000) +
            " minutes" +
            Math.floor((newState.idleTime % 60000) / 1000) +
            " seconds",
        ],
      ],
      "11PMsjz9HTO1Nw6xGm_TjGcUC_8LnkPYQpq7yc-j26R0",
      "Extension"
    );

    Effect.runPromise(program);

    stateRef = newState;

    stateRef.timeout = setTimeout(() => {
      onEvent("Timeout");
    }, stateRef.idleCountdown);
  }

  // subscribe to vscode events
  vscodeAPIEventListener({
    focus: onEvent,
    file: {
      created: onEvent,
      deleted: onEvent,
      saved: onEvent,
      focusChange: onEvent,
      documentChanged: onEvent,
    },
  });

  // start the extension
  onEvent("StartExtension");
}
