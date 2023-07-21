import * as vscode from "vscode";

/*
 * This file is concerned with all things event-related.
   Events are triggered by the editor and the extension,
   in response to user actions, commands and timeouts.
   They can be listened to.
 */

/**
 * EventInfo is the base interface for all event interfaces.
 */
interface EventInfo {
  _tag: string;
  timestamp: number;
}

/**
 * Triggered when the user focuses on the editor.
 */
type FocusOnEvent = EventInfo & { _tag: "FocusOn" };

export const createFocusOnEvent = (): FocusOnEvent => ({
  _tag: "FocusOn",
  timestamp: Date.now(),
});

/**
 * Triggered when the user focuses off the editor (abandoning the editor).
 */
type FocusOffEvent = EventInfo & { _tag: "FocusOff" };

export const createFocusOffEvent = (): FocusOffEvent => ({
  _tag: "FocusOff",
  timestamp: Date.now(),
});

/**
 * Triggered when a timeout event is triggered.
 */
type TimeoutEvent = EventInfo & { _tag: "Timeout" };

export const createTimeoutEvent = (): TimeoutEvent => ({
  _tag: "Timeout",
  timestamp: Date.now(),
});

/**
 * All events related to files include their relative path.
 */
interface FileEvent extends EventInfo {
  path: string;
}

/**
 * Triggered when the user changes the active text editor.
 */
type onActiveTextEditorChangedEvent = EventInfo &
  FileEvent & { _tag: "onActiveTextEditorChanged" };

type FileClosedEvent = EventInfo & FileEvent & { _tag: "FileClosed" };

/**
 * Triggered when the user creates a new file.
 */
type FileCreatedEvent = EventInfo & FileEvent & { _tag: "FileCreated" };

/**
 * Triggered when the user deletes a file.
 */
type FileDeletedEvent = EventInfo & FileEvent & { _tag: "FileDeleted" };

/**
 * Triggered when the user edits a file
 */
type FileEditedEvent = EventInfo & FileEvent & { _tag: "FileEdited" };

/**
 * Triggered when the user opens a file.
 */
type FileOpenedEvent = EventInfo & FileEvent & { _tag: "FileOpened" };

/**
 * Triggered when the user saves a file.
 */
type FileSavedEvent = EventInfo & FileEvent & { _tag: "FileSaved" };

/**
 * Triggered when the extension is started
 */

export const isFileRelatedEvent = (
  event: SessionEvent
): event is
  | FileCreatedEvent
  | FileDeletedEvent
  | FileEditedEvent
  | FileClosedEvent
  | FileOpenedEvent
  | onActiveTextEditorChangedEvent
  | FileSavedEvent => "path" in event;

type StartExtension = EventInfo & { _tag: "StartExtension" };

type TerminalClosedEvent = EventInfo & { _tag: "TerminalClosed" };

type TerminalOpenedEvent = EventInfo & { _tag: "TerminalOpened" };

type ActiveTerminalChangedEvent = EventInfo & { _tag: "ActiveTerminalChanged" };

type ColorThemeChangedEvent = EventInfo & { _tag: "ColorThemeChanged" };

type ConfigurationChangedEvent = EventInfo & { _tag: "ConfigurationChanged" };

type WorkspaceFoldersChangedEvent = EventInfo & {
  _tag: "WorkspaceFoldersChanged";
};

type WorkspaceTrustGrantedEvent = EventInfo & { _tag: "WorkspaceTrustGranted" };

type FilesRenamedEvent = EventInfo & { _tag: "FilesRenamed" };

type NotebookDocumentChangedEvent = EventInfo & {
  _tag: "NotebookDocumentChanged";
};

type NotebookDocumentClosedEvent = EventInfo & {
  _tag: "NotebookDocumentClosed";
};

type NotebookDocumentOpenedEvent = EventInfo & {
  _tag: "NotebookDocumentOpened";
};

type NotebookDocumentSavedEvent = EventInfo & { _tag: "NotebookDocumentSaved" };

type VisibleNotebookEditorsChangedEvent = EventInfo & {
  _tag: "VisibleNotebookEditorsChanged";
};

type NotebookEditorSelectionChangedEvent = EventInfo & {
  _tag: "NotebookEditorSelectionChanged";
};

type NotebookEditorVisibleRangesChangedEvent = EventInfo & {
  _tag: "NotebookEditorVisibleRangesChanged";
};

type BreakpointsChangedEvent = EventInfo & { _tag: "BreakpointsChanged" };

type DebugSessionStartedEvent = EventInfo & { _tag: "DebugSessionStarted" };

type DebugSessionTerminatedEvent = EventInfo & {
  _tag: "DebugSessionTerminated";
};

type TelemetrySettingsChangedEvent = EventInfo & {
  _tag: "TelemetrySettingsChanged";
};

type ExtensionsChangedEvent = EventInfo & { _tag: "ExtensionsChanged" };

type TaskStartedEvent = EventInfo & { _tag: "TaskStarted" };

export type SessionEvent =
  | onActiveTextEditorChangedEvent
  | FileClosedEvent
  | FileCreatedEvent
  | FileEditedEvent
  | FileDeletedEvent
  | FileOpenedEvent
  | FileSavedEvent
  | FocusOnEvent
  | FocusOffEvent
  | StartExtension
  | TimeoutEvent
  | TerminalOpenedEvent
  | TerminalClosedEvent
  | ActiveTerminalChangedEvent
  | TextEditorVisibleRangesChangedEvent
  | ColorThemeChangedEvent
  | ConfigurationChangedEvent
  | WorkspaceFoldersChangedEvent
  | WorkspaceTrustGrantedEvent
  | FilesRenamedEvent
  | NotebookDocumentChangedEvent
  | NotebookDocumentClosedEvent
  | NotebookDocumentOpenedEvent
  | NotebookDocumentSavedEvent
  | VisibleNotebookEditorsChangedEvent
  | NotebookEditorSelectionChangedEvent
  | NotebookEditorVisibleRangesChangedEvent
  | BreakpointsChangedEvent
  | DebugSessionStartedEvent
  | DebugSessionTerminatedEvent
  | TelemetrySettingsChangedEvent
  | ExtensionsChangedEvent
  | TaskStartedEvent;

export const createTimeout: (
  callback: (event: TimeoutEvent) => void,
  timeout: number
) => NodeJS.Timeout = (callback, timeout) =>
  setTimeout(
    () => callback({ _tag: "Timeout", timestamp: Date.now() }),
    timeout
  );

/**
 * Represents a map of VSCode editor events
 */
type VSCodeListenersMap = {
  // includes both on and off events
  onActiveTextEditorChanged: (type: onActiveTextEditorChangedEvent) => void;
  onFocus: (type: FocusOnEvent | FocusOffEvent) => void;
  onFileCreated: (type: FileCreatedEvent) => void;
  onFileDeleted: (type: FileDeletedEvent) => void;
  onFileSaved: (type: FileSavedEvent) => void;
  onFileEdited: (type: FileEditedEvent) => void;
  onFileClosed: (type: FileClosedEvent) => void;
  onFileOpened: (type: FileOpenedEvent) => void;
  onTerminalOpened: (type: TerminalOpenedEvent) => void;
  onTerminalClosed: (type: TerminalClosedEvent) => void;
  onActiveTerminalChange: (type: ActiveTerminalChangedEvent) => void;

  onColorThemeChanged: (type: ColorThemeChangedEvent) => void;
  onConfigurationChange: (type: ConfigurationChangedEvent) => void;
  onWorkspaceFoldersChange: (type: WorkspaceFoldersChangedEvent) => void;
  onDidGrantWorkspaceTrust: (type: WorkspaceTrustGrantedEvent) => void;
  onFileRenamed: (type: FilesRenamedEvent) => void;
  onNotebookDocumentChanged: (type: NotebookDocumentChangedEvent) => void;
  onNotebookDocumentClosed: (type: NotebookDocumentClosedEvent) => void;
  onNotebookDocumentOpened: (type: NotebookDocumentOpenedEvent) => void;
  onNotebookDocumentSaved: (type: NotebookDocumentSavedEvent) => void;
  onVisibleNotebookEditorsChanged: (
    type: VisibleNotebookEditorsChangedEvent
  ) => void;
  onNotebookEditorSelectionChanged: (
    type: NotebookEditorSelectionChangedEvent
  ) => void;
  onNotebookEditorVisibleRangesChanged: (
    type: NotebookEditorVisibleRangesChangedEvent
  ) => void;
  onBreakpointsChanged: (type: BreakpointsChangedEvent) => void;
  onDebugSessionStarted: (type: DebugSessionStartedEvent) => void;
  onDebugSessionTerminated: (type: DebugSessionTerminatedEvent) => void;
  onTelemetrySettingsChanged: (type: TelemetrySettingsChangedEvent) => void;
  onExtensionsChanged: (type: ExtensionsChangedEvent) => void;
  onTaskStart: (type: TaskStartedEvent) => void;
};

export const addEditorEventListeners = (
  callbacksMap: Partial<VSCodeListenersMap>
): void => {
  const {
    onActiveTextEditorChanged,
    onFocus,
    onFileClosed,
    onFileCreated,
    onFileDeleted,
    onFileEdited,
    onFileOpened,
    onFileSaved,
    onTerminalOpened,
    onTerminalClosed,
    onActiveTerminalChange,
    onColorThemeChanged,
    onConfigurationChange,
    onWorkspaceFoldersChange,
    onDidGrantWorkspaceTrust,
    onFileRenamed,
    onNotebookDocumentChanged,
    onNotebookDocumentClosed,
    onNotebookDocumentOpened,
    onNotebookDocumentSaved,
    onVisibleNotebookEditorsChanged,
    onNotebookEditorSelectionChanged,
    onNotebookEditorVisibleRangesChanged,
    onBreakpointsChanged,
    onDebugSessionStarted,
    onDebugSessionTerminated,
    onTelemetrySettingsChanged,
    onExtensionsChanged,
    onTaskStart,
  } = callbacksMap;
  if (onFocus) {
    vscode.window.onDidChangeWindowState((e) => {
      if (e.focused) {
        onFocus({ _tag: "FocusOn", timestamp: Date.now() });
      } else {
        onFocus({ _tag: "FocusOff", timestamp: Date.now() });
      }
    });
  }

  if (onFileCreated) {
    vscode.workspace.onDidCreateFiles((e) => {
      e.files.forEach((file) => {
        onFileCreated({
          _tag: "FileCreated",
          timestamp: Date.now(),
          path: file.path,
        });
      });
    });
  }

  if (onFileDeleted) {
    vscode.workspace.onDidDeleteFiles((e) => {
      e.files.forEach((file) => {
        onFileDeleted({
          _tag: "FileDeleted",
          timestamp: Date.now(),
          path: file.path,
        });
      });
    });
  }

  if (onFileSaved) {
    vscode.workspace.onDidSaveTextDocument((e) => {
      onFileSaved({
        _tag: "FileSaved",
        timestamp: Date.now(),
        path: e.fileName,
      });
    });
  }

  if (onFileEdited) {
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme === "file") {
        onFileEdited({
          _tag: "FileEdited",
          timestamp: Date.now(),
          path: e.document.fileName,
        });
      }
    });
  }

  if (onFileClosed) {
    vscode.workspace.onDidCloseTextDocument((e) => {
      onFileClosed({
        _tag: "FileClosed",
        timestamp: Date.now(),
        path: e.fileName,
      });
    });
  }

  if (onFileOpened) {
    vscode.workspace.onDidOpenTextDocument((e) => {
      onFileOpened({
        _tag: "FileOpened",
        timestamp: Date.now(),
        path: e.fileName,
      });
    });
  }

  if (onActiveTextEditorChanged) {
    vscode.window.onDidChangeActiveTextEditor((e) => {
      onActiveTextEditorChanged({
        _tag: "onActiveTextEditorChanged",
        timestamp: Date.now(),
        path: (e && e.document.fileName) || "UnknownFile",
      });
    });
  }

  if (onTerminalOpened) {
    vscode.window.onDidOpenTerminal(() => {
      onTerminalOpened({
        _tag: "TerminalOpened",
        timestamp: Date.now(),
      });
    });
  }

  if (onTerminalClosed) {
    vscode.window.onDidCloseTerminal(() => {
      onTerminalClosed({
        _tag: "TerminalClosed",
        timestamp: Date.now(),
      });
    });
  }

  if (onActiveTerminalChange) {
    vscode.window.onDidChangeActiveTerminal(() =>
      onActiveTerminalChange({
        _tag: "ActiveTerminalChanged",
        timestamp: Date.now(),
      })
    );
  }

  if (onColorThemeChanged) {
    vscode.window.onDidChangeActiveColorTheme(() => {
      onColorThemeChanged({
        _tag: "ColorThemeChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onConfigurationChange) {
    vscode.workspace.onDidChangeConfiguration(() => {
      onConfigurationChange({
        _tag: "ConfigurationChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onWorkspaceFoldersChange) {
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      onWorkspaceFoldersChange({
        _tag: "WorkspaceFoldersChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onDidGrantWorkspaceTrust) {
    vscode.workspace.onDidGrantWorkspaceTrust(() => {
      onDidGrantWorkspaceTrust({
        _tag: "WorkspaceTrustGranted",
        timestamp: Date.now(),
      });
    });
  }

  if (onFileRenamed) {
    vscode.workspace.onDidRenameFiles(() => {
      onFileRenamed({
        _tag: "FilesRenamed",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookDocumentChanged) {
    vscode.workspace.onDidChangeNotebookDocument(() => {
      onNotebookDocumentChanged({
        _tag: "NotebookDocumentChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookDocumentClosed) {
    vscode.workspace.onDidCloseNotebookDocument(() => {
      onNotebookDocumentClosed({
        _tag: "NotebookDocumentClosed",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookDocumentOpened) {
    vscode.workspace.onDidOpenNotebookDocument(() => {
      onNotebookDocumentOpened({
        _tag: "NotebookDocumentOpened",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookDocumentSaved) {
    vscode.workspace.onDidSaveNotebookDocument(() => {
      onNotebookDocumentSaved({
        _tag: "NotebookDocumentSaved",
        timestamp: Date.now(),
      });
    });
  }

  if (onVisibleNotebookEditorsChanged) {
    vscode.window.onDidChangeVisibleNotebookEditors(() => {
      onVisibleNotebookEditorsChanged({
        _tag: "VisibleNotebookEditorsChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookEditorSelectionChanged) {
    vscode.window.onDidChangeNotebookEditorSelection(() => {
      onNotebookEditorSelectionChanged({
        _tag: "NotebookEditorSelectionChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onNotebookEditorVisibleRangesChanged) {
    vscode.window.onDidChangeNotebookEditorVisibleRanges(() => {
      onNotebookEditorVisibleRangesChanged({
        _tag: "NotebookEditorVisibleRangesChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onBreakpointsChanged) {
    vscode.debug.onDidChangeBreakpoints(() => {
      onBreakpointsChanged({
        _tag: "BreakpointsChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onDebugSessionStarted) {
    vscode.debug.onDidStartDebugSession(() => {
      onDebugSessionStarted({
        _tag: "DebugSessionStarted",
        timestamp: Date.now(),
      });
    });
  }

  if (onDebugSessionTerminated) {
    vscode.debug.onDidTerminateDebugSession(() => {
      onDebugSessionTerminated({
        _tag: "DebugSessionTerminated",
        timestamp: Date.now(),
      });
    });
  }

  if (onTelemetrySettingsChanged) {
    vscode.env.onDidChangeTelemetryEnabled(() => {
      onTelemetrySettingsChanged({
        _tag: "TelemetrySettingsChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onExtensionsChanged) {
    vscode.extensions.onDidChange(() => {
      onExtensionsChanged({
        _tag: "ExtensionsChanged",
        timestamp: Date.now(),
      });
    });
  }

  if (onTaskStart) {
    vscode.tasks.onDidStartTask(() => {
      onTaskStart({
        _tag: "TaskStarted",
        timestamp: Date.now(),
      });
    });
  }
};

type ActiveEvent =
  | onActiveTextEditorChangedEvent
  | FileCreatedEvent
  | FileDeletedEvent
  | FileEditedEvent
  | FileOpenedEvent
  | FileSavedEvent
  | FileClosedEvent
  | FocusOnEvent
  | StartExtension
  | TerminalOpenedEvent
  | TerminalClosedEvent
  | ActiveTerminalChangedEvent
  | TextEditorVisibleRangesChangedEvent
  | ColorThemeChangedEvent
  | ConfigurationChangedEvent
  | WorkspaceFoldersChangedEvent
  | WorkspaceTrustGrantedEvent
  | FilesRenamedEvent
  | NotebookDocumentChangedEvent
  | NotebookDocumentClosedEvent
  | NotebookDocumentOpenedEvent
  | NotebookDocumentSavedEvent
  | VisibleNotebookEditorsChangedEvent
  | NotebookEditorSelectionChangedEvent
  | NotebookEditorVisibleRangesChangedEvent
  | BreakpointsChangedEvent
  | DebugSessionStartedEvent
  | DebugSessionTerminatedEvent
  | TelemetrySettingsChangedEvent
  | ExtensionsChangedEvent
  | TaskStartedEvent;

type IdleEvent = FocusOffEvent | TimeoutEvent;

export const isActiveEvent = (event: SessionEvent): event is ActiveEvent =>
  event._tag === "onActiveTextEditorChanged" ||
  event._tag === "FileClosed" ||
  event._tag === "FileCreated" ||
  event._tag === "FileDeleted" ||
  event._tag === "FileEdited" ||
  event._tag === "FileSaved" ||
  event._tag === "FileOpened" ||
  event._tag === "FocusOn" ||
  event._tag === "StartExtension" ||
  event._tag === "TerminalOpened" ||
  event._tag === "TerminalClosed" ||
  event._tag === "ActiveTerminalChanged" ||
  event._tag === "TextEditorVisibleRangesChanged" ||
  event._tag === "ColorThemeChanged" ||
  event._tag === "ConfigurationChanged" ||
  event._tag === "WorkspaceFoldersChanged" ||
  event._tag === "WorkspaceTrustGranted" ||
  event._tag === "FilesRenamed" ||
  event._tag === "NotebookDocumentChanged" ||
  event._tag === "NotebookDocumentClosed" ||
  event._tag === "NotebookDocumentOpened" ||
  event._tag === "NotebookDocumentSaved" ||
  event._tag === "VisibleNotebookEditorsChanged" ||
  event._tag === "NotebookEditorSelectionChanged" ||
  event._tag === "NotebookEditorVisibleRangesChanged" ||
  event._tag === "BreakpointsChanged" ||
  event._tag === "DebugSessionStarted" ||
  event._tag === "DebugSessionTerminated" ||
  event._tag === "TelemetrySettingsChanged" ||
  event._tag === "ExtensionsChanged" ||
  event._tag === "TaskStarted";

export const isIdleEvent = (event: SessionEvent): event is IdleEvent =>
  !isActiveEvent(event);

export const areBothIdleEvents = (
  e1: SessionEvent,
  e2: SessionEvent
): boolean => isIdleEvent(e1) && isIdleEvent(e2);
