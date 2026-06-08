import React from "react";
import {
  ClearOutlined,
} from "@ant-design/icons";
import { Avatar, Form, TreeSelect, Rate } from "antd";
import { swogi } from "../engine/card_json_web";

export default function SortableCard({
  id,
  index,
  field,
  roleField,
  form,
  treeData,
  filterTreeNode,
  l,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const cards = Form.useWatch([roleField, "cards"]) || [];

  const card = cards[index] || {};
  const getCardSrc = (card) => {
    const perfix = `yxp_images/${l.lang === "en" ? "en" : "zh"}/`;
    if (!card.card_id) {
      return `${perfix}Deviation Syndrome1.png`;
    } else if (String(card.card_id).startsWith("D")) {
      return `${perfix}D${card.card_id.slice(2, 6)}.png`;
    } else {
      return `${perfix}${card.card_id + card.level - 1}.png`;
    }
  }
  const src = getCardSrc(card)

  const style = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };

  return (
    <div style={style}>
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
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
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
          popupMatchSelectWidth={300}
          popupClassName="no-motion"
          treeData={treeData}
          style={{ width: "100%" }}
          onChange={(e) => {
            const level = form.getFieldValue([
              roleField,
              "cards",
              field.name,
              "level",
            ]);
            if (swogi[String(e - 1 + level)].does_not_exist) {
              form.setFieldValue([roleField, "cards", field.name], {
                card_id: e,
                level: swogi[String(e)].does_not_exist
                  ? swogi[String(e + 1)].does_not_exist
                    ? swogi[String(e + 2)].does_not_exist
                      ? 0
                      : 3
                    : 2
                  : 1,
              });
            }
          }}
        />
      </Form.Item>

      <Form.Item name={[field.name, "level"]} className='cardlevel'>
        <Rate tabIndex='-1' count={3} allowClear={false} />
      </Form.Item>
    </div>
  );
}
