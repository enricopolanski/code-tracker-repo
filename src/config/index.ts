import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as S from "@effect/schema/Schema";
import * as E from "@effect/data/Either";
import * as vscode from "vscode";

const ExtensionConfiguration = S.struct({
  codeTracker: S.struct({
    googleSheets: S.struct({
      spreadSheetId: S.string,
      workSheetTitle: S.string,
      clientEmail: S.string,
      privateKey: S.string,
    }),
    isDebugMode: S.boolean,
  }),
});

export type ExtensionConfiguration = S.To<typeof ExtensionConfiguration>;

const getConfiguration = vscode.workspace.getConfiguration;

export const getExtensionConfiguration = pipe(
  getConfiguration(),
  S.parseEffect(ExtensionConfiguration)
);
