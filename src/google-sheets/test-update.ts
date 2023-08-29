/* 
Write a script that updates a worksheet with specific data:
[x] Create a new worksheet in Google Sheet for testing
[x] Share it so that it can be accessed by the service account
[x] Create a function that creates a random id
[x] Create a function that searches for the cell/row with that id
[ ] Create a function that create a new row if no row with that id is found
[ ] Create a function that updates the row with the new data if a row with that id is found
[ ] Update our current code to update rather than append
*/

import * as Effect from "@effect/io/Effect";
import { appendValues, getSheetValues, updateValues } from ".";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";

const spreadSheetId = "1qRoFn5Tsh4eDHf6-93EOh_JUFGerGl0iWwM7yvoF-FA";

const configuration = {
  clientEmail:
    "code-tracker-repo-test@elated-badge-391113.iam.gserviceaccount.com",
  privateKey:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0vaARPXOHhllN\nNEaxzaKphrb6THu9mraVRXI3FFVtk2cj4KZ4IutCTWIJqWgtUAqpnq2QKP/t8iEE\nApZ7zxIAm/FNfTLBKBEzJCLpI4mnl7mP21KHovDC2U21X28llqY53ekqoIl5Kj5N\nvzvoYve4yku4irnZCv3VoYNdpUnNIzbSCQRPTtVqfjBSETQg9Xzqal95xIcKcmdI\nLB9Mabu8W9Db7GsOK/3Yv7TWJzjyz3OMtcy6D/dMOz7rHCKlxN8wa2pHv7JKomt9\nGNAh9gfPLdekWoFF/tIZDiGQVNy9frzqq2aua91yTPe4F8rFWJOT3h8mx+JyY7v1\noYLyLIVxAgMBAAECggEASwR3xyAT7xjewPIlM5Bv5uBA2zPamlB4Xw2TgfQBHzly\nskwAnFWWAw9+VRdI46HYwx1W2cKCs37voCv4zMueI72WEr0Xz18zgGAL02uKK5MI\nlIKKRzzkpGMwY0sIpXfZZ6RJLoWyeaWEdZ2dnm9RdZQViLOfvsvWnpBqp3g+4RL8\nc4hR4hZop7fPiZDK4DgKxBjOItabIFTMwJYljdSnhgYtgC7IEDvv61lhX5Hs/hZE\nzxMr2RhOVp6x6FrD6H4OBQaqqeYZgul28KxQRQpHbjeWtRC5S4grzOTde583ZeoX\ni2O3SktVczb/nQxq6OoUr6lxazwv8XAi8doyDtE39wKBgQDwl3d2WZK5kBW03gYh\nIW5xoqDv+8gPdUsYLiyKrbJUnyGN+sz/M5YHdCVpYfz2zVn1bmbFTBn4v+eDG/ED\nLDefwMAi95jShSljjyWsp1c/KzQ/8EZuWrkwQGPpGquZPIMd2OoGkJ/f8BZLJKF4\nxwiurw9gExMySwKq5Z6Vzjn/BwKBgQDAUOTqWdlQdy0guHvCo99GTnMIi74/7NRU\nScjwAhLc1nec6J7vyQY/ITq/6xxp8kTLjjttFlmlW8T6mI2pMlGBTgRz+m6HCFqh\nHD75lhFUC22LZ/wD7xV4xAF0XMCgfYxCK87WKCcaWolHOwd0ydIp49nkrFiG3F23\npEZeP9XBxwKBgQCbpnJsB9Er6fKRG969SmKoc71I5QxuK8UUdLLuWSd5JaZQs4Qy\nSo5ybgrSHcnJZdsgNHeahvx6eLTvloEbO10VJl9nf+XHtMytE2wdQfno7SuVff4i\n4ODUPaQlp9KChaqSAcaNzr0P5MSXgrBQcfvE/46j6lNOA0dLhthNNKlCuwKBgGvg\ndKgogkgqsbu7AGEsPyBW/Rv8F1oQZQJq6TYIU8Bg5XO04QKshr5+y0/AeI3Ngl2U\niS0l7l9dXN8dF8mjGikoNENCZSGFxCC/kWu7jDjSuD4MtEcYo7i8afx10u+zvSuZ\nG0rx9w1HX93+9K3EUAmDcERfkMEFd+R9V6OitysdAoGAa+OBLzEiGtWy/r5uVG8Q\nM3oSjBLzyJH/o0IhV2s5OrDRIuogbRe4Lm8+dwc3z1yREjqazTxnqZAvTlgvINPt\nheYC7sBx42WJd/p9aZToLz5swbJ3iVkaa4e9A2KP8s+WxauB6Pfs6f/tSkPtFu7I\nw8xVXmqT8MtZmbuql6Zy2Co=\n-----END PRIVATE KEY-----\n",
};

export const randomId = () => Math.random().toString(36).substring(7);

const _config = {
  codeTracker: {
    googleSheets: {
      workSheetTitle: "paper1",
      spreadSheetId,
      clientEmail: configuration.clientEmail,
      privateKey: configuration.privateKey,
    },
    isDebugMode: false,
  },
};

export const findRowByValue =
  (value: string) =>
  (rows: string[][]): O.Option<number> =>
    rows.findIndex((row) => row.includes(value)) > -1
      ? O.some(rows.findIndex((row) => row[0] === value) + 1)
      : O.none();

const program = pipe(
  getSheetValues(_config),
  Effect.flatMap((values) => findRowByValue("test1")(values)),
  Effect.flatMap((row) =>
    updateValues(row, [["test2", "test2", "test2"]], _config)
  ),
  Effect.catchTag("NoSuchElementException", () =>
    appendValues([["test2"]], _config)
  )
);
//   Effect.map((sheets) => sheets)

Effect.runPromise(program); //?
