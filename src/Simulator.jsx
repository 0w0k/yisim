import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Avatar,
  InputNumber,
  Form,
  Select,
  Flex,
  Row,
  Col,
  TreeSelect,
  Input,
  Typography,
} from "antd";
import { PlayCircleOutlined, ClearOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { GameState, CHARACTER_ID_TO_NAME } from "./engine/gamestate_full_ui.js";
import talents from "./engine/lanke/talents.json";
import cardnames from "./engine/names.json";
import { do_riddle } from "./engine/find_winning_deck.js";
import _ from "lodash";
import pinyin from "pinyin";
import { getLocalizationTermToEnglish } from "./i18n.js";
import SortableCard from "./components/SortableCard.jsx";
import sideJob from "./data/sideJob.json";
import plants from "./data/plants.json";
import { usePersistentJsonFile } from "./hooks/usePersistentJsonFile";
import cardInit from "./cardint.json";
import getTalentsByCharacter from "./utils/getTalentsByCharacter.js";

const { Text, Link } = Typography;

const getPinyin = (text) => {
  const fullPinyin = pinyin(text, {
    style: pinyin.STYLE_NORMAL,
    heteronym: true,
    compact: true,
  }).map((py) => py.join("").replace("•", ""));
  const firstLetterPinyin = pinyin(text, {
    style: pinyin.STYLE_FIRST_LETTER,
    heteronym: true,
    compact: true,
  }).map((py) => py.join("").replace("•", ""));
  return { fullPinyin, firstLetterPinyin };
};

function buildTree(items, l) {
  const tree = [];

  for (const item of items) {
    const ID_RE = /^(\d)(\d)(\d)(\d{2})(\d)$/;

    // 1. Extract levels
    const s = String(item.id).padStart(6, "0");
    const m = s.match(ID_RE);
    if (!m) continue;
    const [, lv1, lv2, lv3] = m;
    const levels = [lv1, lv2, lv3];
    let prefix = "cardtree";

    // 2. Walk/create each level
    let currentLevel = tree;
    levels.map((part, i) => {
      prefix = prefix + part;
      let value = prefix;
      if (i === 0) {
        value = "Subcategory_" + part;
        if (part === "1") {
          value = "Sect";
        }
        if (part === "3") {
          value = "Side Job";
        }
        if (part === "2") {
          value = "Subcategory_" + 4;
        }
        if (part === "4") {
          value = "Subcategory_" + 2;
        }
        if (part === "5") {
          value = "Subcategory_" + 3;
        }
        if (part === "6") {
          value = "Character specific";
        }
        if (part === "7") {
          value = "Fate Branches";
        }
        if (part === "8") {
          value = "Zongzi";
        }
        if (part === "9") {
          value = "Relics";
        }
        value = getLocalizationTermToEnglish(value);
      }
      if (i === 1) {
        value = "Sect_" + part;
        if (lv1 === "3") {
          value = "Career_" + part;
        }
        value = getLocalizationTermToEnglish(value);
      }
      if (i === 2) {
        value = "p" + part;
      }
      let node = currentLevel.find((n) => n.idPart === prefix);
      if (!node) {
        node = {
          idPart: prefix,
          value: prefix,
          title: l(value),
          disabled: true,
          children: [],
        };
        currentLevel.push(node);
      }
      currentLevel = node.children;
    });

    // 3. At the leaf, attach the full item
    currentLevel.push({ value: item.id, title: l(item.name) });
  }

  return tree;
}

const Simulator = ({ l, form, setResult, setIsModalOpen, messageApi }) => {
  const [loading, setLoading] = useState();

  const [showHand, setShowHand] = useState(false);

  const cardData = buildTree(cardnames, l);

  const { data, pickFile, readFile, hasHandle } = usePersistentJsonFile();

  const telentsTreeData = Object.keys(talents)
    .filter((item) => talents[item])
    .map((item) => {
      const engineField = talents[item];
      const result = {
        value: engineField,
        title: l(item),
      };
      if (engineField.includes("{n}")) {
        result.children = [
          {
            value: engineField.replace(/\{n\}/g, "2"),
            title: `${l(item)} ${l("p2")}`,
          },
          {
            value: engineField.replace(/\{n\}/g, "3"),
            title: `${l(item)} ${l("p3")}`,
          },
          {
            value: engineField.replace(/\{n\}/g, "4"),
            title: `${l(item)} ${l("p4")}`,
          },
          {
            value: engineField.replace(/\{n\}/g, "5"),
            title: `${l(item)} ${l("p5")}`,
          },
        ];
      }

      return result;
    });

  const filterTreeNode = (input, option) => {
    const { fullPinyin, firstLetterPinyin } = getPinyin(option.title);
    const lowerInput = input.toLowerCase();

    if (
      option.title.toLowerCase().includes(lowerInput) || // 中文匹配
      fullPinyin.some((py) => py.includes(lowerInput)) || // 全拼匹配
      firstLetterPinyin.some((py) => py.includes(lowerInput)) // 首字母匹配
    ) {
      return true;
    }

    return false;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 延迟触发
        tolerance: 5, // 拖动多少像素后才触发
      },
    })
  );

  const run = async ({ onlyResult }) => {
    try {
      const game_json = form.getFieldsValue(true);
      localStorage.setItem("cardInit", JSON.stringify(game_json));

      let jsonData = _.cloneDeep(game_json);

      jsonData.b.round_number = jsonData.a.round_number;

      jsonData.a.cards = jsonData.a.cards
        .filter((item) => item.card_id)
        .map((item) => `${String(item.card_id).slice(0, -1)}${item.level}`);
      jsonData.b.cards = jsonData.b.cards.map(
        (item) => `${String(item.card_id).slice(0, -1)}${item.level}`
      );
      jsonData.a.talents.map((t) => {
        jsonData.a[t] = 1;
      });
      jsonData.b.talents.map((t) => {
        jsonData.b[t] = 1;
      });

      jsonData.a.max_hp = jsonData.a.hp + jsonData.a.physique;
      jsonData.b.max_hp = jsonData.b.hp + jsonData.b.physique;

      const game = new GameState(l);

      if (jsonData.a.cultivation >= jsonData.b.cultivation) {
        Object.assign(game.players[0], jsonData.a);
        Object.assign(game.players[1], jsonData.b);
      } else {
        Object.assign(game.players[0], jsonData.b);
        Object.assign(game.players[1], jsonData.a);
      }

      game.sim_n_turns(64);
      if (onlyResult) {
        setResult(game.output.slice(-1));
        return;
      }
      setResult(game.output);
    } catch (err) {
      messageApi.open({
        type: "error",
        content: l(err.message),
      });
    }
  };

  const riddle = async () => {
    try {
      const game_json = form.getFieldsValue(true);
      localStorage.setItem("cardInit", JSON.stringify(game_json));
      let jsonData = _.cloneDeep(game_json);

      jsonData.b.round_number = jsonData.a.round_number;

      jsonData.a.cards = jsonData.a.cards
        .filter((item) => item.card_id)
        .map((item) => `${String(item.card_id).slice(0, -1)}${item.level}`);
      jsonData.b.cards = jsonData.b.cards.map(
        (item) => `${String(item.card_id).slice(0, -1)}${item.level}`
      );

      jsonData.a.talents.map((t) => {
        jsonData.a[t] = 1;
      });
      jsonData.b.talents.map((t) => {
        jsonData.b[t] = 1;
      });

      jsonData.a.max_hp = jsonData.a.hp + jsonData.a.physique;
      jsonData.b.max_hp = jsonData.b.hp + jsonData.b.physique;

      let my_idx = 0;
      let players = [jsonData.a, jsonData.b];
      if (jsonData.a.cultivation < jsonData.b.cultivation) {
        players = [jsonData.b, jsonData.a];
        my_idx = 1;
      }

      setLoading(true);

      setResult([l("Winning deck:")]);
      do_riddle(
        { players: players, my_idx: my_idx },
        (riddle, response, isDone) => {
          const result = [];
          if (isDone) {
            setLoading(false);
          }
          for (let i = 0; i < response.winning_decks.length; i++) {
            result.push(
              response.winning_decks[i]
                .map(
                  (c) =>
                    `[${l(cardnames.find((d) => d.id == c.slice(0, -1) + "1")?.name || "")} ${c.slice(-1)}]`
                )
                .join(" ")
            );
            result.push(
              l("Deck Score:") + " " + response.winning_margins[i].toFixed(0)
            );
            result.push(l("My HP:") + " " + response.winning_info.myHP);
            result.push(l("Enemy HP:") + " " + response.winning_info.enemyHP);
            result.push(l("Turns:") + " " + response.winning_info.turns);
            result.push("-----------");

            setResult((_result) => [..._result, ...result]);
          }
        }
      );
    } catch (err) {
      messageApi.open({
        type: "error",
        content: l(err.message),
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data]);

  return (
    <Flex justify='space-between' vertical gap={16}>
      {[0, 1].map((i) => {
        const roleField = i === 0 ? "a" : "b";
        const cardsData = form.getFieldValue([roleField, "cards"]) || [];
        const handleDragEnd = (event) => {
          const _cardsData = form.getFieldValue([roleField, "cards"]) || [];
          const { active, over } = event;
          // active.id 和 over.id 分别是拖拽源与目标位置对应的 id
          if (active.id !== over?.id) {
            // 找到被拖拽项的原始索引与目标索引
            const oldIndex = _cardsData.findIndex(
              (_, idx) => `card-${roleField}-${idx}` === active.id
            );
            const newIndex = _cardsData.findIndex(
              (_, idx) => `card-${roleField}-${idx}` === over.id
            );
            if (oldIndex !== -1 && newIndex !== -1) {
              // 使用 arrayMove 计算新顺序后的数组
              const newCards = arrayMove(_cardsData, oldIndex, newIndex);
              // 更新 Form.List 中的 cards 字段
              form.setFieldsValue({
                [roleField]: {
                  cards: newCards,
                },
              });
            }
          }
        };

        return (
          <Space key={"role" + i} className='bg' direction='vertical' size={16}>
            <Space wrap size={16}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                  return (
                    prev[roleField].character !== curr[roleField].character
                  );
                }}
              >
                {() => (
                  <Avatar
                    size={80}
                    src={`YiXian-IconsAndNames/characters/${CHARACTER_ID_TO_NAME[form.getFieldValue(roleField).character].replace(" ", "-").toLowerCase()}.png`}
                  />
                )}
              </Form.Item>
              <Form.Item noStyle name={[roleField, "player_username"]}>
                <Input placeholder={l("username")} />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                  return prev[roleField].talents !== curr[roleField].talents;
                }}
              >
                {() =>
                  form.getFieldValue(roleField).talents.map((item, i) => {
                    const fileName = Object.keys(talents).find(
                      (t) => talents[t] === item.replace(/p\d+/g, "p{n}")
                    );
                    return (
                      <Avatar
                        style={{ marginLeft: 2, marginRight: 2 }}
                        key={item}
                        size={64}
                        src={`yxp_images/talent/${fileName}.png`}
                      />
                    );
                  })
                }
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                  return prev[roleField].side_job !== curr[roleField].side_job;
                }}
              >
                {() => {
                  const fileName = sideJob[
                    form.getFieldValue(roleField).side_job
                  ]
                    ?.replace(" ", "-")
                    ?.toLowerCase();
                  if (!fileName) return null;
                  return (
                    <Avatar
                      size={64}
                      icon={
                        <img
                          style={{ objectFit: "contain" }}
                          src={`YiXian-IconsAndNames/jobs/${sideJob[form.getFieldValue(roleField).side_job].replace(" ", "-").toLowerCase()}.png`}
                        />
                      }
                    />
                  );
                }}
              </Form.Item>
            </Space>
            <Space wrap size={16}>
              <Form.Item label={l("Character")} name={[roleField, "character"]}>
                <Select
                  popupMatchSelectWidth={false}
                  options={Object.keys(CHARACTER_ID_TO_NAME).map((key) => ({
                    value: key,
                    label: l(CHARACTER_ID_TO_NAME[key]),
                  }))}
                  onChange={(e) => {
                    form.setFieldValue(
                      [roleField, "talents"],
                      getTalentsByCharacter(e)
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label={l("Side job")} name={[roleField, "side_job"]}>
                <Select
                  popupMatchSelectWidth={false}
                  options={Object.keys(sideJob).map((key) => ({
                    value: key,
                    label: l(sideJob[key]),
                  }))}
                />
              </Form.Item>
              <Form.Item
                label={l("Cultivation")}
                name={[roleField, "cultivation"]}
              >
                <InputNumber changeOnWheel />
              </Form.Item>
              <Form.Item label={l("HP")}>
                <Space.Compact>
                  <Form.Item name={[roleField, "hp"]} noStyle>
                    <InputNumber changeOnWheel />
                  </Form.Item>
                  <Form.Item name={[roleField, "max_hp"]}>
                    <InputNumber changeOnWheel />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item label={l("Physique")}>
                <Space.Compact>
                  <Form.Item name={[roleField, "physique"]} noStyle>
                    <InputNumber changeOnWheel />
                  </Form.Item>
                  <Form.Item name={[roleField, "max_physique"]}>
                    <InputNumber changeOnWheel />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item
                label={l("Round")}
                name={[roleField, "round_number"]}
                hidden={roleField === "b"}
              >
                <InputNumber changeOnWheel />
              </Form.Item>
            </Space>
            <Space wrap size={16}>
              <Form.Item
                label={l("Talent")}
                name={[roleField, "talents"]}
                style={{ minWidth: "300px" }}
              >
                <TreeSelect
                  showSearch
                  allowClear
                  treeCheckable
                  maxCount={10}
                  filterTreeNode={filterTreeNode}
                  multiple
                  treeDefaultExpandAll
                  treeData={telentsTreeData}
                />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                  return prev[roleField].talents !== curr[roleField].talents;
                }}
              >
                {() => {
                  return (
                    <Form.Item
                      label={l("Five Elements Pure Vase")}
                      name={[roleField, "five_elements_pure_vase_cards"]}
                      style={{ minWidth: "300px" }}
                      hidden={
                        form
                          .getFieldValue(roleField)
                          .talents.findIndex(
                            (t) => t === "five_elements_pure_vase_stacks"
                          ) === -1
                      }
                    >
                      <TreeSelect
                        showSearch
                        allowClear
                        treeCheckable
                        maxCount={3}
                        filterTreeNode={filterTreeNode}
                        multiple
                        treeDefaultExpandAll
                        treeData={cardData}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                  return prev[roleField].talents !== curr[roleField].talents;
                }}
              >
                {() => {
                  return (
                    <Form.Item
                      label={l("Swordplay Talent")}
                      name={[roleField, "swordplay_talent_cards"]}
                      style={{ minWidth: "300px" }}
                      hidden={
                        form
                          .getFieldValue(roleField)
                          .talents.findIndex(
                            (t) => t === "chengyuns_fusion_style_stacks"
                          ) === -1
                      }
                    >
                      <TreeSelect
                        showSearch
                        allowClear
                        treeCheckable
                        maxCount={4}
                        filterTreeNode={filterTreeNode}
                        multiple
                        treeDefaultExpandAll
                        treeData={cardData}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
              {plants.map(({ name, key }) => {
                return (
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => {
                      return (
                        prev[roleField].side_job !== curr[roleField].side_job
                      );
                    }}
                  >
                    {() => (
                      <Form.Item
                        label={l(name)}
                        name={[roleField, "plants", key]}
                        hidden={form.getFieldValue(roleField).side_job !== "36"}
                      >
                        <InputNumber changeOnWheel />
                      </Form.Item>
                    )}
                  </Form.Item>
                );
              })}
            </Space>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {/* SortableContext 用于告诉 dnd-kit 当前可排序的 items 列表 */}
              <SortableContext
                items={cardsData.map((_, idx) => `card-${roleField}-${idx}`)}
                strategy={rectSortingStrategy}
              >
                <Row wrap className='deck'>
                  <Form.List name={[roleField, "cards"]}>
                    {(fields) => {
                      return fields.map((field, index) => {
                        if (!showHand && index > 7) {
                          return;
                        }
                        const id = `card-${roleField}-${index}`;
                        return (
                          <Col flex xs={6} md={3} key={id} className='deck'>
                            <SortableCard
                              id={id}
                              index={index}
                              field={field}
                              roleField={roleField}
                              form={form}
                              treeData={cardData}
                              filterTreeNode={filterTreeNode}
                              l={l}
                            />
                          </Col>
                        );
                      });
                    }}
                  </Form.List>
                </Row>
              </SortableContext>
            </DndContext>
          </Space>
        );
      })}
      <Flex className='bg' gap={16} wrap>
        <Button
          size='large'
          type='primary'
          icon={<PlayCircleOutlined />}
          onClick={run}
        >
          {l("Run")}
        </Button>
        <Button
          size='large'
          type='primary'
          icon={<ClearOutlined />}
          onClick={() => {
            setResult([]);
            form.setFieldsValue(cardInit);
          }}
        >
          {l("Clean")}
        </Button>
        <Button
          size='large'
          type='primary'
          loading={loading}
          icon={<PlayCircleOutlined />}
          onClick={riddle}
        >
          {l("Riddle")}
        </Button>
        <Button
          size='large'
          type='primary'
          onClick={() => {
            setShowHand(!showHand);
          }}
        >
          {showHand ? l("Hidden hand cards") : l("Show hand cards")}
        </Button>
        <Button
          size='large'
          type='primary'
          onClick={() => {
            const game_json = form.getFieldsValue(true);
            navigator.clipboard.writeText(JSON.stringify(game_json));
          }}
        >
          {l("Copy JSON")}
        </Button>
        <Button
          size='large'
          type='primary'
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {l("Input JSON")}
        </Button>
        {!hasHandle ? (
          <Button
            size='large'
            type='primary'
            onClick={() => {
              pickFile();
            }}
          >
            {l("Import Battle")}
          </Button>
        ) : (
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => {
              return (
                prev.a.round_number !== curr.a.round_number ||
                prev.a.player_username !== curr.a.player_username
              );
            }}
          >
            {() => (
              <Button
                size='large'
                type='primary'
                onClick={async () => {
                  await readFile(
                    form.getFieldValue(["a", "round_number"]),
                    form.getFieldValue(["a", "player_username"])
                  )();
                  setTimeout(() => {
                    run({ onlyResult: true });
                  }, 100);
                }}
              >
                {l("Reload Battle")}
              </Button>
            )}
          </Form.Item>
        )}
      </Flex>
    </Flex>
  );
};
export default Simulator;
