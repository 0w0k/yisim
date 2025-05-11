import React, { useState, useEffect } from 'react';
import { Button, Space, Avatar, Typography, Input, InputNumber, Form, Radio, ConfigProvider, theme, Select, Flex, Row, Col, Empty } from 'antd';
import { UserOutlined, QuestionOutlined, PlayCircleOutlined, ClearOutlined } from '@ant-design/icons';
import Simulator from './Simulator.jsx';
import i18n from './i18n.js';
import './App.css';
import _ from 'lodash';

const { Text, Link, Title, Paragraph } = Typography;


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
    ],
    talents: [],
  },
  "b": {
    "character": "du-lingyuan",
    "cultivation": 1,
    "hp": 40,
    "physique": 0,
    "max_physique": 0,
    "cards": [
      { card_id: 132071, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
      { card_id: 111011, level: 1 },
    ],
    talents: [],
  },
  "comment": "TODO implement speed comparison and let a_first be null"
}

export default function App() {

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const [form] = Form.useForm();

  const [result, setResult] = useState([]);

  const onLangChange = ({target: { value }}) => setLang(value);

  const l = i18n(lang);

  return (
    <div className="app">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            "colorPrimary": "#000000",
            "colorBgContainer": "#00000000",
            "colorLink": "#FFFFFF"
          },
          components: {}
        }}
      >
        <Flex vertical>
          <Flex justify="space-between" align='center'>
            <Title level={2}>{l('Yi Xian Simulator')}</Title>
            <Radio.Group value={lang} onChange={onLangChange}>
              <Radio.Button value="cn">中文</Radio.Button>
              <Radio.Button value="en">English</Radio.Button>
            </Radio.Group>
          </Flex>
          <Row gutter={[16, 16]} className='main'>
            <Col
              xs={24}
              md={24}
              lg={18}
            >
              <Form
                layout="inline"
                variant="underlined"
                form={form}
                initialValues={initialValues}
              >
                <Simulator l={l} form={form} setResult={setResult} />
              </Form>
            </Col>
            <Col
              xs={24}
              md={24}
              lg={6}
            >
              <Flex vertical className='bg result'>
                <Title level={4}>{l('Result:')}</Title>
                {
                  result.length === 0 && <Empty className='empty'/>
                }
                {
                  result.map((item, i) => i !== result.length - 1 ?
                    <Paragraph key={'result' + i}>{item}</Paragraph> :
                    <Paragraph key={'result' + i} type='success' strong>{item}</Paragraph>)
                }
              </Flex>
            </Col>
          </Row>
          <Flex wrap gap={16} justify='center' className='footer'>
              <Text>YiXian ID: 弈仙牌是快乐游戏</Text>
              <Text>QQ: 412386861</Text>
              <Text>Version: v{__APP_VERSION__}</Text>
              <Text>Thanks: <Link href='https://github.com/sharpobject'>Sharp</Link> & <Link href='https://github.com/Jayromulus'>Jayromulus</Link></Text>
          </Flex>
        </Flex>
      </ConfigProvider>
    </div>
  );
}

