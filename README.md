# Dongzhi Luo — 3D Academic Portfolio

一个面向 PhD 申请和研究合作的 3D 个人主页。页面使用 Three.js 构建原创的城市网络、认知节点和移动路径场景，并用滚动驱动镜头变化。内容来自最新版 CV。

## 页面内容

- 研究定位：computational urban science、spatial intelligence、agent-based modelling
- 论文：已发表、在投和成稿中论文
- 研究项目：认知城市智能体、规划优化、GPS 地图匹配、功能围合研究
- 交互原型：Starsea Embers、TOEFL Vocabulary Trainer、Origami Puzzle
- 教育与研究经历、技能、联系方式和 CV 下载

## 本地预览

需要 Node.js 22 和 pnpm 11。

```powershell
pnpm install
pnpm dev
```

浏览器打开终端显示的本地地址。正式构建：

```powershell
pnpm build
pnpm preview
```

## 发布到 GitHub Pages

### 1. 新建 GitHub 仓库

在 GitHub 点击 `New repository`。

- 推荐仓库名：`你的GitHub用户名.github.io`
- 可见性选择 `Public`
- 不要在 GitHub 页面额外创建 README、.gitignore 或 License，因为本地项目已经包含这些文件

如果使用其他仓库名，例如 `portfolio-3d`，最终网址会是：

`https://你的GitHub用户名.github.io/portfolio-3d/`

### 2. 推送本地项目

在本项目目录运行：

```powershell
git add .
git commit -m "Launch 3D academic portfolio"
git remote add origin https://github.com/你的GitHub用户名/你的仓库名.git
git push -u origin main
```

### 3. 开启 GitHub Pages

进入仓库：

`Settings` → `Pages` → `Build and deployment` → `Source` → 选择 `GitHub Actions`

推送后，`.github/workflows/deploy.yml` 会自动安装依赖、构建并发布 `dist`。在仓库的 `Actions` 页面看到绿色勾号后，回到 `Settings` → `Pages` 点击 `Visit site`。

### 4. 后续更新

修改文件后运行：

```powershell
git add .
git commit -m "Update portfolio"
git push
```

每次推送到 `main` 分支都会自动更新网页，通常几分钟内生效。

## 常用修改位置

- 页面文字和项目：`index.html`
- 颜色、字号和响应式布局：`src/style.css`
- 3D 城市、网络和滚动镜头：`src/main.js`
- 可下载 CV：`public/Dongzhi_Luo_CV.pdf`
- GitHub Pages 自动发布：`.github/workflows/deploy.yml`

## 隐私提醒

GitHub Pages 网页是公开的。发布前请确认 CV、邮箱、论文状态和作者顺序都适合公开展示。当前网页未展示手机号码。
