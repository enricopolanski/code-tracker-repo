import * as vscode from "vscode";
import { ExtensionConfiguration, getExtensionConfiguration } from "../config";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { ExtensionState } from "../state";
import { SessionEvent, isFileRelatedEvent } from "../events";
import { saveStatsToWorksheet } from "../google-sheets/extension-related";
import { get } from "http";

const createOutputChannel = vscode.window.createOutputChannel;

// create the output channels that will be used to log events
const eventOutputChannel = createOutputChannel("code-tracker");
const statsOutputChannel = createOutputChannel("code-tracker-stats");
const debugOutputChannel = createOutputChannel("code-tracker-debug");

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

const logEvent: (event: SessionEvent) => Effect.Effect<never, never, void> = (
  event
) =>
  Effect.sync(() => {
    eventOutputChannel.appendLine(getLogMessage(event, event, "workspaceName"));
  });

export const logDebug: (
  message: string
) => Effect.Effect<never, unknown, void> = (message) =>
  Effect.sync(() => debugOutputChannel.appendLine(message));

export const showErrorMessage: (
  message: string
) => Effect.Effect<never, unknown, void> = (message) =>
  Effect.sync(() => vscode.window.showErrorMessage(message));

// from ms to hh:mm:ss
export const formatTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return `${hours}:${minutes}:${seconds}`;
};

// TODO: Refactor this to some better code
export const trackAndReport = (
  extensionState: ExtensionState,
  shouldUpdateStats: boolean
): Effect.Effect<never, void, void> =>
  pipe(
    logStats(extensionState),
    Effect.flatMap(() => logEvent(extensionState.lastEvent)),
    Effect.flatMap(() =>
      pipe(
        getExtensionConfiguration,
        Effect.flatMap((configuration) =>
          saveStatsToWorksheet(extensionState, configuration)
        )
      )
    ),
    Effect.when(() => shouldUpdateStats)
  );
