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
type ActiveTextEditorChangedEvent = EventInfo &
  FileEvent & { _tag: "ActiveTextEditorChanged" };

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
  | ActiveTextEditorChangedEvent
  | FileSavedEvent => "path" in event;

type StartExtension = EventInfo & { _tag: "StartExtension" };

export type SessionEvent =
  | ActiveTextEditorChangedEvent
  | FileClosedEvent
  | FileCreatedEvent
  | FileEditedEvent
  | FileDeletedEvent
  | FileOpenedEvent
  | FileSavedEvent
  | FocusOnEvent
  | FocusOffEvent
  | StartExtension
  | TimeoutEvent;

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
  activeTextEditorChanged: (type: ActiveTextEditorChangedEvent) => void;
  onFocus: (type: FocusOnEvent | FocusOffEvent) => void;
  onFileCreated: (type: FileCreatedEvent) => void;
  onFileDeleted: (type: FileDeletedEvent) => void;
  onFileSaved: (type: FileSavedEvent) => void;
  onFileEdit: (type: FileEditedEvent) => void;
  onFileClosed: (type: FileClosedEvent) => void;
  onFileOpened: (type: FileOpenedEvent) => void;
};

export const addEditorEventListeners = (
  callbacksMap: Partial<VSCodeListenersMap>
): void => {
  const {
    activeTextEditorChanged,
    onFocus,
    onFileClosed,
    onFileCreated,
    onFileDeleted,
    onFileEdit,
    onFileOpened,
    onFileSaved,
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

  if (onFileEdit) {
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme === "file") {
        onFileEdit({
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

  if (activeTextEditorChanged) {
    vscode.window.onDidChangeActiveTextEditor((e) => {
      activeTextEditorChanged({
        _tag: "ActiveTextEditorChanged",
        timestamp: Date.now(),
        path: (e && e.document.fileName) || "UnknownFile",
      });
    });
  }

  // listens to changes in the currently focused file
  // vscode.window.onDidChangeActiveTextEditor((e) => {
};

type ActiveEvent =
  | ActiveTextEditorChangedEvent
  | FileCreatedEvent
  | FileDeletedEvent
  | FileEditedEvent
  | FileOpenedEvent
  | FileSavedEvent
  | FileClosedEvent
  | StartExtension
  | FocusOnEvent;

type IdleEvent = FocusOffEvent | TimeoutEvent;

export const isActiveEvent = (event: SessionEvent): event is ActiveEvent =>
  event._tag === "FileCreated" ||
  event._tag === "FileDeleted" ||
  event._tag === "FileSaved" ||
  event._tag === "FileEdited" ||
  event._tag === "FileClosed" ||
  event._tag === "StartExtension" ||
  event._tag === "FileOpened" ||
  event._tag === "ActiveTextEditorChanged" ||
  event._tag === "FocusOn";

export const isIdleEvent = (event: SessionEvent): event is IdleEvent =>
  !isActiveEvent(event);

export const areBothIdleEvents = (
  e1: SessionEvent,
  e2: SessionEvent
): boolean => isIdleEvent(e1) && isIdleEvent(e2);
