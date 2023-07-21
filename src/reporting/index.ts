import * as vscode from "vscode";
import { getExtensionConfiguration } from "../config";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { ExtensionState, getWorkspaceName } from "../state";
import { SessionEvent, isFileRelatedEvent } from "../events";
import { saveStatsToWorksheet } from "../google-sheets/extension-related";

const createOutputChannel = vscode.window.createOutputChannel;
const createStatusBarItem = vscode.window.createStatusBarItem;

// create the output channels that will be used to log events
const eventOutputChannel = createOutputChannel("code-tracker");
const statsOutputChannel = createOutputChannel("code-tracker-stats");
const debugOutputChannel = createOutputChannel("code-tracker-debug");

// create the status bar item that will be used to show the current timer of the extension
const statusBar = createStatusBarItem("code-tracker");

const createLogMessage = (event: SessionEvent, workspaceName: string): string =>
  `EventType: ${event._tag} - workspace: ${workspaceName}\n`;

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
  (lastEvent: SessionEvent, workspaceName: string): string =>
    withFile(getProjectAndFileName(filepath, workspaceName).fileName)(
      createLogMessage(lastEvent, workspaceName)
    );

const getLogMessage = (
  currentEvent: SessionEvent,
  lastEvent: SessionEvent,
  workspaceName: string
): string =>
  isFileRelatedEvent(currentEvent)
    ? createFileLogMessage(currentEvent.path)(lastEvent, workspaceName)
    : createLogMessage(lastEvent, workspaceName);

const logStats: (
  extensionState: ExtensionState
) => Effect.Effect<never, never, void> = (extensionState) =>
  Effect.sync(() => {
    statsOutputChannel.appendLine(
      `Active Time: ${formatTime(
        extensionState.activeTime
      )} ms. Idle Time: ${formatTime(extensionState.idleTime)} ms.`
    );
  });

const updateStatusBar: (
  extensionState: ExtensionState
) => Effect.Effect<never, never, void> = (extensionState) =>
  Effect.sync(() => {
    statusBar.text = `▶️ ${formatTime(
      extensionState.activeTime
    )} || ⏸️ ${formatTime(extensionState.idleTime)}`;
    statusBar.show();
  });

const logEvent: (
  event: SessionEvent,
  workspaceName: string
) => Effect.Effect<never, never, void> = (event, workspaceName) =>
  Effect.sync(() => {
    eventOutputChannel.appendLine(getLogMessage(event, event, workspaceName));
  });

export const logDebug: (
  message: string
) => Effect.Effect<never, never, void> = (message) =>
  Effect.sync(() => debugOutputChannel.appendLine(message));

export const showErrorMessage: (
  message: string
) => Effect.Effect<never, unknown, void> = (message) =>
  Effect.sync(() => vscode.window.showErrorMessage(message));

// given a number, returns a string with two digits
const toDoubleDigits = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

// from ms to hh:mm:ss
export const formatTime = (ms: number): string => {
  const seconds = toDoubleDigits(Math.floor((ms / 1000) % 60));
  const minutes = toDoubleDigits(Math.floor((ms / (1000 * 60)) % 60));
  const hours = toDoubleDigits(Math.floor((ms / (1000 * 60 * 60)) % 24));

  return `${hours}:${minutes}:${seconds}`;
};

// TODO: Refactor this to some better code
export const trackAndReport = (
  extensionState: ExtensionState,
  shouldUpdateStats: boolean
): Effect.Effect<never, never, void> =>
  pipe(
    logEvent(extensionState.lastEvent, getWorkspaceName()),
    Effect.flatMap(() => updateStatusBar(extensionState)),
    Effect.flatMap(() =>
      pipe(
        getExtensionConfiguration,
        Effect.flatMap((configuration) =>
          pipe(
            Effect.all(
              saveStatsToWorksheet(extensionState, configuration),
              logStats(extensionState)
            ),
            Effect.when(() => shouldUpdateStats)
          )
        ),
        Effect.catchAll((e) =>
          e ? logDebug(e._tag) : logDebug(JSON.stringify(e))
        )
      )
    )
  );
