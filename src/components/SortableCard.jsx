// src/components/SortableCard.jsx
import React from "react";
import {
  ClearOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Form, TreeSelect, Rate, Col } from "antd";
import { swogi } from "../engine/card_json_web";

export default function SortableCard({
  id, // 唯一字符串 ID，用于 dnd-kit 排序识别
  index, // 当前在字段数组中的索引
  field, // Ant Design Form.List 内置 field 对象
  roleField, // 字符串，比如 'a' 或 'b'
  form, // Ant Design Form 实例
  treeData, // 用于构造 TreeSelect 的数据
  filterTreeNode, // 用于 TreeSelect 的筛选函数
  l,
}) {
  // 从 useSortable 中取得可拖拽与放置的属性
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // 将 transform 对象转换为行内样式字符串
  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };

  // 从 Form 中获取当前的 cards 数组，找到第 index 个卡片
  const cards = Form.useWatch([roleField, "cards"]) || [];
  const card = cards[index] || {};
  const isDream = String(card.card_id).startsWith('D');
  const src = card.card_id
    ? `yxp_images/${l.lang === "en" ? "en" : "zh"}/${String(card.card_id).slice(0, -1) + card.level}.png`
    : null;

  return (
    <div ref={setNodeRef} style={style}>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[roleField].cards?.[index]?.card_id !==
            curr[roleField].cards?.[index]?.card_id ||
          prev[roleField].cards?.[index]?.level !==
            curr[roleField].cards?.[index]?.level
        }
      >
        {() => (
          <Avatar
            {...attributes}
            {...listeners}
            className='card'
            shape='square'
            src={src}
          />
        )}
      </Form.Item>

      <div className="cardlevel" style={{ textAlign: 'center' }}>
        <Rate
          tabIndex='-1'
          count={isDream ? 5 : 3}
          allowClear={false}
          value={card.level}
          onChange={(newLevel) => {
            if (!card.card_id) return;
            const base = String(card.card_id).slice(0, -1);
            const entry = swogi[base + newLevel];
            if (!entry || entry.does_not_exist) return;
            form.setFieldValue([roleField, "cards", field.name, "level"], newLevel);
          }}
        />
      </div>

      <Form.Item name={[field.name, "card_id"]} className='cardname'>
        <TreeSelect
          placeholder='Select'
          showSearch
          allowClear
          suffixIcon={
            <ClearOutlined
              onClick={(e) => {
                form.setFieldValue([roleField, "cards", field.name], {
                  card_id: 601011,
                  level: 1,
                });
              }}
            />
          }
          treeExpandAction='click'
          filterTreeNode={filterTreeNode}
          popupMatchSelectWidth={false}
          treeData={treeData}
          style={{ width: "100%" }}
          onChange={(newCardId) => {
            let lvl = card.level || 1;
            const newIsDream = String(newCardId).startsWith('D');
            const oldIsDream = String(card.card_id).startsWith('D');
            if (newIsDream && !oldIsDream) {
              lvl = 5;
            } else {
              const base = String(newCardId).slice(0, -1);
              while (lvl > 1 && (!swogi[base + lvl] || swogi[base + lvl].does_not_exist)) lvl--;
              while (lvl < 5 && (!swogi[base + lvl] || swogi[base + lvl].does_not_exist)) lvl++;
            }
            form.setFieldValue([roleField, "cards", field.name], {
              card_id: newCardId,
              level: lvl,
            });
          }}
        />
      </Form.Item>
    </div>
  );
}
