import React, { useState, useEffect } from "react";
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
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  QuestionOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  BilibiliOutlined,
  QqOutlined,
} from "@ant-design/icons";
import Simulator from "./Simulator.jsx";
import i18n from "./i18n.js";
import cardInit from "./cardint.json";
import "./App.css";
import _ from "lodash";

const { Text, Link, Title, Paragraph } = Typography;
const { TextArea } = Input;

const initialValues = localStorage.getItem("cardInit")
  ? JSON.parse(localStorage.getItem("cardInit"))
  : cardInit;

export default function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [result, setResult] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputJSONValue, setInputJSONValue] = useState("");

  const onLangChange = ({ target: { value } }) => setLang(value);

  const l = i18n(lang);

  const inputJSON = () => {
    try {
      const gameJSON = JSON.parse(inputJSONValue);
      form.setFieldsValue(gameJSON);
      setIsModalOpen(false);
    } catch (err) {
      messageApi.open({
        type: "error",
        content: l(err.message),
      });
    }
  };

  return (
    <div className='app'>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#000000",
            colorBgContainer: "#00000000",
            colorLink: "#FFFFFF",
          },
          components: {},
        }}
      >
        {contextHolder}
        <Modal
          title={l("Input JSON")}
          open={isModalOpen}
          onOk={inputJSON}
          onCancel={() => setIsModalOpen(false)}
        >
          <TextArea
            rows={16}
            value={inputJSONValue}
            onChange={(e) => setInputJSONValue(e.target.value)}
          />
        </Modal>
        <Flex vertical>
          <Flex justify='space-between' align='center'>
            <Title level={2}>{l("Yi Xian Simulator")}</Title>
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
                <Simulator
                  l={l}
                  form={form}
                  setResult={setResult}
                  setIsModalOpen={setIsModalOpen}
                  messageApi={messageApi}
                />
              </Form>
            </Col>
            <Col xs={24} md={24} lg={6}>
              <Flex vertical className='bg result'>
                <Title level={4}>{l("Result:")}</Title>
                {result.length === 0 && <Empty className='empty' />}
                {result.map((item, i) =>
                  i !== result.length - 1 ? (
                    <Paragraph key={"result" + i}>{item}</Paragraph>
                  ) : (
                    <Paragraph key={"result" + i} type='success' strong>
                      {item}
                    </Paragraph>
                  )
                )}
              </Flex>
            </Col>
          </Row>
          <Flex wrap gap={16} justify='center' className='footer'>
            <Text>
              <Link href='https://qm.qq.com/q/eLzC02p1BK'>
                点击加入QQ群：
                <QqOutlined />
                599092307
              </Link>
            </Text>
            <Text>
              <Link href='https://www.bilibili.com/video/BV13v7sz7E3V'>
                视频教程：
                <BilibiliOutlined />
              </Link>
            </Text>
            <Text>Version: v{window.__APP_VERSION__}</Text>
            <Text>
              Thanks: <Link href='https://github.com/sharpobject'>Sharp</Link> &{" "}
              <Link href='https://github.com/Jayromulus'>Jayromulus</Link>
            </Text>
          </Flex>
        </Flex>
      </ConfigProvider>
    </div>
  );
}
