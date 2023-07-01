import * as vscode from "vscode";
import { SessionEvent, areBothIdleEvents } from "../events";

export type ExtensionState = {
  activeTime: number;
  idleTime: number;
  idleCountdown: number;
  lastEvent: SessionEvent;
  lastUpdate: number;
  timeout: NodeJS.Timeout | null;
  readonly extensionStart: number;
  readonly sessionId: string;
  readonly workspaceName: string;
};

export const shouldUpdateStats = (
  state: ExtensionState,
  event: SessionEvent
): boolean => state.lastUpdate + 10000 < event.timestamp;

export const updateExtensionState = (
  oldState: ExtensionState,
  newEvent: SessionEvent,
  shouldUpdate: boolean
): ExtensionState => ({
  ...oldState,
  lastEvent: newEvent,
  lastUpdate: shouldUpdate ? newEvent.timestamp : oldState.lastUpdate,
  activeTime: areBothIdleEvents(oldState.lastEvent, newEvent)
    ? oldState.activeTime
    : oldState.activeTime + (newEvent.timestamp - oldState.lastEvent.timestamp),
  idleTime: areBothIdleEvents(oldState.lastEvent, newEvent)
    ? oldState.idleTime + (newEvent.timestamp - oldState.lastEvent.timestamp)
    : oldState.idleTime,
});

export const initState = (time: number): ExtensionState => ({
  activeTime: 0,
  extensionStart: time,
  idleCountdown: 15000,
  idleTime: 0,
  lastEvent: {
    _tag: "StartExtension",
    timestamp: time,
  },
  lastUpdate: 0,
  sessionId: vscode.env.sessionId,
  timeout: null,
  workspaceName:
    vscode.workspace.workspaceFolders![0].name || "No Workspace Name",
});
