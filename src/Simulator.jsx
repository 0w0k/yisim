import React, { useState } from 'react';
import { Button, Space, Avatar, Typography, Input, InputNumber, Form, Radio, ConfigProvider, theme, Select, Flex, Row, Col } from 'antd';
import { UserOutlined, QuestionOutlined, PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { GameState } from '../engine/gamestate_full.js';
import parse_input from '../engine/parse_input.js';

import cardnames from '../engine/names.json';
import _ from 'lodash';

export default function Simulator({ l, form, setResult }) {

  Form.useWatch('a', form)
  Form.useWatch('b', form)

  const {a, b} = form.getFieldsValue(['a', 'b'])

  return (
    <Flex justify="space-between" vertical gap={16}>
      {
        [a, b].map((role, i) => {
          const roleField = i === 0 ? 'a' : 'b';
          return (
            <Space key={'role' + i} className="bg" direction="vertical" size={16}>
              <Space wrap size={16}>
                <Avatar size={80} src={`YiXian-IconsAndNames/characters/${role.character}.png`} />
                <Avatar size={64} src='dunwu.png' />
                <Avatar size={64} src='dunwu.png' />
                <Avatar size={64} src='dunwu.png' />
                <Avatar size={64} src='dunwu.png' />
                <Avatar size={64} icon={<img style={{ objectFit: 'contain' }} src='YiXian-IconsAndNames/jobs/elixirist.png' />} />
                <Form.Item label={l('Cultivation')} name={[roleField, "cultivation"]}>
                  <InputNumber changeOnWheel controls={false} />
                </Form.Item>
                <Form.Item label={l("HP")} name={[roleField, "hp"]}>
                  <InputNumber changeOnWheel controls={false} />
                </Form.Item>
                <Form.Item label={l("Physique")}>
                  <Space.Compact>
                    <Form.Item name={[roleField, "physique"]} noStyle><InputNumber changeOnWheel controls={false} /></Form.Item>
                    <Form.Item name={[roleField, "max_physique"]}><InputNumber changeOnWheel controls={false} /></Form.Item>
                  </Space.Compact>
                </Form.Item>

              </Space>
              <Flex className="deck">
                <Form.List name={[roleField, 'cards']}>
                  {
                    (fields, { add, remove },) => {
                      return (
                        fields.map((field, i) => {
                          return (
                            <Flex key={`a-cards-${i}`} vertical >
                              <Avatar className="card" shape="square" src={`yxp_images/en/${role?.cards[i].card_id + role?.cards[i].level - 1}.png`} />
                              <Form.Item name={[field.name, 'card_id']} className="cardname">
                                <Select
                                  showSearch
                                  placeholder="Select a Card"
                                  optionFilterProp="label"
                                  popupMatchSelectWidth={false}
                                  options={cardnames.map(({ id, name, namecn }) => ({ value: id, label: l(name) }))}
                                />
                              </Form.Item>
                              <Form.Item name={[field.name, 'level']} className="cardlevel">
                                <Radio.Group block >
                                  <Radio value={1}>1</Radio>
                                  <Radio value={2}>2</Radio>
                                  <Radio value={3}>3</Radio>
                                </Radio.Group>
                              </Form.Item>
                            </Flex>
                          )
                        })
                      )
                    }
                  }
                </Form.List>
              </Flex>
              {/* <Space className="bg" direction="vertical" >
                  <Text >[ Hand Card ]</Text>
                  <Space size={16}>
                    <Avatar className="card" shape="square" src='./yxp_images/en/111011.png' />
                    <Avatar className="card" shape="square" src='./yxp_images/en/111011.png' />
                    <Avatar className="card" shape="square" src='./yxp_images/en/111011.png' />
                    <Avatar className="card" shape="square" src='./yxp_images/en/111011.png' />
                    <Avatar className="card" shape="square" src='./yxp_images/en/111011.png' />
                    <Avatar className="card" shape="square" ><span style={{ fontSize: 36 }}>+</span></Avatar>
                  </Space>
                </Space> */}
            </Space>
          )
        })
      }
      <Space className='bg' size={16}>
        <Button size="large" type="primary" icon={<PlayCircleOutlined />} onClick={() => {
          const game_json = form.getFieldsValue(true);

          let jsonData = _.cloneDeep(game_json);
          jsonData.a.cards = jsonData.a.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
          jsonData.b.cards = jsonData.b.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
          jsonData = parse_input(jsonData);

          const game = new GameState(l);

          if (jsonData.a.cultivation >= jsonData.b.cultivation) {
            Object.assign(game.players[0], jsonData.a);
            Object.assign(game.players[1], jsonData.b);
          } else {
            Object.assign(game.players[0], jsonData.b);
            Object.assign(game.players[1], jsonData.a);
          }

          game.sim_n_turns(64);
          setResult(game.output)
        }
        }>Run</Button>
        <Button size="large" type="primary" icon={<ClearOutlined />} onClick={() => { setResult([]) }}>clean</Button>
        <Button size="large" type="primary" disabled icon={<PlayCircleOutlined />}>Run (get winning deck)</Button>
      </Space>
    </Flex>
  )
}