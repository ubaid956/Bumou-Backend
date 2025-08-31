export const englishPrivacy = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }

      h1,
      h2,
      h3 {
        color: #333;
      }

      p {
        line-height: 1.6;
        color: #666;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
      #languageDropdown {
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <label for="languageDropdown">Language：</label>
    <select id="languageDropdown" onchange="changeLanguage(this.value)">
      <option value="en" selected>🇬🇧 English</option>
      <option value="zh">🇨🇳 中文</option>
    </select>
    <h1>Privacy Policy for Bumou (咘呣) App</h1>
    <p>Last updated: December, 4 2024</p>
    <p>Effective date: April, 1 2024</p>

    <p>
    Thank you for using Bumou App. This policy explains how we collect, use, store, and protect your personal information, as well as your rights regarding data privacy.
    </p>

    <h2>Developer and company information</h2>
    <p>
      Application name:Bumou <br>
      Name: Yang Jing <br>
      Company: Shanghai Xuxiu Information Technology Co., Ltd <br>
      Email: yang_jing_1186@hotmail.com <br>
      Phone: 18201840625 <br>
      Address: Room 147, Building 37, No. 4399 Wusi Road, Haiwan Town, Fengxian District, Shanghai <br>
      Postal Code: 221100
    </p>

    <h2>1. Collection and use of information</h2>
    <p>
      We may collect the following types of information (Sensor List): <br>
      1.1 Identity data: full name, email address, username, date of birth, etc. <br>
      1.2 Contact information: mobile phone, communication, SMS, etc. <br>
      1.3 Content data: Images, videos, and audio content uploaded by users, software installation lists, etc. <br>
      1.4 Equipment Data: IMEI、 Device MAC identifier, IP address, Android ID, etc. <br>
      1.5 Usage data: App chat interaction records and emotion tracking data, etc.
    </p>

    <h2>2. Purpose of Data Processing</h2>
    <p>
      We use the collected data for the following purposes: <br>
      2.1 To create and manage user accounts. <br>
      2.2 To facilitate social connections and communication. <br>
      2.3 To provide mood tracking features. <br>
      2.4 To operate emergency assistance features. <br>
      2.5 To improve app functionality and user experience. <br>
      2.6 After obtaining your authorization and consent, we will, <br>
      Collect sensor data from your device (such as accelerometer, gyroscope, directional sensor, etc.), <br>
      Used to provide motion detection functionality and enhance user experience. <br>
      We only collect data directly related to the service and will not use it for any other non explicit purposes.
    </p>

    <h2>3. Data Sharing and Disclosure</h2>
    <p>3.1 We do not sell personal information or use it for advertising purposes. <br>
        3.2 Data may be disclosed under the following circumstances: <br>

        To comply with Chinese laws or government regulations. <br>
        When necessary to protect user or public safety.
    </p>



    <h2>4. Data Storage and Transfer</h2>
    <p>4.1 All data is stored in secure AWS China data centers. <br>
       4.2 No cross-border data transfers are conducted, adhering to China's data sovereignty laws.
    </p>

    <h2>5. Integrated Third-Party SDK Information</h2>
    <p>
        To provide stable push notifications and other features, our app integrates the following third-party SDKs: <br>
        Aliyun Push <br>
        Provider: Alibaba Cloud Computing Co., Ltd. <br>
        Data Collected: Device identifiers (e.g., IMEI, MAC address), location data (if applicable). <br>
        Purpose: To deliver real-time push notifications and ensure timely delivery of messages. <br>
        OPPO Push (OPush) <br>
        Provider: Guangdong OPPO Mobile Telecommunications Co., Ltd. <br>
        Data Collected: Device identifiers (e.g., IMEI). <br>
        Purpose: To ensure push notifications are delivered to OPPO device users. <br>
        Mi Push <br>
        Provider: Xiaomi Technology Co., Ltd. <br>
        Data Collected: Device identifiers (e.g., IMEI). <br>
        Purpose: To provide push notification services for Xiaomi device users, ensuring efficient message delivery.

    </p>
    <h2>6. User Rights</h2>
    <p>
      Users have the following rights regarding their personal data: <br>
      6.1 Access a copy of their data. <br>
      6.2 Modify, update, or correct their information. <br>
      6.3 Request deletion of their account and associated data. <br>
    </p>
    <h2>7. Data Security Measures</h2>
    <p>We implement industry-standard encryption and access control measures to protect your information. However, no system is completely secure from cyber threats.
    </p>

    <h2>8. Data Use for Specific Features</h2>
    <p>8.1 Auto-start: To enable push notifications while running in the background, the app may initiate services via system broadcasts. <br>
        8.2 Push Notifications: Notifications related to chat messages or help requests are sent only with user consent.
    </p>


    <h2>9. Children’s Privacy</h2>
    <p>
      9.1 We are committed to protecting children’s privacy: <br>
      Age verification is required during registration. <br>
      Users under 14 years old must obtain parental consent. <br>
    </p>


    <h2>10. Policy Updates</h2>
    <p>We may modify this policy at any time, with users notified in advance via in-app alerts. Significant changes require renewed user consent.
    </p>

    <h2>11. Contact Us</h2>
    <p>For inquiries or complaints about this privacy policy, contact us at: <br>
       Email: 273219010@qq.com <br>
       Phone: +8618201840625 <br>
    </p>


    <script>
      function changeLanguage(selectedLanguage) {
        // Define the language-specific URLs
        const languageUrls = {
          en: window.location.href.split('?')[0] + '?lang=en',
          zh: window.location.href.split('?')[0] + '?lang=zh',
        };

        window.location.href = languageUrls[selectedLanguage];
      }
    </script>
  </body>
</html>`;

export const chinesePrivacy = `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>隐私政策</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }

            h1, h2, h3 {
                color: #333;
            }

            p {
                line-height: 1.6;
                color: #666;
            }

            a {
                color: #007bff;
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }
            #languageDropdown {
                margin-bottom: 10px;
            }
            </style>
        </head>
        <body>
        <label for="languageDropdown">选择语言：</label>
        <select id="languageDropdown" onchange="changeLanguage(this.value)">
            <option value="en">🇬🇧 English</option>
            <option value="zh" selected>🇨🇳 中文</option>
        </select>
        <h1>咘呣App隐私政策</h1>

        <p>生效日期：2024年4月1日 - 最后更新日期：2024年12月4日</p>

<p>
  感谢您使用咘呣App。本隐私政策描述了我们如何收集、使用、存储和保护用户的个人信息，以及用户在数据隐私方面的权利。
</p>

<h2>开发者及公司信息</h2>
    <p>
      应用名称：咘呣 <br>
      姓名：杨晶 <br>
      公司：上海旭修信息技术有限公司 <br>
      邮箱：yang_jing_1186@hotmail.com <br>
      电话：18201840625 <br>
      地址：上海市奉贤区海湾镇五四公路4399号37幢147室 <br>
      邮编：221100
    </p>

<h2>1. 信息的收集与使用</h2>
<p>
  我们可能会收集以下信息类型 (传感器列表)：<br>
  1.1 身份数据：全名、电子邮件地址、用户名、出生日期等。<br>
  1.2 联系方式：手机、通讯、短信等。<br>
  1.3 内容数据：用户上传的图片、视频和音频内容，软件安装列表等。<br>
  1.4 设备数据：IMEI、设备MAC标识符、安卓ID、IP地址等。<br>
  1.5 使用数据：App聊天互动记录和情绪跟踪数据等。

</p>

<h2>2. 信息的处理目的</h2>
<p>我们收集的个人信息将用于以下目的：<br>
2.1 创建和管理用户账户。<br>
2.2 促进社交联系与沟通。<br>
2.3 提供情绪跟踪功能。<br>
2.4 运营紧急求助服务，确保用户安全。<br>
2.5 改善应用功能及优化用户体验。<br>
2.6 我们会在获得您授权同意后，<br>
收集您的设备传感器数据（如加速度传感器、陀螺仪、方向传感器等），<br>
用于提供运动检测功能和提升用户体验等。<br>
我们仅收集与服务直接相关的数据，不会用于其他非明示用途。
</p>


<h2>3. 数据分享和披露</h2>
<p>3.1 我们不会将您的个人信息出售或用于广告营销。<br>
3.2 在以下情况中，数据可能被披露：<br>
遵守中国法律法规或政府要求。<br>
在用户或公共安全需要保护的情况下。
</p>


<h2>4. 数据存储和转移</h2>
<p>4.1 所有数据存储于AWS中国的安全数据中心。<br>
4.2 数据不会进行跨境传输，符合中华人民共和国的数据主权法规。
</p>


<h2>5. 集成的第三方SDK说明</h2>
<p>
  为了向用户提供稳定的推送服务及其他功能，我们的应用集成了以下第三方SDK：<br>

  阿里云推送（Aliyun Push）<br>
  提供方：阿里云计算有限公司 <br>
  收集的信息：设备标识符（如IMEI、MAC地址）、地理位置信息（如适用）。<br>
  使用目的：用于提供实时推送通知服务，确保消息及时送达。<br>
  OPPO推送（OPush）<br>
  提供方：广东欧珀移动通信有限公司 <br>
  收集的信息：设备标识符（如IMEI）。<br>
  使用目的：确保OPPO设备用户能接收到推送通知服务。<br>
  小米推送（Mi Push）<br>
  提供方：小米科技有限责任公司 <br>
  收集的信息：设备标识符（如IMEI）。<br>
  使用目的：向小米设备用户提供推送通知服务，提升消息传递效率。
</p>

<h2>6. 用户权利</h2>
<p>
  用户对其个人信息拥有以下权利：<br>
  6.1 访问其个人数据副本。<br>
  6.2 修改、更新或更正个人信息。<br>
  6.3 请求删除账户及相关数据。

</p>

<h2>7. 数据安全措施</h2>
<p>我们采用行业标准的技术措施，包括加密存储和访问控制，以保护您的信息。尽管如此，网络安全仍存在一定风险。</p>

<h2>8. 特定功能的数据使用</h2>
<p>8.1 自动启动：为了在后台运行时提供推送通知，应用可能通过系统广播唤醒相关服务。<br>
  8.2 推送通知：在获得用户同意后，发送与聊天消息或帮助请求相关的推送通知。</p>

<h2>9. 儿童隐私保护</h2>
<p>
  9.1 我们采取措施保护未成年人的隐私：<br>

  注册时要求验证年龄。<br>
  14岁以下用户需征得监护人同意后方可使用。<br>
</p>

<h2>10. 政策更新</h2>
<p>我们可能随时修改本政策，并通过App内通知方式提前告知用户。任何重大变更将需要用户重新确认同意。
</p>

<h2>11. 联系我们</h2>
<p>如有关于隐私政策的疑问或投诉，请通过以下方式联系我们：<br>
    邮箱：273219010@qq.com <br>
    电话：+8618201840625
</p>



    <script>
        function changeLanguage(selectedLanguage) {
            // Define the language-specific URLs
            const languageUrls = {
                'en': window.location.href.split('?')[0]+ '?lang=en', 
                'zh': window.location.href.split('?')[0]+ '?lang=zh'};

            // Redirect to the selected language URL
            window.location.href = languageUrls[selectedLanguage];
        }
    </script>

</body>
</html>

`;
