# 实现浏览器

## 一、实验介绍

### 1.1 实验内容

本次课程将基于 Python 3 和 PyQt 5 来学习 GUI 编程，课程分为两次实验，第一次实验先简单了解 Qt 各个组件的使用方法，第二次课程将尝试实现一个浏览器。

这是本次课程的第二次实验。

### 1.2 实验知识点

通过本次课程的我们将接触到以下知识点：

- 使用 QtWebKit 实现浏览器

### 1.3 实验流程

实验流程如下：

- 依赖项的安装
- 编程实现

### 1.4 实验效果

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/c89033212f9e21406d5a53800edcf4ff-0)

## 二、实验过程

### 2.1 安装 PyQt5

> 备注：如果你之前已经安装好 PyQt5 了则可以至今进入 2.2 步骤，安装 QtWebKit 模块。

Qt 是一个跨平台的 C++ 应用程序开发框架。广泛用于开发 GUI 程序，这种情况下又被称为部件工具箱。也可用于开发非 GUI 程序，比如控制台工具和服务器。

> 参考：[wiki--Qt](https://zh.wikipedia.org/wiki/Qt)

如果 Linux 中默认的 python 3 为 3.5 版本，可以通过以下指令切换到 3.4 。

```bash
$ sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.4 70 --slave /usr/bin/python3m python3m /usr/bin/python3.4m
```

安装 PyQt5 。

```bash
$ sudo apt-get install python3-pyqt5
```

安装完成之后，立马进入 Python 命令行交互界面测试是否正确安装。

```python
>>> import PyQt5
```

如果执行以上的命令没有任何提示，说明成功安装。

### 2.2 安装 QtWebKit 模块

由于某些原因，在安装 PyQt5 的时候 QtWebKit 未能一同安装，所以我们还需要单独安装。

```bash
$ sudo apt-get update
$ sudo apt-get install python3-pyqt5.qtwebkit
```

### 2.3 编程实现

因为本课程主要是学习 PyQt 的使用，所以在实现浏览器的时候将不涉及底层传输协议与页面解析等内容。那么该怎么实现浏览器呢？所幸 Qt 为开发者提供了 QtWebKit 模块。

QtWebKit 是一个基于开源项目 WebKit 的网页内容渲染引擎，借助该引擎可以更加快捷地将万维网集成到 Qt 应用中。

> 更多参考：
>
> - http://doc.qt.io/archives/qt-5.5/qtwebkit-index.html

通常来说一个浏览器应该要具备以下几个功能：

- 有一个可用来展示网页的窗口
- 拥有导航栏，地址栏
- 拥有标签，支持同时访问多个页面 接下来我们将逐一来实现以上提及的这些特性。

#### 2.3.1 创建浏览器

```python
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtWebKitWidgets import *

import sys

class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 设置窗口标题
        self.setWindowTitle('My Browser')
        # 设置窗口图标
        self.setWindowIcon(QIcon('icons/penguin.png'))
        self.show()

        # 设置浏览器
        self.browser = QWebView()
        url = 'https://www.lanqiao.cn/'
        # 指定打开界面的 URL
        self.browser.setUrl(QUrl(url))
         # 添加浏览器到窗口中
        self.setCentralWidget(self.browser)

# 创建应用
app = QApplication(sys.argv)
# 创建主窗口
window = MainWindow()
# 显示窗口
window.show()
# 运行应用，并监听事件
app.exec_()
```

程序中使用到的图片资源可以通过以下命令下载：

```bash
$ wget https://labfile.oss.aliyuncs.com/courses/705/icons.zip
$ unzip icons.zip
```

程序中用于加载渲染网页的部分使用到了 `QWebView` 类，该类继承于 `QWidget` 。

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/4ff4ba6b29464a04a6393bfc345d1832-0)

#### 2.3.2 添加导航栏

在这里我们要为浏览器添加导航栏，所以根据上节课的知识我们知道需要使用到 `QToolBar` 来创建，然后再往上边添加 `QAction` 创建按钮实例。

```python
...
class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        ...
        # 添加导航栏
        navigation_bar = QToolBar('Navigation')
        # 设定图标的大小
        navigation_bar.setIconSize(QSize(16, 16))
        self.addToolBar(navigation_bar)

        # 添加前进、后退、停止加载和刷新的按钮
        back_button = QAction(QIcon('icons/back.png'), 'Back', self)
        next_button = QAction(QIcon('icons/next.png'), 'Forward', self)
        stop_button = QAction(QIcon('icons/cross.png'), 'stop', self)
        reload_button = QAction(QIcon('icons/renew.png'), 'reload', self)

        back_button.triggered.connect(self.browser.back)
        next_button.triggered.connect(self.browser.forward)
        stop_button.triggered.connect(self.browser.stop)
        reload_button.triggered.connect(self.browser.reload)

        # 将按钮添加到导航栏上
        navigation_bar.addAction(back_button)
        navigation_bar.addAction(next_button)
        navigation_bar.addAction(stop_button)
        navigation_bar.addAction(reload_button)
...
```

现在我们不仅为浏览器添加了前进、后退、停止加载和刷新的按钮，同时还利用 `QWebView` 封装的槽实现了这些按钮的实际功能。

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/80cca4a41e6f12935ebd3b3417e4b0d8-0)

接下来我们再给浏览器添加地址栏。

```python
...
class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        ...

        # 添加 URL 地址栏
        self.urlbar = QLineEdit()
        navigation_bar.addSeparator()
        navigation_bar.addWidget(self.urlbar)

        self.browser.urlChanged.connect(self.renew_urlbar)

    def renew_urlbar(self, q):
        # 将当前网页的链接更新到地址栏
        self.urlbar.setText(q.toString())
        self.urlbar.setCursorPosition(0)
...
```

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/85c7e01488229329051f2b5faa2184c4-0)

这时候我们不仅添加了地址栏，而且地址栏还能实时更新成当前网页的 URL 。

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/23cb51b9bd7b2c3d6a4430a8b3c2be23-0)

但是细心的同学一定会发现目前地址栏还不支持直接输入地址回车访问，接下来我们便来实现这点。

```python
...
class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        ...

        # 添加 URL 地址栏
        self.urlbar = QLineEdit()
        # 让地址栏能响应回车按键信号
        self.urlbar.returnPressed.connect(self.navigate_to_url)

        navigation_bar.addSeparator()
        navigation_bar.addWidget(self.urlbar)

        self.browser.urlChanged.connect(self.renew_urlbar)

    # 响应回车按钮，将浏览器当前访问的 URL 设置为用户输入的 URL
    def navigate_to_url(self):
        q = QUrl(self.urlbar.text())
        if q.scheme() == '':
            q.setScheme('http')
        self.browser.setUrl(q)
...
```

#### 2.3.3 添加标签页

为了添加标签页，我们对程序的 web 界面实现做较大的改动。

使用 `QTabWidget` 来给浏览器添加标签栏用于展示标签页面。

```python
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtWebKitWidgets import *

import sys

class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 设置窗口标题
        self.setWindowTitle('My Browser')
        # 设置窗口图标
        self.setWindowIcon(QIcon('icons/penguin.png'))
        self.show()

        # 添加 URL 地址栏
        self.urlbar = QLineEdit()
        # 让地址栏能响应回车按键信号
        self.urlbar.returnPressed.connect(self.navigate_to_url)

        # 添加标签栏
        self.tabs = QTabWidget()
        self.add_new_tab(QUrl('https://www.lanqiao.cn'), 'Homepage')

        self.setCentralWidget(self.tabs)


        # 添加导航栏
        navigation_bar = QToolBar('Navigation')
        # 设定图标的大小
        navigation_bar.setIconSize(QSize(16, 16))
        self.addToolBar(navigation_bar)

        # 添加前进、后退、停止加载和刷新的按钮
        back_button = QAction(QIcon('icons/back.png'), 'Back', self)
        next_button = QAction(QIcon('icons/next.png'), 'Forward', self)
        stop_button = QAction(QIcon('icons/cross.png'), 'stop', self)
        reload_button = QAction(QIcon('icons/renew.png'), 'reload', self)

        back_button.triggered.connect(self.tabs.currentWidget().back)
        next_button.triggered.connect(self.tabs.currentWidget().forward)
        stop_button.triggered.connect(self.tabs.currentWidget().stop)
        reload_button.triggered.connect(self.tabs.currentWidget().reload)

        # 将按钮添加到导航栏上
        navigation_bar.addAction(back_button)
        navigation_bar.addAction(next_button)
        navigation_bar.addAction(stop_button)
        navigation_bar.addAction(reload_button)



        navigation_bar.addSeparator()
        navigation_bar.addWidget(self.urlbar)


    # 响应回车按钮，将浏览器当前访问的 URL 设置为用户输入的 URL
    def navigate_to_url(self):
        q = QUrl(self.urlbar.text())
        if q.scheme() == '':
            q.setScheme('http')
        self.browser.setUrl(q)

    def renew_urlbar(self, q, browser=None):
        # 如果不是当前窗口所展示的网页则不更新 URL
        if browser != self.tabs.currentWidget():
            return
        # 将当前网页的链接更新到地址栏
        self.urlbar.setText(q.toString())
        self.urlbar.setCursorPosition(0)

    # 添加新的标签页
    def add_new_tab(self, qurl, label):
        # 为标签创建新网页
        browser = QWebView()
        browser.setUrl(qurl)
        self.tabs.addTab(browser, label)

        browser.urlChanged.connect(lambda qurl, browser=browser: self.renew_urlbar(qurl, browser))


# 创建应用
app = QApplication(sys.argv)
# 创建主窗口
window = MainWindow()
# 显示窗口
window.show()
# 运行应用，并监听事件
app.exec_()
```

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/848cc9700ba8d5abdce3f236a7da094a-0)

接下来我们还要继续完善标签栏，为标签栏添加按钮能动态地扩展标签页面。

```python
...
class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 设置窗口标题
        self.setWindowTitle('My Browser')
        # 设置窗口图标
        self.setWindowIcon(QIcon('icons/penguin.png'))
        self.show()

        # 添加标签栏
        self.tabs = QTabWidget()
        self.tabs.setDocumentMode(True)
        self.tabs.tabBarDoubleClicked.connect(self.tab_open_doubleclick)
        self.tabs.currentChanged.connect(self.current_tab_changed)


        self.add_new_tab(QUrl('https://www.lanqiao.cn'), 'Homepage')

        self.setCentralWidget(self.tabs)

        new_tab_action = QAction(QIcon('icons/add_page.png'), 'New Page', self)
        new_tab_action.triggered.connect(self.add_new_tab)


        ...

        # 添加 URL 地址栏
        self.urlbar = QLineEdit()
        # 让地址栏能响应回车按键信号
        self.urlbar.returnPressed.connect(self.navigate_to_url)

        navigation_bar.addSeparator()
        navigation_bar.addWidget(self.urlbar)


    # 响应回车按钮，将浏览器当前访问的 URL 设置为用户输入的 URL
    def navigate_to_url(self):
        q = QUrl(self.urlbar.text())
        if q.scheme() == '':
            q.setScheme('http')
        self.tabs.currentWidget().setUrl(q)

    def renew_urlbar(self, q, browser=None):
        # 如果不是当前窗口所展示的网页则不更新 URL
        if browser != self.tabs.currentWidget():
            return
        # 将当前网页的链接更新到地址栏
        self.urlbar.setText(q.toString())
        self.urlbar.setCursorPosition(0)

    # 添加新的标签页
    def add_new_tab(self, qurl=QUrl(''), label='Blank'):
        # 为标签创建新网页
        browser = QWebView()
        browser.setUrl(qurl)
        i = self.tabs.addTab(browser, label)

        self.tabs.setCurrentIndex(i)

        browser.urlChanged.connect(lambda qurl, browser=browser: self.renew_urlbar(qurl, browser))

    # 双击标签栏打开新页面
    def tab_open_doubleclick(self, i):
        if i == -1:
            self.add_new_tab()

    def current_tab_changed(self, i):
        qurl = self.tabs.currentWidget().url()
        self.renew_urlbar(qurl, self.tabs.currentWidget())
...
```

只要在导航栏中双击就可以打开新的标签页面，并且地址栏的中的地址也会跟着页面的不同而发生变化，也就是页面间的地址是互不干扰的。

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/29d7c8a89a878cdea22749d0f03d12ff-0)

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/d52ae11d8742e0370e8958318fd1c384-0)

但是现在标签栏还有个非常突出的问题，就是没有关闭按钮！接下来我们将来添加关闭功能。

```python
...
class MainWindow(QMainWindow):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 设置窗口标题
        self.setWindowTitle('My Browser')
        # 设置窗口图标
        self.setWindowIcon(QIcon('icons/penguin.png'))
        self.show()

        # 添加标签栏
        self.tabs = QTabWidget()
        self.tabs.setDocumentMode(True)
        self.tabs.tabBarDoubleClicked.connect(self.tab_open_doubleclick)
        self.tabs.currentChanged.connect(self.current_tab_changed)
        # 允许关闭标签
        self.tabs.setTabsClosable(True)
        # 设置关闭按钮的槽
        self.tabs.tabCloseRequested.connect(self.close_current_tab)

        self.add_new_tab(QUrl('https://www.lanqiao.cn'), 'Homepage')

        self.setCentralWidget(self.tabs)

        ...

    # 添加新的标签页
    def add_new_tab(self, qurl=QUrl(''), label='Blank'):
        # 为标签创建新网页
        browser = QWebView()
        browser.setUrl(qurl)

        # 为标签页添加索引方便管理
        i = self.tabs.addTab(browser, label)
        self.tabs.setCurrentIndex(i)

        browser.urlChanged.connect(lambda qurl, browser=browser: self.renew_urlbar(qurl, browser))

        # 加载完成之后将标签标题修改为网页相关的标题
        browser.loadFinished.connect(lambda _, i=i, browser=browser:
            self.tabs.setTabText(i, browser.page().mainFrame().title()))
    ...
    def close_current_tab(self, i):
        # 如果当前标签页只剩下一个则不关闭
        if self.tabs.count() < 2:
            return
        self.tabs.removeTab(i)
...
```

这里我们不仅给标签页添加了关闭按钮，还将标签标题自动设置为网页所提供的标题。

![图片描述](https://doc.shiyanlou.com/courses/705/1347963/cb6a1eaf7e87aadb3ad679c1ea4cbce8-0)

到此我们的简易浏览器算是完成了。

完整的项目源码与图片资源下载：

```bash
$ wget https://labfile.oss.aliyuncs.com/courses/705/shiyanlou_cs705.zip
```

## 三、实验总结

通过本次课程的我们快速学习了 PyQt 的各个组件，并使用 PyQt 快速构建了一个浏览器，但是这些作为 PyQt 的入门还是远远不够的，这门课仅仅能做抛砖引玉之用。

## 四、课后习题

1. 为浏览器导航栏添加 HOME 按钮，通过该按钮可以快速访问用户主页。

## 五、扩展阅读

- [Qt 官方文档](http://doc.qt.io/)
- http://blog.sina.com.cn/s/articlelist_2801495241_0_1.html

