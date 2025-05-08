import React, { useState } from 'react';
import { Button, Space, Avatar, Typography, Input, InputNumber, Form, Radio, ConfigProvider, theme, Select, Flex, Row, Col } from 'antd';
import { UserOutlined, QuestionOutlined, PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { GameState } from '../yisim/gamestate_full.js';
import parse_input from '../yisim/parse_input.js';
import './App.css';

import cardnames from '../yisim/names.json';
import _ from 'lodash';

const { Text, Link, Title, Paragraph } = Typography;

export default function App() {

  const [form] = Form.useForm();

  const [result, setResult] = useState([]);

  const initialValues = {
    "permute_a": false,
    "permute_b": false,
    "a_first": true,
    "limit_consumption": true,
    "a": {
      "character": "mu-yifeng",
      "cultivation": 2,
      "hp": 40,
      "physique": 0,
      "max_physique": 0,
      // "birdie_wind_stacks": 1,
      "cards": [
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
      ]
    },
    "b": {
      "character": "du-lingyuan",
      "cultivation": 1,
      "hp": 40,
      "physique": 0,
      "max_physique": 0,
      "cards": [
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
        { card_id: 111011, level: 1 },
      ]
    },
    "comment": "TODO implement speed comparison and let a_first be null"
  }

  const a = Form.useWatch('a', form);
  const b = Form.useWatch('b', form);
  return (
    <div className="app">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            "colorPrimary": "#000000",
            "colorBgContainer": "#00000000"
          },
          components: {
            Form: {
              // labelColor: '#fff'
            }
          }
        }}
      >
        <Flex vertical>
          <Title>弈仙牌战斗模拟器</Title>
          <Flex gap={16} className='main'>
              <Form
                layout="inline"
                variant="underlined"
                form={form}
                initialValues={initialValues}
              >
                <Flex justify="space-between"  vertical gap={16}>
                  <Space className="bg" direction="vertical" size={16}>
                    <Space wrap size={16}>
                      <Avatar size={80} src='./YiXian-IconsAndNames\characters\mu-yifeng.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} icon={<img style={{ objectFit: 'contain' }} src='./YiXian-IconsAndNames\jobs\elixirist.png' />} />
                      <Form.Item label="Cultivation" name={["a", "cultivation"]}>
                        <InputNumber changeOnWheel controls={false} />
                      </Form.Item>
                      <Form.Item label="HP" name={["a", "hp"]}>
                        <InputNumber changeOnWheel controls={false} />
                      </Form.Item>
                      <Form.Item label="Physique">
                        <Space.Compact>
                          <Form.Item name={["a", "physique"]} noStyle><InputNumber changeOnWheel controls={false} /></Form.Item>
                          <Form.Item name={["a", "max_physique"]}><InputNumber changeOnWheel controls={false} /></Form.Item>
                        </Space.Compact>
                      </Form.Item>

                    </Space>
                    <Space size={16} className="deck">
                      <Form.List name={['a', 'cards']}>
                        {
                          (fields, { add, remove },) => {
                            return (
                              fields.map((field, i) => {
                                return (
                                  <Space key={`a-cards-${i}`} direction="vertical" >
                                    <Avatar className="card" shape="square" src={`./yxp_images/en/${a?.cards[i].card_id + a?.cards[i].level - 1}.png`} />
                                    <Form.Item name={[field.name, 'card_id']} className="cardname">
                                      <Select
                                        showSearch
                                        placeholder="Select a Card"
                                        optionFilterProp="label"
                                        popupMatchSelectWidth={false}
                                        options={cardnames.map(({ id, name, namecn }) => ({ value: id, label: namecn }))}
                                      />
                                    </Form.Item>
                                    <Form.Item name={[field.name, 'level']}>
                                      <Radio.Group>
                                        <Radio value={1}>1</Radio>
                                        <Radio value={2}>2</Radio>
                                        <Radio value={3}>3</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  </Space>
                                )
                              })
                            )
                          }
                        }
                      </Form.List>
                    </Space>
                    {/* <Space className="bg" direction="vertical" >
                    <Text >[ Hand Card ]</Text>
                    <Space size={16}>
                      <Avatar className="card" shape="square" src='./yxp_images\en\111011.png' />
                      <Avatar className="card" shape="square" src='./yxp_images\en\111011.png' />
                      <Avatar className="card" shape="square" src='./yxp_images\en\111011.png' />
                      <Avatar className="card" shape="square" src='./yxp_images\en\111011.png' />
                      <Avatar className="card" shape="square" src='./yxp_images\en\111011.png' />
                      <Avatar className="card" shape="square" ><span style={{ fontSize: 36 }}>+</span></Avatar>
                    </Space>
                  </Space> */}
                  </Space>
                  <Space className="bg" direction="vertical" size={16}>
                    <Space wrap size={16}>
                      <Avatar size={80} src='./YiXian-IconsAndNames/characters/du-lingyuan.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} src='./dunwu.png' />
                      <Avatar size={64} icon={<img style={{ objectFit: 'contain' }} src='./YiXian-IconsAndNames\jobs\formation-master.png' />} />
                      <Form.Item label="Cultivation" name={["b", "cultivation"]}>
                        <InputNumber changeOnWheel controls={false} />
                      </Form.Item>
                      <Form.Item label="HP" name={["b", "hp"]}>
                        <InputNumber changeOnWheel controls={false} />
                      </Form.Item>
                      <Form.Item label="Physique">
                        <Space.Compact>
                          <Form.Item name={["b", "physique"]} noStyle><InputNumber changeOnWheel controls={false} /></Form.Item>
                          <Form.Item name={["b", "max_physique"]}><InputNumber changeOnWheel controls={false} /></Form.Item>
                        </Space.Compact>
                      </Form.Item>
                    </Space>
                    <Space size={16} className="deck">
                      <Form.List name={['b', 'cards']}>
                        {
                          (fields, { add, remove },) => {
                            return (
                              fields.map((field, i) => {
                                return (
                                  <Space key={`a-cards-${i}`} direction="vertical" >
                                    <Avatar className="card" shape="square" src={`./yxp_images/en/${b?.cards[i].card_id + b?.cards[i].level - 1}.png`} />
                                    <Form.Item name={[field.name, 'card_id']} className="cardname">
                                      <Select
                                        showSearch
                                        placeholder="Select a Card"
                                        optionFilterProp="label"
                                        popupMatchSelectWidth={false}
                                        options={cardnames.map(({ id, name, namecn }) => ({ value: id, label: namecn }))}
                                      />
                                    </Form.Item>
                                    <Form.Item name={[field.name, 'level']}>
                                      <Radio.Group>
                                        <Radio value={1}>1</Radio>
                                        <Radio value={2}>2</Radio>
                                        <Radio value={3}>3</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  </Space>
                                )
                              })
                            )
                          }
                        }
                      </Form.List>
                    </Space>
                  </Space>
                  <Space className='bg' size={16}>
                    <Button size="large" type="primary" icon={<PlayCircleOutlined />} onClick={() => {
                      const game_json = form.getFieldsValue(true);

                      let jsonData = _.cloneDeep(game_json);
                      jsonData.a.cards = jsonData.a.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
                      jsonData.b.cards = jsonData.b.cards.map(item => `${cardnames.find(card => card.id === item.card_id).name} ${item.level}`)
                      jsonData = parse_input(jsonData);

                      const game = new GameState();

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
                    <Button size="large" type="primary" icon={<ClearOutlined />} onClick={() => {setResult([])}}>clean</Button>
                    <Button size="large" type="primary" disabled icon={<PlayCircleOutlined />}>Run (get winning deck)</Button>
                  </Space>
                </Flex>
              </Form>
              <Flex vertical className='bg result'>
                <Title level={4}>Result:</Title>
                {
                  result.map((item, i) => i !== result.length - 1 ? <Paragraph>{item}</Paragraph> : <Paragraph type='success' strong>{item}</Paragraph>)
                }
              </Flex>
          </Flex>
          <Flex justify='center' className='footer'>
            <Space size={32}>
              <Text>Made with 弈仙牌是快乐游戏</Text>
              <Text>QQ: 412386861</Text>
              <Text>version: v0.1</Text>
            </Space>
          </Flex>
        </Flex>
      </ConfigProvider>
    </div>
  );
}

