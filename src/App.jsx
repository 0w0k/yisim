import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Avatar,
  Typography,
  Input,
  InputNumber,
  Form,
  Radio,
  ConfigProvider,
  theme,
  Select,
  Flex,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  UserOutlined,
  QuestionOutlined,
  PlayCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import Simulator from './Simulator.jsx';
import i18n from './i18n.js';
import cardInit from './cardint.json';
import './App.css';
import _ from 'lodash';

const { Text, Link, Title, Paragraph } = Typography;

const initialValues = localStorage.getItem('cardInit')
  ? JSON.parse(localStorage.getItem('cardInit'))
  : cardInit;

export default function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const [form] = Form.useForm();

  const [result, setResult] = useState([]);

  const onLangChange = ({ target: { value } }) => setLang(value);

  const l = i18n(lang);

  return (
    <div className='app'>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#000000',
            colorBgContainer: '#00000000',
            colorLink: '#FFFFFF',
          },
          components: {},
        }}
      >
        <Flex vertical>
          <Flex justify='space-between' align='center'>
            <Title level={2}>{l('Yi Xian Simulator')}</Title>
            <Radio.Group value={lang} onChange={onLangChange}>
              <Radio.Button value='cn'>中文</Radio.Button>
              <Radio.Button value='en'>English</Radio.Button>
            </Radio.Group>
          </Flex>
          <Row gutter={[16, 16]} className='main'>
            <Col xs={24} md={24} lg={18}>
              <Form
                layout='inline'
                variant='underlined'
                form={form}
                initialValues={initialValues}
              >
                <Simulator l={l} form={form} setResult={setResult} />
              </Form>
            </Col>
            <Col xs={24} md={24} lg={6}>
              <Flex vertical className='bg result'>
                <Title level={4}>{l('Result:')}</Title>
                {result.length === 0 && <Empty className='empty' />}
                {result.map((item, i) =>
                  i !== result.length - 1 ? (
                    <Paragraph key={'result' + i}>{item}</Paragraph>
                  ) : (
                    <Paragraph key={'result' + i} type='success' strong>
                      {item}
                    </Paragraph>
                  )
                )}
              </Flex>
            </Col>
          </Row>
          <Flex wrap gap={16} justify='center' className='footer'>
            <Text>YiXian ID: 弈仙牌是快乐游戏</Text>
            <Text>QQ: 412386861</Text>
            <Text>Version: v{__APP_VERSION__}</Text>
            <Text>
              Thanks: <Link href='https://github.com/sharpobject'>Sharp</Link> &{' '}
              <Link href='https://github.com/Jayromulus'>Jayromulus</Link>
            </Text>
          </Flex>
        </Flex>
      </ConfigProvider>
    </div>
  );
}
