# 家庭节奏 NAS 手动部署

推荐使用 NAS 的 Docker / Container Manager 部署。项目不依赖外部数据库，升级只需要保留 `data` 目录。

## 一、准备 NAS

1. 在 NAS 应用中心安装：
   - 群晖：**Container Manager**
   - 威联通：**Container Station**
   - 绿联、极空间或其它系统：安装 Docker / 容器管理应用
2. 在 NAS 的 Docker 共享目录中新建文件夹，例如：

   ```text
   /docker/family-rhythm
   ```

3. 将 `family-rhythm-nas.zip` 上传到该文件夹并解压。
4. 确认解压后的文件里能看到：

   ```text
   docker-compose.yml
   Dockerfile
   server.js
   public/
   src/
   data/
   ```

首次启动前可以手动创建 `data` 文件夹。家庭数据库、成员头像、任务成果照片和备份都会保存在这里。
容器首次启动时会自动修正这个目录的写入权限，不需要额外开启 SSH。

## 二、创建容器项目

### 群晖 Container Manager

1. 打开 **Container Manager → 项目 → 新增**。
2. 项目名称填写 `family-rhythm`。
3. 路径选择 `/docker/family-rhythm`。
4. 来源选择已有的 `docker-compose.yml`，或选择“创建 docker-compose.yml”并粘贴项目中的内容。
5. 确认端口映射为 `3000:3000`。
6. 点击“构建并启动”。

### 威联通 Container Station

1. 打开 **Container Station → 应用程序 → 创建**。
2. 名称填写 `family-rhythm`。
3. 在 YAML 编辑器中粘贴 `docker-compose.yml` 的内容。
4. 确认项目文件位于 `/share/Container/family-rhythm`，或把 YAML 中的 `./data` 改为 NAS 上的绝对数据路径。
5. 创建并启动。

### 支持 Docker Compose 的其它 NAS

在应用界面导入 `docker-compose.yml`，确认项目路径和端口后启动即可。

如果你有 NAS 的 SSH 终端，也可以在项目目录直接运行：

```bash
docker compose up -d --build
```

## 三、首次访问

在电脑或手机浏览器打开：

```text
http://NAS局域网IP:3000
```

例如：

```text
http://192.168.1.20:3000
```

打开后创建家庭名称、家长账号，并可选创建一个孩子成员。首次密码设置为 4–8 位数字。

如果 `3000` 端口已被占用：

1. 复制 `.env.example` 为 `.env`。
2. 修改 `APP_PORT=8080`。
3. 重新启动容器后访问 `http://NAS局域网IP:8080`。

## 四、手机和 iPad

手机和 iPad 连接与 NAS 相同的 Wi-Fi，然后访问上面的局域网地址。在 Safari 中选择“添加到主屏幕”，即可作为家庭应用使用。

## 五、检查是否部署成功

容器状态是“运行中”后，在浏览器访问：

```text
http://NAS局域网IP:3000/api/auth
```

如果返回类似下面的内容，说明服务和数据库都正常：

```json
{"setupRequired":false,"family":{"name":"我的家"},"members":[]}
```

`setupRequired:true` 也属于正常状态，表示还没创建家庭。

## 六、更新版本

1. 停止容器项目。
2. 替换代码文件，但不要删除或覆盖 `data` 目录。
3. 重新构建并启动容器。

群晖和威联通的项目界面都有“构建并重新启动”或“重新创建”操作。SSH 部署可直接执行：

```bash
docker compose up -d --build
```

## 七、备份

需要备份的内容都在：

```text
data/family.db
data/uploads/
```

通过 NAS 的文件管理器将整个 `data` 目录复制到另一块硬盘或 NAS 备份任务即可。不要只备份 `family.db`，否则成果照片和成员头像不会一起恢复。

## 八、外网访问与 HTTPS

不要直接将 `3000` 端口映射到公网。更安全的做法：

- 家庭内网使用 NAS 的内网地址。
- 外出访问优先使用 Tailscale、WireGuard 或 NAS 自带 VPN。
- 如需域名访问，使用 NAS 反向代理或 Caddy，并为域名配置 HTTPS。

启用 HTTPS 反向代理后，在 `.env` 中设置：

```text
COOKIE_SECURE=true
```

然后重启项目。

## 九、常见问题

### 页面无法打开

- 确认容器处于运行状态。
- 如果容器“意外停止”，先查看容器日志。`EADDRINUSE` 表示端口冲突，需要在 `.env` 中更换 `APP_PORT`。
- 确认使用的端口与项目设置一致。
- 检查 NAS 防火墙是否允许局域网访问该端口。
- 本机与 NAS 是否在同一网段。

### 提示数据库不可写

确认项目根目录中存在 `data` 文件夹，并且 NAS 的 Docker 服务有权访问该共享目录。容器启动入口会自动执行目录授权，随后以非 root 用户 `node` 运行应用。

### 更换 NAS 或重新部署

先复制整个 `data` 目录，再部署新项目并把 `data` 放回项目根目录。数据库会自动升级，不需要手动执行 SQL。
