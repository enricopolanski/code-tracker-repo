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
 * Triggered when the user creates a new file.
 */
type FileCreatedEvent = EventInfo & FileEvent & { _tag: "FileCreated" };

/**
 * Triggered when the user deletes a file.
 */
type FileDeletedEvent = EventInfo & FileEvent & { _tag: "FileDeleted" };

/**
 * Triggered when the user focuses a different file.
 */
type FileFocusedEvent = EventInfo & FileEvent & { _tag: "FileFocusedEvent" };

/**
 * Triggered when the user saves a file.
 */
type FileSavedEvent = EventInfo & FileEvent & { _tag: "FileSaved" };

/**
 * Triggered when the extension is started
 */
type StartExtension = EventInfo & { _tag: "StartExtension" };

export const isFileRelatedEvent = (
  event: SessionEvent
): event is
  | FileCreatedEvent
  | FileDeletedEvent
  | FileFocusedEvent
  | FileSavedEvent => "path" in event;

export type SessionEvent =
  | StartExtension
  | FocusOnEvent
  | FocusOffEvent
  | TimeoutEvent
  | FileCreatedEvent
  | FileDeletedEvent
  | FileSavedEvent
  | FileFocusedEvent;

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
  onFocus: (type: FocusOnEvent | FocusOffEvent) => void;
  onFileCreated: (type: FileCreatedEvent) => void;
  onFileDeleted: (type: FileDeletedEvent) => void;
  onFileSaved: (type: FileSavedEvent) => void;
  onFileFocusChange: (type: FileFocusedEvent) => void;
};

export const addEditorEventListeners = (
  callbacksMap: Partial<VSCodeListenersMap>
): void => {
  const {
    onFocus,
    onFileCreated,
    onFileDeleted,
    onFileSaved,
    onFileFocusChange,
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

  if (onFileFocusChange) {
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme === "file") {
        onFileFocusChange({
          _tag: "FileFocusedEvent",
          timestamp: Date.now(),
          path: e.document.fileName,
        });
      }
    });
  }
};

type ActiveEvent =
  | FileCreatedEvent
  | FileDeletedEvent
  | FileSavedEvent
  | FileFocusedEvent
  | StartExtension
  | FocusOnEvent;

type IdleEvent = FocusOffEvent | TimeoutEvent;

export const isActiveEvent = (event: SessionEvent): event is ActiveEvent =>
  event._tag === "FileCreated" ||
  event._tag === "FileDeleted" ||
  event._tag === "FileSaved" ||
  event._tag === "FileFocusedEvent" ||
  event._tag === "StartExtension" ||
  event._tag === "FocusOn";

export const isIdleEvent = (event: SessionEvent): event is IdleEvent =>
  !isActiveEvent(event);

export const areBothIdleEvents = (
  e1: SessionEvent,
  e2: SessionEvent
): boolean => isIdleEvent(e1) && isIdleEvent(e2);
