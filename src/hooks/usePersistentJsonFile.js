import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";
import cardnames from "../engine/names.json";
import { CHARACTER_ID_TO_NAME } from "../engine/gamestate_full_ui.js";
import { getLocalizationEnglishToChinese } from "../i18n.js";
import getTalentsByCharacter from "../utils/getTalentsByCharacter.js";

function findCharacterIdByName(character) {
  return Object.keys(CHARACTER_ID_TO_NAME).find(
    (key) =>
      getLocalizationEnglishToChinese.get(CHARACTER_ID_TO_NAME[key]) ===
      character
  );
}

function convertBattleLogToSample(battleLogContent, round, username) {
  const lines = battleLogContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const jsonLines = lines.slice(1);
  if (jsonLines.length === 0) return {};

  try {
    const roundsArr = jsonLines
      .map((line) => JSON.parse(line))
      .sort((a, b) => a.round - b.round)
      .map((round) => ({
        round: round.round,
        players: round.players.map((player) => ({
          round_number: round.round,
          character: findCharacterIdByName(player.character),
          talents: getTalentsByCharacter(
            findCharacterIdByName(player.character)
          ),
          hp: player.maxHp,
          cultivation: player.exp,
          physique: player.tiPo,
          max_physique: player.maxTiPo,
          player_username: player.username,
          opponent_username: player.opponentUsername,
          cards: player.usedCards
            .map((card) => ({
              card_id:
                cardnames.find(
                  (item) => item.namecn === card.name.replace("•", "·")
                )?.id || null,
              level: card.rarity + 1,
            }))
            .concat(
              Array(
                (player.username === username ? 16 : 8) -
                  player.usedCards.length
              ).fill({ level: 1 })
            ),
        })),
      }));

    const lastRoundPlayers = roundsArr.at(-1).players;
    const myIndex = lastRoundPlayers.findIndex(
      (p) => p.player_username === username
    );

    return {
      players: lastRoundPlayers,
      myIndex: myIndex === -1 ? 0 : myIndex,
    };
  } catch (error) {
    console.error("Error converting battle log:", error);
    return {};
  }
}

export function usePersistentJsonFile() {
  const [fileHandle, setFileHandle] = useState(null);
  const [data, setData] = useState(null);
  const [nextOpponentIndex, setNextOpponentIndex] = useState(1);

  useEffect(() => {
    (async () => {
      const db = await openDB("fs-handles-db", 1, {
        upgrade(db) {
          db.createObjectStore("handles");
        },
      });
      const handle = await db.get("handles", "my-json");
      if (handle) setFileHandle(handle);
    })();
  }, []);

  const pickFile = useCallback(async () => {
    const [handle] = await window.showOpenFilePicker({
      types: [
        { description: "JSON 文件", accept: { "application/json": [".json"] } },
      ],
      multiple: false,
    });
    const db = await openDB("fs-handles-db", 1);
    await db.put("handles", handle, "my-json");
    setFileHandle(handle);
  }, []);

  async function ensurePermission(handle) {
    const opts = { mode: "read" };
    let permission = await handle.queryPermission(opts);
    if (permission === "prompt") {
      permission = await handle.requestPermission(opts);
    }
    return permission === "granted";
  }

  const readFile = useCallback(
    (round, username) => async () => {
      if (!fileHandle) return alert("请先选择文件");

      const ok = await ensurePermission(fileHandle);
      if (!ok) return alert("读取被拒，请重新授权或重新选择文件");

      const file = await fileHandle.getFile();
      const text = await file.text();
      const { players, myIndex } = convertBattleLogToSample(
        text,
        round,
        username
      );
      if (!players || players.length < 2) return;

      const opponentIndexes = players
        .map((_, i) => i)
        .filter((i) => i !== myIndex);

      const opponentIndex =
        opponentIndexes[nextOpponentIndex % opponentIndexes.length];

      setData({
        a: players[myIndex],
        b: players[opponentIndex],
      });

      setNextOpponentIndex((prev) => (prev + 1) % opponentIndexes.length);
    },
    [fileHandle, nextOpponentIndex]
  );

  return { data, pickFile, readFile, hasHandle: !!fileHandle };
}
