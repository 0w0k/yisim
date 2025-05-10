import React, { Children, useState } from 'react';
import {
  Button, Space, Avatar, Typography, Input, InputNumber, Form, Radio, ConfigProvider, theme, Select,
  Flex, Row, Col, Rate, TreeSelect
} from 'antd';
import { UserOutlined, QuestionOutlined, PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { GameState } from '../engine/gamestate_full_ui.js';
import parse_input from '../engine/parse_input_ui.js';
import talents from '../engine/lanke/talents.json';
import cardnames from '../engine/names.json';
import _ from 'lodash';

export default function Simulator({ l, form, setResult }) {

  Form.useWatch('a', form)
  Form.useWatch('b', form)

  const { a, b } = form.getFieldsValue(['a', 'b'])

  const telentsTreeData = Object.keys(talents).filter(item => talents[item]).map(item => {
    const engineField = talents[item];
    const result = {
      value: engineField,
      title: l(item),
    }
    if (engineField.includes('{n}')) {

      result.children = [
        {
          value: engineField.replace(/\{n\}/g, "2"),
          title: `${l(item)} ${l('p2')}`,
          isLeaf: true,
        },
        {
          value: engineField.replace(/\{n\}/g, "3"),
          title: `${l(item)} ${l('p3')}`,
        },
        {
          value: engineField.replace(/\{n\}/g, "4"),
          title: `${l(item)} ${l('p4')}`,
        },
        {
          value: engineField.replace(/\{n\}/g, "5"),
          title: `${l(item)} ${l('p5')}`,
        },
      ]
    }

    return result
  })

  return (
    <Flex justify="space-between" vertical gap={16}>
      {
        [a, b].map((role, i) => {
          const roleField = i === 0 ? 'a' : 'b';
          return (
            <Space key={'role' + i} className="bg" direction="vertical" size={16}>
              <Space wrap size={16}>
                <Avatar size={80} src={`YiXian-IconsAndNames/characters/${role.character}.png`} />
                {
                  role.talents.map(item => {
                    const fileName = Object.keys(talents).find(t => talents[t] === item.replace(/p\d+/g, "p{n}"));
                    return <Avatar size={64} src={`yxp_images/talent/${fileName}.png`} />
                  })
                }
                {/* <Avatar size={64} icon={<img style={{ objectFit: 'contain' }} src='YiXian-IconsAndNames/jobs/elixirist.png' />} /> */}
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
              <Form.Item label={l('Talent')} name={[roleField, "talents"]}>
                <TreeSelect
                  showSearch
                  treeCheckable
                  style={{ width: '100%' }}
                  maxCount={5}
                  // value={value}
                  // styles={{
                  //   popup: { root: { maxHeight: 400, overflow: 'auto' } },
                  // }}
                  // placeholder="Please select"
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  // onChange={onChange}
                  treeData={telentsTreeData}
                />
              </Form.Item>
              <Row wrap className="deck">
                <Form.List name={[roleField, 'cards']}>
                  {
                    (fields, { add, remove },) => {
                      return (
                        fields.map((field, i) => {
                          return (
                            <Col
                              flex
                              xs={12}
                              md={3}
                              key={`a-cards-${i}`} className='deck'>
                              <Avatar className="card" shape="square" src={`yxp_images/en/${role?.cards[i].card_id + role?.cards[i].level - 1}.png`} />
                              <Form.Item name={[field.name, 'level']} className="cardlevel">
                                <Rate count={3} allowClear={false} />
                              </Form.Item>
                              <Form.Item name={[field.name, 'card_id']} className="cardname">
                                <Select
                                  showSearch
                                  placeholder="Select a Card"
                                  optionFilterProp="label"
                                  popupMatchSelectWidth={false}
                                  options={cardnames.map(({ id, name, namecn }) => ({ value: id, label: l(name) }))}
                                />
                              </Form.Item>
                            </Col>
                          )
                        })
                      )
                    }
                  }
                </Form.List>
              </Row>
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
      <Flex className='bg' gap={16} wrap>
        <Button size="large" type="primary" icon={<PlayCircleOutlined />} onClick={() => {
          const game_json = form.getFieldsValue(true);

          let jsonData = _.cloneDeep(game_json);
          jsonData.a.cards = jsonData.a.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
          jsonData.b.cards = jsonData.b.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
          jsonData.a.talents.map(t => {
            jsonData.a[t] = 1
          })
          jsonData.b.talents.map(t => {
            jsonData.b[t] = 1
          })
          jsonData = parse_input(jsonData);

          console.log(jsonData)

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
      </Flex>
    </Flex>
  )
}