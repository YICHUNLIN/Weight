地磅紀錄
===

# comtest

測試 Serial Port
用來分析地磅資料

# scale_server

> 地磅系統,連接RS232

## config

> /usr/src/app/data/config.json

```json
{
    "APP_NAME": {"value": "", "type": "string"},
    "SCALE_ENABLE": {"value": "", "type": "boolean"},
    "SCALE_BAUD_RATE": {"value": "", "type": "int"},
    "SCALE_COM_PORT": {"value": "", "type": "string"},
    "AUTH_SERVER": {"value": "", "type": "string"},
    "AUTH_CLIENT_ID": {"value": "", "type": "string"},
    "AUTH_CLIENT_SECRET": {"value": "", "type": "string"},
    "AUTH_CLIENT_USER_ACCOUNT": {"value": "", "type": "string"},
    "AUTH_CLIENT_USER_PASSWORD": {"value": "", "type": "string"}
}

```



## items

> /usr/src/app/data/items.json

```json
[
    {
        "name": "土:B5"
    },
    {
        "name": "土:B2-3"
    },
    {
        "name": "土:土石混合物"
    },
    {
        "name": "材:再生石"
    },
    {
        "name": "材:二分石"
    },
    {
        "name": "材:三分石"
    },
    {
        "name": "材:六分石"
    },
    {
        "name": "材:機制砂"
    },
    {
        "name": "材:粉刷砂(1:3)"
    },
    {
        "name": "材:碎石級配"
    },
    {
        "name": "廢:瀝青刨除料"
    },
    {
        "name": "工:其他"
    }
]

```

# scale_server_global

> 給外人用的,放在外面VPS