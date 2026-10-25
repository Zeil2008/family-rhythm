# 为家庭节奏配置 HTTPS

HTTPS 证书建议由 NAS 的反向代理统一管理。应用容器继续只监听内部 HTTP `3000`，外部通过 HTTPS 域名访问。

## 一、准备域名

有两种常见方式：

- **家庭内网使用**：让 `family.example.com` 在家庭路由器的 DNS 或 NAS DNS 中解析到 NAS 的局域网 IP。外网访问时再更新为公网地址。
- **公网访问**：使用 DDNS 域名并将路由器 `443` 端口转发到 NAS。不要转发应用的 `3000` 端口。

推荐使用类似 `home.example.com` 的独立子域名，只给家庭节奏使用。

## 二、群晖 DSM

### 1. 申请证书

1. 打开 **控制面板 → 安全性 → 证书**。
2. 点击“新增证书”。
3. 选择“获取 Let's Encrypt 证书”或导入已有证书。
4. 域名填写 `family.example.com`。
5. 确认路由器已把外部 `80` 和 `443` 端口转发到 NAS，或使用 DNS 验证方式。
6. 将新证书设置为该域名的默认证书。

### 2. 创建反向代理

1. 打开 **控制面板 → 登录门户 → 高级 → 反向代理**。
2. 点击“新增”。
3. 来源设置：

   ```text
   协议：HTTPS
   主机名：family.example.com
   端口：443
   ```

4. 目的地设置：

   ```text
   协议：HTTP
   主机名：localhost
   端口：3000
   ```

5. 保存后即可访问 `https://family.example.com`。

如果家庭节奏使用了其它端口，例如 `8080`，目的端口也要改成 `8080`。

## 三、威联通 QTS

1. 打开 **控制面板 → 应用程序 → Web 服务器 → 反向代理**。
2. 新增规则，来源域名填写 `family.example.com`，HTTPS 使用 `443`。
3. 目标地址填写 NAS 的本机地址和家庭节奏端口，例如：

   ```text
   http://127.0.0.1:3000
   ```

4. 在 **控制面板 → 安全性 → SSL 证书与密钥** 中申请或导入证书。
5. 将证书绑定到 `family.example.com`。
6. 保存并重启反向代理服务。

不同 QTS 版本的菜单名称略有不同，核心配置始终是：

```text
https://domain.example → http://NAS内部地址:3000
```

## 四、Caddy

在 NAS 上安装 Caddy 后，可使用项目中的 `deploy/Caddyfile.example`，修改为：

```caddyfile
family.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

Caddy 会自动申请和续期证书。若 Caddy 与家庭节奏运行在同一个 Docker 网络，目标地址可改为容器服务名：

```caddyfile
family.example.com {
    encode zstd gzip
    reverse_proxy family-dashboard:3000
}
```

## 五、更新家庭节奏配置

HTTPS 生效后，在 NAS 项目目录中将 `.env.example` 复制为 `.env`，设置：

```text
APP_PORT=3000
COOKIE_SECURE=true
```

然后在 Container Manager 中重新创建/重启家庭节奏项目，让 `COOKIE_SECURE` 生效。

`COOKIE_SECURE=true` 后，必须使用 HTTPS 访问系统；直接访问 HTTP 将无法保持登录状态，这是正常现象。

## 六、验证

浏览器打开：

```text
https://family.example.com
```

检查以下几点：

- 地址栏显示有效证书。
- 登录成功后刷新页面，仍然保持登录。
- 手机上传头像或成果照片正常。
- iPad Safari 可以“添加到主屏幕”并正常打开。

如果登录提交时提示“请求来源不正确”，请确认 NAS 反向代理保留了原始 Host 头，或者将域名改回 NAS 自带反向代理重新配置。

## 七、安全建议

- 路由器只开放 `443`，不要开放 `3000`。
- 为家庭域名单独申请证书。
- 公网访问建议配合 NAS 防火墙、登录保护或 Tailscale。
- 自签名证书在 iPhone/iPad 上通常不能直接用于完整的 PWA 安装，优先使用受信任的 Let's Encrypt 证书。
