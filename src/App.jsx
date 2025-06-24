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
  Tabs,
  Tag,
  Table,
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
import cardname from "./engine/names.json";
import "./App.css";
import { useOperationJsonFile } from "./hooks/useOperationJsonFile.js";
import _ from "lodash";

const { Text, Link, Title, Paragraph } = Typography;
const { TextArea } = Input;

const initialValues = localStorage.getItem("cardInit")
  ? JSON.parse(localStorage.getItem("cardInit"))
  : cardInit;

const getMemo = (operationLogs) => {
  const memo = {};
  const cardChange = (card, reduce) => {
    if (!card.name) return;
    if (memo[card.name] === undefined) {
      if (card.level < 5) {
        memo[card.name] = 8;
      } else {
        memo[card.name] = 6;
      }
    }
    memo[card.name] -= reduce;
  };
  if (operationLogs?.length > 0) {
    operationLogs.map((item) => {
      if (item.operation === 0) {
        item.cards.map((card) => {
          cardChange(card, 1);
        });
      } else if (item.operation === 1) {
        cardChange(item.srcCard, 2);
        cardChange(item.dstCard, 1);
      }
    });
  }
  return memo;
};

export default function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });
  const l = i18n(lang);

  const { data, pickFile, readFile, hasHandle } = useOperationJsonFile();

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    let timer = setInterval(() => {
      if (hasHandle) {
        readFile();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hasHandle, readFile]);

  const colorByP = {
    1: "#977A60",
    2: "green",
    3: "blue",
    4: "purple",
    5: "green",
  };

  const getPByName = (name) => {
    return [
      +String(
        cardname.find((card) => card.namecn === name.replace("•", "·"))?.id
      ).charAt(2),
    ];
  };

  const operationColumns = [
    {
      title: l("Round"),
      dataIndex: "round",
      key: "round",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.round - b.round,
    },
    {
      title: l("Operation"),
      dataIndex: "operation",
      key: "operation",
      render: (oprationKey) => {
        return {
          0: "发牌",
          1: "换牌",
          2: "炼化",
        }[oprationKey];
      },
    },
    {
      title: l("Cards"),
      dataIndex: "cards",
      key: "cards",
      render: (_, record) => {
        const { cards, dstCard } = record;
        return dstCard.name ? (
          <Tag color={colorByP[dstCard.level]} key={dstCard.name}>
            {dstCard.name}
          </Tag>
        ) : (
          (cards || []).map((card, i) => {
            return (
              <Tag color={colorByP[card.level]} key={card.name + i}>
                {card.name}
              </Tag>
            );
          })
        );
      },
    },
    {
      title: l("Waste Card"),
      dataIndex: "srcCard",
      key: "srcCard",
      render: (card) => {
        if (!card.name) return;
        return (
          <Tag color={colorByP[card.level]} key={card.name}>
            {card.name}
          </Tag>
        );
      },
    },
  ];

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [result, setResult] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputJSONValue, setInputJSONValue] = useState("");

  const onLangChange = ({ target: { value } }) => setLang(value);

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

  const noticeList = (data) => {
    const MEMO = getMemo(data);

    return [(count) => count < 0, 0, 1].map((f) => {
      return (
        <Flex gap={"4px 0"} wrap>
          {Object.keys(MEMO)
            .filter((cardname) =>
              typeof f === "number" ? MEMO[cardname] === f : f(MEMO[cardname])
            )
            .sort((a, b) => getPByName(a) - getPByName(b))
            .map((cardname) => (
              <Tag key={cardname} color={colorByP[getPByName(cardname)]}>
                {cardname + " * " + MEMO[cardname]}
              </Tag>
            ))}
        </Flex>
      );
    });
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
            <Space>
              <Button
                onClick={() => {
                  pickFile();
                }}
              >
                {l("Oppration Setting")}
              </Button>
              <Radio.Group value={lang} onChange={onLangChange}>
                <Radio.Button value='cn'>中文</Radio.Button>
                <Radio.Button value='en'>English</Radio.Button>
              </Radio.Group>
            </Space>
          </Flex>
          <Row gutter={[16, 16]} className='main'>
            <Col xs={24} md={24} lg={18}>
              {hasHandle && (
                <Flex
                  vertical
                  gap={16}
                  className='bg'
                  style={{ marginBottom: 16 }}
                >
                  <Title level={4}>卡牌记录</Title>

                  {noticeList(data)}

                  <Table dataSource={data} columns={operationColumns} />
                </Flex>
              )}
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
            <Text>Version: v{__APP_VERSION__}</Text>
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
