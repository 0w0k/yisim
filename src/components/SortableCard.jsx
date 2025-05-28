// src/components/SortableCard.jsx
import React from "react";
import {
  UserOutlined,
  QuestionOutlined,
  PlayCircleOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Form, TreeSelect, Rate, Col } from "antd";

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
    // transition,
    // 当正在拖拽时可以微调样式，比如将透明度降低
    opacity: isDragging ? 0.5 : 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };

  // 从 Form 中获取当前的 cards 数组，找到第 index 个卡片
  const cards = Form.useWatch([roleField, "cards"]) || [];
  const card = cards[index] || {};
  const src = card.card_id
    ? `yxp_images/${l.lang === "en" ? "en" : "zh"}/${card.card_id + card.level - 1}.png`
    : `yxp_images/${l.lang === "en" ? "en" : "zh"}/Deviation Syndrome1.png`;

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
        />
      </Form.Item>

      {/* 等级评分 */}
      <Form.Item name={[field.name, "level"]} className='cardlevel'>
        <Rate tabIndex='-1' count={3} allowClear={false} />
      </Form.Item>
    </div>
  );
}
