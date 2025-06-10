import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";
import cardnames from "../engine/names.json";

function convertBattleLogToSample(battleLogContent) {
  const lines = battleLogContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  // ignore first line
  const jsonLines = lines.slice(1);
  if (jsonLines.length === 0) {
    return { rounds: null, status: "waiting" };
  }

  try {
    const roundsArr = jsonLines
      .map((line) => JSON.parse(line))
      .sort((a, b) => a.round - b.round)
      .map((round) => {
        return {
          players: round.players.map((player) => ({
            player_username: player.username,
            //   destiny: player.life,
            //   destiny_diff: player.lifeDelta,
            round_number: round.round,
            hp: player.maxHp,
            //   cultivation: player.level,
            opponent_username: player.opponentUsername,
            cards: player.usedCards.map((card) => {
              return {
                card_id: cardnames.find(
                  (item) => item.namecn === card.name.replace("•", "·")
                ).id,
                level: card.rarity + 1,
              };
            }),
          })),
        };
      });
    const lastRoundPlayers = roundsArr[roundsArr.length - 1].players;
    console.log(roundsArr);
    return {
      a: lastRoundPlayers[0],
      b:
        lastRoundPlayers.find(
          (item) =>
            item.opponent_username === lastRoundPlayers[0].player_username &&
            item.player_username === lastRoundPlayers[0].opponent_username
        ) || lastRoundPlayers[1],
    };
  } catch (error) {
    console.error("Error converting battle log:", error);
    return { rounds: {} };
  }
}

export function usePersistentJsonFile() {
  const [fileHandle, setFileHandle] = useState(null);
  const [data, setData] = useState(null);

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

  const readFile = useCallback(async () => {
    if (!fileHandle) return alert("请先选择文件");

    const ok = await ensurePermission(fileHandle);
    if (!ok) {
      return alert("读取被拒，请重新授权或重新选择文件");
    }

    const file = await fileHandle.getFile();
    const text = await file.text();
    const converted = convertBattleLogToSample(text);
    setData(converted);
  }, [fileHandle]);

  return { data, pickFile, readFile, hasHandle: !!fileHandle };
}
