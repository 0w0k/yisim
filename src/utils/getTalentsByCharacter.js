import { FATE_TO_CHARACTER_OR_SECT } from "../engine/gamestate_full_ui";

export default (character) => {
  const talentMap = Object.entries(FATE_TO_CHARACTER_OR_SECT).reduce(
    (acc, [key, value]) => {
      if (!acc[value]) {
        acc[value] = [];
      }
      acc[value].push(key);
      return acc;
    },
    {}
  );

  return talentMap[character] || [];
};
