const {
  createApp
} = Vue

// 提取通用函数处理输入文本
function processInputText(vueInstance, inputText, processLine) {
  let inputArr = inputText.split('\n');
  let outputArr = [];
  for (let i = 0; i < inputArr.length; i++) {
    let line = inputArr[i];
    if (line.trim() === "") {
      continue;
    }
    let processedLine = processLine(vueInstance, line, i, inputArr);
    outputArr.push(processedLine);
  }
  return outputArr.join("\n");
}
//sql转delphi字符串处理
function sql_to_delphi_line_deal(vueInstance, line, i, inputArr) {
  let processedLine = line.replace(/'/gi, "''");
  if (vueInstance.add_space === true) {
    processedLine = ' ' + processedLine + ' ';
  }
  processedLine = "'" + processedLine + "'";
  if (i !== inputArr.length - 1) {
    if (vueInstance.sql2delphi_set === false) {
      processedLine += "+";
    } else if (vueInstance.sql2delphi_set === true) {
      processedLine += "+#13#10+";
    }
  } else {
    processedLine += ";";
  }
  return processedLine;
}

function delphi_to_sql_line_deal_core(src_text) {
  // 定义状态常量，提高代码可读性
  const STATE_START = 0;
  const STATE_IN_STRING = 1;
  const STATE_OUT_STRING = 2;

  let resultArray = [];
  let state = STATE_START;
  let i = 0;

  while (i < src_text.length) {
    const char = src_text[i];

    if (char === "'") {
      if (state === STATE_START || state === STATE_OUT_STRING) {
        state = STATE_IN_STRING;
      } else if (state === STATE_IN_STRING) {
        let consecutiveQuotes = 0;
        // 统计连续的单引号
        while (i < src_text.length && src_text[i] === "'") {
          consecutiveQuotes++;
          i++;
        }

        // 处理连续单引号，将偶数个单引号替换为一个单引号
        const escapedQuotes = Math.floor(consecutiveQuotes / 2);
        for (let j = 0; j < escapedQuotes; j++) {
          resultArray.push("'");
        }

        if (consecutiveQuotes % 2 === 0) {
          // 偶数个单引号，进入字符串
          state = STATE_IN_STRING;
        } else {
          // 奇数个单引号，退出字符串
          state = STATE_OUT_STRING;
        }
        i--; // 回退索引，因为外层循环会再增加 i
      }
    } else if (state === STATE_IN_STRING) {
      // 字符串内的字符直接添加到结果数组
      resultArray.push(char);
    }

    i++;
  }

  return resultArray.join('');
}

//delphi转sql字符串处理
function delphi_to_sql_line_deal(vueInstance, line, i, inputArr) {
  let processedLine = delphi_to_sql_line_deal_core(line);
  return processedLine;
}
//SQL转C字符串处理
function sql_to_c_line_deal(vueInstance, line, i, inputArr) {
  //文本处理开始
  //1.左右加空格
  //2.双引号"包裹
  let processedLine = line;
  if (vueInstance.add_space === true) {
    processedLine = ' ' + processedLine + ' ';
  }
  processedLine = "\"" + processedLine + "\"";
  return processedLine;
}
//C转SQL字符串处理
function c_to_sql_line_deal(vueInstance, line, i, inputArr) {
  //文本处理开始
  //找到第一个"和最后一个"，截取中间的字符串
  let processedLine = line;
  let firstindex = processedLine.indexOf('"');
  let lastindex = processedLine.lastIndexOf('"');
  processedLine = processedLine.substring(firstindex + 1, lastindex);
  return processedLine;
}
//SQL转JAVA字符串处理
function sql_to_java_line_deal(vueInstance, line, i, inputArr) {
  let processedLine = line;
  if (vueInstance.add_space === true) {
    processedLine = ' ' + processedLine + ' ';
  }
  processedLine = 'Object.append("' + processedLine + '");'
  return processedLine;
}

function java_to_sql_line_deal(vueInstance, line, i, inputArr) {
  //文本处理开始
  //找到第一个"和最后一个"，截取中间的字符串
  let processedLine = line;
  let firstindex = processedLine.indexOf('"');
  let lastindex = processedLine.lastIndexOf('"');
  processedLine = processedLine.substring(firstindex + 1, lastindex);
  return processedLine;
}

function trimText(vueInstance, inputText) {
  let inputArr = inputText.split('\n'); //输入文本按换行切成数组
  let outputArr = [];
  let min_blank = 999;
  //找到最小空格数量
  for (let i = 0; i < inputArr.length; i++) {
    let line = inputArr[i];
    if (line.trim() === "") {
      continue;
    }
    let j = 0;
    for (j = 0; j < line.length; j++) {
      if (line[j] != ' ') {
        break;
      }
    }
    //j代表左边空格数量,取最小值
    if (j < min_blank) {
      min_blank = j;
    }
  }
  //找到最小空格数量后，处理每一行
  for (let i = 0; i < inputArr.length; i++) {
    let line = inputArr[i];
    if (line.trim() === "") {
      continue;
    }
    //左边保留一定空格，右边去除所有空格
    let processedLine = line.slice(min_blank).trimEnd();
    outputArr.push(processedLine);
  }
  return outputArr.join("\n");
}

function str_to_template_line_deal(vueInstance, line, i, inputArr) {
  //文本处理开始
  //把 #text# 替换成输入文本
  let template_str = vueInstance.string_template;
  replace_line = template_str.replace(/#text#/gi, line);
  return replace_line;
}

function two_single_quotes_line_deal(vueInstance, line, i, inputArr) {
  //一个单引号替换成两个单引号
  let processedLine = line;
  processedLine = processedLine.replace(/'/gi, "''");
  return processedLine;
}

function one_single_quotes_line_deal(vueInstance, line, i, inputArr) {
  //两个单引号替换成一个单引号
  let processedLine = line;
  processedLine = processedLine.replace(/''/gi, "'");
  return processedLine;
}

//函数功能：分词
function SplitWord(text) {
  text = text.replace(/\n/gi, " "); //把换行替换成空格
  let wordlist = [];
  let start = 0;
  let end = 0;
  let stack = [];
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i);
    if (char === '(') {
      stack.push("(");
    }
    if (char === ')') {
      stack.pop();
    }
    //括号里的,跳过，括号外的,是分词标志
    if (stack.length == 0 && char == ",") {
      wordlist.push(text.substring(start, end));
      start = end + 1;
    }
    end += 1;
    if (i == text.length - 1 && start != end) {
      if (char == ",")
        wordlist.push(text.substring(start, text.length - 1));
      else
        wordlist.push(text.substring(start, text.length));
    }
  }
  result = [];
  for (let i = 0; i < wordlist.length; i++) {
    if (wordlist[i].trim() == "") {
      continue;
    }
    result.push(wordlist[i].trim());
  }
  return result;
}

//函数：对齐文本
//传参：待处理文本，每行个数，每个word的最大对齐长度
function alignWord(text, rownum, maxwordlen) {
  let result = "";
  let allwordlist = [];
  let sep = ",";
  allwordlist = SplitWord(text); //分词
  let allnum = allwordlist.length; //总分词的数量
  let wordlenlist = []; //每列宽度记录的数组
  //初始化每列宽度
  for (let i = 0; i < rownum; i++) {
    wordlenlist.push(0);
  }
  for (let i = 0; i < allnum; i++) {
    let j = i % rownum;
    //统计每列的最大字段宽度
    if (allwordlist[i].length > wordlenlist[j]) {
      wordlenlist[j] = allwordlist[i].length;
    }
  }
  //填充字段长度，就是所谓的对齐
  let finallist = [];
  for (let i = 0; i < allnum; i++) {
    let j = i % rownum;
    let tmp = allwordlist[i] + sep + " ";
    let wordlen = wordlenlist[j] + sep.length + 1;
    if (wordlen > maxwordlen) {
      wordlen = maxwordlen;
    }
    //优化：最后一列不需要填充空格。最后一个word不需要填充空格。
    if ((j != rownum - 1) && (i != allnum - 1))
      tmp = tmp.padEnd(wordlen, " ");
    finallist.push(tmp);
  }
  //拼接返回
  for (let i = 0; i < finallist.length; i++) {
    result += finallist[i];
    if (i % rownum == (rownum - 1)) {
      result += "\n";
    }
  }
  return result;
}

function align_word_deal(vueInstance, inputText) {
  return alignWord(inputText, vueInstance.align_word_num, vueInstance.align_word_len);
}

function textToCopy(vueInstance, inputText) {
  navigator.clipboard.writeText(inputText)
    .then(() => {
      alert("复制成功");
    })
    .catch((err) => {
      console.error('复制失败: ', err);
      alert("复制失败，请重试");
    });
}

// 新增生成分片SQL的核心函数
function generateShardingSQL(dbNum, tableNum, fields, shardDBName, shardTableName, condition) {
  const dbName = `${shardDBName}${dbNum}`;
  const tableName = `${shardTableName}${tableNum}`;
  const fieldList = `${fields}`;

  if (condition.trim() === "") {
    condition = "1=1";
  }

  return `SELECT ${dbNum} 分库号, ${tableNum} 分表号${fieldList ? `, ${fieldList}` : ''}, t.* ` +
    `FROM ${dbName}.${tableName} t ` +
    `WHERE ${condition}`;
}

createApp({
  data() {
    return {
      //黑暗模式
      darkMode: false,
      //输入框数据
      input_textarea: '',
      //输出框数据
      output_textarea: '',
      //自定义模版字符串
      string_template: '"#text#"',
      //delphi设置选项
      sql2delphi_set: false,
      //其他设置选项
      other_select: 0,
      //左右加空格
      add_space: false,
      //文本对齐设置
      align_word_num: 5,
      align_word_len: 50,
      // 新增设置加载状态
      isSettingsLoaded: false,
      show_input_textarea: true,
      show_output_textarea: true,
      // 新增菜单状态,控制菜单显示
      menu: {
        general: true,
        delphi: true,
        c: true,
        java: true,
        template: true,
        other: true,
        sharding_database: true,
      },
      // 菜单的配置项
      menuItems: [
        { label: '通用设置', name: 'general', model: 'general' },
        { label: 'Delphi', name: 'delphi', model: 'delphi' },
        { label: 'C', name: 'c', model: 'c' },
        { label: 'JAVA', name: 'java', model: 'java' },
        { label: '模板处理', name: 'template', model: 'template' },
        { label: '其他功能', name: 'other', model: 'other' },
        { label: '分库分表查询', name: 'sharding_database', model: 'sharding_database' },
      ],
      // 新增设置默认展开状态    
      detailStates: {
        general: true,    // 通用设置默认展开
        delphi: true,     // Delphi设置默认展开
        c: true,          // C设置默认展开
        java: false,      // Java设置默认收起
        template: false,  // 模板处理默认收起
        other: false,      // 其他功能默认收起
        sharding_database: false, // 分库分表默认收起
      },
      sharding_database: {
        database_num: 2,
        table_num: 3,
        database_name: 'db',
        table_name: 'table',
        table_fields: 'c_fundcode,c_agencyno',
        table_condition: "c_fundcode = '025010' and agencyno = '002'",
      },
    }
  },
  created() {
    // 加载主题设置
    console.log(" localStorage.getItem('darkMode')", localStorage.getItem('darkMode'));
    this.darkMode = (localStorage.getItem('darkMode') === 'true') ?? this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
    console.log("data-theme", document.documentElement.getAttribute('data-theme'));
    // 加载本地存储的设置
    const savedSettings = localStorage.getItem('sqlToolSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.add_space = settings.add_space ?? this.add_space;
      this.sql2delphi_set = settings.sql2delphi_set ?? this.sql2delphi_set;
      this.other_select = settings.other_select ?? this.other_select;
      this.align_word_num = settings.align_word_num ?? this.align_word_num;
      this.align_word_len = settings.align_word_len ?? this.align_word_len;
      this.string_template = settings.string_template ?? this.string_template;
      this.show_input_textarea = settings.show_input_textarea ?? this.show_input_textarea;
      this.show_output_textarea = settings.show_output_textarea ?? this.show_output_textarea;
      // 加载details状态
      this.detailStates = {
        ...this.detailStates, // 保留默认值
        ...settings.detailStates // 覆盖已保存的状态
      };
      // 加载分库分表设置
      this.sharding_database = {
        ...this.sharding_database, // 保留默认值
        ...settings.sharding_database // 覆盖已保存的设置
      };
      // 加载菜单设置
      this.menu = {
        ...this.menu, // 保留默认值
        ...settings.menu // 覆盖已保存的设置
      }
    }
    // 设置加载完成
    this.isSettingsLoaded = true;
  },
  watch: {
    darkMode(newVal) {
      if (this.isSettingsLoaded) {
        document.documentElement.setAttribute('data-theme', newVal ? 'dark' : 'light');
        localStorage.setItem('darkMode', newVal);
      }
    },
    // 监听设置变化并保存
    // 合并后的watch监听（替换原有多个watch）
    ...['add_space', 'sql2delphi_set', 'other_select', 'align_word_num', 'align_word_len', 'string_template', 'show_input_textarea', 'show_output_textarea']
      .reduce((acc, key) => ({
        ...acc,
        [key](newVal) {
          if (this.isSettingsLoaded) {
            this.saveSettings();
          }
        }
      }), {}),
    // 保持detailStates的深层监听不变
    detailStates: {
      handler(newVal) {
        if (this.isSettingsLoaded) {
          this.saveSettings();
        }
      },
      deep: true
    },
    // 保持sharding_database的深层监听不变
    sharding_database: {
      handler(newVal) {
        if (this.isSettingsLoaded) {
          this.saveSettings();
        }
      },
      deep: true
    },
    // 保持menu的深层监听不变
    menu: {
      handler(newVal) {
        if (this.isSettingsLoaded) {
          this.saveSettings();
        }
      },
      deep: true
    }
  },
  methods: {
    // 新增保存设置方法
    saveSettings() {
      // 使用展开运算符保持代码简洁
      const settings = {
        ...this.$data, // 自动包含所有data属性
        // 排除不需要保存的字段
        input_textarea: undefined,
        output_textarea: undefined,
        // 显式保留需要保存的字段
        detailStates: this.detailStates,
        sharding_database: this.sharding_database,
        menu: this.menu,
      };
      // 过滤掉undefined的值
      localStorage.setItem('sqlToolSettings', JSON.stringify(settings));
    },
    //清空输入
    CLEARTEXT() {
      this.input_textarea = '';
      this.output_textarea = '';
    },
    //SQL转Delphi字符串
    SQL2DELPHI() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, sql_to_delphi_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //Delphi转SQL
    DELPHI2SQL() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, delphi_to_sql_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //SQL转C
    SQL2C() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, sql_to_c_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //C转SQL
    C2SQL() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, c_to_sql_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //SQL转JAVA
    SQL2JAVA() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, sql_to_java_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //JAVA转SQL
    JAVA2SQL() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, java_to_sql_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    TRIMTEXT() {
      //找到最小的空格数，然后左边保留一定空格，右边去除所有空格
      //1.找到最小的空格数
      //2.左边保留一定空格，右边去除所有空格 
      //3.展示到输出文本框上
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = trimText(vueInstance, input_text);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    STR2TEMPLATE() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, str_to_template_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //文本对齐
    WordAlign() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = this.output_textarea; //输出框文本
      output_text = align_word_deal(vueInstance, input_text);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //'' 变 ''''
    TWO_SINGLE_QUOTES() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, two_single_quotes_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    //''xx'' 变 'xx'
    ONE_SINGLE_QUOTES() {
      let vueInstance = this;
      let input_text = this.input_textarea; //输入框文本
      let output_text = processInputText(vueInstance, input_text, one_single_quotes_line_deal);
      this.output_textarea = output_text; //展示到输出文本框上
    },
    OTHERDEAL() {
      //其他功能执行，根据other_select的值执行
      let other_select = this.other_select;
      if (other_select == 0) {
        // alert(0)
        this.TRIMTEXT();
      } else if (other_select == 1) {
        // alert(1)
        this.WordAlign();
      } else if (other_select == 2) {
        // alert(2)
        this.TWO_SINGLE_QUOTES();
      } else if (other_select == 3) {
        // alert(2)
        this.ONE_SINGLE_QUOTES();
      }
    },
    COPYOUT() {
      //复制输出框文本到剪贴板
      let vueInstance = this;
      let output_text = this.output_textarea; //输出框文本
      textToCopy(vueInstance, output_text);
    },
    SHARDINGQUERY() {
      // 生成分库分表查询SQL
      const sqlParts = [];
      const dbCount = Number(this.sharding_database.database_num) || 0;
      const tableCount = Number(this.sharding_database.table_num) || 0;

      for (let db = 1; db <= dbCount; db++) {
        for (let table = 1; table <= tableCount; table++) {
          sqlParts.push(
            generateShardingSQL(
              db,
              table,
              this.sharding_database.table_fields,
              this.sharding_database.database_name,
              this.sharding_database.table_name,
              this.sharding_database.table_condition
            )
          );
        }
      }

      const sqlTextMain = sqlParts.join('\nUNION ALL\n');
      this.output_textarea = `select * from (\n${sqlTextMain}\n) t`;
    },
  }
}).mount('#app')
