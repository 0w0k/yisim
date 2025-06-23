import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";
import cardnames from "../engine/names.json";
import { CHARACTER_ID_TO_NAME } from "../engine/gamestate_full_ui.js";
import { getLocalizationEnglishToChinese } from "../i18n.js";
import getTalentsByCharacter from "../utils/getTalentsByCharacter.js";

const IDB_KEY = "operation-json";

function findCharacterIdByName(character) {
  return Object.keys(CHARACTER_ID_TO_NAME).find(
    (key) =>
      getLocalizationEnglishToChinese.get(CHARACTER_ID_TO_NAME[key]) ===
      character
  );
}

function convertBattleLogToSample({ battleLogContent }) {
  const jsonLines = battleLogContent
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.length > 0)
    .map((line) => line.trim())
    .map(JSON.parse)
    .reverse();

  if (jsonLines.length === 0) return [];
  try {
    return jsonLines;
  } catch (error) {
    console.error("Error converting battle log:", error);
    return [];
  }
}

export function useOperationJsonFile() {
  const [fileHandle, setFileHandle] = useState(null);
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const db = await openDB("fs-handles-db", 1, {
        upgrade(db) {
          db.createObjectStore("handles");
        },
      });
      const handle = await db.get("handles", IDB_KEY);
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
    await db.put("handles", handle, IDB_KEY);
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
    if (!ok) return alert("读取被拒，请重新授权或重新选择文件");

    const file = await fileHandle.getFile();
    const battleLogContent = await file.text();

    const data = convertBattleLogToSample({
      battleLogContent,
    });
    setData(data);
  }, [fileHandle]);

  async function deleteFile() {
    if (!fileHandle) return alert("请先选择文件");

    const ok = await ensurePermission(fileHandle); // 获取写权限
    if (!ok) return alert("权限不足，无法删除");

    if ("remove" in fileHandle) {
      console.log("remove");
      const writable = await fileHandle.createWritable(); // 获取新的写入流
      await writable.write("");
      await writable.close();
      setData(null);
      alert("文件已删除");
    } else {
      alert("当前浏览器不支持直接删除，请使用目录句柄方式");
    }
  }

  return { data, pickFile, readFile, deleteFile, hasHandle: !!fileHandle };
}
